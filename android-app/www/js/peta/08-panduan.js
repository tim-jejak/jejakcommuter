'use strict';
/* ---------- panduan perjalanan ---------- */
const NAV={on:false,follow:true,off:0};
const kxy=la=>[Math.cos(la*Math.PI/180)*111320,110540];
function d2(a,b){const k=kxy(a[1]);return Math.hypot((b[0]-a[0])*k[0],(b[1]-a[1])*k[1]);}
function projLeg(coords,lat,lon){const k=kxy(lat);let best=1e12,sd=0,acc=0;
  for(let q=1;q<coords.length;q++){const a=coords[q-1],b=coords[q],seg=d2(a,b);if(seg<1e-3)continue;
    const ax=(a[0]-lon)*k[0],ay=(a[1]-lat)*k[1],bx=(b[0]-lon)*k[0],by=(b[1]-lat)*k[1],dx=bx-ax,dy=by-ay;
    let u=-(ax*dx+ay*dy)/(dx*dx+dy*dy);u=Math.max(0,Math.min(1,u));const d=Math.hypot(ax+u*dx,ay+u*dy);if(d<best){best=d;sd=acc+u*seg;}acc+=seg;}
  return sd;}
function navLegs(o){const same=o.steps&&o.steps.length===o.features.length;let cum=0;
  return o.features.map((f,i)=>{const s=same?o.steps[i]:null,kind=f.kind;
    const label=s?s.title:(kind==='walk'?'Jalan kaki':kind==='ride'?'Naik kendaraan umum':'Motor atau ojol');
    let len=0;for(let k=1;k<f.coords.length;k++)len+=d2(f.coords[k-1],f.coords[k]);
    const L={i,kind,label,detail:s?(s.detail||''):'',coords:f.coords,len,s0:cum};cum+=len;
    if(s&&s.stops&&s.stops.length>1){L.stops=s.stops.map(p=>({lat:p.lat,lon:p.lon,name:p.name,sd:projLeg(f.coords,p.lat,p.lon)}));L.min=s.min;L.n=s.n;L.grp=s.grp;L.lbl=s.lbl;L.dirTxt=s.dirTxt;}
    return L;});}
function navProject(p){let best={d:1e12,leg:0,s:0,brg:0};let cum=0;const k=kxy(p.lat);
  NAV.legs.forEach(L=>{let acc=0;for(let q=1;q<L.coords.length;q++){const a=L.coords[q-1],b=L.coords[q];const seg=d2(a,b);if(seg<1e-3)continue;
    const ax=(a[0]-p.lon)*k[0],ay=(a[1]-p.lat)*k[1],bx=(b[0]-p.lon)*k[0],by=(b[1]-p.lat)*k[1],dx=bx-ax,dy=by-ay;
    let t=-(ax*dx+ay*dy)/(dx*dx+dy*dy);t=Math.max(0,Math.min(1,t));const d=Math.hypot(ax+t*dx,ay+t*dy);
    if(d<best.d)best={d,leg:L.i,s:cum+acc+t*seg,brg:(Math.atan2(dx,dy)*180/Math.PI+360)%360};acc+=seg;}
    cum+=L.len;});return best;}
