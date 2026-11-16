import {createMusicPlayback} from './music-playback.mjs?v=2';
// Original motif rendered to MP3. Native playback also works without AudioContext.
export function mountSoundtrack(getState=()=>null){
 if(document.querySelector('.soundtrack-dock'))return;
 let volume=.18;try{const stored=Number(localStorage.getItem('moneyLabMusicVolume')||.18);volume=Number.isFinite(stored)?Math.max(0,Math.min(.4,stored)):.18;}catch{}
 const dock=document.createElement('div');dock.className='soundtrack-dock';dock.innerHTML='<button type="button" aria-pressed="false"></button><small>♪ 96 BPM</small><input type="range" min="0" max="40" step="1"><span class="music-status" role="status" aria-live="polite"></span>';document.body.append(dock);
 const button=dock.querySelector('button'),slider=dock.querySelector('input'),status=dock.querySelector('.music-status');
 const audio=document.createElement('audio');audio.loop=true;audio.preload='none';audio.setAttribute('playsinline','');audio.hidden=true;dock.append(audio);slider.value=String(Math.round(volume*100));
 const t=(vi,en)=>document.documentElement.lang==='vi'?vi:en;let hardwareVolume=false;
 const player=createMusicPlayback(audio,{onState:labels});
 function labels(){const state=player.state;button.textContent=state==='playing'?t('Ⅱ Tắt nhạc nền','Ⅱ Music off'):state==='starting'?t('Đang mở nhạc…','Starting music…'):state==='paused'?t('▶ Tiếp tục nhạc','▶ Resume music'):t('♫ Bật nhạc nền','♫ Music on');button.setAttribute('aria-pressed',String(state==='playing'));button.setAttribute('aria-busy',String(state==='starting'));slider.setAttribute('aria-label',t('Âm lượng nhạc nền','Background music volume'));dock.setAttribute('aria-label',t('Nhạc nền chinh phục bản đồ','Map challenge soundtrack'));
 status.textContent=state==='error'?t('Chưa phát được. Chạm bật lại; kiểm tra âm lượng phương tiện hoặc mở bằng Safari/Chrome.','Could not play. Tap again; check media volume or open in Safari/Chrome.'):state==='paused'?t('Âm thanh đã tạm dừng. Chạm để tiếp tục.','Audio paused. Tap to resume.'):hardwareVolume?t('Dùng nút âm lượng trên điện thoại.','Use your phone volume buttons.'):'';
 }
 function applyVolume(){audio.muted=volume===0;try{audio.volume=volume;hardwareVolume=Math.abs(audio.volume-volume)>.01;}catch{hardwareVolume=true;}slider.disabled=hardwareVolume;}
 button.onclick=()=>{if(player.state==='playing'||player.state==='starting'){player.stop();return;}
  try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch{}
  const kind=getState()?.difficulty==='hard'?'hard':'calm',src=new URL('./assets/moneylab-music-'+kind+'-v1.mp3',import.meta.url).href;if(audio.src!==src)audio.src=src;
  applyVolume();player.start();
 };
 slider.oninput=()=>{volume=Number(slider.value)/100;applyVolume();labels();try{localStorage.setItem('moneyLabMusicVolume',String(volume));}catch{}};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)player.interrupt();});window.addEventListener('pagehide',()=>player.interrupt());new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});labels();
}
