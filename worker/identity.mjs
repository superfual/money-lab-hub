import {safelyMeasure,recordMetric,activity,testCohort} from './metrics.mjs';
import {verifyMessage,getAddress} from 'ethers';
import {createHub} from '../dist/hub.mjs';
const encoder=new TextEncoder();
export const hash=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');
export const token=()=>[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');
const cookie=(value,age=604800)=>`__Host-ml_session=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${age}`;
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
export async function walletIdentity(request,db){const raw=request.headers.get('Cookie')?.match(/(?:^|;\s*)__Host-ml_session=([a-f0-9]{64})(?:;|$)/)?.[1];if(!raw)return null;const session=await db.prepare('SELECT s.account_id,a.address,a.deleted FROM moneylab_wallet_sessions s JOIN moneylab_wallet_accounts a ON a.id=s.account_id WHERE s.token_hash=? AND s.expires>?').bind(await hash(raw),Date.now()).first();return session&&!session.deleted?{id:session.account_id,address:session.address}:null;}
export async function handleAuth(request,env){try{
 if(!env.DB)fail('STORAGE_UNAVAILABLE',503);const db=env.DB,url=new URL(request.url),path=url.pathname.replace('/api/account/','');
 if(request.method==='GET'&&path==='session'){const account=await walletIdentity(request,db);return json({account:account?{address:account.address}:null});}
 if(request.method!=='POST')fail('NOT_FOUND',404);if(request.headers.get('Origin')!==url.origin)fail('WRONG_ORIGIN',403);
 const raw=await request.text();if(raw.length>5000)fail('REQUEST_TOO_LARGE',413);const body=JSON.parse(raw||'{}');
 if(path==='challenge'){
  let address;try{address=getAddress(body.address);}catch{fail('INVALID_ADDRESS');}const now=Date.now();
  const recent=await db.prepare('SELECT COUNT(*) AS n FROM moneylab_wallet_challenges WHERE address=? AND expires>?').bind(address,now).first();if(recent.n>=5)fail('TRY_AGAIN_LATER',429);
  await db.batch([db.prepare('DELETE FROM moneylab_wallet_challenges WHERE expires<?').bind(now-3600000),db.prepare('DELETE FROM moneylab_wallet_sessions WHERE expires<?').bind(now)]);
  const nonce=token(),expires=now+300000,message=`${url.host} wants you to sign in with your Ethereum account:\n${address}\n\nSign in to Money Lab. No transaction, token approval, or payment.\n\nURI: ${url.origin}\nVersion: 1\nChain ID: 196\nNonce: ${nonce}\nIssued At: ${new Date(now).toISOString()}\nExpiration Time: ${new Date(expires).toISOString()}`;
  await db.prepare('INSERT INTO moneylab_wallet_challenges (nonce,address,message,expires) VALUES (?,?,?,?)').bind(nonce,address,message,expires).run();return json({nonce,message});
 }
 if(path==='verify'){
  const c=await db.prepare('SELECT address,message,expires,used FROM moneylab_wallet_challenges WHERE nonce=?').bind(String(body.nonce||'')).first();
  if(!c||c.used||c.expires<=Date.now()||!c.message.startsWith(url.host+' wants')||!c.message.includes('\nURI: '+url.origin+'\n'))fail('CHALLENGE_EXPIRED',401);
  let recovered;try{recovered=verifyMessage(c.message,body.signature);}catch{fail('INVALID_SIGNATURE',401);}if(recovered!==c.address)fail('INVALID_SIGNATURE',401);
  const id='w_'+await hash(c.address.toLowerCase()),secret=token(),digest=await hash(secret),now=Date.now();let hub=createHub();const old=await db.prepare('SELECT deleted FROM moneylab_wallet_accounts WHERE id=?').bind(id).first();if(old?.deleted){hub.balance=0;hub.ledger=[];}
  const cond='EXISTS (SELECT 1 FROM moneylab_wallet_challenges WHERE nonce=? AND used=?)';
  const results=await db.batch([
   db.prepare('UPDATE moneylab_wallet_challenges SET used=? WHERE nonce=? AND used IS NULL AND expires>?').bind(digest,body.nonce,now),
   db.prepare(`INSERT INTO moneylab_wallet_accounts (id,address,deleted,created_at) SELECT ?,?,0,? WHERE ${cond} ON CONFLICT(id) DO UPDATE SET address=excluded.address,deleted=0`).bind(id,c.address,now,body.nonce,digest),
   db.prepare(`INSERT OR IGNORE INTO moneylab_profiles (id,hub) SELECT ?,? WHERE ${cond}`).bind(id,JSON.stringify(hub),body.nonce,digest),
   db.prepare(`INSERT OR IGNORE INTO moneylab_solo (id) SELECT ? WHERE ${cond}`).bind(id,body.nonce,digest),
   db.prepare(`INSERT INTO moneylab_wallet_sessions (token_hash,account_id,expires) SELECT ?,?,? WHERE ${cond}`).bind(digest,id,now+604800000,body.nonce,digest)
  ]);if(!results[0].meta.changes)fail('CHALLENGE_EXPIRED',401);await safelyMeasure(async()=>{const base={actor:id,mode:'account',cohort:testCohort(request)};await recordMetric(db,{...base,metric:'wallet_login',key:digest});if(!old)await recordMetric(db,{...base,metric:'wallet_registered',key:id});await activity(db,id,'account',base.cohort);});return json({account:{address:c.address},reactivated:!!old?.deleted},200,{'Set-Cookie':cookie(secret)});
 }
 if(path==='logout'){const raw=request.headers.get('Cookie')?.match(/__Host-ml_session=([a-f0-9]{64})/)?.[1];if(raw)await db.prepare('DELETE FROM moneylab_wallet_sessions WHERE token_hash=?').bind(await hash(raw)).run();return json({ok:true},200,{'Set-Cookie':cookie('',0)});}
 fail('NOT_FOUND',404);
 }catch(e){return json({error:e.status?e.message:'AUTH_UNAVAILABLE'},e.status||503);}}