const fmtD=m=>m>=1000?(m/1000).toFixed(1).replace('.',',')+' km':Math.round(m/10)*10+' m';
function rideMsg(r,L){const st=L.stops,ps=r.s-L.s0,pos=S.gps,now=Date.now(),noun=L.grp==='tj'?'halte':'stasiun',N=i=>noun+' '+st[i].name,last=st.length-1;
  const dist=i=>hav(pos,st[i]);let k=-1;st.forEach((s,i)=>{if(s.sd<=ps+25)k=i;});
  let nearI=0,nearD=1e9;st.forEach((s,i)=>{const d=dist(i);if(d<nearD){nearD=d;nearI=i;}});
  const nxt=Math.min(k+1,last),still=NAV.stillMs>=5000,dN=dist(nxt);
  NAV.k=k;if(NAV.rk!==L.i+':'+k){NAV.rk=L.i+':'+k;NAV.rt=now;}
  if(nearD<=50&&still)NAV.arr={leg:L.i,i:nearI};
  const arr=NAV.arr&&NAV.arr.leg===L.i?NAV.arr.i:-1;
  if(nearD<=50&&arr===nearI){return nearI===last?{t:'Anda tiba di '+N(last),d:'Silakan turun di sini'}:{t:'Anda tiba di '+N(nearI),d:nearI===0?'Tunggu '+L.lbl+(L.dirTxt?' arah '+L.dirTxt:''):'Berikutnya '+N(nearI+1)};}
  if(nearD<=50)return{t:'Anda akan tiba di '+N(nearI),d:''};
  if(arr>=0&&arr<last){const dd=dist(arr);if(dd>50&&dd<=100)return{t:'Anda meninggalkan '+N(arr)+', menuju '+N(arr+1),d:(last-arr)+' pemberhentian lagi'};}
  if(still&&nearD>200)return{t:'Anda sedang berhenti sebelum '+N(nxt),d:'Menunggu '+L.lbl+' jalan lagi'};
  const expSeg=(L.min||5)*60000/Math.max(1,L.n||1);
  if(now-(NAV.rt||now)>Math.max(240000,expSeg*2.2)&&dN>60)return{t:'Sepertinya anda kena macet, karena belum sampai di '+N(nxt),d:'Sabar ya, sisa '+fmtD(dN)};
  if(dN<=400)return{t:'Anda akan tiba di '+N(nxt),d:fmtD(dN)+' lagi'};
  return{t:'Menuju '+N(nxt),d:fmtD(dN)+' lagi · '+Math.max(1,last-k)+' pemberhentian'};}
function trailCoords(s){const out=[];let cum=0;
  for(const L of NAV.legs){for(let q=0;q<L.coords.length;q++){const c=L.coords[q];if(q===0){out.push(c);continue;}const seg=d2(L.coords[q-1],c);
    if(cum+seg>=s){const u=seg?(s-cum)/seg:0,a=L.coords[q-1];out.push([a[0]+(c[0]-a[0])*u,a[1]+(c[1]-a[1])*u]);return out;}cum+=seg;out.push(c);}}
  return out;}
function updStops(o,kLeg,k){if(!mapReady||!map.getSource('navstops'))return;const f=[];
  (o&&o.steps||[]).forEach((s,i)=>{if(!s.stops||!s.stops.length)return;s.stops.forEach((p,q)=>{
    const st=NAV.on?(i<kLeg?'p':(i===kLeg?(q<=k?'p':(q===k+1?'n':'u')):'u')):'u';
    f.push({type:'Feature',properties:{name:p.name,st},geometry:{type:'Point',coordinates:[p.lon,p.lat]}});});});
  map.getSource('navstops').setData({type:'FeatureCollection',features:f});}
function navTick(noCam){if(!NAV.on)return;
  if(!NAV.live){const o=NAV.o,m=Math.max(1,Math.round(o.total||0));$('#nvOff').hidden=true;$('#nvTitle').textContent='Pratinjau rute';$('#nvDet').textContent=(o.title||'')+' · titik asal bukan lokasimu';
    $('#nvRem').innerHTML='<b>'+m+' mnt</b> · '+fmtD(NAV.total);return;}
  if(!S.gps)return;const r=navProject(S.gps);if(!NAV.legs.length)return;const now=Date.now();
  if(!NAV.anc||hav(S.gps,NAV.anc)>10){NAV.anc={lat:S.gps.lat,lon:S.gps.lon};NAV.ancT=now;}NAV.stillMs=now-NAV.ancT;
  const rem=Math.max(0,NAV.total-r.s);let legEnd=0;for(let k=0;k<=r.leg;k++)legEnd+=NAV.legs[k].len;const legRem=Math.max(0,legEnd-r.s);
  const L=NAV.legs[r.leg],nx=NAV.legs[r.leg+1];let ti,de;
  if(L.stops){const m=rideMsg(r,L);ti=m.t;de=m.d;}else if(nx&&nx.stops&&legRem<60){const m=rideMsg({s:nx.s0+1,leg:nx.i},nx);ti=m.t;de=m.d;}else{NAV.k=-1;ti=(legRem<60&&nx)?'Berikutnya: '+nx.label:L.label;de=fmtD(legRem)+' lagi'+(L.detail&&!(legRem<60&&nx)?' · '+L.detail:'');}
  $('#nvTitle').textContent=ti;$('#nvDet').textContent=de;
  const key=r.leg+':'+NAV.k;if(NAV.sk!==key){NAV.sk=key;updStops(NAV.o,r.leg,NAV.k);}
  try{if(map.getSource('navtrail'))map.getSource('navtrail').setData({type:'Feature',properties:{},geometry:{type:'LineString',coordinates:trailCoords(r.s)}});}catch(e){}
  const mins=Math.max(1,Math.round((NAV.o.total||0)*(NAV.total?rem/NAV.total:0)));const eta=new Date(Date.now()+mins*60000);
  $('#nvRem').innerHTML='<b>'+mins+' mnt</b> · '+fmtD(rem)+' · tiba '+String(eta.getHours()).padStart(2,'0')+':'+String(eta.getMinutes()).padStart(2,'0');
  NAV.off=r.d>150?NAV.off+1:0;$('#nvOff').hidden=NAV.off<3;
  if(rem<40&&NAV.total>100){$('#nvTitle').textContent='Kamu sudah sampai';$('#nvDet').textContent='';$('#nvRem').textContent='';if(!NAV.done){NAV.done=setTimeout(()=>stopNav(true),4000);}}
  if(!noCam&&NAV.follow&&!NAV.off)map.easeTo({center:[S.gps.lon,S.gps.lat],zoom:16.5,bearing:(NAV.hd!=null?NAV.hd:r.brg),pitch:50,duration:900,padding:{top:120,bottom:170,left:0,right:0}});}
