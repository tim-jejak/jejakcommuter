/* ===== Jecom Teman: tambah teman, berbagi lokasi, berbagi rute ke teman ===== */
(function(){
'use strict';
const $=s=>document.querySelector(s);
const C=()=>window.__jchat,J=()=>window.__jc,GR=()=>window.__grp;
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const toast=t=>{if(window.__jshell)window.__jshell.toast(t);};
const uid=()=>{const c=C();return c&&c.uid?c.uid():null;};
const rpc=(n,a)=>C().rpc(n,a);
const ERR={kode_tidak_ada:'Kode tidak ditemukan',kode_sendiri:'Itu kode kamu sendiri',sudah_teman:'Sudah berteman',sudah_diminta:'Permintaan sudah dikirim',
 teman_penuh:'Jumlah teman sudah penuh',terlalu_banyak:'Terlalu banyak permintaan hari ini',batas_lokasi:'Lebih dari 5 teman belum tersedia',
 batas_rute:'Lebih dari 5 teman belum tersedia',bukan_teman:'Belum berteman',belum_login:'Masuk dulu',durasi_salah:'Durasi tidak valid',rute_terlalu_besar:'Rute terlalu panjang untuk dibagikan'};
function em(e){const m=(e&&e.message)||'';for(const k in ERR)if(m.indexOf(k)>-1)return ERR[k];return C()&&C().errMsg?C().errMsg(e):'Gagal. Coba lagi';}
const PAL=['#D64545','#2E9E6E','#8E55C9','#D0861E','#1E88C7','#C2185B','#00897B','#6D4C41'];
function colOf(id){let s=0;for(let i=0;i<id.length;i++)s=(s*31+id.charCodeAt(i))>>>0;return PAL[s%PAL.length];}
const DUR=[[1,'1 jam'],[2,'2 jam'],[8,'8 jam'],[24,'24 jam'],[0,'Sampai dimatikan']];

const T={st:null,uid:null,mode:'all',busy:false,asked:{},frSeen:{},push:{at:0,pos:null,sig:'',route:false},mk:new Map(),mount:null,open:{},polling:false,lastPoll:0};

/* ---------- gaya ---------- */
const css=document.createElement('style');css.textContent=
'#locChip{display:none!important}'+
'#frChip{order:3;display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:700;line-height:1;height:38px;min-height:38px;box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 8px!important;font-family:inherit;color:inherit;cursor:pointer}'+
'#jfab{position:fixed;right:14px;bottom:calc(var(--jnh,0px) + max(var(--shpx,76px), var(--jch,0px)) + 12px);z-index:13;width:46px;height:46px;border-radius:50%;background:var(--surface);color:#2F6FD6;border:1px solid var(--line);box-shadow:0 2px 10px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;padding:0;transition:bottom .22s ease;-webkit-tap-highlight-color:transparent}'+
'#jfab svg{width:22px;height:22px}'+
'html[data-sheet="full"] #jfab{bottom:calc(var(--jnh,0px) + 14px)}'+
'html:has(#results.drag) #jfab{transition:none}'+
'@media (min-width:761px){#jfab{bottom:calc(var(--jnh,0px) + 14px)}}'+
'html:not([data-tab="peta"]) #jfab,html.nav #jfab,html.chatopen #jfab{display:none}'+
'#jfreq{position:fixed;left:12px;right:12px;z-index:13;background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:14px;box-shadow:0 4px 16px rgba(0,0,0,.2);padding:10px 12px;display:flex;align-items:center;gap:8px;font-size:14px}'+
'#jfreq[hidden]{display:none}'+
'html:not([data-tab="peta"]) #jfreq{display:none}'+
'#jfreq .g{flex:1;min-width:0}'+
'.jtb{border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:10px;padding:8px 12px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}'+
'.jtb.p{background:#2F5FB5;border-color:#2F5FB5;color:#fff}'+
'.jtb:disabled{opacity:.5}'+
'.jtrow{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid var(--line)}.jtrow:last-child{border-bottom:0}'+
'.jtav{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;flex:none}'+
'.jtn{flex:1;min-width:0}.jtn b{display:block;font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.jtn span{font-size:12.5px;color:var(--ink-2)}'+
'.jttg{width:44px;height:26px;border-radius:13px;background:var(--line);position:relative;border:0;flex:none;padding:0;cursor:pointer}.jttg:after{content:"";position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left .15s}.jttg.on{background:#2F5FB5}.jttg.on:after{left:21px}'+
'.jtadd{display:flex;gap:8px;padding:12px 0;border-bottom:1px solid var(--line)}.jtadd input{flex:1;min-width:0;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink);font:inherit;font-size:15px;text-transform:uppercase}'+
'.jtfoot{font-size:12.5px;color:var(--ink-2);padding:8px 2px 0}'+
'.jtx{padding:0 0 12px 44px;display:flex;gap:8px}'+
'#jtm{position:fixed;inset:0;z-index:40;background:rgba(10,15,20,.55);display:flex;align-items:flex-end;justify-content:center}'+
'#jtm[hidden]{display:none}'+
'#jtm .in{background:var(--surface);color:var(--ink);width:100%;max-width:520px;border-radius:20px 20px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));max-height:85vh;overflow:auto;display:flex;flex-direction:column;gap:8px;font-size:14.5px}'+
'#jtm h3{margin:0 0 4px;font-size:16px;text-transform:none;letter-spacing:0;color:var(--ink)}'+
'#jtm .jtlb{font-size:12px;font-weight:700;letter-spacing:.05em;color:var(--ink-2);margin-top:6px}'+
'#jtm label.o{display:flex;align-items:center;gap:10px;padding:11px 12px;border:1px solid var(--line);border-radius:12px;cursor:pointer}'+
'#jtm label.o.dis{opacity:.5}#jtm label.o small{margin-left:auto;font-size:11.5px;color:var(--ink-2);text-align:right}'+
'#jtm .chips{display:flex;gap:6px;flex-wrap:wrap}#jtm .chips button{border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:16px;padding:7px 12px;font:inherit;font-size:13px;cursor:pointer}#jtm .chips button.on{background:var(--ink);color:var(--surface);border-color:var(--ink)}'+
'.jfm{display:flex;flex-direction:column;align-items:center;pointer-events:none}.jfm i{width:22px;height:22px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;font:800 11px/1 system-ui,sans-serif;color:#fff;font-style:normal}'+
'.jfm b{margin-top:3px;background:#fff;color:#14202B;font:700 11px/1.2 system-ui,sans-serif;padding:2px 6px;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,.3);white-space:nowrap}';
document.head.appendChild(css);
if(!document.documentElement.dataset.tab)document.documentElement.dataset.tab='peta';

/* ---------- elemen peta ---------- */
const fab=document.createElement('button');fab.type='button';fab.id='jfab';fab.setAttribute('aria-label','Lokasi saya');
fab.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';
document.body.appendChild(fab);
fab.addEventListener('click',()=>{if(window.__setSheet)window.__setSheet('peek');const lc=$('#locChip');if(lc&&lc.onclick)lc.onclick();else if(lc)lc.click();});
let jchV='';function jchSync(){const jc=$('#jcard');const v=(jc&&!jc.hidden&&jc.style.display!=='none')?Math.round(jc.getBoundingClientRect().height)+'px':'0px';if(v!==jchV){jchV=v;document.documentElement.style.setProperty('--jch',v);}}
setInterval(jchSync,400);

const req=document.createElement('div');req.id='jfreq';req.hidden=true;document.body.appendChild(req);
function reqPos(){const r2=$('#row2')||$('#search');if(r2)req.style.top=Math.round(r2.getBoundingClientRect().bottom+8)+'px';}

function ensureChip(){if($('#frChip'))return;const lc=$('#locChip');if(!lc)return;const b=document.createElement('button');b.type='button';b.className='chip';b.id='frChip';b.textContent='Rute teman';lc.parentNode.insertBefore(b,lc.nextSibling);b.addEventListener('click',cycle);}
ensureChip();

/* ---------- data ---------- */
const friends=()=>T.st?T.st.friends:[];
const okF=()=>friends().filter(f=>f.status==='ok');
const sharers=()=>okF().filter(f=>f.their_route==='ok'&&f.route);
const lim=k=>(T.st&&T.st.lim&&T.st.lim[k])||5;
async function poll(force){
 const u=uid();if(u!==T.uid){T.uid=u;T.st=null;T.mode='all';T.asked={};if(!u){draw();render();showReq();return;}}
 if(!u||T.polling)return;if(!force&&document.hidden)return;
 T.polling=true;
 try{T.st=await rpc('social_state');T.lastPoll=Date.now();}catch(e){T.polling=false;return;}
 T.polling=false;
 okF().forEach(f=>{});
 friends().forEach(f=>{if(f.incoming&&!T.frSeen[f.id]){T.frSeen[f.id]=1;if(T.lastPoll&&T.boot)toast(f.name+' ingin berteman. Buka Profil untuk menerima.');}});
 T.boot=true;
 if(T.mode!=='all'&&T.mode!=='me'&&!sharers().some(f=>f.id===T.mode))T.mode='all';
 label();draw();showReq();render();
}
setInterval(()=>poll(false),10000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll(true);});

/* ---------- notifikasi berbagi rute ---------- */
function showReq(){reqPos();const f=friends().find(x=>x.status==='ok'&&x.their_route==='pending'&&!T.asked[x.id]);
 if(!f){req.hidden=true;return;}
 req.hidden=false;req.dataset.id=f.id;req.innerHTML='<div class="g"><b>'+esc(f.name)+'</b> ingin berbagi rute denganmu</div><button type="button" class="jtb p" data-r="ok">Terima</button><button type="button" class="jtb" data-r="no">Tolak</button>';}
req.addEventListener('click',async e=>{const b=e.target.closest('[data-r]');if(!b)return;const id=req.dataset.id,ok=b.dataset.r==='ok';T.asked[id]=1;showReq();
 try{await rpc('route_share_respond',{p_owner:id,p_accept:ok});if(ok){T.mode='all';toast('Rute ditampilkan di peta');}await poll(true);
  if(ok){const f=friends().find(x=>x.id===id);if(f)fitTo(f);}}catch(er){T.asked[id]=0;toast(em(er));showReq();}});

/* ---------- tombol Rute teman ---------- */
function label(){const b=$('#frChip');if(!b)return;const s=sharers();
 b.textContent=!s.length?'Rute teman':T.mode==='all'?'Rute semua':T.mode==='me'?'Rute saya':'Rute: '+((s.find(f=>f.id===T.mode)||{}).name||'');}
function cycle(){const s=sharers();if(!s.length){toast('Tidak ada teman yang berbagi rute denganmu');return;}
 const L=s.map(f=>f.id).concat(['me','all']);T.mode=L[(L.indexOf(T.mode)+1)%L.length];label();draw();
 if(T.mode!=='all'&&T.mode!=='me'){const f=s.find(x=>x.id===T.mode);if(f)fitTo(f);}}
function fitTo(f){const j=J();if(!j||!j.map)return;const pts=[];
 if(f.route&&f.route.ft)f.route.ft.forEach(x=>(x.c||[]).forEach(p=>pts.push(p)));if(f.pos)pts.push([f.pos.lon,f.pos.lat]);
 if(!pts.length)return;if(window.__setSheet)window.__setSheet('peek');
 if(pts.length===1){j.map.easeTo({center:pts[0],zoom:Math.max(j.map.getZoom(),15),duration:600});return;}
 const b=pts.reduce((bb,p)=>bb.extend(p),new maplibregl.LngLatBounds(pts[0],pts[0]));
 j.map.fitBounds(b,{padding:{top:(window.__topH2||120)+20,bottom:140,left:40,right:40},maxZoom:15.5,duration:700});}

/* ---------- gambar di peta ---------- */
function ensureSrc(map){if(map.getSource('jfr'))return true;if(!map.isStyleLoaded||!map.isStyleLoaded())return false;
 map.addSource('jfr',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
 map.addLayer({id:'jfr-case',type:'line',source:'jfr',filter:['!=',['get','k'],'walk'],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#FFFFFF','line-width':['interpolate',['linear'],['zoom'],9,7,15,12],'line-opacity':.9}});
 map.addLayer({id:'jfr-line',type:'line',source:'jfr',filter:['!=',['get','k'],'walk'],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':['get','c'],'line-width':['interpolate',['linear'],['zoom'],9,4,15,8]}});
 map.addLayer({id:'jfr-walk',type:'line',source:'jfr',filter:['==',['get','k'],'walk'],layout:{'line-join':'round'},paint:{'line-color':['get','c'],'line-width':3.5,'line-dasharray':[1,1.6]}});
 return true;}
function draw(){const j=J();if(!j||!j.map)return;const map=j.map;if(!ensureSrc(map)){setTimeout(draw,500);return;}
 const feats=[],keep=new Set();
 const vis=f=>T.mode==='all'||T.mode===f.id;
 okF().forEach(f=>{if(T.mode==='me'||!vis(f))return;const c=colOf(f.id);
  if(f.their_route==='ok'&&f.route&&f.route.ft)f.route.ft.forEach(x=>{if(x.c&&x.c.length>1)feats.push({type:'Feature',properties:{k:x.k==='walk'?'walk':'line',c},geometry:{type:'LineString',coordinates:x.c}});});
  if(f.pos){keep.add(f.id);let mk=T.mk.get(f.id);
   if(!mk){const el=document.createElement('div');el.className='jfm';el.innerHTML='<i></i><b></b>';mk=new maplibregl.Marker({element:el,anchor:'top'}).setLngLat([f.pos.lon,f.pos.lat]).addTo(map);T.mk.set(f.id,mk);}
   mk.setLngLat([f.pos.lon,f.pos.lat]);const el=mk.getElement();el.querySelector('i').style.background=c;el.querySelector('i').textContent=(f.name||'?').trim().charAt(0).toUpperCase();el.querySelector('b').textContent=f.name;}});
 [...T.mk.keys()].forEach(id=>{if(!keep.has(id)){T.mk.get(id).remove();T.mk.delete(id);}});
 map.getSource('jfr').setData({type:'FeatureCollection',features:feats});}

/* ---------- kirim posisi & rute ---------- */
function myShares(){const f=okF();return{route:f.filter(x=>x.my_route).map(x=>x.id),loc:f.filter(x=>x.my_loc).map(x=>x.id)};}
function buildRoute(){const g=GR();return g&&g.buildRoute?g.buildRoute():null;}
function dist(a,b){return Math.hypot((a.lon-b.lon)*111320*Math.cos(a.lat*Math.PI/180),(a.lat-b.lat)*110540);}
async function pushTick(){if(!T.uid||!T.st)return;const s=myShares();const P=T.push;
 if(!s.route.length&&!s.loc.length){P.route=false;return;}
 const j=J();if(!j)return;const g=j.S.gps;if(!g&&j.locate){try{j.locate(()=>{});}catch(e){}}
 let route=null,sig='';
 if(s.route.length){route=buildRoute();if(!route){try{await rpc('route_share_stop');P.sig='';P.route=false;toast('Berbagi rute selesai');await poll(true);}catch(e){}return;}
  sig=route.ti+'|'+route.tot+'|'+route.ft.length+'|'+(route.ft[0]&&route.ft[0].c.length);}
 const now=Date.now(),moved=g&&(!P.pos||dist(P.pos,g)>15),rchg=sig&&sig!==P.sig;
 if(!rchg&&!(moved&&now-P.at>5000)&&now-P.at<60000)return;
 try{await rpc('live_push',{p_lat:g?+g.lat.toFixed(6):null,p_lon:g?+g.lon.toFixed(6):null,p_acc:g?Math.round(g.acc||0):null,p_route:rchg?route:null,p_clear_route:false});
  P.at=now;if(g)P.pos={lat:g.lat,lon:g.lon};if(rchg)P.sig=sig;P.route=!!s.route.length;}catch(e){}}
setInterval(pushTick,5000);

/* ---------- pop-up ---------- */
const M=document.createElement('div');M.id='jtm';M.hidden=true;document.body.appendChild(M);
M.addEventListener('click',e=>{if(e.target===M)closeM();});
function openM(h){M.innerHTML='<div class="in">'+h+'</div>';M.hidden=false;}
function closeM(){M.hidden=true;M.innerHTML='';}
window.__jtemanBack=()=>{if(!M.hidden){closeM();return true;}return false;};

/* bagikan rute: dari tombol Bagikan rute dan Mulai */
let shareSel=new Set(),shareStart=false;
function openShare(start){shareStart=start;shareSel=new Set(myShares().route);drawShare();}
function drawShare(){const f=okF(),max=lim('route');
 const rows=f.map(x=>{const on=shareSel.has(x.id),dis=!on&&shareSel.size>=max;return '<label class="o'+(dis?' dis':'')+'"><input type="checkbox" data-f="'+esc(x.id)+'"'+(on?' checked':'')+(dis?' disabled':'')+'> '+esc(x.name)+(dis?'<small>belum tersedia</small>':'')+'</label>';}).join('');
 openM('<h3>'+(shareStart?'Mulai dan bagikan rute ke':'Bagikan rute')+'</h3>'+
  '<div class="jtlb">TEMAN · maks '+max+'</div>'+(rows||'<div class="jtfoot" style="padding:4px 2px">Belum ada teman. Tambah teman di Profil.</div>')+
  (shareStart?'':'<div class="jtlb">LAINNYA</div><button type="button" class="jtb" data-m="link">Bagikan lewat tautan</button>')+
  '<button type="button" class="jtb p" data-m="ok" style="margin-top:6px">'+(shareStart?'Mulai':'Bagikan')+'</button><button type="button" class="jtb" data-m="x">Batal</button>');}
M.addEventListener('change',e=>{const t=e.target;if(t.dataset.f){t.checked?shareSel.add(t.dataset.f):shareSel.delete(t.dataset.f);drawShare();}});
M.addEventListener('click',async e=>{const b=e.target.closest('[data-m]');if(!b)return;const m=b.dataset.m;
 if(m==='x'){closeM();return;}
 if(m==='link'){closeM();bypass=true;$('#rShare').click();bypass=false;return;}
 if(m==='ok'){const ids=[...shareSel],start=shareStart;closeM();
  if(start){bypass=true;$('#rStart').click();bypass=false;}
  const prev=myShares().route;if(!ids.length&&!prev.length)return;
  try{if(!ids.length){await rpc('route_share_stop');T.push.sig='';toast('Berhenti berbagi rute');}
   else{await rpc('route_share_set',{p_viewers:ids});T.push.sig='';const n=ids.map(i=>(okF().find(f=>f.id===i)||{}).name).filter(Boolean);toast('Rute dibagikan ke '+n.join(', '));}
   await poll(true);await pushTick();}catch(er){toast(em(er));}
  return;}
 if(m==='dur'){durSel=+b.dataset.h;drawDur();return;}
 if(m==='durok'){const id=durFor;closeM();try{await rpc('loc_share_set',{p_viewer:id,p_hours:durSel||null});await poll(true);await pushTick();}catch(er){toast(em(er));}return;}
 if(m==='del'){const id=b.dataset.id;closeM();try{await rpc('friend_remove',{p_other:id});T.open={};await poll(true);toast('Teman dihapus');}catch(er){toast(em(er));}return;}
});
let bypass=false;
document.addEventListener('click',e=>{if(bypass||!T.uid||!T.st)return;
 if(e.target.closest('#rShare')){e.stopPropagation();e.preventDefault();openShare(false);return;}
 if(e.target.closest('#rStart')&&okF().length){e.stopPropagation();e.preventDefault();openShare(true);}},true);

/* durasi lokasi */
let durFor=null,durSel=1;
function drawDur(){const f=okF().find(x=>x.id===durFor);if(!f)return;
 openM('<h3>Izinkan '+esc(f.name)+' melihat lokasimu selama</h3><div class="chips">'+DUR.map(d=>'<button type="button" data-m="dur" data-h="'+d[0]+'" class="'+(d[0]===durSel?'on':'')+'">'+d[1]+'</button>').join('')+'</div>'+
 '<div class="jtfoot">Hanya titik lokasimu yang terlihat, bukan rutemu.</div><button type="button" class="jtb p" data-m="durok">Izinkan</button><button type="button" class="jtb" data-m="x">Batal</button>');}

/* ---------- bagian Teman di Profil ---------- */
function fmtUntil(v){if(v==='forever')return 'sampai dimatikan';const d=new Date(v),n=new Date();const hm=String(d.getHours()).padStart(2,'0')+'.'+String(d.getMinutes()).padStart(2,'0');
 return 'sampai '+(d.toDateString()===n.toDateString()?'':'besok ')+hm;}
function render(){const el=T.mount;if(!el||!document.body.contains(el))return;
 if(!T.uid){el.innerHTML='<button class="jrow" data-ja="login"><span class="g">Masuk dengan Google untuk menambah teman</span></button>';return;}
 const keep=el.querySelector('#jtCode');const val=keep?keep.value:'',foc=document.activeElement===keep;
 let h='<div class="jtadd"><input id="jtCode" maxlength="9" placeholder="Kode teman" autocomplete="off" aria-label="Kode teman"><button type="button" class="jtb p" data-t="add">Tambah</button></div>';
 const fs=friends();
 if(!T.st)h+='<div class="jtfoot" style="padding:12px 2px">Memuat…</div>';
 else if(!fs.length)h+='<div class="jtfoot" style="padding:12px 2px">Belum ada teman. Bagikan kode temanmu, atau masukkan kode teman.</div>';
 fs.forEach(f=>{const c=colOf(f.id),av='<div class="jtav" style="background:'+c+'22;color:'+c+'">'+esc((f.name||'?').charAt(0).toUpperCase())+'</div>';
  if(f.status==='pending'&&f.incoming){h+='<div class="jtrow">'+av+'<div class="jtn"><b>'+esc(f.name)+'</b><span>ingin berteman</span></div><button type="button" class="jtb p" data-t="acc" data-id="'+f.id+'">Terima</button><button type="button" class="jtb" data-t="rej" data-id="'+f.id+'">Tolak</button></div>';return;}
  if(f.status==='pending'){h+='<div class="jtrow">'+av+'<div class="jtn"><b>'+esc(f.name)+'</b><span>menunggu diterima</span></div><button type="button" class="jtb" data-t="cancel" data-id="'+f.id+'">Batal</button></div>';return;}
  const sub=f.my_loc?'Melihat lokasimu · '+fmtUntil(f.my_loc):'Tidak melihat lokasimu';
  h+='<div class="jtrow">'+av+'<div class="jtn" data-t="more" data-id="'+f.id+'" style="cursor:pointer"><b>'+esc(f.name)+'</b><span>'+esc(sub)+'</span></div><button type="button" class="jttg'+(f.my_loc?' on':'')+'" data-t="loc" data-id="'+f.id+'" aria-label="Izinkan '+esc(f.name)+' melihat lokasimu"></button></div>';
  if(T.open[f.id])h+='<div class="jtx"><button type="button" class="jtb" data-t="del" data-id="'+f.id+'" style="color:var(--urgent,#C62828)">Hapus teman</button></div>';});
 if(T.st&&okF().length)h+='<div class="jtfoot" style="padding-bottom:12px">Lokasi dilihat '+okF().filter(f=>f.my_loc).length+' dari '+lim('loc')+' teman</div>';
 el.innerHTML=h;const ni=el.querySelector('#jtCode');if(ni){ni.value=val;if(foc){ni.focus();try{ni.setSelectionRange(val.length,val.length);}catch(_){}}}}
document.addEventListener('click',async e=>{const b=e.target.closest('#jteman [data-t]');if(!b)return;const t=b.dataset.t,id=b.dataset.id;
 if(t==='add'){const i=$('#jtCode');const v=(i&&i.value||'').trim().toUpperCase();if(!/^JC\d{7}$/.test(v)){toast('Kode teman berbentuk JC dan 7 angka');return;}
  try{const r=await rpc('friend_request',{p_code:v});i.value='';toast(r==='ok'?'Sekarang berteman':'Permintaan dikirim');await poll(true);}catch(er){toast(em(er));}return;}
 if(t==='acc'||t==='rej'){try{await rpc('friend_respond',{p_other:id,p_accept:t==='acc'});if(t==='acc')toast('Sekarang berteman');await poll(true);}catch(er){toast(em(er));}return;}
 if(t==='cancel'){try{await rpc('friend_remove',{p_other:id});await poll(true);}catch(er){toast(em(er));}return;}
 if(t==='more'){T.open[id]=!T.open[id];render();return;}
 if(t==='del'){const f=okF().find(x=>x.id===id);openM('<h3>Hapus '+esc(f?f.name:'teman')+'?</h3><div class="jtfoot">Berbagi lokasi dan rute dengan teman ini ikut berhenti.</div><button type="button" class="jtb p" data-m="del" data-id="'+id+'" style="background:#C62828;border-color:#C62828">Hapus teman</button><button type="button" class="jtb" data-m="x">Batal</button>');return;}
 if(t==='loc'){const f=okF().find(x=>x.id===id);if(!f)return;
  if(f.my_loc){try{await rpc('loc_share_stop',{p_viewer:id});await poll(true);toast('Berhenti berbagi lokasi');}catch(er){toast(em(er));}return;}
  if(okF().filter(x=>x.my_loc).length>=lim('loc')){toast('Lebih dari '+lim('loc')+' teman belum tersedia');return;}
  durFor=id;durSel=1;drawDur();}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='jtCode'){const b=document.querySelector('#jteman [data-t=add]');if(b)b.click();}});

window.__jteman={mount(el){T.mount=el;render();if(T.uid&&(!T.st||Date.now()-T.lastPoll>5000))poll(true);},poll,state:T,draw};
(function w(n){if(window.__jc&&window.__jc.map&&window.__jchat){ensureChip();poll(true);return;}if(n<300)setTimeout(()=>w(n+1),200);})(0);
})();
