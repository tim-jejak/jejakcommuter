(function(){
const $=s=>document.querySelector(s),mq=matchMedia('(max-width:760px)');
const R=$('#results'),H=$('#rhandle'),SE=$('#search'),out=$('#out'),sum=$('#sumbar');
const probe=document.createElement('div');probe.style.cssText='position:fixed;left:0;bottom:0;width:0;height:0;padding-bottom:env(safe-area-inset-bottom,0px);visibility:hidden';document.body.appendChild(probe);
let state='peek';
const heights=()=>({peek:Math.round(H.getBoundingClientRect().height+1+(parseFloat(getComputedStyle(probe).paddingBottom)||0)),half:Math.round(innerHeight*.46),full:Math.max(240,Math.round(R.getBoundingClientRect().bottom-Math.max(window.__topH||0,SE.getBoundingClientRect().bottom)-12))});
function setSh(v){R.style.setProperty('--sh',v);document.documentElement.style.setProperty('--shpx',v);}
function setSheet(s){state=s;R.classList.remove('drag');R.dataset.state=s;document.documentElement.dataset.sheet=s;setSh(heights()[s]+'px');}
window.__setSheet=s=>setSheet(s);
function setSearch(m){SE.classList.remove('s-idle','s-open','s-compact');SE.classList.add('s-'+m);if(m==='compact')$('#sumTxt').textContent=($('#inFrom').value||'Asal')+'  \u2192  '+($('#inTo').value||'Tujuan');}
function compact(on){setSearch(on?'compact':'open');}
let gpsAsked=false;
async function autoFrom(){if($('#inFrom').value)return;let st='prompt';try{if(navigator.permissions)st=(await navigator.permissions.query({name:'geolocation'})).state;}catch(_){}
  if(st==='denied')return;if(st==='prompt'&&gpsAsked)return;gpsAsked=true;window.__silentLoc=true;$('#gpsFrom').click();}
$('#gpsFrom').addEventListener('click',e=>{if(e.isTrusted)window.__silentLoc=false;},true);
function openSearch(){setSearch('open');setSheet('peek');autoFrom();setTimeout(()=>{const f=$('#inTo');if(f)f.focus();},60);}
$('#qMain').addEventListener('click',openSearch);
$('#qClose').addEventListener('click',()=>{setSearch(out.querySelector('.opt')?'compact':'idle');});
window.__onPick=()=>{if(mq.matches){setSheet('peek');setSearch('open');}};
let sy=0,sh=0,drag=false,moved=0,lastY=0,lastT=0,vel=0;
H.addEventListener('pointerdown',e=>{if(!mq.matches)return;drag=true;sy=lastY=e.clientY;sh=R.getBoundingClientRect().height;moved=0;lastT=e.timeStamp;vel=0;R.classList.add('drag');try{H.setPointerCapture(e.pointerId);}catch(_){}});
H.addEventListener('pointermove',e=>{if(!drag)return;const h=heights();const nh=Math.max(h.peek,Math.min(h.full,sh+(sy-e.clientY)));setSh(nh+'px');vel=(lastY-e.clientY)/Math.max(1,e.timeStamp-lastT);lastY=e.clientY;lastT=e.timeStamp;moved=Math.max(moved,Math.abs(sy-e.clientY));});
function endDrag(e){if(!drag)return;drag=false;R.classList.remove('drag');const h=heights(),cur=R.getBoundingClientRect().height;
  if(moved<6){setSheet(state==='peek'?'half':'peek');return;}
  const order=['peek','half','full'];let tg;
  const proj=cur+vel*180;tg=order.reduce((a,b)=>Math.abs(h[a]-proj)<Math.abs(h[b]-proj)?a:b);
  setSheet(tg);}
H.addEventListener('pointerup',endDrag);H.addEventListener('pointercancel',endDrag);
window.__mapTap=()=>{if(mq.matches&&out.querySelector('.opt')&&state!=='peek'){setSheet('peek');}if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();};
function dragPanel(U,closeFn,keep){const peekH=()=>Math.round(U.querySelector('.uh').getBoundingClientRect().height+4);
if(keep)window.__urgentPeek=()=>{if(!mq.matches)return;U.style.setProperty('--uhh',peekH()+'px');U.classList.add('pk');};
const UH=U.querySelector('.uh');let d=false,y0=0,h0=0,ly=0,lt=0,v=0,mv=0;
const stops=()=>({lo:Math.round(innerHeight*.38),mid:Math.round(innerHeight*.62),hi:Math.round(innerHeight*.9)});
UH.addEventListener('pointerdown',e=>{if(!mq.matches||e.target.closest('button'))return;d=true;y0=ly=e.clientY;h0=U.getBoundingClientRect().height;lt=e.timeStamp;v=0;mv=0;U.classList.add('drag');try{UH.setPointerCapture(e.pointerId);}catch(_){}});
UH.addEventListener('pointermove',e=>{if(!d)return;const s=stops();const nh=Math.max(keep?peekH():120,Math.min(s.hi,h0+(y0-e.clientY)));U.style.setProperty('--uhh',nh+'px');v=(ly-e.clientY)/Math.max(1,e.timeStamp-lt);ly=e.clientY;lt=e.timeStamp;mv=Math.max(mv,Math.abs(y0-e.clientY));});
function end(){if(!d)return;d=false;U.classList.remove('drag');const s=stops(),cur=U.getBoundingClientRect().height,proj=cur+v*180;
  if(mv<6){return;}
  if(!keep&&proj<s.lo*.6){closeFn();U.style.removeProperty('--uhh');return;}
  const tg=(keep?[peekH(),s.lo,s.mid,s.hi]:[s.lo,s.mid,s.hi]).reduce((a,b)=>Math.abs(a-proj)<Math.abs(b-proj)?a:b);U.style.setProperty('--uhh',tg+'px');U.classList.toggle('pk',!!keep&&tg<=peekH()+2);}
UH.addEventListener('pointerup',end);UH.addEventListener('pointercancel',end);}
window.__clearOut=()=>{out.innerHTML='';};
window.__resetUI=()=>{out.innerHTML='';setSearch('idle');setSheet('peek');};
dragPanel($('#urgent'),()=>window.__closeUrgent&&window.__closeUrgent(),true);dragPanel($('#grp'),()=>window.__closeGrp&&window.__closeGrp());
H.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSheet(state==='peek'?'half':'peek');}});
$('#sumMain').addEventListener('click',()=>setSearch('open'));$('#sumEdit').addEventListener('click',()=>setSearch('open'));
let hadOpt=false;
function titles(){const n=out.querySelectorAll('.opt').length;
  if(n){const f=out.querySelector('.opt.sel .opt-big')||out.querySelector('.opt .opt-big');$('#rtitle').textContent=n+' pilihan rute';$('#rsub').textContent=f?'tercepat/terpilih: '+f.textContent:'';}
  else if(out.querySelector('.status')){$('#rtitle').textContent='Mencari rute\u2026';$('#rsub').textContent='';}
  else if(out.textContent.trim()){$('#rtitle').textContent='Info';$('#rsub').textContent='';}
  else{$('#rtitle').textContent='jejakcommuter';$('#rsub').textContent='Rute tersimpan dan info';}}
