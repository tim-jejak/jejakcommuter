(function(){
'use strict';
const $=s=>document.querySelector(s);
const CFG=window.JC_CFG||{};
const COLORS=[['Putih','#FFFFFF'],['Hitam','#14202B'],['Biru','#1F5FB5'],['Merah','#D32F2F'],['Hijau','#2E9B4F'],['Kuning','#F2C200'],['Oranye','#F57C00'],['Ungu','#7B3FA0']];
const st={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rand=n=>{const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';return Array.from(crypto.getRandomValues(new Uint8Array(n)),x=>A[x%A.length]).join('');};
const lum=h=>{h=h||'#1F5FB5';const n=parseInt(h.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255;return (.2126*r+.7152*g+.0722*b)/255;};
const caseFor=c=>lum(c)<.4?'#FFFFFF':'#14202B';
const MAXH=2*3600e3;
function mkCode(mode){const c=(mode==='p'?'PW':'AX')[crypto.getRandomValues(new Uint8Array(1))[0]&1];const nm=(P.name||'').toUpperCase().normalize('NFD').replace(/[^A-Z]/g,'');return c+(nm[0]||'X')+rand(4);}
function parseJoin(s){s=String(s||'').trim();if(!s)return null;
  if(/^https?:/i.test(s)){try{const u=new URL(s);const c=u.searchParams.get('g');if(!c)return null;return{code:c,mode:u.searchParams.get('m')==='p'?'p':'a'};}catch(_){return null;}}
  const c=s.toUpperCase().replace(/[\s-]/g,'');if(!/^[AXPW][A-Z][A-Z0-9]{4}$/.test(c))return null;return{code:c,mode:(c[0]==='P'||c[0]==='W')?'p':'a'};}
let JN=null;
const SW6=[['Putih','#FFFFFF'],['Hitam','#111111'],['Biru muda','#6EC1FF'],['Merah','#E5322D'],['Hijau muda','#7ED68A'],['Kuning','#FFD93B']];
const CP={kind:null};
const hex2=n=>Math.round(n).toString(16).padStart(2,'0');
function hsl2hex(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return '#'+hex2(f(0)*255)+hex2(f(8)*255)+hex2(f(4)*255);}
const PAL=(()=>{const o=[];[88,70,55,40,28].forEach(l=>{for(let h=0;h<360;h+=30)o.push(hsl2hex(h,85,l));});['#FFFFFF','#D9D9D9','#A6A6A6','#737373','#404040','#111111'].forEach(x=>o.push(x));return o;})();
const AUTO=[2,3,4,6,7,5,1,0].map(i=>COLORS[i]);

/* ---------- profil ---------- */
const P={name:st.get('jc_name',''),color:st.get('jc_color',null),dot:st.get('jc_dot',null)};
const initial=n=>(n||'?').trim().charAt(0).toUpperCase()||'?';
function applyProfile(){
  document.documentElement.style.setProperty('--dotme',P.dot||P.color||'#1F5FB5');document.documentElement.style.setProperty('--dotink',caseFor(P.dot||P.color||'#1F5FB5')==='#FFFFFF'?'#fff':'#14202B');
  const J=window.__jc;if(J){J.S.myColor=P.color;if(J.draw)J.draw();}
  const d=document.querySelector('.dot-me');if(d){d.textContent=P.name?initial(P.name):'';}
}
function swatches(kind){const cur=P[kind];const isCus=cur&&!SW6.some(x=>x[1].toLowerCase()===cur.toLowerCase());
  let h=SW6.map(([n,hx])=>'<button type="button" class="sw'+(cur&&cur.toLowerCase()===hx.toLowerCase()?' on':'')+'" data-sw="'+kind+'" data-c="'+hx+'" title="'+n+'" aria-label="'+n+'" aria-pressed="'+(cur&&cur.toLowerCase()===hx.toLowerCase())+'" style="background:'+hx+'"></button>').join('')+
    '<button type="button" class="sw cus'+(isCus?' on':'')+'" data-sw="'+kind+'" title="Warna lain" aria-label="Warna lain" style="'+(isCus?'background:'+cur:'')+'"></button>';
  if(CP.kind===kind)h+='<div class="cpick"><input class="gin cphex" data-sw="'+kind+'" maxlength="7" placeholder="#RRGGBB" value="'+esc(cur||'')+'" autocomplete="off" autocapitalize="characters"><div class="cpg">'+PAL.map(x=>'<button type="button" class="cpc" data-sw="'+kind+'" data-c="'+x+'" aria-label="'+x+'" style="background:'+x+'"></button>').join('')+'</div></div>';
  return h;}
function profileHTML(){return '<div class="pf"><label class="gl" for="pfName">Nama kamu</label><input class="pfName" type="text" maxlength="16" placeholder="Misalnya: faisal" value="'+esc(P.name)+'" autocomplete="off">'+
  '<div class="gl">Warna rute</div><div class="sws">'+swatches('color')+'</div>'+
  '<div class="gl">Warna titik lokasi</div><div class="sws">'+swatches('dot')+'</div></div>';}
function refreshProfileUI(){document.querySelectorAll('.pfbox').forEach(b=>{const f=b.querySelector('.pfName');const keep=document.activeElement===f;const v=f?f.value:'';b.innerHTML=profileHTML();const nf=b.querySelector('.pfName');if(keep&&nf){nf.value=v;nf.focus();}});}
document.addEventListener('input',e=>{if(e.target.classList&&e.target.classList.contains('pfName')){P.name=e.target.value.trim().slice(0,16);st.set('jc_name',P.name);applyProfile();if(window.__syncName)window.__syncName(P.name);}});
window.__setName=function(v){P.name=v;st.set('jc_name',v);applyProfile();refreshProfileUI();};
document.addEventListener('input',e=>{if(e.target.id==='gJoinIn'){const v=e.target.value;if(!/^h/i.test(v)&&v!==v.toUpperCase())e.target.value=v.toUpperCase();}});
document.addEventListener('input',e=>{const t=e.target;if(!t.classList||!t.classList.contains('cphex'))return;let v=t.value.trim();if(v&&v[0]!=='#')v='#'+v;if(!/^#[0-9a-fA-F]{6}$/.test(v))return;v=v.toUpperCase();const k=t.dataset.sw;P[k]=v;st.set(k==='color'?'jc_color':'jc_dot',v);applyProfile();if(VIEW&&VIEW.updMembers)VIEW.updMembers();
  document.querySelectorAll('.sw[data-sw="'+k+'"]').forEach(s=>{const on=s.classList.contains('cus');s.classList.toggle('on',on);if(on)s.style.background=v;});});
document.addEventListener('click',e=>{const pc=e.target.closest('.cpc');if(pc){const k=pc.dataset.sw;P[k]=pc.dataset.c;st.set(k==='color'?'jc_color':'jc_dot',P[k]);applyProfile();refreshProfileUI();if(VIEW&&VIEW.updMembers)VIEW.updMembers();return;}
  const cs=e.target.closest('.sw.cus');if(cs){const k=cs.dataset.sw;CP.kind=CP.kind===k?null:k;refreshProfileUI();return;}
  const b=e.target.closest('.sw');if(!b)return;const k=b.dataset.sw;P[k]=b.dataset.c||null;st.set(k==='color'?'jc_color':'jc_dot',P[k]);applyProfile();refreshProfileUI();if(VIEW&&VIEW.updMembers)VIEW.updMembers();});

/* ---------- kripto ---------- */
const te=new TextEncoder(),td=new TextDecoder();
const b64=u=>{u=new Uint8Array(u);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const b64u=u=>b64(u).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb64u=s=>unb64(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4));
async function gz(u){if(!window.CompressionStream)return{z:0,d:u};const s=new Blob([u]).stream().pipeThrough(new CompressionStream('gzip'));return{z:1,d:new Uint8Array(await new Response(s).arrayBuffer())};}
async function gunz(u){const s=new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'));return new Uint8Array(await new Response(s).arrayBuffer());}
async function enc(key,obj){const c=await gz(te.encode(JSON.stringify(obj)));const iv=crypto.getRandomValues(new Uint8Array(12));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,c.d);return{z:c.z,iv:b64(iv),c:b64(ct)};}
async function dec(key,p){let u=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(p.iv)},key,unb64(p.c)));if(p.z)u=await gunz(u);return JSON.parse(td.decode(u));}
const aesFrom=raw=>crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);
async function pwKey(pw,code){const base=await crypto.subtle.importKey('raw',te.encode(pw),'PBKDF2',false,['deriveBits']);return new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:te.encode('jc:'+code),iterations:200000,hash:'SHA-256'},base,256));}
const ecKP=()=>crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveKey']);
const expPub=async k=>b64(await crypto.subtle.exportKey('raw',k));
const impPub=b=>crypto.subtle.importKey('raw',unb64(b),{name:'ECDH',namedCurve:'P-256'},false,[]);
const ecdhKey=(priv,pub)=>crypto.subtle.deriveKey({name:'ECDH',public:pub},priv,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
async function sealTo(pub,obj){const e=await ecKP();const k=await ecdhKey(e.privateKey,await impPub(pub));return{epub:await expPub(e.publicKey),...await enc(k,obj)};}
async function openSeal(priv,p){return dec(await ecdhKey(priv,await impPub(p.epub)),p);}

/* ---------- transport ---------- */
let SB=null;
function mkLocal(code,onMsg,onStat){const bc=new BroadcastChannel('jc-'+code);bc.onmessage=e=>onMsg(e.data);setTimeout(()=>onStat('SUBSCRIBED'),30);return{send:p=>bc.postMessage(p),leave:()=>bc.close()};}
async function loadSB(){if(window.supabase)return;await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';s.onload=res;s.onerror=()=>rej(new Error('Gagal memuat Supabase'));document.head.appendChild(s);});}
async function mkSB(code,onMsg,onStat){await loadSB();if(!SB)SB=window.supabase.createClient(CFG.url,CFG.key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},realtime:{params:{eventsPerSecond:10}}});
  const ch=SB.channel('jc-'+code,{config:{broadcast:{self:false,ack:false}}});
  ch.on('broadcast',{event:'m'},m=>onMsg(m.payload)).subscribe(s=>onStat(s));
  return{send:p=>ch.send({type:'broadcast',event:'m',payload:p}),leave:()=>SB.removeChannel(ch)};}
const useServer=()=>!!(CFG.url&&CFG.key);

