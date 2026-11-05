/* ===== Jecom Teman: chat pribadi antar teman ===== */
(function(){
'use strict';
const $=s=>document.querySelector(s);
const C=()=>window.__jchat;
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const toast=t=>{if(window.__jshell)window.__jshell.toast(t);};
const uid=()=>{try{return C()&&C().uid?C().uid():null;}catch(e){return null;}};
const PAL=['#D64545','#2E9E6E','#8E55C9','#D0861E','#1E88C7','#C2185B','#00897B','#6D4C41'];
function colOf(id){let s=0;for(let i=0;i<id.length;i++)s=(s*31+id.charCodeAt(i))>>>0;return PAL[s%PAL.length];}
const ERR={bukan_teman:'Kalian belum berteman',kosong:'Tulis pesan dulu',terlalu_panjang:'Pesan terlalu panjang',terlalu_cepat:'Terlalu cepat. Tunggu sebentar',undangan_salah:'Undangan tidak valid',belum_login:'Masuk dengan Google dulu'};
function em(e){const m=(e&&e.message)||'';for(const k in ERR)if(m.indexOf(k)>-1)return ERR[k];return 'Gagal. Coba lagi';}
function hm(ts){const d=new Date(ts);return String(d.getHours()).padStart(2,'0')+'.'+String(d.getMinutes()).padStart(2,'0');}
function dayLbl(ts){const d=new Date(ts),n=new Date();if(d.toDateString()===n.toDateString())return hm(ts);const y=new Date(n-864e5);if(d.toDateString()===y.toDateString())return 'Kemarin';return ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][d.getDay()];}

const D={list:[],busy:false,on:false,cur:null,msgs:[],q:'',panel:null,ch:null,at:0};
const V=document.createElement('div');V.id='jdm';V.className='jsc';V.hidden=true;document.body.appendChild(V);

function avHTML(f,big){const im=window.__jav?window.__jav.img(f.id):null,c=colOf(f.id);
  return '<div class="dav'+(big?' big':'')+'" style="'+(im?'background-image:url('+esc(im)+')':'background:'+c)+'">'+(im?'':esc((f.name||'?').charAt(0).toUpperCase()))+(f.online?'<i class="don"></i>':'')+'</div>';}
function unread(){return D.list.reduce((n,f)=>n+(window.__mute&&window.__mute.dm&&window.__mute.dm(f.id)?0:(f.unread||0)),0);}
function lastTxt(f){const l=f.last;if(!l)return '';const me=l.sender===uid()?'Kamu: ':'';
  if(l.kind==='sticker')return me+'Stiker';if(l.kind==='invite')return me+'📨 Undangan: '+((l.meta&&l.meta.name)||'grup');if(l.kind==='route')return me+'🗺 Rute';return me+(l.body||'');}

/* ---------- data ---------- */
async function poll(force){const u=uid();if(!u){D.list=[];if(D.on)draw();return;}if(D.busy)return;if(!force&&document.hidden)return;D.busy=true;
  try{D.list=(await C().rpc('dm_list'))||[];D.at=Date.now();}catch(e){}finally{D.busy=false;}
  try{if(window.__jcBadge)window.__jcBadge();}catch(e){}
  if(D.on&&!D.cur)draw();else if(D.on&&D.cur){const f=D.list.find(x=>x.id===D.cur.id);if(f){D.cur.online=f.online;head();}catchUp();}
  subscribe();}
async function sb(){try{return await C().sb();}catch(e){return null;}}
async function loadConv(){const s=await sb(),u=uid();if(!s||!D.cur)return;const a=u<D.cur.id?u:D.cur.id,b=u<D.cur.id?D.cur.id:u;
  const r=await s.from('dm_messages').select('id,sender,kind,body,sticker,meta,created_at').eq('a',a).eq('b',b).order('id',{ascending:false}).limit(80);
  D.msgs=(r.data||[]).reverse();drawMsgs(true);markRead();}
async function catchUp(){const s=await sb(),u=uid();if(!s||!D.cur)return;const a=u<D.cur.id?u:D.cur.id,b=u<D.cur.id?D.cur.id:u,last=D.msgs.length?D.msgs[D.msgs.length-1].id:0;
  const r=await s.from('dm_messages').select('id,sender,kind,body,sticker,meta,created_at').eq('a',a).eq('b',b).gt('id',last).order('id',{ascending:true}).limit(80);
  if(r.data&&r.data.length){r.data.forEach(m=>{if(!D.msgs.some(x=>x.id===m.id))D.msgs.push(m);});drawMsgs(true);markRead();}}
function markRead(){if(!D.cur||!D.msgs.length)return;const last=D.msgs[D.msgs.length-1].id;const f=D.list.find(x=>x.id===D.cur.id);if(f)f.unread=0;
  try{C().rpc('dm_read',{p_other:D.cur.id,p_last:last});}catch(e){}try{if(window.__jcBadge)window.__jcBadge();}catch(e){}}
async function subscribe(){if(D.ch||!uid())return;const s=await sb();if(!s||!s.channel)return;
  D.ch=s.channel('jx-dm').on('postgres_changes',{event:'INSERT',schema:'public',table:'dm_messages'},p=>{const m=p.new;if(!m)return;const u=uid();
    const other=m.a===u?m.b:m.a;
    if(D.on&&D.cur&&D.cur.id===other&&!document.hidden){if(!D.msgs.some(x=>x.id===m.id)){D.msgs.push(m);drawMsgs(true);markRead();}return;}
    const f=D.list.find(x=>x.id===other);if(f){f.last=m;if(m.sender!==u)f.unread=(f.unread||0)+1;D.list.sort((x,y)=>((y.last&&y.last.id)||0)-((x.last&&x.last.id)||0));}else poll(true);
    if(m.sender!==u&&!(window.__mute&&window.__mute.dm&&window.__mute.dm(other))&&!(D.on&&D.cur&&D.cur.id===other)){const nm=(f&&f.name)||'Teman';if(!D.on)toast(nm+': '+lastTxt({last:m}).slice(0,60));}
    try{if(window.__jcBadge)window.__jcBadge();}catch(e){}if(D.on&&!D.cur)draw();})
  .subscribe(st=>{if(st==='CHANNEL_ERROR'||st==='TIMED_OUT'||st==='CLOSED'){const c=D.ch;D.ch=null;sb().then(s2=>{try{s2.removeChannel(c);}catch(e){}});setTimeout(subscribe,3000);}});}
setInterval(()=>poll(false),10000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll(true);});
setTimeout(()=>poll(true),2500);

