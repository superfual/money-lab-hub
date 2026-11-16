// Native media playback; play() is invoked synchronously in the user's gesture.
export function createMusicPlayback(audio,{onState=()=>{},timeoutMs=10000}={}){
 let state='off',epoch=0,timer=null;
 const update=s=>{state=s;onState(s);};
 const clear=()=>{clearTimeout(timer);timer=null;};
 audio.addEventListener('playing',()=>{if(state==='starting'){clear();update('playing');}else if(state!=='playing')audio.pause();});
 audio.addEventListener('pause',()=>{if(state==='playing'){epoch++;clear();update('paused');}});
 audio.addEventListener('error',()=>{epoch++;clear();audio.pause();update('error');});
 function stop(next='off'){epoch++;clear();audio.pause();update(next);}
 function start(){const ticket=++epoch;clear();update('starting');
  // No await, fetch or decoding before play: preserve iOS user activation.
  let pending;try{pending=audio.play();}catch{update('error');return;}
  timer=setTimeout(()=>{if(ticket===epoch&&state==='starting'){stop('error');}},timeoutMs);
  Promise.resolve(pending).then(()=>{if(ticket!==epoch)return;if(!audio.paused){clear();update('playing');}}).catch(()=>{if(ticket!==epoch)return;clear();audio.pause();update('error');});
 }
 return {get state(){return state;},start,stop,interrupt(){if(state==='playing'||state==='starting')stop('paused');}};
}
