/* ===== mesin tema peta Jecom (dipakai juga nanti di aplikasi) ===== */
var JTEMA=(function(){
function roleOf(l){var id=l.id,sl=l['source-layer']||'';
 if(l.type==='background')return 'land';
 if(l.type==='raster')return 'relief';
 if(sl==='water')return 'water';
 if(sl==='waterway')return l.type==='symbol'?'lbl_water':'waterway';
 if(sl==='water_name')return 'lbl_water';
 if(sl==='park')return 'park';
 if(sl==='landcover'){if(/wood|grass|wetland/.test(id))return 'green';if(/sand/.test(id))return 'sand';if(/ice|glacier/.test(id))return 'ice';return 'resid';}
 if(sl==='landuse'){if(/cemetery|pitch|track|grass/.test(id))return 'green';if(/hospital/.test(id))return 'hospital';if(/school/.test(id))return 'school';return 'resid';}
 if(sl==='aeroway')return 'aeroway';
 if(sl==='building')return l.type==='fill-extrusion'?'bld3d':'building';
 if(sl==='boundary')return 'boundary';
 if(sl==='transportation'){var cas=/casing/.test(id);
  if(/rail|cablecar|ferry/.test(id))return 'rail';
  if(/one_?way/.test(id))return 'arrow';
  if(/path|pedestrian/.test(id))return cas?'path_case':'path';
  if(/area|pier|pattern/.test(id))return 'road_area';
  var c=/motorway(?![_-]link)/.test(id)?'mway':/trunk|primary/.test(id)?'major':/secondary|tertiary/.test(id)?'mid':'minor';
  return c+(cas?'_case':'');}
 if(sl==='transportation_name')return /shield/.test(id)?'shield':'lbl_road';
 if(sl==='poi')return /transit/.test(id)?'poi_transit':(/r1$/.test(id)?'poi1':'poi_minor');
 if(sl==='place'||sl==='aerodrome_label')return 'lbl_place';
 return null;}
var P={
 plain_light:{land:'#F7F7F5',resid:'#F3F3F1',green:'#D8EED2',park:'#CDEAC4',sand:'#F4EEDC',ice:'#FFFFFF',hospital:'#FBE7E7',school:'#F1ECE1',water:'#AADAFF',waterway:'#AADAFF',aeroway:'#E9EBEE',building:'#EAEAE7',bld3d:'#E4E4E1',boundary:'#C4C8CD',
  minor:'#FFFFFF',minor_case:'#E0E2E5',mid:'#FFFFFF',mid_case:'#D2D5D9',major:'#FFF1B0',major_case:'#E3CF86',mway:'#FBD271',mway_case:'#DDAF55',path:'#E2E5E8',path_case:'#F7F7F5',road_area:'#FFFFFF',rail:'#C5CAD0',arrow:'#B8BDC3',
  lbl:'#5F6368',lbl_place:'#3C4043',lbl_water:'#3F79B5',lbl_road:'#5F6368',poi1:'#5F6368',poi_transit:'#3C4043',halo:'#FFFFFF',hide:['relief','poi_minor']},
 plain_dark:{land:'#1D2227',resid:'#20262B',green:'#1F3327',park:'#203A2A',sand:'#2A2A24',ice:'#2A3036',hospital:'#33272B',school:'#2B2A26',water:'#0F2236',waterway:'#16304A',aeroway:'#2A3036',building:'#262C32',bld3d:'#2B3238',boundary:'#4A545E',
  minor:'#323940',minor_case:'#1D2227',mid:'#3B434B',mid_case:'#1D2227',major:'#4D4733',major_case:'#2A2618',mway:'#6A5A36',mway_case:'#2E2614',path:'#2E353C',path_case:'#1D2227',road_area:'#323940',rail:'#4A525A',arrow:'#56606A',
  lbl:'#A9B3BC',lbl_place:'#D3D9DE',lbl_water:'#6B95C0',lbl_road:'#9AA4AD',poi1:'#A9B3BC',poi_transit:'#C7CED4',halo:'#1D2227',hide:['relief','poi_minor']},
 liberty_dark:{land:'#1A2128',resid:'#1E262E',green:'#1E3A2A',park:'#1F3F2C',sand:'#2E2B22',ice:'#2A3138',hospital:'#3A272C',school:'#2E2C25',water:'#0D2A45',waterway:'#133556',aeroway:'#2A3239',building:'#283039',bld3d:'#2E3842',boundary:'#56616C',
  minor:'#2F3842',minor_case:'#1A2128',mid:'#3A4450',mid_case:'#1A2128',major:'#6A5328',major_case:'#2C2210',mway:'#8A5A2B',mway_case:'#2E1D0E',path:'#2C343C',path_case:'#1A2128',road_area:'#2F3842',rail:'#4C5560',arrow:'#5A6570',
  lbl:'#B7C2CC',lbl_place:'#E1E6EA',lbl_water:'#6E9CCB',lbl_road:'#A7B2BC',poi1:'#B7C2CC',poi_transit:'#D0D7DD',halo:'#141A20',hide:['relief']},
 bright_dark:{land:'#18222B',resid:'#1C2731',green:'#204430',park:'#224A33',sand:'#302D22',ice:'#2A333C',hospital:'#3C2830',school:'#302E26',water:'#0B3050',waterway:'#123B60',aeroway:'#29333C',building:'#26313B',bld3d:'#2D3944',boundary:'#5A6672',
  minor:'#2E3944',minor_case:'#18222B',mid:'#384553',mid_case:'#18222B',major:'#7A6A2E',major_case:'#2E2810',mway:'#9A4F2A',mway_case:'#33190C',path:'#2B3540',path_case:'#18222B',road_area:'#2E3944',rail:'#4E5864',arrow:'#5C6874',
  lbl:'#C3CDD6',lbl_place:'#E6EBEF',lbl_water:'#77A6D6',lbl_road:'#B0BBC5',poi1:'#C3CDD6',poi_transit:'#D6DDE3',halo:'#121A22',hide:['relief']}
};
var PROP={background:'background-color',fill:'fill-color',line:'line-color','fill-extrusion':'fill-extrusion-color'};
function isBase(m,l){if(l.type==='background')return true;if(!l.source)return false;var s=m.getSource(l.source);return !!s&&(s.type==='vector'||s.type==='raster')&&(l.source==='openmaptiles'||l.source==='ne2_shaded');}
/* gaya: 'liberty'|'plain'|'bright'; gelap: true/false */
function apply(m,gaya,gelap){
 var key=gaya==='liberty'?(gelap?'liberty_dark':null):gaya==='bright'?(gelap?'bright_dark':null):(gelap?'plain_dark':'plain_light');
 var pal=key?P[key]:null;m.__jo=m.__jo||{};
 var ls=(m.getStyle()||{}).layers||[];var n=0;
 ls.forEach(function(l){if(!isBase(m,l))return;var r=roleOf(l);
  var set=function(p,v,lay){var k=l.id+'|'+p;try{
    if(v!==undefined){if(!(k in m.__jo)){var cur=lay?m.getLayoutProperty(l.id,p):m.getPaintProperty(l.id,p);m.__jo[k]=cur===undefined?null:cur;}lay?m.setLayoutProperty(l.id,p,v):m.setPaintProperty(l.id,p,v);}
    else if(k in m.__jo){var o=m.__jo[k];lay?m.setLayoutProperty(l.id,p,o===null?undefined:o):m.setPaintProperty(l.id,p,o===null?undefined:o);delete m.__jo[k];}
   }catch(e){}};
  var hide=pal&&r&&pal.hide.indexOf(r)>-1;
  set('visibility',hide?'none':undefined,true);
  if(!pal||!r||hide){['background-color','fill-color','line-color','fill-extrusion-color','text-color','text-halo-color','fill-outline-color'].forEach(function(p){set(p,undefined);});return;}
  if(l.type==='symbol'){set('text-color',pal[r]||pal.lbl);set('text-halo-color',pal.halo);n++;return;}
  var c=pal[r];if(!c)return;var p=PROP[l.type];if(p){set(p,c);n++;}
  if(l.type==='fill')set('fill-outline-color',c);});
 return n;}
var URL_={liberty:'https://tiles.openfreemap.org/styles/liberty',plain:'https://tiles.openfreemap.org/styles/liberty',bright:'https://tiles.openfreemap.org/styles/bright'};
return {apply:apply,roleOf:roleOf,url:function(g){return URL_[g]||URL_.plain;},P:P};
})();
