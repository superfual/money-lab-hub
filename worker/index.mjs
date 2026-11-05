import {handleMainnet} from './mainnet.mjs';
import {handleEstate} from './estate.mjs';
import {handleRef} from './ref-circuit.mjs';
import {handleTestnet} from './testnet.mjs';
import {handleAnalytics} from './analytics.mjs';
import {handleAuth} from './identity.mjs';
import {handleSolo} from './solo.mjs';
import {handleOnline} from './online.mjs';
export default {async fetch(request,env){const url=new URL(request.url);if(url.pathname.startsWith('/api/mainnet/'))return handleMainnet(request,env);if(url.pathname.startsWith('/api/estate/'))return handleEstate(request,env);if(url.pathname.startsWith('/api/ref/'))return handleRef(request,env);if(url.pathname.startsWith('/api/testnet/'))return handleTestnet(request,env);if(['/api/analytics/event','/api/analytics/refresh'].includes(url.pathname))return handleAnalytics(request,env);if(url.pathname.startsWith('/api/account/'))return handleAuth(request,env);if(url.pathname.startsWith('/api/solo/'))return handleSolo(request,env);if(url.pathname.startsWith('/api/online/'))return handleOnline(request,env);const name=url.pathname==='/'?'/index.html':url.pathname,asset=STATIC_FILES[name];if(!asset)return new Response('Not found',{status:404});const headers={'Content-Type':asset.type,'X-Content-Type-Options':'nosniff','Cache-Control':name.endsWith('.png')?'public,max-age=86400':'no-cache'};return new Response(asset.binary?Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0)):asset.data,{headers});}};
