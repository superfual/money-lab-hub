// Versioned educational policy. USD game finances and HUB balances are separate.
export const RISK_POLICY=Object.freeze({id:'moneylab-risk-1',version:1,engineBalanceVersion:22,currency:'simulated-USD',reserveMonths:1,installmentBps:3000,logic:'R AND C AND D',enforcement:'advisory; existing STOP gate remains binding',circuit:Object.freeze({chainId:196,processor:'0x4f3b708af365b8f339dd35a8985ffe06c2553400',id:48}),thresholdAuthority:'Money Lab educational rules, not financial safety standards'});
export const canonicalJSON=value=>JSON.stringify(normalize(value));
function normalize(v){if(v===null||typeof v!=='object')return v;if(Array.isArray(v))return v.map(normalize);return Object.fromEntries(Object.keys(v).sort().map(k=>[k,normalize(v[k])]));}
export const policyText=()=>canonicalJSON(RISK_POLICY);
export async function sha256(text){if(!globalThis.crypto?.subtle)return (await import('./crypto-hash.mjs')).digest(text);const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return '0x'+Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');}
