// Restrict reset to Money Lab gameplay; preserve language and unrelated storage.
export const PROGRESS_KEYS=['moneyLabHub.v1','moneyLabBoard.v1','moneyLabDuet.v1'];
export const RESET_KEY='moneyLabResetEpoch.v1';
export function clearProgress(storage,epoch){
 const before=PROGRESS_KEYS.map(key=>[key,storage.getItem(key)]);
 try{for(const key of PROGRESS_KEYS)storage.removeItem(key);storage.setItem(RESET_KEY,epoch);}
 catch(error){for(const [key,value] of before){try{if(value===null)storage.removeItem(key);else storage.setItem(key,value);}catch{}}throw error;}
}
export function mountProgressReset(){
 const host=document.querySelector('#progressReset');if(!host)return;
 host.innerHTML='<button type="button" class="reset-all-button" id="resetAllButton"></button><dialog id="resetAllDialog" aria-labelledby="resetAllTitle"><h2 id="resetAllTitle"></h2><p id="resetAllDescription"></p><p class="reset-error" id="resetAllError" role="alert"></p><button type="button" class="secondary" id="cancelResetAll" autofocus></button><button type="button" class="danger-button" id="confirmResetAll"></button></dialog>';
 const dialog=host.querySelector('dialog'),text=(id,value)=>host.querySelector('#'+id).textContent=value;
 function translate(){const vi=document.documentElement.lang!=='en';text('resetAllButton',vi?'Xóa toàn bộ tiến độ':'Reset all progress');text('resetAllTitle',vi?'Chơi lại từ đầu?':'Start completely over?');text('resetAllDescription',vi?'Thao tác này xóa vĩnh viễn toàn bộ tiến độ Money Lab trên trình duyệt này: ván đang chơi, các ván cũ, điểm, HUB, cấp đã mở và lịch sử câu hỏi — gồm cả solo và các hồ sơ duet/nhóm và công quỹ giả lập. Hồ sơ mới bắt đầu ở cấp Dễ với 80 HUB; Trung bình và Khó khóa lại. Không thể hoàn tác. Tùy chọn ngôn ngữ và tài sản trong ví Web3 không bị ảnh hưởng.':'This permanently deletes all Money Lab progress in this browser: the active game, past stages, scores, HUB, unlocked levels and question history — including solo and all duet/group profiles and the fictional treasury. New profiles start on Easy with 80 HUB; Medium and Hard are locked again. This cannot be undone. Language preferences and assets in your Web3 wallet are unaffected.');text('cancelResetAll',vi?'Hủy, giữ tiến độ':'Cancel, keep progress');text('confirmResetAll',vi?'Xóa tất cả & nhận lại 80 HUB':'Delete everything & restart with 80 HUB');}
 translate();new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 host.querySelector('#resetAllButton').onclick=()=>{text('resetAllError','');translate();dialog.showModal();};host.querySelector('#cancelResetAll').onclick=()=>dialog.close();
 host.querySelector('#confirmResetAll').onclick=()=>{try{clearProgress(localStorage,crypto.randomUUID());location.assign('./');}catch{const vi=document.documentElement.lang!=='en';text('resetAllError',vi?'Không xóa được dữ liệu trình duyệt. Tiến độ chưa được đặt lại; hãy kiểm tra quyền lưu trữ rồi thử lại.':'Browser storage could not be reset. Progress was not reset; check storage permissions and retry.');}};
 // Other tabs running this version must not write an old game back after reset.
 window.addEventListener('storage',event=>{if(event.key===RESET_KEY&&event.newValue)location.reload();});
}
