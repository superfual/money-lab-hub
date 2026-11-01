// First-party, pseudonymous product measurements. Never an identity or revenue ledger.
export const vnDay=ms=>new Date(ms+7*3600000).toISOString().slice(0,10);
export async function digest(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(value))))].map(x=>x.toString(16).padStart(2,'0')).join('');}
export const testCohort=request=>request.headers.get('X-MoneyLab-Analytics-Test')==='1'?'test':'unclassified';
export async function recordMetric(db,e,now=Date.now()){
 const day=vnDay(now),actor=await digest(e.actor),id=await digest([e.metric,e.mode,e.key].join('|'));
 return db.prepare('INSERT OR IGNORE INTO moneylab_analytics_events (id,day,metric,mode,level,source,cohort,actor,value,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id,day,e.metric,e.mode,e.level||'all',e.source||'server',e.cohort||'unclassified',actor,e.value??1,now).run();
}
export async function activity(db,actor,mode,cohort,source='server',now=Date.now()){
 const day=vnDay(now);for(const m of new Set([mode,'all']))await recordMetric(db,{metric:'active_profiles',actor,mode:m,source,cohort,key:day+'|'+m+'|'+actor},now);
}
export async function stageMetrics(db,{actor,mode,game,cohort,abandoned=false},now=Date.now()){
 const base={actor,mode,level:game.difficulty,cohort,key:game.runId};
 if(abandoned){await recordMetric(db,{...base,metric:'stage_abandoned'},now);return;}
 const r=game.labResult;if(!r)return;await recordMetric(db,{...base,metric:'stage_finished'},now);
 await recordMetric(db,{...base,metric:'score',value:r.points||0},now);
 if(r.survived)await recordMetric(db,{...base,metric:'stage_survived'},now);if(r.won)await recordMetric(db,{...base,metric:'stage_won'},now);
}
export async function safelyMeasure(operation){try{await operation();}catch(e){console.warn('Money Lab analytics unavailable:',e.message);}}
export async function forgetMetrics(db,actor){await db.prepare('DELETE FROM moneylab_analytics_events WHERE actor=?').bind(await digest(actor)).run();}
export async function refreshSnapshot(db,now=Date.now()){
 const last=await db.prepare("SELECT updated_at FROM moneylab_analytics_snapshot WHERE metric='profiles_current'").first();if(last&&now-last.updated_at<60000)return;
 const items=[
 ['profiles_current','SELECT COUNT(*) AS n FROM moneylab_profiles','Current server profiles; includes QA, anonymous browsers and wallets, not unique humans.'],
 ['wallets_current','SELECT COUNT(*) AS n FROM moneylab_wallet_accounts WHERE deleted=0','Current wallet profiles; not unique humans; includes QA.'],
 ['wallets_deleted','SELECT COUNT(*) AS n FROM moneylab_wallet_accounts WHERE deleted=1','Deletion markers; not active users.'],
 ['rooms_current','SELECT COUNT(*) AS n FROM moneylab_rooms','Stored room records, including empty and test rooms.'],
 ['settlements_current','SELECT COUNT(*) AS n FROM moneylab_settlements','Retained online match settlements, including older/test data.'],
 ['stages_finished_retained',"SELECT COALESCE(SUM(json_extract(hub,'$.runs')),0) AS n FROM moneylab_profiles",'Completed or early-failed stages retained in profiles; not full historical activity or new-period activity.'],
 ['stage_wins_retained',"SELECT COALESCE(SUM(COALESCE(json_extract(hub,'$.wins.easy'),0)+COALESCE(json_extract(hub,'$.wins.medium'),0)+COALESCE(json_extract(hub,'$.wins.hard'),0)),0) AS n FROM moneylab_profiles",'Retained stage wins, including legacy/test profiles.'],
 ['active_stages_current',"SELECT COUNT(*) AS n FROM moneylab_profiles WHERE json_extract(hub,'$.active') IS NOT NULL",'Currently reserved stages, including online seats; not completed plays.']
 ];
 const statements=[];for(const [metric,query,note] of items){const row=await db.prepare(query).first();statements.push(db.prepare('INSERT INTO moneylab_analytics_snapshot (metric,value,note,updated_at) VALUES (?,?,?,?) ON CONFLICT(metric) DO UPDATE SET value=excluded.value,note=excluded.note,updated_at=excluded.updated_at').bind(metric,row.n,note,now));}
 statements.push(db.prepare("INSERT OR IGNORE INTO moneylab_analytics_snapshot (metric,value,note,updated_at) VALUES ('recording_started',?,'Time-series measurement begins here. Older guest/local-only plays cannot be reconstructed.',?)").bind(now,now));
 // Recent pseudonymous identities are distinct across days within each source/cohort.
 for(const source of ['server','client'])for(const cohort of ['unclassified','test'])for(const days of [1,7,30]){
  const cutoff=vnDay(now-(days-1)*86400000),row=await db.prepare("SELECT COUNT(DISTINCT actor) AS n FROM moneylab_analytics_events WHERE day>=? AND metric='active_profiles' AND mode='all' AND source=? AND cohort=?").bind(cutoff,source,cohort).first();
  statements.push(db.prepare('INSERT INTO moneylab_analytics_snapshot (metric,value,note,updated_at) VALUES (?,?,?,?) ON CONFLICT(metric) DO UPDATE SET value=excluded.value,note=excluded.note,updated_at=excluded.updated_at').bind(`active_${days}d_${source}_${cohort}`,row.n,'Distinct pseudonymous profiles; sources overlap and must not be summed as humans. From recording start only.',now));
 }
 for(const source of ['server','client'])for(const cohort of ['unclassified','test'])for(const days of [7,30]){
  const cutoff=vnDay(now-(days-1)*86400000),row=await db.prepare("SELECT COUNT(*) AS n FROM (SELECT actor FROM moneylab_analytics_events WHERE day>=? AND metric='stage_started' AND source=? AND cohort=? GROUP BY actor HAVING COUNT(DISTINCT day)>=2)").bind(cutoff,source,cohort).first();
  statements.push(db.prepare('INSERT INTO moneylab_analytics_snapshot (metric,value,note,updated_at) VALUES (?,?,?,?) ON CONFLICT(metric) DO UPDATE SET value=excluded.value,note=excluded.note,updated_at=excluded.updated_at').bind(`returning_play_${days}d_${source}_${cohort}`,row.n,'Profiles starting stages on at least two Vietnam dates in the window; not a validated retention rate.',now));
 }
 statements.push(db.prepare('DELETE FROM moneylab_analytics_events WHERE created_at<?').bind(now-90*86400000));await db.batch(statements);
}
