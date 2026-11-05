/* ===== Jecom Lapor: laporan pengguna di stasiun dan halte ===== */
(function(){
'use strict';
const C=()=>window.__jchat,JC=()=>window.__jc;
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const toast=t=>{if(window.__jshell)window.__jshell.toast(t);};
const KIND=[['penuh','Penuh','#D64545'],['ramai','Ramai','#E08A00'],['gangguan','Gangguan','#8E24AA'],['tertahan','Tertahan','#1E6FD9']];
const KN=Object.fromEntries(KIND.map(k=>[k[0],k]));
const ERR={belum_login:'Masuk dengan Google dulu untuk melapor',sudah_konfirmasi:'Kamu sudah melaporkan ini',terlalu_banyak:'Terlalu banyak laporan. Coba lagi nanti',laporan_berakhir:'Laporan ini sudah berakhir',laporan_salah:'Laporan tidak valid'};
function em(e){const m=(e&&e.message)||'';for(const k in ERR)if(m.indexOf(k)>-1)return ERR[k];return 'Gagal. Coba lagi';}
const R={list:[],at:0,busy:false,open:null};
const uid=()=>{try{return C()&&C().uid?C().uid():null;}catch(e){return null;}};
function ago(ts){const m=Math.max(0,Math.round((Date.now()-new Date(ts).getTime())/60000));return m<1?'baru saja':m+' mnt lalu';}

async function load(force){const c=C();if(!c||!c.rpc||R.busy)return;if(!force&&Date.now()-R.at<45000)return;R.busy=true;
  try{R.list=(await c.rpc('reports_active'))||[];R.at=Date.now();paintMap();paintBox();}catch(e){}finally{R.busy=false;}}

/* ---------- titik laporan di peta ---------- */
let stIdx=null;
function idx(){const j=JC();if(!j||!j.ST||!window.__stKey)return null;if(stIdx&&stIdx.n===j.ST.length)return stIdx;
  const m=new Map();j.ST.forEach(s=>{const k=window.__stKey(s);if(!m.has(k))m.set(k,s);});stIdx={n:j.ST.length,m};return stIdx;}
function paintMap(){const j=JC(),map=j&&j.map;if(!map||!map.isStyleLoaded||!map.getStyle())return;const I=idx();if(!I)return;
  const by=new Map();R.list.forEach(r=>{const o=by.get(r.st);if(!o||r.n>o.n)by.set(r.st,r);});
  const fs=[];by.forEach((r,k)=>{const s=I.m.get(k);if(!s)return;const kd=KN[r.kind]||KIND[0];fs.push({type:'Feature',properties:{col:kd[2],id:s.id},geometry:{type:'Point',coordinates:[s.lon,s.lat]}});});
  const fc={type:'FeatureCollection',features:fs};
  try{if(!map.getSource('jrep')){map.addSource('jrep',{type:'geojson',data:fc});
      map.addLayer({id:'jrep',type:'circle',source:'jrep',paint:{'circle-radius':5,'circle-color':['get','col'],'circle-stroke-color':'#fff','circle-stroke-width':1.5,'circle-translate':[7,-7]}});}
    else map.getSource('jrep').setData(fc);}catch(e){}}

/* ---------- kotak laporan di popup stasiun ---------- */
function boxHTML(k){const rs=R.list.filter(r=>r.st===k);
  let h='<div class="jrl">Laporan pengguna</div>';
  h+=rs.length?rs.map(r=>{const kd=KN[r.kind]||KIND[0];return '<div class="jrr"><span class="jrk" style="background:'+kd[2]+'">'+kd[1]+'</span><span class="jrm">'+r.n+' orang · '+ago(r.ts)+'</span>'+(r.mine?'<span class="jrm">kamu ikut</span>':'<button type="button" class="jrb" data-rc="'+r.id+'">Benar</button>')+'</div>';}).join(''):'<div class="jrm" style="margin:2px 0 4px">Belum ada laporan 30 menit terakhir.</div>';
  h+=R.open===k?'<div class="jrc">'+KIND.map(kd=>'<button type="button" class="jrb" data-rk="'+kd[0]+'" data-st="'+esc(k)+'"><i style="background:'+kd[2]+'"></i>'+kd[1]+'</button>').join('')+'</div>':
    '<button type="button" class="jrb jrw" data-ro="'+esc(k)+'">Lapor kondisi di sini</button>';
  return h;}
function paintBox(){document.querySelectorAll('.jrep[data-st]').forEach(b=>{b.innerHTML=boxHTML(b.dataset.st);});}
function fill(k){R.open=null;paintBox();load(true);}

document.addEventListener('click',async e=>{const b=e.target.closest('.jrep [data-ro],.jrep [data-rk],.jrep [data-rc]');if(!b)return;e.stopPropagation();
  if(b.dataset.ro){if(!uid()){toast('Masuk dengan Google dulu untuk melapor');try{C().googleLogin();}catch(_){}return;}R.open=b.dataset.ro;paintBox();return;}
  try{if(b.dataset.rk){await C().rpc('report_add',{p_st:b.dataset.st,p_kind:b.dataset.rk});R.open=null;toast('Terima kasih, laporan terkirim');}
    else{if(!uid()){toast('Masuk dengan Google dulu untuk melapor');return;}await C().rpc('report_confirm',{p_id:+b.dataset.rc});toast('Terima kasih');}
    await load(true);}catch(er){toast(em(er));R.open=null;paintBox();}});

const css=document.createElement('style');css.textContent=
'.jrep{margin-top:8px;border-top:1px solid rgba(127,127,127,.25);padding-top:7px}'+
'.jrl{font-size:12px;font-weight:700;opacity:.75;margin-bottom:4px}'+
'.jrr{display:flex;align-items:center;gap:6px;margin:3px 0}'+
'.jrk{color:#fff;border-radius:6px;padding:1px 7px;font-size:12px;font-weight:700}'+
'.jrm{font-size:12px;opacity:.75;flex:1;white-space:nowrap}.jrr .jrm+.jrm{flex:none}'+
'.jrb{border:1px solid rgba(127,127,127,.4);background:transparent;color:inherit;border-radius:8px;padding:4px 9px;font:600 12px system-ui,sans-serif;cursor:pointer;display:inline-flex;align-items:center;gap:5px}'+
'.jrb i{width:8px;height:8px;border-radius:50%;display:inline-block}'+
'.jrw{width:100%;justify-content:center;margin-top:4px;padding:6px 9px}'+
'.jrc{display:flex;flex-wrap:wrap;gap:5px;margin-top:4px}';
document.head.appendChild(css);

setInterval(()=>{if(!document.hidden)load(false);},15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)load(true);});
(function wait(n){const j=JC();if(j&&j.map&&C()){const go=()=>load(true);if(j.map.loaded())go();else j.map.once('load',go);j.map.on('styledata',()=>{if(!j.map.getSource('jrep'))setTimeout(paintMap,50);});return;}if(n<200)setTimeout(()=>wait(n+1),150);})(0);
window.__lapor={fill,load,state:R};
})();
