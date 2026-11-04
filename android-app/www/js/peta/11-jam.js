'use strict';
/* ---------- jam, banner, jalur beroperasi ---------- */
$('#selTime').onchange=e=>{const v=e.target.value;S.t=S.vt=(v==='now'?realMin():+v);onMinute(true);if(S.from&&S.to)plan();};
$('#selSpeed').onchange=e=>{S.speed=+e.target.value;};
function bannerInfo(t){if(!isNight(t))return null;const stopped=Object.keys(MODES).filter(k=>!(t>=MODES[k].start&&t<MODES[k].end)).length;const soon=Object.keys(MODES).filter(k=>t>=MODES[k].start&&t<MODES[k].end&&MODES[k].end-t<=120).length;if(!stopped&&!soon)return null;
  const hh=fmt(t).replace(':','.');return {text:'Info dari Jecom: sekarang jam '+hh+(t<300?', sebagian transportasi umum belum beroperasi.':', beberapa transportasi umum sudah mulai berhenti beroperasi.')};}
function banner(){const b=bannerInfo(Math.floor(S.t));$('#banner').hidden=!b;if(b)$('#bannerTxt').textContent=b.text;}
const SHEETROWS=[['krl','KRL Commuter Line (semua lini)','#E4002B'],['mrt','MRT Jakarta','#1A237E'],['lrt','LRT Jakarta dan Jabodebek','#0288D1'],['whoosh','Whoosh','#7B1FA2'],['brt','TransJakarta koridor BRT','#F39C12'],['tj','TransJakarta non-BRT','#E59866'],['mikro','Mikrotrans (JakLingko)','#16A085']];
let SCH={v:'modes',mode:'',line:-1,q:'',tj:'',day:''};
let MRD=null,MRP=null;
const MRT_URL='https://tim-jejak.github.io/jejakcommuter/mrt-jadwal.json';
function ensureMRD(){if(MRD||MRP)return MRP;MRP=fetch(window.__MRT_URL||MRT_URL,{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{MRD=j;MRP=null;if(j&&!$('#sheet').hidden)renderSheet();return j;}).catch(()=>{MRP=null;return null;});return MRP;}
const toMin=s=>{const a=s.split(':');return +a[0]*60+ +a[1];};
const MDIR={lebak:'Arah Lebak Bulus',hi:'Arah Bundaran HI'};
function mrtBands(mins){const by={};for(let i=1;i<mins.length;i++){const h=Math.floor(mins[i-1]/60);(by[h]=by[h]||[]).push(mins[i]-mins[i-1]);}
  const hs=Object.keys(by).map(Number).sort((a,b)=>a-b),med=a=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)];},bands=[];
  hs.forEach(h=>{const m=med(by[h]),b=bands[bands.length-1];if(b&&b.h2===h-1&&Math.abs(b.m-m)<=2.5){b.h2=h;b.g.push(...by[h]);b.m=med(b.g);}else bands.push({h1:h,h2:h,g:[...by[h]],m});});
  return bands.map(b=>({a:b.h1,z:b.h2+1,lo:Math.round(Math.min(...b.g)),hi:Math.round(Math.max(...b.g))}));}