new MutationObserver(()=>{const hasOpt=!!out.querySelector('.opt'),nonEmpty=out.textContent.trim().length>0;titles();if(!mq.matches){hadOpt=hasOpt;return;}
  if(hasOpt&&!hadOpt){setSheet('half');compact(true);}
  else if(!hasOpt&&nonEmpty){if(state==='peek')setSheet('half');compact(false);}
  hadOpt=hasOpt;}).observe(out,{childList:true,subtree:true});
function measure(){const nb=$('#navbar'),navOn=document.documentElement.classList.contains('nav')&&nb&&!nb.hidden;const b=navOn?nb.getBoundingClientRect().bottom+6:SE.getBoundingClientRect().bottom;window.__topH=b;const r2=$('#row2');window.__topH2=(mq.matches&&r2)?r2.getBoundingClientRect().bottom:b;document.documentElement.style.setProperty('--topH',b+'px');setSheet(state);}
if(window.ResizeObserver){const ro=new ResizeObserver(measure);ro.observe(SE);ro.observe($('#row2'));ro.observe(H);ro.observe($('#navbar'));}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{measure();});
addEventListener('resize',measure);measure();
const SCALE={1:.85,2:1,3:1.18};
function applyUI(n){n=SCALE[n]?n:1;document.documentElement.style.setProperty('--ui',SCALE[n]);document.documentElement.style.setProperty('--uz',({1:1,2:1.1,3:1.2})[n]);document.documentElement.dataset.ui=String(n);document.querySelectorAll('#uiSize button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.u==n)));try{localStorage.setItem('jc_ui',n);}catch(_){}requestAnimationFrame(()=>requestAnimationFrame(measure));}
document.querySelectorAll('#uiSize button').forEach(b=>b.addEventListener('click',()=>applyUI(b.dataset.u)));
let n0=1;try{n0=+localStorage.getItem('jc_ui')||1;}catch(_){}
applyUI(n0);
new MutationObserver(()=>{const c=$('#accChip'),u=$('#uAcc'),m=(c.textContent||'').match(/±\s*(\d+)/);if(!m){u.hidden=true;return;}const n=+m[1];u.hidden=false;u.textContent='Akurasi lokasi: ±'+n+' m'+(n>100?' (kurang akurat, hasil terdekat bisa meleset)':'');}).observe($('#accChip'),{childList:true,subtree:true,characterData:true});
const bn=$('#banner');
const lay=$('#layers');
function syncMobile(){if(mq.matches){lay.open=false;bn.classList.add('min');}setSheet(state);}
if(mq.addEventListener)mq.addEventListener('change',syncMobile);else mq.addListener(syncMobile);
syncMobile();
document.addEventListener('click',e=>{if(mq.matches&&lay.open&&!lay.contains(e.target))lay.open=false;});$('#bannerMin').addEventListener('click',e=>{e.stopPropagation();bn.classList.add('min');});
bn.addEventListener('click',()=>{if(bn.classList.contains('min'))bn.classList.remove('min');});
document.querySelectorAll('.acct').forEach(b=>b.addEventListener('click',()=>{$('#about').hidden=false;}));$('#abClose').addEventListener('click',()=>{$('#about').hidden=true;});$('#about').addEventListener('click',e=>{if(e.target.id==='about')$('#about').hidden=true;});
})();
