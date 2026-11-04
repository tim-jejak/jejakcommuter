(function(){
  var CDN=['lib/','https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/','https://unpkg.com/maplibre-gl@4.7.1/dist/','https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/'];
  function fail(){
    var d=document.createElement('div');
    d.style.cssText='position:fixed;inset:0;z-index:99;background:#fff;color:#14202B;font:16px system-ui;padding:24px;line-height:1.5';
    d.innerHTML='<b>Peta tidak bisa dimuat.</b><br>Library peta (MapLibre) diblokir atau tidak ada internet. Buka file ini langsung di Chrome (klik dua kali), bukan dari pratinjau di dalam aplikasi.';
    document.body.appendChild(d);
  }
  var PARTS=['00-inti','01-moda','02-jaringan','03-peta','04-titik','05-cari','06-valhalla','07-perencana','08-panduan','09-gambar','10-hasil','11-jam','12-urgent-lama','13-animasi','14-loop','15-pembaruan'];
  /* file-file peta dimuat berurutan setelah MapLibre siap; semuanya berbagi satu lingkup global (const/let/function) */
  function loadParts(){
    var v=window.JC_VER||'';
    PARTS.forEach(function(n){var s=document.createElement('script');s.src='js/peta/'+n+'.js?v='+v;s.async=false;document.head.appendChild(s);});
  }
  function tryLoad(i){
    if(i>=CDN.length) return fail();
    var s=document.createElement('script'); s.src=CDN[i]+'maplibre-gl.js';
    s.onload=function(){
      if(typeof maplibregl==='undefined') return tryLoad(i+1);
      var l=document.createElement('link'); l.rel='stylesheet'; l.href=CDN[i]+'maplibre-gl.css'; document.head.appendChild(l);
      loadParts();
    };
    s.onerror=function(){ tryLoad(i+1); };
    document.head.appendChild(s);
  }
  window.__tryLoad=function(){ tryLoad(0); };
})();
