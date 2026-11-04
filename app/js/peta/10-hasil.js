'use strict';
/* ---------- hasil ---------- */
const FILT=[['all','Semua'],['motor','Motor'],['mobil','Mobil'],['walk','Jalan kaki'],['krl','KRL'],['mrt','MRT'],['lrt','LRT'],['tj','TransJakarta'],['whoosh','Whoosh']];
function render(){const box=$('#out');if(!S.opts.length)return;let h='';
  if(S.to&&new Date().getDay()===6){const bm=ST.find(s=>s.g==='mrt'&&normName(s.name)==='blok m');if(bm&&(hav(S.to,bm)<=600||/blok m/i.test(S.to.label||'')))h+='<div class="note">Info: hari Sabtu, Blok M ramai banget sekitar jam 16.00 sampai malam.</div>';}
  const wx=S.wx;if(wx&&/hujan|petir/i.test(wx.desc))h+='<div class="note">Cuaca '+esc(wx.desc.toLowerCase())+' di Jakarta. Siapkan jas hujan, atau pilih rute yang minim jalan kaki.</div>';
  if(S.noTransit)h+='<div class="note">Tidak ada rute transum yang cocok untuk pasangan titik ini pada jam ini.</div>';
  h+='<div class="filters" role="group" aria-label="Urutan"><span class="small" style="align-self:center">Urutkan</span><button type="button" class="fchip" data-sort="rec" aria-pressed="'+(S.sortBy==='rec')+'">Rekomendasi</button><button type="button" class="fchip" data-sort="near" aria-pressed="'+(S.sortBy==='near')+'">Terdekat dulu</button><button type="button" class="fchip" data-sort="fast" aria-pressed="'+(S.sortBy==='fast')+'">Tercepat</button></div>';
  const minT=Math.min(...S.opts.map(o=>o.total));
  const avail=FILT.filter(([k])=>k==='all'||S.opts.some(o=>o.modes.includes(k)));
  h+='<div class="filters" role="group" aria-label="Filter moda">'+avail.map(([k,l])=>'<button type="button" class="fchip" data-f="'+k+'" aria-pressed="'+(S.filter===k)+'">'+l+'</button>').join('')+'</div>';
  const idx=S.opts.map((o,i)=>i).filter(i=>S.filter==='all'||S.opts[i].modes.includes(S.filter));
  if(!idx.includes(S.sel)&&idx.length){S.sel=idx[0];draw();}
  h+=idx.map(i=>{const o=S.opts[i],sel=i===S.sel;
    const fastest=o.total===minT;
    let x='<div class="opt'+(sel?' sel':'')+'"><button type="button" class="opt-h" data-i="'+i+'" aria-expanded="'+sel+'"><span><span class="opt-t">'+esc(o.title)+'</span>'+(i===0&&S.sortBy==='rec'?'<span class="pill ok">Direkomendasikan</span>':'')+(fastest?'<span class="pill ok">Tercepat</span>':'')+(o.nearest?'<span class="pill stop">Titik naik terdekat</span>':(o.near?'<span class="pill stop">Stasiun terdekat</span>':''))+'<br><span class="small">'+esc(o.sub)+(o.est?' · sebagian perkiraan':'')+'</span>'+
      (o.rideLines?'<span class="tchips">'+o.rideLines.map(lb).join('')+'</span>':'')+'</span><span class="opt-big mono">'+Math.round(o.total)+' mnt</span></button>';
    if(sel){
      x+='<ul class="steps">'+o.steps.map(s=>'<li class="step"><span class="bar'+(s.k==='walk'?' walk':'')+'" style="'+(s.k==='motor'?'background:#14202B':(s.col?'background:'+s.col:''))+'"></span><div><b>'+esc(s.title)+'</b><span class="small">'+esc(s.detail)+'</span></div></li>').join('')+'</ul>';
      if(o.last!==null&&o.last!==undefined)x+='<div class="last"><div><div class="small">Berangkat terakhir dari titik asal</div><div class="mono" style="font-size:20px;font-weight:700">'+fmt(o.last>=0?S.t+o.last-0:S.t)+'</div></div><div class="cnt'+(o.last<60?' low':'')+'" data-last="'+o.last+'"></div></div>';
      o.notes.forEach(n=>x+='<div class="small" style="padding:0 11px 6px">'+esc(n)+'</div>');
      x+='<div class="btnrow" style="padding:0 11px 8px"><button type="button" class="btn" data-save="1">Simpan rute</button><button type="button" class="btn" data-anim="1">Putar animasi</button></div>';
    }
    return x+'</div>';}).join('');
  box.innerHTML=h;tickCount();}
