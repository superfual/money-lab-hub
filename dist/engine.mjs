import {armTurn} from './turn-clock.mjs';
import {RISK_POLICY} from './risk-rules.mjs';
import {monthlyPortfolio} from './monthly.mjs';
import {LEVELS,levelOf,essentialCost,marketRate,incomeAt,wealthBenchmark} from './levels.mjs';
import {QUESTIONS,OPPORTUNITIES,SURPRISES,QUICK_FUND,MARKET_RATES,opportunity,surprise,question,questionPool,MARKET_STORIES,marketStory,SIDE_JOBS,sideJob} from './events.mjs';
export const VERSION=2;
export const TILES=['start','opportunity','expense','learn','market','salary','opportunity','expense','learn','market','opportunity','salary','expense','learn','market','opportunity'];
export const RULES={months:12,initialCash:7000,initialReserve:3000,salary:1800,livingCost:1400};
const cents=n=>Math.round((n+Number.EPSILON)*100)/100;
export function createGame(difficulty='easy'){if(!Object.hasOwn(LEVELS,difficulty))throw Error('Invalid difficulty');const l=LEVELS[difficulty];return {version:VERSION,balanceVersion:22,difficulty,runId:null,labMode:'practice',labResult:null,month:0,position:0,cash:l.cash,reserve:l.reserve,investments:0,positions:[],usedQuestions:[],usedOpportunities:[],usedSurprises:[],enjoyment:0,optionalSpent:0,phase:'ready',pending:null,history:[],last:null,dice:null,forcedSales:0,shortfall:0,correctAnswers:0,answered:0,gate:{IN0:0,IN1:0,OUT0:1},started:false};}
export const debt=s=>cents(s.positions.reduce((a,p)=>a+p.debt,0));
export const sellable=s=>cents(s.positions.filter(p=>!p.locked).reduce((a,p)=>a+p.value,0));
export const monthlyPayment=s=>s.positions.reduce((a,p)=>a+Math.min(p.debt,p.payment),0);
export function netWorth(s){return cents(s.cash+s.reserve+s.investments-debt(s));}
export function nand(a,b){return a&&b?0:1;}
function totals(s){s.investments=cents(s.positions.reduce((a,p)=>a+p.value,0));}
function sell(s,amount){let remaining=amount;for(const p of s.positions){if(p.locked)continue;const value=Math.min(p.value,remaining);p.value=cents(p.value-value);remaining=cents(remaining-value);if(!remaining)break;}totals(s);return cents(amount-remaining);}
function buy(s,o){if(s.cash<o.cost||s.gate.OUT0===0)return false;s.cash=cents(s.cash-o.cost);s.positions.push({id:o.id,kind:o.kind,value:o.gross||o.cost,debt:o.debt||0,payment:o.payment||0,locked:['property','fashion','food'].includes(o.kind)});totals(s);return true;}
function manageImpl(s,action){if(s.phase!=='ready'||!s.started||s.route)return false;
 if(action==='reserve'&&s.cash>=500){s.cash-=500;s.reserve+=500;}
 else if(action==='release'&&s.reserve>=500){s.reserve-=500;s.cash+=500;}
 else if(action==='invest'){if(!buy(s,QUICK_FUND))return false;}
 else if(action==='sell'&&sellable(s)>0)s.cash=cents(s.cash+sell(s,Math.min(1000,sellable(s))));
 else return false;
 if(s.reserve>0)s.gate={IN0:0,IN1:s.gate.IN1,OUT0:1};return true;
}
function draw(pool,used,seed,repeat=true){const unseen=pool.filter(x=>!used.includes(x.id)),choices=unseen.length?unseen:repeat?pool:[];if(!choices.length)return null;const item=choices[seed%choices.length];if(!used.includes(item.id))used.push(item.id);return item;}
function spend(s,amount,cashFirst=false){const insufficient=amount>s.cash+s.reserve;let remaining=amount,fromReserve=0,fromCash=0;
 for(const key of cashFirst?['cash','reserve']:['reserve','cash']){const paid=Math.min(s[key],remaining);s[key]=cents(s[key]-paid);remaining=cents(remaining-paid);if(key==='cash')fromCash=paid;else fromReserve=paid;}
 const sale=sell(s,Math.min(sellable(s),remaining));remaining=cents(remaining-sale);if(sale>0)s.forcedSales++;s.shortfall=cents(s.shortfall+remaining);
 if(insufficient||s.gate.OUT0!==0||s.reserve>0)s.gate={IN0:Number(s.reserve===0),IN1:Number(insufficient),OUT0:nand(s.reserve===0,insufficient)};
 return {amount,fromReserve,fromCash,sale,unpaid:remaining};
}
// Two distinct movement options are locked before revealing an event.
function prepareMoveImpl(s,first,offset,eventSeed){
 if(s.phase!=='ready'||!s.started||s.route||s.month>=12)return false;
 if(!Number.isInteger(first)||first<1||first>6||!Number.isInteger(offset)||offset<1||offset>5||!Number.isSafeInteger(eventSeed)||eventSeed<0)return false;
 const rawType=TILES[first],need=2-knowledgeVisits(s),forceKnowledge=s.balanceVersion===22&&need>0&&12-s.month<=need,type=s.month===0?'opportunity':forceKnowledge?'learn':rawType==='learn'&&knowledgeVisits(s)>=2?['opportunity','expense','market','salary'][eventSeed%4]:rawType,candidates=TILES.map((t,i)=>t===type?i:-1).filter(i=>i>=0),a=eventSeed%candidates.length,b=(a+1+(offset-1)%(candidates.length-1))%candidates.length;s.route={dice:[first,1+(first-1+offset)%6],destinations:[candidates[a],candidates[b]],eventSeed};return true;
}
export const knowledgeVisits=s=>Math.max(s.answered||0,s.history.filter(r=>r.type==='learn').length);
export const routePosition=(s,i)=>s.route?.destinations?.[i]??(s.position+s.route.dice[i])%TILES.length;
export function routePreview(s,index){const destination=routePosition(s,index),type=TILES[destination];if(type!=='opportunity')return {destination,type};const pool=OPPORTUNITIES.filter(o=>!s.usedOpportunities.includes(o.id)),choices=pool.length?pool:OPPORTUNITIES,seed=s.route.destinations?(s.route.eventSeed+destination*977)>>>0:s.route.eventSeed,o=choices[seed%choices.length];return {destination,type,cost:o.cost,kind:o.kind,locked:['property','fashion','food'].includes(o.kind),payment:o.payment||0,debtAdded:o.debt||0};}
function chooseMoveImpl(s,index){
 if(!s.route||![0,1].includes(index)||s.phase!=='ready')return false;
 const {dice,eventSeed,destinations}=s.route;delete s.route;return rollImpl(s,dice[index],eventSeed,destinations?.[index]);
}
function rollImpl(s,die,eventSeed=0,destination){if(s.phase!=='ready'||!s.started||s.route)return false;if(!Number.isInteger(die)||die<1||die>6)throw Error('Invalid die');if(!Number.isSafeInteger(eventSeed)||eventSeed<0)throw Error('Invalid event seed');
 if(destination!==undefined&&(!Number.isInteger(destination)||destination<0||destination>=TILES.length))return false;s.month++;s.position=destination??(s.position+die)%TILES.length;if(TILES[s.position]==='learn'&&knowledgeVisits(s)>=2)s.position=[1,6,10,15][eventSeed%4];s.dice=die;const level=levelOf(s),monthly={month:s.month,salary:incomeAt(s),living:level.living,surcharge:level.pressure?.[s.month]||0,incomeCut:level.salary-incomeAt(s)};s.cash=cents(s.cash+monthly.salary);monthly.portfolio=monthlyPortfolio(s,eventSeed,level.volatility);monthly.payment=spend(s,level.living+monthly.surcharge,true);
 const installments=[];
 for(const p of s.positions){const due=Math.min(p.debt,p.payment);if(due<=0)continue;const payment=spend(s,due,true);p.debt=cents(p.debt-(due-payment.unpaid));installments.push({id:p.id,...payment});}
 if(s.shortfall>0){const result={type:'expense',eventId:monthly.payment.unpaid>0?'living-shortfall':'installment-shortfall',month:s.month,choice:'auto',installments,monthly,netWorth:netWorth(s),delta:0,unpaid:monthly.payment.unpaid+installments.reduce((a,p)=>a+p.unpaid,0)};result.finances=financialSnapshot(s);s.last=result;s.history.unshift(result);s.pending=null;s.phase='finished';return true;}
 const cardSeed=destination===undefined?eventSeed:(eventSeed+s.position*977)>>>0;const type=TILES[s.position];s.pending={type,variant:cardSeed%3,installments,monthly};
 if(type==='learn'){const pool=questionPool(s);if(s.balanceVersion===22&&pool.every(q=>s.usedQuestions.includes(q.id)))s.usedQuestions=[];const item=draw(pool,s.usedQuestions,cardSeed,false);s.pending.questionId=item?.id||null;s.pending.answerOrder=cardSeed%2;}
 if(type==='salary')s.pending.incomeId=SIDE_JOBS[cardSeed%SIDE_JOBS.length].id;
 if(type==='market')s.pending.marketId=MARKET_STORIES[cardSeed%MARKET_STORIES.length].id;
 if(type==='opportunity')s.pending.eventId=draw(OPPORTUNITIES,s.usedOpportunities,cardSeed).id;
 if(type==='expense')s.pending.eventId=draw(SURPRISES,s.usedSurprises,cardSeed).id;
 s.phase='event';return true;
}
export const financialSnapshot=s=>({cash:s.cash,reserve:s.reserve,investments:s.investments,liquidAssets:sellable(s),lockedAssets:cents(s.positions.filter(p=>p.locked).reduce((n,p)=>n+p.value,0)),debt:debt(s)});
function resolveImpl(s,choice){if(s.phase!=='event')return false;const e=s.pending,before=netWorth(s),timedOut=choice==='timeout';if(timedOut){choice=e.type==='opportunity'?'skip':e.type==='expense'?(surprise(e.eventId)?.optional?'skip':surprise(e.eventId)?.income?'decline':'pay'):e.type==='learn'?'unanswered':['salary','start'].includes(e.type)?'decline':'continue';}let r={type:e.type,choice,month:s.month,variant:e.variant,eventId:e.eventId,questionId:e.questionId,marketId:e.marketId,incomeId:e.incomeId,installments:e.installments||[],monthly:e.monthly||null};
 if(e.type==='opportunity'){const o=e.eventId?opportunity(e.eventId):OPPORTUNITIES[e.variant];r.eventId=o.id;if(choice==='buy'){if(!buy(s,o))return false;r.bought=o.cost;r.debtAdded=o.debt||0;}else if(choice!=='skip')return false;}
 else if(e.type==='expense'){const item=e.eventId?surprise(e.eventId):SURPRISES[e.variant];if(!item)return false;r.eventId=item.id;
  if(item.optional){if(choice==='spend'){if(s.cash<item.cost)return false;s.cash=cents(s.cash-item.cost);s.enjoyment+=item.joy;s.optionalSpent+=item.cost;r.optionalCost=item.cost;r.joy=item.joy;}else if(choice!=='skip')return false;}
  else{if(choice==='decline'&&timedOut&&item.income){r.declinedIncome=item.income;}else {if(choice!=='pay')return false;if(item.income){r.windfall=item.income;s.cash=cents(s.cash+item.income);}else Object.assign(r,spend(s,essentialCost(s,item.cost)));}}
 }else if(e.type==='market'){if(choice!=='continue')return false;r.changes=s.positions.filter(p=>p.value>0).map(p=>{const rate=marketRate(s,marketStory(e.marketId)?.rates[p.kind]??MARKET_RATES[p.kind][e.variant]),change=cents(p.value*rate);p.value=cents(p.value+change);return {id:p.id,kind:p.kind,rate,change};});totals(s);r.change=cents(netWorth(s)-before);}
 else if(e.type==='learn'){
  if(timedOut){r.correct=false;r.unanswered=true;s.answered++;}
  else if(e.questionId===null){if(choice!=='continue')return false;r.review=true;}
  else{if(e.questionId){if(!['answer-0','answer-1'].includes(choice))return false;r.correct=Number(choice.slice(-1))===e.answerOrder;}else{if(!['correct','incorrect'].includes(choice))return false;r.correct=choice==='correct';r.questionId=QUESTIONS[e.variant]?.id;}s.answered++;if(r.correct)s.correctAnswers++;}
 }else if(e.type==='salary'||e.type==='start'){if(choice==='decline'&&timedOut){r.bonus=0;}else {if(choice!=='continue')return false;r.bonus=e.type==='salary'?(e.incomeId?sideJob(e.incomeId).amount:600):300;s.cash+=r.bonus;}}else return false;
 if(timedOut)r.timedOut=true;r.delta=cents(netWorth(s)-before);r.netWorth=netWorth(s);r.finances=financialSnapshot(s);s.last=r;s.history.unshift(r);s.pending=null;s.phase=s.month>=12||s.shortfall>0?'finished':'ready';return true;
}
export function score(s){const wealth=Math.max(0,Math.min(40,Math.round(netWorth(s)/wealthBenchmark(s)*40))),buffer=Math.min(35,Math.round(s.reserve/(levelOf(s).living*3)*35)),liquidity=Math.max(0,15-s.forcedSales*5-(s.shortfall>0?15:0)),knowledge=s.answered?Math.round(s.correctAnswers/s.answered*10):0;return {total:wealth+buffer+liquidity+knowledge,wealth,buffer,liquidity,knowledge};}
export function validSave(s){return !!s&&s.version===VERSION&&Object.hasOwn(LEVELS,s.difficulty||'easy')&&['ready','event','finished'].includes(s.phase)&&Number.isInteger(s.month)&&s.month>=0&&s.month<=12&&Number.isInteger(s.position)&&s.position>=0&&s.position<16&&['cash','reserve','investments','shortfall','forcedSales','correctAnswers','answered','enjoyment','optionalSpent'].every(k=>Number.isFinite(s[k])&&s[k]>=0)&&(!s.route||s.phase==='ready'&&s.started&&Array.isArray(s.route.dice)&&s.route.dice.length===2&&new Set(s.route.dice).size===2&&s.route.dice.every(n=>Number.isInteger(n)&&n>=1&&n<=6)&&Number.isSafeInteger(s.route.eventSeed)&&s.route.eventSeed>=0)&&(!s.route?.destinations||Array.isArray(s.route.destinations)&&s.route.destinations.length===2&&new Set(s.route.destinations).size===2&&s.route.destinations.every(n=>Number.isInteger(n)&&n>=0&&n<16)&&TILES[s.route.destinations[0]]===TILES[s.route.destinations[1]])&&typeof s.started==='boolean'&&Array.isArray(s.positions)&&s.positions.every(p=>typeof p.id==='string'&&Object.hasOwn(MARKET_RATES,p.kind)&&['value','debt','payment'].every(k=>Number.isFinite(p[k])&&p[k]>=0)&&typeof p.locked==='boolean')&&Math.abs(s.investments-s.positions.reduce((a,p)=>a+p.value,0))<.01&&['usedQuestions','usedOpportunities','usedSurprises'].every(k=>Array.isArray(s[k])&&new Set(s[k]).size===s[k].length)&&s.usedQuestions.every(id=>!!question(id))&&Array.isArray(s.history)&&s.history.length===s.month-(s.phase==='event'?1:0)&&s.gate&&[s.gate.IN0,s.gate.IN1,s.gate.OUT0].every(x=>x===0||x===1)&&(s.phase!=='event'||s.pending&&TILES.includes(s.pending.type)&&Number.isInteger(s.pending.variant)&&s.pending.variant>=0&&s.pending.variant<3&&(s.pending.type!=='learn'||s.pending.questionId===null||question(s.pending.questionId)&&[0,1].includes(s.pending.answerOrder))&&(s.pending.type!=='expense'||!!surprise(s.pending.eventId))&&(s.pending.type!=='opportunity'||OPPORTUNITIES.some(o=>o.id===s.pending.eventId)));}
export function restoreGame(saved){
 // Keep existing simulated positions and decisions when updating stock examples.
 if(saved?.version===VERSION){saved=JSON.parse(JSON.stringify(saved),(key,value)=>typeof value==='string'?({fpt:'aapl',vnm:'ko'}[value]||value):value);}
 if(saved?.version===VERSION){saved={difficulty:'easy',runId:null,labMode:'practice',labResult:null,...saved};}
 if(validSave(saved))return saved;if(!saved||saved.version!==1||!['ready','event','finished'].includes(saved.phase)||!Number.isInteger(saved.month)||saved.month<0||saved.month>12||!Array.isArray(saved.history)||saved.history.length!==saved.month-(saved.phase==='event'?1:0)||!['cash','reserve','investments'].every(k=>Number.isFinite(saved[k])&&saved[k]>=0))return null;
 const s={...createGame(),...saved,version:VERSION};if(saved.investments>0)s.positions=[{id:'legacy',kind:'legacy',value:saved.investments,debt:0,payment:0,locked:false}];
 for(const r of s.history){if(r.type==='learn'){r.questionId=QUESTIONS[r.variant||0].id;if(!s.usedQuestions.includes(r.questionId))s.usedQuestions.push(r.questionId);}}
 if(s.pending){const e=s.pending;if(e.type==='learn'){const desired=QUESTIONS[e.variant].id;e.questionId=s.usedQuestions.includes(desired)?QUESTIONS.find(q=>!s.usedQuestions.includes(q.id))?.id||null:desired;e.answerOrder=e.variant===1?1:0;if(e.questionId&&!s.usedQuestions.includes(e.questionId))s.usedQuestions.push(e.questionId);}if(e.type==='opportunity')e.eventId=OPPORTUNITIES[0].id;if(e.type==='expense')e.eventId=SURPRISES[e.variant].id;e.installments=[];}
 return validSave(s)?s:null;
}

