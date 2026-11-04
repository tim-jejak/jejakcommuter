'use strict';
/* ---------- peta ---------- */
const map=new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/liberty',center:[106.86,-6.22],zoom:10.4,attributionControl:{compact:true},pixelRatio:Math.min(window.devicePixelRatio||1,1.5),fadeDuration:0});
map.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-right');
const emptyFC={type:'FeatureCollection',features:[]};
let mapReady=false;
const lineFC={type:'FeatureCollection',features:LINES.map(L=>({type:'Feature',properties:{cls:L.cls,col:L.col,ref:L.label},geometry:{type:'LineString',coordinates:L.pts}}))};
const stRail={type:'FeatureCollection',features:ST.filter(s=>s.g!=='tj').map(s=>({type:'Feature',properties:{id:s.id,name:s.name,col:[...s.lines].map(i=>LINES[i].col)[0],big:s.lines.size>1?1:0},geometry:{type:'Point',coordinates:[s.lon,s.lat]}}))};
const stTj={type:'FeatureCollection',features:ST.filter(s=>s.g==='tj').map(s=>({type:'Feature',properties:{id:s.id,name:s.name,brt:[...s.lines].some(i=>LINES[i].cls==='brt')?1:0},geometry:{type:'Point',coordinates:[s.lon,s.lat]}}))};
const S={d3:false,light:true,useq:0,t:0,base:0,t0:performance.now(),speed:30,from:null,to:null,opts:[],sel:-1,filter:'all',pick:null,gps:null,saved:store.get('jc_saved_v3',[]),utab:'halte',wx:null,urgentOn:false,focus:null,vis:{krl:true,mrt:true,brt:true,tj:false,mikro:false,veh:false},sortBy:'rec',focusOn:true,dim:false,vehShown:false};
function realMin(){const d=new Date();return d.getHours()*60+d.getMinutes()+d.getSeconds()/60}
S.t=S.vt=realMin();let lastTs=0;
const GRP={krl:['krl'],mrt:['mrt','lrt','whoosh'],brt:['brt'],tj:['tj'],mikro:['mikro']};
function applyVis(){ if(!mapReady) return; const on=k=>S.vis[k]; const clsOn=[];Object.keys(GRP).forEach(k=>{if(on(k))clsOn.push(...GRP[k]);});
  const vis=(ids,cls)=>ids.forEach(id=>map.setLayoutProperty(id,'visibility',cls.some(c=>clsOn.includes(c))?'visible':'none'));
  const fr=['in',['get','cls'],['literal',clsOn.filter(c=>c!=='tj'&&c!=='mikro')]];['tl-case','tl'].forEach(id=>map.setFilter(id,fr));
  vis(['tj-case','tj'],['tj']);vis(['mk-case','mk'],['mikro']); }
function lightMap(on){ try{ (map.getStyle().layers||[]).forEach(l=>{ if(l.source==='lines'||/^(tl|tj|mk|rt|st-|veh|poi|anim)/.test(l.id))return;
    if(l.type==='fill-extrusion')return;
    const heavy=/building|poi|housenumber|aeroway|oneway|one_way|shield/i.test(l.id);
    if(heavy)map.setLayoutProperty(l.id,'visibility',on?'none':'visible'); }); }catch(e){} }