window.navTick=navTick;
function navSwitch(){const o=S.opts[S.sel];if(!o)return;NAV.o=o;NAV.legs=navLegs(o);NAV.total=NAV.legs.reduce((a,l)=>a+l.len,0);NAV.off=0;NAV.follow=true;NAV.done=null;$('#nvOff').hidden=true;$('#nvCenter').hidden=true;if(window.__setSheet)window.__setSheet('peek');navTick();}
/* kompas: peta ikut arah HP */
function compassHeading(a,b,g){if(a==null||b==null||g==null)return null;if(Math.abs(b)<35)return (360-a)%360;
  const r=Math.PI/180;a*=r;b*=r;g*=r;const cA=Math.cos(a),sA=Math.sin(a),cB=Math.cos(b),sB=Math.sin(b),cG=Math.cos(g),sG=Math.sin(g);
  const rA=-cA*sG-sA*sB*cG,rB=-sA*sG+cA*sB*cG;let h=Math.atan2(rA,rB);if(h<0)h+=2*Math.PI;return h*180/Math.PI;}
function onOri(e){if(!NAV.on)return;let h=null;
  if(typeof e.webkitCompassHeading==='number')h=e.webkitCompassHeading;
  else if(e.absolute||e.type==='deviceorientationabsolute')h=compassHeading(e.alpha,e.beta,e.gamma);
  if(h==null||isNaN(h))return;
  if(NAV.hd==null)NAV.hd=h;else{let d=((h-NAV.hd+540)%360)-180;NAV.hd=(NAV.hd+d*0.25+360)%360;}
  const now=performance.now();if(NAV.follow&&now-(NAV.hdT||0)>180){const cur=map.getBearing();const d=Math.abs(((NAV.hd-cur+540)%360)-180);
    if(d>3){NAV.hdT=now;map.easeTo({bearing:NAV.hd,duration:200,easing:x=>x});}}}
async function compassOn(){if(NAV.cmp)return;NAV.cmp=true;NAV.hd=null;
  try{if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const p=await DeviceOrientationEvent.requestPermission();if(p!=='granted'){NAV.cmp=false;return;}}}catch(e){}
  window.addEventListener('deviceorientationabsolute',onOri,true);window.addEventListener('deviceorientation',onOri,true);}
