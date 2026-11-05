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
var TRK={bronze:1,silver:2,gold:3,diamond:4};
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
 chev:'<path d="M6 9l6 6 6-6"/>'
};
function ic(n,c){return '<svg class="i '+(c||'')+'" viewBox="0 0 24 24" aria-hidden="true">'+P[n]+'</svg>';}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function avc(n){var s=0;for(var i=0;i<n.length;i++)s+=n.charCodeAt(i);return AVC[s%AVC.length];}

var STKL=window.__CD.STKL,EMOL=window.__CD.EMOL,EMC=window.__CD.EMC;

function emoSVG(id,ci){var c=EMC[ci==null?2:ci];return (EMOB[id]||'').replace(/\{F\}/g,c[0]).replace(/\{S\}/g,'#14202B').replace(/\{I\}/g,c[1]);}
function txtH(t){return esc(t).replace(/⟦([a-z]+):(\d)⟧/g,function(m,id,c){return '<span class="et" contenteditable="false" data-tok="'+id+':'+c+'">'+emoSVG(id,+c)+'</span>';});}
function dlen(s){return s.replace(TOK,'.').length;}
function dcut(s){var o='',n=0,re=/^⟦[a-z]+:\d⟧/,m;while(s.length&&n<MAXC){if(s[0]==='⟦'&&(m=re.exec(s))){o+=m[0];s=s.slice(m[0].length);}else{o+=s[0];s=s.slice(1);}n++;}return o;}
function ce2s(e){var s='';e.childNodes.forEach(function(n){if(n.nodeType===3)s+=n.nodeValue;else if(n.dataset&&n.dataset.tok)s+='⟦'+n.dataset.tok+'⟧';else if(n.nodeName!=='BR')s+=n.textContent;});return s;}

var BAD=['judi','togel','gacor','maxwin','pinjol','pinjaman online','anjing','bangsat','goblok','tolol','kontol','memek','ngentot'];
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
 draft:{},panel:null,emPick:null,emc:{},dd:false,rdd:false,lastSend:0,ready:false,loading:false,ch:null,root:null,tmr:null,busy:false};
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
 laporan_tidak_ada:'Laporan tidak ditemukan'
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
 }catch(e){X.err=errMsg(e);X.ready=true;}
 X.loading=false;draw();subscribe();
}
function viewing(){var g=document.getElementById('grp');return !!(X.root&&!X.root.hidden&&document.documentElement.dataset.tab==='chat'&&!(g&&g.classList.contains('open'))&&!document.hidden);}
function seen(){if(viewing()){var c=catOf(X.room);if(X.unr[c]){X.unr[c]=0;try{if(window.__jcBadge)window.__jcBadge();}catch(_){}}}}
function unrTotal(){var n=0;for(var k in X.unr){if(!(window.__mute&&window.__mute.room(k)))n+=X.unr[k]||0;}return n;}
async function subscribe(){
 if(X.ch)return;var sb=await getSB();if(!sb||!sb.channel)return;
 X.ch=sb.channel('jx-msgs').on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},async function(p){
  var m=p.new;if(!m||m.hidden)return;
  if(!addMsg(m))return;
  if(m.user_id!==X.uid&&!(viewing()&&m.room===X.room)){var uc=catOf(m.room);if(!(window.__mute&&window.__mute.room(uc))){X.unr[uc]=(X.unr[uc]||0)+1;try{if(window.__jcBadge)window.__jcBadge();}catch(_){}}}
  await ensureNames([m.user_id]);
  if(m.kind==='report')loadVotes().then(function(){drawMsgs(false);});
  drawTop();drawMsgs(m.user_id===X.uid);
 }).subscribe();
}
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
  var sb=await getSB();var r=await sb.from('profiles').select('id,name,tier,friend_code,created_at').eq('id',u.id).single();
  X.prof=r.data||null;if(X.prof){X.names[u.id]={id:u.id,name:X.prof.name,tier:X.prof.tier};
   var ln='';try{ln=JSON.parse(localStorage.getItem('jc_name')||'""')||'';}catch(e){}
   if(!ln&&window.__setName)window.__setName(String(X.prof.name||'').slice(0,16));else if(ln&&ln!==X.prof.name&&window.__syncName)window.__syncName(ln,1);}
 }
 if(old!==X.uid){X.my={};if(X.ready){loadVotes().then(function(){draw();});}}
 draw();if(window.__jshell&&window.__jshell.refreshProf)window.__jshell.refreshProf();
}

