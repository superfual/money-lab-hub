import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dictionary,translateText as zh} from '../dist/locales/zh-CN.mjs';
import {QUESTIONS,OPPORTUNITIES,SURPRISES,MARKET_STORIES,SIDE_JOBS} from '../dist/events.mjs';
import {answer} from '../dist/coach-search.mjs';
test('Chinese covers every World 1 teaching card and its answer/explanation',()=>{
 for(const list of [QUESTIONS,OPPORTUNITIES,SURPRISES,MARKET_STORIES,SIDE_JOBS||[]])for(const card of list)for(const text of card.en||[]){if(!/[A-Za-z]{3}/.test(text))continue;assert.ok(dictionary[text],card.id+': '+text);assert.match(zh(text),/[\u3400-\u9fff]/);}
});
test('Chinese financial and clock templates preserve the actual numeric values',()=>{
 const input='Start with $8,500: $6,500 cash and $2,000 reserve. Medium has base salary $1,700 and $1,550 monthly living costs.';
 const output=zh(input);assert.match(output,/中等/);assert.doesNotMatch(output,/Start with|base salary/);assert.deepEqual(output.match(/\$[\d,]+/g),input.match(/\$[\d,]+/g));assert.equal(zh('Your turn · 51s'),'轮到你了 · 51秒');assert.equal(zh('Month 12 / 12'),'月份 12 / 12');
});
test('Chinese preserves identifiers, RPC calldata, values and protocol names',()=>{
 const source='REF #49 · NAND(R,C): 1, 1 → 0 · 0x1839231f7fc0d55a3ec58736574aca13f711326d';assert.equal(zh(source),source);
 assert.equal(zh('HUB · OKB · R/C/D · 0x934d06ea'), 'HUB · OKB · R/C/D · 0x934d06ea');
});
test('Chinese Coach retrieves documented topics and protects secret questions',()=>{
 assert.equal(answer('什么时候开始计时？','en')?.id,'timer');assert.equal(answer('回放会改变结果吗？','en')?.id,'replay');assert.equal(answer('主网需要多少gas？','en')?.id,'mainnet');assert.equal(answer('这是我的私钥','en')?.id,'privacy');assert.equal(answer('预测明天涨多少','en'),null);
});
test('all public HTML entrypoints load the locale bootstrap before application modules',()=>{
 for(const name of fs.readdirSync(new URL('../dist/',import.meta.url)).filter(x=>x.endsWith('.html'))){const html=fs.readFileSync(new URL('../dist/'+name,import.meta.url),'utf8');assert.ok(html.includes('locale-bootstrap.mjs'),name);assert.ok(html.indexOf('locale-bootstrap.mjs')<html.indexOf('</head>'),name);}
 const runtime=fs.readFileSync(new URL('../dist/locale-bootstrap.mjs',import.meta.url),'utf8');assert.match(runtime,/pre,code,textarea,input/);assert.doesNotMatch(runtime,/localStorage\.clear\(|removeItem|\.value\s*=/);
});
