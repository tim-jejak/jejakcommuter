/* ===== Jecom Chat (v11): akun, chat jalur, Lapor, vote ===== */
(function(){
'use strict';
var CFG=window.JC_CFG||{};
var el=function(s,r){return (r||document).querySelector(s);};
var MAXC=90,TOK=/⟦[a-z]+:\d⟧/g;
var CATS=[['Umum','General'],['KRL','KRL'],['MRT','MRT'],['LRT','LRT'],['TJ','TJ'],['JL','JakLingko']];
var QR={KRL:['Penuh','Kosong','Telat'],MRT:['Penuh','Kosong','Telat'],LRT:['Penuh','Kosong','Telat'],TJ:['Penuh','Kosong','Telat','Banjir','Razia'],JL:['Penuh','Kosong','Telat','Razia']};
var REPC={'Penuh':'#D9822B','Kosong':'#2F9E6E','Telat':'#D14343','Razia':'#8A5CD0','Banjir':'#2B7FD1'};
var SCOL={Normal:'#2F9E6E',Padat:'#D9822B',Gangguan:'#D14343'};
var KRLL=['Bogor','Bekasi','Rangkasbitung','Tangerang','Tj. Priok'];
var TJK=['1','2','3','4','5','6','7','8','9','10','11','12','13','Non-BRT'];
var KC={'Bogor':'#E3342F','Bekasi':'#1E6FD9','Rangkasbitung':'#2E9E5B','Tangerang':'#8B5A2B','Tj. Priok':'#E86FA8'};
var TRK={bronze:1,silver:2,gold:3,diamond:4,admin:9};
var AVC=['#0B8F6A','#2F6FEB','#D6457A','#E0701F','#7A4FD0','#4B5C66'];
var P={
 send:'<path d="M4 12l16-8-6 16-3-7z"/>',
 more:'<circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/>',
 lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
 check:'<path d="M5 12l5 5 9-10"/>',
 pin:'<path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
 flag:'<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>',
 clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
 sticker:'<path d="M5 4h14a1 1 0 011 1v9l-6 6H5a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M20 14h-5a1 1 0 00-1 1v5M8.5 9.5h.01M14.5 9.5h.01M8.5 14c1 1 2.2 1.4 3.5 1"/>',
 chev:'<path d="M6 9l6 6 6-6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>'
};
function ic(n,c){return '<svg class="i '+(c||'')+'" viewBox="0 0 24 24" aria-hidden="true">'+P[n]+'</svg>';}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function avc(n){var s=0;for(var i=0;i<n.length;i++)s+=n.charCodeAt(i);return AVC[s%AVC.length];}

var STKL=window.__CD.STKL,EMOL=window.__CD.EMOL,EMC=window.__CD.EMC,EMOB=window.__CD.EMOB,STKB=window.__CD.STKB,STKA=window.__CD.STKA,EMN=window.__CD.EMN;

function emoSVG(id,ci){var c=EMC[ci==null?2:ci];return (EMOB[id]||'').replace(/\{F\}/g,c[0]).replace(/\{S\}/g,'#14202B').replace(/\{I\}/g,c[1]);}
function txtH(t){return esc(t).replace(/⟦([a-z]+):(\d)⟧/g,function(m,id,c){return '<span class="et" contenteditable="false" data-tok="'+id+':'+c+'">'+emoSVG(id,+c)+'</span>';});}
function dlen(s){return s.replace(TOK,'.').length;}
function dcut(s){var o='',n=0,re=/^⟦[a-z]+:\d⟧/,m;while(s.length&&n<MAXC){if(s[0]==='⟦'&&(m=re.exec(s))){o+=m[0];s=s.slice(m[0].length);}else{o+=s[0];s=s.slice(1);}n++;}return o;}
function ce2s(e){var s='';e.childNodes.forEach(function(n){if(n.nodeType===3)s+=n.nodeValue;else if(n.dataset&&n.dataset.tok)s+='⟦'+n.dataset.tok+'⟧';else if(n.nodeName!=='BR')s+=n.textContent;});return s;}

var BAD=['judi','togel','gacor','maxwin','pinjol','pinjaman online'];
var TLD='com|co\\.id|id|net|org|io|me|xyz|info|biz|site|online|top|vip|cc|link|app|ly|my\\.id|web\\.id|ac\\.id|go\\.id|dev|store|shop|club|live|asia|tv|ai|gl';
var NUMW={kosong:'0',nol:'0',satu:'1',dua:'2',tiga:'3',empat:'4',lima:'5',enam:'6',tujuh:'7',delapan:'8',sembilan:'9'};
function numNorm(t){var s=t.replace(/kosong|nol|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan/g,function(w){return ' '+NUMW[w]+' ';});
 for(var k=0;k<3;k++)s=s.replace(/(^|[\d\s])o(?=\s*\d)/g,'$10');
 return s.replace(/(^|[^\d])([01]?\d|2[0-3])[.:][0-5]\d(?!\d)/g,'$1 ');}
function filterMsg(text){
 var t=String(text).toLowerCase().normalize('NFKD').replace(/[̀-ͯ​-‏⁠﻿]/g,'');
 if(/(https?:|www\.|:\/\/)/.test(t))return 'tautan tidak boleh';
 if(new RegExp('[a-z0-9-]+\\s*(\\.|\\(dot\\)|\\sdot\\s)\\s*('+TLD+')(\\b|$)').test(t))return 'tautan tidak boleh';
 var nn=numNorm(t),cc=nn.replace(/[\s.\-_()+,]/g,'');
 if(/jc\d{7}/.test(cc))return 'Kamu tidak bisa mengirim kode teman di chat umum';
 if(/\d{7,}/.test(cc))return 'Kamu tidak bisa mengirim nomor di chat umum';
 if(/(^|\s)@\w{3,}/.test(t)||/\b(whatsapp|telegram|instagram)\b/.test(t))return 'ajakan ke aplikasi lain tidak boleh';
 var l=t.replace(/0/g,'o').replace(/1/g,'i').replace(/3/g,'e').replace(/4/g,'a').replace(/5/g,'s').replace(/7/g,'t').replace(/@/g,'a').replace(/\$/g,'s');
 var words=l.replace(/[^a-z\s]/g,' ').replace(/\s+/g,' ').trim(),compact=l.replace(/[^a-z]/g,'');
 for(var i=0;i<BAD.length;i++){var b=BAD[i];if((' '+words+' ').indexOf(' '+b+' ')>-1)return 'ada kata terlarang';if(b.indexOf(' ')<0&&compact.indexOf(b)>-1)return 'ada kata terlarang';}
 return '';
}

/* ---------- state ---------- */
var X={unr:{},sb:null,uid:null,user:null,prof:null,room:'Umum',lastRoom:{KRL:'KRL Bogor',TJ:'TJ 1'},msgs:[],ids:{},names:{},votes:{},my:{},pins:{},
 aj:[],ajRes:{},ajBusy:{},ajDone:{},vs:{points:0,ban:0},draft:{},panel:null,emPick:null,emc:{},dd:false,rdd:false,lastSend:0,ready:false,loading:false,ch:null,root:null,tmr:null,busy:false};
try{var lr=localStorage.getItem('jx_room');if(lr)X.room=lr;}catch(e){}

function catOf(r){return r==='Umum'?'Umum':r.indexOf('KRL')===0?'KRL':r.indexOf('TJ')===0?'TJ':r==='JakLingko'?'JL':r;}
function subRooms(c){return c==='KRL'?KRLL.map(function(x){return 'KRL '+x;}):TJK.map(function(x){return 'TJ '+x;});}
function rank(){return X.prof?(TRK[X.prof.tier]||0):0;}
function toast(t){if(window.__jshell&&window.__jshell.toast)window.__jshell.toast(t);else if(window.__toast)window.__toast(t);}
function hhmm(ts){var d=new Date(ts);return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}
function wt(ts){return Date.now()-ts<60000?'baru':hhmm(ts);}
function agoTxt(ts){var mn=Math.floor((Date.now()-ts)/60000);return mn<1?'baru saja':mn<60?mn+' mnt lalu':Math.floor(mn/60)+' jam lalu';}

/* ---------- supabase ---------- */
function loadLib(){return new Promise(function(res,rej){if(window.supabase)return res();var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';s.onload=res;s.onerror=function(){rej(new Error('lib'));};document.head.appendChild(s);});}
async function getSB(){
 if(X.sb)return X.sb;
 if(window.__JCSB){X.sb=window.__JCSB;return X.sb;}
 if(!CFG.url||!CFG.key)return null;
 await loadLib();
 X.sb=window.supabase.createClient(CFG.url,CFG.key,{auth:{storageKey:'jc-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
 return X.sb;
}
var ERR={
 belum_login:'Masuk dulu',akun_baru:'Akun baru. Menulis dan vote terbuka 1 hari setelah daftar',terlalu_cepat:'Tunggu sebentar',
 cooldown_laporan:'Satu laporan per jalur tiap 10 menit',gps_belum_akurat:'Lokasi belum akurat. Tunggu GPS',bukan_di_jalur:'Kamu belum berada di jalur ini',
 rute_belum_ada:'Rute jalur ini belum tersedia',pesan_ditolak:'Pesan ditolak: tautan, nomor, ajakan ke aplikasi lain, atau kata terlarang',
 terlalu_panjang:'Maksimal '+MAXC+' karakter',kosong:'Tulis pesan dulu',laporan_sendiri:'Tidak bisa vote laporan sendiri',laporan_kadaluarsa:'Laporan sudah kedaluwarsa',
 laporan_tidak_ada:'Laporan tidak ditemukan',dikunci:'Chat umum sedang dikunci',ajakan_aktif:'Kamu masih punya ajakan aktif',ajakan_penuh:'Ajakan sudah penuh',
 ajakan_berakhir:'Ajakan sudah berakhir',lokasi_palsu:'Lokasi palsu (fake GPS) terdeteksi',lokasi_jauh:'Hanya bisa saat kamu di stasiun, halte, atau di dalam kereta/bus',
 lokasi_gps:'GPS belum akurat. Tunggu sebentar',lokasi_tunggu:'Tunggu sebentar, memastikan jalurmu',lokasi_tidak_wajar:'Lokasi tidak wajar. Coba lagi nanti',lokasi_salah:'Pilih lokasimu lagi',perbarui_aplikasi:'Perbarui aplikasi Jecom',lokasi_kosong:'Lokasi belum aktif. Nyalakan lokasi lalu coba lagi',undangan_salah:'Grup gagal dibuat'
};
function errMsg(e){var m=(e&&e.message)||'';for(var k in ERR)if(m.indexOf(k)>-1)return ERR[k];return /fetch|network|Failed/i.test(m)?'Tidak ada sinyal':'Gagal. Coba lagi';}
async function rpc(name,args){var sb=await getSB();if(!sb)throw new Error('Server belum diatur');var r=await sb.rpc(name,args||{});if(r.error)throw r.error;return r.data;}

function getFix(){
 return new Promise(function(res){
  if(!navigator.geolocation)return res(null);
  navigator.geolocation.getCurrentPosition(function(p){res({lat:p.coords.latitude,lng:p.coords.longitude,acc:p.coords.accuracy,age:Math.max(0,(Date.now()-p.timestamp)/1000)});},function(){res(null);},{enableHighAccuracy:true,maximumAge:0,timeout:12000});
 });
}

/* ---------- data ---------- */
function addMsg(m){
 if(X.ids[m.id])return false;
 X.ids[m.id]=1;m.ts=new Date(m.created_at).getTime();X.msgs.push(m);return true;
}
async function ensureNames(ids){
 var need=ids.filter(function(i){return i&&!X.names[i];});
 need=need.filter(function(v,i,a){return a.indexOf(v)===i;});
 if(!need.length)return;
 var sb=await getSB();var r=await sb.from('public_profiles').select('id,name,tier').in('id',need);
 (r.data||[]).forEach(function(p){X.names[p.id]=p;});
 need.forEach(function(i){if(!X.names[i])X.names[i]={id:i,name:'Pengguna',tier:''};});
}
async function loadVotes(){
 var ids=X.msgs.filter(function(m){return m.kind==='report';}).map(function(m){return m.id;});
 if(!ids.length)return;
 var sb=await getSB();var r=await sb.from('message_votes').select('message_id,ok,no').in('message_id',ids);
 X.votes={};(r.data||[]).forEach(function(v){X.votes[v.message_id]={ok:v.ok,no:v.no};});
 if(X.uid){var r2=await sb.from('my_votes').select('message_id,v');X.my={};(r2.data||[]).forEach(function(v){X.my[v.message_id]=v.v;});}
}
async function loadAll(){
 if(X.loading)return;X.loading=true;
 try{
  var sb=await getSB();if(!sb){X.ready=true;draw();return;}
  var since=new Date(Date.now()-24*3600e3).toISOString();
  var r=await sb.from('messages').select('id,room,user_id,kind,body,sticker,rep,stn,created_at').gt('created_at',since).order('created_at',{ascending:false}).limit(400);
  X.msgs=[];X.ids={};
  (r.data||[]).reverse().forEach(addMsg);
  await ensureNames(X.msgs.map(function(m){return m.user_id;}));
  var pr=await sb.from('pins').select('room,body');X.pins={};(pr.data||[]).forEach(function(p){X.pins[p.room]=p.body;});
  await loadVotes();
  X.ready=true;X.err='';
  await loadAjak();
 }catch(e){X.err=errMsg(e);X.ready=true;}
 X.loading=false;draw();subscribe();
}
function viewing(){var g=document.getElementById('grp');return !!(X.root&&!X.root.hidden&&document.documentElement.dataset.tab==='chat'&&!(g&&g.classList.contains('open'))&&!document.hidden);}
function seen(){if(viewing()){var c=catOf(X.room);if(X.unr[c]){X.unr[c]=0;try{if(window.__jcBadge)window.__jcBadge();}catch(_){}}}}
function unrTotal(){var n=0;for(var k in X.unr){if(!(window.__mute&&window.__mute.room(k)))n+=X.unr[k]||0;}return n;}
async function onNew(list,fromRt){
 var got=[];list.forEach(function(m){if(!m||m.hidden)return;if(addMsg(m))got.push(m);});
 if(!got.length)return;
 if(!fromRt)X.msgs.sort(function(a,b){return a.ts-b.ts;});
 got.forEach(function(m){if(m.user_id!==X.uid&&!(viewing()&&m.room===X.room)){var uc=catOf(m.room);if(!(window.__mute&&window.__mute.room(uc))){X.unr[uc]=(X.unr[uc]||0)+1;}}});
 try{if(window.__jcBadge)window.__jcBadge();}catch(_){}
 await ensureNames(got.map(function(m){return m.user_id;}));
 if(got.some(function(m){return m.kind==='report';}))loadVotes().then(function(){drawMsgs(false);});
 drawTop();drawMsgs(got.some(function(m){return m.user_id===X.uid;}));
}
/* susulan: ambil pesan yang terlewat (HP tidur, sinyal putus, realtime terputus) */
async function catchUp(){
 if(!X.ready||X.cu)return;var sb=await getSB();if(!sb)return;X.cu=true;
 try{var last=X.msgs.length?X.msgs[X.msgs.length-1].created_at:new Date(Date.now()-24*3600e3).toISOString();
  var since=new Date(new Date(last).getTime()-60000).toISOString();
  var r=await sb.from('messages').select('id,room,user_id,kind,body,sticker,rep,stn,created_at').gt('created_at',since).order('created_at',{ascending:true}).limit(200);
  if(r.data)await onNew(r.data,false);}catch(e){}finally{X.cu=false;}
}
async function subscribe(){
 if(X.ch)return;var sb=await getSB();if(!sb||!sb.channel)return;
 X.ch=sb.channel('jx-msgs').on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},function(p){onNew([p.new],true);})
 .subscribe(function(st){
  if(st==='SUBSCRIBED'){catchUp();return;}
  if(st==='CHANNEL_ERROR'||st==='TIMED_OUT'||st==='CLOSED'){var c=X.ch;X.ch=null;try{sb.removeChannel(c);}catch(e){}clearTimeout(X.rsT);X.rsT=setTimeout(function(){subscribe();},3000);}
 });
}
document.addEventListener('visibilitychange',function(){if(!document.hidden&&X.ready){catchUp();if(!X.ch)subscribe();}});
setInterval(function(){if(!document.hidden&&X.ready){catchUp();loadAjak();if(banned()===false&&X.vs.ban){X.vs.ban=0;drawComp();}}},10000);
async function loadAuth(){
 if(X.authOn)return;X.authOn=true;
 var sb=await getSB();if(!sb){X.authOn=false;return;}
 var s=await sb.auth.getSession();
 await setUser(s&&s.data&&s.data.session?s.data.session.user:null);
 sb.auth.onAuthStateChange(function(ev,sess){setUser(sess?sess.user:null);});
}
async function setUser(u){
 var old=X.uid;X.user=u;X.uid=u?u.id:null;X.prof=null;
 if(u){
  var sb=await getSB();var r=await sb.from('profiles').select('id,name,tier,friend_code,created_at,plan').eq('id',u.id).single();
  X.prof=r.data||null;if(X.prof&&X.prof.plan==='admin')X.prof.tier='admin';if(X.prof){X.names[u.id]={id:u.id,name:X.prof.name,tier:X.prof.tier};
   var ln='';try{ln=JSON.parse(localStorage.getItem('jc_name')||'""')||'';}catch(e){}
   if(!ln&&window.__setName)window.__setName(String(X.prof.name||'').slice(0,16));else if(ln&&ln!==X.prof.name&&window.__syncName)window.__syncName(ln,1);}
 }
 if(old!==X.uid){X.my={};X.vs={points:0,ban:0};loadStatus();if(X.ready){loadVotes().then(function(){draw();});loadAjak();}}
 draw();if(window.__jshell&&window.__jshell.refreshProf)window.__jshell.refreshProf();
}

/* ---------- pelanggaran ---------- */
async function loadStatus(){if(!X.uid){X.vs={points:0,ban:0};return;}
 try{var r=await rpc('my_status');X.vs={points:(r&&r.points)||0,ban:r&&r.ban_until?new Date(r.ban_until).getTime():0};}catch(e){}
 drawComp();try{if(window.__jshell&&window.__jshell.refreshProf)window.__jshell.refreshProf();}catch(e){}}
function banned(){return X.vs.ban&&X.vs.ban>Date.now();}
function hm2(ts){var d=new Date(ts);return ('0'+d.getHours()).slice(-2)+'.'+('0'+d.getMinutes()).slice(-2);}
function banTxt(){if(!banned())return '';var d=new Date(X.vs.ban),n=new Date();var day=d.toDateString()===n.toDateString()?'':(d.getDate()+'/'+(d.getMonth()+1)+' ');return 'Chat umum dikunci sampai '+day+hm2(X.vs.ban);}

/* ---------- ajakan ---------- */
var AJ_MS=30*60000;
async function loadAjak(){var sb=await getSB();if(!sb)return;var room=X.room;
 try{var r=await rpc('ajakan_list',{p_room:room});if(room!==X.room)return;var old=JSON.stringify(X.aj);X.aj=(r||[]).map(function(a){a.ts=new Date(a.created_at).getTime();a.ex=new Date(a.exp).getTime();return a;});
  ajAuto();if(JSON.stringify(X.aj)!==old)drawMsgs(false);}catch(e){}}
function ajAuto(){X.aj.forEach(function(a){
  if(a.mine&&a.status==='open'&&a.n>=a.slots&&!X.ajBusy[a.id])makeGrp(a.id,true);
  if(a.status==='done'&&a.grp&&!a.mine&&!X.ajDone[a.id]){X.ajDone[a.id]=1;try{localStorage.setItem('jx_ajd',JSON.stringify(X.ajDone));}catch(e){}
   toast('Grup ajakan sudah dibuat. Kamu masuk otomatis');try{window.__grp&&window.__grp.joinInvite(a.grp);}catch(e){}}});}
try{X.ajDone=JSON.parse(localStorage.getItem('jx_ajd')||'{}')||{};}catch(e){}
function ajFix(){return new Promise(function(res){if(!navigator.geolocation)return res(null);navigator.geolocation.getCurrentPosition(function(p){res({lat:p.coords.latitude,lng:p.coords.longitude});},function(){res(null);},{enableHighAccuracy:true,maximumAge:20000,timeout:12000});});}
async function ajPing(){var act=X.aj.filter(function(a){return a.status==='open'&&a.joined&&a.ex>Date.now();});if(!act.length||document.hidden)return;
 var f=await ajFix();if(!f)return;act.forEach(function(a){rpc('ajakan_ping',{p_id:a.id,p_lat:f.lat,p_lon:f.lng}).catch(function(){});});}
setInterval(ajPing,30000);
function ajHTML(a){
 var left=Math.max(0,Math.ceil((a.ex-Date.now())/60000)),res=X.ajRes[a.id],busy=X.ajBusy[a.id],btn='';
 if(a.status==='done')btn='<div class="ajst ok">Grup sudah dibuat'+(a.joined?'':'')+'</div>';
 else if(a.mine)btn='<div class="ajb"><button class="vb pri" data-x="ajgrp" data-i="'+a.id+'"'+(a.n<2||busy?' disabled':'')+'>'+(busy?'Membuat grup…':'Buat grup sekarang')+'</button><button class="vb" data-x="ajbatal" data-i="'+a.id+'">Batalkan</button></div>';
 else if(a.joined)btn='<div class="ajb"><span class="ajst ok">Kamu ikut. Grup dibuat saat penuh</span><button class="vb" data-x="ajkeluar" data-i="'+a.id+'">Keluar</button></div>';
 else if(a.n>=a.slots)btn='<div class="ajst">Penuh</div>';
 else btn='<div class="ajb"><button class="vb pri" data-x="ajikut" data-i="'+a.id+'"'+(busy?' disabled':'')+'>'+(busy?'Memeriksa lokasi… '+busy:'Ikut')+'</button></div>';
 return '<div class="xmsg ajm'+(a.mine?' mine':'')+'"><div class="mb"><div class="bub xcard ajc"><div class="ajh"><span class="ajt">AJAKAN</span><span class="ajn">'+esc(a.owner_name||'Pengguna')+'</span>'+(a.mine?'':'<button class="mo" data-x="ajmo" data-i="'+a.id+'" aria-label="Opsi ajakan">'+ic('more','s')+'</button>')+'</div>'+
  '<div class="ajbody">'+esc(a.body)+'</div><div class="l2">'+a.n+'/'+a.slots+' ikut'+(a.status==='open'?' · berakhir '+left+' mnt lagi':'')+'</div>'+
  (a.names&&a.names.length?'<div class="ajnm">'+a.names.map(esc).join(', ')+'</div>':'')+btn+(res?'<div class="ajres">'+esc(res)+'</div>':'')+
  '<div class="ajsafe">Utamakan keamanan: bertemu di tempat ramai.</div></div><div class="mt"><span data-ts="'+a.ts+'">'+wt(a.ts)+'</span></div></div></div>';
}
async function ajIkut(id){if(!need())return;if(banned()){toast(banTxt());return;}if(X.ajBusy[id])return;
 X.ajRes[id]='';X.ajBusy[id]=3;drawMsgs(false);var fp=ajFix();
 for(var k=2;k>=1;k--){await new Promise(function(r){setTimeout(r,1000);});X.ajBusy[id]=k;drawMsgs(false);}
 await new Promise(function(r){setTimeout(r,1000);});
 var f=await fp;
 try{if(!f)throw new Error('lokasi_kosong');var r=await rpc('ajakan_join',{p_id:+id,p_lat:f.lat,p_lon:f.lng});
  X.ajRes[id]=r.res==='ok'?'':r.res==='jauh'?'Jarak kamu dengan pembuat ajakan jauh':'Jarak kamu dengan pembuat ajakan terlalu jauh';
  if(r.res==='ok')toast('Kamu ikut ajakan ini');}catch(e){X.ajRes[id]=errMsg(e);}
 delete X.ajBusy[id];await loadAjak();drawMsgs(false);}
async function makeGrp(id,auto){var a=X.aj.filter(function(x){return x.id==id;})[0];if(!a||X.ajBusy[id])return;
 if(!window.__grp||!window.__grp.ajakGroup){toast('Grup belum siap. Coba lagi');return;}
 X.ajBusy[id]=1;drawMsgs(false);
 try{var g=await window.__grp.ajakGroup(a.body);if(!g)throw new Error('undangan_salah');
  await rpc('ajakan_done',{p_id:+id,p_grp:g});toast(auto?'Ajakan penuh. Grup dibuat, anggota masuk otomatis':'Grup dibuat. Anggota masuk otomatis');}
 catch(e){if(!auto)toast(errMsg(e));X.ajFail=(X.ajFail||0)+1;}
 if(!X.ajFail||X.ajFail<2)delete X.ajBusy[id];await loadAjak();}

/* ---------- tampilan ---------- */
function newLeft(){
 if(!X.prof)return 0;var d=1*864e5-(Date.now()-new Date(X.prof.created_at).getTime());return d>0?Math.ceil(d/864e5):0;
}
var PINI='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';
var REP_MS=3600e3;function alive(m){return m.kind!=='report'||Date.now()-m.ts<REP_MS;}
function roomMsgs(r){return X.msgs.filter(function(m){return m.room===r&&alive(m);});}
function roomStat(r){
 var sc={};roomMsgs(r).forEach(function(m){if(m.kind!=='report')return;var v=X.votes[m.id]||{ok:0,no:0};sc[m.rep]=(sc[m.rep]||0)+Math.max(0,1+v.ok-v.no);});
 var top=Object.keys(sc).sort(function(a,b){return sc[b]-sc[a];})[0];
 if(!top||sc[top]<3)return 'Normal';
 return top==='Penuh'?'Padat':top==='Kosong'?'Normal':'Gangguan';
}
function tinfo(uid){var t=(X.names[uid]||{}).tier;return t?{c:' t-x t-line t-'+t,k:'<span class="tk">'+t[0].toUpperCase()+'</span>'}:{c:'',k:''};}
function av(uid){var n=(X.names[uid]||{}).name||'?',t=(X.names[uid]||{}).tier,im=null;try{im=window.__jav&&window.__jav.pub?window.__jav.pub(uid):null;}catch(e){}return '<div class="av'+(t==='gold'?' gfr':t==='diamond'?' dfr':t==='admin'?' afr':'')+(im?' hasimg':'')+'" style="background:'+(im?'center/cover url(&quot;'+im+'&quot;)':avc(n))+'">'+(im?'':esc(n.charAt(0).toUpperCase()))+'</div>';}
function msgHTML(m,agg,cont){
 var mine=m.user_id===X.uid,nm=(X.names[m.user_id]||{}).name||'Pengguna',h,body,card='',tc='';
 if(m.kind==='sticker'){
  return '<div class="xmsg'+(mine?' mine':'')+'">'+(mine?'':av(m.user_id))+'<div class="mb">'+(mine?'':'<div class="mn">'+esc(nm)+(agg?'<span class="rt"> · '+esc(m.room)+'</span>':'')+'</div>')+'<div class="stk">'+(STKB[m.sticker]||'')+'</div><div class="mt"><span data-ts="'+m.ts+'">'+wt(m.ts)+'</span></div></div>'+(mine?'':'<button class="mo" data-x="msg" data-i="'+m.id+'" aria-label="Opsi pesan">'+ic('more','s')+'</button>')+'</div>';
 }
 if(m.kind==='report'){
  var v=X.votes[m.id]||{ok:0,no:0},tot=v.ok+v.no,st='',my=X.my[m.id];
  if(tot>=10&&v.ok/tot>=.8)st='ok';else if(tot>=10&&v.ok/tot<.4)st='dbt';
  card=' xcard'+(st==='dbt'?' dbt':'')+'" style="--rc:'+REPC[m.rep];
  body='<div class="l1"><span style="width:10px;height:10px;border-radius:50%;background:'+REPC[m.rep]+'"></span>'+esc(m.rep)+(st==='ok'?'<span class="xchip ok">Dikonfirmasi</span>':(st==='dbt'?'<span class="xchip dbt">Diragukan</span>':''))+'</div>'+(m.stn?'<div class="lcx">'+PINI+'dari '+esc(m.stn)+'</div>':'')+'<div class="l2">'+esc(m.room)+' · <span data-agots="'+m.ts+'">'+agoTxt(m.ts)+'</span> · berakhir '+Math.max(1,Math.ceil((REP_MS-(Date.now()-m.ts))/60000))+' mnt lagi</div>'+
  (mine?'<div class="l2" style="margin-top:6px">'+v.ok+' membenarkan · '+v.no+' menolak</div>':
  '<div class="vt"><button class="vb" data-x="vote" data-i="'+m.id+'" data-v="ok" aria-pressed="'+(my==='ok')+'">Masih sesuai <b>'+v.ok+'</b></button><button class="vb" data-x="vote" data-i="'+m.id+'" data-v="no" aria-pressed="'+(my==='no')+'">Tidak sesuai <b>'+v.no+'</b></button></div>');
 }else{
  body=txtH(m.body||'');if(/^(\s*⟦[a-z]+:\d⟧\s*)+$/.test(m.body||''))body='<span class="ebig">'+body+'</span>';
  var ti=tinfo(m.user_id);tc=ti.c;body+=ti.k;
 }
 h='<div class="xmsg'+(mine?' mine':'')+(cont?' cont':'')+'">'+(mine?'':av(m.user_id))+'<div class="mb">'+(mine||cont?'':'<div class="mn">'+esc(nm)+(agg?'<span class="rt"> · '+esc(m.room)+'</span>':'')+'</div>')+'<div class="bub'+card+tc+'">'+body+'</div><div class="mt"><span data-ts="'+m.ts+'">'+wt(m.ts)+'</span>'+(mine?' '+ic('check','s'):'')+'</div></div>'+(mine?'':'<button class="mo" data-x="msg" data-i="'+m.id+'" aria-label="Opsi pesan">'+ic('more','s')+'</button>')+'</div>';
 return h;
}
function dotH(n){return KC[n]?'<i class="kd" style="background:'+KC[n]+'"></i>':'';}
function segHTML(on){var gn=0,tn=0;try{gn=window.__grp?window.__grp.unread():0;}catch(e){}try{tn=window.__jdm?window.__jdm.unread():0;}catch(e){}
 var b=function(v,t,n){return '<button data-x="seg" data-v="'+v+'" aria-pressed="'+(on===v)+'">'+t+(n?'<b class="run">'+(n>9?'9+':n)+'</b>':'')+'</button>';};
 return '<div class="ctop"><div class="cseg">'+b('umum','Umum',0)+b('grup','Grup',gn)+b('teman','Teman',tn)+'</div></div>';}
function repAgg(r){var o={};roomMsgs(r).forEach(function(m){if(m.kind!=='report')return;var v=X.votes[m.id]||{ok:0,no:0};var k=o[m.rep]||(o[m.rep]={n:0,ts:0});k.n+=1+v.ok;k.ts=Math.max(k.ts,m.ts);});
 return Object.keys(o).map(function(k){return {k:k,n:o[k].n,ts:o[k].ts};}).sort(function(a,b){return b.n-a.n;});}
function topHTML(){
 var rc=catOf(X.room),isU=X.room==='Umum',h=segHTML('umum');
 h+='<div class="rooms">'+CATS.map(function(x){var r=x[0]==='Umum'?'Umum':x[0]==='JL'?'JakLingko':x[0],st=(x[0]==='MRT'||x[0]==='LRT'||x[0]==='JL')?roomStat(r):'';
  if(x[0]==='KRL'||x[0]==='TJ'){var worst='Normal';subRooms(x[0]).forEach(function(s){var z=roomStat(s);if(z==='Gangguan'||(z==='Padat'&&worst==='Normal'))worst=z;});st=worst;}
  var un=(rc!==x[0]&&X.unr[x[0]]&&!(window.__mute&&window.__mute.room(x[0])))?'<b class="run">'+(X.unr[x[0]]>9?'9+':X.unr[x[0]])+'</b>':'';
  return '<button class="room" data-x="cat" data-c="'+x[0]+'" aria-pressed="'+(rc===x[0])+'">'+x[1]+un+(st&&st!=='Normal'?'<i class="sd3" style="background:'+SCOL[st]+'"></i>':'')+'</button>';}).join('')+'</div>';
 if(isU)return h;
 var hasDD=(rc==='KRL'||rc==='TJ');
 var nm=X.room.replace(/^(KRL|TJ) /,''),sh=nm==='Rangkasbitung'?'Rangkas':nm;
 var lbl=rc==='KRL'?dotH(nm)+esc(sh):(nm==='Non-BRT'?'Non-BRT':'Koridor '+esc(nm));
 var ag=repAgg(X.room),chips=ag.length?ag.map(function(a){return '<button class="stc" data-x="agg" data-k="'+esc(a.k)+'" style="--c:'+REPC[a.k]+'">'+esc(a.k)+' <small>'+a.n+' org · '+Math.max(1,Math.round((Date.now()-a.ts)/60000))+' mnt</small></button>';}).join(''):'<span class="stc ok" style="--c:#2F9E6E">Belum ada laporan</span>';
 h+='<div class="rln">'+(hasDD?'<div class="ddw"><button class="ddb sm" data-x="dd" aria-expanded="'+X.dd+'">'+lbl+ic('chev','s')+'</button>'+(X.dd?'<div class="ddl" role="listbox">'+subRooms(rc).map(function(r){var n2=r.replace(/^(KRL|TJ) /,''),z=roomStat(r);return '<button class="ddi" role="option" data-x="room" data-r="'+esc(r)+'" aria-selected="'+(X.room===r)+'"><span class="dn">'+(rc==='KRL'?dotH(n2):'')+(rc==='TJ'&&n2!=='Non-BRT'?'Koridor ':'')+esc(n2)+'</span>'+(z!=='Normal'?'<i class="sd3" style="background:'+SCOL[z]+'"></i>':'')+'</button>';}).join('')+'</div>':'')+'</div>':'')+
  '<div class="stcs">'+chips+'</div></div>';
 if(X.pins[X.room])h+='<div class="rln2"><span class="pt">'+ic('pin','s')+esc(X.pins[X.room])+'</span></div>';
 return h;
}
function compHTML(){
 if(!X.sb&&!window.__JCSB&&!(CFG.url&&CFG.key))return '<div class="comp"><div class="lockb">'+ic('lock','s')+'<span>Server chat belum diatur</span></div></div>';
 if(!X.uid)return '<div class="comp"><button class="xbtn pri login" data-x="login">Masuk untuk menulis</button></div>';
 var nl=newLeft();
 if(nl)return '<div class="comp"><div class="lockb">'+ic('lock','s')+'<span>Akun baru. Menulis dan vote terbuka '+nl+' hari lagi.</span></div></div>';
 if(banned())return '<div class="comp"><div class="lockb ban">'+ic('lock','s')+'<span>'+esc(banTxt())+'</span></div></div>';
 var d=X.draft[X.room]||'',ln=dlen(d);
 return '<div class="comp"><div class="xcnt'+(ln>=MAXC?' full':'')+'">'+(ln>=70?ln+'/'+MAXC:'')+'</div><div class="rowc"><button class="xib plus" data-x="plus" aria-pressed="'+(X.panel==='plus')+'" aria-label="Lapor dan ajakan">'+ic('plus')+'</button><div class="inp ce" contenteditable="true" role="textbox" data-ph="'+(X.room==='Umum'?'Tulis ke General':'Tulis pesan')+'" aria-label="Tulis pesan">'+txtH(d)+'</div><button class="xib" data-x="stk" aria-pressed="'+(!!X.panel&&X.panel!=='plus')+'" aria-label="Emot dan stiker">'+ic('sticker')+'</button><button class="snd" data-x="send" aria-label="Kirim">'+ic('send')+'</button></div></div>';
}
function panelHTML(){
 if(!X.panel||!X.uid)return '';
 if(X.panel==='plus'){var rc2=catOf(X.room),q=QR[rc2];
  var LO=X.loc||{},okL=!!LO.ok,lh='';
  if(q){lh='<div class="plh">LOKASIMU</div>'+(LO.busy&&!LO.done?'<div class="plw">Memeriksa lokasi…</div>':okL?'<div class="plo">'+LO.opts.map(function(o,i){return '<button data-x="lpick" data-i="'+i+'" aria-pressed="'+(i===(LO.pick||0))+'">'+PINI+'<span>'+esc(o.l)+'</span></button>';}).join('')+'</div>':'<div class="plw no">'+esc(window.__jloc?window.__jloc.why(LO.why):'')+'</div>');}
  return '<div class="epn plusp">'+(q?lh+'<div class="plh">LAPOR KONDISI '+esc(X.room.toUpperCase())+'</div><div class="plk">'+q.map(function(n){return '<button data-x="rep" data-n="'+n+'"'+(okL?'':' disabled')+'><i style="background:'+REPC[n]+'"></i>'+n+'</button>';}).join('')+'</div>':'')+
   '<button class="pla" data-x="ajak"><span>🙋</span><b>Buat ajakan</b></button></div>';}
 var r3=rank(),cl=r3?[0,1,2,3,4]:[2,0],tab=r3?X.panel:'emo',h='<div class="epn">';
 if(r3)h+='<div class="etabs"><button data-x="ptab" data-t="emo" aria-pressed="'+(tab==='emo')+'">Emot</button><button data-x="ptab" data-t="stk" aria-pressed="'+(tab==='stk')+'">Stiker</button></div>';
 if(tab==='emo'){
  h+='<div class="erow">'+EMOL.map(function(x,i){
   var pill='';
   if(X.emPick===x.id)pill='<div class="emp '+(i<3?'l':i>6?'r':'c')+'">'+cl.map(function(ci){return '<button class="epc" data-x="emocol" data-i="'+ci+'" aria-label="'+EMN[ci]+'">'+emoSVG(x.id,ci)+'</button>';}).join('')+'</div>';
   return '<div class="embw">'+pill+'<button class="emb" data-x="emoins" data-id="'+x.id+'" aria-label="'+esc(x.n)+'">'+emoSVG(x.id,X.emc[x.id])+'</button></div>';}).join('')+'</div>';
 }else{
  h+='<div class="stg2">'+STKL.filter(function(x){return TRK[x.t]<=r3;}).map(function(x){return '<button class="stkb" data-x="stksend" data-id="'+x.id+'" aria-label="'+esc(x.n)+'">'+x.svg+'</button>';}).join('')+'</div>';
 }
 return h+'</div>';
}
function mount(root){
 X.root=root;
 root.innerHTML='<div id="jxtop"></div><div class="msgs" id="jxmsgs"></div><div class="cwrap"><div id="jxpanel"></div><div id="jxcomp"></div></div>';
 root.addEventListener('click',onClick);
 root.addEventListener('input',onInput);
 root.addEventListener('beforeinput',function(e){var t=e.target;if(t.classList&&t.classList.contains('ce')&&e.inputType&&e.inputType.indexOf('insert')===0&&e.inputType!=='insertParagraph'&&dlen(ce2s(t))>=MAXC)e.preventDefault();});
 root.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.classList&&e.target.classList.contains('ce')){e.preventDefault();send();}});
 root.addEventListener('contextmenu',function(e){if(e.target.closest('.emb'))e.preventDefault();});
 var lp=null;
 root.addEventListener('pointerdown',function(e){var b=e.target.closest('.emb');if(!b)return;lp=setTimeout(function(){lp=null;X.lpF=true;X.emPick=b.dataset.id;drawPanel();},450);});
 ['pointerup','pointercancel','pointerleave'].forEach(function(n){root.addEventListener(n,function(){if(lp){clearTimeout(lp);lp=null;}});});
 var rooms=null,dr=null;
 root.addEventListener('mousedown',function(e){var r=e.target.closest('.rooms');if(!r)return;dr={r:r,x:e.clientX,l:r.scrollLeft,m:false};});
 window.addEventListener('mousemove',function(e){if(!dr)return;var dx=e.clientX-dr.x;if(Math.abs(dx)>4)dr.m=true;dr.r.scrollLeft=dr.l-dx;});
 window.addEventListener('mouseup',function(){if(dr&&dr.m)X.noClick=true;dr=null;setTimeout(function(){X.noClick=false;},0);});
 draw();
}
function draw(){if(!X.root)return;drawTop();drawComp();drawPanel();drawMsgs(true);}
function drawTop(){seen();
 var t=el('#jxtop',X.root);if(!t)return;
 var rl=el('.rooms',t),sl=rl?rl.scrollLeft:0;
 t.innerHTML=topHTML();
 var n=el('.rooms',t);if(n&&sl)n.scrollLeft=sl;
 var act=el('.room[aria-pressed="true"]',t);if(act&&!sl&&act.scrollIntoView){}
}
function drawComp(){
 var c=el('#jxcomp',X.root);if(!c)return;
 var focus=document.activeElement&&document.activeElement.classList&&document.activeElement.classList.contains('ce');
 c.innerHTML=compHTML();
 if(focus){var i=el('.ce',c);if(i){i.focus();var rg=document.createRange();rg.selectNodeContents(i);rg.collapse(false);var s=window.getSelection();s.removeAllRanges();s.addRange(rg);}}
}
function drawPanel(){var p=el('#jxpanel',X.root);if(p)p.innerHTML=panelHTML();}
function drawMsgs(toBottom){
 var m=el('#jxmsgs',X.root);if(!m)return;
 var near=m.scrollHeight-m.scrollTop-m.clientHeight<80,st=m.scrollTop;
 var isU=X.room==='Umum',list=isU?roomMsgs('Umum').slice(-120):roomMsgs(X.room),h;
 if(!X.ready)h='<div class="empty">Memuat…</div>';
 else if(X.err&&!list.length)h='<div class="empty">'+esc(X.err)+'</div>';
 else if(!list.length)h=isU?'<div class="empty">Belum ada pesan.</div>':'<div class="empty">Belum ada laporan di jalur ini.<br>Jadilah yang pertama.</div>';
 else h='';
 if(X.ready&&list.length||X.aj.length){var all=list.concat(X.aj.map(function(a){return {kind:'ajak',ts:a.ts,a:a};}));all.sort(function(a,b){return a.ts-b.ts;});
  h=all.map(function(x,i){if(x.kind==='ajak')return ajHTML(x.a);var p=all[i-1];return msgHTML(x,false,!!(p&&p.kind!=='ajak'&&p.user_id===x.user_id&&p.kind==='text'&&x.kind==='text'&&x.ts-p.ts<180000));}).join('');}
 try{if(window.__jav&&window.__jav.pubLoad)window.__jav.pubLoad(list.map(function(m){return m.user_id;}),function(){drawMsgs(false);});}catch(e){}
 m.innerHTML=h;
 if(toBottom||near)m.scrollTop=m.scrollHeight;else m.scrollTop=st;
}

/* ---------- aksi ---------- */
var snT=null;
window.__syncName=function(v,now){clearTimeout(snT);if(!X.uid||!v)return;snT=setTimeout(async function(){try{var sb=await getSB();var r=await sb.from('profiles').update({name:v}).eq('id',X.uid);if(r.error)throw r.error;if(X.prof)X.prof.name=v;X.names[X.uid]={id:X.uid,name:v,tier:X.prof?X.prof.tier:''};}catch(e){}},now?0:1000);};
function need(){if(!X.uid){sheet('login');return false;}if(newLeft()){toast('Akun baru. Terbuka '+newLeft()+' hari lagi');return false;}return true;}
async function send(){
 if(!need())return;
 if(banned()){toast(banTxt());return;}
 var inp=el('.ce',X.root);if(!inp)return;
 var val=ce2s(inp).trim();
 if(!val){toast('Tulis pesan dulu');return;}
 if(dlen(val)>MAXC){toast('Maksimal '+MAXC+' karakter');return;}
 if(Date.now()-X.lastSend<2000){toast('Tunggu sebentar');return;}
 var fr=filterMsg(val);if(fr){toast(fr.indexOf('Kamu')===0?fr:'Pesan ditolak: '+fr);return;}
 X.lastSend=Date.now();
 try{
  var id=await rpc('post_message',{p_room:X.room,p_kind:'text',p_body:val,p_sticker:null});
  if(id==-1){X.draft[X.room]='';inp.innerHTML='';toast('Anda kena pelanggaran. +1 poin',5000);await loadStatus();return;}
  X.draft[X.room]='';inp.innerHTML='';var cn=el('.xcnt',X.root);if(cn)cn.textContent='';
  if(id&&addMsg({id:id,room:X.room,user_id:X.uid,kind:'text',body:val,created_at:new Date().toISOString()})){drawTop();drawMsgs(true);}
 }catch(e){toast(errMsg(e));if(/dikunci/.test((e&&e.message)||''))loadStatus();}
}
async function sendSticker(id){
 if(!need())return;
 if(banned()){toast(banTxt());return;}
 if(Date.now()-X.lastSend<2000){toast('Tunggu sebentar');return;}
 X.lastSend=Date.now();X.panel=null;drawPanel();
 try{
  var mid=await rpc('post_message',{p_room:X.room,p_kind:'sticker',p_body:null,p_sticker:id});
  if(mid&&addMsg({id:mid,room:X.room,user_id:X.uid,kind:'sticker',sticker:id,created_at:new Date().toISOString()}))drawMsgs(true);
 }catch(e){toast(errMsg(e));}
}
/* lokasi untuk lapor: dicek ulang tiap 4 detik selama panel + terbuka */
var locT=null;
function locLoop(){clearTimeout(locT);if(X.panel!=='plus'||!QR[catOf(X.room)]||!window.__jloc)return;
 X.loc=X.loc||{};X.loc.busy=true;if(!X.loc.done)drawPanel();
 window.__jloc.check().then(function(r){var pk=X.loc&&X.loc.opts&&r.ok&&X.loc.opts[X.loc.pick||0]?X.loc.opts[X.loc.pick||0].l:null;
  X.loc={ok:!!r.ok,opts:r.opts||[],why:r.why,done:true,pick:0};if(pk)r.opts&&r.opts.forEach(function(o,i){if(o.l===pk)X.loc.pick=i;});
  if(X.panel==='plus')drawPanel();locT=setTimeout(locLoop,4000);});}
async function lapor(n){
 if(!need())return;
 var LO=X.loc||{};if(!LO.ok||!LO.opts||!LO.opts.length){toast(window.__jloc?window.__jloc.why(LO.why):'Gagal');return;}
 var loc=LO.opts[LO.pick||0].l;
 X.rdd=false;X.panel=null;drawTop();drawComp();drawPanel();
 try{
  var id=await rpc('post_report2',{p_room:X.room,p_rep:n,p_track:window.__jloc.track(),p_loc:loc});
  toast('Laporan terkirim ke '+X.room);
  if(id&&addMsg({id:id,room:X.room,user_id:X.uid,kind:'report',rep:n,stn:loc,created_at:new Date().toISOString()})){X.votes[id]={ok:0,no:0};drawTop();drawMsgs(true);}
 }catch(e){toast(errMsg(e));}
}
async function vote(id,v){
 if(!need())return;
 var m=X.msgs.filter(function(x){return x.id==id;})[0];if(!m)return;
 if(!window.__jloc)return;
 var lc=await window.__jloc.check(true);
 if(!lc.ok){toast(lc.why==='jauh'?'Vote hanya bisa saat kamu di stasiun, halte, atau di dalam kereta/bus':window.__jloc.why(lc.why));return;}
 try{
  var r=await rpc('vote_report2',{p_message:+id,p_v:v,p_track:window.__jloc.track()});
  if(r)X.my[id]=r;else delete X.my[id];
  await loadVotes();drawTop();drawMsgs(false);
 }catch(e){toast(errMsg(e));}
}
function setRoom(r){
 X.room=r;X.dd=false;X.rdd=false;X.panel=null;X.emPick=null;X.aj=[];loadAjak();
 var c=catOf(r);if(c==='KRL'||c==='TJ')X.lastRoom[c]=r;
 try{localStorage.setItem('jx_room',r);}catch(e){}
 draw();
}
function onClick(e){
 var t=e.target.closest('[data-x]');
 if(!t){if(X.dd||X.rdd||X.emPick||X.panel){X.dd=false;X.rdd=false;X.emPick=null;if(X.panel&&e.target.closest('#jxmsgs'))X.panel=null;drawTop();drawComp();drawPanel();}return;}
 if(X.noClick&&t.closest('.rooms'))return;
 if(X.lpF&&t.classList.contains('emb')){X.lpF=false;return;}
 var a=t.dataset.x,d=t.dataset;
 if(a==='seg'){if(d.v==='grup'&&window.__jshell&&window.__jshell.openGrp)window.__jshell.openGrp();else if(d.v==='teman'&&window.__jdm)window.__jdm.open();return;}
 if(a==='plus'){X.panel=X.panel==='plus'?null:'plus';X.emPick=null;drawComp();drawPanel();if(X.panel==='plus')locLoop();return;}
 if(a==='lpick'){X.loc.pick=+d.i;drawPanel();return;}
 if(a==='agg'){sheet('agg',d.k);return;}
 if(a==='ajak'){X.panel=null;drawComp();drawPanel();if(!need())return;if(banned()){toast(banTxt());return;}sheet('ajak');return;}
 if(a==='ajikut'){ajIkut(d.i);return;}
 if(a==='ajgrp'){makeGrp(d.i,false);return;}
 if(a==='ajbatal'){sheet('ajbatal',d.i);return;}
 if(a==='ajkeluar'){rpc('ajakan_leave',{p_id:+d.i}).then(loadAjak).catch(function(er){toast(errMsg(er));});return;}
 if(a==='ajmo'){sheet('ajmo',d.i);return;}
 if(a==='cat'){var c=d.c;setRoom(c==='Umum'?'Umum':c==='MRT'?'MRT':c==='LRT'?'LRT':c==='JL'?'JakLingko':X.lastRoom[c]);return;}
 if(a==='dd'){X.dd=!X.dd;X.rdd=false;drawTop();return;}
 if(a==='room'){setRoom(d.r);return;}
 if(a==='lapor'){X.rdd=!X.rdd;X.dd=false;drawTop();return;}
 if(a==='rep'){lapor(d.n);return;}
 if(a==='login'){sheet('login');return;}
 if(a==='stk'){X.panel=(X.panel&&X.panel!=='plus')?null:'emo';X.emPick=null;drawComp();drawPanel();return;}
 if(a==='ptab'){X.panel=d.t;X.emPick=null;drawPanel();return;}
 if(a==='emoins'){emoAdd(d.id,X.emc[d.id]==null?2:X.emc[d.id]);return;}
 if(a==='emocol'){var id=X.emPick;X.emc[id]=+d.i;X.emPick=null;emoAdd(id,+d.i);drawPanel();return;}
 if(a==='stksend'){sendSticker(d.id);return;}
 if(a==='send'){send();return;}
 if(a==='vote'){vote(d.i,d.v);return;}
 if(a==='msg'){sheet('msg',d.i);return;}
}
function emoAdd(id,ci){
 var inp=el('.ce',X.root);if(!inp)return;
 var cur=ce2s(inp);
 if(dlen(cur)>=MAXC){toast('Maksimal '+MAXC+' karakter');return;}
 cur+='⟦'+id+':'+ci+'⟧';X.draft[X.room]=cur;
 inp.innerHTML=txtH(cur);
 var cn=el('.xcnt',X.root),L=dlen(cur);if(cn){cn.textContent=L>=70?L+'/'+MAXC:'';cn.classList.toggle('full',L>=MAXC);}
 drawPanel();
}
function onInput(e){
 var t=e.target;if(!t.classList||!t.classList.contains('ce'))return;
 var dv=ce2s(t);
 if(dlen(dv)>MAXC){dv=dcut(dv);t.innerHTML=txtH(dv);var rg=document.createRange();rg.selectNodeContents(t);rg.collapse(false);var s=window.getSelection();s.removeAllRanges();s.addRange(rg);}
 X.draft[X.room]=dv;
 var cn=el('.xcnt',X.root),L=dlen(dv);if(cn){cn.textContent=L>=70?L+'/'+MAXC:'';cn.classList.toggle('full',L>=MAXC);}
}

/* ---------- sheet ---------- */
var SH=null;
/* login Google di web: tombol resmi Google (tampil "Lanjutkan ke jejakcommuter.com") */
function isNat(){var C=window.Capacitor;return !!(C&&C.isNativePlatform&&C.isNativePlatform());}
var GSIP=null,gsiOn=false;
function loadGSI(){if(GSIP)return GSIP;GSIP=new Promise(function(res,rej){if(window.google&&google.accounts&&google.accounts.id)return res();var s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=function(){res();};s.onerror=function(){GSIP=null;rej(new Error('gsi'));};document.head.appendChild(s);setTimeout(function(){if(!(window.google&&google.accounts&&google.accounts.id)){GSIP=null;rej(new Error('gsi'));}},8000);});return GSIP;}
async function gsiReady(){if(!CFG.gweb)throw new Error('gsi');await loadGSI();if(!gsiOn){google.accounts.id.initialize({client_id:CFG.gweb,ux_mode:'popup',auto_select:false,context:'signin',itp_support:true,callback:async function(r){try{var sb=await getSB();var o=await sb.auth.signInWithIdToken({provider:'google',token:r.credential});if(o.error)throw o.error;if(o.data&&o.data.user)await setUser(o.data.user);closeSheet();toast('Berhasil masuk');}catch(er){toast(errMsg(er));}}});gsiOn=true;}}
function gsiButton(el){gsiReady().then(function(){el.innerHTML='';google.accounts.id.renderButton(el,{type:'standard',theme:'outline',size:'large',text:'continue_with',shape:'pill',logo_alignment:'left',locale:'id',width:Math.max(220,Math.min(320,el.clientWidth||300))});}).catch(function(){el.innerHTML='<button class="jb pri" data-s="google" style="width:100%">Lanjut dengan Google</button>';});}
function closeSheet(){if(SH){SH.remove();SH=null;}}
function sheet(kind,arg){
 closeSheet();
 var h='';
 if(kind==='login'){
  h='<b>Masuk ke Jecom</b><p>Untuk menulis, melapor, dan vote. Membaca chat tidak perlu masuk.</p>'+(isNat()?'<button class="jb pri" data-s="google">Lanjut dengan Google</button>':'<div id="jxgsi" style="display:flex;justify-content:center;min-height:44px;margin:4px 0"></div>')+'<p class="sm">Dengan masuk, kamu setuju dengan <a href="https://jejakcommuter.com/syarat/" target="_blank" rel="noopener">Syarat</a> dan <a href="https://jejakcommuter.com/privasi/" target="_blank" rel="noopener">Privasi</a>.</p><button class="jb" data-s="x">Batal</button>';
 }else if(kind==='msg'){
  var m=X.msgs.filter(function(x){return x.id==arg;})[0];var nm=m?((X.names[m.user_id]||{}).name||'Pengguna'):'';
  var hasF=false;try{hasF=!!(m&&window.__jav&&window.__jav.pub&&window.__jav.pub(m.user_id));}catch(e){}
  h='<b>'+esc(nm)+'</b><button class="jb" data-s="rpt" data-i="'+arg+'">Laporkan pesan</button>'+(hasF?'<button class="jb" data-s="rptf" data-i="'+arg+'">Laporkan foto</button>':'')+'<button class="jb dng" data-s="blk" data-i="'+arg+'">Blokir pengguna</button><button class="jb" data-s="x">Batal</button>';
 }else if(kind==='blk'){
  var m2=X.msgs.filter(function(x){return x.id==arg;})[0];var n2=m2?((X.names[m2.user_id]||{}).name||'Pengguna'):'';
  h='<b>Blokir '+esc(n2)+'?</b><p>Pesannya tidak akan terlihat lagi di chat kamu.</p><button class="jb dng" data-s="blk2" data-i="'+arg+'">Blokir</button><button class="jb" data-s="x">Batal</button>';
 }else if(kind==='name'){
  h='<b>Ubah nama</b><input class="jfld" id="jxname" maxlength="30" value="'+esc(X.prof?X.prof.name:'')+'" aria-label="Nama"><button class="jb pri" data-s="name2">Simpan</button><button class="jb" data-s="x">Batal</button>';
 }else if(kind==='agg'){
  var rl=roomMsgs(X.room).filter(function(x){return x.kind==='report'&&x.rep===arg;}).sort(function(a,b){return b.ts-a.ts;});
  h='<b>'+esc(arg)+' di '+esc(X.room)+'</b><div class="aggl">'+rl.map(function(x){return '<div class="aggr"><span>'+PINI+esc(x.stn||'Lokasi tidak tercatat')+'</span><small>'+esc((X.names[x.user_id]||{}).name||'Pengguna')+' · '+agoTxt(x.ts)+'</small></div>';}).join('')+'</div><button class="jb" data-s="x">Tutup</button>';
 }else if(kind==='ajak'){
  h='<b>Buat ajakan</b><textarea class="jfld" id="jxaj" maxlength="90" rows="3" placeholder="Contoh: Ngopi bareng di Stasiun Sudirman, ada yang mau?" aria-label="Isi ajakan"></textarea><p class="sm">Untuk 5 orang di sekitarmu, aktif 30 menit. Utamakan keamanan: bertemu di tempat ramai.</p><button class="jb pri" data-s="ajak2">Buat ajakan</button><button class="jb" data-s="x">Batal</button>';
 }else if(kind==='ajbatal'){
  h='<b>Batalkan ajakan?</b><button class="jb dng" data-s="ajbatal2" data-i="'+arg+'">Batalkan ajakan</button><button class="jb" data-s="x">Tidak</button>';
 }else if(kind==='ajmo'){
  h='<b>Ajakan</b><button class="jb" data-s="ajrpt" data-i="'+arg+'">Laporkan ajakan</button><button class="jb" data-s="x">Batal</button>';
 }else if(kind==='del'){
  h='<b>Hapus akun?</b><p>Akun, nama, dan level kamu dihapus permanen. Pesan kamu ikut terhapus.</p><button class="jb dng" data-s="del2">Hapus akun</button><button class="jb" data-s="x">Batal</button>';
 }
 SH=document.createElement('div');SH.id='jxs';SH.innerHTML='<div class="jxb"></div><div class="jxc" role="dialog" aria-modal="true">'+h+'</div>';
 document.body.appendChild(SH);
 SH.addEventListener('click',sheetClick);
 var gb=SH.querySelector('#jxgsi');if(gb)gsiButton(gb);
}
async function nativeGoogle(){
 var C=window.Capacitor;
 if(!(C&&C.isNativePlatform&&C.isNativePlatform()))return false;
 var SL=C.Plugins&&C.Plugins.SocialLogin;if(!SL)return false;
 await SL.initialize({google:{webClientId:CFG.gweb}});
 var r=await SL.login({provider:'google',options:{}});
 var tok=r&&r.result&&r.result.idToken;if(!tok)throw new Error('google');
 var sb=await getSB();var o=await sb.auth.signInWithIdToken({provider:'google',token:tok});
 if(o.error)throw o.error;if(o.data&&o.data.user)await setUser(o.data.user);return true;
}
async function googleLogin(){
 if(!isNat()){sheet('login');if(CFG.gweb)gsiReady().then(function(){try{google.accounts.id.prompt();}catch(e){}}).catch(function(){});return;}
 var done=false;try{done=await nativeGoogle();}catch(er){var em=String((er&&(er.message||er.code))||er||'').replace(/\s+/g,' ').slice(0,110);toast('Login Google gagal'+(em?': '+em:''));return;}
 if(!done){var sb=await getSB();if(!sb){toast('Server belum diatur');return;}var red=/^https?:/.test(location.protocol)?location.origin+location.pathname:'https://jejakcommuter.com/app/';await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:red}});}
}
async function sheetClick(e){
 if(e.target.classList.contains('jxb')){closeSheet();return;}
 var b=e.target.closest('[data-s]');if(!b)return;
 var s=b.dataset.s,i=b.dataset.i;
 if(s==='x'){closeSheet();return;}
 if(s==='google'){
  try{
   var done=false;try{done=await nativeGoogle();}catch(er){var em=String((er&&(er.message||er.code))||er||'').replace(/\s+/g,' ').slice(0,110);toast('Login Google gagal'+(em?': '+em:''));closeSheet();return;}
   if(!done){var sb=await getSB();var red=/^https?:/.test(location.protocol)?location.origin+location.pathname:'https://jejakcommuter.com/app/';await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:red}});}
   closeSheet();
  }catch(er){toast(errMsg(er));}
  return;
 }
 if(s==='rpt'){closeSheet();try{await rpc('report_message',{p_message:+i,p_reason:null});toast('Laporan diterima. Terima kasih');}catch(er){toast(errMsg(er));}return;}
 if(s==='rptf'){var mf=X.msgs.filter(function(x){return x.id==i;})[0];closeSheet();if(!mf)return;try{await rpc('photo_report',{p_uid:mf.user_id});toast('Laporan foto diterima. Terima kasih');}catch(er){toast(errMsg(er));}return;}
 if(s==='blk'){sheet('blk',i);return;}
 if(s==='ajak2'){var tx=(el('#jxaj',SH).value||'').trim();if(tx.length<3){toast('Tulis ajakan dulu');return;}var fr2=filterMsg(tx);if(fr2){toast(fr2.indexOf('Kamu')===0?fr2:'Ajakan ditolak: '+fr2);return;}
  b.disabled=true;b.textContent='Memeriksa lokasi…';var f=await ajFix();
  try{if(!f)throw new Error('lokasi_kosong');var nid=await rpc('ajakan_create',{p_room:X.room,p_body:tx,p_lat:f.lat,p_lon:f.lng});closeSheet();
   if(nid==-1){toast('Anda kena pelanggaran. +1 poin',5000);loadStatus();return;}toast('Ajakan dibuat');await loadAjak();drawMsgs(true);}
  catch(er){b.disabled=false;b.textContent='Buat ajakan';toast(errMsg(er));}
  return;}
 if(s==='ajbatal2'){closeSheet();try{await rpc('ajakan_leave',{p_id:+i});await loadAjak();}catch(er){toast(errMsg(er));}return;}
 if(s==='ajrpt'){closeSheet();try{await rpc('ajakan_report',{p_id:+i});toast('Laporan diterima. Terima kasih');}catch(er){toast(errMsg(er));}return;}
 if(s==='blk2'){
  var m=X.msgs.filter(function(x){return x.id==i;})[0];closeSheet();if(!m)return;
  try{await rpc('block_user',{p_user:m.user_id});X.msgs=X.msgs.filter(function(x){return x.user_id!==m.user_id;});toast('Pengguna diblokir');drawTop();drawMsgs(false);}catch(er){toast(errMsg(er));}
  return;
 }
 if(s==='name2'){
  var v=(el('#jxname',SH).value||'').trim().slice(0,30);if(!v){toast('Nama tidak boleh kosong');return;}
  try{var sb2=await getSB();var r=await sb2.from('profiles').update({name:v}).eq('id',X.uid);if(r.error)throw r.error;X.prof.name=v;X.names[X.uid]={id:X.uid,name:v,tier:X.prof.tier};closeSheet();toast('Nama diubah');drawMsgs(false);if(window.__jshell&&window.__jshell.refreshProf)window.__jshell.refreshProf();}catch(er){toast(errMsg(er));}
  return;
 }
 if(s==='del2'){
  try{await rpc('delete_my_account');var sb3=await getSB();try{await sb3.auth.signOut();}catch(x){}closeSheet();toast('Akun dihapus');}catch(er){toast(errMsg(er));}
  return;
 }
}

