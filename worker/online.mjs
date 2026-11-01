import {walletIdentity} from './identity.mjs';
import {createHub,unlocked} from '../dist/hub.mjs';
import {createDuel,startDuel,duelAct,resignDuel} from '../dist/duel-core.mjs';
import {LEVELS} from '../dist/levels.mjs';
import {matchStake} from '../dist/competition.mjs';
import {CIRCUIT,verifyCircuit,evaluateGate} from '../dist/tapeout.mjs';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
async function circuitRead(operation){return operation();}
function validSnapshot(p){return p?.schema==='money-lab.tapeout-proof.v1'&&p.address===CIRCUIT.address&&p.owner===CIRCUIT.author&&p.chainId===196&&Array.isArray(p.cases)&&p.cases.length===4&&p.cases.every(r=>r.contract===CIRCUIT.address&&r.circuitId===48&&r.method==='eth_call'&&r.blockNumber===p.blockNumber&&[0,1].includes(r.OUT0));}
async function snapshot(db,services){if(services.verify)return services.verify();const row=await db.prepare("SELECT state FROM moneylab_rooms WHERE json_extract(state,'$.proof.schema')='money-lab.tapeout-proof.v1' AND json_extract(state,'$.proof.checkedAt')>=? ORDER BY json_extract(state,'$.proof.checkedAt') DESC LIMIT 1").bind(new Date(Date.now()-300000).toISOString()).first();const previous=row?JSON.parse(row.state).proof:null;if(validSnapshot(previous)&&Date.now()-Date.parse(previous.checkedAt)<300000)return previous;return verifyCircuit();}