/* ---------- tampilan ---------- */
function open(f){D.on=true;V.hidden=false;if(f)openConv(f);else{D.cur=null;draw();}poll(true);}
function close(){D.on=false;D.cur=null;D.panel=null;V.hidden=true;}
function draw(){if(!D.on)return;if(D.cur)return;
  const seg=C()&&C().seg?C().seg('teman'):'';
  if(!uid()){V.innerHTML='<div class="dtop">'+seg+'</div><div class="dempty">Masuk dengan Google untuk mengobrol dengan teman.<br><button type="button" class="dbtn p" data-d="login">Masuk</button></div>';return;}
  const q=D.q.trim().toLowerCase(),fs=D.list.filter(f=>!q||(f.name||'').toLowerCase().includes(q));
  const withMsg=fs.filter(f=>f.last),noMsg=fs.filter(f=>!f.last);
  const row=f=>'<button type="button" class="dcv" data-f="'+esc(f.id)+'">'+avHTML(f)+'<span class="g"><b>'+esc(f.name)+'</b><small>'+(f.online?'<span class="don2">● Online</span>'+(f.last?' · ':''):'')+(f.last?esc(lastTxt(f)):'<span class="dst">Mulai obrolan</span>')+'</small></span><span class="r">'+(f.last?dayLbl(f.last.created_at):'')+(f.unread?'<span class="du">'+(f.unread>9?'9+':f.unread)+'</span>':'')+'</span></button>';
  V.innerHTML='<div class="dtop">'+seg+'<div class="dsr"><input id="dmQ" placeholder="Cari teman" value="'+esc(D.q)+'" autocomplete="off"></div></div><div class="dls">'+
   (D.list.length?withMsg.map(row).join('')+(noMsg.length?'<div class="dlb">TEMAN LAIN</div>'+noMsg.map(row).join(''):''):'<div class="dempty">Belum ada teman.<br>Tambah teman lewat kode teman di Profil.</div>')+'</div>';
  const i=$('#dmQ');if(i&&D.qf){i.focus();i.setSelectionRange(D.q.length,D.q.length);}}