/* ---------- kartu akun di Profil ---------- */
var TN={bronze:'Bronze',silver:'Silver',gold:'Gold',diamond:'Diamond',admin:'Admin'};
function acctHTML(){
 if(!X.uid)return '<button class="jrow" data-ja="login"><span class="g">Masuk dengan Google</span></button>';
 var p=X.prof||{name:'…',tier:'',friend_code:''};
 var um=(X.user&&X.user.user_metadata)||{},gn=um.full_name||um.name||'',em=(X.user&&X.user.email)||'';
 return '<div class="jrow" style="cursor:default"><span class="g">Akun Google</span><span class="v" style="text-align:right">'+esc(gn)+(gn&&em?'<br>':'')+esc(em)+'</span></div>'+
 '<div class="jrow" style="cursor:default"><span class="g">Level</span><span class="v">'+(TN[p.tier]||'Belum ada')+'</span></div>'+
 '<button class="jrow" data-ja="code"><span class="g">Kode teman</span><span class="v">'+esc(p.friend_code||'')+'</span></button>'+
 '<button class="jrow" data-ja="out"><span class="g">Keluar</span></button>'+
 '<button class="jrow" data-ja="del"><span class="g" style="color:var(--urgent)">Hapus akun</span></button>';
}
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-ja]');if(!b)return;
 var a=b.dataset.ja;
 if(a==='login')sheet('login');
 else if(a==='name')sheet('name');
 else if(a==='del')sheet('del');
 else if(a==='out'){getSB().then(function(sb){return sb.auth.signOut();}).then(function(){toast('Keluar');}).catch(function(){});}
 else if(a==='code'){try{navigator.clipboard.writeText((X.prof||{}).friend_code||'');if(!(window.__sysCopy&&window.__sysCopy()))toast('Kode disalin');}catch(er){}}
});