/* ---------- tampilan ---------- */
function newLeft(){
 if(!X.prof)return 0;var d=1*864e5-(Date.now()-new Date(X.prof.created_at).getTime());return d>0?Math.ceil(d/864e5):0;
}
function roomMsgs(r){return X.msgs.filter(function(m){return m.room===r;});}
function roomStat(r){
 var sc={};roomMsgs(r).forEach(function(m){if(m.kind!=='report')return;var v=X.votes[m.id]||{ok:0,no:0};sc[m.rep]=(sc[m.rep]||0)+Math.max(0,1+v.ok-v.no);});
 var top=Object.keys(sc).sort(function(a,b){return sc[b]-sc[a];})[0];
 if(!top||sc[top]<3)return 'Normal';
 return top==='Penuh'?'Padat':top==='Kosong'?'Normal':'Gangguan';
}
function tinfo(uid){var t=(X.names[uid]||{}).tier;return t?{c:' t-x t-line t-'+t,k:'<span class="tk">'+t[0].toUpperCase()+'</span>'}:{c:'',k:''};}
function av(uid){var n=(X.names[uid]||{}).name||'?',t=(X.names[uid]||{}).tier;return '<div class="av'+(t==='gold'?' gfr':t==='diamond'?' dfr':'')+'" style="background:'+avc(n)+'">'+esc(n.charAt(0).toUpperCase())+'</div>';}
function msgHTML(m,agg){
 var mine=m.user_id===X.uid,nm=(X.names[m.user_id]||{}).name||'Pengguna',h,body,card='',tc='';
 if(m.kind==='sticker'){
  return '<div class="xmsg'+(mine?' mine':'')+'">'+(mine?'':av(m.user_id))+'<div class="mb">'+(mine?'':'<div class="mn">'+esc(nm)+(agg?'<span class="rt"> · '+esc(m.room)+'</span>':'')+'</div>')+'<div class="stk">'+(STKB[m.sticker]||'')+'</div><div class="mt"><span data-ts="'+m.ts+'">'+wt(m.ts)+'</span></div></div>'+(mine?'':'<button class="mo" data-x="msg" data-i="'+m.id+'" aria-label="Opsi pesan">'+ic('more','s')+'</button>')+'</div>';
 }
 if(m.kind==='report'){
  var v=X.votes[m.id]||{ok:0,no:0},tot=v.ok+v.no,st='',my=X.my[m.id];
  if(tot>=10&&v.ok/tot>=.8)st='ok';else if(tot>=10&&v.ok/tot<.4)st='dbt';
  card=' xcard'+(st==='dbt'?' dbt':'')+'" style="--rc:'+REPC[m.rep];
  body='<div class="l1"><span style="width:10px;height:10px;border-radius:50%;background:'+REPC[m.rep]+'"></span>'+esc(m.rep)+(m.stn?' · '+esc(m.stn):'')+(st==='ok'?'<span class="xchip ok">Dikonfirmasi</span>':(st==='dbt'?'<span class="xchip dbt">Diragukan</span>':''))+'</div><div class="l2">'+esc(m.room)+' · <span data-agots="'+m.ts+'">'+agoTxt(m.ts)+'</span></div>'+
  (mine?'<div class="l2" style="margin-top:6px">'+v.ok+' membenarkan · '+v.no+' menolak</div>':
  '<div class="vt"><button class="vb" data-x="vote" data-i="'+m.id+'" data-v="ok" aria-pressed="'+(my==='ok')+'">Masih sesuai <b>'+v.ok+'</b></button><button class="vb" data-x="vote" data-i="'+m.id+'" data-v="no" aria-pressed="'+(my==='no')+'">Tidak sesuai <b>'+v.no+'</b></button></div>');
 }else{
  body=txtH(m.body||'');if(/^(\s*⟦[a-z]+:\d⟧\s*)+$/.test(m.body||''))body='<span class="ebig">'+body+'</span>';
  var ti=tinfo(m.user_id);tc=ti.c;body+=ti.k;
 }
 h='<div class="xmsg'+(mine?' mine':'')+'">'+(mine?'':av(m.user_id))+'<div class="mb">'+(mine?'':'<div class="mn">'+esc(nm)+(agg?'<span class="rt"> · '+esc(m.room)+'</span>':'')+'</div>')+'<div class="bub'+card+tc+'">'+body+'</div><div class="mt"><span data-ts="'+m.ts+'">'+wt(m.ts)+'</span>'+(mine?' '+ic('check','s'):'')+'</div></div>'+(mine?'':'<button class="mo" data-x="msg" data-i="'+m.id+'" aria-label="Opsi pesan">'+ic('more','s')+'</button>')+'</div>';
 return h;
}
function dotH(n){return KC[n]?'<i class="kd" style="background:'+KC[n]+'"></i>':'';}
function topHTML(){
 var rc=catOf(X.room),isU=X.room==='Umum',h='<div class="ctop"><div class="cseg"><button data-x="seg" data-v="umum" aria-pressed="true">Umum</button><button data-x="seg" data-v="grup" aria-pressed="false">Grup</button></div></div>';
 h+='<div class="rooms">'+CATS.map(function(x){var r=x[0]==='Umum'?'Umum':x[0]==='JL'?'JakLingko':x[0],st=(x[0]==='MRT'||x[0]==='LRT'||x[0]==='JL')?roomStat(r):'';
  if(x[0]==='KRL'||x[0]==='TJ'){var worst='Normal';subRooms(x[0]).forEach(function(s){var z=roomStat(s);if(z==='Gangguan'||(z==='Padat'&&worst==='Normal'))worst=z;});st=worst;}
  var un=(rc!==x[0]&&X.unr[x[0]]&&!(window.__mute&&window.__mute.room(x[0])))?'<b class="run">'+(X.unr[x[0]]>9?'9+':X.unr[x[0]])+'</b>':'';
  return '<button class="room" data-x="cat" data-c="'+x[0]+'" aria-pressed="'+(rc===x[0])+'">'+x[1]+un+(st&&st!=='Normal'?'<i class="sd3" style="background:'+SCOL[st]+'"></i>':'')+'</button>';}).join('')+'</div>';
 if(isU)return h;
 var rs=roomStat(X.room),hasDD=(rc==='KRL'||rc==='TJ'),pill='<span class="stp" style="--c:'+SCOL[rs]+'"><i></i>'+rs+'</span>';
 var nm=X.room.replace(/^(KRL|TJ) /,''),sh=nm==='Rangkasbitung'?'Rangkas':nm;
 var lbl=rc==='KRL'?dotH(nm)+esc(sh):(nm==='Non-BRT'?'Non-BRT':'Koridor '+esc(nm));
 h+='<div class="rln">'+(hasDD?'<div class="ddw fl"><button class="ddb" data-x="dd" aria-expanded="'+X.dd+'">'+lbl+ic('chev','s')+'</button>'+(X.dd?'<div class="ddl" role="listbox">'+subRooms(rc).map(function(r){var n2=r.replace(/^(KRL|TJ) /,''),z=roomStat(r);return '<button class="ddi" role="option" data-x="room" data-r="'+esc(r)+'" aria-selected="'+(X.room===r)+'"><span class="dn">'+(rc==='KRL'?dotH(n2):'')+(rc==='TJ'&&n2!=='Non-BRT'?'Koridor ':'')+esc(n2)+'</span>'+(z!=='Normal'?'<i class="sd3" style="background:'+SCOL[z]+'"></i>':'')+'</button>';}).join('')+'</div>':'')+'</div>':'<div class="ddw fl"><div class="ddb stat">'+pill+'</div></div>')+
  '<div class="ddw fl"><button class="lap" data-x="lapor" aria-expanded="'+X.rdd+'" aria-pressed="'+X.rdd+'">'+ic('flag','s')+'Lapor</button>'+(X.rdd?'<div class="ddl rt" role="menu">'+QR[rc].map(function(n){return '<button class="ddi" role="menuitem" data-x="rep" data-n="'+n+'"><span class="dn"><i class="kd" style="background:'+REPC[n]+'"></i>'+n+'</span></button>';}).join('')+'</div>':'')+'</div></div>';
 h+='<div class="rln2">'+(hasDD&&rs!=='Normal'?pill:'')+'<span class="pt">'+(X.pins[X.room]?ic('pin','s')+esc(X.pins[X.room]):'')+'</span></div>';
 return h;
}
function compHTML(){
 if(!X.sb&&!window.__JCSB&&!(CFG.url&&CFG.key))return '<div class="comp"><div class="lockb">'+ic('lock','s')+'<span>Server chat belum diatur</span></div></div>';
 if(!X.uid)return '<div class="comp"><button class="xbtn pri login" data-x="login">Masuk untuk menulis</button></div>';
 var nl=newLeft();
 if(nl)return '<div class="comp"><div class="lockb">'+ic('lock','s')+'<span>Akun baru. Menulis dan vote terbuka '+nl+' hari lagi.</span></div></div>';
 var d=X.draft[X.room]||'',ln=dlen(d);
 return '<div class="comp"><div class="xcnt'+(ln>=MAXC?' full':'')+'">'+(ln>=70?ln+'/'+MAXC:'')+'</div><div class="rowc"><button class="xib" data-x="stk" aria-pressed="'+!!X.panel+'" aria-label="Emot dan stiker">'+ic('sticker')+'</button><div class="inp ce" contenteditable="true" role="textbox" data-ph="'+(X.room==='Umum'?'Tulis ke General':'Tulis pesan')+'" aria-label="Tulis pesan">'+txtH(d)+'</div><button class="snd" data-x="send" aria-label="Kirim">'+ic('send')+'</button></div></div>';
}
function panelHTML(){
 if(!X.panel||!X.uid)return '';
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
 var isU=X.room==='Umum',list=isU?X.msgs.slice(-120):roomMsgs(X.room),h;
 if(!X.ready)h='<div class="empty">Memuat…</div>';
 else if(X.err&&!list.length)h='<div class="empty">'+esc(X.err)+'</div>';
 else if(!list.length)h=isU?'<div class="empty">Belum ada pesan.</div>':'<div class="empty">Belum ada laporan di jalur ini.<br>Jadilah yang pertama.</div>';
 else h=list.map(function(x){return msgHTML(x,isU);}).join('');
 m.innerHTML=h;
 if(toBottom||near)m.scrollTop=m.scrollHeight;else m.scrollTop=st;
}