$('#out').addEventListener('click',e=>{
  const sb=e.target.closest('[data-sort]');if(sb){stopAnim();S.sortBy=sb.dataset.sort;sortOpts();draw();render();return;}
  const f=e.target.closest('[data-f]');if(f){S.filter=f.dataset.f;render();return;}
  const b=e.target.closest('[data-i]');if(b){stopAnim();S.sel=+b.dataset.i;draw();render();if(NAV.on)navSwitch();else fitFeatures(S.opts[S.sel].features);return;}
  if(e.target.closest('[data-anim]')){playAnim();return;}
  if(e.target.closest('[data-save]')&&S.from&&S.to){if(!S.saved.some(s=>s.from.label===S.from.label&&s.to.label===S.to.label)){S.saved.unshift({from:S.from,to:S.to});S.saved=S.saved.slice(0,12);store.set('jc_saved_v3',S.saved);}renderSaved();}});
function tickCount(){document.querySelectorAll('[data-last]').forEach(el=>{const left=+el.dataset.last;el.textContent=left>=0?'sisa '+hm(left):'sudah lewat, cari alternatif';});}
/* animasi perjalanan: titik bergerak sepanjang rute terpilih */
var animRaf=0,animT=0,animSel=-1;
function stopAnim(){cancelAnimationFrame(animRaf);clearTimeout(animT);try{if(mapReady&&map.getSource('anim'))map.getSource('anim').setData(emptyFC);}catch(e){}}
function playAnim(){const o=S.opts[S.sel];if(!o||!mapReady)return;stopAnim();animSel=S.sel;
  const pts=[];o.features.forEach(f=>f.coords.forEach(c=>pts.push(c)));if(pts.length<2)return;
  const cd=[0];for(let i=1;i<pts.length;i++)cd.push(cd[i-1]+hav({lat:pts[i-1][1],lon:pts[i-1][0]},{lat:pts[i][1],lon:pts[i][0]}));
  const tot=cd[cd.length-1],T=14000,t0=performance.now();
  const step=ts=>{const f=Math.min(1,(ts-t0)/T),d=f*tot;let lo=0,hi=cd.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(cd[m]<=d)lo=m;else hi=m;}
    const seg=cd[hi]-cd[lo]||1,u=(d-cd[lo])/seg,p=[pts[lo][0]+(pts[hi][0]-pts[lo][0])*u,pts[lo][1]+(pts[hi][1]-pts[lo][1])*u];
    map.getSource('anim').setData({type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'Point',coordinates:p}}]});
    if(f<1)animRaf=requestAnimationFrame(step);else animT=setTimeout(()=>map.getSource('anim').setData(emptyFC),1500);};
  animRaf=requestAnimationFrame(step);}
function renderSaved(){const el=$('#saved');if(!S.saved.length){el.innerHTML='<div class="small">Belum ada. Cari rute lalu tekan Simpan rute. Tersimpan di perangkat ini, tanpa akun.</div>';return;}
  el.innerHTML=S.saved.map((s,i)=>'<div class="sv"><span>'+esc(s.from.label)+' → '+esc(s.to.label)+'</span><span style="flex:none"><button type="button" class="btn" data-open="'+i+'">Buka</button> <button type="button" class="btn" data-del="'+i+'">Hapus</button></span></div>').join('');}
$('#saved').addEventListener('click',e=>{const o=e.target.dataset.open,d=e.target.dataset.del;
  if(o!==undefined){const s=S.saved[+o];S.from=s.from;S.to=s.to;$('#inFrom').value=s.from.label;$('#inTo').value=s.to.label;setPin('from');setPin('to');plan();}
  if(d!==undefined){S.saved.splice(+d,1);store.set('jc_saved_v3',S.saved);renderSaved();}});
$('#go').onclick=()=>{if(S.from&&S.to)plan();else $('#out').innerHTML='<p class="note">Isi asal dan tujuan dulu. Ketik nama tempat atau stasiun lalu pilih dari daftar, atau pakai tombol Peta.</p>';};
$('#demo').onclick=()=>{const a=ST.find(s=>s.g==='krl'&&normName(s.name)==='kranji'),b=ST.find(s=>s.g==='krl'&&normName(s.name)==='sudirman');
  const A=a?{lat:a.lat-0.0008,lon:a.lon+0.0006,label:'Dekat Stasiun Kranji'}:{lat:-6.2243,lon:106.9747,label:'Dekat Stasiun Kranji'};
  const B=b?{lat:b.lat+0.0007,lon:b.lon-0.0006,label:'Dekat Stasiun Sudirman'}:{lat:-6.2023,lon:106.8226,label:'Dekat Stasiun Sudirman'};
  setPoint('from',A,false);setPoint('to',B,false);plan();};
