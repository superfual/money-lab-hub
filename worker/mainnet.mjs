import {armTurn} from '../dist/turn-clock.mjs';
import {advanceSoloClock} from '../dist/turn-timeout.mjs';
import {recordGateProof} from '../dist/engine.mjs';
import {Wallet,Interface,AbiCoder,keccak256,toUtf8Bytes,getAddress} from 'ethers';
import artifact from '../dist/content/mainnet-contract.json' with {type:'json'};
import {walletIdentity} from './identity.mjs';
import {MAINNET,RESULT_TYPES,resultDomain,LEVEL_IDS} from '../dist/mainnet-shared.mjs';
import {createGame,prepareMove,chooseMove,manage,resolve,score} from '../dist/engine.mjs';
import {LEVELS} from '../dist/levels.mjs';
import {evaluateGate} from '../dist/tapeout.mjs';
const iface=new Interface(artifact.abi),zero='0x'+'0'.repeat(64);
const fail=(code,status=400)=>{throw Object.assign(Error(code),{status});};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const random=max=>{const n=new Uint32Array(1),limit=Math.floor(4294967296/max)*max;do{crypto.getRandomValues(n);}while(n[0]>=limit);return n[0]%max;};
export async function chainRpc(method,params=[]){const r=await fetch(MAINNET.rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(12000)});const d=await r.json();if(!r.ok||d.error||d.result===undefined)fail('MAINNET_RPC_UNAVAILABLE',503);return d.result;}
export async function readChain(address,player,rpc=chainRpc){
 if(Number(await rpc('eth_chainId'))!==196)fail('WRONG_CHAIN',503);
 const latest=Number(BigInt(await rpc('eth_blockNumber'))),block='0x'+Math.max(0,latest-1).toString(16);
 if(keccak256(await rpc('eth_getCode',[address,block]))!==artifact.runtimeHash)fail('UNRECOGNIZED_CONTRACT',503);
 const call=async(name,args=[])=>iface.decodeFunctionResult(name,await rpc('eth_call',[{to:address,data:iface.encodeFunctionData(name,args)},block]));
 const [registered,balance,unlocked,active,attestor]=await Promise.all([call('registered',[player]),call('balanceOf',[player]),call('unlocked',[player]),call('active',[player]),call('attestor')]);
 return {registered:registered[0],balance:Number(balance[0]),unlocked:Number(unlocked[0]),active:active[0]===zero?null:{runId:active[0],level:Number(active[1]),bond:Number(active[2])},attestor:attestor[0],block:latest-1};
}
export async function verifyDeployment(txHash,signer,rpc=chainRpc){
 if(!/^0x[a-fA-F0-9]{64}$/.test(txHash))fail('INVALID_TRANSACTION');
 if(Number(await rpc('eth_chainId'))!==196)fail('WRONG_CHAIN',503);
 const [receipt,tx,latest]=await Promise.all([rpc('eth_getTransactionReceipt',[txHash]),rpc('eth_getTransactionByHash',[txHash]),rpc('eth_blockNumber')]);
 if(!receipt||!tx||Number(receipt.status)!==1||!receipt.contractAddress)fail('DEPLOYMENT_NOT_CONFIRMED',409);
 if(BigInt(latest)-BigInt(receipt.blockNumber)<1n)fail('WAIT_TWO_CONFIRMATIONS',409);
 const expected=artifact.bytecode+AbiCoder.defaultAbiCoder().encode(['address'],[signer]).slice(2);
 if(tx.to!==null||tx.from.toLowerCase()!==MAINNET.owner||tx.input.toLowerCase()!==expected.toLowerCase()||BigInt(tx.value)!==0n)fail('UNRECOGNIZED_DEPLOYMENT');
 const code=await rpc('eth_getCode',[receipt.contractAddress,'latest']);if(keccak256(code)!==artifact.runtimeHash)fail('UNRECOGNIZED_CONTRACT');
 return {address:getAddress(receipt.contractAddress),block:Number(BigInt(receipt.blockNumber))};
}
export {stageResult as finishResult} from '../dist/result-model.mjs';
import {stageResult as finishResult} from '../dist/result-model.mjs';
export async function handleMainnet(request,env,services={}){try{
 if(!env.DB)fail('STORAGE_UNAVAILABLE',503);const db=env.DB,url=new URL(request.url),path=url.pathname.replace('/api/mainnet/','');
 const signer=env.MONEYLAB_MAINNET_ATTESTOR_KEY?new Wallet(env.MONEYLAB_MAINNET_ATTESTOR_KEY):null;
 const config=await db.prepare('SELECT address,deployment_tx,deployment_block,attestor FROM moneylab_mainnet_config WHERE id=1').first();
 if(request.method==='GET'&&path==='config')return json({network:MAINNET,contract:config,attestor:signer?.address||null,ready:!!(signer&&config&&signer.address===config.attestor),serverAttested:true});
 if(!['GET','POST'].includes(request.method))fail('NOT_FOUND',404);
 if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)fail('WRONG_ORIGIN',403);
 const account=await walletIdentity(request,db);if(!account)fail('WALLET_LOGIN_REQUIRED',401);
 let body={};if(request.method==='POST'){const raw=await request.text();if(raw.length>2000)fail('REQUEST_TOO_LARGE',413);body=JSON.parse(raw||'{}');}
 if(path==='activate'&&request.method==='POST'){
  if(account.address.toLowerCase()!==MAINNET.owner)fail('OWNER_REQUIRED',403);if(!signer)fail('ATTESTOR_UNAVAILABLE',503);
  const d=await verifyDeployment(body.transactionHash,signer.address,services.rpc);
  if(config&&config.address!==d.address)fail('CONTRACT_ALREADY_PINNED',409);
  await db.prepare('INSERT OR IGNORE INTO moneylab_mainnet_config (id,address,deployment_tx,deployment_block,attestor,created_at) VALUES (1,?,?,?,?,?)').bind(d.address,body.transactionHash,d.block,signer.address,Date.now()).run();return json({activated:true,address:d.address});
 }
 if(account.address.toLowerCase()!==MAINNET.owner)fail('PILOT_OWNER_ONLY',403);
 if(!config||!signer||config.attestor!==signer.address)fail('MAINNET_NOT_ACTIVATED',409);
 if(path==='evidence'&&request.method==='GET'){const id=url.searchParams.get('runId');if(!/^0x[a-fA-F0-9]{64}$/.test(id||''))fail('INVALID_RUN');const saved=await db.prepare('SELECT state FROM moneylab_mainnet_runs WHERE id=? AND account_id=? AND contract=?').bind(id,account.id,config.address).first();if(!saved)fail('NOT_FOUND',404);const game=JSON.parse(saved.state);if(game.phase!=='finished')fail('STAGE_NOT_FINISHED',409);return json({schema:'moneylab-mainnet-result.v1',chainId:196,contract:config.address,player:account.address,runId:id,serializedState:saved.state,resultHash:keccak256(toUtf8Bytes(saved.state)),expected:finishResult(game)});}
 if(path==='review'&&request.method==='GET'){const id=url.searchParams.get('runId');if(!/^0x[a-fA-F0-9]{64}$/.test(id||''))fail('INVALID_RUN');const saved=await db.prepare('SELECT state FROM moneylab_mainnet_runs WHERE id=? AND account_id=? AND contract=?').bind(id,account.id,config.address).first();if(!saved)fail('NOT_FOUND',404);const game=JSON.parse(saved.state);if(game.phase!=='finished')fail('STAGE_NOT_FINISHED',409);return json({game});}
 const chain=await (services.readChain||readChain)(config.address,account.address);
 if(chain.attestor!==signer.address)fail('ATTESTOR_MISMATCH',503);
 const row=chain.active?await db.prepare('SELECT state,revision,last_request FROM moneylab_mainnet_runs WHERE id=? AND account_id=? AND contract=?').bind(chain.active.runId,account.id,config.address).first():null;
 let view=row?{game:JSON.parse(row.state),revision:row.revision}:{game:null,revision:0};
 const now=services.now?.()??Date.now();let clockChanged=false;
 if(row&&view.game.phase!=='finished'&&['state','action','receipt'].includes(path)){const next=structuredClone(view.game),clock=advanceSoloClock(next,now);if(clock.changed){if(clock.expired){const receipt=await(services.gate||evaluateGate)(next.gate.IN0,next.gate.IN1);if(receipt.IN0!==next.gate.IN0||receipt.IN1!==next.gate.IN1||receipt.OUT0!==(receipt.IN0&&receipt.IN1?0:1))fail('CIRCUIT_READ_INVALID',503);recordGateProof(next,receipt);if(next.phase==='finished')next.labResult=finishResult(next);}const saved=JSON.stringify(next),changed=await db.prepare('UPDATE moneylab_mainnet_runs SET state=?,revision=revision+1 WHERE id=? AND account_id=? AND revision=?').bind(saved,next.runId,account.id,row.revision).run();if(!changed.meta.changes)fail('PROGRESS_CHANGED_REFRESH',409);row.state=saved;row.revision++;view={game:next,revision:row.revision};clockChanged=true;}}
 view.serverNow=Date.now();
 if(path==='state'&&request.method==='GET'){
  const recent=await db.prepare('SELECT id,state,created_at FROM moneylab_mainnet_runs WHERE account_id=? AND contract=? ORDER BY created_at DESC LIMIT 20').bind(account.id,config.address).all();
  return json({chain,...view,history:recent.results.map(x=>{const s=JSON.parse(x.state);return {runId:x.id,level:s.difficulty,month:s.month,result:s.labResult,createdAt:x.created_at};})});
 }
 if(request.method!=='POST')fail('NOT_FOUND',404);
 if(path==='erase'){
  if(body.confirm!=='ERASE'||chain.active)fail('FINISH_CHAIN_RUN_FIRST',409);
  await db.prepare('DELETE FROM moneylab_mainnet_runs WHERE account_id=?').bind(account.id).run();return json({erased:true,onchainUnchanged:true});
 }
 if(!chain.active)fail('NO_ACTIVE_CHAIN_RUN',409);
 if(path==='receipt'){
  if(!row||view.game.phase!=='finished')fail('STAGE_NOT_FINISHED',409);
  const game=view.game,result=finishResult(game);
  const value={player:account.address,runId:chain.active.runId,level:chain.active.level,score:result.points,survived:result.survived,resultHash:keccak256(toUtf8Bytes(row.state)),deadline:Math.floor(Date.now()/1000)+3600};
  return json({value,signature:await signer.signTypedData(resultDomain(config.address),RESULT_TYPES,value),result,contract:config.address});
 }
 if(typeof body.requestId!=='string'||!/^[\w-]{8,80}$/.test(body.requestId))fail('REQUEST_ID_REQUIRED');
 if(path==='start'){
  if(row)return json({chain,...view});
  const game=createGame(LEVEL_IDS[chain.active.level]);game.started=true;game.runId=chain.active.runId;game.labMode='challenge';armTurn(game,now);
  await db.prepare('INSERT OR IGNORE INTO moneylab_mainnet_runs (id,account_id,contract,state,last_request,created_at) VALUES (?,?,?,?,?,?)').bind(game.runId,account.id,config.address,JSON.stringify(game),body.requestId,Date.now()).run();
  const saved=await db.prepare('SELECT state,revision FROM moneylab_mainnet_runs WHERE id=? AND account_id=?').bind(game.runId,account.id).first();return json({chain,game:JSON.parse(saved.state),revision:saved.revision});
 }
 if(path!=='action')fail('NOT_FOUND',404);if(clockChanged||body.action==='timeout')return json({chain,...view});if(!row)fail('START_STAGE_FIRST',409);if(row.last_request===body.requestId)return json({chain,...view});if(body.revision!==row.revision)fail('PROGRESS_CHANGED_REFRESH',409);
 const next=structuredClone(view.game),action=String(body.action||'');if(next.phase==='finished')fail('STAGE_ALREADY_FINISHED',409);
 if(action==='roll'){if(!prepareMove(next,random(6)+1,random(5)+1,random(4294967296),now))fail('INVALID_ACTION');}
 else if(action.startsWith('route-')){if(!chooseMove(next,Number(action.slice(6))))fail('INVALID_ACTION');}
 else if(action.startsWith('manage-')){if(!manage(next,action.slice(7)))fail('INVALID_ACTION');}
 else {if(!resolve(next,action))fail('INVALID_ACTION');armTurn(next,now);}
 const receipt=await(services.gate||evaluateGate)(next.gate.IN0,next.gate.IN1);
 if(receipt.IN0!==next.gate.IN0||receipt.IN1!==next.gate.IN1||receipt.OUT0!==(receipt.IN0&&receipt.IN1?0:1))fail('CIRCUIT_READ_INVALID',503);
 next.gate={IN0:receipt.IN0,IN1:receipt.IN1,OUT0:receipt.OUT0};recordGateProof(next,receipt);if(next.phase==='finished')next.labResult=finishResult(next);
 const changed=await db.prepare('UPDATE moneylab_mainnet_runs SET state=?,revision=revision+1,last_request=? WHERE id=? AND account_id=? AND revision=?').bind(JSON.stringify(next),body.requestId,next.runId,account.id,row.revision).run();if(!changed.meta.changes)fail('PROGRESS_CHANGED_REFRESH',409);
 return json({serverNow:Date.now(),chain,game:next,revision:row.revision+1,receipt});
 }catch(e){services.onError?.(e);return json({error:e.status?e.message:'MAINNET_UNAVAILABLE'},e.status||503);}}
