'use strict';
/* ---------- titik, pin, lokasi ---------- */
const mk={};
function setPin(w){const p=S[w];if(mk[w]){mk[w].remove();mk[w]=null;}if(!p)return;mk[w]=new maplibregl.Marker({color:w==='from'?'#1D7A4A':'#B3261E'}).setLngLat([p.lon,p.lat]).addTo(map);}
function setPoint(w,p,run){S[w]=p;syncClear();$(w==='from'?'#inFrom':'#inTo').value=p.label||'';setPin(w);
  if(run&&S.from&&S.to)plan();else if(!S.to&&w==='from')map.easeTo({center:[p.lon,p.lat],zoom:Math.max(map.getZoom(),13)});}
function fmtFeat(f){const p=f.properties||{};const street=[p.street,p.housenumber].filter(Boolean).join(' ');const name=p.name||street||p.district||p.city||'Tempat';const sub=[name!==street?street:'',p.district,p.city||p.county].filter(Boolean).join(', ');return {name,sub};}
async function reverseLabel(w){const p=S[w];if(!p)return;try{const r=await fetch('https://photon.komoot.io/reverse?lat='+p.lat+'&lon='+p.lon);const j=await r.json();const f=j.features&&j.features[0];if(f&&S[w]===p){const x=fmtFeat(f);p.label=x.name+(x.sub?', '+x.sub:'');$(w==='from'?'#inFrom':'#inTo').value=p.label;}}catch(e){}}
function startPick(w){if(window.__onPick)window.__onPick();S.pick=w;map.getCanvas().style.cursor='crosshair';$('#pickFrom').classList.toggle('on',w==='from');$('#pickTo').classList.toggle('on',w==='to');const h=$('#pickHint');h.hidden=false;h.textContent='Ketuk peta untuk menentukan titik '+(w==='from'?'asal':'tujuan')+'.';}
function endPick(){S.pick=null;map.getCanvas().style.cursor='';$('#pickFrom').classList.remove('on');$('#pickTo').classList.remove('on');$('#pickHint').hidden=true;}
$('#pickFrom').onclick=()=>S.pick==='from'?endPick():startPick('from');$('#pickTo').onclick=()=>S.pick==='to'?endPick():startPick('to');
let meMk=null;
function circleFC(lat,lon,r){const pts=[];for(let k=0;k<=48;k++){const a=k/48*2*Math.PI;pts.push([lon+(r*Math.cos(a))/(111320*Math.cos(lat*RAD)),lat+(r*Math.sin(a))/110540]);}
  return {type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[pts]}}]};}
let watchId=null,watchCbs=[],lastApplied=0,applyTimer=0,movedWarned=0;
function nativeBG(){try{const C=window.Capacitor;if(C&&C.isNativePlatform&&C.isNativePlatform())return C.registerPlugin('BackgroundGeolocation');}catch(e){}return null;}
let bgId=null;
function startWatch(cb){const BG=nativeBG();
  if(BG){window.__nativeBG=true;if(cb){if(S.fix)cb(S.gps);else watchCbs.push(cb);}
    if(watchId!==null)return;watchId='bg';
    BG.addWatcher({backgroundTitle:'jejakcommuter aktif',backgroundMessage:'Lokasi dipakai untuk navigasi dan grup',requestPermissions:true,stale:false,distanceFilter:0},(loc,err)=>{
      if(err){if(err.code==='NOT_AUTHORIZED'){watchId=null;watchCbs=[];$('#out').innerHTML='<p class="note">Izin lokasi ditolak. Buka Pengaturan HP, Aplikasi, jejakcommuter, Izin, Lokasi, lalu pilih Izinkan sepanjang waktu.</p>';try{BG.openSettings();}catch(e){}}return;}
      if(!loc)return;S.fix={lat:loc.latitude,lon:loc.longitude,acc:loc.accuracy||20,ts:Date.now()};
      if(!S.gps){applyFix(true);const cbs=watchCbs;watchCbs=[];cbs.forEach(f=>f(S.gps));}else{try{applyFix();}catch(e){}}
      try{if(window.__grpFix)window.__grpFix();}catch(e){}
    }).then(id=>{bgId=id;});
    scheduleApply();return;}
  if(!navigator.geolocation){$('#out').innerHTML='<p class="note">Perangkat ini tidak menyediakan lokasi.</p>';return;}
  if(cb){if(S.fix)cb(S.gps);else watchCbs.push(cb);}
  if(watchId!==null)return;
  watchId=navigator.geolocation.watchPosition(pos=>{S.fix={lat:pos.coords.latitude,lon:pos.coords.longitude,acc:pos.coords.accuracy,ts:Date.now()};
      if(!S.gps){applyFix(true);const cbs=watchCbs;watchCbs=[];cbs.forEach(f=>f(S.gps));}},
    err=>{if(err.code===1){stopWatch();watchCbs=[];if(window.__silentLoc)return;$('#out').innerHTML='<p class="note">Lokasi tidak diizinkan. Izinkan lokasi di browser, atau ketik atau pilih titik di peta.</p>';}},
    {enableHighAccuracy:true,maximumAge:0,timeout:20000});
  scheduleApply();}
