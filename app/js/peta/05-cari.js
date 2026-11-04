'use strict';
/* ---------- cari tempat: stasiun/halte lokal dulu, lalu Photon ---------- */
function localMatches(q){const n=normName(q);if(n.length<2)return [];return ST.filter(s=>normName(s.name).includes(n)).sort((a,b)=>(a.g==='tj')-(b.g==='tj')||b.lines.size-a.lines.size).slice(0,5);}
function bindSearch(inp,sug,w){let tm=0,seq=0;
  inp.addEventListener('input',()=>{clearTimeout(tm);const q=inp.value.trim();if(q.length<2){sug.hidden=true;return;}
    const loc=localMatches(q);
    const render=(fs)=>{const items=[];loc.forEach(s=>items.push({n:(s.g==='tj'?'Halte ':'Stasiun ')+s.name,sub:[...s.lines].slice(0,4).map(i=>LINES[i].label).join(', '),lat:s.lat,lon:s.lon}));
      (fs||[]).forEach(f=>{const x=fmtFeat(f);items.push({n:x.name,sub:x.sub,lat:f.geometry.coordinates[1],lon:f.geometry.coordinates[0]});});
      if(!items.length){sug.innerHTML='<div class="status" style="padding:8px 10px">Tidak ditemukan. Coba nama lain atau pakai tombol Peta.</div>';sug.hidden=false;return;}
      sug.innerHTML=items.map((it,i)=>'<button type="button" data-i="'+i+'">'+esc(it.n)+'<span class="s2">'+esc(it.sub)+'</span></button>').join('');sug._it=items;sug.hidden=false;};
    render(null);
    tm=setTimeout(async()=>{const my=++seq,c=map.getCenter();
      try{const r=await fetch('https://photon.komoot.io/api/?limit=6&bbox=106.4,-6.7,107.2,-5.9&lat='+c.lat+'&lon='+c.lng+'&q='+encodeURIComponent(q));const j=await r.json();if(my!==seq)return;render((j.features||[]).filter(f=>f.geometry&&f.geometry.coordinates));}catch(e){}},350);});
  sug.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const it=sug._it[+b.dataset.i];sug.hidden=true;setPoint(w,{lat:it.lat,lon:it.lon,label:it.n+(it.sub&&!/^(KRL|MRT|LRT|TJ|Mikro|Whoosh)/.test(it.sub)?', '+it.sub:'')},true);});
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){const b=sug.querySelector('button');if(b&&!sug.hidden)b.click();else if(S.from&&S.to)plan();}});}
bindSearch($('#inFrom'),$('#sugFrom'),'from');bindSearch($('#inTo'),$('#sugTo'),'to');
document.addEventListener('click',e=>{if(!e.target.closest('.fld')){$('#sugFrom').hidden=true;$('#sugTo').hidden=true;}});
