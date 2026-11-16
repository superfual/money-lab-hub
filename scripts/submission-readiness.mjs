// Read-only review: public Site configuration, RPC circuit evaluation and receipts.
// No signer, wallet, private user records or transaction broadcast.
import fs from 'node:fs';
import {verifyCircuit,rpc} from '../dist/tapeout.mjs';
import {readRefCircuit} from '../dist/ref-reader.mjs';
const origin='https://fual-money-lab-x.phamphuanloc.chatgpt.site';
const report={schema:'moneylab-submission-readiness.v1',checkedAt:new Date().toISOString(),scope:'Read-only observations; not an audit, user count or complete browser acceptance test.',http:[],config:{},chain:{},errors:[]};
const paths=['/','/online.html','/mainnet.html','/mainnet-play.html','/testnet.html','/decision-verifier.html'];
for(const path of paths){try{const r=await fetch(origin+path,{signal:AbortSignal.timeout(15000)});report.http.push({path,status:r.status,type:r.headers.get('content-type')});}catch(e){report.http.push({path,error:e.message});}}
for(const name of ['mainnet','mainnet-public','ref']){try{const r=await fetch(origin+'/api/'+name+'/config',{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('HTTP '+r.status);report.config[name]=await r.json();}catch(e){report.errors.push({stage:'config:'+name,error:e.message});}}
try{const block=await rpc('eth_blockNumber');report.chain.blockTag=block;report.chain.circuit48=await verifyCircuit(fetch,{block});report.chain.circuit49=await readRefCircuit(49,{block});}catch(e){report.errors.push({stage:'circuits',error:e.message});}
const previous=JSON.parse(fs.readFileSync(new URL('../docs/mainnet-live-evidence.json',import.meta.url)));
report.chain.settlements=[];
for(const old of previous.receipts){try{const r=await rpc('eth_getTransactionReceipt',[old.transactionHash]);if(!r||r.status!=='0x1'||r.to?.toLowerCase()!==previous.mainnet.contract.address.toLowerCase()||!r.logs?.some(l=>l.topics?.[0]==='0x5ab3162e06450f42a01796f08d52fd67808fa943bfcf93efe8d4f0a1df7781ba'))throw Error('SETTLEMENT_NOT_CONFIRMED');report.chain.settlements.push(r);}catch(e){report.errors.push({stage:'settlement',hash:old.transactionHash,error:e.message});}}
const pub=report.config['mainnet-public']?.contract;
if(pub){try{const [receipt,code]=await Promise.all([rpc('eth_getTransactionReceipt',[pub.deployment_tx]),rpc('eth_getCode',[pub.address,'latest'])]);report.chain.publicDeployment={receipt,hasRuntime:code!=='0x',address:pub.address};if(receipt?.status!=='0x1'||receipt.contractAddress?.toLowerCase()!==pub.address.toLowerCase()||code==='0x')throw Error('PUBLIC_DEPLOYMENT_NOT_CONFIRMED');}catch(e){report.errors.push({stage:'publicDeployment',error:e.message});}}
const path=new URL('../docs/submission-readiness-evidence.json',import.meta.url);fs.writeFileSync(path,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({path:path.pathname,checkedAt:report.checkedAt,http:report.http,circuit48:report.chain.circuit48?.cases.length,circuit49:report.chain.circuit49?.cases.length,settlements:report.chain.settlements.length,publicReady:report.config['mainnet-public']?.ready,publicRuntime:report.chain.publicDeployment?.hasRuntime,errors:report.errors},null,2));
if(report.errors.length||report.http.some(x=>x.status!==200))process.exitCode=1;
