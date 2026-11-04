'use strict';
/* ---------- jenis moda ---------- */
const MODES={
  krl:{label:'KRL',group:'krl',speed:40,dwell:0.8,hw:{peak:8,off:12,late:20},start:240,end:1440},
  mrt:{label:'MRT',group:'mrt',speed:35,dwell:0.7,hw:{peak:5,off:8,late:15},start:300,end:1440},
  lrt:{label:'LRT',group:'lrt',speed:32,dwell:0.7,hw:{peak:8,off:10,late:15},start:330,end:1380},
  whoosh:{label:'Whoosh',group:'whoosh',speed:110,dwell:2,hw:{peak:60,off:60,late:60},start:360,end:1260},
  brt:{label:'TJ',group:'tj',speed:22,dwell:0.6,hw:{peak:4,off:7,late:12},start:300,end:1320},
  tj:{label:'TJ',group:'tj',speed:14,dwell:0.5,hw:{peak:8,off:12,late:20},start:300,end:1320},
  mikro:{label:'Mikrotrans',group:'tj',speed:12,dwell:0.5,hw:{peak:10,off:12,late:20},start:300,end:1320}
};
const REFCOL={B:'#E4002B',C:'#1E78C8',R:'#3FA535',T:'#8D5A2B',TP:'#E0589F',A:'#6B6B6B',M:'#1A237E',LRTJ:'#0097A7',CB:'#0288D1',BK:'#43A047',W:'#7B1FA2'};
const CLSCOL={brt:'#F39C12',tj:'#E59866',mikro:'#16A085'};
function band(t){if((t>=420&&t<540)||(t>=1020&&t<1140))return 'peak';if(t>=1260||t<360)return 'late';return 'off';}
function isNight(t){return t>=1260||t<300;}
function cleanName(n){return String(n).replace(/\s+(Bank\b.*|Grab|Indomaret|BCA|BNI|BRI|Mandiri|Astra|Mastercard|Summarecon|Sinarmas.*|Telkomsel|Tokopedia|Shopee)$/i,'').replace(/^(Stasiun|Halte)\s+/i,'').trim();}
function normName(n){return cleanName(n).toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();}
function decodePoly(s){let i=0,la=0,lo=0,out=[];while(i<s.length){let b,sh=0,r=0;do{b=s.charCodeAt(i++)-63;r|=(b&31)<<sh;sh+=5}while(b>=32);la+=(r&1)?~(r>>1):(r>>1);sh=0;r=0;do{b=s.charCodeAt(i++)-63;r|=(b&31)<<sh;sh+=5}while(b>=32);lo+=(r&1)?~(r>>1):(r>>1);out.push([lo/1e5,la/1e5]);}return out;}
