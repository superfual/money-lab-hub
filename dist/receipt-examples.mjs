// Explicit synthetic fixtures for education, never presented as onchain reads.
import {createGame} from './engine.mjs';
import {riskOptions,projectDecision,decisionInput,decisionCommitment,policyCommitment} from './risk-policy.mjs';
import {RISK_POLICY} from './risk-rules.mjs';
import {CIRCUIT,evalData} from './tapeout.mjs';
import {composePolicy} from './decision-lab.mjs';
import {decisionExplanation,sealDecisionReceipt} from './decision-receipt.mjs';
const word=n=>n.toString(16).padStart(64,'0');
export async function illustrativeReceipt(thin=false){const s=createGame('medium');s.started=true;s.runId='illustrative-'+(thin?'thin':'balanced');if(thin){s.cash=1500;s.reserve=500;}
 const proof={...CIRCUIT,owner:CIRCUIT.author,shape:[2,1,0,3],blockNumber:4,netlist:'0x',provenance:'ILLUSTRATIVE_NOT_CHAIN_READ',cases:[[0,0],[0,1],[1,0],[1,1]].map(([IN0,IN1])=>{const OUT0=1-(IN0&IN1);return {IN0,IN1,OUT0,chainId:196,contract:CIRCUIT.address,circuitId:48,method:'eth_call',blockNumber:4,blockTag:'0x4',calldata:evalData(IN0,IN1),rawResult:'0x'+word(32)+word(1)+(OUT0?'01':'00')+'00'.repeat(31)};})};
 const branches=await Promise.all(riskOptions(s).map(o=>projectDecision(s,o)).filter(p=>p.feasible&&p.forecast).map(async p=>({choice:p.option.choice,input:decisionInput(s,p.option),inputHash:await decisionCommitment(s,p.option),policyResult:composePolicy(p.signals,proof),nativeResult:null,explanation:decisionExplanation(p),projection:{cash:p.after.cash,reserve:p.after.reserve,nextKnownSurplus:p.signals.model.after,installments:p.signals.model.installments,income:p.signals.model.income}})));
 return sealDecisionReceipt(s,{source:'illustrative-offline-example',runId:s.runId,month:s.month,policy:RISK_POLICY,policyHash:await policyCommitment(),proof,nativeProof:null,existingGate:proof.cases[0],branches});}