/* ---------- banyak grup: satu "mesin" per grup ---------- */
const ENG=[];          // semua grup/perjalanan yang sedang diikuti
let VIEW=null;         // grup yang sedang dibuka di panel
let MAPE=null;         // grup yang anggotanya tampil di peta
const SHARE_MAX=1;     // paket gratis: berbagi rute & lokasi di 1 grup
const toastEl=()=>$('#gToast');
function toast(t,ms){const e=toastEl();if(!e)return;e.textContent=t;e.hidden=false;clearTimeout(e._t);e._t=setTimeout(()=>{e.hidden=true;},ms||5000);}
const J=()=>window.__jc;
function ago(ms){const s=Math.round(ms/1000);if(s<60)return s+' dtk';const m=Math.round(s/60);if(m<60)return m+' mnt';const h=Math.floor(m/60);return h+' jam'+(m%60?' '+(m%60)+' mnt':'');}
function hhmm(ts){const d=new Date(ts);return String(d.getHours()).padStart(2,'0')+'.'+String(d.getMinutes()).padStart(2,'0');}
function trailOk(lt,l){const acc=l.acc||0;if(acc>40)return false;if(!lt)return true;return Math.hypot((l.lon-lt[0])*111320*Math.cos(l.lat*Math.PI/180),(l.lat-lt[1])*110540)>Math.max(20,acc*1.5);}
function fmtT(ms){const s=Math.max(0,Math.round(ms/1000));return Math.floor(s/3600)+':'+String(Math.floor(s%3600/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
function shareBase(){const h=location.hostname;return(location.protocol==='file:'||location.protocol==='capacitor:'||h==='localhost'||h==='127.0.0.1')&&!window.__TESTBASE?'https://jejakcommuter.com/app/':location.href;}
function decim(c){const r=[];let last=null;c.forEach((p,i)=>{const q=[+p[0].toFixed(5),+p[1].toFixed(5)];if(!last||i===c.length-1||Math.hypot((q[0]-last[0])*111320*Math.cos(q[1]*Math.PI/180),(q[1]-last[1])*110540)>12){r.push(q);last=q;}});return r;}
function buildRoute(){const j=J();if(!j)return null;const S=j.S,o=(j.NAV&&j.NAV.on&&j.NAV.o)||S.holdRoute||(S.opts&&S.opts[S.sel]);if(!o)return null;
  return{f:S.from?S.from.label||'Asal':'',t:S.to?S.to.label||'Tujuan':'',ti:o.title||'',tot:Math.round(o.total||0),
    ft:o.features.map(x=>({k:x.kind,c:x.coords?decim(x.coords):[]})),pins:(o.pins||[]).map(p=>({n:p.name,lo:p.lon,la:p.lat}))};}
function routeSig(){const r=buildRoute();return r?r.ti+'|'+r.tot+'|'+r.ft.length+'|'+(r.ft[0]&&r.ft[0].c.length):'';}
const isGroup=e=>e&&e.G&&e.G.mode!=='v';
const groups=()=>ENG.filter(isGroup);
function sharers(){return groups().filter(e=>e.G.share.loc||e.G.share.route);}
function newG(o){return Object.assign({code:'',mode:'a',owner:false,me:rand(8),raw:null,key:null,kp:null,max:5,exp:0,roster:new Map(),pend:[],chat:[],pubs:{},tx:null,online:false,q:[],joined:false,fail:0,waitT:null,share:{loc:true,route:true},routeSig:'',sim:false,bots:[],name:'',ar:true},o);}

function Engine(){
const self={};
let G=null,hbT=null,tickT=null,wake=null,botT=null;self.unread=0;
const MK=new Map();
const vis=()=>VIEW===self;
const onMap=()=>MAPE===self;
const myColorEff=()=>{if(!G)return P.color||COLORS[2][1];return G.roster.get(G.me).color;};
function pickColor(){const used=new Set([...G.roster.values()].filter(m=>m.id!==G.me).map(m=>m.color));
  if(P.color&&!used.has(P.color))return P.color;const f=AUTO.find(([,h])=>!used.has(h));return f?f[1]:COLORS[0][1];}

async function connect(){
  const onMsg=p=>{onMessage(p).catch(e=>console.log('GERR',e&&e.message));};
  const onStat=s=>{const was=G&&G.online;if(!G)return;G.online=(s==='SUBSCRIBED');updStat();if(G.online&&!was)flushQ();};
  G.tx=useServer()?await mkSB(G.code,onMsg,onStat):mkLocal(G.code,onMsg,onStat);
}
function out(p,queue){if(!G)return;if(G.online&&G.tx){try{G.tx.send(p);}catch(e){if(queue)G.q.push(p);}}else if(queue){G.q.push(p);if(G.q.length>60)G.q.shift();}}
function flushQ(){if(!G)return;const q=G.q;G.q=[];q.forEach(p=>out(p,true));}
async function sendE(obj,queue){if(!G||!G.key)return;out({k:'e',from:G.me,...await enc(G.key,obj)},queue);}

/* ---------- rute dibagikan ---------- */
async function sendRoute(force){if(!G||!G.key)return;const me=G.roster.get(G.me);
  if(!G.share.route||!G.ar){if(me.route){me.route=null;await sendE({t:'route',id:G.me,r:null},true);drawGroup();}return;}
  const sig=routeSig();if(!force&&sig===G.routeSig)return;
  const r=sig?buildRoute():null;const J_=J();
  if(r&&G.routeSig&&sig!==G.routeSig&&G.lastR&&J_&&J_.NAV&&J_.NAV.on){G.old=[G.lastR].concat(G.old||[]).slice(0,3);const l=me.loc;G.cp=l?{lo:l.lon,la:l.lat,ts:Date.now()}:null;}
  G.routeSig=sig;if(r){G.lastR=r;r.old=(G.old||[]).map(x=>({ft:x.ft.map(y=>({k:'old',c:y.c}))}));if(G.cp)r.cp=G.cp;r.tr=decim(G.trail||[]).slice(-250);}
  await sendE({t:'route',id:G.me,r},true);}

/* ---------- pesan masuk ---------- */
function upsert(m){const old=G.roster.get(m.id)||{};const n=Object.assign({},old,m);G.roster.set(m.id,n);return n;}
async function onMessage(p){
  if(!G||p.from===G.me)return;
  if(p.k==='req'){ if(!G.owner||G.mode!=='a')return;
    if(G.roster.has(p.from)&&G.roster.get(p.from).joined)return;
    if(G.pend.some(x=>x.id===p.from))return;
    G.pend.push({id:p.from,name:String(p.name||'?').slice(0,16),color:p.color,pub:p.pub});G.pubs[p.from]=p.pub;updPending();bump();toast((p.name||'Seseorang')+' ingin bergabung ke '+gName());listRefresh();return;}
  if(p.k==='grant'){ if(p.to!==G.me||G.joined)return;
    try{const o=await openSeal(G.kp.privateKey,p);G.raw=unb64(o.k);G.key=await aesFrom(G.raw);}catch(e){return;}
    await afterKey();return;}
  if(p.k==='rekey'){ if(p.to!==G.me)return;try{const o=await openSeal(G.kp.privateKey,p);G.raw=unb64(o.k);G.key=await aesFrom(G.raw);}catch(e){}return;}
  if(p.k==='deny'){ if(p.to!==G.me)return;endLocal('Pemilik grup menolak permintaanmu.');return;}
  if(p.k==='hist'){ if(p.to!==G.me)return;try{const o=await openSeal(G.kp.privateKey,p);mergeChat(o.msgs||[]);toast('Riwayat chat dimuat');}catch(e){}return;}
  if(p.k!=='e'||!G.key)return;
  let m;try{m=await dec(G.key,p);}catch(e){G.fail++;return;}
  const now=Date.now();
  switch(m.t){
   case'hello':{ const isNew=!G.roster.has(m.id);
      if(G.owner&&isNew&&G.roster.size>=G.max){await sendE({t:'full',to:m.id});return;}
      G.pubs[m.id]=m.pub||G.pubs[m.id];upsert({id:m.id,name:m.name,color:m.color,dot:m.dot,owner:false,seen:now,joined:true});
      if(G.owner){fixColors();await sendRoster();}
      updMembers();drawGroup();listRefresh();if(isNew)toast(m.name+' bergabung ke '+gName());await sendHB();sendRoute(true);return;}
   case'full':{ if(m.to===G.me)endLocal('Grup sudah penuh.');return;}
   case'roster':{ if(G.owner)return;if(m.gname)G.name=String(m.gname).slice(0,30);if(m.ar===false){G.ar=false;G.share.route=false;}else if(m.ar===true)G.ar=true;G.max=m.max;G.exp=m.exp;G.mode=m.mode;const ids=new Set(m.list.map(x=>x.id));
      m.list.forEach(x=>{if(x.id!==G.me||!G.roster.has(G.me))upsert(Object.assign({},x,{joined:true}));else upsert({id:x.id,owner:x.owner,color:x.color});});
      [...G.roster.keys()].forEach(id=>{if(!ids.has(id))G.roster.delete(id);});
      if(!G.confirmed){G.confirmed=true;clearTimeout(G.waitT);if(vis()){if(G.viewer)showViewer();else showIn();}}
      updMembers();updHead();drawGroup();listRefresh();sendRoute(true);return;}
   case'bg':{ if(!G.roster.has(m.id))return;const x=upsert({id:m.id,seen:now});x.bg=m.ts||now;updMembers();drawGroup();return;}
   case'hb':{ if(!G.roster.has(m.id))return;const x=upsert({id:m.id,seen:now});x.bg=0;if(m.loc){x.loc=m.loc;if(x.route&&x.route.tr){const lt=x.route.tr[x.route.tr.length-1];if(trailOk(lt,m.loc))x.route.tr.push([m.loc.lon,m.loc.lat]);}}else if(m.loc===null)x.loc=null;updMembers();drawGroup();return;}
   case'route':{ if(!G.roster.has(m.id))return;const x=G.roster.get(m.id);const sg=r=>r?(r.ti+'|'+r.tot+'|'+(r.ft&&r.ft.length)+'|'+(r.cp?r.cp.ts:0)):'';if(x.route&&m.r&&sg(x.route)!==sg(m.r)&&(m.r.cp&&(!x.route.cp||x.route.cp.ts!==m.r.cp.ts))){toast((x.name||'Teman')+' mengganti rute');G.fitted=false;}x.route=m.r;drawGroup();updMembers();return;}
   case'chat':{ if(G.chat.some(c=>c.id===m.id))return;const c={id:m.id,from:m.from,text:m.text,ts:m.ts,q:m.q,rc:m.rc||null};G.chat.push(c);updChat();bubble(m.from,m.rc?'Membagikan rute':m.text);bump();return;}
   case'hreq':{ if(!G.owner)return;const x=G.roster.get(m.id);if(!x)return;G.hreq=G.hreq||[];if(!G.hreq.includes(m.id)){G.hreq.push(m.id);updPending();bump();toast(x.name+' minta riwayat chat');}return;}
   case'kick':{ if(m.id===G.me){endLocal('Kamu dikeluarkan dari '+gName()+'.');}else{G.roster.delete(m.id);updMembers();drawGroup();}return;}
   case'bye':{ const x=G.roster.get(m.id);if(x){G.roster.delete(m.id);if(G.owner)sendRoster();updMembers();drawGroup();listRefresh();toast(x.name+' keluar dari '+gName());}return;}
   case'vw':{ if(G.owner){G.views=G.views||{};if(!G.views[m.id]){G.lastRos=0;G.lastRt=0;}G.views[m.id]=now;updViews();}return;}
   case'end':{ endLocal(G.viewer?'Perjalanan ini sudah selesai dibagikan.':gName()+' dihentikan oleh pemilik.');return;}
  }
}
function bump(){if(!(chatOpen()&&vis()))self.unread++;updBadge();listRefresh();}
function mergeChat(msgs){const ids=new Set(G.chat.map(c=>c.id));msgs.forEach(c=>{if(!ids.has(c.id))G.chat.push(c);});G.chat.sort((a,b)=>a.ts-b.ts);updChat();}

/* ---------- roster / pemilik ---------- */
function fixColors(){const seen=new Set();[...G.roster.values()].forEach(m=>{if(seen.has(m.color)){const f=AUTO.find(([,h])=>!seen.has(h)&&![...G.roster.values()].some(z=>z.color===h));if(f){m.color=f[1];if(m.id===G.me)toast('Warna sama dengan anggota lain, dialihkan ke '+f[0]+' di grup ini.');}}seen.add(m.color);});}
async function sendRoster(){fixColors();await sendE({t:'roster',gname:G.name||'',ar:G.ar!==false,max:G.max,exp:G.exp,mode:G.mode,list:[...G.roster.values()].map(m=>({id:m.id,name:m.name,color:m.color,dot:m.dot,owner:!!m.owner}))},true);}
async function approve(id){const i=G.pend.findIndex(x=>x.id===id);if(i<0)return;const r=G.pend[i];
  if(G.roster.size>=G.max){toast('Grup sudah penuh ('+G.max+' orang).');return;}
  G.pend.splice(i,1);
  if(r.bot){G.roster.set(id,{id,name:r.name,color:r.color,dot:r.color,owner:false,seen:Date.now(),joined:true,bot:true});fixColors();await sendRoster();updPending();updMembers();drawGroup();listRefresh();return;}
  const s=await sealTo(r.pub,{k:b64(G.raw)});out({k:'grant',from:G.me,to:id,...s});
  G.roster.set(id,{id,name:r.name,color:r.color,dot:r.color,owner:false,seen:0,joined:false});
  updPending();updMembers();listRefresh();}
function deny(id){const i=G.pend.findIndex(x=>x.id===id);if(i<0)return;const r=G.pend[i];G.pend.splice(i,1);if(!r.bot)out({k:'deny',from:G.me,to:id});updPending();listRefresh();}
async function kick(id){const m=G.roster.get(id);if(!m)return;
  if(!m.bot)await sendE({t:'kick',id});G.roster.delete(id);delete G.pubs[id];
  G.raw=crypto.getRandomValues(new Uint8Array(32));G.key=await aesFrom(G.raw);
  for(const x of G.roster.values()){if(x.id===G.me||x.bot)continue;const pub=G.pubs[x.id];if(!pub)continue;out({k:'rekey',from:G.me,to:x.id,...await sealTo(pub,{k:b64(G.raw)})});}
  await new Promise(r=>setTimeout(r,300));await sendRoster();updMembers();drawGroup();listRefresh();toast((m.name||'Anggota')+' dikeluarkan dan kunci diganti.');}
async function grantHistory(id){const pub=G.pubs[id];if(!pub)return;out({k:'hist',from:G.me,to:id,...await sealTo(pub,{msgs:G.chat})});
  G.hreq=(G.hreq||[]).filter(x=>x!==id);updPending();}
function denyHistory(id){G.hreq=(G.hreq||[]).filter(x=>x!==id);updPending();}

/* ---------- siklus hidup ---------- */
async function afterKey(){G.joined=true;const me=G.roster.get(G.me);
  const hello=async()=>{if(!G||G.confirmed)return;await sendE({t:'hello',id:G.me,name:me.name,color:me.color,dot:me.dot,pub:await expPub(G.kp.publicKey)},true);};
  await hello();const iv=setInterval(()=>{if(!G||G.confirmed){clearInterval(iv);return;}hello();},3000);
  G.waitT=setTimeout(()=>{clearInterval(iv);if(G&&!G.confirmed)endLocal(G.mode==='p'?'Tidak ada respons. Password salah atau grup sudah berakhir.':'Tidak ada respons dari grup.');},15000);}
function startTimers(){clearInterval(hbT);clearInterval(tickT);hbT=setInterval(sendHB,5000);tickT=setInterval(tick,1000);
  try{if(navigator.wakeLock&&!wake)navigator.wakeLock.request('screen').then(w=>{wake=w;}).catch(()=>{});}catch(e){}
  if(G.share.loc&&J()&&J().locate)J().locate();}
self.onVis=()=>{if(!G)return;if(G.joined&&document.visibilityState==='hidden'&&!window.__nativeBG){try{sendE({t:'bg',id:G.me,ts:Date.now()});}catch(e){}}if(G.joined&&document.visibilityState==='visible'){try{if(G.share.loc&&J()&&J().locate)J().locate();sendHB();}catch(e){}}if(document.visibilityState==='visible'&&navigator.wakeLock)navigator.wakeLock.request('screen').then(w=>{wake=w;}).catch(()=>{});};
self.fix=()=>{if(G&&G.joined&&Date.now()-(G.lastHB||0)>4000)sendHB();};
async function sendHB(){if(!G||!G.key||!G.joined)return;G.lastHB=Date.now();const me=G.roster.get(G.me);me.seen=Date.now();
  const g=J()&&J().S.gps;let loc;if(G.share.loc&&g){loc={lat:+g.lat.toFixed(6),lon:+g.lon.toFixed(6),acc:Math.round(g.acc||0),ts:Date.now()};me.loc=loc;}else if(!G.share.loc){me.loc=null;loc=null;}
  if(loc){G.trail=G.trail||[];const lt=G.trail[G.trail.length-1];if(trailOk(lt,loc)){G.trail.push([loc.lon,loc.lat]);if(G.trail.length>600)G.trail.shift();}}
  await sendE({t:'hb',id:G.me,loc});drawGroup();}
function tick(){if(!G)return;const gu=vis()&&$('#gUnread');if(gu){gu.textContent=self.unread;gu.hidden=!self.unread;}const nw=Date.now();if(G.owner&&G.mode==='v'){if(nw-(G.lastRos||0)>10000){G.lastRos=nw;sendRoster();}if(nw-(G.lastRt||0)>20000){G.lastRt=nw;sendRoute(true);}updViews();}if(Date.now()>=G.exp){if(G.owner)sendE({t:'end'});endLocal(G.mode==='v'?'Berbagi perjalanan berakhir (batas 2 jam).':gName()+' berakhir (batas 2 jam).');return;}
  updHead();if(nw-(G.lastDr||0)>10000){G.lastDr=nw;try{drawGroup();updMembers();}catch(e){}}sendRoute(false);}
function leaveClean(){clearInterval(hbT);clearInterval(tickT);clearInterval(botT);clearTimeout(G&&G.waitT);try{G.tx&&G.tx.leave();}catch(e){}try{wake&&wake.release();}catch(e){}wake=null;}
async function stopGroup(){if(!G)return;if(G.owner){await sendE({t:'end'});}else if(!G.viewer){await sendE({t:'bye',id:G.me});}await new Promise(r=>setTimeout(r,150));endLocal(G.mode==='v'?(G.owner?'Berbagi perjalanan dihentikan.':'Berhenti melihat perjalanan.'):(G.owner?gName()+' dihentikan.':'Kamu keluar dari '+gName()+'.'));}
function endLocal(msg){if(!G)return;const code=G.code,wasGroup=G.mode!=='v';leaveClean();
  if(wasGroup&&useServer())srvLeave(code);
  G=null;const i=ENG.indexOf(self);if(i>-1)ENG.splice(i,1);
  clearMarkers();
  if(MAPE===self){MAPE=null;const nx=sharers()[0]||ENG[0]||null;setMap(nx);}
  if(VIEW===self){VIEW=null;if(chatOpen())openChat(false);showHome('home');}
  else listRefresh();
  setTimeout(saveSess,50);updBadge();if(msg)toast(msg,7000);
  const u=new URL(location.href);if(u.searchParams.has('g')||u.searchParams.has('v')){u.searchParams.delete('g');u.searchParams.delete('m');u.searchParams.delete('v');u.hash='';history.replaceState(null,'',u);}}

/* ---------- buat / gabung ---------- */
async function createGroup(o){
  const code=o.code||mkCode(o.mode);G=newG({code,mode:o.mode,owner:true,max:o.max,exp:o.exp||Date.now()+MAXH,sim:o.sim,confirmed:true,ar:o.ar!==false});
  G.share={loc:!sharers().some(e=>e!==self),route:!sharers().some(e=>e!==self)&&o.ar!==false};
  G.kp=await ecKP();G.raw=o.mode==='p'?await pwKey(o.pw,code):crypto.getRandomValues(new Uint8Array(32));G.key=await aesFrom(G.raw);G.joined=true;
  G.roster.set(G.me,{id:G.me,name:P.name,color:P.color||COLORS[2][1],dot:P.dot,owner:true,seen:Date.now(),joined:true});
  G.name=String(o.name||('Grup '+(P.name||'Saya'))).trim().slice(0,30);
  G.pw=o.pw||'';await connect();startTimers();showIn();
  if(o.sim)startBots();
}
async function joinGroup(o){
  G=newG({code:o.code,mode:o.mode,owner:false,exp:o.exp||Date.now()+MAXH,ar:o.ar!==false});G.kp=await ecKP();
  G.share={loc:!sharers().some(e=>e!==self),route:!sharers().some(e=>e!==self)&&o.ar!==false};
  G.roster.set(G.me,{id:G.me,name:P.name,color:P.color||COLORS[2][1],dot:P.dot,owner:false,seen:Date.now(),joined:true});
  await connect();startTimers();
  if(o.mode==='p'){G.raw=await pwKey(o.pw,o.code);G.key=await aesFrom(G.raw);await afterKey();showWait('Menyambung ke grup…');}
  else{const pub=await expPub(G.kp.publicKey);const me=G.roster.get(G.me);const req=()=>{if(G&&!G.joined&&!G.owner)out({k:'req',from:G.me,name:me.name,color:me.color,pub});};
    const iv=setInterval(()=>{if(!G||G.joined){clearInterval(iv);return;}req();},4000);setTimeout(req,400);showWait('Menunggu persetujuan pemilik grup…');}
}

/* ---------- bagikan rute (perjalanan, lihat-saja) ---------- */
async function startTrip(url,code,raw){
  G=newG({code,mode:'v',owner:true,max:99,exp:Date.now()+MAXH,confirmed:true,joined:true,tripUrl:url});
  G.raw=raw;G.key=await aesFrom(raw);G.kp=await ecKP();
  G.roster.set(G.me,{id:G.me,name:P.name,color:P.color||COLORS[2][1],dot:P.dot,owner:true,seen:Date.now(),joined:true});
  await connect();startTimers();showTrip();}
async function joinTrip(code,kb){
  G=newG({code,mode:'v',owner:false,viewer:true,exp:Date.now()+MAXH,joined:true});
  try{G.raw=unb64u(kb);G.key=await aesFrom(G.raw);}catch(e){G=null;const i=ENG.indexOf(self);if(i>-1)ENG.splice(i,1);toast('Tautan perjalanan tidak valid.');return;}
  await connect();clearInterval(tickT);clearInterval(hbT);tickT=setInterval(tick,1000);
  const ping=()=>{if(G&&G.viewer)sendE({t:'vw',id:G.me},true);};hbT=setInterval(ping,10000);setTimeout(ping,500);
  showWait('Menyambung ke perjalanan…');openPanel(true);
  viewerWait();}
function viewerWait(){const g0=G;G.waitT=setTimeout(()=>{if(G!==g0||G.confirmed)return;showWait('Pemilik perjalanan belum online. Aplikasinya harus terbuka di HP pemilik. Terus mencoba menyambung…');G.waitT=setTimeout(()=>{if(G===g0&&!G.confirmed)endLocal('Perjalanan tidak ditemukan atau sudah berakhir.');},600000);},12000);}
function showTrip(){if(VIEW&&!vis())return;VIEW=self;setMap(self);$('#gTitle').textContent='Bagikan rute';const _gc=$('#gClose');if(_gc)_gc.textContent='Kembali';
  $('#gBody').innerHTML='<div id="gStat" class="small"></div><div class="gsec"><b>Perjalananmu sedang dibagikan</b><p class="small">Siapa pun yang menerima tautan bisa melihat rute dan posisimu secara langsung. Mereka hanya melihat, tidak bisa mengirim apa pun. Sisa waktu <b id="gTime"></b> · Dilihat <b id="gViews">0</b> orang.</p><div class="row2"><button type="button" class="btn" data-act="share">Kirim tautan</button><button type="button" class="btn" data-act="copy">Salin tautan</button></div></div>'+
   '<div class="gsec"><label class="chk"><input type="checkbox" id="gShLoc" '+(G.share.loc?'checked':'')+'> Bagikan posisi saya</label><label class="chk"><input type="checkbox" id="gShRt" '+(G.share.route?'checked':'')+'> Bagikan rute yang saya pilih</label></div>'+
   '<div class="gsec"><button type="button" class="btn dng" data-act="leave">Hentikan berbagi</button></div>';
  $('#gBody').dataset.view='trip';updHead();updStat();}
function showViewer(){if(VIEW&&!vis())return;VIEW=self;setMap(self);$('#gTitle').textContent='Perjalanan';const _gc=$('#gClose');if(_gc)_gc.textContent='Kembali';
  $('#gBody').innerHTML='<div id="gStat" class="small"></div><div class="gsec" id="vInfo"></div><div class="gsec"><button type="button" class="btn dng" data-act="leave">Berhenti melihat</button></div>';
  $('#gBody').dataset.view='viewer';updViewer();updStat();}
function updViewer(){if(!vis())return;const e=$('#vInfo');if(!e||!G)return;const o=[...G.roster.values()].find(m=>m.owner)||[...G.roster.values()][0];if(!o){e.innerHTML='<p class="small">Menunggu data…</p>';return;}
  const now=Date.now(),last=(o.loc&&o.loc.ts)||o.seen||0,on=now-last<15000;
  e.innerHTML='<b>'+esc(o.name||'Seseorang')+'</b> membagikan perjalanannya<p class="small">'+(o.route&&o.route.f?esc(o.route.f)+' → '+esc(o.route.t)+(o.route.tot?' · ±'+o.route.tot+' mnt':''):'Rute belum dibagikan')+'</p><p class="small">'+(on?'Posisi terbaru: baru saja':(last?'Terakhir terlihat '+Math.round((now-last)/1000)+' dtk lalu':'Posisi belum dibagikan'))+'</p><p class="small">Sisa waktu <b id="gTime"></b></p>';updHead();}
function updViews(){if(!vis())return;const e=$('#gViews');if(!e||!G||!G.views)return;const n=Date.now();e.textContent=Object.values(G.views).filter(x=>n-x<25000).length;}
function fitViewer(){const j=J();if(!j||!G||!G.viewer||G.fitted||!onMap())return;const o=[...G.roster.values()].find(m=>m.owner||m.route||m.loc);if(!o)return;
  const b=new maplibregl.LngLatBounds();let any=false;if(o.loc){b.extend([o.loc.lon,o.loc.lat]);any=true;}if(o.route&&o.route.ft)o.route.ft.forEach(x=>(x.c||[]).forEach(c=>{b.extend(c);any=true;}));
  if(any&&(o.loc||o.route)){G.fitted=true;j.map.fitBounds(b,{padding:{top:90,bottom:Math.round(innerHeight*.45),left:40,right:40},maxZoom:16,duration:700});}}

/* ---------- bot simulasi ---------- */
function startBots(){const j=J();const g=j.S.gps||(()=>{const c=j.map.getCenter();return{lat:c.lat,lon:c.lng};})();
  const defs=[['Indah',[ -0.012, 0.010]],['Shaima',[0.010,-0.012]]];
  G.bots=defs.map(([n,off],i)=>({id:'bot'+i,name:n,off,color:null,phase:i*.4}));
  setTimeout(()=>{if(!G)return;G.bots.forEach((b,i)=>{b.color=COLORS[3+i][1];if(G.mode==='a'){G.pend.push({id:b.id,name:b.name,color:b.color,bot:true});}else{G.roster.set(b.id,{id:b.id,name:b.name,color:b.color,dot:b.color,seen:Date.now(),joined:true,bot:true});}});
    updPending();updMembers();bump();toast('Indah dan Shaima (simulasi) ingin bergabung');},2500);
  clearInterval(botT);botT=setInterval(()=>{if(!G)return;const base=j.S.gps||g;const now=Date.now();
    G.bots.forEach(b=>{const m=G.roster.get(b.id);if(!m)return;b.phase+=.004;const a=b.phase*Math.PI*2;
      const lat=base.lat+b.off[0]*Math.cos(a*.5),lon=base.lon+b.off[1]*Math.sin(a*.5);
      m.loc={lat,lon,acc:12,ts:now};m.seen=now;
      m.route={f:'Rumah',t:'Kantor',ti:'Simulasi',tot:35,ft:[{k:'motor',c:[[lon,lat],[base.lon,base.lat],[base.lon+b.off[1]*.2,base.lat+b.off[0]*.2]]}],pins:[]};});
    drawGroup();updMembers();},1000);}
function botReply(){if(!G||!G.bots.length)return;const msgs=['Oke, aku jalan ya','Siap!','Aku 5 menit lagi sampai','Tunggu di pintu keluar ya'];
  const b=G.bots.find(x=>G.roster.has(x.id));if(!b)return;setTimeout(()=>{if(!G)return;const c={id:rand(6),from:b.id,text:msgs[Math.floor(Math.random()*msgs.length)],ts:Date.now()};G.chat.push(c);updChat();bubble(b.id,c.text);bump();},1800+Math.random()*1500);}

/* ---------- peta ---------- */
function clearMarkers(){MK.forEach(m=>m.remove());MK.clear();}
function mkEl(m){const el=document.createElement('div');el.className='gm';el.innerHTML='<span class="gd"></span><span class="gb" hidden></span>';return el;}
function drawGroup(){const j=J();if(!j||!j.map)return;if(!onMap()){clearMarkers();return;}if(!G){clearGrpSource();clearMarkers();return;}
  if(!ensureLayers())return;const feats=[];const now=Date.now();
  G.roster.forEach(m=>{if(m.id===G.me)return;
    if(m.route&&m.route.ft)m.route.ft.forEach(x=>{if(x.c&&x.c.length>1)feats.push({type:'Feature',properties:{k:x.k,c:m.color,cs:caseFor(m.color)},geometry:{type:'LineString',coordinates:x.c}});});
    if(m.route&&m.route.old)m.route.old.forEach(o=>(o.ft||[]).forEach(x=>{if(x.c&&x.c.length>1)feats.push({type:'Feature',properties:{k:'old',c:'#8A97A3',cs:'#14202B'},geometry:{type:'LineString',coordinates:x.c}});}));
    if(m.route&&m.route.tr&&m.route.tr.length>1)feats.push({type:'Feature',properties:{k:'trail',c:m.color,cs:'#14202B'},geometry:{type:'LineString',coordinates:m.route.tr}});
    {const ck='cp-'+m.id;let cm=MK.get(ck);const cp=m.route&&m.route.cp;
     if(cp){if(!cm){const e=document.createElement('div');e.className='gcp';e.textContent='Ganti rute';cm=new maplibregl.Marker({element:e,anchor:'bottom'}).setLngLat([cp.lo,cp.la]).addTo(j.map);MK.set(ck,cm);}else cm.setLngLat([cp.lo,cp.la]);}
     else if(cm){cm.remove();MK.delete(ck);}}
    let mk=MK.get(m.id);
    if(m.loc){const stale=now-(m.loc.ts||0)>20000;
      if(!mk){mk=new maplibregl.Marker({element:mkEl(m),anchor:'center'}).setLngLat([m.loc.lon,m.loc.lat]).addTo(j.map);MK.set(m.id,mk);}
      mk.setLngLat([m.loc.lon,m.loc.lat]);const el=mk.getElement(),d=el.querySelector('.gd');
      d.style.background=m.dot||m.color;d.style.color=caseFor(m.dot||m.color)==='#FFFFFF'?'#fff':'#14202B';d.style.borderColor=caseFor(m.dot||m.color);d.textContent=initial(m.name);el.style.opacity=stale?.6:1;const age=ago(now-(m.loc.ts||0));el.title=m.name+(stale?' (terakhir terlihat '+age+' lalu)':'');
      let lb=el.querySelector('.gago');if(stale){if(!lb){lb=document.createElement('div');lb.className='gago';lb.style.cssText='position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:3px;background:#14202B;color:#fff;font:700 11px/1.2 system-ui,sans-serif;padding:3px 6px;border-radius:8px;white-space:nowrap;pointer-events:none';el.appendChild(lb);}lb.textContent=(m.bg?'HP dikunci · ':'')+'terakhir '+age+' lalu';}else if(lb)lb.remove();}
    else if(mk){mk.remove();MK.delete(m.id);}});
  [...MK.keys()].forEach(id=>{if(!G.roster.has(id.replace(/^cp-/,''))){MK.get(id).remove();MK.delete(id);}});
  j.map.getSource('grp').setData({type:'FeatureCollection',features:feats});if(G.viewer)fitViewer();}
function bubble(id,text){if(!onMap())return;const mk=MK.get(id);if(!mk)return;const b=mk.getElement().querySelector('.gb');b.textContent=text;b.hidden=false;clearTimeout(b._t);b._t=setTimeout(()=>{b.hidden=true;},6000);}

/* ---------- tampilan grup ---------- */
function gName(){return G?(G.mode==='v'?(G.viewer?'Perjalanan':'Bagikan rute'):(G.name||('Grup '+G.code))):'Grup';}
function showWait(t){if(VIEW&&!vis())return;VIEW=self;$('#gTitle').textContent='Menyambung';const _gc=$('#gClose');if(_gc)_gc.textContent='Kembali';$('#gBody').innerHTML='<div class="gsec"><p>'+esc(t)+'</p><button type="button" class="btn" data-act="leave">Batal</button></div><div id="gStat" class="small"></div>';$('#gBody').dataset.view='wait';updStat();}
function shareBox(){const others=sharers().filter(e=>e!==self);
  if(G.share.loc||G.share.route)return '<div class="gshare on"><b>Lokasi'+(G.ar?' dan rute':'')+' kamu dibagikan di grup ini</b>'+
     '<label class="chk"><input type="checkbox" id="gShLoc" '+(G.share.loc?'checked':'')+'> Bagikan lokasi saya</label>'+
     '<label class="chk'+(G.ar?'':' dis')+'"><input type="checkbox" id="gShRt" '+(G.share.route&&G.ar?'checked':'')+(G.ar?'':' disabled')+'> Bagikan rute yang saya pilih'+(G.ar?'':' <small>(grup ini tidak mengizinkan)</small>')+'</label>'+
     '<button type="button" class="btn sm" data-act="shareoff">Berhenti berbagi di grup ini</button></div>';
  return '<div class="gshare"><b>'+(others.length?'Lokasi dan rute kamu sedang dibagikan di '+esc(others[0].name()):'Lokasi dan rute kamu tidak dibagikan di grup ini')+'</b>'+
    '<button type="button" class="btn pri" data-act="shareon">'+(others.length?'Pindahkan sharing ke grup ini':'Bagikan ke grup ini')+'</button></div>';}
function showIn(){VIEW=self;setMap(self);self.unread=0;updBadge();const b=$('#gBody');$('#gTitle').textContent=gName();const _gc=$('#gClose');if(_gc)_gc.textContent='Kembali';
  b.innerHTML='<div id="gStat" class="small"></div><button type="button" class="btn pri gbig" data-act="gchat" style="margin:4px 0 10px">Buka chat grup<span id="gUnread" class="gun" hidden></span></button>'+
   (G.ar&&G.joined?'<button type="button" class="btn gbig" data-act="rcsend" style="margin:0 0 10px">Kirim rute ke chat</button>':'')+
   '<div class="ghead"><div class="small">Sisa waktu <b id="gTime"></b> · '+(G.mode==='p'?'Password':'Persetujuan')+(G.ar?'':' · tanpa berbagi rute')+'</div><div class="gcode" data-act="copycode" role="button"><small>Kode grup</small><b>'+esc(G.code)+'</b><span>Salin</span></div><div class="row2"><button type="button" class="btn" data-act="share">Bagikan</button><button type="button" class="btn" data-act="copy">Salin tautan</button></div></div>'+
   '<div id="gPend"></div>'+
   '<div id="gTabMem"><div class="gsec" id="gShareBox">'+shareBox()+'</div><div id="gMembers"></div><div class="gsec pfbox">'+profileHTML()+'</div></div>'+
   '<div class="gsec"><button type="button" class="btn dng" data-act="leave">'+(G.owner?'Hentikan grup':'Keluar dari grup')+'</button></div>';
  $('#gBody').dataset.view='in';updHead();updMembers();updChat();updPending();updStat();}
function shareTxt(){return 'Gabung grup perjalanan saya di jejakcommuter. Kode: '+G.code+(G.mode==='p'?' (butuh password 6 angka dari saya)':'');}
function link(){if(G.tripUrl)return G.tripUrl;const u=new URL(shareBase());u.search='';u.hash='';u.searchParams.set('g',G.code);u.searchParams.set('m',G.mode);return u.toString();}
function updHead(){if(!vis())return;const e=$('#gTime');if(e&&G)e.textContent=fmtT(G.exp-Date.now());}
function updStat(){if(!vis())return;const e=$('#gStat');if(!e||!G)return;e.textContent=G.online?(useServer()?'Terhubung':'Mode lokal (antar tab)'):'Offline, menyambung ulang…';e.className='small '+(G.online?'ok':'off');}
function updMembers(){if(!vis())return;if(G&&G.viewer){updViewer();fitViewer();}const e=$('#gMembers');if(!e||!G)return;const now=Date.now();
  e.innerHTML='<div class="gl">Anggota ('+G.roster.size+'/'+G.max+')</div>'+[...G.roster.values()].map(m=>{
    const on=m.id===G.me||now-(m.seen||0)<15000;const hasR=!!(m.route||(m.id===G.me&&G.share.route&&J()&&J().S.opts[J().S.sel]));
    const c=m.id===G.me?myColorEff():m.color;
    return '<div class="mem"><span class="gd sm" style="background:'+(m.id===G.me?(P.dot||c):(m.dot||c))+';border-color:'+caseFor(m.dot||c)+';color:'+(caseFor(m.dot||c)==='#FFFFFF'?'#fff':'#14202B')+'">'+esc(initial(m.name))+'</span>'+
     '<div class="mi"><b>'+esc(m.name)+(m.id===G.me?' (kamu)':'')+'</b>'+(m.owner?' <span class="tg">pemilik</span>':'')+'<div class="small">'+(on?'online':(m.bg?'HP dikunci atau aplikasi di latar sejak '+hhmm(m.bg)+' · terakhir terlihat '+ago(now-(m.seen||m.bg))+' lalu':'terakhir terlihat '+(m.seen?ago(now-m.seen)+' lalu':'belum bergabung')))+(hasR&&m.route&&m.route.f?' · '+esc(m.route.f)+' → '+esc(m.route.t):'')+'</div></div>'+
     '<span class="rc" style="background:'+c+';border-color:'+caseFor(c)+'" title="Warna rute"></span>'+
     (G.owner&&m.id!==G.me?'<button type="button" class="btn sm" data-act="kick" data-id="'+m.id+'">Keluarkan</button>':'')+'</div>';}).join('');}
function updPending(){updBadge();if(!vis())return;const e=$('#gPend');if(!e||!G)return;let h='';
  if(G.owner){G.pend.forEach(r=>{h+='<div class="pend"><b>'+esc(r.name)+'</b> ingin bergabung<div class="row2"><button type="button" class="btn pri" data-act="ok" data-id="'+r.id+'">Setujui</button><button type="button" class="btn" data-act="no" data-id="'+r.id+'">Tolak</button></div></div>';});
    (G.hreq||[]).forEach(id=>{const m=G.roster.get(id);if(!m)return;h+='<div class="pend"><b>'+esc(m.name)+'</b> minta riwayat chat<div class="row2"><button type="button" class="btn pri" data-act="hok" data-id="'+id+'">Izinkan</button><button type="button" class="btn" data-act="hno" data-id="'+id+'">Tidak</button></div></div>';});}
  e.innerHTML=h;
  const hh=$('#gHist');if(hh)hh.innerHTML=(!G.owner&&!G.histAsked&&G.confirmed)?'<button type="button" class="btn sm" data-act="hreq">Minta riwayat chat</button>':(G.histAsked&&!G.owner?'<p class="small">Permintaan riwayat dikirim ke pemilik.</p>':'');}
function rcHTML(c){const r=c.rc;return '<span class="rcd"><b>'+esc(r.f||'Asal')+' → '+esc(r.t||'Tujuan')+'</b><small>'+esc(r.ti||'')+(r.tot?' · ±'+r.tot+' mnt':'')+'</small><span class="rca"><button type="button" class="btn sm" data-act="rcsee" data-id="'+esc(c.id)+'">Lihat di peta</button><button type="button" class="btn sm" data-act="rcsave" data-id="'+esc(c.id)+'">Simpan</button></span></span>';}
function updChat(){if(!vis())return;const e=$('#gLog');if(!e||!G)return;const atEnd=e.scrollHeight-e.scrollTop-e.clientHeight<40;
  const ct=$('#chH b');if(ct)ct.textContent=gName();
  e.innerHTML=G.chat.map(c=>{const m=G.roster.get(c.from);const mine=c.from===G.me;const col=m?m.color:'#888';
    const d=new Date(c.ts||Date.now()),hm=String(d.getHours()).padStart(2,'0')+'.'+String(d.getMinutes()).padStart(2,'0');
    const wc=!appDark()?(lum(col)>.8?'#555':col):(lum(col)<.25?'#cfd8e0':col);
    return '<div class="msg'+(mine?' me':'')+'"><span class="who"><span style="color:'+wc+'">'+esc(m?m.name:'?')+'</span><span class="tm">'+hm+'</span></span>'+(c.rc?rcHTML(c):'<span class="tx">'+esc(c.text)+'</span>')+'</div>';}).join('')||'<p class="small">Belum ada pesan.</p>';
  if(atEnd||chatOpen())e.scrollTop=e.scrollHeight;}
async function sendChat(text,q){text=String(text||'').trim().slice(0,500);if(!text||!G||!G.key)return;
  const now=Date.now();if(G.lastSend&&now-G.lastSend<700)return;G.lastSend=now;
  const c={id:rand(8),from:G.me,text,ts:now,q:q?1:0};G.chat.push(c);updChat();bubble(G.me,text);
  await sendE({t:'chat',id:c.id,from:G.me,text,ts:c.ts,q:c.q},true);botReply();}
async function sendRouteCard(){const j=J();const r=buildRoute();if(!r||!j||!j.S.from||!j.S.to){toast('Cari rute dulu, lalu pilih satu.');return;}
  const S=j.S,rc={f:r.f,t:r.t,ti:r.ti,tot:r.tot,fp:[+S.from.lat.toFixed(6),+S.from.lon.toFixed(6)],tp:[+S.to.lat.toFixed(6),+S.to.lon.toFixed(6)]};
  const c={id:rand(8),from:G.me,text:'',ts:Date.now(),rc};G.chat.push(c);updChat();
  await sendE({t:'chat',id:c.id,from:G.me,text:'',ts:c.ts,rc},true);toast('Rute dikirim ke chat '+gName());}
function routeFromCard(id){const c=G.chat.find(x=>x.id===id);return c&&c.rc;}

/* ---------- berbagi lokasi & rute: hanya di 1 grup ---------- */
function setShare(on){if(!G)return;
  if(on){sharers().filter(e=>e!==self).slice(0,Math.max(0,sharers().length-SHARE_MAX+1)).forEach(e=>e.setShare(false));
    G.share={loc:true,route:!!G.ar};if(J()&&J().locate)J().locate();}
  else G.share={loc:false,route:false};
  G.routeSig='';sendHB();sendRoute(true);if(vis()){const sb=$('#gShareBox');if(sb)sb.innerHTML=shareBox();updMembers();}listRefresh();}

/* ---------- data untuk simpan sesi ---------- */
function data(){if(!G||!G.key||!G.raw||G.sim)return null;
  return{code:G.code,name:G.name||'',ar:G.ar!==false,mode:G.mode,owner:G.owner,viewer:!!G.viewer,me:G.me,raw:b64u(G.raw),max:G.max,exp:G.exp,tripUrl:G.tripUrl||null,share:G.share,old:G.old||[],cp:G.cp||null,trail:(G.trail||[]).slice(-300),chat:G.chat.slice(-100),pubs:G.pubs,unread:self.unread,
    roster:[...G.roster.values()].map(m=>({id:m.id,name:m.name,color:m.color,dot:m.dot,owner:m.owner}))};}
async function resume(x){
  G=newG({code:x.code,name:x.name||'',ar:x.ar!==false,mode:x.mode,owner:x.owner,viewer:x.viewer,me:x.me,max:x.max,exp:x.exp,tripUrl:x.tripUrl,share:x.share||{loc:true,route:true},confirmed:!!x.owner,joined:true});
  G.raw=unb64u(x.raw);G.key=await aesFrom(G.raw);G.kp=await ecKP();G.old=x.old||[];G.cp=x.cp||null;G.trail=x.trail||[];G.chat=x.chat||[];G.pubs=x.pubs||{};self.unread=x.unread||0;
  (x.roster||[]).forEach(m=>G.roster.set(m.id,Object.assign({},m,{seen:0,joined:true})));
  if(!G.roster.has(G.me))G.roster.set(G.me,{id:G.me,name:P.name||'Saya',color:P.color||COLORS[2][1],dot:P.dot,owner:!!x.owner,seen:Date.now(),joined:true});
  await connect();
  if(G.viewer){clearInterval(tickT);clearInterval(hbT);tickT=setInterval(tick,1000);const ping=()=>{if(G&&G.viewer)sendE({t:'vw',id:G.me},true);};hbT=setInterval(ping,10000);setTimeout(ping,500);viewerWait();}
  else{startTimers();if(!G.owner){let n=0;const iv=setInterval(()=>{if(!G){clearInterval(iv);return;}if(G.online||++n>25){clearInterval(iv);G.confirmed=false;afterKey();}},300);}}}
async function reconnect(){if(!G||G.reconnecting)return;G.reconnecting=true;try{try{G.tx&&G.tx.leave();}catch(e){}G.online=false;await connect();if(G.viewer)sendE({t:'vw',id:G.me},true);else{await sendHB();}}catch(e){}finally{if(G)G.reconnecting=false;}}

/* ---------- aksi dari panel (hanya grup yang sedang dibuka) ---------- */
async function act(a,el){const id=el&&el.dataset.id;
  switch(a){
   case'copy':{try{await navigator.clipboard.writeText(link());if(!(window.__sysCopy&&window.__sysCopy()))toast('Tautan disalin');}catch(_){toast(link(),9000);}break;}
   case'share':{const url=link(),text=G.mode==='v'?P.name+' membagikan perjalanannya.':shareTxt(),title=G.mode==='v'?'Perjalanan saya':gName();
    try{const CS=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Share;
      if(CS&&CS.share)await CS.share({title,text,url,dialogTitle:'Bagikan lewat'});
      else if(navigator.share)await navigator.share({title,text,url});
      else{await navigator.clipboard.writeText(text+'\n'+url);toast('Tautan disalin');}}catch(_){}break;}
   case'copycode':{try{await navigator.clipboard.writeText(G.code);if(!(window.__sysCopy&&window.__sysCopy()))toast('Kode disalin');}catch(_){toast(G.code,9000);}break;}
   case'leave':await stopGroup();break;
   case'ok':await approve(id);break;case'no':deny(id);break;
   case'kick':await kick(id);break;
   case'hok':await grantHistory(id);break;case'hno':denyHistory(id);break;
   case'hreq':{G.histAsked=true;await sendE({t:'hreq',id:G.me},true);updPending();break;}
   case'send':{const i=$('#gMsg');await sendChat(i.value,false);i.value='';break;}
   case'gchat':openChat(true);break;
   case'shareon':setShare(true);toast('Lokasi'+(G.ar?' dan rute':'')+' kamu sekarang dibagikan di '+gName());break;
   case'shareoff':setShare(false);toast('Berhenti berbagi di '+gName());break;
   case'rcsend':await sendRouteCard();break;
   case'rcsee':{const r=routeFromCard(id);const j=J();if(!r||!j)break;openChat(false);openPanel(false);if(window.__jshell)window.__jshell.setTab('peta');
     j.setPoint('from',{lat:r.fp[0],lon:r.fp[1],label:r.f},false);j.setPoint('to',{lat:r.tp[0],lon:r.tp[1],label:r.t},false);const go=$('#go');if(go)go.click();break;}
   case'rcsave':{const r=routeFromCard(id);const j=J();if(!r||!j)break;const S=j.S;const f={lat:r.fp[0],lon:r.fp[1],label:r.f},t={lat:r.tp[0],lon:r.tp[1],label:r.t};
     if(!S.saved.some(s=>s.from.label===f.label&&s.to.label===t.label)){S.saved.unshift({from:f,to:t});S.saved=S.saved.slice(0,12);try{localStorage.setItem('jc_saved_v3',JSON.stringify(S.saved));}catch(e){}if(typeof window.renderSaved==='function')window.renderSaved();}
     toast('Rute disimpan di Rute tersimpan');break;}
  }}
function onChange(t){if(!G)return;if(t.id==='gShLoc'){G.share.loc=t.checked;if(!G.share.loc&&!G.share.route){setShare(false);return;}if(G.share.loc&&J()&&J().locate)J().locate();sendHB();listRefresh();}
  if(t.id==='gShRt'){G.share.route=t.checked&&G.ar;if(!G.share.loc&&!G.share.route){setShare(false);return;}G.routeSig='';sendRoute(true);listRefresh();}}

Object.defineProperty(self,'G',{get(){return G;}});
Object.assign(self,{updMembers,createGroup,joinGroup,startTrip,joinTrip,resume,act,onChange,sendChat,approve,kick,stopGroup,endLocal,showIn,showTrip,showViewer,drawGroup,clearMarkers,data,reconnect,setShare,gName,name:gName,updChat,openChatIfView:()=>openChat(true),
  bot:()=>startBots(),bubble,isViewer:()=>!!(G&&G.viewer)});
return self;}

/* ---------- lapisan peta bersama ---------- */
function ensureLayers(){const j=J();if(!j)return false;const map=j.map;if(!map.getSource('route'))return false;if(map.getSource('grp'))return true;
  map.addSource('grp',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
  const w=['interpolate',['linear'],['zoom'],9,5,15,9];
  const NOT=['!',['in',['get','k'],['literal',['walk','old','trail']]]];
  map.addLayer({id:'grp-old',type:'line',source:'grp',filter:['==',['get','k'],'old'],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#8A97A3','line-width':4,'line-dasharray':[2,1.6],'line-opacity':.85}},'poi');
  map.addLayer({id:'grp-case',type:'line',source:'grp',filter:NOT,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':['get','cs'],'line-width':['interpolate',['linear'],['zoom'],9,8,15,13],'line-opacity':.9}},'poi');
  map.addLayer({id:'grp-line',type:'line',source:'grp',filter:NOT,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':['get','c'],'line-width':w}},'poi');
  map.addLayer({id:'grp-walk',type:'line',source:'grp',filter:['==',['get','k'],'walk'],layout:{'line-join':'round'},paint:{'line-color':['get','c'],'line-width':3.5,'line-dasharray':[1,1.6]}},'poi');
  map.addLayer({id:'grp-trail',type:'line',source:'grp',filter:['==',['get','k'],'trail'],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':['get','c'],'line-width':4,'line-opacity':.55}},'poi');
  return true;}
function clearGrpSource(){const j=J();if(j&&j.map&&j.map.getSource('grp'))j.map.getSource('grp').setData({type:'FeatureCollection',features:[]});}
function setMap(e){if(MAPE===e)return;const old=MAPE;MAPE=e;if(old&&ENG.includes(old))old.clearMarkers();if(!e)clearGrpSource();else e.drawGroup();}

/* ---------- server: batas grup ---------- */
const GERR={batas_buat_grup:'Batas membuat grup tercapai (3 grup per 24 jam).',batas_ikut_grup:'Maksimal ikut 5 grup. Keluar dari salah satu grup dulu.',grup_tidak_ada:'Grup tidak ditemukan atau sudah berakhir.',kode_salah:'Kode grup tidak valid.',belum_login:'Masuk dengan Google dulu.'};
function gerr(e){const m=(e&&e.message)||'';for(const k in GERR)if(m.indexOf(k)>-1)return GERR[k];return null;}
const jc=()=>window.__jchat;
const loggedIn=()=>!!(jc()&&jc().uid&&jc().uid());
async function srvCall(n,a){return jc().rpc(n,a);}
function srvLeave(code){try{if(loggedIn())srvCall('group_leave',{p_code:code}).catch(()=>{});}catch(e){}}
async function needLogin(){if(!useServer()||loggedIn())return true;toast('Masuk dengan Google dulu untuk membuat atau ikut grup.',6000);try{if(jc()&&jc().googleLogin)jc().googleLogin();}catch(e){}return false;}
function localLimit(kind){const gs=groups();if(gs.length>=5)return 'Maksimal ikut 5 grup. Keluar dari salah satu grup dulu.';
  if(kind==='new'){const day=Date.now()-24*3600e3;let made=[];try{made=JSON.parse(localStorage.getItem('jc_grp_made')||'[]').filter(t=>t>day);}catch(e){}if(made.length>=3)return 'Batas membuat grup tercapai (3 grup per 24 jam). Bisa buat lagi pukul '+hhmm(Math.min(...made)+24*3600e3)+'.';}
  return null;}
function noteMade(){try{const day=Date.now()-24*3600e3;const m=JSON.parse(localStorage.getItem('jc_grp_made')||'[]').filter(t=>t>day);m.push(Date.now());localStorage.setItem('jc_grp_made',JSON.stringify(m));}catch(e){}}
async function srvLimitInfo(){if(!useServer()||!loggedIn())return null;try{return await srvCall('my_groups');}catch(e){return null;}}

/* ---------- UI bersama ---------- */
const isOpen=()=>$('#grp').classList.contains('open');
function openPanel(v){const el=$('#grp');el.classList.toggle('open',v);el.setAttribute('aria-hidden',!v);$('#grpBtn').hidden=v;if(v){if(window.__closeUrgent)window.__closeUrgent();}}
window.__closeGrp=()=>openPanel(false);
function updBadge(){const b=$('#grpBadge');let n=0;groups().forEach(e=>{const G=e.G;if(G&&G.owner)n+=G.pend.length+(G.hreq||[]).length;});b.textContent=n;b.hidden=!n;
  const cb=$('#chatBtn');if(cb){cb.hidden=true;}}
/* ---------- chat grup layar penuh ---------- */
const CHK='jc_chat_v1';const CH={op:85,th:'dark'};try{Object.assign(CH,JSON.parse(localStorage.getItem(CHK)||'{}'));}catch(e){}
function appDark(){const t=document.documentElement.getAttribute('data-theme');return t?t==='dark':!!(window.matchMedia&&matchMedia('(prefers-color-scheme:dark)').matches);}
try{new MutationObserver(()=>{chatApply();if(chatOpen()&&VIEW)VIEW.updChat();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});}catch(e){}
function chatApply(){const c=$('#chat');if(!c)return;c.dataset.theme=appDark()?'dark':'light';c.style.setProperty('--co',String((window.__jcOp&&window.__jcOp())||1));
  document.querySelectorAll('#chTh button').forEach(b=>b.classList.toggle('on',b.dataset.th===CH.th));try{localStorage.setItem(CHK,JSON.stringify(CH));}catch(e){}}
function chatOpen(){const c=$('#chat');return !!c&&c.classList.contains('open');}
function openChat(v){const c=$('#chat');if(!c)return;const G=VIEW&&VIEW.G;if(v&&!(G&&!G.viewer&&G.mode!=='v'))return;
  c.classList.toggle('open',v);c.setAttribute('aria-hidden',!v);document.documentElement.classList.toggle('chatopen',v);
  if(v){openPanel(false);if(window.__closeUrgent)window.__closeUrgent();VIEW.unread=0;chatApply();VIEW.updChat();const l=$('#gLog');if(l)l.scrollTop=l.scrollHeight;}
  updBadge();}
function chatDrag(){const H=$('#chH'),C=$('#chat'),Sh=$('#chSheet');if(!H)return;let dr=null;
  H.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;dr={f:null};try{H.setPointerCapture(e.pointerId);}catch(_){}Sh.classList.add('drag');});
  H.addEventListener('pointermove',e=>{if(!dr)return;const r=C.getBoundingClientRect();const f=Math.max(.3,Math.min(1,(r.bottom-e.clientY+18)/r.height));C.style.setProperty('--chf',f);dr.f=f;});
  const end=()=>{if(!dr)return;const f=dr.f==null?(parseFloat(C.style.getPropertyValue('--chf'))||1):dr.f;dr=null;Sh.classList.remove('drag');C.style.setProperty('--chf',[1,.62,.38].reduce((a,b)=>Math.abs(a-f)<Math.abs(b-f)?a:b));};
  H.addEventListener('pointerup',end);H.addEventListener('pointercancel',end);}

/* ---------- daftar grup ---------- */
let LIM=null,limAt=0;
function limText(){const gs=groups();const made=LIM?LIM.created_24h:(()=>{try{const d=Date.now()-24*3600e3;return JSON.parse(localStorage.getItem('jc_grp_made')||'[]').filter(t=>t>d).length;}catch(e){return 0;}})();
  const lc=LIM?LIM.lim_create:3,lj=LIM?LIM.lim_join:5;return 'Grup diikuti '+gs.length+'/'+lj+' · Dibuat 24 jam terakhir '+made+'/'+lc;}
function rowFor(e){const G=e.G;if(!G)return '';const n=[...G.roster.values()].filter(m=>m.joined!==false).length,me=G.roster.get(G.me)||{};const col=me.color||'#2F5FB5';const nm=e.gName();
  const sh=(G.share.loc||G.share.route)&&G.mode!=='v';const pend=G.owner?G.pend.length:0;
  const sub=G.mode==='v'?(G.viewer?'Melihat perjalanan · sisa ':'Dibagikan lewat tautan · sisa ')+fmtT(G.exp-Date.now()).replace(/:\d\d$/,''):n+'/'+G.max+' anggota · sisa '+fmtT(G.exp-Date.now()).replace(/:\d\d$/,'')+(G.owner?' · pemilik':'');
  return '<button type="button" class="grow" data-act="gopen" data-code="'+esc(G.code)+'"><span class="gav" style="background:'+esc(col)+'">'+esc((nm.replace(/^Grup\s+/i,'')||'G').charAt(0).toUpperCase())+'</span><span class="gtx"><b>'+esc(nm)+'</b><small>'+esc(sub)+'</small>'+(sh?'<small class="gsh">Lokasi'+(G.ar&&G.share.route?' dan rute':'')+' kamu dibagikan di sini</small>':'')+(pend?'<small class="gsh">'+pend+' orang ingin bergabung</small>':'')+'</span>'+(e.unread?'<span class="gun">'+e.unread+'</span>':'')+'<span class="gchev">›</span></button>';}
function listRefresh(){const l=$('#gList');if(l){l.innerHTML=ENG.map(rowFor).join('');const lt=$('#gLim');if(lt)lt.textContent=limText();}}
setInterval(()=>{if($('#gBody')&&$('#gBody').dataset.view==='home'&&$('#gBody').dataset.sub==='home')listRefresh();},1000);
function showHome(sub){const b=$('#gBody');const q=new URLSearchParams(location.search);const lc=q.get('g'),lm=q.get('m')==='p'?'p':'a';
  const J0=JN||(lc?{code:lc,mode:lm}:null);
  sub=sub||(J0?'join':'home');const back=$('#gClose');
  const srv=useServer()?'':'<p class="note">Server berbagi belum diatur. Grup hanya berfungsi antar tab di perangkat ini (untuk uji coba).</p>';
  if(back)back.textContent=sub==='home'?'Tutup':'Kembali';
  if(sub==='home'){VIEW=null;}
  if(sub==='home'&&ENG.length){$('#gTitle').textContent='Grup';
    b.innerHTML=srv+'<div class="glist" id="gList">'+ENG.map(rowFor).join('')+'</div>'+
      '<div class="gacts"><button type="button" class="btn pri gbig" data-act="gnew">Buat grup</button><button type="button" class="btn gbig" data-act="gcode">Masukkan kode</button><p class="small" id="gLim" style="text-align:center">'+esc(limText())+'</p></div>';
    if(Date.now()-limAt>15000){limAt=Date.now();srvLimitInfo().then(x=>{if(x){LIM=x;listRefresh();}});}}
  else if(sub==='home'){$('#gTitle').textContent='Grup';
    b.innerHTML=srv+'<div class="gem"><div class="gemi"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 19c0-3.2 2.7-5 6-5s6 1.8 6 5"/><circle cx="17.5" cy="9" r="2.4"/><path d="M17 14.2c2.4.1 4 1.5 4 4"/></svg></div>'+
      '<h3>Belum ada grup</h3><p>Buat grup untuk lihat posisi teman di peta selama perjalanan.</p>'+
      '<button type="button" class="btn pri gbig" data-act="gnew">Buat grup</button><button type="button" class="btn gbig" data-act="gcode">Masukkan kode</button>'+
      '<p class="small">Bisa ikut sampai 5 grup. Grup aktif maksimal 2 jam. Lokasi, rute, dan chat dienkripsi dan tidak disimpan di server.</p></div>';}
  else if(sub==='new'){$('#gTitle').textContent='Buat grup';
    b.innerHTML=srv+'<div class="gsec pfbox">'+profileHTML()+'</div>'+
     '<div class="gsec"><div class="gl">Nama grup</div><input id="gName" class="gin" maxlength="30" placeholder="'+esc('Grup '+(P.name||'Saya'))+'" autocomplete="off"><div class="gl">Jumlah anggota</div><div class="seg" id="gSize"><button type="button" data-n="3">3</button><button type="button" data-n="4">4</button><button type="button" data-n="5" class="on">5</button></div>'+
     '<div class="gl">Cara masuk</div><div class="seg" id="gMode"><button type="button" data-m="a" class="on">Persetujuan pemilik</button><button type="button" data-m="p">Password 6 angka</button></div>'+
     '<input id="gPw" class="gin" inputmode="numeric" maxlength="6" placeholder="6 angka" hidden>'+
     '<label class="chk"><input type="checkbox" id="gAr" checked> Izinkan berbagi rute</label>'+
     '<label class="chk"><input type="checkbox" id="gSim"> Tambah teman simulasi (untuk uji sendiri)</label></div>'+
     '<button type="button" class="btn pri gbig" data-act="create">Buat grup</button>';}
  else if(sub==='code'){$('#gTitle').textContent='Masukkan kode';
    b.innerHTML=srv+'<div class="gsec"><div class="gl">Kode atau tautan grup</div><input id="gJoinIn" class="gin" placeholder="Ketik kode atau tempel tautan" autocomplete="off" autocapitalize="characters"></div><button type="button" class="btn pri gbig" data-act="joinlink">Lanjut</button>';}
  else{$('#gTitle').textContent='Gabung grup';
    const already=ENG.find(e=>e.G&&e.G.code===J0.code);
    b.innerHTML=srv+(already?'<div class="gsec"><p>Kamu sudah ada di grup ini.</p><button type="button" class="btn pri gbig" data-act="gopen" data-code="'+esc(J0.code)+'">Buka grup</button></div>':
     '<div class="gsec pfbox">'+profileHTML()+'</div><div class="gsec"><p class="small">Kode grup: <b>'+esc(J0.code)+'</b></p>'+(J0.mode==='p'?'<input id="gJoinPw" class="gin" inputmode="numeric" maxlength="6" placeholder="Password 6 angka">':'<p class="small">Pemilik grup perlu menyetujui permintaanmu.</p>')+
     '<p class="small">Dengan bergabung, lokasi dan rute yang kamu bagikan terlihat oleh semua anggota grup. Kamu bisa berhenti kapan saja.</p></div><button type="button" class="btn pri gbig" data-act="join" data-code="'+esc(J0.code)+'" data-mode="'+J0.mode+'">Gabung grup</button>');}
  $('#gBody').dataset.view='home';$('#gBody').dataset.sub=sub;}

/* ---------- buat / gabung / perjalanan (lintas grup) ---------- */
function addEngine(){const e=Engine();ENG.push(e);return e;}
function dropEngine(e){const i=ENG.indexOf(e);if(i>-1)ENG.splice(i,1);if(VIEW===e)VIEW=null;if(MAPE===e)setMap(ENG[0]||null);}
async function createGroup(o){
  if(!P.name){toast('Isi nama kamu dulu.');const f=document.querySelector('#grp .pfName');if(f)f.focus();return;}
  if(o.mode==='p'&&!/^\d{6}$/.test(o.pw)){toast('Password harus 6 angka.');return;}
  if(!(await needLogin()))return;
  if(!useServer()){const lm=localLimit('new');if(lm){toast(lm,7000);return;}}
  let code=mkCode(o.mode),exp=null,ar=o.ar!==false;
  if(useServer()){for(let k=0;k<3;k++){try{const r=await srvCall('group_create',{p_code:code,p_allow_route:ar});exp=new Date(r.exp).getTime();break;}
      catch(er){const m=(er&&er.message)||'';if(m.indexOf('kode_dipakai')>-1&&k<2){code=mkCode(o.mode);continue;}
        let t=gerr(er)||'Gagal membuat grup. Coba lagi.';if(m.indexOf('batas_buat_grup')>-1){const x=await srvLimitInfo();if(x&&x.next_free)t+=' Bisa buat lagi pukul '+hhmm(new Date(x.next_free).getTime())+'.';}toast(t,8000);return;}}}
  else noteMade();
  const e=addEngine();VIEW=e;try{await e.createGroup(Object.assign({},o,{code,exp,ar}));}catch(er){dropEngine(e);throw er;}
  LIM=null;limAt=0;}
async function joinGroup(o){
  if(!P.name){toast('Isi nama kamu dulu.');const f=document.querySelector('#grp .pfName');if(f)f.focus();return;}
  if(o.mode==='p'&&!/^\d{6}$/.test(o.pw)){toast('Password harus 6 angka.');return;}
  const ex=ENG.find(e=>e.G&&e.G.code===o.code);if(ex){ex.showIn();return;}
  if(!(await needLogin()))return;
  let exp=null,ar=true;
  if(useServer()){try{const r=await srvCall('group_join',{p_code:o.code});exp=new Date(r.exp).getTime();ar=r.allow_route!==false;}catch(er){toast(gerr(er)||'Gagal bergabung. Coba lagi.',7000);return;}}
  else{const lm=localLimit('join');if(lm){toast(lm,7000);return;}}
  JN=null;const e=addEngine();VIEW=e;try{await e.joinGroup(Object.assign({},o,{exp,ar}));}catch(er){dropEngine(e);throw er;}
  LIM=null;limAt=0;}
async function startTrip(){const j=J();
  if(!j||!j.S.opts[j.S.sel]){toast('Cari rute dulu, lalu pilih satu.');return;}
  const tr=ENG.find(e=>e.G&&e.G.mode==='v'&&e.G.owner);if(tr){toast('Perjalananmu sudah dibagikan.');openPanel(true);tr.showTrip();return;}
  if(!P.name){toast('Isi nama kamu dulu di Profil.');return;}
  const code=rand(10),raw=crypto.getRandomValues(new Uint8Array(32));
  const u=new URL(shareBase());u.search='';u.hash='';u.searchParams.set('v',code);u.hash='k='+b64u(raw);const url=u.toString();
  let shared=false;
  try{if(navigator.share){await navigator.share({title:'Perjalanan saya',text:P.name+' membagikan perjalanannya. Buka untuk melihat rute dan posisinya.',url});shared=true;}}
  catch(e){if(e&&e.name==='AbortError')return;}
  const e=addEngine();VIEW=e;await e.startTrip(url,code,raw);
  if(!shared){try{await navigator.clipboard.writeText(url);toast('Tautan disalin. Kirim ke orang yang ingin melihat perjalananmu.',7000);}catch(_){}openPanel(true);}else toast('Perjalanan dibagikan.');}
async function joinTrip(code,kb){const e=addEngine();VIEW=e;await e.joinTrip(code,kb);}
/* pilihan grup untuk pop-up Mulai/Bagikan rute */
function shareTo(code){const e=groups().find(x=>x.G.code===code);
  if(!code){sharers().forEach(x=>x.setShare(false));return;}
  if(!e)return;if(!e.G.ar){toast(e.gName()+' tidak mengizinkan berbagi rute. Hanya lokasi yang dibagikan.',6000);}e.setShare(true);}

/* ---------- event ---------- */
function fail(err){console.log('GERR',err&&err.message);toast('Gagal tersambung ke server. Cek internetmu lalu coba lagi.',8000);showHome('home');}
async function safe(fn){try{await fn();}catch(err){fail(err);}}
document.addEventListener('click',async e=>{
  if(e.target.closest('#rShare')){safe(startTrip);return;}
  if(e.target.closest('#chat')){
    if(e.target.closest('#chX')){const v=VIEW;openChat(false);if(v&&v.G){if(window.__jshell&&window.__jshell.openGrp)window.__jshell.openGrp();else openPanel(true);VIEW=v;if(!v.isViewer())v.showIn();}return;}
    if(e.target.closest('#chSet')){const o=$('#chOpt');o.hidden=!o.hidden;return;}
    const th=e.target.closest('#chTh button');if(th){CH.th=th.dataset.th;chatApply();if(VIEW)VIEW.updChat();return;}
    const q2=e.target.closest('[data-q]');if(q2&&VIEW){VIEW.sendChat(q2.dataset.q,true);return;}
    const a2=e.target.closest('[data-act]');if(a2&&VIEW){try{await VIEW.act(a2.dataset.act,a2);}catch(er){fail(er);}}
    return;}
  const gb=e.target.closest('#grpBtn');if(gb){if(chatOpen())openChat(false);openPanel(true);const vw=$('#gBody').dataset.view;if(!(VIEW&&vw==='wait'))showHome('home');return;}
  if(e.target.closest('#gClose')){const v=$('#gBody').dataset.view,sub=$('#gBody').dataset.sub;
    if(v==='in'||v==='trip'||v==='viewer'||v==='wait'){showHome('home');return;}
    if(v==='home'&&sub!=='home'){if(sub==='join'){JN=null;try{const u=new URL(location.href);u.searchParams.delete('g');u.searchParams.delete('m');history.replaceState(null,'',u.toString());}catch(_){}}showHome('home');return;}
    openPanel(false);return;}
  const root=e.target.closest('#grp');if(!root)return;
  const sz=e.target.closest('#gSize button');if(sz){document.querySelectorAll('#gSize button').forEach(x=>x.classList.toggle('on',x===sz));return;}
  const md=e.target.closest('#gMode button');if(md){document.querySelectorAll('#gMode button').forEach(x=>x.classList.toggle('on',x===md));$('#gPw').hidden=md.dataset.m!=='p';return;}
  const qb=e.target.closest('[data-q]');if(qb&&VIEW){VIEW.sendChat(qb.dataset.q,true);return;}
  const a=e.target.closest('[data-act]');if(!a)return;
  try{switch(a.dataset.act){
   case'gnew':{if(!(await needLogin()))break;const lm=useServer()?(groups().length>=((LIM&&LIM.lim_join)||5)?GERR.batas_ikut_grup:null):localLimit('new');if(lm){toast(lm,7000);break;}showHome('new');break;}
   case'gcode':{if(!(await needLogin()))break;const lm=useServer()?(groups().length>=((LIM&&LIM.lim_join)||5)?GERR.batas_ikut_grup:null):localLimit('join');if(lm){toast(lm,7000);break;}showHome('code');break;}
   case'gopen':{const x=ENG.find(z=>z.G&&z.G.code===a.dataset.code);if(!x)break;VIEW=x;if(x.G.mode==='v'){if(x.G.viewer)x.showViewer();else x.showTrip();}else x.showIn();break;}
   case'create':{const n=+document.querySelector('#gSize .on').dataset.n,m=document.querySelector('#gMode .on').dataset.m;await createGroup({max:n,mode:m,pw:$('#gPw').value.trim(),sim:$('#gSim').checked,name:($('#gName').value||'').trim(),ar:$('#gAr').checked});break;}
   case'join':{const mode=a.dataset.mode;const pw=mode==='p'?($('#gJoinPw').value||'').trim():'';await joinGroup({code:a.dataset.code,mode,pw});break;}
   case'joinlink':{const r=parseJoin($('#gJoinIn').value);if(!r){toast('Kode atau tautan tidak valid.');break;}JN=r;showHome('join');break;}
   default:if(VIEW)await VIEW.act(a.dataset.act,a);
  }}catch(err){fail(err);}});
document.addEventListener('input',e=>{if(e.target.id==='chOp'){CH.op=+e.target.value;chatApply();}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='gMsg'&&VIEW){e.preventDefault();VIEW.sendChat(e.target.value,false);e.target.value='';}});
document.addEventListener('change',e=>{if(VIEW&&(e.target.id==='gShLoc'||e.target.id==='gShRt'))VIEW.onChange(e.target);});
document.addEventListener('visibilitychange',()=>{ENG.slice().forEach(x=>{try{x.onVis();}catch(e){}});});
window.__grpFix=()=>{ENG.forEach(x=>{try{x.fix();}catch(e){}});};

/* ---------- pengaturan ---------- */
function mountSettings(){const a=$('#pfMount');if(a){a.className='pfbox';a.innerHTML=profileHTML();}}
/* ---------- simpan & pulihkan sesi (rute + semua grup) ---------- */
const SESS='jc_sess_v1';let restored=false,hidAt=0;
function saveSess(){if(!restored)return;try{const j=J(),s={ts:Date.now()};
  const gs=ENG.map(e=>e.data()).filter(Boolean);if(gs.length)s.gs=gs;
  if(j&&j.S&&j.S.to&&j.S.from){const S=j.S,o=S.opts[S.sel];s.a={from:S.from,to:S.to,title:o&&o.title||'',nav:!!(j.NAV&&j.NAV.on)};}
  if(s.gs||s.a)localStorage.setItem(SESS,JSON.stringify(s));else localStorage.removeItem(SESS);}catch(e){}}
async function resumeSess(){let s=null;try{s=JSON.parse(localStorage.getItem(SESS)||'null');}catch(e){}
  const q=new URLSearchParams(location.search);const plain=!q.get('v');
  try{
  if(s&&plain&&Date.now()-s.ts<3*3600e3){
    const j=await new Promise(r=>{let n=0;const iv=setInterval(()=>{if(window.__jc||++n>100){clearInterval(iv);r(window.__jc);}},200);});
    const list=(s.gs||(s.g?[s.g]:[])).filter(x=>x&&x.exp>Date.now()&&!(q.get('g')&&x.viewer));
    if(j&&list.length){for(const x of list){if(ENG.some(e=>e.G&&e.G.code===x.code))continue;const e=addEngine();try{await e.resume(x);}catch(er){dropEngine(e);}}
      setMap(sharers()[0]||ENG[0]||null);updBadge();listRefresh();toast(list.length>1?list.length+' grup sebelumnya dipulihkan.':'Sesi sebelumnya dipulihkan.',5000);}
    const a=s.a;
    if(a&&a.from&&a.to&&j){j.setPoint('from',a.from,false);j.setPoint('to',a.to,false);const go=document.querySelector('#go');if(go)go.click();
      let n=0;const iv=setInterval(()=>{if(j.S.opts.length||++n>60){clearInterval(iv);if(!j.S.opts.length)return;
        let i=j.S.opts.findIndex(o=>o.title===a.title);if(i<0)i=0;const b=document.querySelector('[data-i="'+i+'"]');if(b)b.click();
        if(a.nav)setTimeout(()=>j.startNav&&j.startNav(),400);}},400);}
  }}catch(e){console.log('GERR resume',e&&e.message);}
  restored=true;}
document.addEventListener('visibilitychange',()=>{if(document.hidden){hidAt=Date.now();saveSess();}else if(hidAt&&Date.now()-hidAt>15000){ENG.forEach(x=>x.reconnect());}});
window.addEventListener('pagehide',saveSess);setInterval(saveSess,4000);
function boot(){window.__toast=toast;mountSettings();applyProfile();chatApply();chatDrag();updBadge();resumeSess();
  const q=new URLSearchParams(location.search);if(q.get('g')){openPanel(true);showHome();}
  else if(q.get('v')){const hm=/k=([A-Za-z0-9_-]+)/.exec(location.hash||'');if(hm){const iv2=setInterval(()=>{if(window.__jc){clearInterval(iv2);safe(()=>joinTrip(q.get('v'),hm[1]));}},300);}else toast('Tautan perjalanan tidak lengkap.');}
  const iv=setInterval(()=>{if(window.__jc){clearInterval(iv);applyProfile();}},300);
  window.__grp={get G(){const e=VIEW||groups()[0]||ENG[0];return e?e.G:null;},get all(){return ENG;},P,startTrip,joinTrip,createGroup,joinGroup,shareTo,decim,buildRoute,enc,dec,pwKey,sealTo,openSeal,ecKP,
    list:()=>groups().map(e=>({code:e.G.code,name:e.gName(),ar:e.G.ar!==false,sharing:!!(e.G.share.loc||e.G.share.route),owner:e.G.owner,joined:!!e.G.joined})),
    stopGroup:()=>VIEW&&VIEW.stopGroup(),sendChat:(t,q)=>VIEW&&VIEW.sendChat(t,q),approve:id=>VIEW&&VIEW.approve(id),kick:id=>VIEW&&VIEW.kick(id)};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
