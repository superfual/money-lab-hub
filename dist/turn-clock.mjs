export const TURN_MS=60000;
export const clockActive=s=>!!s?.started&&(s.phase==='event'||!!s.route);
export function armTurn(s,now=Date.now()){if(clockActive(s))s.turnDeadline=now+TURN_MS;else delete s.turnDeadline;}
export const turnExpired=(s,now=Date.now())=>clockActive(s)&&Number.isFinite(s.turnDeadline)&&now>=s.turnDeadline;
export function turnClockHTML(s,lang='vi',serverNow=Date.now()){
 const vi=lang==='vi';if(s?.started&&s.phase!=='finished'&&!clockActive(s))return `<section class="turn-clock waiting"><strong>${vi?'Chưa bắt đầu đếm giờ':'Timer has not started'}</strong><small>${vi?'Đọc tài chính và quản lý vốn trước. Bấm Gieo xúc xắc để bắt đầu 60 giây.':'Review finances and manage funds first. Roll the dice to start 60 seconds.'}</small></section>`;if(!clockActive(s)||!Number.isFinite(s.turnDeadline))return '';return `<section class="turn-clock" role="timer" aria-label="${vi?'Thời gian còn lại của lượt':'Time left in this turn'}" data-turn-deadline="${s.turnDeadline}" data-clock-offset="${serverNow-Date.now()}"><strong>${vi?'Lượt của bạn':'Your turn'} · <span data-turn-seconds>60</span>s</strong><small>${vi?'60 giây từ khi gieo xúc xắc. Hết giờ: bỏ khoản thu/lựa chọn tự nguyện; vẫn chịu chi phí bắt buộc và biến động danh mục.':'60 seconds from the dice roll. Timeout declines optional income/choices; mandatory bills and portfolio changes still apply.'}</small></section>`;
}
export function mountTurnTicker(onExpired){let pending=false,lastAttempt=0;setInterval(async()=>{let expired=false;for(const el of document.querySelectorAll('[data-turn-deadline]')){const left=Math.max(0,Math.ceil((Number(el.dataset.turnDeadline)-Date.now()-Number(el.dataset.clockOffset||0))/1000));el.querySelector('[data-turn-seconds]').textContent=left;el.classList.toggle('urgent',left<=10);if(!left)expired=true;}if(expired&&!pending&&Date.now()-lastAttempt>=2000){lastAttempt=Date.now();pending=true;try{await onExpired();}finally{pending=false;}}},250);}

// Replace the previous clock rather than accumulating expired timers on rerender.
export function renderTurnClock(root,s,lang='vi',serverNow=Date.now()){
 for(const clock of root.querySelectorAll(':scope > .turn-clock'))clock.remove();
 root.insertAdjacentHTML('afterbegin',turnClockHTML(s,lang,serverNow));
}
// Always release the UI lock before rendering, including failed timeout requests.
export function createTimeoutHandler({isBusy,getGame,setBusy,advance,render,onError}){
 return async()=>{
  if(isBusy()||!clockActive(getGame()))return;
  setBusy(true);
  try{await advance();}catch(error){onError(error);}finally{setBusy(false);render();}
 };
}