/* ---------- aksi ---------- */
var snT=null;
window.__syncName=function(v,now){clearTimeout(snT);if(!X.uid||!v)return;snT=setTimeout(async function(){try{var sb=await getSB();var r=await sb.from('profiles').update({name:v}).eq('id',X.uid);if(r.error)throw r.error;if(X.prof)X.prof.name=v;X.names[X.uid]={id:X.uid,name:v,tier:X.prof?X.prof.tier:''};}catch(e){}},now?0:1000);};
function need(){if(!X.uid){sheet('login');return false;}if(newLeft()){toast('Akun baru. Terbuka '+newLeft()+' hari lagi');return false;}return true;}
async function send(){
 if(!need())return;
 var inp=el('.ce',X.root);if(!inp)return;
 var val=ce2s(inp).trim();
 if(!val){toast('Tulis pesan dulu');return;}
 if(dlen(val)>MAXC){toast('Maksimal '+MAXC+' karakter');return;}
 if(Date.now()-X.lastSend<2000){toast('Tunggu sebentar');return;}
 var fr=filterMsg(val);if(fr){toast(fr.indexOf('Kamu')===0?fr:'Pesan ditolak: '+fr);return;}
 X.lastSend=Date.now();
 try{
  var id=await rpc('post_message',{p_room:X.room,p_kind:'text',p_body:val,p_sticker:null});
  X.draft[X.room]='';inp.innerHTML='';var cn=el('.xcnt',X.root);if(cn)cn.textContent='';
  if(id&&addMsg({id:id,room:X.room,user_id:X.uid,kind:'text',body:val,created_at:new Date().toISOString()})){drawTop();drawMsgs(true);}
 }catch(e){toast(errMsg(e));}
}
async function sendSticker(id){
 if(!need())return;
 if(Date.now()-X.lastSend<2000){toast('Tunggu sebentar');return;}
 X.lastSend=Date.now();X.panel=null;drawPanel();
 try{
  var mid=await rpc('post_message',{p_room:X.room,p_kind:'sticker',p_body:null,p_sticker:id});
  if(mid&&addMsg({id:mid,room:X.room,user_id:X.uid,kind:'sticker',sticker:id,created_at:new Date().toISOString()}))drawMsgs(true);
 }catch(e){toast(errMsg(e));}
}
async function lapor(n){
 X.rdd=false;drawTop();
 if(!need())return;
 toast('Mengecek lokasi…');
 var f=await getFix();
 try{
  var id=await rpc('post_report',{p_room:X.room,p_rep:n,p_lat:f?f.lat:null,p_lng:f?f.lng:null,p_acc:f?f.acc:null,p_age:f?f.age:null,p_stn:null});
  toast('Laporan terkirim ke '+X.room);
  if(id&&addMsg({id:id,room:X.room,user_id:X.uid,kind:'report',rep:n,created_at:new Date().toISOString()})){X.votes[id]={ok:0,no:0};drawTop();drawMsgs(true);}
 }catch(e){toast(errMsg(e));}
}
async function vote(id,v){
 if(!need())return;
 var m=X.msgs.filter(function(x){return x.id==id;})[0];if(!m)return;
 toast('Mengecek lokasi…');
 var f=await getFix();
 try{
  var r=await rpc('vote_report',{p_message:+id,p_v:v,p_lat:f?f.lat:null,p_lng:f?f.lng:null,p_acc:f?f.acc:null,p_age:f?f.age:null});
  if(r)X.my[id]=r;else delete X.my[id];
  await loadVotes();drawTop();drawMsgs(false);
 }catch(e){toast(errMsg(e));}
}
function setRoom(r){
 X.room=r;X.dd=false;X.rdd=false;X.panel=null;X.emPick=null;
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
 if(a==='seg'){if(d.v==='grup'&&window.__jshell&&window.__jshell.openGrp)window.__jshell.openGrp();return;}
 if(a==='cat'){var c=d.c;setRoom(c==='Umum'?'Umum':c==='MRT'?'MRT':c==='LRT'?'LRT':c==='JL'?'JakLingko':X.lastRoom[c]);return;}
 if(a==='dd'){X.dd=!X.dd;X.rdd=false;drawTop();return;}
 if(a==='room'){setRoom(d.r);return;}
 if(a==='lapor'){X.rdd=!X.rdd;X.dd=false;drawTop();return;}
 if(a==='rep'){lapor(d.n);return;}
 if(a==='login'){sheet('login');return;}
 if(a==='stk'){X.panel=X.panel?null:'emo';X.emPick=null;drawComp();drawPanel();return;}
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
  h='<b>'+esc(nm)+'</b><button class="jb" data-s="rpt" data-i="'+arg+'">Laporkan pesan</button><button class="jb dng" data-s="blk" data-i="'+arg+'">Blokir pengguna</button><button class="jb" data-s="x">Batal</button>';
 }else if(kind==='blk'){
  var m2=X.msgs.filter(function(x){return x.id==arg;})[0];var n2=m2?((X.names[m2.user_id]||{}).name||'Pengguna'):'';
  h='<b>Blokir '+esc(n2)+'?</b><p>Pesannya tidak akan terlihat lagi di chat kamu.</p><button class="jb dng" data-s="blk2" data-i="'+arg+'">Blokir</button><button class="jb" data-s="x">Batal</button>';
 }else if(kind==='name'){
  h='<b>Ubah nama</b><input class="jfld" id="jxname" maxlength="30" value="'+esc(X.prof?X.prof.name:'')+'" aria-label="Nama"><button class="jb pri" data-s="name2">Simpan</button><button class="jb" data-s="x">Batal</button>';
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
 if(s==='blk'){sheet('blk',i);return;}
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
var TN={bronze:'Bronze',silver:'Silver',gold:'Gold',diamond:'Diamond'};
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
 var cut=Date.now()-24*3600e3,n=X.msgs.length;X.msgs=X.msgs.filter(function(m){return m.ts>cut;});
 if(n!==X.msgs.length)drawMsgs(false);
}
var vt=0;
function refreshVotes(){if(!X.ready||!X.root||X.root.hidden)return;loadVotes().then(function(){drawTop();drawMsgs(false);}).catch(function(){});}

window.__jchat={
 mount:function(root){if(X.mounted)return;X.mounted=true;mount(root);loadAuth().catch(function(){});loadAll();X.tmr=setInterval(tick,10000);setInterval(refreshVotes,20000);},
 show:function(){if(X.root){draw();if(!X.ready&&!X.loading)loadAll();}},
 acct:acctHTML,
 rpc:rpc,errMsg:errMsg,unread:unrTotal,seen:function(){seen();if(X.root)drawTop();},cats:CATS,filter:filterMsg,googleLogin:function(){return googleLogin().catch(function(er){toast(errMsg(er));});},uid:function(){return X.uid;},
 state:X
};
/* status login dibaca saat aplikasi dibuka, tidak menunggu tab Chat */
setTimeout(function(){loadAuth().catch(function(){X.authOn=false;});},400);
})();