function stopWatch(){if(watchId==='bg'){try{const BG=nativeBG();if(BG&&bgId!==null)BG.removeWatcher({id:bgId});}catch(e){}bgId=null;watchId=null;}else if(watchId!==null){navigator.geolocation.clearWatch(watchId);watchId=null;}clearTimeout(applyTimer);}
/* pembaruan di latar belakang: tiap 1 detik bila rute sedang tampil, tiap 5 detik bila tidak. Halaman tidak dimuat ulang. */
function scheduleApply(){clearTimeout(applyTimer);applyTimer=setTimeout(()=>{applyFix(false);scheduleApply();},S.opts.length?1000:5000);}
function applyFix(first){const f=S.fix;if(f&&!wxPos&&window.loadWx)setTimeout(()=>window.loadWx(),0);if(!f||(f.ts===lastApplied&&!first))return;lastApplied=f.ts;
  S.gps={lat:f.lat,lon:f.lon,acc:f.acc};
  if(window.navTick)window.navTick();
  if(!meMk){const el=document.createElement('div');el.className='dot-me';meMk=new maplibregl.Marker({element:el});}
  meMk.setLngLat([f.lon,f.lat]).addTo(map);
  if(mapReady)map.getSource('acc').setData(circleFC(f.lat,f.lon,Math.max(f.acc,5)));
  const chip=$('#accChip');chip.hidden=false;chip.innerHTML='<span class="small">Akurasi lokasi</span> <b>±'+Math.round(f.acc)+' m</b>';
  const nt=$('#accNote');if(f.acc>100){nt.hidden=false;nt.textContent='Lokasi kurang akurat (±'+Math.round(f.acc)+' m). Di laptop ini biasa terjadi karena tidak ada GPS. Geser titik awal lewat tombol Peta, atau pakai HP di tempat terbuka.';}else nt.hidden=true;
  if(S.from&&S.from.gps){const moved=hav(S.from,f);S.from.lat=f.lat;S.from.lon=f.lon;S.from.acc=f.acc;setPin('from');
    if(S.opts.length&&moved>150&&Date.now()-movedWarned>20000){movedWarned=Date.now();const h=$('#pickHint');h.hidden=false;h.innerHTML='Posisi kamu bergeser. <button type="button" class="btn" id="replanNow">Cari ulang dari sini</button>';}}}
document.addEventListener('click',e=>{if(e.target.id==='replanNow'){$('#pickHint').hidden=true;if(S.from&&S.to)plan();}});
/* pulihkan peta setelah tab lama di latar belakang (WebGL dibuang browser) */
let lostGL=false;map.getCanvas().addEventListener('webglcontextlost',()=>{lostGL=true;});map.getCanvas().addEventListener('webglcontextrestored',()=>{lostGL=false;try{map.resize();map.triggerRepaint();}catch(e){}});
let hiddenAt=0;
function healMap(){try{map.resize();map.triggerRepaint();}catch(e){}
  setTimeout(()=>{let bad=lostGL;try{const gl=map.painter&&map.painter.context&&map.painter.context.gl;if(gl&&gl.isContextLost())bad=true;}catch(e){}
    if(!bad&&Date.now()-hiddenAt>120000&&!map.loaded()&&!map.isStyleLoaded())bad=true;
    if(bad){let last=0;try{last=+sessionStorage.getItem('jcHeal')||0;}catch(e){}
      if(Date.now()-last>15000){try{sessionStorage.setItem('jcHeal',Date.now());}catch(e){}location.reload();}}},1800);}
document.addEventListener('visibilitychange',()=>{if(document.hidden)hiddenAt=Date.now();else if(hiddenAt)healMap();});
document.addEventListener('visibilitychange',()=>{if(window.__nativeBG)return;if(document.hidden){if(watchId!==null){navigator.geolocation.clearWatch(watchId);watchId=null;clearTimeout(applyTimer);S.resume=true;}}else if(S.resume){S.resume=false;startWatch();}});
function locate(cb){startWatch(cb);}
$('#gpsFrom').onclick=()=>locate(g=>{setPoint('from',{lat:g.lat,lon:g.lon,label:'Lokasi saya',gps:true},true);map.easeTo({center:[g.lon,g.lat],zoom:14});});
$('#swap').onclick=()=>{const a=S.from,b=S.to;S.from=b;S.to=a;$('#inFrom').value=b?b.label:'';$('#inTo').value=a?a.label:'';setPin('from');setPin('to');if(S.from&&S.to)plan();};
