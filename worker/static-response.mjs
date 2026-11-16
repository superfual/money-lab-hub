// Safari media loading uses byte ranges, including a bytes=0-1 probe.
export function staticResponse(request,asset,name){
 const binary=asset.binary,body=binary?Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0)):asset.data;
 const headers=new Headers({'Content-Type':asset.type,'X-Content-Type-Options':'nosniff','Cache-Control':/\.(png|mp3)$/.test(name)?'public,max-age=86400':'no-cache'});
 if(binary){headers.set('Accept-Ranges','bytes');headers.set('Content-Length',String(body.length));const range=request.headers.get('range');if(range){const m=/^bytes=(\d*)-(\d*)$/.exec(range);let start,end;if(m&&(m[1]||m[2])){start=m[1]?Number(m[1]):Math.max(0,body.length-Number(m[2]));end=m[1]&&m[2]?Math.min(Number(m[2]),body.length-1):body.length-1;}
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=body.length||end<start){headers.set('Content-Range','bytes */'+body.length);headers.set('Content-Length','0');return new Response(null,{status:416,headers});}
 headers.set('Content-Range',`bytes ${start}-${end}/${body.length}`);headers.set('Content-Length',String(end-start+1));return new Response(request.method==='HEAD'?null:body.slice(start,end+1),{status:206,headers});}}
 return new Response(request.method==='HEAD'?null:body,{headers});
}