function openConv(f){D.cur=Object.assign({},f);D.msgs=[];D.panel=null;
  V.innerHTML='<div class="dch" id="dmH"></div><div class="dms" id="dmM"><div class="dempty">Memuat…</div></div><div class="dpn" id="dmP"></div><div class="dcomp"><button type="button" class="dib plus" data-d="plus" aria-label="Lainnya"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></button><div class="dinp" id="dmI" contenteditable="true" role="textbox" data-ph="Tulis pesan" aria-label="Tulis pesan"></div><button type="button" class="dib" data-d="stk" aria-label="Emot dan stiker"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8"/><path d="M9 9.5h.01M15 9.5h.01" stroke-width="3"/></svg></button><button type="button" class="dsnd" data-d="send" aria-label="Kirim"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l16-8-6 16-3-7z"/></svg></button></div>';
  head();loadConv();}
function head(){const h=$('#dmH');if(!h||!D.cur)return;const f=D.cur;
  h.innerHTML='<button type="button" class="dbk" data-d="back" aria-label="Kembali">‹</button>'+avHTML(f)+'<span class="g"><b>'+esc(f.name)+'</b><small>'+(f.online?'<span class="don2">● Online</span>':'Offline')+'</small></span><button type="button" class="dgi" data-d="loc" aria-label="Lihat di peta">📍</button>';}
function inviteHTML(m,mine){const t=m.meta||{};
  return '<div class="dinv"><div class="tp"><small>Undangan grup</small><b>'+esc(t.name||('Grup '+t.code))+'</b></div><div class="bt"><span>'+(mine?'Terkirim':'Ketuk Gabung untuk masuk')+'</span>'+(mine?'':'<button type="button" class="dbtn p" data-d="join" data-i="'+m.id+'">Gabung</button>')+'</div></div>';}
function routeHTML(m){const r=m.meta||{};return '<div class="drc"><b>🗺 '+esc(r.f||'Asal')+' → '+esc(r.t||'Tujuan')+'</b><small>'+esc(r.ti||'')+(r.tot?' · ±'+r.tot+' mnt':'')+'</small><span><button type="button" class="dbtn" data-d="rsee" data-i="'+m.id+'">Lihat di peta</button></span></div>';}
function drawMsgs(bottom){const el=$('#dmM');if(!el)return;const u=uid();
  if(!D.msgs.length){el.innerHTML='<div class="dempty">Belum ada pesan. Sapa '+esc(D.cur?D.cur.name:'')+'!</div>';return;}
  let lastDay='';el.innerHTML=D.msgs.map((m,i)=>{const mine=m.sender===u,p=D.msgs[i-1],d=new Date(m.created_at).toDateString();let h='';
    if(d!==lastDay){lastDay=d;const t=new Date(m.created_at),n=new Date();h+='<div class="dday">'+(d===n.toDateString()?'Hari ini':d===new Date(n-864e5).toDateString()?'Kemarin':t.getDate()+'/'+(t.getMonth()+1))+'</div>';}
    const cont=p&&p.sender===m.sender&&new Date(m.created_at)-new Date(p.created_at)<180000&&p.kind==='text'&&m.kind==='text';
    let body;
    if(m.kind==='sticker')body='<div class="dstk">'+(C().stk(m.sticker)||'')+'</div>';
    else if(m.kind==='invite')body=inviteHTML(m,mine);
    else if(m.kind==='route')body=routeHTML(m);
    else body='<div class="db'+(/^(\s*⟦[a-z]+:\d⟧\s*)+$/.test(m.body||'')?' big':'')+'">'+(C().txtH?C().txtH(m.body||''):esc(m.body||''))+'<span class="t">'+hm(m.created_at)+(mine?' ✓':'')+'</span></div>';
    return h+'<div class="dmr'+(mine?' me':'')+(cont?' cont':'')+'">'+body+'</div>';}).join('');
  if(bottom)el.scrollTop=el.scrollHeight;}
