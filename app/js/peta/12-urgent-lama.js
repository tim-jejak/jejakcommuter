'use strict';
/* ---------- menu urgent ---------- */
function posForUrgent(){if(S.gps)return {p:S.gps,w:'lokasi Anda'};if(S.from)return {p:S.from,w:'titik asal'};const c=map.getCenter();return {p:{lat:c.lat,lon:c.lng},w:'pusat peta'};}
function setPoi(items){if(!mapReady)return;map.getSource('poi').setData({type:'FeatureCollection',features:items.map(x=>({type:'Feature',properties:{name:x.name},geometry:{type:'Point',coordinates:[x.lon,x.lat]}}))});}
function loadPOI(){if(window.__POI)return Promise.resolve(window.__POI);if(S._poiP)return S._poiP;
  S._poiP=new Promise(res=>{const s=document.createElement('script');s.src='poi.js';s.onload=()=>res(window.__POI||null);s.onerror=()=>{S._poiP=null;res(null);};document.head.appendChild(s);});return S._poiP;}
const BLN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function tglId(s){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');return m?(+m[3])+' '+BLN[+m[2]-1]+' '+m[1]:'';}
function hoursLabel(h){if(!h)return '';if(h==='24/7')return 'Buka 24 jam';return 'Jam buka '+h;}
async function renderUrgent(){const {p,w}=posForUrgent(),t=Math.floor(S.t),ub=$('#ub');S.focus=null;draw();
  if(S.utab==='halte'){const items=ST.map(s=>({s,d:hav(p,s),run:[...s.lines].some(i=>runningL(LINES[i],t))})).sort((a,b)=>(b.run-a.run)||(a.d-b.d)).slice(0,6);
    ub.innerHTML='<p class="small">Dihitung dari '+w+'. Yang masih beroperasi diurutkan lebih dulu.</p><ul class="ul">'+items.map((it,i)=>'<li><button type="button" class="ui" data-i="'+i+'"><b>'+esc((it.s.g==='tj'?'Halte ':'Stasiun ')+it.s.name)+'</b><span class="small mono">'+km1(it.d)+' · jalan kaki '+Math.max(1,Math.round(it.d*1.25/75))+' mnt</span><span>'+[...it.s.lines].slice(0,4).map(li=>lb(LINES[li])).join(' ')+' <span class="pill '+(it.run?'ok':'stop')+'">'+(it.run?'Beroperasi':'Berhenti')+'</span></span></button></li>').join('')+'</ul>';
    ub._items=items.map(it=>({lat:it.s.lat,lon:it.s.lon,name:it.s.name}));setPoi(ub._items);return;}
  const tab=S.utab,seq=++S.useq;
  const CFG={
    mm:{def:'Minimarket',qs:[['indomaret','shop:convenience'],['alfamart','shop:convenience'],['alfamidi','shop:convenience'],['shell select','shop:convenience'],['shell','shop:convenience'],['minimarket','shop:convenience'],['supermarket','shop:supermarket']],ov:'nwr[shop~"^(convenience|supermarket)$"];nwr[amenity=fuel][~"^(brand|name|operator)$"~"Shell",i]'},
    spbu:{def:'SPBU',qs:[['spbu','amenity:fuel'],['pertamina','amenity:fuel'],['vivo','amenity:fuel'],['bp','amenity:fuel'],['bensin','amenity:fuel']],ov:'nwr[amenity=fuel]'},
    masjid:{def:'Masjid',qs:[['masjid','amenity:place_of_worship'],['musholla','amenity:place_of_worship'],['mushola','amenity:place_of_worship']],ov:'nwr[amenity=place_of_worship][religion=muslim]'}}[tab];
  const isShell=x=>/shell/i.test([x.name,x.brand,x.operator].filter(Boolean).join(' '));
  const keep=(f)=>f.properties&&!(tab==='spbu'&&isShell(f.properties))&&(tab!=='masjid'||!f.properties.osm_value||/place_of_worship|mosque/.test(f.properties.osm_value));
  const ph=async(r)=>{const bb=[p.lon-r*1.02,p.lat-r,p.lon+r*1.02,p.lat+r].map(v=>v.toFixed(5)).join(',');
    const rs=await Promise.all(CFG.qs.map(([q,tag])=>fetch('https://photon.komoot.io/api/?limit=12&q='+encodeURIComponent(q)+'&osm_tag='+tag+'&lat='+p.lat+'&lon='+p.lon+'&bbox='+bb).then(x=>x.json()).catch(()=>({features:[]}))));
    const out=[];rs.forEach(j=>(j.features||[]).filter(keep).forEach(f=>out.push({lat:f.geometry.coordinates[1],lon:f.geometry.coordinates[0],name:f.properties.name||CFG.def,sub:fmtFeat(f).sub})));return out;};
  const merge=(arr)=>{const seen=[],out=[];arr.forEach(x=>{if(seen.some(s=>hav(s,x)<25&&(s.name===x.name||!s.name||!x.name)))return;seen.push(x);out.push(x);});return out.map(x=>Object.assign(x,{d:hav(p,x)})).sort((a,b)=>a.d-b.d);};
  ub.innerHTML='<p class="small">Mencari '+CFG.def.toLowerCase()+' terdekat dari '+w+'\u2026 Data gratis, bisa sampai 1 menit.</p>';ub._items=[];setPoi([]);
  const show=(items,note,final)=>{if(seq!==S.useq||S.utab!==tab)return;items=items.slice(0,7);
    if(!items.length&&!final){ub.innerHTML='<p class="small">Masih mencari '+CFG.def.toLowerCase()+' terdekat\u2026 Data gratis, bisa sampai 1 menit.</p>';return;}
    ub.innerHTML=(isNight(t)&&tab==='mm'?'<div class="note">Malam: tidak semua minimarket buka. Jam buka belum tersedia di data ini, cek dulu.</div>':'')+(note?'<p class="small">'+note+'</p>':'')+(items.length?'<ul class="ul">'+items.map((it,i)=>'<li><button type="button" class="ui" data-i="'+i+'"><b>'+esc(it.name)+'</b><span class="small">'+esc(it.sub||'')+'</span><span class="small mono">'+km1(it.d)+' · jalan kaki '+Math.max(1,Math.round(it.d*1.25/75))+' mnt</span></button></li>').join('')+'</ul>':'<p>Belum ada yang tercatat di sekitar sini. Data OpenStreetMap bisa belum lengkap.</p>');
    ub._items=items;setPoi(items);};
  const oq='[out:json][timeout:40];('+CFG.ov+'(around:2500,'+p.lat+','+p.lon+'););out center 80;';
  const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),45000);
  const P=await loadPOI();if(seq!==S.useq||S.utab!==tab)return;
  if(P&&P[tab]){const arr=P[tab],res=[];for(let i=0;i<arr.length;i++){const r=arr[i],d=hav(p,{lat:r[0],lon:r[1]});if(d<8000)res.push({lat:r[0],lon:r[1],name:r[2],sub:hoursLabel(r[3]),d});}
    res.sort((a,b)=>a.d-b.d);
    if(res.length){show(res,'Data OpenStreetMap, diperbarui pada '+tglId(P.date)+'.',true);return;}}
  const ovP=fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:'data='+encodeURIComponent(oq),headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:ctl.signal}).then(r=>r.json()).then(j=>{clearTimeout(to);
    return (j.elements||[]).map(e=>({lat:e.lat||(e.center&&e.center.lat),lon:e.lon||(e.center&&e.center.lon),name:(e.tags&&(e.tags.name||e.tags.brand||e.tags.operator))||CFG.def,sub:(e.tags&&e.tags['addr:street'])||'',_t:e.tags||{}})).filter(x=>x.lat&&!(tab==='spbu'&&isShell(x._t))&&!(tab==='mm'&&x._t.amenity==='fuel'&&!isShell(x._t)));}).catch(()=>[]);
  let items=[];
  try{items=merge(await ph(0.02));if(items.length<3)items=merge(items.concat(await ph(0.06)));}catch(e){}
  show(items,'Memuat data yang lebih lengkap\u2026',false);
  const ov=await ovP;
  show(merge(items.concat(ov)),'',true);}
