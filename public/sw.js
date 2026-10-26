/* Cache only public, non-personal assets. Never cache API, auth or HTML data. */
const VERSION='spaceops-public-v1';
const PUBLIC=['/offline.html','/icons/icon-192.png','/icons/icon-512.png','/icons/maskable-512.png','/icons/apple-touch-icon.png','/favicon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(PUBLIC)));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('spaceops-public-')&&key!==VERSION)await caches.delete(key);await self.clients.claim();})());});
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 // Returning without respondWith leaves private/API/auth requests entirely to the network.
 if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/auth/')||url.pathname==='/login'||url.pathname.includes('password')||request.headers.has('RSC'))return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request,{cache:'no-store'}).catch(()=>caches.match('/offline.html')));return;
 }
 const isPublic=PUBLIC.includes(url.pathname)||url.pathname.startsWith('/_next/static/');
 if(!isPublic)return;
 event.respondWith((async()=>{const cached=await caches.match(request);if(cached)return cached;const response=await fetch(request);if(response.ok&&response.type==='basic'){const cache=await caches.open(VERSION);await cache.put(request,response.clone());}return response;})());
});
