import {knowledge} from './coach-knowledge.mjs';
export const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const stop=new Set('a an the is are do does i my you your how what when why can to of and in on for co la cua toi ban anh em nhu the nao gi voi ve nay khong duoc thi ma va de nhung cho mot khi o'.split(' '));
export function answer(question,lang='vi',id){
 const chinese=String(question);if(/[\u3400-\u9fff]/.test(chinese)){
  if(/助记词|私钥|密码/.test(chinese))return knowledge.find(x=>x.id==='privacy');
  if(id)return knowledge.find(x=>x.id===id)||null;
  const topics={start:['如何开始','开始游戏','怎么玩','玩法'],timer:['计时','倒计时','超时','秒','时限'],hub:['HUB','真钱','积分'],tapeout:['TapeOut','电路','规则','验证','逻辑'],replay:['回放','重放','Replay'],cash:['现金','净资产','流动性','储备','现金流'],blocked:['不能投资','无法投资','停止信号'],worlds:['世界2','世界3','World 2','World 3','土地'],multiplayer:['多人','双人','房间','朋友','升级'],settlement:['结算','交易回执','上链'],privacy:['删除','隐私','历史'],mainnet:['主网','gas','钱包','OKB']};
  const matches=Object.entries(topics).map(([key,words])=>({key,score:words.filter(w=>chinese.toLowerCase().includes(w.toLowerCase())).reduce((n,w)=>n+w.length,0)})).sort((a,b)=>b.score-a.score);
  return matches[0].score>0&&matches[0].score>(matches[1]?.score||0)?knowledge.find(x=>x.id===matches[0].key):null;
 }
 const q=normalize(question);if(!q||q.length>600)return null;
 if(/\b(seed phrase|private key|khoa rieng|mat khau|mnemonic|password)\b/.test(q))return knowledge.find(x=>x.id==='privacy');
 const exact=knowledge.find(x=>normalize(x.viq)===q||normalize(x.enq)===q);if(exact)return exact;
 if(id)return knowledge.find(x=>x.id===id)||null;
 const words=[...new Set(q.split(' ').filter(x=>x.length>1&&!stop.has(x)))];
 const ranked=knowledge.map(item=>{const title=normalize(item.viq+' '+item.enq),tags=normalize(item.tags),tokens=new Set((title+' '+tags).split(' '));const matches=words.filter(w=>tokens.has(w));return {item,score:matches.reduce((s,w)=>s+(title.split(' ').includes(w)?3:1),0),count:matches.length};}).sort((a,b)=>b.score-a.score);
 const best=ranked[0];return best&&best.score>=3&&(best.count>=2||words.length===1)&&(!ranked[1]||best.score>ranked[1].score)?best.item:null;
}
