import {MAINNET} from './mainnet-shared.mjs';
export async function bounded(operation,label,ms=20000){let timer;try{return await Promise.race([Promise.resolve().then(operation),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('TIMEOUT:'+label)),ms);})]);}finally{clearTimeout(timer);}}
export async function mainnetRead(method,params=[],fetcher=fetch,ms=12000){
 if(!['eth_chainId','eth_call','eth_getCode','eth_estimateGas','eth_gasPrice','eth_getBalance','eth_getTransactionCount','eth_getTransactionReceipt','eth_blockNumber'].includes(method))throw Error('READ_ONLY_RPC');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),ms);
 try{const r=await bounded(()=>fetcher(MAINNET.rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:controller.signal}),method,ms);const d=await bounded(()=>r.json(),method,ms);if(!r.ok||d.error||d.result===undefined)throw Error('RPC_FAILED:'+method);return d.result;}finally{clearTimeout(timer);}
}
export function walletPayload(tx,address){
 if(BigInt(tx.value||0)!==0n)throw Error('ZERO_VALUE_REQUIRED');
 const hex=n=>'0x'+BigInt(n).toString(16);
 return {from:address,...(tx.to?{to:tx.to}:{}),data:tx.data,value:'0x0',chainId:'0xc4',gas:hex(tx.gasLimit),gasPrice:hex(tx.gasPrice)};
}
export async function sendWalletTransaction(injected,tx,address,onHash,ms=45000){
 // Call the injected wallet directly: do not wait for an SDK to discover/index the transaction.
 const pending=Promise.resolve().then(()=>injected.request({method:'eth_sendTransaction',params:[walletPayload(tx,address)]})).then(hash=>{if(!/^0x[a-fA-F0-9]{64}$/.test(hash))throw Error('INVALID_TRANSACTION_HASH');onHash(hash);return hash;});
 return bounded(()=>pending,'eth_sendTransaction',ms);
}
export async function waitMainnetReceipt(hash,read=mainnetRead,ms=60000){
 const until=Date.now()+ms;while(Date.now()<until){const receipt=await read('eth_getTransactionReceipt',[hash]);if(receipt){if(Number(receipt.status)!==1)throw Error('TRANSACTION_FAILED');const block=BigInt(await read('eth_blockNumber'));if(block>=BigInt(receipt.blockNumber)+1n)return receipt;}await new Promise(resolve=>setTimeout(resolve,1500));}
 throw Error('CONFIRMATION_PENDING:'+hash);
}
