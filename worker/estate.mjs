import {walletIdentity} from './identity.mjs';
import {playerId} from './online.mjs';
import {createHub} from '../dist/hub.mjs';
import {ESTATE_WORLDS,newEstateRoom,estateAct,expireEstate,estateRanking} from '../dist/estate-core.mjs';
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};const json=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export async function handleEstate(request,env,services={}){try{
 if(!env.DB)fail('STORAGE_UNAVAILABLE',503);const db=env.DB,url=new URL(request.url),path=url.pathname.split('/').at(-1),wallet=await walletIdentity(request,db);if(!wallet&&request.headers.get('X-MoneyLab-Wallet')==='1')fail('WALLET_LOGIN_REQUIRED',401);const id=wallet?.id||await playerId(request);
 if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)fail('WRONG_ORIGIN',403);const raw=request.method==='POST'?await request.text():'{}';if(raw.length>4000)fail('REQUEST_TOO_LARGE',413);const body=JSON.parse(raw);
 await db.prepare('INSERT OR IGNORE INTO moneylab_profiles(id,hub) VALUES(?,?)').bind(id,JSON.stringify(createHub())).run();const profile=await db.prepare('SELECT hub,room_code FROM moneylab_profiles WHERE id=?').bind(id).first(),hub=JSON.parse(profile.hub);
 const now=services.now?.()??Date.now(),world=Number(body.world||url.searchParams.get('world')||2),w=ESTATE_WORLDS[world];if(!w)fail('INVALID_WORLD');
 const view=(r,code,revision)=>({world:r.world,code,revision,seat:r.game?r.game.players.findIndex(p=>p.id===id):r.members.findIndex(m=>m.id===id),isHost:r.host===id,capacity:r.capacity,members:r.members.map((m,i)=>({name:m.name,ready:m.ready,seat:r.game?r.game.players.findIndex(p=>p.id===m.id):i})),game:r.game?{...r.game,seed:undefined,players:r.game.players.map(p=>({...p,id:undefined}))}:null,ranking:r.game?.done?estateRanking(r.game):null,serverNow:Date.now()});
 if(path==='profile'&&request.method==='GET')return json({balance:hub.balance,roomCode:profile.room_code,eligible:hub.balance>=w.minHub,minHub:w.minHub,world});
 if(path==='create'&&request.method==='POST'){
  if(profile.room_code)fail('ALREADY_IN_ROOM',409);if(hub.active)fail('FINISH_SOLO_FIRST',409);if(hub.balance<w.minHub)fail('HUB_THRESHOLD');if(!Number.isInteger(body.capacity)||body.capacity<w.minPlayers||body.capacity>w.maxPlayers)fail('PLAYER_COUNT');
  const code='W'+world+'-'+Array.from(crypto.getRandomValues(new Uint8Array(8)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join(''),op=crypto.randomUUID(),room={world,host:id,capacity:body.capacity,members:[{id,name:clean(body.name),ready:false}],game:null,seen:[]};
  const result=await db.batch([db.prepare('INSERT INTO moneylab_estate_rooms(code,operation_id,state,updated_at) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM moneylab_profiles WHERE id=? AND room_code IS NULL AND hub=?)').bind(code,op,JSON.stringify(room),now,id,profile.hub),db.prepare('UPDATE moneylab_profiles SET room_code=? WHERE id=? AND room_code IS NULL AND EXISTS(SELECT 1 FROM moneylab_estate_rooms WHERE code=? AND operation_id=?)').bind(code,id,code,op)]);if(!result[0].meta.changes)fail('ROOM_CONFLICT',409);return json(view(room,code,0));
 }
 const code=String(body.code||url.searchParams.get('code')||'').toUpperCase().trim();if(!/^W[23]-[A-Z2-9]{8}$/.test(code))fail('INVALID_ROOM_CODE');const row=await db.prepare('SELECT revision,state FROM moneylab_estate_rooms WHERE code=?').bind(code).first();if(!row)fail('ROOM_NOT_FOUND',404);const r=JSON.parse(row.state),seat=r.members.findIndex(m=>m.id===id);if(r.world!==world)fail('WRONG_WORLD');
 if(path==='room'&&seat<0)fail('NOT_A_MEMBER',403);let ticked=false;if(seat>=0&&r.game?.active)ticked=!!expireEstate(r.game,now);
 if(path==='room'&&request.method==='GET'&&!ticked)return json(view(r,code,row.revision));
 if(!ticked&&request.method!=='POST')fail('NOT_FOUND',404);
 if(!ticked&&r.seen.some(s=>s.id===id&&s.key===body.requestId))return json(view(r,code,row.revision));
 if(!ticked&&(typeof body.requestId!=='string'||body.requestId.length<8||body.requestId.length>80))fail('REQUEST_ID_REQUIRED');if(!ticked&&path!=='join'&&body.revision!==row.revision)fail('ROOM_CHANGED_REFRESH',409);
 if(path==='tick'&&!ticked)return json(view(r,code,row.revision));
 let membership=null;
 if(!ticked){
 if(path==='join'){if(seat>=0)return json(view(r,code,row.revision));if(profile.room_code)fail('ALREADY_IN_ROOM',409);if(hub.active)fail('FINISH_SOLO_FIRST',409);if(hub.balance<ESTATE_WORLDS[r.world].minHub)fail('HUB_THRESHOLD');if(r.game||r.members.length>=r.capacity)fail('ROOM_CLOSED');r.members.push({id,name:clean(body.name),ready:false});membership={value:code,joining:true};}
 else {if(seat<0)fail('NOT_A_MEMBER',403);
 if(path==='ready'){if(r.game?.active||r.game?.done)fail('MATCH_STARTED');if(hub.balance<ESTATE_WORLDS[r.world].minHub)fail('HUB_THRESHOLD');r.members[seat].ready=!!body.ready;}
 else if(path==='start'){if(r.host!==id)fail('HOST_ONLY',403);if(r.game||r.members.length!==r.capacity||!r.members.every(m=>m.ready))fail('WAIT_FOR_ALL_READY');const profiles=await Promise.all(r.members.map(m=>db.prepare('SELECT hub,room_code FROM moneylab_profiles WHERE id=?').bind(m.id).first()));if(profiles.some(p=>!p||p.room_code!==code||JSON.parse(p.hub).active||JSON.parse(p.hub).balance<ESTATE_WORLDS[r.world].minHub))fail('HUB_THRESHOLD');r.game=newEstateRoom(r.world,r.members,services.seed??crypto.getRandomValues(new Uint32Array(1))[0],now);}
 else if(path==='act'){if(!estateAct(r.game,seat,String(body.action),now))fail('INVALID_ACTION');}
 else if(path==='next'){if(r.host!==id||!r.game?.done)fail('HOST_ONLY',403);r.game=null;r.members.forEach(m=>m.ready=false);}
 else if(path==='leave'){if(r.game?.active)fail('SURRENDER_AND_WAIT_FOR_MATCH');r.members.splice(seat,1);if(r.host===id)r.host=r.members[0]?.id||null;membership={value:null,joining:false};}
 else if(path!=='tick')fail('NOT_FOUND',404);
 }}
 r.seen.push({id,key:body.requestId||crypto.randomUUID()});r.seen=r.seen.slice(-100);const op=crypto.randomUUID(),statements=[db.prepare('UPDATE moneylab_estate_rooms SET state=?,revision=revision+1,operation_id=?,updated_at=? WHERE code=? AND revision=? AND (?=0 OR EXISTS(SELECT 1 FROM moneylab_profiles WHERE id=? AND room_code IS NULL AND hub=?))').bind(JSON.stringify(r),op,now,code,row.revision,membership?.joining?1:0,id,profile.hub)];
 if(membership)statements.push(db.prepare('UPDATE moneylab_profiles SET room_code=? WHERE id=? AND EXISTS(SELECT 1 FROM moneylab_estate_rooms WHERE code=? AND operation_id=?)').bind(membership.value,id,code,op));const saved=await db.batch(statements);if(!saved[0].meta.changes)fail('ROOM_CHANGED_REFRESH',409);return json(membership?.value===null?{left:true}:view(r,code,row.revision+1));
 }catch(e){services.onError?.(e);return json({error:e.status?e.message:'ESTATE_UNAVAILABLE'},e.status||503);}}
const clean=v=>typeof v==='string'&&v.trim()?v.trim().slice(0,24):'Investor';
