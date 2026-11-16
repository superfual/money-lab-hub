import fs from 'node:fs';
const data=fs.readFileSync(new URL('../dist/locales/zh-CN.tsv',import.meta.url),'utf8');const entries=data.split('\n').filter(Boolean).map(line=>{const i=line.indexOf('\t');if(i<1)throw Error('Invalid Chinese locale entry: '+line);return [line.slice(0,i),line.slice(i+1)];});const dictionary=Object.fromEntries(entries);
fs.writeFileSync(new URL('../dist/locales/zh-CN.mjs',import.meta.url),`// Generated from zh-CN.tsv. Do not change financial inputs or receipt values here.\nexport const dictionary=${JSON.stringify(dictionary,null,2)};\n`+fs.readFileSync(new URL('./zh-locale-runtime.txt',import.meta.url),'utf8'));
console.log('Chinese locale: '+Object.keys(dictionary).length+' reviewed strings');