/* ---------- siklus ---------- */
function tick(){
 if(!X.root||X.root.hidden)return;
 X.root.querySelectorAll('[data-ts]').forEach(function(e){var ts=+e.dataset.ts,tx=wt(ts);if(e.textContent!==tx)e.textContent=tx;});
 X.root.querySelectorAll('[data-agots]').forEach(function(e){var ts=+e.dataset.agots,tx=agoTxt(ts);if(e.textContent!==tx)e.textContent=tx;});
 var cut=Date.now()-24*3600e3,n=X.msgs.length;X.msgs=X.msgs.filter(function(m){return m.ts>cut&&alive(m);});
 if(n!==X.msgs.length)drawMsgs(false);
}
var vt=0;
function refreshVotes(){if(!X.ready||!X.root||X.root.hidden)return;loadVotes().then(function(){drawTop();drawMsgs(false);}).catch(function(){});}

window.__jchat={
 mount:function(root){if(X.mounted)return;X.mounted=true;mount(root);loadAuth().catch(function(){});loadAll();X.tmr=setInterval(tick,10000);setInterval(refreshVotes,20000);},
 show:function(){if(X.root){draw();if(!X.ready&&!X.loading)loadAll();}},
 acct:acctHTML,
 rpc:rpc,errMsg:errMsg,unread:unrTotal,seen:function(){seen();if(X.root)drawTop();},cats:CATS,filter:filterMsg,googleLogin:function(){return googleLogin().catch(function(er){toast(errMsg(er));});},uid:function(){return X.uid;},
 state:X,seg:segHTML,status:function(f){if(f)return loadStatus();return {points:X.vs.points,ban:banned()?X.vs.ban:0,txt:banTxt()};},sb:getSB,stickers:function(){var r3=rank();return STKL.filter(function(x){return TRK[x.t]<=r3;});},stk:function(id){return STKB[id]||'';},emos:function(){return EMOL.map(function(x){return {id:x.id,n:x.n,svg:emoSVG(x.id,2)};});},txtH:txtH,ce2s:ce2s,names:function(){return X.names;}
};
/* status login dibaca saat aplikasi dibuka, tidak menunggu tab Chat */
setTimeout(function(){loadAuth().catch(function(){X.authOn=false;});},400);
})();