let lpT=null,lpBtn=null,lpDone=false,lpXY=null;
function lpCancel(){clearTimeout(lpT);if(lpBtn){lpBtn.classList.remove('lping');lpBtn=null;}}
function applyUrgentTo(t){try{navigator.vibrate&&navigator.vibrate(40);}catch(e){}
  if(!S.from&&S.gps)setPoint('from',{lat:S.gps.lat,lon:S.gps.lon,label:'Lokasi saya'},false);
  setPoint('to',{lat:t.lat,lon:t.lon,label:t.name},true);
  if(window.__urgentPeek)window.__urgentPeek();
  if(window.__toast)window.__toast('Tujuan: '+t.name,4000);}
$('#ub').addEventListener('pointerdown',e=>{const b=e.target.closest('.ui');if(!b||e.button>0)return;lpCancel();lpDone=false;lpXY=[e.clientX,e.clientY];lpBtn=b;
  if(!b.querySelector('.lp')){const s=document.createElement('span');s.className='lp';b.appendChild(s);}
  void b.offsetWidth;b.classList.add('lping');
  lpT=setTimeout(()=>{const it=$('#ub')._items&&$('#ub')._items[+b.dataset.i];lpCancel();if(!it)return;lpDone=true;applyUrgentTo(it);},3000);});
