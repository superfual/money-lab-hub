import {estatePrivacyStatements} from './estate-privacy.mjs';
import {armTurn} from '../dist/turn-clock.mjs';
import {advanceSoloClock} from '../dist/turn-timeout.mjs';
import {recordGateProof} from '../dist/engine.mjs';
import {safelyMeasure,recordMetric,activity,stageMetrics,forgetMetrics,refreshSnapshot,testCohort} from './metrics.mjs';
import {walletIdentity,token} from './identity.mjs';
import {createHub,beginRun,settleRun,abandonRun,unlocked} from '../dist/hub.mjs';
import {createGame,prepareMove,chooseMove,resolve,manage} from '../dist/engine.mjs';
import {evaluateGate} from '../dist/tapeout.mjs';
import {LEVELS} from '../dist/levels.mjs';
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const random=n=>{const limit=Math.floor(4294967296/n)*n;let v;do{v=crypto.getRandomValues(new Uint32Array(1))[0];}while(v>=limit);return v%n;};
export async function handleSolo(request,env,services={}){try{
 if(!env.DB)fail('STORAGE_UNAVAILABLE',503);const db=env.DB,url=new URL(request.url),path=url.pathname.replace('/api/solo/',''),account=await walletIdentity(request,db);if(!account)fail('WALLET_LOGIN_REQUIRED',401);
 if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)fail('WRONG_ORIGIN',403);
 let profile=await db.prepare('SELECT hub,room_code FROM moneylab_profiles WHERE id=?').bind(account.id).first(),row=await db.prepare('SELECT state,revision,last_request FROM moneylab_solo WHERE id=?').bind(account.id).first();if(!profile||!row)fail('PROFILE_UNAVAILABLE',503);
 let hub=JSON.parse(profile.hub),state=row.state?JSON.parse(row.state):createGame();
 const now=services.now?.()??Date.now();let clockChanged=false;
 if(!profile.room_code&&hub.active){const next=structuredClone(state),h=structuredClone(hub),clock=advanceSoloClock(next,now);if(clock.changed){
  if(clock.expired){const receipt=await(services.gate||evaluateGate)(next.gate.IN0,next.gate.IN1);if(receipt.IN0!==next.gate.IN0||receipt.IN1!==next.gate.IN1||receipt.OUT0!==(receipt.IN0&&receipt.IN1?0:1))fail('CIRCUIT_READ_INVALID',503);recordGateProof(next,receipt);settleRun(h,next);}
  const op=token(),updated=await db.batch([db.prepare('UPDATE moneylab_solo SET state=?,revision=revision+1,operation_id=? WHERE id=? AND revision=? AND EXISTS (SELECT 1 FROM moneylab_profiles WHERE id=? AND room_code IS NULL AND hub=?)').bind(JSON.stringify(next),op,account.id,row.revision,account.id,profile.hub),db.prepare('UPDATE moneylab_profiles SET hub=? WHERE id=? AND EXISTS (SELECT 1 FROM moneylab_solo WHERE id=? AND operation_id=?)').bind(JSON.stringify(h),account.id,account.id,op)]);if(!updated[0].meta.changes)fail('PROGRESS_CHANGED_REFRESH',409);
  if(state.phase!=='finished'&&next.phase==='finished')await safelyMeasure(()=>stageMetrics(db,{actor:account.id,mode:'wallet_solo',game:next,cohort:testCohort(request)}));
  state=next;hub=h;row.revision++;profile.hub=JSON.stringify(h);clockChanged=true;
 }}
 const view=()=>({serverNow:Date.now(),game:state,hub,revision:row.revision,roomCode:profile.room_code,address:account.address});
 if(path==='state'&&request.method==='GET')return json(view());if(request.method!=='POST')fail('NOT_FOUND',404);
 const raw=await request.text();if(raw.length>3000)fail('REQUEST_TOO_LARGE',413);const body=JSON.parse(raw);if(path==='action'&&(clockChanged||body.action==='timeout'))return json(view());
 if(typeof body.requestId!=='string'||body.requestId.length<8||body.requestId.length>80)fail('REQUEST_ID_REQUIRED');
 if(row.last_request===body.requestId)return json(view());if(body.revision!==row.revision)fail('PROGRESS_CHANGED_REFRESH',409);if(profile.room_code)fail('LEAVE_ROOM_FIRST',409);
 if(path==='delete-account'){
  if(body.confirm!=='DELETE')fail('CONFIRM_DELETE_REQUIRED');if(hub.active)fail('FINISH_SOLO_FIRST',409);
  const rooms=await db.prepare('SELECT code,state FROM moneylab_rooms WHERE instr(state,?)>0').bind(account.id).all();const marker=token(),guard='EXISTS (SELECT 1 FROM moneylab_profiles WHERE id=? AND room_code=?)',statements=[db.prepare('UPDATE moneylab_profiles SET room_code=? WHERE id=? AND room_code IS NULL AND hub=?').bind(marker,account.id,profile.hub)];
  for(const r of rooms.results){const room=JSON.parse(r.state);if(!scrubRoom(room,account.id,true))continue;statements.push(db.prepare(`UPDATE moneylab_rooms SET state=?,revision=revision+1 WHERE code=? AND state=? AND ${guard}`).bind(JSON.stringify(room),r.code,r.state,account.id,marker));}
  statements.push(...await estatePrivacyStatements(db,account.id,true,guard,[account.id,marker]));
  if(await db.prepare("SELECT name FROM sqlite_master WHERE name='moneylab_mainnet_runs'").first())statements.push(db.prepare(`DELETE FROM moneylab_mainnet_runs WHERE account_id=? AND ${guard}`).bind(account.id,account.id,marker));
  statements.push(db.prepare(`DELETE FROM moneylab_testnet_runs WHERE account_id=? AND ${guard}`).bind(account.id,account.id,marker));
  statements.push(db.prepare(`DELETE FROM moneylab_wallet_sessions WHERE account_id=? AND ${guard}`).bind(account.id,account.id,marker),db.prepare(`DELETE FROM moneylab_wallet_challenges WHERE address=? AND ${guard}`).bind(account.address,account.id,marker),db.prepare(`DELETE FROM moneylab_solo WHERE id=? AND ${guard}`).bind(account.id,account.id,marker),db.prepare(`UPDATE moneylab_wallet_accounts SET address=NULL,deleted=1 WHERE id=? AND ${guard}`).bind(account.id,account.id,marker),db.prepare('DELETE FROM moneylab_profiles WHERE id=? AND room_code=?').bind(account.id,marker));const deleted=await db.batch(statements);if(!deleted[0].meta.changes)fail('PROGRESS_CHANGED_REFRESH',409);await safelyMeasure(async()=>{await forgetMetrics(db,account.id);await refreshSnapshot(db);});return json({deleted:true});
 }
 let next=structuredClone(state),h=structuredClone(hub),receipt=null;
 if(path==='clear-history'){
  if(h.active)fail('FINISH_SOLO_FIRST',409);if(body.confirm!=='CLEAR')fail('CONFIRM_CLEAR_REQUIRED');h.journey=[];h.ledger=[];next=createGame();
 }else if(path==='action'){
  const action=String(body.action||'');
  if(action==='start'){
   if(h.active)fail('FINISH_SOLO_FIRST',409);if(!Object.hasOwn(LEVELS,body.level)||!unlocked(h,body.level))fail('LEVEL_LOCKED');next=createGame(body.level);if(!beginRun(h,next,token(),'challenge'))fail('INSUFFICIENT_HUB');armTurn(next,now);
  }else if(action==='reset'){
   abandonRun(h,next);next=createGame(unlocked(h,next.difficulty)?next.difficulty:'easy');
  }else if(!h.active||h.active.id!==next.runId)fail('START_A_STAGE_FIRST');
  else if(action==='roll'){if(!prepareMove(next,random(6)+1,random(5)+1,random(4294967296),now))fail('INVALID_ACTION');}
  else if(action.startsWith('route-')){if(!chooseMove(next,Number(action.slice(6))))fail('INVALID_ACTION');}
  else if(action.startsWith('manage-')){if(!manage(next,action.slice(7)))fail('INVALID_ACTION');}
  else {if(!resolve(next,action))fail('INVALID_ACTION');armTurn(next,now);}
  receipt=await (services.gate||evaluateGate)(next.gate.IN0,next.gate.IN1);if(receipt.IN0!==next.gate.IN0||receipt.IN1!==next.gate.IN1||![0,1].includes(receipt.OUT0))fail('CIRCUIT_READ_INVALID',503);next.gate={IN0:receipt.IN0,IN1:receipt.IN1,OUT0:receipt.OUT0};recordGateProof(next,receipt);settleRun(h,next);
 }else fail('NOT_FOUND',404);
 const op=token();const statements=[
  db.prepare('UPDATE moneylab_solo SET state=?,revision=revision+1,operation_id=?,last_request=? WHERE id=? AND revision=? AND EXISTS (SELECT 1 FROM moneylab_profiles WHERE id=? AND room_code IS NULL AND hub=?)').bind(JSON.stringify(next),op,body.requestId,account.id,row.revision,account.id,profile.hub),
  db.prepare('UPDATE moneylab_profiles SET hub=? WHERE id=? AND EXISTS (SELECT 1 FROM moneylab_solo WHERE id=? AND operation_id=?)').bind(JSON.stringify(h),account.id,account.id,op)
 ];
 if(path==='clear-history'){const rooms=await db.prepare('SELECT code,state FROM moneylab_rooms WHERE instr(state,?)>0').bind(account.id).all();for(const r of rooms.results){const room=JSON.parse(r.state);if(!scrubRoom(room,account.id,false))continue;statements.push(db.prepare('UPDATE moneylab_rooms SET state=?,revision=revision+1 WHERE code=? AND state=? AND EXISTS (SELECT 1 FROM moneylab_solo WHERE id=? AND operation_id=?)').bind(JSON.stringify(room),r.code,r.state,account.id,op));}}
 if(path==='clear-history')statements.push(...await estatePrivacyStatements(db,account.id,false,'EXISTS (SELECT 1 FROM moneylab_solo WHERE id=? AND operation_id=?)',[account.id,op]));
 const results=await db.batch(statements);if(!results[0].meta.changes)fail('PROGRESS_CHANGED_REFRESH',409);
 await safelyMeasure(async()=>{const cohort=testCohort(request),base={actor:account.id,mode:'wallet_solo',level:next.difficulty,cohort};
 if(path==='clear-history'){await forgetMetrics(db,account.id);return;}
 await activity(db,account.id,'wallet_solo',cohort);
 if(body.action==='start')await recordMetric(db,{...base,metric:'stage_started',key:next.runId});
 if(body.action==='reset'&&hub.active)await stageMetrics(db,{actor:account.id,mode:'wallet_solo',game:state,cohort,abandoned:true});
 if(next.phase==='finished'&&state.phase!=='finished')await stageMetrics(db,{actor:account.id,mode:'wallet_solo',game:next,cohort});
 });return json({serverNow:Date.now(),game:next,hub:h,revision:row.revision+1,roomCode:null,address:account.address,receipt});
 }catch(e){services.onError?.(e);if(!e.status)console.error('Money Lab progress:',e.message);return json({error:e.status?e.message:'PROGRESS_UNAVAILABLE'},e.status||503);}}

function scrubRoom(room,id,remove){let changed=false;const member=room.members.find(m=>m.id===id);if(remove&&member){member.name='Deleted player';changed=true;}const seat=room.playerIds?.indexOf(id)??room.members.findIndex(m=>m.id===id);if(seat>=0&&room.d.players[seat]){const p=room.d.players[seat];if(remove){p.name='Deleted player';p.game=null;p.hub={balance:p.hub.balance};}else{if(p.game){p.game.history=[];p.game.last=null;p.game.pending=null;delete p.game.labTrace;}if(p.hub){p.hub.journey=[];p.hub.ledger=[];}}p.receipt=null;changed=true;}return changed;}