const random=()=>crypto.getRandomValues(new Uint32Array(1))[0];
export async function playerId(request){const key=request.headers.get('Authorization')?.replace(/^Bearer /,'');if(!key||!/^ml_[a-f0-9]{64}$/.test(key))fail('PLAYER_KEY_REQUIRED',401);const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key));return [...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('');}
export async function handleOnline(request,env,services={}){try{
 if(!env.DB)fail('ONLINE_STORAGE_UNAVAILABLE',503);
 const url=new URL(request.url),path=url.pathname.replace('/api/online',''),db=env.DB;
 if(request.method==='POST'){const origin=request.headers.get('Origin');if(origin&&origin!==url.origin)fail('WRONG_ORIGIN',403);if(Number(request.headers.get('Content-Length')||0)>16000)fail('REQUEST_TOO_LARGE',413);}
 const wallet=await walletIdentity(request,db);if(!wallet&&request.headers.get('X-MoneyLab-Wallet')==='1')fail('WALLET_LOGIN_REQUIRED',401);if(wallet&&request.method==='POST'&&request.headers.get('Origin')!==url.origin)fail('WRONG_ORIGIN',403);const id=wallet?.id||await playerId(request);await db.prepare('INSERT OR IGNORE INTO moneylab_profiles (id,hub) VALUES (?,?)').bind(id,JSON.stringify(createHub())).run();
 const profile=await db.prepare('SELECT hub,room_code FROM moneylab_profiles WHERE id=?').bind(id).first();
 if(path==='/profile'&&request.method==='GET')return json({hub:JSON.parse(profile.hub),roomCode:profile.room_code});
 const body=request.method==='POST'?await request.json():{};
 if(path==='/create'&&request.method==='POST'){
  if(profile.room_code)fail('ALREADY_IN_ROOM',409);if(JSON.parse(profile.hub).active)fail('FINISH_SOLO_FIRST',409);if(!Object.hasOwn(LEVELS,body.level)||!Number.isInteger(body.capacity)||body.capacity<2||body.capacity>6)fail('INVALID_ROOM');
  const hub=JSON.parse(profile.hub);if(!unlocked(hub,body.level)||hub.balance<matchStake(body.level))fail('LEVEL_LOCKED_OR_INSUFFICIENT_HUB');
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',code=Array.from(crypto.getRandomValues(new Uint8Array(8)),n=>alphabet[n%32]).join('');
  const room={host:id,capacity:body.capacity,level:body.level,d:createDuel(),members:[{id,name:cleanName(body.name),ready:false}],seen:[],proof:null};room.d.players=[];
  const op=crypto.randomUUID();const result=await db.batch([db.prepare('INSERT INTO moneylab_rooms (code,revision,operation_id,state,updated_at) SELECT ?,0,?,?,? WHERE EXISTS (SELECT 1 FROM moneylab_profiles WHERE id=? AND room_code IS NULL AND hub=?)').bind(code,op,JSON.stringify(room),Date.now(),id,profile.hub),db.prepare('UPDATE moneylab_profiles SET room_code=? WHERE id=? AND room_code IS NULL AND EXISTS (SELECT 1 FROM moneylab_rooms WHERE code=? AND operation_id=?)').bind(code,id,code,op)]);
  if(!result[0].meta.changes)fail('ROOM_CONFLICT',409);return json(await view(db,code,id));
 }
 const code=(body.code||url.searchParams.get('code')||'').toUpperCase().trim();if(!/^[A-Z2-9]{8}$/.test(code))fail('INVALID_ROOM_CODE');
 const record=await db.prepare('SELECT revision,state FROM moneylab_rooms WHERE code=?').bind(code).first();if(!record)fail('ROOM_NOT_FOUND',404);
 const room=JSON.parse(record.state);let seat=room.members.findIndex(m=>m.id===id);
 if(path==='/room'&&request.method==='GET'){if(seat<0)fail('NOT_A_MEMBER',403);return json(await view(db,code,id));}
 if(request.method!=='POST')fail('NOT_FOUND',404);
 if(typeof body.requestId!=='string'||body.requestId.length>80)fail('REQUEST_ID_REQUIRED');
 if(room.seen.some(x=>x.id===id&&x.key===body.requestId)){if(seat<0)return json({left:true});return json(await view(db,code,id));}
 if(path!=='/join'&&body.revision!==record.revision)fail('ROOM_CHANGED_REFRESH',409);
 let changedProfiles=[],contribution=null;
 if(path==='/join'){
  if(seat>=0)return json(await view(db,code,id));if(profile.room_code)fail('ALREADY_IN_ROOM',409);if(JSON.parse(profile.hub).active)fail('FINISH_SOLO_FIRST',409);if(room.d.active||room.d.done||room.members.length>=room.capacity)fail('ROOM_CLOSED');
  const hub=JSON.parse(profile.hub);if(!unlocked(hub,room.level)||hub.balance<matchStake(room.level))fail('LEVEL_LOCKED_OR_INSUFFICIENT_HUB');
  room.members.push({id,name:cleanName(body.name),ready:false});seat=room.members.length-1;changedProfiles=[{id,hub,room:code}];
 }else{
  if(seat<0)fail('NOT_A_MEMBER',403);
  if(path==='/ready'){if(room.d.active||room.d.done)fail('MATCH_ALREADY_STARTED');const hub=JSON.parse(profile.hub);if(!unlocked(hub,room.level)||hub.balance<matchStake(room.level))fail('LEVEL_LOCKED_OR_INSUFFICIENT_HUB');room.members[seat].ready=!!body.ready;}
  else if(path==='/leave'){
   if(room.d.active)fail('SURRENDER_BEFORE_LEAVING');room.members.splice(seat,1);if(room.host===id)room.host=room.members[0]?.id||null;changedProfiles=[{id,hub:JSON.parse(profile.hub),room:null}];
  }else if(path==='/next'){
   if(room.host!==id||!room.d.done)fail('HOST_ONLY',403);room.d.done=false;room.members.forEach(m=>m.ready=false);
  }else if(path==='/start'){
   if(room.host!==id)fail('HOST_ONLY',403);if(room.d.active||room.d.done||room.members.length!==room.capacity||!room.members.every(m=>m.ready))fail('WAIT_FOR_ALL_READY');
   const rows=await Promise.all(room.members.map(m=>db.prepare('SELECT hub,room_code FROM moneylab_profiles WHERE id=?').bind(m.id).first()));
   room.playerIds=room.members.map(m=>m.id);room.d.players=rows.map((r,i)=>({name:room.members[i].name,hub:JSON.parse(r.hub),game:null}));if(rows.some(r=>r.room_code!==code))fail('MEMBERSHIP_CHANGED',409);
   room.proof=await snapshot(db,services);if(!startDuel(room.d,room.level,random()))fail('LEVEL_LOCKED_OR_INSUFFICIENT_HUB');room.d.handoff=false;
   changedProfiles=room.members.map((m,i)=>({id:m.id,hub:room.d.players[i].hub,room:code}));
  }else if(path==='/act'){
   if(!room.d.active||room.d.turn!==seat)fail('NOT_YOUR_TURN',403);
   const current=room.d.players[seat];if(body.action==='surrender'){resignDuel(room.d);}else if(!duelAct(room.d,String(body.action)))fail('INVALID_ACTION');
   const a=current.game.gate.IN0,b=current.game.gate.IN1;let receipt;if(services.gate)receipt=await services.gate(a,b);else{if(!validSnapshot(room.proof))fail('CIRCUIT_SNAPSHOT_INVALID',503);const actual=room.proof.cases.find(r=>r.IN0===a&&r.IN1===b);if(!actual)fail('CIRCUIT_SNAPSHOT_INVALID',503);receipt={...actual,source:'verified-match-snapshot',usedAt:new Date().toISOString()};}current.game.gate={IN0:receipt.IN0,IN1:receipt.IN1,OUT0:receipt.OUT0};current.receipt=receipt;room.d.handoff=false;
   changedProfiles=room.members.map((m,i)=>({id:m.id,hub:room.d.players[i].hub,room:code}));
   if(room.d.done)contribution=room.d.betResult.treasury;
  }else fail('NOT_FOUND',404);
 }
 room.seen.push({id,key:body.requestId});room.seen=room.seen.slice(-100);const op=crypto.randomUUID(),nextRevision=record.revision+1;
 const statements=[db.prepare('UPDATE moneylab_rooms SET state=?,revision=?,operation_id=?,updated_at=? WHERE code=? AND revision=? AND (?=0 OR EXISTS (SELECT 1 FROM moneylab_profiles WHERE id=? AND room_code IS NULL AND hub=?))').bind(JSON.stringify(room),nextRevision,op,Date.now(),code,record.revision,path==='/join'?1:0,id,profile.hub)];
 for(const p of changedProfiles)statements.push(db.prepare('UPDATE moneylab_profiles SET hub=?,room_code=? WHERE id=? AND EXISTS (SELECT 1 FROM moneylab_rooms WHERE code=? AND operation_id=?)').bind(JSON.stringify(p.hub),p.room,p.id,code,op));
 if(contribution!==null)statements.push(db.prepare('INSERT OR IGNORE INTO moneylab_settlements (room_code,round,contribution) SELECT ?,?,? WHERE EXISTS (SELECT 1 FROM moneylab_rooms WHERE code=? AND operation_id=?)').bind(code,room.d.round,contribution,code,op));
 const results=await db.batch(statements);if(!results[0].meta.changes)fail('ROOM_CHANGED_REFRESH',409);return json(path==='/leave'?{left:true}:await view(db,code,id));
 }catch(error){services.onError?.(error);if(!error.status)console.error('Money Lab online:',error.message);return json({error:error.status?error.message:'ONLINE_REQUEST_FAILED'},error.status||503);}}
