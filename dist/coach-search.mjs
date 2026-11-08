import {knowledge} from './coach-knowledge.mjs';
export const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const stop=new Set('a an the is are do does i my you your how what when why can to of and in on for co la cua toi ban anh em nhu the nao gi voi ve nay khong duoc thi ma va de nhung cho mot khi o'.split(' '));
export function answer(question,lang='vi',id){
 const q=normalize(question);if(!q||q.length>600)return null;
 if(/\b(seed phrase|private key|khoa rieng|mat khau|mnemonic|password)\b/.test(q))return knowledge.find(x=>x.id==='privacy');
 const exact=knowledge.find(x=>normalize(x.viq)===q||normalize(x.enq)===q);if(exact)return exact;
 if(id)return knowledge.find(x=>x.id===id)||null;
 const words=[...new Set(q.split(' ').filter(x=>x.length>1&&!stop.has(x)))];
 const ranked=knowledge.map(item=>{const title=normalize(item.viq+' '+item.enq),tags=normalize(item.tags),tokens=new Set((title+' '+tags).split(' '));const matches=words.filter(w=>tokens.has(w));return {item,score:matches.reduce((s,w)=>s+(title.split(' ').includes(w)?3:1),0),count:matches.length};}).sort((a,b)=>b.score-a.score);
 const best=ranked[0];return best&&best.score>=3&&(best.count>=2||words.length===1)&&(!ranked[1]||best.score>ranked[1].score)?best.item:null;
}
