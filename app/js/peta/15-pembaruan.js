'use strict';
/* ---------- pembaruan aplikasi (hanya di aplikasi Android) ---------- */
try{if(/^\d+$/.test(window.JC_BUILD))document.getElementById('verTag').textContent+=' · aplikasi #'+window.JC_BUILD;}catch(e){}
let updAt=0;
async function chkUpd(){const C=window.Capacitor;if(!(C&&C.isNativePlatform&&C.isNativePlatform()))return;
  const cur=/^\d+$/.test(window.JC_BUILD)?+window.JC_BUILD:0;if(!cur||Date.now()-updAt<1800000)return;updAt=Date.now();
  try{const r=await fetch('https://api.github.com/repos/tim-jejak/jejakcommuter/releases/latest',{headers:{Accept:'application/vnd.github+json'}});if(!r.ok)return;const j=await r.json();
    const n=+((j.tag_name||'').replace(/^apk-/,''))||0,as=(j.assets||[]).find(x=>/\.apk$/i.test(x.name));if(!as||n<=cur)return;
    let skip=0;try{skip=+localStorage.getItem('jc_upd_skip')||0;}catch(e){}if(skip===n)return;
    const b=document.createElement('div');b.id='updBar';b.setAttribute('role','alert');
    b.style.cssText='position:fixed;left:10px;right:10px;top:max(10px,var(--sat,env(safe-area-inset-top,0px)));z-index:99999;background:#1F5FB5;color:#fff;border-radius:14px;padding:12px 14px;box-shadow:0 6px 24px rgba(0,0,0,.45);display:grid;gap:8px;font:600 14px/1.35 system-ui,sans-serif';
    b.innerHTML='<div><b>Terdapat pembaruan versi.</b><br><span style="font-weight:500;opacity:.9">Lakukan pembaruan untuk mendapat perbaikan dan fitur terbaru.</span></div><div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" id="updNo" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.6);border-radius:10px;padding:8px 12px;font:600 13px system-ui">Nanti</button><button type="button" id="updGo" style="background:#fff;color:#1F5FB5;border:none;border-radius:10px;padding:8px 14px;font:700 13px system-ui">Perbarui</button></div>';
    document.body.appendChild(b);
    $('#updNo').onclick=()=>{try{localStorage.setItem('jc_upd_skip',String(n));}catch(e){}b.remove();};
    $('#updGo').onclick=()=>{b.remove();const u=as.browser_download_url;let ok=false;try{const B=C.registerPlugin('Browser');B.open({url:u});ok=true;}catch(e){}if(!ok)location.href=u;};
  }catch(e){}}
setTimeout(chkUpd,3000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(chkUpd,1500);});
onMinute(true);requestAnimationFrame(frame);
window.__jc={valhalla,setPoint,S,locate,draw,plan,startNav,stopNav,NAV,clearRoute,applyFix,map,LINES,ST,dijk,MASKS,stationsNear,legsFrom,WALKADJ,POS,NS};
