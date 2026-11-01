import {walletIdentity} from './identity.mjs';
import {recordMetric,activity,safelyMeasure,refreshSnapshot,forgetMetrics,testCohort,vnDay} from './metrics.mjs';
const json=(d,status)=>new Response(JSON.stringify(d),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export async function handleAnalytics(request,env){
 if(request.method!=='POST')return json({error:'NOT_FOUND'},404);if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'WRONG_ORIGIN'},403);
 if(!env.DB)return json({error:'STORAGE_UNAVAILABLE'},503);
 try{
 if(new URL(request.url).pathname==='/api/analytics/refresh'){await refreshSnapshot(env.DB);return json({ok:true},200);}
 const raw=await request.text();if(raw.length>1200)return json({error:'REQUEST_TOO_LARGE'},413);const b=JSON.parse(raw);
 if(!/^[a-f0-9]{64}$/.test(b.browser||'')||!/^[-a-zA-Z0-9]{8,100}$/.test(b.eventId||''))return json({error:'INVALID_EVENT'},400);
 const actor='browser:'+b.browser;
 if(b.metric==='forget'){await safelyMeasure(()=>forgetMetrics(env.DB,actor));return json({ok:true},200);}
 const level=['easy','medium','hard'].includes(b.level)?b.level:'all',mode=['site','guest_solo','local_group'].includes(b.mode)?b.mode:null;
 if(!mode||!['page_view','stage_started','stage_finished','stage_survived','stage_won','stage_abandoned','score'].includes(b.metric))return json({error:'INVALID_EVENT'},400);
 if(b.metric==='page_view'&&mode!=='site'||b.metric!=='page_view'&&mode==='site')return json({error:'INVALID_EVENT'},400);
 const now=Date.now(),cohort=testCohort(request),count=await env.DB.prepare('SELECT COUNT(*) AS n FROM moneylab_analytics_events WHERE actor=? AND created_at>?').bind(await digestBrowser(actor),now-60000).first();if(count.n>=60)return json({error:'RATE_LIMITED'},429);
 // Client events are explicitly unverified. They never change HUB or authoritative stage results.
 await recordMetric(env.DB,{actor,mode,level,cohort,source:'client',metric:b.metric,key:b.eventId,value:b.metric==='score'?Math.min(100,Math.max(0,Number(b.value)||0)):1},now);
 if(b.metric==='stage_started'||b.metric==='page_view')await activity(env.DB,actor,mode,cohort,'client',now);
 if(b.metric==='page_view'){const wallet=await walletIdentity(request,env.DB);if(wallet)await activity(env.DB,wallet.id,'site',cohort,'server',now);}
 await safelyMeasure(()=>refreshSnapshot(env.DB,now));return json({ok:true},200);
 }catch(e){console.warn('Money Lab analytics request:',e.message);return json({error:'ANALYTICS_UNAVAILABLE'},503);}
}
async function digestBrowser(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(n=>n.toString(16).padStart(2,'0')).join('');}
