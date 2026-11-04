'use strict';
/* ---------- Valhalla ---------- */
function decode6(str){let i=0,lat=0,lon=0,out=[];while(i<str.length){let b,s=0,r=0;do{b=str.charCodeAt(i++)-63;r|=(b&31)<<s;s+=5}while(b>=32);lat+=(r&1)?~(r>>1):(r>>1);s=0;r=0;do{b=str.charCodeAt(i++)-63;r|=(b&31)<<s;s+=5}while(b>=32);lon+=(r&1)?~(r>>1):(r>>1);out.push([lon/1e6,lat/1e6]);}return out;}
const vcache=new Map();const vwait=[];let vact=0;
function vrun(fn){return new Promise(res=>{const go=()=>{vact++;fn().then(res,res).finally(()=>{vact--;setTimeout(()=>{if(vact<3&&vwait.length)vwait.shift()();},120);});};if(vact<3)go();else vwait.push(go);});}
function valhalla(a,b,costing){const key=[a.lat.toFixed(5),a.lon.toFixed(5),b.lat.toFixed(5),b.lon.toFixed(5),costing].join();if(vcache.has(key))return vcache.get(key);
  const job=vrun(()=>vcall(a,b,costing));vcache.set(key,job);return job;}
async function vcall(a,b,costing,retry){const body={locations:[{lat:a.lat,lon:a.lon},{lat:b.lat,lon:b.lon}],costing,directions_options:{language:'id-ID',units:'kilometers'}};
  try{const r=await fetch('https://valhalla1.openstreetmap.de/route?json='+encodeURIComponent(JSON.stringify(body)));
    if(r.status===429&&!retry){await new Promise(x=>setTimeout(x,1200));return vcall(a,b,costing,true);}
    if(!r.ok)throw new Error(r.status);const j=await r.json(),lg=j.trip.legs[0];
    const named={};(lg.maneuvers||[]).forEach(m=>{(m.street_names||[]).slice(0,1).forEach(n=>named[n]=(named[n]||0)+(m.length||0));});
    const via=Object.entries(named).sort((x,y)=>y[1]-x[1]).slice(0,3).map(x=>x[0]);
    return {min:j.trip.summary.time/60,m:j.trip.summary.length*1000,coords:decode6(lg.shape),via,est:false};}
  catch(e){const d=hav(a,b)*1.35,sp=costing==='pedestrian'?75:400;return {min:d/sp,m:d,coords:[[a.lon,a.lat],[b.lon,b.lat]],via:[],est:true};}}

const MOTOR_CAL=0.90;
function parseTrip(trip){const lg=trip.legs[0];const named={};(lg.maneuvers||[]).forEach(m=>{(m.street_names||[]).slice(0,1).forEach(n=>named[n]=(named[n]||0)+(m.length||0));});
  const via=Object.entries(named).sort((x,y)=>y[1]-x[1]).slice(0,3).map(x=>x[0]);return {min:trip.summary.time/60,m:trip.summary.length*1000,coords:decode6(lg.shape),via,est:false};}
function valMulti(a,b,costing){const key='M'+[a.lat.toFixed(5),a.lon.toFixed(5),b.lat.toFixed(5),b.lon.toFixed(5),costing].join();if(vcache.has(key))return vcache.get(key);
  const job=vrun(async()=>{const body={locations:[{lat:a.lat,lon:a.lon},{lat:b.lat,lon:b.lon}],costing,alternates:2,directions_options:{language:'id-ID',units:'kilometers'}};
    for(let k=0;k<2;k++){try{const r=await fetch('https://valhalla1.openstreetmap.de/route?json='+encodeURIComponent(JSON.stringify(body)));
      if(r.status===429&&k===0){await new Promise(x=>setTimeout(x,1200));continue;}
      if(!r.ok)throw new Error(r.status);const j=await r.json();const out=[parseTrip(j.trip)];(j.alternates||[]).forEach(al=>{try{out.push(parseTrip(al.trip));}catch(e){}});return out;}catch(e){break;}}
    const d=hav(a,b)*1.35;return [{min:d/(costing==='auto'?500:400),m:d,coords:[[a.lon,a.lat],[b.lon,b.lat]],via:[],est:true}];});
  vcache.set(key,job);return job;}
/* tambahan waktu jam sibuk (perkiraan, bukan data lalu lintas langsung); mobil dikali 2 */
function trafficExtra(t,car){let r=[0,0,''];
  if(t>=360&&t<540)r=[15,25,'jam berangkat kerja'];else if(t>=540&&t<600)r=[5,10,'jam sibuk pagi'];else if(t>=690&&t<780)r=[5,10,'jam makan siang'];else if(t>=960&&t<1020)r=[5,10,'jam pulang kerja'];else if(t>=1020&&t<1140)r=[15,25,'jam pulang kerja'];else if(t>=1140&&t<1200)r=[5,10,'jam sibuk malam'];
  return car?[r[0]*2,r[1]*2,r[2]]:r;}
