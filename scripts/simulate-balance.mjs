import fs from 'node:fs';
import {createGame,prepareMove,chooseMove,resolve,manage,score,netWorth,sellable,monthlyPayment,routePreview} from '../dist/engine.mjs';
import {LEVELS,incomeAt,levelOf} from '../dist/levels.mjs';
import {duelSchedule} from '../dist/duel-core.mjs';
import {opportunity,surprise} from '../dist/events.mjs';
const count=Number(process.argv[2]||2000),output=process.argv[3]||'/tmp/moneylab-balance.json',rules=process.argv[4]==='21'?21:22,seedStart=Number(process.argv[5]||1);
const policies=['cash','reserve','concentrated','diversified'];
const hash=n=>{n=Math.imul(n^(n>>>16),0x7feb352d);n=Math.imul(n^(n>>>15),0x846ca68b);return (n^(n>>>16))>>>0;};
const mean=a=>a.reduce((n,x)=>n+x,0)/a.length,round=n=>Math.round(n*100)/100;
const results=[];
for(const level of Object.keys(LEVELS))for(const policy of policies){const rows=[];for(let seed=seedStart;seed<seedStart+count;seed++){const s=createGame(level);s.balanceVersion=rules;s.started=true;const l=levelOf(s);let quiz=0;
for(let m=1;m<=12&&s.phase!=='finished';m++){
 const target=policy==='cash'?0:l.living*(policy==='reserve'?3:policy==='diversified'?2:1);
 let guard=0;while(s.reserve+499<target&&s.cash>=1000&&guard++<30)manage(s,'reserve');
 if(policy==='diversified'){const nextDue=l.living+(l.pressure[m]||0)+monthlyPayment(s),gap=nextDue-incomeAt(s,m)-s.cash;let tries=0;while(gap>0&&s.cash+incomeAt(s,m)<nextDue&&sellable(s)>0&&tries++<20)manage(s,'sell');}
 const p=duelSchedule(seed,m);prepareMove(s,p.die,p.offset,p.eventSeed);let route=0;
 if(rules===22&&['diversified','concentrated'].includes(policy)){const values=s.route.dice.map((_,i)=>{const o=routePreview(s,i);if(o.type!=='opportunity')return 0;return policy==='concentrated'?(o.kind==='crypto'?4:0):(o.locked?-2:2)+(s.cash>=o.cost?1:-4);});route=values[1]>values[0]?1:0;}
 chooseMove(s,route);if(s.phase==='finished')break;const e=s.pending;let action;
 if(e.type==='learn'){if(e.questionId===null)action='continue';else{const correct=hash(seed*131+(++quiz)*911)%4!==0;action='answer-'+(correct?e.answerOrder:1-e.answerOrder);}}
 else if(e.type==='opportunity'){const o=opportunity(e.eventId),same=s.positions.filter(x=>x.kind===o.kind).reduce((n,x)=>n+x.value,0),budget=s.cash-o.cost,near=l.living+(l.pressure[Math.min(12,m+1)]||0)+monthlyPayment(s)+(o.payment||0)-incomeAt(s,Math.min(12,m+1));const buy=policy==='concentrated'?o.kind==='crypto'&&budget>=500:policy==='diversified'&&budget>=Math.max(1000,near+1000)&&s.reserve>=l.living&&same+o.cost<=Math.max(2500,netWorth(s)*.35);action=buy?'buy':'skip';}
 else if(e.type==='expense')action=surprise(e.eventId).optional?'skip':'pay';else action='continue';
 if(!resolve(s,action))throw Error(`Rejected ${action} for ${e.type}`);
}
const sc=score(s).total,survived=s.month===12&&s.shortfall===0,won=survived&&sc>=l.target,reward=won?l.rewardBase+Math.floor((sc-l.target)/5)*l.rewardStep:0;rows.push({points:sc,survived,won,month:s.month,questions:s.answered,net:netWorth(s),reward,hubNet:reward-(won?0:l.bond),forced:s.forcedSales});}
const p=mean(rows.map(x=>Number(x.won))),z=1.96,den=1+z*z/count,center=(p+z*z/(2*count))/den,margin=z*Math.sqrt(p*(1-p)/count+z*z/(4*count*count))/den,survivors=rows.filter(x=>x.survived);results.push({level,policy,n:count,winPct:round(p*100),winInterval95Pct:[round(Math.max(0,center-margin)*100),round(Math.min(1,center+margin)*100)],survivalPct:round(mean(rows.map(x=>Number(x.survived)))*100),meanPoints:round(mean(rows.map(x=>x.points))),meanNetWorth:round(mean(rows.map(x=>x.net))),meanHubNet:round(mean(rows.map(x=>x.hubNet))),survivorTwoQuestionsPct:round(mean(survivors.map(x=>Number(x.questions===2)))*100),zeroQuestionsPct:round(mean(rows.map(x=>Number(x.questions===0)))*100),oneQuestionPct:round(mean(rows.map(x=>Number(x.questions===1)))*100),meanForcedSales:round(mean(rows.map(x=>x.forced)))});}
const report={rulesVersion:rules,seedRange:[seedStart,seedStart+count-1],runs:count*policies.length*3,assumptions:['Pure offline game-engine simulation; no RPC, wallets, server profiles or real HUB touched.','Same monthly schedules across policies; quiz answers are deterministically 75% correct per question in expectation.','Policies are fixed heuristics, not optimal agents or observed human behavior.','One isolated stage per run; stage eligibility and initial 80 HUB excluded. HUB net uses normal solo bond/reward rules.','No optional purchases; route zero in baseline; concentrated/diversified policies may use visible route metadata in v22.','95% Wilson intervals summarize seed sampling only, not model realism.'],results};fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