// Reproducible experiment log; never influences accounting or random draws.
function recorded(s,op,args,operation){
 if(s._decisionReplay)return operation();
 const initial=s.labTrace?null:structuredClone(s);if(initial)delete initial.labTrace;
 const accepted=operation();if(!accepted)return accepted;
 s.labTrace??={version:1,initial,actions:[],truncated:false,policy:structuredClone(RISK_POLICY),engineBalanceVersion:s.balanceVersion};
 if(s.labTrace.actions.length<256)s.labTrace.actions.push({op,args});else s.labTrace.truncated=true;return accepted;
}
export const manage=(s,a)=>recorded(s,'manage',[a],()=>manageImpl(s,a));
export const prepareMove=(s,a,b,c,now=Date.now())=>{const ok=recorded(s,'prepareMove',[a,b,c],()=>prepareMoveImpl(s,a,b,c));if(ok)armTurn(s,now);return ok;};
export const chooseMove=(s,i)=>recorded(s,'chooseMove',[i],()=>chooseMoveImpl(s,i));
export const roll=(s,d,seed=0,destination)=>recorded(s,'roll',destination===undefined?[d,seed]:[d,seed,destination],()=>rollImpl(s,d,seed,destination));
export const resolve=(s,a)=>{const ok=recorded(s,'resolve',[a],()=>resolveImpl(s,a));if(ok&&!s.route&&s.phase!=='event')delete s.turnDeadline;return ok;};
export function recordGateProof(s,r){
 const a=s.labTrace?.actions?.at(-1);
 if(!a||r?.chainId!==196||r.contract?.toLowerCase()!=='0x4f3b708af365b8f339dd35a8985ffe06c2553400'||r.circuitId!==48||r.method!=='eth_call'||!Number.isInteger(r.blockNumber)||!r.calldata||!r.rawResult)return;
 if(r.IN0!==s.gate.IN0||r.IN1!==s.gate.IN1||r.OUT0!==s.gate.OUT0)return;
 a.proof={IN0:r.IN0,IN1:r.IN1,OUT0:r.OUT0,chainId:196,contract:r.contract,circuitId:48,method:'eth_call',blockNumber:r.blockNumber,calldata:r.calldata,rawResult:r.rawResult,checkedAt:r.checkedAt,source:r.source||'live-read'};
}
