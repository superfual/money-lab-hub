import {Interface,AbiCoder,isAddress} from 'ethers';
import artifact from '../dist/content/mainnet-contract.json' with {type:'json'};
import publicArtifact from '../dist/content/mainnet-public-contract.json' with {type:'json'};
import {MAINNET} from '../dist/mainnet-shared.mjs';
const iface=new Interface(artifact.abi);
export function validatePilotTransaction(tx,address,config,action){
 const publicAccess=config.registration==='public',selectedArtifact=publicAccess?publicArtifact:artifact,iface=new Interface(selectedArtifact.abi);
 if(!isAddress(address)||(!publicAccess&&address.toLowerCase()!==MAINNET.owner))throw Error('PILOT_OWNER_ONLY');
 if(BigInt(tx.value||0)!==0n)throw Error('ZERO_VALUE_REQUIRED');
 if(!isAddress(config.attestor)||/^0x0{40}$/i.test(config.attestor))throw Error('ATTESTOR_UNAVAILABLE');
 const gas=BigInt(tx.gasLimit||0),price=BigInt(tx.gasPrice||0);if(gas<=0n||price<=0n||gas*price>5000000000000000n)throw Error('GAS_REVIEW_LIMIT');
 if(action==='deploy'){
  if(address.toLowerCase()!==MAINNET.owner)throw Error('OWNER_REQUIRED');
  const expected=selectedArtifact.bytecode+AbiCoder.defaultAbiCoder().encode(['address'],[config.attestor]).slice(2);
  if(tx.to||tx.data?.toLowerCase()!==expected.toLowerCase()||config.contract)throw Error('UNRECOGNIZED_DEPLOYMENT');
 }else{
  if(!config.ready||!isAddress(config.contract?.address)||tx.to?.toLowerCase()!==config.contract.address.toLowerCase())throw Error('WRONG_CONTRACT');
  let parsed;try{parsed=iface.parseTransaction({data:tx.data,value:0});}catch{throw Error('INVALID_ACTION');}
  const method=action==='register'?'register':action.startsWith('start-')?'startRun':action==='settle'?'settle':action==='abandon'?'abandon':null;
  if(!parsed||parsed.name!==method)throw Error('INVALID_ACTION');
  if(method==='startRun'&&(!['start-0','start-1','start-2'].includes(action)||Number(parsed.args[0])!==Number(action.slice(6))))throw Error('INVALID_LEVEL');
  if(method==='settle'&&parsed.args[0].player.toLowerCase()!==address.toLowerCase())throw Error('WRONG_PLAYER');
  if(iface.encodeFunctionData(parsed.name,parsed.args).toLowerCase()!==tx.data.toLowerCase())throw Error('INVALID_ACTION');
 }
 return true;
}