['pointerup','pointercancel','pointerleave'].forEach(ev=>$('#ub').addEventListener(ev,lpCancel));
$('#ub').addEventListener('pointermove',e=>{if(lpBtn&&lpXY&&Math.hypot(e.clientX-lpXY[0],e.clientY-lpXY[1])>12)lpCancel();});
$('#ub').addEventListener('contextmenu',e=>{if(e.target.closest('.ui'))e.preventDefault();});
$('#ub').addEventListener('click',async e=>{if(lpDone){lpDone=false;return;}if(e.target.id==='uRetry')return renderUrgent();const b=e.target.closest('.ui');if(!b)return;
  document.querySelectorAll('.ui').forEach(x=>x.classList.toggle('on',x===b));const {p}=posForUrgent();const target=$('#ub')._items[+b.dataset.i];
  const v=await valhalla(p,target,'pedestrian');S.focus={coords:v.coords};draw();const bb=new maplibregl.LngLatBounds();v.coords.forEach(c=>bb.extend(c));
  map.fitBounds(bb,{padding:window.innerWidth<=760?{top:(window.__topH2||80)+16,bottom:Math.round($('#urgent').getBoundingClientRect().height)+20,left:40,right:40}:{top:80,bottom:80,left:60,right:Math.min(380,window.innerWidth*.9)},maxZoom:17});});
function setUrgent(v){if(v&&window.__closeGrp)window.__closeGrp();S.urgentOn=v;$('#urgent').classList.toggle('open',v);$('#urgent').setAttribute('aria-hidden',!v);$('#urgentBtn').setAttribute('aria-expanded',v);$('#urgentBtn').hidden=v;
  if(v){$('#urgent').classList.remove('pk');$('#urgent').style.removeProperty('--uhh');renderUrgent();locate(()=>S.urgentOn&&renderUrgent());}else{S.focus=null;draw();setPoi([]);}}
window.__closeUrgent=()=>setUrgent(false);$('#urgentBtn').onclick=()=>setUrgent(true);$('#uClose').onclick=()=>setUrgent(false);
document.querySelectorAll('.utabs button').forEach(b=>b.onclick=()=>{S.utab=b.dataset.u;document.querySelectorAll('.utabs button').forEach(x=>x.setAttribute('aria-selected',x===b));renderUrgent();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#sheet').hidden)$('#sheet').hidden=true;else if(S.urgentOn)setUrgent(false);else if(S.pick)endPick();}});