function set3D(on){ try{ (map.getStyle().layers||[]).forEach(l=>{ if(l.type==='fill-extrusion')map.setLayoutProperty(l.id,'visibility',on?'visible':'none'); }); }catch(e){} map.easeTo({pitch:on?55:0,duration:600}); }
map.on('load',()=>{
  lightMap(S.light);set3D(false);
  map.addSource('lines',{type:'geojson',data:lineFC,maxzoom:13,buffer:32,tolerance:0.8});
  map.addSource('st-rail',{type:'geojson',data:stRail});
  map.addSource('st-tj',{type:'geojson',data:stTj});
  map.addSource('veh',{type:'geojson',data:emptyFC,buffer:0,maxzoom:12,tolerance:0});
  map.addSource('route',{type:'geojson',data:emptyFC});
  map.addSource('poi',{type:'geojson',data:emptyFC});
  map.addSource('anim',{type:'geojson',data:emptyFC});
  map.addSource('navstops',{type:'geojson',data:emptyFC});map.addSource('jsel',{type:'geojson',data:emptyFC});map.addSource('navtrail',{type:'geojson',data:emptyFC});
  map.addSource('acc',{type:'geojson',data:emptyFC});
  map.addLayer({id:'acc-fill',type:'fill',source:'acc',paint:{'fill-color':'#1F5FB5','fill-opacity':.12}});
  map.addLayer({id:'acc-line',type:'line',source:'acc',paint:{'line-color':'#1F5FB5','line-width':1.5,'line-opacity':.6}});
  const zi=(z1,a,z2,b)=>['interpolate',['linear'],['zoom'],z1,a,z2,b];
  const mkL=(id,filter,w,wc,minz)=>{
    map.addLayer({id:id+'-case',type:'line',source:'lines',minzoom:minz,filter,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#fff','line-width':wc,'line-opacity':.9}});
    map.addLayer({id,type:'line',source:'lines',minzoom:minz,filter,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':['get','col'],'line-width':w}});};
  mkL('tj',['==',['get','cls'],'tj'],zi(11.5,1.2,15,3.5),zi(11.5,2.6,15,5.5),11.5);
  mkL('mk',['==',['get','cls'],'mikro'],zi(13,1.2,16,3.2),zi(13,2.6,16,5.2),13);
  mkL('tl',['in',['get','cls'],['literal',['krl','mrt','lrt','whoosh','brt']]],zi(9,['match',['get','cls'],'brt',2,2.5],15,['match',['get','cls'],'brt',6,6.5]),zi(9,['match',['get','cls'],'brt',4,4.5],15,['match',['get','cls'],'brt',9,10]),0);
  map.addLayer({id:'rt-case',type:'line',source:'route',filter:['!=',['get','kind'],'walk'],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':['coalesce',['get','cs'],'#14202B'],'line-width':['interpolate',['linear'],['zoom'],9,9,15,15],'line-opacity':.92}});
  map.addLayer({id:'rt',type:'line',source:'route',filter:['!=',['get','kind'],'walk'],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':['get','color'],'line-width':['interpolate',['linear'],['zoom'],9,5,15,9]}});
  map.addLayer({id:'rt-walk-case',type:'line',source:'route',filter:['==',['get','kind'],'walk'],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#fff','line-width':7}});
  map.addLayer({id:'rt-walk',type:'line',source:'route',filter:['==',['get','kind'],'walk'],layout:{'line-join':'round'},paint:{'line-color':'#14202B','line-width':3.5,'line-dasharray':[1,1.6]}});
  map.addSource('rtst',{type:'geojson',data:emptyFC});
  map.addLayer({id:'rt-st',type:'circle',source:'rtst',paint:{'circle-radius':7,'circle-color':'#fff','circle-stroke-color':'#14202B','circle-stroke-width':3}});
  map.addLayer({id:'rt-st-l',type:'symbol',source:'rtst',layout:{'text-field':['get','name'],'text-font':['Noto Sans Regular'],'text-size':12.5,'text-offset':[0,1.2],'text-anchor':'top','text-allow-overlap':true},paint:{'text-color':'#14202B','text-halo-color':'#fff','text-halo-width':2}});
  map.addLayer({id:'st-tj',type:'circle',source:'st-tj',minzoom:13.5,paint:{'circle-radius':['interpolate',['linear'],['zoom'],12.5,2,16,5],'circle-color':'#fff','circle-stroke-width':1.6,'circle-stroke-color':['case',['==',['get','brt'],1],'#F39C12','#B9770E']}});
  map.addLayer({id:'st-tj-l',type:'symbol',source:'st-tj',minzoom:14.5,layout:{'text-field':['get','name'],'text-font':['Noto Sans Regular'],'text-size':11,'text-offset':[0,1],'text-anchor':'top','text-optional':true},paint:{'text-color':'#7A4A00','text-halo-color':'#fff','text-halo-width':1.5}});
  map.addLayer({id:'st-rail',type:'circle',source:'st-rail',paint:{'circle-radius':['interpolate',['linear'],['zoom'],9,['case',['==',['get','big'],1],4,2.6],14,['case',['==',['get','big'],1],8,6]],'circle-color':'#fff','circle-stroke-width':['interpolate',['linear'],['zoom'],9,1.8,14,3],'circle-stroke-color':['case',['==',['get','big'],1],'#14202B',['get','col']]}});
  map.addLayer({id:'st-rail-l',type:'symbol',source:'st-rail',minzoom:11,layout:{'text-field':['get','name'],'text-font':['Noto Sans Regular'],'text-size':['interpolate',['linear'],['zoom'],11,11,15,13],'text-offset':[0,1.1],'text-anchor':'top','text-optional':true},paint:{'text-color':'#14202B','text-halo-color':'#fff','text-halo-width':1.8}});
  map.addLayer({id:'veh',type:'circle',source:'veh',paint:{'circle-radius':['interpolate',['linear'],['zoom'],9,['case',['==',['get','k'],1],3.5,2],14,['case',['==',['get','k'],1],7,3.5]],'circle-color':['get','col'],'circle-stroke-color':['case',['==',['get','k'],1],'#fff','#14202B'],'circle-stroke-width':['case',['==',['get','k'],1],1.8,1.2]}});
  map.addSource('jdim',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[-180,-85],[180,-85],[180,85],[-180,85],[-180,-85]]]}}});
  map.addLayer({id:'jdim',type:'fill',source:'jdim',paint:{'fill-color':'#0B1018','fill-opacity':0}});
  map.addLayer({id:'jsel-case',type:'line',source:'jsel',filter:['==',['geometry-type'],'LineString'],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#fff','line-width':['interpolate',['linear'],['zoom'],9,9,15,14],'line-opacity':.95}});
  map.addLayer({id:'jsel-l',type:'line',source:'jsel',filter:['==',['geometry-type'],'LineString'],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':['get','col'],'line-width':['interpolate',['linear'],['zoom'],9,5,15,9],'line-opacity':1}});
  map.addLayer({id:'jsel-p',type:'circle',source:'jsel',filter:['==',['geometry-type'],'Point'],paint:{'circle-radius':['interpolate',['linear'],['zoom'],10,3.5,15,6],'circle-color':'#fff','circle-stroke-color':'#14202B','circle-stroke-width':2.2}});
  map.addLayer({id:'jsel-sel',type:'circle',source:'jsel',filter:['all',['==',['geometry-type'],'Point'],['==',['get','sel'],1]],paint:{'circle-radius':11,'circle-color':'#FFD54A','circle-stroke-color':'#14202B','circle-stroke-width':3}});
  map.addLayer({id:'jsel-t',type:'symbol',source:'jsel',minzoom:11,filter:['==',['geometry-type'],'Point'],layout:{'text-field':['get','name'],'text-font':['Noto Sans Regular'],'text-size':12.5,'text-offset':[0,1.2],'text-anchor':'top','text-optional':true},paint:{'text-color':'#14202B','text-halo-color':'#fff','text-halo-width':2}});
  map.addLayer({id:'navtrail',type:'line',source:'navtrail',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#8A97A3','line-width':['interpolate',['linear'],['zoom'],9,5,15,8],'line-opacity':.95}});
  map.addLayer({id:'navstops',type:'circle',source:'navstops',paint:{'circle-radius':['match',['get','st'],'n',7,5],'circle-color':['match',['get','st'],'p','#8A97A3','n','#E8A200','#ffffff'],'circle-stroke-color':'#14202B','circle-stroke-width':2}});
  map.addLayer({id:'navstops-l',type:'symbol',source:'navstops',minzoom:12.5,layout:{'text-field':['get','name'],'text-font':['Noto Sans Regular'],'text-size':11,'text-offset':[0,1],'text-anchor':'top','text-optional':true},paint:{'text-color':'#14202B','text-halo-color':'#fff','text-halo-width':1.6}});
  map.addLayer({id:'poi',type:'circle',source:'poi',paint:{'circle-radius':8,'circle-color':'#B3261E','circle-stroke-color':'#fff','circle-stroke-width':2.5}});
  map.addLayer({id:'poi-l',type:'symbol',source:'poi',layout:{'text-field':['get','name'],'text-font':['Noto Sans Regular'],'text-size':12,'text-offset':[0,1.2],'text-anchor':'top','text-optional':true},paint:{'text-color':'#7a1510','text-halo-color':'#fff','text-halo-width':1.6}});
  map.addLayer({id:'anim',type:'circle',source:'anim',paint:{'circle-radius':9,'circle-color':'#fff','circle-stroke-color':'#14202B','circle-stroke-width':4}});
  ['st-rail','st-tj'].forEach(id=>{map.on('click',id,e=>{if(S.pick)return;stationPopup(e.features[0].properties.id);});map.on('mouseenter',id,()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave',id,()=>map.getCanvas().style.cursor='');});
  mapReady=true;applyVis();draw();
});
map.on('moveend',()=>{lastDraw=0;});
map.on('click',e=>{if(!S.pick){const ly=['st-rail','st-tj','poi'].filter(i=>map.getLayer(i));if(ly.length&&map.queryRenderedFeatures(e.point,{layers:ly}).length)return;if(S.urgentOn){if(window.__urgentPeek)window.__urgentPeek();return;}if(window.__mapTap)window.__mapTap();return;}const w=S.pick;endPick();setPoint(w,{lat:e.lngLat.lat,lon:e.lngLat.lng,label:'Titik di peta'},true);reverseLabel(w);});
const lb=(L)=>'<span class="lb'+(['tj','brt'].includes(L.cls)?' dark':'')+'" style="background:'+L.col+'">'+esc(L.label)+'</span>';
function stationPopup(id){id=+id;const s=ST[id],t=Math.floor(S.t);
  const ls=[...s.lines].map(i=>LINES[i]);
  let h='<b>'+esc((s.g==='tj'?'Halte ':'Stasiun ')+s.name)+'</b><div style="margin:5px 0">'+ls.slice(0,10).map(lb).join(' ')+(ls.length>10?' +'+(ls.length-10):'')+'</div>';
  const run=ls.some(L=>runningL(L,t));h+=run?'<span class="pill ok" style="margin-left:0">Beroperasi</span> <span class="small">sampai ±'+fmt(Math.max(...ls.map(L=>L.end)))+' (perkiraan)</span>':'<span class="pill stop" style="margin-left:0">Tidak beroperasi</span>';
  h+='<div style="margin-top:7px"><button type="button" class="btn" data-set="from" data-id="'+id+'">Dari sini</button> <button type="button" class="btn" data-set="to" data-id="'+id+'">Ke sini</button></div>';
  new maplibregl.Popup({offset:10,maxWidth:'320px'}).setLngLat([s.lon,s.lat]).setHTML(h).addTo(map);}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-set]');if(!b)return;const s=ST[+b.dataset.id];setPoint(b.dataset.set,{lat:s.lat,lon:s.lon,label:(s.g==='tj'?'Halte ':'Stasiun ')+s.name},true);document.querySelectorAll('.maplibregl-popup').forEach(p=>p.remove());});
$('#focusRoute').onchange=e=>{S.focusOn=e.target.checked;draw();};
$('#map3d').onchange=e=>{S.d3=e.target.checked;set3D(S.d3);};
$('#detailMap').onchange=e=>{S.light=!e.target.checked;lightMap(S.light);};
document.querySelectorAll('#layers input[data-l]').forEach(i=>i.onchange=()=>{S.vis[i.dataset.l]=i.checked;applyVis();});
