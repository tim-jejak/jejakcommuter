/* ===== Jejak GPS untuk laporan: dicatat dari aplikasi Android (bisa mendeteksi lokasi palsu) ===== */
(function(){
'use strict';
const C=()=>window.__jchat;
const L={buf:[],on:false,tmr:null,perm:null,cache:null,cacheAt:0,busy:null};
function nat(){const c=window.Capacitor;return !!(c&&c.isNativePlatform&&c.isNativePlatform());}
function has(){return !!(window.JcLoc&&window.JcLoc.start);}
/* simpan: 3 menit terakhir rapat (2 dtk), sampai 10 menit tiap 10 dtk, sampai 25 menit tiap 60 dtk */
function thin(){const now=Date.now(),out=[];let last=null;
  for(let i=L.buf.length-1;i>=0;i--){const s=L.buf[i],age=(now-s.t)/1000;if(age>1500)break;
    const gap=age<=180?2:age<=600?10:60;
    if(last&&(last.t-s.t)/1000<gap&&!(s.acc<=30&&last.acc>30))continue;
    out.push(s);last=s;}
  L.buf=out.reverse();}
function pull(){if(!has())return;let a=[];try{a=JSON.parse(window.JcLoc.read()||'[]');}catch(e){a=[];}
  a.forEach(s=>{if(!s||!isFinite(s.lat))return;
    /* titik jaringan (kurang akurat) dibuang kalau ada titik GPS dalam 5 detik */
    const p=L.buf[L.buf.length-1];if(p&&Math.abs(p.t-s.t)<1500&&p.acc<=s.acc)return;
    if(p&&Math.abs(p.t-s.t)<1500&&p.acc>s.acc)L.buf.pop();
    L.buf.push({t:s.t,lat:s.lat,lon:s.lon,acc:s.acc,mock:s.mock?1:0});});
  if(a.length)thin();}
function start(){if(L.on||!has())return;let r='';try{r=window.JcLoc.start();}catch(e){}
  if(r==='noperm'){L.perm=false;try{navigator.geolocation.getCurrentPosition(()=>{L.perm=true;setTimeout(start,300);},()=>{},{timeout:15000});}catch(e){}return;}
  L.perm=true;L.on=true;clearInterval(L.tmr);L.tmr=setInterval(pull,1000);}
function stop(){if(!L.on)return;L.on=false;clearInterval(L.tmr);pull();try{window.JcLoc.stop();}catch(e){}}
function track(){pull();const now=Date.now();return L.buf.filter(s=>now-s.t<=1500000).map(s=>[Math.max(0,Math.round((now-s.t)/100)/10),+s.lat.toFixed(6),+s.lon.toFixed(6),Math.round(s.acc||99),s.mock]);}
/* hasil: {ok, opts:[{l,st}], why} ; why: web | versi | izin | palsu | gps | tunggu | jauh | tidak_wajar */
async function check(force){
  if(!nat())return {ok:false,why:'web'};
  if(!has())return {ok:false,why:'versi'};
  if(!L.on)start();
  if(L.perm===false)return {ok:false,why:'izin'};
  if(!force&&L.cache&&Date.now()-L.cacheAt<3000)return L.cache;
  if(L.busy)return L.busy;
  const tr=track();
  if(!tr.length)return {ok:false,why:'gps'};
  if(tr.some(x=>x[4]))return {ok:false,why:'palsu'};
  L.busy=(async()=>{try{const r=await C().rpc('loc_eval',{p_track:tr});L.cache=r||{ok:false,why:'gps'};L.cacheAt=Date.now();return L.cache;}
    catch(e){return {ok:false,why:'net'};}finally{L.busy=null;}})();
  return L.busy;}
const WHY={web:'Lapor hanya dari aplikasi Android',versi:'Perbarui aplikasi untuk lapor',izin:'Izinkan akses lokasi untuk lapor',
  palsu:'Lokasi palsu terdeteksi',gps:'Memastikan lokasi…',tunggu:'Memastikan lokasi…',jauh:'Lapor hanya dari stasiun atau kereta',
  tidak_wajar:'Lapor hanya dari stasiun atau kereta',net:'Tidak ada sinyal'};
function why(w){return WHY[w]||WHY.jauh;}
/* catat terus selama aplikasi terbuka dan sudah masuk, supaya laporan dari kereta (300 m) bisa dihitung */
function sync(){const u=C()&&C().uid&&C().uid();if(!document.hidden&&u&&has())start();else stop();}
document.addEventListener('visibilitychange',sync);setInterval(sync,5000);setTimeout(sync,1500);
window.__jloc={check,track,why,native:()=>nat()&&has(),state:L};
})();
