import {RISK_POLICY,canonicalJSON} from './risk-rules.mjs';
import {manage,prepareMove,chooseMove,roll,resolve,netWorth,score,validSave,createGame} from './engine.mjs';
import {opportunity,surprise} from './events.mjs';
import {CIRCUIT,evalData,decodeBytes} from './tapeout.mjs';
const commands={manage,prepareMove,chooseMove,roll,resolve};
export const decisionFingerprint=s=>JSON.stringify(Object.fromEntries(Object.entries(s).filter(([k])=>!['labTrace','labResult'].includes(k))));
function replayState(trace){if(trace?.version!==1||trace.truncated||!Array.isArray(trace.actions)||trace.actions.length>256||!validSave(trace.initial))throw Error('TRACE_UNAVAILABLE');const s=structuredClone(trace.initial);delete s.labTrace;Object.defineProperty(s,'_decisionReplay',{value:true});return s;}
function apply(s,a){if(!Object.hasOwn(commands,a?.op)||!Array.isArray(a.args)||a.args.length>3)return false;try{return commands[a.op](s,...a.args);}catch{return false;}}
export function replay(trace,override=null){
 const s=replayState(trace),timeline=[],initialMonth=s.month;let stopped=null,changed=false,before=null,after=null;
 const point=()=>{const p={month:s.month,netWorth:netWorth(s),liquid:s.cash+s.reserve,reserve:s.reserve,shortfall:s.shortfall};const old=timeline.findIndex(x=>x.month===s.month);if(old>=0)timeline[old]=p;else timeline.push(p);};point();
 for(let i=0;i<trace.actions.length;i++){
  if(s.phase==='finished'){stopped={index:i,reason:'ENDED_EARLY'};break;}
  const a=trace.actions[i];if(override&&i===override.index){before=structuredClone(s);if(override.choice!=='hold'&&!apply(s,{...a,args:[override.choice]})){stopped={index:i,reason:'ALTERNATIVE_INVALID'};break;}changed=true;after=structuredClone(s);}
  else if(!apply(s,a)){stopped={index:i,reason:'RECORDED_ACTION_INVALID'};break;}
  point();
 }
 return {game:s,timeline,stopped,changed,before,after,initialMonth};
}
export function choices(trace){
 const s=replayState(trace),list=[];
 for(let index=0;index<trace.actions.length;index++){
  const a=trace.actions[index];if(a.op==='resolve'&&s.phase==='event'){
   const p=s.pending,item=p.type==='opportunity'?opportunity(p.eventId):p.type==='expense'?surprise(p.eventId):null;
   if(p.type==='opportunity'||p.type==='expense'&&item?.optional){const accepted=p.type==='opportunity'?'buy':'spend';list.push({index,month:s.month,kind:p.type,eventId:p.eventId,original:a.args[0],alternative:a.args[0]===accepted?'skip':accepted,title:item?{vi:item.vi[0],en:item.en[0]}:{vi:'Quyết định',en:'Decision'},proof:a.proof||null});}
  }else if(a.op==='manage')list.push({index,month:s.month,kind:'management',original:a.args[0],alternative:'hold',title:{vi:'Điều chỉnh vốn',en:'Capital adjustment'},proof:a.proof||null});
  if(!apply(s,a))throw Error('TRACE_INVALID');
 }
 return list;
}
export function comparison(game,index){
 const trace=game.labTrace;if(trace?.policy&&canonicalJSON(trace.policy)!==canonicalJSON(RISK_POLICY))throw Error('POLICY_VERSION_MISMATCH');const baseline=replay(trace);if(baseline.stopped||decisionFingerprint(baseline.game)!==decisionFingerprint(game))throw Error('TRACE_MISMATCH');
 const choice=choices(trace).find(x=>x.index===index);if(!choice)throw Error('CHOICE_UNAVAILABLE');const alternative=replay(trace,{index,choice:choice.alternative});
 const metrics=s=>({month:s.month,netWorth:netWorth(s),liquid:s.cash+s.reserve,reserve:s.reserve,forcedSales:s.forcedSales,shortfall:s.shortfall,score:score(s).total});
 const reference=replay(trace,{index,choice:choice.original});
 return {choice,baseline,reference,alternative,actual:metrics(baseline.game),whatIf:metrics(alternative.game),sameHorizon:baseline.game.month===alternative.game.month};
}
export {policySignals} from './risk-policy.mjs';
export function composePolicy(signals,proof){
 if(proof?.chainId!==196||proof.address?.toLowerCase()!==CIRCUIT.address||proof.id!==48||proof.owner?.toLowerCase()!==CIRCUIT.author||proof.shape?.join(',')!=='2,1,0,3'||!Number.isInteger(proof.blockNumber))throw Error('PROOF_INVALID');
 const cases=proof.cases;if(!Array.isArray(cases)||cases.length!==4)throw Error('PROOF_INVALID');
 for(const [a,b] of [[0,0],[0,1],[1,0],[1,1]]){const r=cases.find(c=>c.IN0===a&&c.IN1===b);if(!r||r.OUT0!==(a&&b?0:1)||r.blockNumber!==proof.blockNumber||r.method!=='eth_call'||r.chainId!==196||r.contract?.toLowerCase()!==CIRCUIT.address||r.circuitId!==48||r.calldata!==evalData(a,b)||decodeBytes(r.rawResult)!==(r.OUT0?'0x01':'0x00'))throw Error('PROOF_INVALID');}
 if(![signals.reserve,signals.coverage,signals.installments].every(n=>n===0||n===1))throw Error('INPUT_INVALID');
 const nodes=[],nand=(name,a,b)=>{const r=cases.find(c=>c.IN0===a&&c.IN1===b);nodes.push({name,IN0:a,IN1:b,OUT0:r.OUT0,receipt:r});return r.OUT0;};
 const n1=nand('NAND(R,C)',signals.reserve,signals.coverage),n2=nand('AND(R,C)',n1,n1),n3=nand('NAND(RC,D)',n2,signals.installments),output=nand('AND(R,C,D)',n3,n3);
 return {schema:'moneylab.tapeout-policy.v1',chainId:196,contract:CIRCUIT.address,circuitId:48,blockNumber:proof.blockNumber,signals:{reserve:signals.reserve,coverage:signals.coverage,installments:signals.installments},nodes,output,scope:'Offchain composition using four actual truth-table eth_call receipts at one block. No new circuit is deployed. Thresholds and financial inputs are computed by the game, not attested by TapeOut. Advisory only; does not change rewards.'};
}
export function exampleGame(){
 const s=createGame('medium');s.started=true;s.runId='decision-lab-example';s.labMode='practice';let bought=false,step=0;
 while(s.phase!=='finished'&&step++<90){if(s.phase==='ready'){if(s.route)chooseMove(s,0);else prepareMove(s,1+(s.month*3)%6,1+(s.month%5),(s.month*7717+21)>>>0);}else if(s.pending.type==='opportunity'){const o=opportunity(s.pending.eventId),can=!bought&&o.cost<=s.cash&&s.gate.OUT0===1;if(can){resolve(s,'buy');bought=true;}else resolve(s,'skip');}else if(s.pending.type==='expense'){const e=surprise(s.pending.eventId);resolve(s,e.optional?'skip':'pay');}else if(s.pending.type==='learn')resolve(s,s.pending.questionId?'answer-'+s.pending.answerOrder:'continue');else resolve(s,'continue');}
 return s;
}