function mrtDay(){const d=new Date().getDay();return (d===0||d===6)?'we':'wd';}
let TJD=null,TJP=null;
const TJ_URL='https://tim-jejak.github.io/jejakcommuter/tj-jadwal.json';
function ensureTJ(){if(TJD||TJP)return TJP;TJP=fetch(window.__TJ_URL||TJ_URL,{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{TJD=j;TJP=null;if(j)buildTJIdx();if(!$('#sheet').hidden)renderSheet();return j;}).catch(()=>{TJP=null;return null;});return TJP;}
const TJCAT=[['BRT','TransJakarta BRT','#F39C12'],['Angkutan Umum Integrasi','TransJakarta non-BRT (integrasi)','#E59866'],['Mikrotrans','Mikrotrans (JakLingko)','#16A085'],['Transjabodetabek','Transjabodetabek','#8E44AD'],['Royaltrans','Royaltrans','#B7950B'],['Rusun','Bus Rusun','#7F8C8D'],['Bus Wisata','Bus Wisata','#D35400']];
let TJIDX={};
function tjKey(s){s=String(s||'').toUpperCase().replace(/[\s.]/g,'');return s.replace(/^JAK0*(\d)/,'JAK$1');}
function buildTJIdx(){TJIDX={};LINES.forEach(L=>{if(L.M&&L.M.group==='tj')TJIDX[tjKey(L.ref)]=L.idx;});}
function dayKey(){const d=new Date().getDay();return d===0?'sun':(d===6?'sat':'wd');}
const DAYN={wd:'Hari kerja',sat:'Sabtu',sun:'Minggu'};
function tjWin(x,day){let a=1e9,b=0;x.d.forEach(dd=>(dd.w[day]||[]).forEach(w=>{a=Math.min(a,w[0]);b=Math.max(b,w[1]);}));return b?[a,b]:null;}
function tjRunning(x,day,t){return x.d.some(dd=>(dd.w[day]||[]).some(w=>t>=w[0]&&t<w[1]));}

const HM=m=>fmt(m).replace(':','.');
function lineTerm(L){return [cleanName(L.s[0][0]),cleanName(L.s[L.n-1][0])];}
function depList(L,t,off){const out=[];let c=L.start+off;while(c<t&&c<L.end)c+=L.hw[band(c)];while(out.length<4&&c<L.end){out.push(c);c+=L.hw[band(c)];}return out;}
function renderSheet(){const t=Math.floor(S.t),box=$('#shList');
  const nt=$('#shNote');if(nt)nt.hidden=(SCH.v==='mrtst'&&!!MRD)||(SCH.v==='tjline'&&!!TJD)||(SCH.v==='lines'&&((SCH.mode==='mrt'&&!!MRD)||(SCH.mode.startsWith('tj:')&&!!TJD)));
  const back=(to,txt)=>'<button type="button" class="btn" data-sch="'+to+'" style="margin-bottom:8px">&lsaquo; '+txt+'</button>';
  if(SCH.v==='modes'){$('#shT').textContent='Jadwal dan rute';$('#shSub').textContent='Sekarang jam '+HM(t)+'. Ketuk satu moda untuk melihat semua lininya.';
    ensureTJ();ensureMRD();const day=dayKey();
    let rows=SHEETROWS.filter(r=>!(TJD&&['brt','tj','mikro'].includes(r[0]))).map(([k,n,c])=>({k,n,c,M:MODES[k],run:t>=MODES[k].start&&t<MODES[k].end,cnt:LINES.filter(L=>L.cls===k).length}));
    if(TJD){TJCAT.forEach(([cat,n,c])=>{const rs=Object.values(TJD.routes).filter(x=>x.cat===cat);if(!rs.length)return;const run=rs.filter(x=>tjRunning(x,day,t)).length;rows.push({k:'tj:'+cat,n,c,tj:true,cnt:rs.length,run:run>0,runN:run});});}
    if(MRD){const mr=rows.find(r=>r.k==='mrt');if(mr){const dk=mrtDay();let a=1e9,b=0;MRD.st.forEach(s=>Object.values(s[dk]||{}).forEach(l=>{a=Math.min(a,toMin(l[0]));b=Math.max(b,toMin(l[l.length-1]));}));mr.tj=true;mr.run=t>=a&&t<=b;mr.txt=MRD.st.length+' stasiun · jadwal resmi · '+HM(a)+' sampai '+HM(b);}}
    rows.sort((a,b)=>b.run-a.run);
    box.innerHTML=rows.map(r=>'<button type="button" class="lrow" data-mode="'+r.k+'" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;text-align:left;color:inherit;font:inherit;cursor:pointer"><div><span class="lb" style="background:'+r.c+'">&nbsp;</span> <b>'+esc(r.n)+'</b><div class="small">'+(r.txt?r.txt:r.tj?r.cnt+' lini · data resmi · '+r.runN+' beroperasi sekarang':r.cnt+' lini · perkiraan '+HM(r.M.start)+' sampai '+(r.M.end>=1440?'24.00':HM(r.M.end)))+'</div></div><span><span class="pill '+(r.run?'ok':'stop')+'">'+(r.tj?(r.run?'beroperasi':'berhenti'):(r.run?'sisa '+hm(r.M.end-t):(t<r.M.start?'belum mulai':'berhenti')))+'</span> &rsaquo;</span></button>').join('');return;}
  if(SCH.v==='lines'&&SCH.mode==='mrt'&&MRD){$('#shT').textContent='MRT Jakarta';$('#shSub').textContent='Jadwal resmi per stasiun, '+(mrtDay()==='we'?'hari libur':'hari biasa')+' ini';
    box.innerHTML=back('modes','Semua moda')+MRD.st.map(s=>'<button type="button" class="lrow" data-mrs="'+s.id+'" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;text-align:left;color:inherit;font:inherit;cursor:pointer"><div><span class="lb" style="background:#1A237E">&nbsp;</span> <b>'+esc(s.n)+'</b></div><span>&rsaquo;</span></button>').join('');return;}
  if(SCH.v==='mrtst'&&MRD){const s=MRD.st.find(x=>x.id===SCH.mst);if(s){const dk=SCH.day==='wd'||SCH.day==='we'?SCH.day:mrtDay(),dd=s[dk]||{},dirs=Object.keys(dd);let dr=dirs.includes(SCH.mdir)?SCH.mdir:dirs[0];
    $('#shT').textContent='Stasiun '+s.n;$('#shSub').textContent='Jadwal resmi MRT Jakarta · estimasi';
    const B=(on,c)=>'padding:7px 12px;'+(on?'background:'+(c||'#14202B')+';color:#fff;':'');
    const tabs=[['wd','Hari biasa'],['we','Hari libur']].map(([d,n])=>'<button type="button" class="btn" data-day="'+d+'" style="'+B(d===dk)+'">'+n+'</button>').join(' ');
    const dtabs=dirs.length>1?dirs.map(d=>'<button type="button" class="btn" data-dir="'+d+'" style="'+B(d===dr,'#1A237E')+'">'+MDIR[d]+'</button>').join(' '):'<b>'+MDIR[dr]+'</b>';
    const l=dd[dr]||[],mins=l.map(toMin),now=S.t,isToday=dk===mrtDay(),ni=isToday?mins.findIndex(m=>m>=now):-1;
    const fm=x=>x.replace(':','.');
    const until=m=>{const d=Math.max(0,Math.ceil(m-now));return d===0?'sekarang':d<60?'sekitar '+d+' menit lagi':'sekitar '+Math.floor(d/60)+' j '+(d%60)+' mnt lagi';};
    const EST='<span style="background:#FFE9A8;color:#14202B;border-radius:6px;padding:2px 8px;font-weight:700;font-size:12px">Estimasi</span>';
    let hero;
    if(isToday&&ni>=0)hero='<div style="border:1px solid var(--line);border-radius:14px;padding:12px 14px"><div class="small">Berangkat berikutnya '+EST+'</div><div style="font-size:40px;font-weight:800;line-height:1.15;margin-top:2px">'+fm(l[ni])+'</div><div style="font-size:16px;font-weight:600">'+until(mins[ni])+'</div>'+(l.slice(ni+1,ni+5).length?'<div class="small" style="margin-top:6px">Lalu: '+l.slice(ni+1,ni+5).map(fm).join(' · ')+'</div>':'')+'</div>';
    else if(isToday)hero='<div style="border:1px solid var(--line);border-radius:14px;padding:12px 14px"><b>Kereta terakhir hari ini sudah lewat.</b><div class="small">Besok mulai sekitar '+fm(l[0])+'.</div></div>';
    else hero='<div style="border:1px solid var(--line);border-radius:14px;padding:12px 14px"><div class="small">Jadwal '+(dk==='we'?'hari libur':'hari biasa')+' '+EST+'</div><div style="font-size:20px;font-weight:800;margin-top:2px">'+fm(l[0])+' sampai '+fm(l[l.length-1])+'</div></div>';
    const bands=mrtBands(mins),bl=bands.map((b,k)=>{const a=k===0?fm(l[0]):String(b.a).padStart(2,'0')+'.00',z=k===bands.length-1?fm(l[l.length-1]):String(b.z).padStart(2,'0')+'.00';return '<div>'+a+'–'+z+': tiap '+(b.lo===b.hi?b.lo:b.lo+'–'+b.hi)+' mnt</div>';}).join('');
    const chips=SCH.mall?'<div id="mallBox" style="position:relative;max-height:42vh;overflow:auto;margin-top:6px;display:flex;flex-wrap:wrap;gap:6px;align-content:flex-start">'+l.map((x,k)=>{const past=isToday&&mins[k]<now&&k!==ni,nx=k===ni;return '<span '+(nx?'data-next="1" ':'')+'style="padding:5px 9px;border-radius:8px;border:1px solid var(--line);font-size:14px;'+(past?'opacity:.35;':'')+(nx?'background:#FFE9A8;color:#14202B;font-weight:800;border-color:#E8A200;':'')+'">'+fm(x)+'</span>';}).join('')+'</div>':'';
    box.innerHTML=back('mrtlist','Daftar stasiun')+'<div style="display:grid;gap:10px"><div style="display:flex;gap:8px;align-items:center;justify-content:space-between"><b style="font-size:16px">'+esc(s.n)+'</b><button type="button" class="btn" data-loc="'+s.id+'" style="padding:7px 12px">Lihat lokasi</button></div>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap">'+tabs+'</div><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">'+dtabs+'</div>'+hero+
      '<div><b style="font-size:13.5px">Pola jarak antar kereta</b><div class="small" style="line-height:1.6;margin-top:2px">'+bl+'</div></div>'+
      '<div><button type="button" class="btn" data-mall="1" style="width:100%">'+(SCH.mall?'Sembunyikan semua jam':'Lihat semua jam ('+l.length+' kereta)')+'</button>'+chips+'</div>'+
      (dr==='hi'?'<p class="small">'+esc(MRD.last||'')+'</p>':'')+
      '<p class="small">Estimasi berdasarkan jadwal resmi MRT Jakarta, bukan jaminan. Jam bisa bergeser, datanglah lebih awal. Sumber: <a href="https://jakartamrt.co.id/jadwal-keberangkatan" target="_blank" rel="noopener noreferrer" style="color:inherit">jadwal keberangkatan resmi</a>, diperbarui '+esc(MRD.built||'')+'.</p></div>';
    if(SCH.mall){const n=box.querySelector('[data-next]'),mb=$('#mallBox');if(n&&mb)mb.scrollTop=Math.max(0,n.offsetTop-mb.offsetTop-70);}
    return;}}
  if(SCH.v==='lines'&&SCH.mode.startsWith('tj:')&&TJD){const cat=SCH.mode.slice(3),ce=TJCAT.find(c=>c[0]===cat),day=dayKey();$('#shT').textContent=ce?ce[1]:cat;$('#shSub').textContent='Data resmi TransJakarta · '+DAYN[day]+' ini';
    const q=normName(SCH.q||'');let rs=Object.entries(TJD.routes).filter(([k,x])=>x.cat===cat);
    if(q.length>=2)rs=rs.filter(([k,x])=>normName(x.n+' '+x.name).includes(q)||x.d.some(dd=>dd.h.some(h=>normName(h).includes(q))||dd.s.some(i=>normName(TJD.names[i]).includes(q))));
    rs.sort((a,b)=>String(a[1].n).localeCompare(String(b[1].n),'id',{numeric:true}));
    box.innerHTML=back('modes','Semua moda')+'<input id="schQ" type="search" placeholder="Cari lini atau halte" value="'+esc(SCH.q||'')+'" style="width:100%;box-sizing:border-box;padding:10px;border-radius:10px;border:1px solid var(--line);margin-bottom:6px;font:inherit">'+
      (rs.length?rs.map(([k,x])=>{const w=tjWin(x,day),run=tjRunning(x,day,t);return '<button type="button" class="lrow" data-tj="'+esc(k)+'" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;text-align:left;color:inherit;font:inherit;cursor:pointer"><div><span class="lb" style="background:'+x.col+'">&nbsp;</span> <b>'+esc(x.n)+'</b> '+esc(x.name)+'<div class="small">'+(w?HM(w[0])+' sampai '+(w[1]>=1440?'24.00':HM(w[1])):'tidak beroperasi')+(run?' · beroperasi sekarang':'')+'</div></div><span>&rsaquo;</span></button>';}).join(''):'<p class="small">Tidak ada lini yang cocok.</p>');
    return;}
  if(SCH.v==='tjline'&&TJD&&TJD.routes[SCH.tj]){const x=TJD.routes[SCH.tj],day=SCH.day||dayKey(),mi=TJIDX[tjKey(x.n)];$('#shT').textContent=x.n+' '+x.name;$('#shSub').textContent=x.cat;
    const tabs=['wd','sat','sun'].map(d=>'<button type="button" class="btn" data-day="'+d+'" style="'+(d===day?'background:#14202B;color:#fff;':'')+'padding:6px 10px">'+DAYN[d]+'</button>').join(' ');
    const dirs=x.d.map(dd=>{const ws=dd.w[day]||[],cur=ws.find(w=>t>=w[0]&&t<w[1]);
      return '<div style="border-top:1px solid var(--line);padding-top:8px"><b>Menuju '+esc(dd.h[0]||'-')+'</b>'+(dd.h.length>1?'<div class="small">Juga: '+esc(dd.h.slice(1).join(', '))+'</div>':'')+
       '<div class="small" style="margin-top:4px">'+(ws.length?ws.map(w=>HM(w[0])+'–'+(w[1]>=1440?'24.00':HM(w[1]))+': tiap '+w[2]+' mnt').join('<br>'):'Tidak beroperasi pada hari ini.')+'</div>'+
       (day===dayKey()?'<div class="small"><b>Sekarang:</b> '+(cur?'sekitar tiap '+cur[2]+' mnt <span style="background:#FFE9A8;color:#14202B;border-radius:6px;padding:1px 6px;font-weight:700;font-size:11px">Estimasi</span>':'di luar jam layanan')+'</div>':'')+
       '<details style="margin-top:4px"><summary class="small" style="cursor:pointer">'+dd.s.length+' pemberhentian</summary><ol style="margin:6px 0 0;padding-left:22px;font-size:13.5px;line-height:1.5">'+dd.s.map(i=>'<li>'+esc(TJD.names[i])+'</li>').join('')+'</ol></details></div>';}).join('');
    box.innerHTML=back('tjlist','Daftar lini')+'<div style="display:grid;gap:8px"><div><span class="lb" style="background:'+x.col+'">&nbsp;</span> <b>'+esc(x.name)+'</b></div><div style="display:flex;gap:6px;flex-wrap:wrap">'+tabs+'</div>'+dirs+
      '<button type="button" class="btn" data-spot="'+esc(SCH.tj)+'">Tampilkan jalur di peta</button>'+
      '<p class="small">Sumber: TransJakarta (data GTFS resmi), diperbarui '+esc(TJD.built||'')+'. Jarak antar bus berbasis frekuensi resmi, bukan jam berangkat per bus, jadi hanya estimasi. Waktu tunggu nyata bisa lebih lama, datanglah lebih awal dan cek informasi resmi TransJakarta.</p></div>';return;}
  if(SCH.v==='lines'){const row=SHEETROWS.find(r=>r[0]===SCH.mode),M=MODES[SCH.mode];$('#shT').textContent=row[1];$('#shSub').textContent=HM(M.start)+' sampai '+(M.end>=1440?'24.00':HM(M.end))+' (perkiraan)';
    const q=normName(SCH.q||'');let ls=LINES.filter(L=>L.cls===SCH.mode);
    if(q.length>=2)ls=ls.filter(L=>normName(L.label+' '+L.name).includes(q)||L.s.some(s=>normName(s[0]).includes(q)));
    ls.sort((a,b)=>String(a.label).localeCompare(String(b.label),'id',{numeric:true}));
    box.innerHTML=back('modes','Semua moda')+'<input id="schQ" type="search" placeholder="Cari lini atau stasiun/halte" value="'+esc(SCH.q||'')+'" style="width:100%;box-sizing:border-box;padding:10px;border-radius:10px;border:1px solid var(--line);margin-bottom:6px;font:inherit">'+
      (ls.length?ls.map(L=>{const [a,b]=lineTerm(L);return '<button type="button" class="lrow" data-line="'+L.idx+'" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;text-align:left;color:inherit;font:inherit;cursor:pointer"><div><span class="lb" style="background:'+L.col+'">&nbsp;</span> <b>'+esc(L.label)+'</b><div class="small">'+esc(a)+' &harr; '+esc(b)+' · '+L.n+' pemberhentian</div></div><span>&rsaquo;</span></button>';}).join(''):'<p class="small">Tidak ada lini yang cocok.</p>');
    return;}
  const L=LINES[SCH.line];if(!L){SCH.v='modes';return renderSheet();}const [a,b]=lineTerm(L),run=t>=L.start&&t<L.end;
  $('#shT').textContent=L.label;$('#shSub').textContent=a+' ↔ '+b;
  const f=(x)=>'tiap '+x+' mnt';const dl=(from,off)=>{const d=depList(L,t,off);return '<div class="small"><b>Dari '+esc(from)+':</b> '+(d.length?d.map(HM).join(' · '):'tidak ada lagi hari ini')+'</div>';};
  box.innerHTML=back('lines','Daftar lini')+
   '<div style="display:grid;gap:8px"><div><span class="lb" style="background:'+L.col+'">&nbsp;</span> <b>'+esc(L.name||L.label)+'</b> <span class="pill '+(run?'ok':'stop')+'">'+(run?'sisa '+hm(L.end-t):(t<L.start?'belum mulai':'berhenti'))+'</span></div>'+
   '<div class="small">Rute: '+esc(a)+' &harr; '+esc(b)+' (dua arah) · '+L.n+' pemberhentian · ±'+Math.round(L.len/1000)+' km</div>'+
   '<div class="small"><b>Jam operasional (perkiraan):</b> '+HM(L.start)+' sampai '+(L.end>=1440?'24.00':HM(L.end))+'</div>'+
   '<div class="small"><b>Jarak antar kendaraan (perkiraan):</b><br>Jam sibuk (07.00–09.00, 17.00–19.00): '+f(L.hw.peak)+'<br>Siang dan sore: '+f(L.hw.off)+'<br>Malam (21.00–06.00): '+f(L.hw.late)+'</div>'+
   '<div><b>Keberangkatan berikutnya (perkiraan)</b>'+dl(a,0)+dl(b,2)+'</div>'+
   '<button type="button" class="btn" data-show="'+L.idx+'">Tampilkan jalur di peta</button>'+
   '<div><b>Pemberhentian berurutan</b><ol style="margin:6px 0 0;padding-left:22px;font-size:13.5px;line-height:1.5">'+L.s.map(s=>'<li>'+esc(cleanName(s[0]))+'</li>').join('')+'</ol></div></div>';}
const SPOT={on:false,dirs:[],di:0,sel:-1,title:'',sub:'',col:'#1A237E',back:null,single:false};
function spotData(){if(!mapReady)return;const d=SPOT.dirs[SPOT.di];if(!d)return;const fs=[];
  if(d.line&&d.line.length>1)fs.push({type:'Feature',properties:{col:SPOT.col},geometry:{type:'LineString',coordinates:d.line}});
  d.stops.forEach((s,k)=>fs.push({type:'Feature',properties:{name:s.n,col:SPOT.col,sel:k===SPOT.sel?1:0},geometry:{type:'Point',coordinates:[s.lng,s.lat]}}));
  map.getSource('jsel').setData({type:'FeatureCollection',features:fs});}
function spotFit(){const d=SPOT.dirs[SPOT.di];if(!d)return;const c=$('#jcard'),pb=(c?c.offsetHeight:220)+30;
  const pts=(d.line&&d.line.length>1)?d.line:d.stops.map(s=>[s.lng,s.lat]);if(!pts.length)return;
  if(SPOT.single||pts.length===1){map.flyTo({center:pts[0],zoom:16,duration:700,padding:{top:90,bottom:pb,left:20,right:20}});return;}
  const bb=pts.reduce((b,p)=>b.extend(p),new maplibregl.LngLatBounds(pts[0],pts[0]));map.fitBounds(bb,{padding:{top:100,bottom:pb,left:30,right:30},duration:700,maxZoom:15});}
function spotCard(){let c=$('#jcard');
  if(!c){c=document.createElement('div');c.id='jcard';c.style.cssText='position:fixed;left:0;right:0;bottom:var(--jnh,0px);z-index:12;background:var(--surface);color:var(--ink);border-radius:16px 16px 0 0;padding:10px 14px 12px;box-shadow:0 -4px 14px rgba(0,0,0,.25);max-height:44vh;display:flex;flex-direction:column;gap:8px;font:14px system-ui,sans-serif';document.body.appendChild(c);c.addEventListener('click',spotClick);}
  const prev=$('#jcList'),st=prev?prev.scrollTop:0,d=SPOT.dirs[SPOT.di],B='background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:7px 12px;font:600 13px system-ui';
  const tabs=SPOT.dirs.length>1?'<div style="display:flex;gap:6px;flex-wrap:wrap">'+SPOT.dirs.map((x,k)=>'<button type="button" data-sdir="'+k+'" style="'+B+(k===SPOT.di?';background:var(--ink);color:var(--surface)':'')+'">'+esc(x.label)+'</button>').join('')+'</div>':'';
  const list=(!SPOT.single&&d.stops.length>1)?'<div id="jcList" style="overflow:auto;flex:1;min-height:0;border-top:1px solid var(--line)">'+d.stops.map((s,k)=>'<button type="button" data-sstop="'+k+'" style="display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:'+(k===SPOT.sel?'var(--surface-2)':'none')+';color:var(--ink);border:0;border-bottom:1px solid var(--line);padding:9px 6px;font:14px system-ui"><span style="width:10px;height:10px;border-radius:50%;background:'+(k===SPOT.sel?'#FFD54A':'var(--surface)')+';border:3px solid '+(k===SPOT.sel?'var(--ink)':SPOT.col)+';flex:none"></span><span>'+esc(s.n)+'</span></button>').join('')+'</div>':'';
  c.innerHTML='<div style="display:flex;gap:8px;align-items:center"><div style="flex:1;min-width:0"><b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:15px">'+esc(SPOT.title)+'</b><div style="font-size:12px;color:var(--ink-2)">'+esc(SPOT.sub)+(list?' · ketuk pemberhentian untuk melihat di peta':'')+'</div></div>'+(SPOT.back?'<button type="button" data-sback="1" style="'+B+'">Jadwal</button>':'')+'<button type="button" data-sx="1" style="background:var(--ink);color:var(--surface);border:0;border-radius:10px;padding:7px 12px;font:700 13px system-ui">Hapus</button></div>'+tabs+list;
  c.hidden=false;c.style.display='flex';const nl=$('#jcList');if(nl)nl.scrollTop=st;}
function spotClick(e){const g=e.target.closest('[data-sdir],[data-sstop],[data-sback],[data-sx]');if(!g)return;
  if(g.dataset.sx){spotClear();return;}
  if(g.dataset.sback){if(SPOT.back)SPOT.back();return;}
  if(g.dataset.sdir){SPOT.di=+g.dataset.sdir;SPOT.sel=-1;spotData();spotCard();spotFit();return;}
  if(g.dataset.sstop){const k=+g.dataset.sstop,s=SPOT.dirs[SPOT.di].stops[k];SPOT.sel=k;spotData();spotCard();const c=$('#jcard');map.flyTo({center:[s.lng,s.lat],zoom:Math.max(map.getZoom(),15.5),duration:600,padding:{top:90,bottom:(c?c.offsetHeight:220)+10,left:20,right:20}});}}
function spotOpen(cfg){if(!mapReady)return;Object.assign(SPOT,{on:true,dirs:cfg.dirs,di:0,sel:cfg.single?0:-1,title:cfg.title,sub:cfg.sub||'',col:cfg.col||'#1A237E',back:cfg.back||null,single:!!cfg.single});
  if(window.__setSheet)window.__setSheet('peek');map.setPaintProperty('jdim','fill-opacity',.64);spotData();spotCard();spotFit();}
function spotClear(){SPOT.on=false;try{map.getSource('jsel').setData(emptyFC);map.setPaintProperty('jdim','fill-opacity',0);}catch(e){}const c=$('#jcard');if(c){c.hidden=true;c.style.display='none';}}
const clearLineMap=spotClear;
const reopenSheet=()=>{$('#sheet').hidden=false;renderSheet();};
function showLineMap(i){const L=LINES[i];if(!L)return;
  spotOpen({title:L.label,sub:'Jalur dan pemberhentian',col:L.col,back:reopenSheet,dirs:[{label:'',line:L.pts,stops:L.s.map(s=>({n:cleanName(s[0]),lat:s[1],lng:s[2]}))}]});}
function spotTJ(key){const x=TJD&&TJD.routes[key];if(!x)return;
  const dirs=x.d.filter(dd=>dd.c&&dd.c.length).map(dd=>({label:'Menuju '+(dd.h[0]||'-'),line:dd.p?decodePoly(dd.p):null,stops:dd.s.map((ni,k)=>({n:TJD.names[ni],lat:dd.c[k][0],lng:dd.c[k][1]}))}));
  if(!dirs.length){const mi=TJIDX[tjKey(x.n)];if(mi!==undefined)showLineMap(mi);return;}
  spotOpen({title:x.n+' '+x.name,sub:x.cat,col:x.col,back:reopenSheet,dirs});}
function mrtCoord(i){const L=LINES.find(l=>l.cls==='mrt');if(!L)return null;const st=MRD.st[i],nn=normName(st.n);
  let s=L.s.find(q=>{const a=normName(q[0]);return a===nn||a.startsWith(nn)||nn.startsWith(a);});if(!s)s=L.s[i];return s?{lat:s[1],lng:s[2]}:null;}
function spotMRT(id){const i=MRD.st.findIndex(x=>x.id===id),c=i<0?null:mrtCoord(i);if(!c)return;
  spotOpen({title:'Stasiun '+MRD.st[i].n,sub:'MRT Jakarta',col:'#1A237E',single:true,back:reopenSheet,dirs:[{label:'',line:null,stops:[{n:MRD.st[i].n,lat:c.lat,lng:c.lng}]}]});}
$('#sheet').addEventListener('click',e=>{const g=e.target.closest('[data-mode],[data-line],[data-sch],[data-show],[data-tj],[data-day],[data-mrs],[data-dir],[data-spot],[data-loc],[data-mall]');if(!g)return;
  if(g.dataset.mode){SCH={v:'lines',mode:g.dataset.mode,line:-1,q:'',tj:'',day:''};renderSheet();}
  else if(g.dataset.tj){SCH.v='tjline';SCH.tj=g.dataset.tj;SCH.day='';renderSheet();$('#shList').scrollTop=0;}
  else if(g.dataset.mrs){SCH.v='mrtst';SCH.mst=g.dataset.mrs;SCH.day='';SCH.mdir='';SCH.mall=false;renderSheet();$('#shList').scrollTop=0;}
  else if(g.dataset.dir){SCH.mdir=g.dataset.dir;renderSheet();}
  else if(g.dataset.day){SCH.day=g.dataset.day;renderSheet();}
  else if(g.dataset.line){SCH.v='line';SCH.line=+g.dataset.line;renderSheet();$('#shList').scrollTop=0;}
  else if(g.dataset.sch){SCH.v=(g.dataset.sch==='tjlist'||g.dataset.sch==='mrtlist')?'lines':g.dataset.sch;renderSheet();}
  else if(g.dataset.spot){spotTJ(g.dataset.spot);$('#sheet').hidden=true;}
  else if(g.dataset.loc){spotMRT(g.dataset.loc);$('#sheet').hidden=true;}
  else if(g.dataset.mall){SCH.mall=!SCH.mall;renderSheet();}
  else if(g.dataset.show){showLineMap(+g.dataset.show);$('#sheet').hidden=true;}});
$('#sheet').addEventListener('input',e=>{if(e.target.id==='schQ'){SCH.q=e.target.value;const pos=e.target.selectionStart;renderSheet();const n=$('#schQ');if(n){n.focus();try{n.setSelectionRange(pos,pos);}catch(_){}}}});
setInterval(()=>{if(!$('#sheet').hidden&&SCH.v==='mrtst'&&!SCH.mall)renderSheet();},20000);
$('#bannerBtn').onclick=()=>{SCH={v:'modes',mode:'',line:-1,q:'',tj:'',day:''};$('#sheet').hidden=false;renderSheet();};
(function(){const sh=$('#sheet'),rb=$('#rbody'),mq=window.matchMedia('(min-width:761px)');function place(){if(mq.matches){rb.appendChild(sh);sh.classList.add('dock');}else{document.body.appendChild(sh);sh.classList.remove('dock');}}place();if(mq.addEventListener)mq.addEventListener('change',place);})();
const openSch=$('#bannerBtn').onclick;$('#bannerBtn').onclick=()=>{openSch();if($('#sheet').classList.contains('dock'))$('#sheet').scrollIntoView({block:'nearest'});};
(function(){const sh=$('#sheet');new MutationObserver(()=>{if(!sh.hidden&&window.__setSheet)window.__setSheet('peek');}).observe(sh,{attributes:true,attributeFilter:['hidden']});})();
$('#schOpen').onclick=$('#bannerBtn').onclick;$('#shClose').onclick=()=>$('#sheet').hidden=true;
$('#sheet').addEventListener('click',e=>{if(e.target.id==='sheet')$('#sheet').hidden=true;});
const WMO={0:'Cerah',1:'Cerah Berawan',2:'Berawan',3:'Mendung',45:'Berkabut',48:'Berkabut',51:'Gerimis',53:'Gerimis',55:'Gerimis',56:'Gerimis',57:'Gerimis',61:'Hujan Ringan',63:'Hujan Sedang',65:'Hujan Lebat',66:'Hujan',67:'Hujan',80:'Hujan Ringan',81:'Hujan Sedang',82:'Hujan Lebat',95:'Petir',96:'Petir',99:'Petir'};
let wxAt=0,wxPos=null;
function wxShow(desc,t,src,where){S.wx={desc,t};const c=$('#wxChip');c.hidden=false;c.innerHTML='<span class="small">'+esc(where)+'</span> <b>'+esc(desc)+' '+esc(t)+'&deg;</b> <span class="small">'+esc(src)+'</span>';}
async function loadWx(){const p=S.gps||wxPos,la=p?p.lat:-6.2,lo=p?p.lon:106.82,where=p?'Cuaca di lokasimu':'Cuaca Jakarta';wxAt=Date.now();if(S.gps)wxPos={lat:S.gps.lat,lon:S.gps.lon};
  try{const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+la.toFixed(3)+'&longitude='+lo.toFixed(3)+'&current=temperature_2m,precipitation,weather_code&timezone=auto');const j=await r.json(),c=j.current;
    let d=WMO[c.weather_code]||'Berawan';if(c.precipitation>0&&c.weather_code<51)d='Hujan Ringan';if(c.precipitation<=0&&c.weather_code>=51&&c.weather_code<=82)d='Mendung';
    wxShow(d,Math.round(c.temperature_2m),'Open-Meteo',where);return;}catch(e){}
  try{const r=await fetch('https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=31.71.03.1001');const j=await r.json();
    const slots=[].concat(...((j.data&&j.data[0]&&j.data[0].cuaca)||[]));const now=Date.now();let best=null,bd=1e18;
    slots.forEach(s=>{const ts=Date.parse((s.local_datetime||s.datetime||'').replace(' ','T')+(s.local_datetime?'+07:00':'Z'));const d=Math.abs(ts-now);if(d<bd){bd=d;best=s;}});
    if(best)wxShow(best.weather_desc||'-',best.t,'BMKG','Cuaca Jakarta');}catch(e){}}
setInterval(()=>{if(S.gps&&(!wxPos||hav(S.gps,wxPos)>3000||Date.now()-wxAt>900000))loadWx();},60000);