function compassOff(){NAV.cmp=false;NAV.hd=null;window.removeEventListener('deviceorientationabsolute',onOri,true);window.removeEventListener('deviceorientation',onOri,true);}
function startNav(){const o=S.opts[S.sel];if(!o){return;}stopAnim();
  const go=()=>{S.holdRoute=null;NAV.o=o;NAV.live=!!(S.from&&(S.from.gps||S.from.label==='Lokasi saya'||(S.gps&&hav(S.gps,S.from)<1000)));if(NAV.live)compassOn();NAV.legs=navLegs(o);NAV.total=NAV.legs.reduce((a,l)=>a+l.len,0);NAV.on=true;NAV.follow=true;NAV.off=0;NAV.done=null;NAV.arr=null;NAV.rk=null;NAV.anc=null;NAV.k=-1;NAV.sk='';clearInterval(NAV.iv);NAV.iv=setInterval(()=>navTick(true),1000);
    document.documentElement.classList.add('nav');$('#navbar').hidden=false;$('#nvCenter').hidden=true;if(window.__setSheet)window.__setSheet('peek');
    try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(w=>{NAV.wl=w;}).catch(()=>{});}catch(e){}
    navTick();};
  if(S.gps||(S.from&&!S.from.gps&&S.from.label!=='Lokasi saya'))go();else locate(()=>go());}
function stopNav(){S.holdRoute=null;NAV.on=false;compassOff();clearInterval(NAV.iv);try{if(map.getSource('navtrail'))map.getSource('navtrail').setData(emptyFC);}catch(e){}if(S.opts[S.sel])updStops(S.opts[S.sel],-1,-1);clearTimeout(NAV.done);try{NAV.wl&&NAV.wl.release();}catch(e){}document.documentElement.classList.remove('nav');$('#navbar').hidden=true;$('#nvCenter').hidden=true;
  map.easeTo({pitch:0,bearing:0,padding:{top:0,bottom:0,left:0,right:0},duration:600});if(window.__setSheet)window.__setSheet('half');}
map.on('dragstart',()=>{if(NAV.on&&NAV.follow){NAV.follow=false;$('#nvCenter').hidden=false;}});
$('#nvCenter').onclick=()=>{NAV.follow=true;$('#nvCenter').hidden=true;
  const go=()=>{if(!S.gps||!NAV.on)return;const r=NAV.legs&&NAV.legs.length?navProject(S.gps):null;const br=NAV.hd!=null?NAV.hd:(r?r.brg:map.getBearing());
    map.easeTo({center:[S.gps.lon,S.gps.lat],zoom:17,bearing:br,pitch:50,duration:350,padding:{top:150,bottom:170,left:0,right:0}});};
  go();locate(()=>{if(NAV.on&&NAV.follow)go();});};
$('#nvEnd').onclick=()=>stopNav();
function clearRoute(){stopAnim();stopNav();S.holdRoute=null;S.from=null;S.to=null;S.focus=null;$('#inFrom').value='';$('#inTo').value='';setPin('from');setPin('to');S.opts=[];S.sel=-1;draw();if(window.__resetUI)window.__resetUI();}
let cancelT=0;$('#nvCancel').onclick=()=>{const b=$('#nvCancel');if(b.classList.contains('ask')){clearTimeout(cancelT);b.classList.remove('ask');b.textContent='Batalkan';clearRoute();}else{b.classList.add('ask');b.textContent='Yakin hapus?';cancelT=setTimeout(()=>{b.classList.remove('ask');b.textContent='Batalkan';},3500);}};
$('#sClear').onclick=()=>clearRoute();
function clearPoint(w){const inp=$(w==='from'?'#inFrom':'#inTo');S[w]=null;inp.value='';setPin(w);stopAnim();S.opts=[];S.sel=-1;S.focus=null;draw();syncClear();if(window.__clearOut)window.__clearOut();inp.focus();}
document.addEventListener('click',e=>{const x=e.target.closest('[data-clr]');if(x){e.preventDefault();clearPoint(x.dataset.clr);}});
$('#locChip').onclick=()=>{const go=()=>{if(S.gps)map.easeTo({center:[S.gps.lon,S.gps.lat],zoom:Math.max(map.getZoom(),15.5),duration:400});};go();locate(go);};
function replanHere(auto){const g=S.gps,old=NAV.o;if(!g||!S.to){return;}stopNav();S.holdRoute=old;S.from={lat:g.lat,lon:g.lon,label:'Lokasi saya'};$('#inFrom').value='Lokasi saya';NAV.resume=!!auto;$('#go')&&$('#go').click();}
$('#nvAlt').onclick=()=>replanHere(false);
$('#nvRe').onclick=()=>replanHere(true);
$('#rStart').onclick=startNav;
