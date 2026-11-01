// Fictional local HUB only. No wallet, token transfer or real-money value.
import {LEVELS} from './levels.mjs';
import {score,netWorth} from './engine.mjs';
export const matchStake=level=>level==='easy'?10:LEVELS[level]?.bond;
export const hubCleared=s=>s?.phase==='finished'&&!s.competitionAbandoned&&s.month===12&&s.shortfall===0&&score(s).total>=LEVELS[s.difficulty].target;
export function comparePlayers(a,b){return score(b.game).total-score(a.game).total||netWorth(b.game)-netWorth(a.game)||b.game.reserve-a.game.reserve;}
export function competitionPlan(players,stake,carry=0){
 if(!Number.isSafeInteger(stake)||stake<0||stake%2!==0||!Number.isSafeInteger(carry)||carry<0||players.length<2)throw Error('Invalid competition');
 const quota=Math.ceil(players.length/2),eligible=players.map((p,index)=>({...p,index})).filter(p=>hubCleared(p.game)).sort(comparePlayers);
 let winners=eligible.slice(0,quota).map(p=>p.index),draws=[];
 if(eligible.length>quota&&comparePlayers(eligible[quota-1],eligible[quota])===0){const boundary=eligible[quota-1];draws=eligible.filter(p=>comparePlayers(p,boundary)===0).map(p=>p.index);winners=winners.filter(i=>!draws.includes(i));}
 const losers=players.map((_,i)=>i).filter(i=>!winners.includes(i)&&!draws.includes(i));
 const losingPot=losers.length*stake,treasury=losingPot/2,newPrize=losingPot-treasury,pool=newPrize+carry;
 const allocations=players.map(()=>0);
 if(winners.length){const total=winners.reduce((n,i)=>n+score(players[i].game).total,0);const weights=winners.map(i=>{const exact=pool*score(players[i].game).total/total;return {i,base:Math.floor(exact),fraction:exact-Math.floor(exact)};});let remaining=pool-weights.reduce((n,x)=>n+x.base,0);weights.sort((a,b)=>b.fraction-a.fraction||a.i-b.i);for(const x of weights){allocations[x.i]=x.base+(remaining>0?1:0);remaining--;}}
 return {quota,winners,draws,losers,losingPot,treasury,prizePool:pool,carryIn:carry,carryOut:winners.length?0:pool,rows:players.map((p,i)=>({index:i,points:score(p.game).total,hubWon:hubCleared(p.game),status:winners.includes(i)?'won':draws.includes(i)?'draw':'lost',stake,refund:losers.includes(i)?0:stake,betReward:allocations[i],betLoss:losers.includes(i)?stake:0,hubReward:p.game.labResult?.reward||0}))};
}
