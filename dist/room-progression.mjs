import {unlocked} from './hub.mjs';
import {matchStake} from './competition.mjs';
const levels=['easy','medium','hard'];
// Advance one stage only when every current member can enter it after settlement.
export function roomProgression(current,members){
 const higher=levels[levels.indexOf(current)+1]||null;
 const blocked=higher?members.flatMap((m,seat)=>{const locked=!unlocked(m.hub,higher),missingHub=Math.max(0,matchStake(higher)-m.hub.balance);return locked||missingHub?[{seat,name:m.name,locked,missingHub}]:[];}):[];
 const advance=!!higher&&members.length>=2&&!blocked.length;
 return {current,higher,level:advance?higher:current,advance,stake:matchStake(advance?higher:current),blocked};
}
export function progressionHTML(p,lang){if(!p)return '';const vi=lang==='vi',label={easy:vi?'Dễ':'Easy',medium:vi?'Trung bình':'Medium',hard:vi?'Khó':'Hard'},esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return `<div class="room-progression"><h3>${vi?'Trận tiếp theo · Cùng phòng':'Next match · Same room'}</h3><p>${p.advance?(vi?`Tất cả đã đủ điều kiện. Cả phòng cùng lên ${label[p.level]}.`:`Everyone qualifies. The whole room advances to ${label[p.level]}.`):p.higher?(vi?`Tiếp tục ${label[p.current]} đến khi tất cả đủ điều kiện lên ${label[p.higher]}.`:`Stay on ${label[p.current]} until everyone qualifies for ${label[p.higher]}.`):(vi?'Đã ở cấp Khó. Cả phòng có thể tiếp tục thử thách tại đây.':'Already on Hard. The room can keep playing here.')}</p>${p.blocked.length?`<ul>${p.blocked.map(m=>`<li>${esc(m.name)}: ${[m.locked?(vi?'chưa thắng chặng Hub cần thiết':'required Hub stage not yet cleared'):'',m.missingHub?(vi?`còn thiếu ${m.missingHub} HUB để đủ cược`:`needs ${m.missingHub} more HUB for the stake`):''].filter(Boolean).join(' · ')}</li>`).join('')}</ul>`:''}<p>${vi?'Cược trận dự kiến':'Planned stake'}: <b>${p.stake} HUB/${vi?'người':'player'}</b>. ${vi?'Giữ nguyên phòng, người chơi và số dư sau kết toán. Chỉ khóa cược khi bắt đầu trận.':'The room, players and settled balances stay intact. Stakes lock only when the match starts.'}</p></div>`;
}