function panel(){const p=$('#dmP');if(!p)return;
  if(D.panel==='plus'){const gs=(window.__grp&&window.__grp.list?window.__grp.list():[]).filter(g=>g.owner);
    p.innerHTML='<div class="dpi"><div class="dplh">UNDANG KE GRUP</div>'+(gs.length?gs.map(g=>'<button type="button" class="dpa" data-d="inv" data-c="'+esc(g.code)+'"><span>👥</span><b>'+esc(g.name)+'</b></button>').join(''):'<div class="dpn0">Belum punya grup. Buat grup dulu di tab Grup.</div>')+
      '<div class="dplh">RUTE</div><button type="button" class="dpa" data-d="route"><span>🗺</span><b>Kirim rute yang sedang dipilih</b></button></div>';}
  else if(D.panel==='stk'){const st=C().stickers(),em=C().emos?C().emos():[],tab=st.length?(D.etab||'emo'):'emo';
    p.innerHTML='<div class="dpi">'+(st.length?'<div class="detb"><button type="button" data-d="etab" data-t="emo" aria-pressed="'+(tab==='emo')+'">Emot</button><button type="button" data-d="etab" data-t="stk" aria-pressed="'+(tab==='stk')+'">Stiker</button></div>':'')+
     (tab==='emo'?'<div class="demg">'+em.map(x=>'<button type="button" class="deb" data-d="emo" data-e="'+esc(x.id)+'" aria-label="'+esc(x.n)+'">'+x.svg+'</button>').join('')+'</div>':
      '<div class="dstg">'+st.map(x=>'<button type="button" class="dsb" data-d="stks" data-s="'+esc(x.id)+'">'+x.svg+'</button>').join('')+'</div>')+'</div>';}
  else p.innerHTML='';
  V.querySelectorAll('[data-d=plus],[data-d=stk]').forEach(b=>b.setAttribute('aria-pressed',String(D.panel===b.dataset.d)));}
async function sendRaw(kind,body,sticker,meta){if(!D.cur)return false;
  try{const r=await C().rpc('dm_send',{p_to:D.cur.id,p_kind:kind,p_body:body,p_sticker:sticker,p_meta:meta});
    if(r&&r.id&&!D.msgs.some(x=>x.id===r.id)){D.msgs.push({id:r.id,sender:uid(),kind,body,sticker,meta,created_at:r.created_at||new Date().toISOString()});drawMsgs(true);}
    const f=D.list.find(x=>x.id===D.cur.id);if(f)f.last={id:r.id,kind,body,sender:uid(),created_at:new Date().toISOString(),meta};return true;}
  catch(e){toast(em(e));return false;}}
async function send(){const i=$('#dmI');if(!i)return;const v=(C().ce2s?C().ce2s(i):(i.innerText||'')).trim();if(!v)return;if(v.length>1000){toast('Pesan terlalu panjang');return;}
  const keep=i.innerHTML;i.innerHTML='';if(!(await sendRaw('text',v,null,null)))i.innerHTML=keep;}
function addEmo(id){const i=$('#dmI');if(!i||!C().txtH)return;i.insertAdjacentHTML('beforeend',C().txtH('⟦'+id+':2⟧'));i.appendChild(document.createTextNode(''));}
async function sendInvite(code){const t=window.__grp&&window.__grp.invite?window.__grp.invite(code):null;if(!t){toast('Grup tidak ditemukan');return;}
  D.panel=null;panel();if(await sendRaw('invite',null,null,t))toast('Undangan terkirim');}
