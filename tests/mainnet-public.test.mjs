import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {DatabaseSync} from 'node:sqlite';import ganache from 'ganache';
import {BrowserProvider,JsonRpcSigner,ContractFactory,Wallet,Interface,AbiCoder,keccak256,toUtf8Bytes,verifyTypedData} from 'ethers';
import artifact from '../dist/content/mainnet-public-contract.json' with {type:'json'};import legacy from '../dist/content/mainnet-contract.json' with {type:'json'};
import {MAINNET,resultDomain,RESULT_TYPES} from '../dist/mainnet-shared.mjs';import {handleMainnet,verifyDeployment,readChain} from '../worker/mainnet.mjs';
import {validatePilotTransaction} from '../client/mainnet-wallet.mjs';import {sqliteD1} from '../scripts/sqlite-adapter.mjs';import {hash} from '../worker/identity.mjs';import {exampleGame} from '../dist/decision-lab.mjs';
const send=async tx=>(await(await tx).wait());
test('public mainnet EVM: independent wallets register once, settle their own run and cannot steal/replay results',async()=>{
 const raw=ganache.provider({chain:{chainId:196},logging:{quiet:true},wallet:{totalAccounts:3,unlockedAccounts:[MAINNET.owner]}}),provider=new BrowserProvider(raw);provider.pollingInterval=10;
 try{await raw.request({method:'evm_setAccountBalance',params:[MAINNET.owner,'0x3635c9adc5dea00000']});const owner=new JsonRpcSigner(provider,MAINNET.owner),alice=await provider.getSigner(0),bob=await provider.getSigner(1),attestor=Wallet.createRandom();
 await assert.rejects(new ContractFactory(artifact.abi,artifact.bytecode,alice).deploy(attestor.address));
 const c=await new ContractFactory(artifact.abi,artifact.bytecode,owner).deploy(attestor.address);await c.waitForDeployment();
 for(const player of [alice,bob]){await send(c.connect(player).register());assert.equal(await c.balanceOf(player.address),80n);await assert.rejects(c.connect(player).register.staticCall());await assert.rejects(c.connect(player).register.staticCall({value:1}));await assert.rejects(c.connect(player).startRun.staticCall(1));await send(c.connect(player).startRun(0));}
 const a=await c.active(alice.address),b=await c.active(bob.address);assert.notEqual(a.runId,b.runId);
 const value={player:alice.address,runId:a.runId,level:0,score:80,survived:true,resultHash:keccak256(toUtf8Bytes('alice public stage')),deadline:Math.floor(Date.now()/1000)+3600},sig=await attestor.signTypedData(resultDomain(await c.getAddress()),RESULT_TYPES,value);
 await assert.rejects(c.connect(bob).settle.staticCall(value,sig));await assert.rejects(c.connect(alice).settle.staticCall({...value,score:100},sig));await send(c.connect(alice).settle(value,sig));await assert.rejects(c.connect(alice).settle.staticCall(value,sig));
 assert.equal(await c.balanceOf(alice.address),100n);assert.equal(await c.balanceOf(bob.address),80n);assert.equal((await c.active(bob.address)).runId,b.runId);
 for(const name of ['transfer','approve','transferFrom','buy','withdraw'])assert.ok(!artifact.abi.some(x=>x.name===name));
 await raw.request({method:'evm_mine',params:[]});const chain=await readChain(await c.getAddress(),alice.address,(m,p)=>raw.request({method:m,params:p}),artifact);assert.equal(chain.registered,true);assert.equal(chain.balance,100);
 await assert.rejects(readChain(await c.getAddress(),alice.address,(m,p)=>raw.request({method:m,params:p}),legacy));
 }finally{await raw.disconnect();}
});
test('public API binds private journal and signed result to the logged-in player; founder ledger stays isolated',async()=>{
 const sql=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(x=>x.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+f,'utf8').replaceAll('--> statement-breakpoint',''));
 const signer=Wallet.createRandom(),alice=Wallet.createRandom().address,bob=Wallet.createRandom().address,contract=Wallet.createRandom().address,old=Wallet.createRandom().address,runId=keccak256(toUtf8Bytes('public-run')),cookie='a'.repeat(64),otherCookie='b'.repeat(64),env={DB:sqliteD1(sql),MONEYLAB_MAINNET_ATTESTOR_KEY:signer.privateKey};
 for(const [id,address,c] of [['alice',alice,cookie],['bob',bob,otherCookie]]){sql.prepare('INSERT INTO moneylab_wallet_accounts VALUES(?,?,0,?)').run(id,address,Date.now());sql.prepare('INSERT INTO moneylab_wallet_sessions VALUES(?,?,?)').run(await hash(c),id,Date.now()+3600000);}
 sql.prepare('INSERT INTO moneylab_mainnet_public_config VALUES(1,?,?,?,?,?)').run(contract,'0x'+'1'.repeat(64),1,signer.address,Date.now());sql.prepare('INSERT INTO moneylab_mainnet_config VALUES(1,?,?,?,?,?)').run(old,'0x'+'2'.repeat(64),1,signer.address,Date.now());
 const chain={registered:true,balance:80,unlocked:0,active:{runId,level:0,bond:0},attestor:signer.address,block:42},services={mode:'public',readChain:async()=>structuredClone(chain),gate:async(a,b)=>({IN0:a,IN1:b,OUT0:a&&b?0:1})};
 async function call(path,body,c=cookie,extra={}){const r=await handleMainnet(new Request('https://game.test/api/mainnet-public/'+path,{method:body?'POST':'GET',headers:{Cookie:'__Host-ml_session='+c,...(body?{Origin:'https://game.test'}:{})},...(body?{body:JSON.stringify({requestId:'public-req-123',...body})}:{})}),env,{...services,...extra});return{status:r.status,data:await r.json()};}
 const conf=(await call('config')).data;assert.equal(conf.registration,'public');assert.equal(conf.contract.address,contract);assert.equal((await call('state',null,'')).status,401);assert.equal((await call('activate',{transactionHash:'bad'})).data.error,'OWNER_REQUIRED');
 const started=await call('start',{level:'hard',balance:99999});assert.equal(started.status,200);assert.equal(started.data.game.difficulty,'easy');
 const g=exampleGame();g.runId=runId;sql.prepare('UPDATE moneylab_mainnet_runs SET state=? WHERE id=?').run(JSON.stringify(g),runId);
 assert.equal((await call('review?runId='+runId,null,otherCookie)).status,404);assert.equal((await call('evidence?runId='+runId,null,otherCookie)).status,404);
 const receipt=await call('receipt',{});assert.equal(receipt.status,200);assert.equal(receipt.data.value.player,alice);assert.equal(verifyTypedData(resultDomain(contract),RESULT_TYPES,receipt.data.value,receipt.data.signature),signer.address);
 const legacyRun=keccak256(toUtf8Bytes('legacy'));sql.prepare('INSERT INTO moneylab_mainnet_runs(id,account_id,contract,state,created_at) VALUES(?,?,?,?,?)').run(legacyRun,'alice',old,JSON.stringify(g),Date.now());chain.active=null;assert.equal((await call('erase',{confirm:'ERASE'})).status,200);assert.equal(sql.prepare('SELECT COUNT(*) n FROM moneylab_mainnet_runs WHERE contract=?').get(old).n,1);
 assert.equal((await call('state',null,cookie,{mode:undefined})).data.error,'PILOT_OWNER_ONLY');
});
test('public transaction review permits zero-value player actions but only owner deployment, exact artifact and matching player',()=>{
 const player=Wallet.createRandom().address,attestor=Wallet.createRandom().address,address=Wallet.createRandom().address,config={registration:'public',attestor,ready:true,contract:{address}},iface=new Interface(artifact.abi),base={to:address,value:0n,gasLimit:100000n,gasPrice:1000000000n};
 assert.equal(validatePilotTransaction({...base,data:iface.encodeFunctionData('register')},player,config,'register'),true);
 assert.throws(()=>validatePilotTransaction({...base,value:1n,data:iface.encodeFunctionData('register')},player,config,'register'));
 assert.throws(()=>validatePilotTransaction({...base,data:'0x'},player,{...config,ready:false,contract:null},'deploy'));
 const deploy={...base,to:undefined,data:artifact.bytecode+AbiCoder.defaultAbiCoder().encode(['address'],[attestor]).slice(2)};assert.equal(validatePilotTransaction(deploy,MAINNET.owner,{...config,ready:false,contract:null},'deploy'),true);
 assert.notEqual(artifact.runtimeHash,legacy.runtimeHash);
});
test('public activation pins exact public bytecode and public result verification rejects legacy runtime',async()=>{
 const attestor=Wallet.createRandom().address,address=Wallet.createRandom().address,txHash='0x'+'a'.repeat(64),tx={from:MAINNET.owner,to:null,value:'0x0',input:artifact.bytecode+AbiCoder.defaultAbiCoder().encode(['address'],[attestor]).slice(2)};
 const values={eth_chainId:'0xc4',eth_blockNumber:'0x65',eth_getTransactionReceipt:{status:'0x1',contractAddress:address,blockNumber:'0x64'},eth_getTransactionByHash:tx,eth_getCode:artifact.runtimeBytecode};const rpc=async name=>values[name];assert.equal((await verifyDeployment(txHash,attestor,rpc,artifact)).address,address);await assert.rejects(verifyDeployment(txHash,attestor,rpc,legacy));
 const {verifyResultEnvelope}=await import('../client/mainnet-result-evidence.mjs'),{stageResult}=await import('../dist/result-model.mjs');const game=exampleGame();game.runId='0x'+'b'.repeat(64);const state=JSON.stringify(game),result=stageResult(game),player=Wallet.createRandom().address,envelope={schema:'moneylab-mainnet-result.v1',chainId:196,contract:address,player,runId:game.runId,serializedState:state,resultHash:keccak256(toUtf8Bytes(state))};
 values.eth_call=new Interface(artifact.abi).encodeFunctionResult('results',[player,['easy','medium','hard'].indexOf(game.difficulty),result.points,result.survived,result.won,result.reward,envelope.resultHash]);
 assert.equal((await verifyResultEnvelope(envelope,rpc,address,{registration:'public'})).status,'verified');await assert.rejects(verifyResultEnvelope(envelope,rpc,address));values.eth_getCode=legacy.runtimeBytecode;await assert.rejects(verifyResultEnvelope(envelope,rpc,address,{registration:'public'}));
});
