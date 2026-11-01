import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CIRCUIT,evalData,decodeBytes,evaluateGate,verifyCircuit} from '../dist/tapeout.mjs';
const word=n=>BigInt(n).toString(16).padStart(64,'0');
const encoded=byte=>'0x'+word(32)+word(1)+byte+'00'.repeat(31);
const mock=({wrongChain=false,wrongOwner=false,wrongShape=false,wrongLogic=false,fail=false}={})=>async(url,opts)=>{
 assert.equal(url,CIRCUIT.rpc);assert.equal(opts.method,'POST');const body=JSON.parse(opts.body);assert.ok(!body.method.startsWith('eth_send'));assert.ok(!('value' in (body.params[0]||{})));
 if(fail)throw Error('offline');let result;
 if(body.method==='eth_chainId')result=wrongChain?'0x1':'0xc4';
 else if(body.method==='eth_blockNumber')result='0x100';
 else {assert.equal(body.method,'eth_call');assert.equal(body.params[0].to,CIRCUIT.address);assert.equal(body.params[1],'0x100');const data=body.params[0].data;
 if(data.startsWith('0x084d60f1'))result='0x'+[2,1,0,wrongShape?4:3].map(word).join('');
 else if(data.startsWith('0x6352211e'))result='0x'+'0'.repeat(24)+(wrongOwner?'1'.repeat(40):CIRCUIT.author.slice(2));
 else if(data.startsWith('0x3fc4be56'))result=encoded('00');
 else{assert.equal(data.slice(0,10),'0x934d06ea');assert.equal(data.slice(10,74),word(48));assert.equal(data.slice(74,138),word(64));assert.equal(data.slice(138,202),word(1));const bits=parseInt(data.slice(202,204),16);result=encoded(wrongLogic?'01':bits===3?'00':'01');}}
 return {ok:true,json:async()=>({jsonrpc:'2.0',id:1,result})};
};
test('LSB input packing and exact calldata',()=>{for(let a=0;a<2;a++)for(let b=0;b<2;b++)assert.equal(evalData(a,b).slice(202,204),(a+2*b).toString(16).padStart(2,'0'));assert.throws(()=>evalData(2,0));});
test('ABI decoder rejects malformed and truncated data',()=>{assert.equal(decodeBytes(encoded('01')),'0x01');for(const x of ['0x','wat','0x'+word(64)+word(1)+'01','0x'+word(32)+word(32)+'01'])assert.throws(()=>decodeBytes(x));});
test('complete verification pins network, owner, shape, truth table and block',async()=>{const p=await verifyCircuit(mock());assert.deepEqual(p.cases.map(x=>x.OUT0),[1,1,1,0]);assert.equal(p.owner,CIRCUIT.author);assert.equal(p.blockNumber,256);});
test('verification refuses wrong chain, owner, metadata or changed logic',async()=>{for(const option of ['wrongChain','wrongOwner','wrongShape','wrongLogic'])await assert.rejects(()=>verifyCircuit(mock({[option]:true})));});
test('RPC failure never returns a locally simulated output',async()=>{await assert.rejects(()=>evaluateGate(1,1,{fetcher:mock({fail:true})}),/offline/);});
test('STOP is the actual eth_call decoded output with reproducible receipt',async()=>{const r=await evaluateGate(1,1,{fetcher:mock()});assert.equal(r.OUT0,0);assert.equal(r.method,'eth_call');assert.equal(r.calldata,evalData(1,1));assert.equal(r.rawResult,encoded('00'));});
