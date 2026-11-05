import test from 'node:test';
import assert from 'node:assert/strict';
import {renderTurnClock,createTimeoutHandler} from '../dist/turn-clock.mjs';

test('rerenders retain exactly one current timer and remove expired clocks at finish',()=>{
 const clocks=[];const root={querySelectorAll:()=>[...clocks],insertAdjacentHTML(position,html){if(html)clocks.push({html,remove(){clocks.splice(clocks.indexOf(this),1);}});}};
 // Includes stale duplicate timers from the reported failure.
 for(let i=0;i<5;i++)root.insertAdjacentHTML('afterbegin','expired');
 for(let month=1;month<=12;month++){
  renderTurnClock(root,{started:true,phase:'event',turnDeadline:month*60000},'vi',0);
  assert.equal(clocks.length,1);assert.ok(clocks[0].html.includes(`data-turn-deadline="${month*60000}"`));
 }
 renderTurnClock(root,{started:true,phase:'finished'},'vi');assert.equal(clocks.length,0);
});

test('timeout unlocks controls before rendering and allows the next player action',async()=>{
 let busy=false,month=6,calls=0;const rendered=[];let release;
 const handler=createTimeoutHandler({isBusy:()=>busy,getGame:()=>({started:true,phase:'event'}),setBusy:v=>{busy=v;},advance:async()=>{calls++;await new Promise(r=>{release=r;});month++;},render:()=>rendered.push({busy,month}),onError:e=>{throw e;}});
 const first=handler();assert.equal(busy,true);await handler();assert.equal(calls,1);release();await first;
 assert.deepEqual(rendered,[{busy:false,month:7}]);assert.equal(busy,false);
});

test('timeout request failures recover controls; finished or absent games never submit',async()=>{
 let busy=false,game={started:true,phase:'event'},calls=0,error;
 const handler=createTimeoutHandler({isBusy:()=>busy,getGame:()=>game,setBusy:v=>{busy=v;},advance:async()=>{calls++;throw Error('network');},render:()=>assert.equal(busy,false),onError:e=>{error=e.message;}});
 await handler();assert.equal(error,'network');assert.equal(busy,false);
 game.phase='finished';await handler();game=null;await handler();assert.equal(calls,1);
});
