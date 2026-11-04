'use strict';
/* ---------- loop ---------- */
let lastMin=-1,lastDraw=0;
function onMinute(force){const m=Math.floor(S.t);if(!force&&m===lastMin)return;lastMin=m;$('#clock').textContent=fmt(m);banner();if(!$('#sheet').hidden)renderSheet();}
function frame(ts){const dt=lastTs?Math.min(ts-lastTs,1000):0;lastTs=ts;S.t=(S.t+dt/60000)%1440;S.vt=(S.vt+dt/60000*S.speed)%1440;onMinute();
  if(mapReady&&!map.isMoving()&&ts-lastDraw>100){lastDraw=ts;if(S.vis.veh&&!S.dim){map.getSource('veh').setData({type:'FeatureCollection',features:vehicles()});S.vehShown=true;}else if(S.vehShown){map.getSource('veh').setData(emptyFC);S.vehShown=false;}}
  requestAnimationFrame(frame);}
$('#foot').innerHTML='Peta: OpenFreeMap, data &copy; OpenStreetMap. Jalur dan halte: OpenStreetMap ('+LINES.length+' lini, '+ST.length+' stasiun dan halte). Rute motor dan jalan kaki: Valhalla. Cari tempat: Photon. Cuaca: Open-Meteo (cadangan: BMKG). Jam operasional dan jarak antar kendaraan adalah perkiraan per jenis moda, bukan jadwal resmi.';
if(window.innerWidth<=760)$('#layers').open=false;
renderSaved();window.loadWx=loadWx;loadWx();
