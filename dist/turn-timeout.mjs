import {prepareMove,chooseMove,resolve} from './engine.mjs';
import {armTurn,clockActive,turnExpired} from './turn-clock.mjs';
// Called only after the controller has established expiration. No random reroll on reload.
export function timeoutMonth(s,plan){if(!clockActive(s))return false;if(s.phase==='ready'){if(!s.route&&!prepareMove(s,plan.die,plan.offset,plan.eventSeed))return false;if(!chooseMove(s,0))return false;}if(s.phase==='event'&&!resolve(s,'timeout'))return false;return true;}
export function advanceSoloClock(s,now=Date.now(),draw=()=>({die:1,offset:1,eventSeed:crypto.getRandomValues(new Uint32Array(1))[0]})){
 if(!clockActive(s)){const changed=Number.isFinite(s?.turnDeadline);if(s)delete s.turnDeadline;return {changed,expired:0};}if(!Number.isFinite(s.turnDeadline)){armTurn(s,now);return {changed:true,expired:0};}
 let expired=0;while(turnExpired(s,now)&&expired<12){const deadline=s.turnDeadline;if(!timeoutMonth(s,draw()))break;expired++;armTurn(s,deadline);}return {changed:expired>0,expired};
}
