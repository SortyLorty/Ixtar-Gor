const V="ixtar-d023372a";
const FILES=["./","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"];
/* risposte senza redirect: Safari rifiuta di usarle per aprire la pagina */
function clean(r){return r.redirected?r.blob().then(b=>new Response(b,{status:200,headers:r.headers})):Promise.resolve(r)}
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(u=>
  fetch(new Request(u,{cache:"reload"})).then(r=>{if(!r.ok)throw new Error(u);return clean(r)}).then(r=>c.put(u,r))))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* prima la copia sul dispositivo (funziona offline), la rete solo per ciò che manca */
self.addEventListener("fetch",e=>{const q=e.request;if(q.method!=="GET")return;
  const u=new URL(q.url);if(u.origin!==location.origin)return;
  const nav=q.mode==="navigate"||u.pathname.endsWith("/index.html");
  e.respondWith(caches.open(V).then(c=>c.match(nav?"./":q,{ignoreSearch:true}).then(hit=>hit||
    fetch(q).then(r=>{if(r.ok&&!r.redirected&&!nav)c.put(q,r.clone());return r}).catch(()=>c.match("./")))))});