function cleanName(name){return typeof name==='string'&&name.trim()?name.trim().slice(0,24):'Player';}
async function view(db,code,id){const r=await db.prepare('SELECT revision,state FROM moneylab_rooms WHERE code=?').bind(code).first(),room=JSON.parse(r.state),seat=room.members.findIndex(m=>m.id===id);if(seat<0)fail('NOT_A_MEMBER',403);
 const total=await db.prepare('SELECT COALESCE(SUM(contribution),0) AS amount FROM moneylab_settlements').first();
 const d=structuredClone(room.d);delete d.seed;delete d.memory;delete d.seen;delete d.bench;
 d.players=d.players.map((p,i)=>{if(i===seat||d.done)return p;return {name:p.name,hub:{balance:p.hub.balance},stake:p.stake,game:p.game?{phase:p.game.phase,month:p.game.month,position:p.game.position,dice:p.game.dice}:null};});
 // Correct answers and other participants' active cards are never sent in a room snapshot.
 return {code,revision:r.revision,seat,isHost:room.host===id,capacity:room.capacity,level:room.level,members:room.members.map((m,i)=>({name:m.name,ready:m.ready,seat:i})),d,globalTreasury:total.amount,proof:room.proof?{blockNumber:room.proof.blockNumber,contract:room.proof.address}:null};}
