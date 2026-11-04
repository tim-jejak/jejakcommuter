'use strict';
/* ---------- gambar ke peta ---------- */
const caseFor=c=>{const n=parseInt(c.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255;return (.2126*r+.7152*g+.0722*b)/255<.4?'#FFFFFF':'#14202B';};
function syncClear(){const c=$('#sClear');if(c)c.disabled=!(S.from||S.to||S.opts.length);}
function draw(){syncClear();if(animRaf&&animSel!==S.sel)stopAnim();if(!mapReady)return;const o=S.opts[S.sel],f=[];if(!NAV.on)updStops(o,-1,-1);
  if(o)o.features.forEach(x=>f.push({type:'Feature',properties:{kind:x.kind,color:(S.myColor&&x.kind!=='walk')?S.myColor:x.color,cs:(S.myColor&&x.kind!=='walk')?caseFor(S.myColor):'#14202B'},geometry:{type:'LineString',coordinates:x.coords}}));
  if(S.focus&&S.focus.coords)f.push({type:'Feature',properties:{kind:'walk',color:'#4C5A68'},geometry:{type:'LineString',coordinates:S.focus.coords}});
  map.getSource('route').setData({type:'FeatureCollection',features:f});
  map.getSource('rtst').setData({type:'FeatureCollection',features:(o&&o.pins||[]).map(p=>({type:'Feature',properties:{name:p.name},geometry:{type:'Point',coordinates:[p.lon,p.lat]}}))});
  applyDim(!!(o&&S.focusOn));const ra=$('#rActs');if(ra)ra.hidden=!S.opts.length;}
function applyDim(on){if(!mapReady)return;S.dim=on;
  [['tl-case',.9],['tl',1],['tj-case',.9],['tj',1],['mk-case',.9],['mk',1]].forEach(([id,v])=>{if(map.getLayer(id))map.setPaintProperty(id,'line-opacity',on?.1:v);});
  ['st-rail','st-tj'].forEach(id=>{map.setPaintProperty(id,'circle-opacity',on?.2:1);map.setPaintProperty(id,'circle-stroke-opacity',on?.2:1);});
  ['st-rail-l','st-tj-l'].forEach(id=>map.setPaintProperty(id,'text-opacity',on?.15:1));
  if(on&&S.vehShown){map.getSource('veh').setData(emptyFC);S.vehShown=false;}}
function fitFeatures(fs){const b=new maplibregl.LngLatBounds();fs.forEach(f=>f.coords.forEach(c=>b.extend(c)));if(b.isEmpty())return;const narrow=window.innerWidth<=760;
  map.fitBounds(b,{padding:narrow?{top:(window.__topH2||window.__topH||70)+16,bottom:Math.round(window.innerHeight*.46)+20,left:30,right:30}:{top:70,bottom:70,left:470,right:70},maxZoom:16,duration:700});}