async function sendRoute(){D.panel=null;panel();const r=window.__grp&&window.__grp.routeCard?window.__grp.routeCard():null;if(!r){toast('Cari rute dulu di Peta, lalu pilih satu.');return;}await sendRaw('route',null,null,r);}

V.addEventListener('click',async e=>{
  const sg=e.target.closest('[data-x=seg]');if(sg){const v=sg.dataset.v;if(v==='umum'){close();try{C().show();}catch(_){}}else if(v==='grup'){close();if(window.__jshell&&window.__jshell.openGrp)window.__jshell.openGrp();}return;}
  const cv=e.target.closest('[data-f]');if(cv){const f=D.list.find(x=>x.id===cv.dataset.f);if(f)openConv(f);return;}
  const b=e.target.closest('[data-d]');if(!b)return;const a=b.dataset.d;
  if(a==='login'){try{C().googleLogin();}catch(_){}return;}
  if(a==='back'){D.cur=null;D.panel=null;draw();poll(true);return;}
  if(a==='send'){send();return;}
  if(a==='plus'||a==='stk'){D.panel=D.panel===a?null:a;panel();return;}
  if(a==='inv'){sendInvite(b.dataset.c);return;}
  if(a==='route'){sendRoute();return;}
  if(a==='etab'){D.etab=b.dataset.t;panel();return;}
  if(a==='emo'){addEmo(b.dataset.e);return;}
  if(a==='stks'){D.panel=null;panel();sendRaw('sticker',null,b.dataset.s,null);return;}
  if(a==='join'){const m=D.msgs.find(x=>String(x.id)===b.dataset.i);if(!m||!window.__grp||!window.__grp.joinInvite)return;close();await window.__grp.joinInvite(m.meta||{});return;}
  if(a==='rsee'){const m=D.msgs.find(x=>String(x.id)===b.dataset.i);if(m&&window.__grp&&window.__grp.seeRoute){close();window.__grp.seeRoute(m.meta||{});}return;}
  if(a==='loc'){const f=D.cur;let pos=null;try{const fr=(window.__jteman.state.st.friends||[]).find(x=>x.id===f.id);pos=fr&&fr.pos;}catch(_){}
    if(!pos){toast(f.name+' tidak sedang berbagi lokasi denganmu');return;}
    close();if(window.__jshell)window.__jshell.setTab('peta');try{window.__jc.map.flyTo({center:[pos.lon,pos.lat],zoom:16});}catch(_){}return;}
});
V.addEventListener('input',e=>{if(e.target.id==='dmQ'){D.q=e.target.value;D.qf=true;draw();D.qf=false;}});
V.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='dmI'&&!e.shiftKey){e.preventDefault();send();}});
V.addEventListener('focusin',e=>{if(e.target.id==='dmI'&&D.panel==='plus'){D.panel=null;panel();}});
new MutationObserver(()=>{if(document.documentElement.dataset.tab!=='chat'&&D.on)close();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-tab']});
window.__jdmBack=()=>{if(!D.on)return false;if(D.panel){D.panel=null;panel();return true;}if(D.cur){D.cur=null;D.panel=null;draw();return true;}close();if(window.__jshell)window.__jshell.setTab('peta');return true;};

const css=document.createElement('style');css.textContent=
'#jdm{background:var(--surface)}#jdm .dms{background:var(--bg)}'+
'#jdm .dtop{background:var(--surface);border-bottom:1px solid var(--line);flex:none;padding-bottom:10px}'+
'#jdm .ctop{padding:8px 14px 0}#jdm .cseg{display:flex;background:var(--surface-2);border-radius:12px;padding:3px;gap:3px}'+
'#jdm .cseg button{flex:1;min-height:36px;border:0;background:transparent;color:var(--ink-2);border-radius:9px;font:700 14px var(--f-body,system-ui);display:inline-flex;align-items:center;justify-content:center;gap:5px;cursor:pointer}'+
'#jdm .cseg button[aria-pressed="true"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.14)}'+
'#jdm .cseg .run{min-width:17px;height:17px;border-radius:9px;background:#D8262B;color:#fff;font-size:10.5px;font-weight:800;line-height:17px;padding:0 4px}'+
'#jdm .dsr{padding:10px 14px 0}#jdm .dsr input{width:100%;height:38px;border-radius:12px;border:0;background:var(--surface-2);color:var(--ink);padding:0 12px;font:15px var(--f-body,system-ui)}'+
'#jdm .dls{flex:1;overflow:auto}'+
'#jdm .dcv{display:flex;align-items:center;gap:11px;width:100%;padding:11px 14px;background:var(--surface);border:0;border-bottom:1px solid var(--line);color:var(--ink);text-align:left;cursor:pointer;font:inherit}'+
'#jdm .dcv .g{flex:1;min-width:0}#jdm .dcv .g b{display:block;font-size:15px}#jdm .dcv .g small{display:block;color:var(--ink-2);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'#jdm .dcv .r{display:flex;flex-direction:column;align-items:flex-end;gap:4px;font-size:11.5px;color:var(--ink-2)}'+
'#jdm .du{min-width:20px;height:20px;border-radius:10px;background:#138A63;color:#fff;font:700 11px/20px system-ui;text-align:center;padding:0 6px}'+
'#jdm .dav{width:44px;height:44px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px;background-size:cover;background-position:center;position:relative}'+
'#jdm .dch .dav{width:36px;height:36px;font-size:14px}'+
'#jdm .don{position:absolute;right:0;bottom:0;width:11px;height:11px;border-radius:50%;background:#1E9E5A;border:2px solid var(--surface)}'+
'#jdm .don2{color:#1E9E5A;font-weight:700}#jdm .dst{color:#138A63;font-weight:600}'+
'#jdm .dlb{font-size:12px;font-weight:800;color:var(--ink-2);letter-spacing:.05em;padding:14px 14px 6px}'+
'#jdm .dempty{padding:36px 24px;text-align:center;color:var(--ink-2);font-weight:600;line-height:1.6}'+
'#jdm .dbtn{border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:9px;padding:6px 12px;font:700 13px system-ui;cursor:pointer;white-space:nowrap}#jdm .dbtn.p{background:#138A63;border-color:#138A63;color:#fff}'+
'#jdm .dch{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface);border-bottom:1px solid var(--line);flex:none}'+
'#jdm .dch .g{flex:1;min-width:0}#jdm .dch .g b{display:block;font-size:16px}#jdm .dch .g small{font-size:12.5px;color:var(--ink-2)}'+
'#jdm .dbk{border:0;background:none;color:var(--ink);font-size:32px;line-height:1;width:28px;padding:0;cursor:pointer;font-weight:300}'+
'#jdm .dgi{width:38px;height:38px;border-radius:11px;border:1px solid var(--line);background:var(--surface);font-size:17px;cursor:pointer}'+
'#jdm .dms{flex:1;overflow:auto;padding:10px 12px;display:flex;flex-direction:column;gap:6px}'+
'#jdm .dday{align-self:center;font-size:11px;color:var(--ink-2);background:var(--surface-2);padding:2px 9px;border-radius:999px;margin:4px 0}'+
'#jdm .dmr{display:flex}#jdm .dmr.me{justify-content:flex-end}#jdm .dmr.cont{margin-top:-3px}'+
'#jdm .db{max-width:78%;background:var(--surface);border:1px solid var(--line);color:var(--ink);padding:7px 11px;border-radius:16px 16px 16px 5px;font-size:15px;line-height:1.4;overflow-wrap:anywhere;white-space:pre-wrap}'+
'#jdm .me .db{background:#138A63;color:#fff;border-color:transparent;border-radius:16px 16px 5px 16px}'+
'#jdm .db .t{float:right;font-size:10.5px;opacity:.65;margin:6px 0 -3px 10px}'+
'#jdm .dstk svg{width:120px;height:120px;display:block}'+
'#jdm .dinv{background:var(--surface);border:1px solid var(--line);border-radius:16px;overflow:hidden;max-width:82%;min-width:220px}'+
'#jdm .dinv .tp{background:linear-gradient(135deg,#138A63,#0E6B4C);color:#fff;padding:10px 12px}#jdm .dinv .tp small{opacity:.85;font-size:12px}#jdm .dinv .tp b{display:block;font-size:16px}'+
'#jdm .dinv .bt{padding:9px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12.5px;color:var(--ink-2)}'+
'#jdm .drc{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:9px 11px;max-width:80%;display:flex;flex-direction:column;gap:3px}#jdm .drc small{color:var(--ink-2)}'+
'#jdm .dpn{flex:none;position:relative}#jdm .dpi{position:absolute;left:10px;right:10px;bottom:6px;background:var(--surface);border:1px solid var(--line);border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.25);padding:12px;max-height:46vh;overflow:auto;z-index:5}'+
'#jdm .dplh{font-size:11.5px;font-weight:800;letter-spacing:.05em;color:var(--ink-2);margin:2px 2px 8px}'+
'#jdm .dpa{width:100%;display:flex;align-items:center;gap:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:14px;padding:9px 12px;margin-bottom:8px;cursor:pointer;font:14.5px var(--f-body,system-ui);text-align:left}'+
'#jdm .dpa span{width:34px;height:34px;border-radius:10px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;font-size:17px}'+
'#jdm .dpn0{font-size:13px;color:var(--ink-2);padding:2px 2px 10px}'+
'#jdm .dstg{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}#jdm .dsb{border:1px solid var(--line);background:var(--surface);border-radius:10px;padding:3px;cursor:pointer}#jdm .dsb svg{width:100%;height:auto;display:block}'+
'#jdm .dcomp{flex:none;display:flex;align-items:center;gap:6px;padding:8px 10px;background:var(--surface);border-top:1px solid var(--line)}'+
'#jdm .dib{width:40px;height:40px;border-radius:50%;border:1px solid var(--line);background:var(--surface);color:var(--ink-2);padding:0;cursor:pointer;flex:none;display:flex;align-items:center;justify-content:center}#jdm .dib svg,#jdm .dsnd svg{display:block}'+
'#jdm .detb{display:flex;gap:6px;margin-bottom:10px}#jdm .detb button{flex:1;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:10px;padding:7px;font:700 13px system-ui;cursor:pointer}#jdm .detb button[aria-pressed="true"]{background:var(--ink);color:var(--surface)}'+
'#jdm .demg{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}#jdm .deb{border:1px solid var(--line);background:var(--surface);border-radius:10px;padding:5px;cursor:pointer}#jdm .deb svg{width:100%;height:auto;display:block;pointer-events:none}'+
'#jdm .et{display:inline-block;width:1.4em;height:1.4em;vertical-align:-.3em}#jdm .et svg{width:100%;height:100%;display:block}#jdm .db.big .et{width:2.2em;height:2.2em;vertical-align:-.65em}'+
'#jdm .dib.plus{background:rgba(19,138,99,.13);border-color:transparent;color:#138A63}#jdm .dib[aria-pressed="true"]{background:#138A63;color:#fff;border-color:transparent}'+
'#jdm .dinp{flex:1;min-width:0;min-height:40px;max-height:100px;overflow:auto;border-radius:20px;background:var(--surface-2);color:var(--ink);padding:9px 14px;font:15px/22px var(--f-body,system-ui);outline:none;white-space:pre-wrap;overflow-wrap:anywhere}'+
'#jdm .dinp:empty::before{content:attr(data-ph);color:var(--ink-2)}'+
'#jdm .dsnd{width:40px;height:40px;padding:0;border-radius:50%;border:0;background:#138A63;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none}';
document.head.appendChild(css);
window.__jdm={open,close,unread,poll,state:D};
})();
