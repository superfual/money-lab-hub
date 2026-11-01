import {TESTNET} from './testnet-shared.mjs';
export async function bounded(operation,label,ms=20000){let timer;try{return await Promise.race([Promise.resolve().then(operation),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('TIMEOUT:'+label)),ms);})]);}finally{clearTimeout(timer);}}
export async function testnetRead(method,params=[],fetcher=fetch,ms=12000){
 if(!['eth_chainId','eth_getCode','eth_estimateGas','eth_gasPrice','eth_getBalance'].includes(method))throw Error('READ_ONLY_RPC');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),ms);
 try{const r=await bounded(()=>fetcher(TESTNET.rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:controller.signal}),method,ms);const d=await bounded(()=>r.json(),method,ms);if(!r.ok||d.error||d.result===undefined)throw Error('RPC_FAILED:'+method);return d.result;}finally{clearTimeout(timer);}
}
