(function(){
'use strict';
var $=function(s){return document.querySelector(s);};
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var LK='jc_look';
var LOOK={app:'auto',map:'app'};
try{Object.assign(LOOK,JSON.parse(localStorage.getItem(LK)||'{}'));}catch(e){}
var mq=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
function appDark(){return LOOK.app==='dark'||(LOOK.app==='auto'&&!!(mq&&mq.matches));}
function mapDarkOn(){return LOOK.map==='dark'||(LOOK.map==='app'&&appDark());}
var maps=[];

/* ---------- tema aplikasi ---------- */
function applyTheme(){
  var r=document.documentElement;
  if(LOOK.app==='auto')r.removeAttribute('data-theme');else r.setAttribute('data-theme',LOOK.app);
  maps.forEach(function(m){darkify(m,mapDarkOn());});
  var d=$('#jprof'); if(d&&!d.hidden)renderProf();
}
function saveLook(){try{localStorage.setItem(LK,JSON.stringify(LOOK));}catch(e){}}
if(mq&&mq.addEventListener)mq.addEventListener('change',function(){if(LOOK.app==='auto'||LOOK.map==='app')applyTheme();});

/* ---------- peta gelap ---------- */
function isBase(m,l){if(l.type==='background')return true;if(!l.source)return false;var s=m.getSource(l.source);return !!s&&s.type==='vector';}
function darkify(m,on){
  try{
    if(!m||!m.getStyle||!m.isStyleLoaded&&!m.getStyle())return;
    var ls=(m.getStyle()||{}).layers||[];
    m.__o=m.__o||{};
    ls.forEach(function(l){
      if(!isBase(m,l))return;
      var set=function(p,v){
        if(on){ if(!(l.id+p in m.__o)){var cur=m.getPaintProperty(l.id,p);m.__o[l.id+p]=cur===undefined?null:cur;} m.setPaintProperty(l.id,p,v); }
        else if(l.id+p in m.__o){ m.setPaintProperty(l.id,p,m.__o[l.id+p]); delete m.__o[l.id+p]; }
      };
      var id=l.id;
      if(l.type==='background')set('background-color','#0e151c');
      else if(l.type==='fill'){ set('fill-color',/water/i.test(id)?'#0a1b2a':'#152029'); }
      else if(l.type==='fill-extrusion')set('fill-extrusion-color','#1e2a35');
      else if(l.type==='line'){ set('line-color',/water/i.test(id)?'#0a1b2a':/casing/i.test(id)?'#0e151c':/boundary/i.test(id)?'#3a4856':'#2d3a46'); }
      else if(l.type==='symbol'&&l.layout&&l.layout['text-field']){ set('text-color','#9fb0bf'); set('text-halo-color','#0e151c'); }
    });
  }catch(e){}
}
function fixMaps(){maps.forEach(function(m){try{m.resize();m.triggerRepaint();}catch(e){}});}
function fixSoon(){[100,500,1200].forEach(function(d){setTimeout(fixMaps,d);});}
document.addEventListener('visibilitychange',function(){if(!document.hidden)fixSoon();});
window.addEventListener('pageshow',fixSoon);window.addEventListener('focus',fixSoon);window.addEventListener('orientationchange',fixSoon);
function trackMap(m){
  maps.push(m);
  try{if(window.ResizeObserver)new ResizeObserver(function(){try{m.resize();}catch(e){}}).observe(m.getContainer());m.getCanvas().addEventListener('webglcontextrestored',function(){m.triggerRepaint();});}catch(e){}
  var go=function(){darkify(m,mapDarkOn());};
  if(m.loaded&&m.loaded())go();else m.once('load',go);
}

/* ---------- ikon ---------- */
var IC={
  map:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/>',
  urgent:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M12 9v6M9 12h6"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  chev:'<path d="M9 5l7 7-7 7"/>',
  bus:'<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M8 21l1-4M16 21l-1-4"/>',
  mosque:'<path d="M5 21V12a7 7 0 0114 0v9M3 21h18M12 3v2"/>',
  store:'<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6"/>',
  fuel:'<path d="M5 21V5a2 2 0 012-2h6a2 2 0 012 2v16M5 21h10M15 9l3 2v6a1.5 1.5 0 003 0v-8l-3-3"/><path d="M7 7h6"/>',
  hosp:'<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/>',
  flame:'<path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',
  badge:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>',
  nav:'<path d="M12 3L5 20l7-4 7 4z"/>',
  sliders:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  palette:'<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="15.5" cy="10" r="1"/>'
};
function ic(n,sz){sz=sz||22;return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>';}

/* ---------- CSS ---------- */
var css=''+
':root{--jnh:calc(60px + env(safe-area-inset-bottom,0px));--jred:#D8262B}'+
'html.jn .acct,html.jn #urgentBtn,html.jn #grpBtn,html.jn #chatBtn{display:none!important}'+
'html.jn #results{bottom:var(--jnh);padding-bottom:0}'+
'html.jn .maplibregl-ctrl-bottom-right{margin-bottom:var(--jnh)}'+
'html.jn #grp,html.jn #urgent{bottom:var(--jnh)}'+
'html.jn #grp{top:0;left:0;right:0;width:100%;height:auto;border:none;border-radius:0;box-shadow:none;transform:none;visibility:hidden;transition:none;z-index:12}'+
'html.jn #grp.open{visibility:visible}'+
'html.jn #grp .ugrip{display:none}'+
'html.jn #grp .uh{padding-top:calc(10px + env(safe-area-inset-top,0px))}'+
'html.jn #grp>*{zoom:1}'+
'html.jn #gBody{padding:16px 16px 28px}'+
'.gem{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;padding:48px 8px 8px}.gem h3{margin:6px 0 0;font-size:20px;text-transform:none;letter-spacing:0;color:var(--fg,inherit)}.gem p{margin:0 0 10px;color:var(--muted,#667);font-size:14px;max-width:280px}.gemi{width:84px;height:84px;border-radius:50%;background:rgba(31,95,181,.12);color:#1F5FB5;display:flex;align-items:center;justify-content:center}'+
'.gbig{width:100%;padding:14px;font-size:15px;border-radius:12px;margin-top:8px}.gem .gbig{max-width:320px;margin-top:0}'+
'html.jn #navbar{z-index:13}'+
'#jnav{position:fixed;left:0;right:0;bottom:0;z-index:13;display:flex;background:var(--surface);border-top:1px solid var(--line);padding-bottom:env(safe-area-inset-bottom,0px);height:var(--jnh)}'+
'#jnav button{flex:1;border:0;background:none;color:var(--ink-2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:11.5px;font-weight:700;margin:6px 4px;border-radius:8px;position:relative}'+
'#jnav button[aria-current="true"]{color:var(--ink);background:var(--surface-2)}'+
'#jnav button.urg{color:var(--jred)}'+
'#jnav button.urg[aria-current="true"]{background:rgba(216,38,43,.12)}'+
'html.chatopen #jnav{visibility:hidden}'+
'@media(min-width:761px){#jnav{left:50%;right:auto;width:min(480px,100%);transform:translateX(-50%);border:1px solid var(--line);border-bottom:0;border-radius:12px 12px 0 0}}'+
'.jsc{position:fixed;left:0;right:0;top:0;bottom:var(--jnh);z-index:12;background:var(--bg);color:var(--ink);display:flex;flex-direction:column;padding-top:env(safe-area-inset-top,0px)}'+
'.jsc[hidden]{display:none}'+
'.jsc .jtop{display:flex;align-items:center;gap:6px;min-height:52px;padding:0 8px;flex:none}'+
'.jsc .jtop h2{margin:0;font-size:17px;font-weight:800;flex:1;min-width:0}'+
'.jib{width:44px;height:44px;border:0;background:none;color:var(--ink);display:flex;align-items:center;justify-content:center;border-radius:8px;flex:none}'+
'.jscr{flex:1;min-height:0;overflow-y:auto;padding:10px 16px 16px}'+
'.jcrd{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:4px 14px;margin-bottom:12px}'+
'.jrow{display:flex;align-items:center;gap:12px;width:100%;border:0;border-bottom:1px solid var(--line);background:none;color:var(--ink);padding:14px 0;font-size:15px;font-weight:700;text-align:left}'+
'.jrow:last-child{border-bottom:0}'+
'.jrow .g{flex:1;min-width:0}'+
'.jrow .v{color:var(--ink-2);font-size:13px;font-weight:600}'+
'.jhd{display:flex;align-items:center;gap:14px;padding:6px 0 16px}'+
'.jav{width:56px;height:56px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;flex:none}'+
'.jseg{display:flex;gap:6px;margin:6px 0 14px}'+
'.jseg button{flex:1;min-height:44px;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:8px;font-weight:700;font-size:14px;padding:0 4px}'+
'.jseg button[aria-pressed="true"]{background:var(--btn);color:var(--btn-ink);border-color:var(--btn)}'+
'.jlbl{font-size:12px;font-weight:800;color:var(--ink-2);letter-spacing:.05em;text-transform:uppercase;margin:6px 0}'+
'.jug{display:flex;align-items:center;gap:14px;width:100%;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:13px 14px;margin-bottom:8px;color:var(--ink);text-align:left;font-size:15px;font-weight:700}'+
'.jug .ui2{width:42px;height:42px;border-radius:9px;background:rgba(216,38,43,.12);color:var(--jred);display:flex;align-items:center;justify-content:center;flex:none}'+
'.jug .t{flex:1}'+
'.jemg{flex:none;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px 16px 14px}'+
'.jemg a{display:flex;flex-direction:column;align-items:center;gap:5px;background:var(--jred);color:#fff;border-radius:10px;padding:13px 4px;font-weight:800;font-size:13px;text-decoration:none}'+
'.jemg a small{font-size:12px;font-weight:700;opacity:.92}'+
'.jmap{position:relative;flex:none;width:100%;height:min(46vh,340px);background:var(--surface-2);overflow:hidden}'+
'.jrcb{position:absolute;left:8px;bottom:8px;z-index:3;width:40px;height:40px;border-radius:50%;border:0;background:var(--surface);color:var(--ink);box-shadow:0 1px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center}'+
'.jsc.unav .jmap{flex:1 1 auto;height:auto}.jsc.unav #jlist{display:none}.jme.red{background:#D8262B;box-shadow:0 0 0 8px rgba(216,38,43,.28)}'+
'.jmap .rad{position:absolute;right:8px;bottom:8px;z-index:3;background:var(--surface);color:var(--ink-2);font-weight:800;font-size:11.5px;padding:3px 8px;border-radius:5px}'+
'.jpin{width:30px;height:30px;border-radius:50%;border:2px solid #fff;background:var(--btn);color:var(--btn-ink);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.35)}'+
'.jpin.sel{background:var(--jred);color:#fff;width:38px;height:38px;position:relative;animation:jblk 1s ease-in-out infinite}'+
'.jpin.sel::after{content:"";position:absolute;inset:-9px;border-radius:50%;border:3px solid var(--jred);opacity:.6;animation:jblk 1s ease-in-out infinite}'+
'@keyframes jblk{0%,100%{opacity:1;filter:brightness(1.15)}50%{opacity:.3;filter:brightness(.55)}}'+
'.jme{width:18px;height:18px;border-radius:50%;background:#3B6FE8;border:3px solid #fff;box-shadow:0 0 0 8px rgba(59,111,232,.22)}'+
'.jgb{display:flex;align-items:center;gap:10px;background:var(--jred);color:#fff;padding:8px 12px;font-weight:800;font-size:13.5px;flex:none}'+
'.jgb span{flex:1;min-width:0}'+
'.jgb button{background:none;border:1px solid #fff;color:#fff;border-radius:8px;padding:5px 12px;font-weight:800}'+
'.jpl{display:flex;align-items:center;gap:10px;width:100%;border:0;border-bottom:1px solid var(--line);background:none;color:var(--ink);padding:12px 16px;text-align:left;font-size:14.5px;font-weight:700}'+
'.jpl .t{flex:1;min-width:0}'+
'.jpl small{display:block;color:var(--ink-2);font-weight:600;font-size:12px}'+
'.jpl .d{font-weight:800;font-size:13.5px;white-space:nowrap}'+
'.jpl[aria-pressed="true"]{background:rgba(216,38,43,.1)}'+
'.jbd{font-size:11px;font-weight:800;color:#fff;border-radius:4px;padding:2px 6px;flex:none}'+
'.jact{display:flex;gap:8px;padding:0 16px 12px;background:rgba(216,38,43,.1)}'+
'.jact button{display:inline-flex;align-items:center;justify-content:center;gap:8px;line-height:1;flex:1;min-height:44px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-weight:800;font-size:14px}'+
'.jact button.p{background:var(--jred);border-color:var(--jred);color:#fff}'+
'.jempty{padding:28px 16px;text-align:center;color:var(--ink-2);font-weight:600}'+
'.jtoast{position:fixed;left:50%;bottom:calc(var(--jnh) + 70px);transform:translateX(-50%);z-index:30;background:#14202B;color:#fff;padding:10px 16px;border-radius:10px;font-size:14px;max-width:90%}'+
'.jact button svg{display:block;flex:none}'+
'.jsc .jtop,.jsc .jscr,.jsc .jemg,.jsc .jgb,#jlist,#jchat>*{zoom:var(--uz,1)}'+
'#chSet,#chOpt{display:none!important}'+
'*{-webkit-tap-highlight-color:transparent}button:focus:not(:focus-visible),a:focus:not(:focus-visible),[role=button]:focus:not(:focus-visible){outline:none}'+
'.sw.cus{background:conic-gradient(#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)}.cpick{flex:1 0 100%;display:grid;gap:8px;padding:6px 0 2px}.cpg{display:grid;grid-template-columns:repeat(12,1fr);gap:4px}.cpc{aspect-ratio:1;border-radius:6px;border:1px solid rgba(128,128,128,.4);padding:0;min-width:0}'+
'.gcode{display:flex;align-items:center;gap:10px;margin:8px 0;padding:10px 14px;border:1px dashed var(--line);border-radius:12px;cursor:pointer}.gcode small{color:var(--ink-2);font-weight:700}.gcode b{flex:1;font-size:22px;letter-spacing:.14em;font-weight:800}.gcode span{font-weight:800;font-size:13px;color:#1F5FB5}'+
'html.tchat #search,html.tchat #row2,html.tchat #results,html.tchat #chips,html.tchat #layers,html.tchat #banner,html.tchat #navbar,html.tchat #nvCenter,html.tchat .maplibregl-ctrl-bottom-right,html.tchat .maplibregl-ctrl-top-right,html.tchat #rhandle{visibility:hidden!important}'+
'.jsc#jchat{background:color-mix(in srgb,var(--surface) calc(var(--jco,1)*100%),transparent)}'+
'#jtune{position:fixed;z-index:40;height:64px;display:flex;align-items:center;justify-content:center;background:var(--surface);border:1px solid var(--line);border-radius:14px;box-shadow:0 4px 16px rgba(0,0,0,.28);opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .18s,transform .18s}'+
'#jtune.on{opacity:1;transform:none}'+
'#jtune .tin{width:calc(100% - 28px);display:grid;gap:6px}#jtune .tl{display:flex;justify-content:space-between;align-items:baseline;font-size:12px;font-weight:800;color:var(--ink-2)}#jtune .tl b{color:var(--ink);font-size:13px;font-variant-numeric:tabular-nums}'+
'#jtune .trk{position:relative;height:26px}#jtune .trk::before{content:"";position:absolute;left:0;right:0;top:50%;height:6px;margin-top:-3px;border-radius:3px;background:var(--line)}'+
'#jtune .fill{position:absolute;left:0;top:50%;height:6px;margin-top:-3px;border-radius:3px;background:var(--jacc,#1F5FB5)}#jtune .thumb{position:absolute;top:50%;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;background:var(--surface);border:3px solid var(--jacc,#1F5FB5);box-shadow:0 1px 4px rgba(0,0,0,.3)}'+
'#jnav button[data-t=chat]{touch-action:none;-webkit-touch-callout:none;user-select:none;-webkit-user-select:none}#jnav .hold{position:absolute;left:14%;right:14%;bottom:3px;height:3px;border-radius:2px;background:var(--jacc,#1F5FB5);transform:scaleX(0);transform-origin:left}#jnav button.holding .hold{transform:scaleX(1);transition:transform 2s linear}'+
'.jfld{width:100%;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:8px;min-height:44px;padding:0 12px}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ---------- kerangka ---------- */
var nav=document.createElement('nav');nav.id='jnav';nav.setAttribute('aria-label','Menu utama');
nav.innerHTML=[['peta','map','Peta'],['chat','chat','Chat'],['urgent','urgent','Urgent'],['profil','user','Profil']].map(function(x){return '<button type="button" data-t="'+x[0]+'"'+(x[0]==='urgent'?' class="urg"':'')+' aria-current="'+(x[0]==='peta')+'">'+ic(x[1])+x[2]+'</button>';}).join('');
document.body.appendChild(nav);
function mk(id){var d=document.createElement('div');d.id=id;d.className='jsc';d.hidden=true;document.body.appendChild(d);return d;}
var vProf=mk('jprof'),vTamp=mk('jtamp'),vUrg=mk('jurg'),vUgo=mk('jugo'),vChat=mk('jchat');
var toastT=null;
function toast(t){var e=$('.jtoast');if(e)e.remove();e=document.createElement('div');e.className='jtoast';e.textContent=t;document.body.appendChild(e);clearTimeout(toastT);toastT=setTimeout(function(){e.remove();},Math.max(2800,t.length*90));}
document.documentElement.classList.add('jn');

var TAB='peta';
var HD=0,exitArm=0;
function guardPush(){if(HD===0){try{history.pushState({jc:1},'');HD=1;}catch(e){}}}
window.__sysCopy=function(){var m=/Android (\d+)/.exec(navigator.userAgent||'');return isNative()&&m&&+m[1]>=13;};
function isNative(){var C=window.Capacitor;return !!(C&&C.isNativePlatform&&C.isNativePlatform());}
function onBack(){
  if(window.__jtemanBack&&window.__jtemanBack())return 'ok';
  var grp=document.getElementById('grp');
  if(grp&&grp.classList.contains('open')){var gc=document.getElementById('gClose');if(gc)gc.click();return 'ok';}
  if(!vUgo.hidden){var b=vUgo.querySelector('[data-a=back]');if(b)b.click();return 'ok';}
  if(!vTamp.hidden){var b2=vTamp.querySelector('[data-a=back]');if(b2)b2.click();return 'ok';}
  if(TAB!=='peta'){setTab('peta');return 'ok';}
  var J=window.__jc,sh=document.getElementById('sheet'),did=false;
  if(sh&&!sh.hidden){sh.hidden=true;did=true;}
  if(J){var S=J.S;if((J.NAV&&J.NAV.on)||S.from||S.to||S.focus||(S.opts&&S.opts.length)){try{J.clearRoute();}catch(e){}did=true;}}
  return did?'ok':'exit';
}
window.addEventListener('popstate',function(){
  HD=0;
  var r=onBack();
  if(r==='ok'){exitArm=0;guardPush();return;}
  if(isNative()){toast('Tekan sekali lagi untuk keluar');setTimeout(guardPush,2000);}
  else{try{history.back();}catch(e){}}
});
setTimeout(guardPush,300);
document.addEventListener('pointerdown',guardPush,true);
(function(){var A=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App,t=0;
  if(!A||!A.addListener)return;
  A.addListener('backButton',function(){
    var r=onBack();if(r==='ok'){t=0;return;}
    var n=Date.now();if(n-t<2000){try{A.exitApp();}catch(e){}return;}
    t=n;toast('Tekan sekali lagi untuk keluar');});
})();
var cfT=null,cfLast=null;
function chatFollow(on){clearInterval(cfT);cfT=null;cfLast=null;if(!on)return;var J=window.__jc;if(!J||!J.map)return;var n=0;
  function step(){if(TAB!=='chat')return;if(!(J.NAV&&J.NAV.on)){var g=J.S.gps;if(g&&(!cfLast||hav(cfLast,g)>4)){cfLast={lat:g.lat,lon:g.lon};J.map.easeTo({center:[g.lon,g.lat],zoom:Math.max(J.map.getZoom(),16),duration:900});}}
    if(n++%10===0&&J.locate)J.locate(function(){});}
  step();cfT=setInterval(step,1000);}
function setTab(t){
  TAB=t;document.documentElement.classList.toggle('tchat',t==='chat');document.documentElement.dataset.tab=t;
  nav.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-current',String(b.dataset.t===t));});
  [vProf,vTamp,vUrg,vUgo,vChat].forEach(function(v){v.hidden=true;});
  stopUgo();chatFollow(t==='chat');
  var grp=$('#grp');
  if(grp&&grp.classList.contains('open')&&window.__closeGrp&&(t!=='chat'||window.__jchat))window.__closeGrp();
  if(window.__closeUrgent&&window.__jc&&window.__jc.S.urgentOn)window.__closeUrgent();
  if(t==='chat'){try{if(!localStorage.getItem('jc_tune_hint')){localStorage.setItem('jc_tune_hint','1');setTimeout(function(){toast('Tahan menu Chat 2 detik untuk atur transparan');},600);}}catch(e){}if(window.__jchat){vChat.hidden=false;window.__jchat.mount(vChat);window.__jchat.show();}else if(grp&&!grp.classList.contains('open')){var b=$('#grpBtn');if(b)b.click();}}
  else if(t==='profil'){renderProf();vProf.hidden=false;}
  else if(t==='urgent'){renderUrg();vUrg.hidden=false;}
}
nav.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(window.__tuneSwallow){window.__tuneSwallow=false;return;}setTab(b.dataset.t);});
/* ---------- transparansi chat: tahan menu Chat 3 detik, lalu geser ---------- */
var OPK='jc_chat_op',OPMIN=.2;
function getOp(){try{var v=parseFloat(localStorage.getItem(OPK));return v>=OPMIN&&v<=1?v:1;}catch(e){return 1;}}
function applyOp(v){var r=document.documentElement;r.style.setProperty('--jco',String(v));var c=document.getElementById('chat');if(c)c.style.setProperty('--co',String(v));}
function setOp(v,save){v=Math.max(OPMIN,Math.min(1,v));applyOp(v);if(save){try{localStorage.setItem(OPK,String(v));}catch(e){}}return v;}
window.__jcOp=getOp;applyOp(getOp());
var tune=document.createElement('div');tune.id='jtune';tune.innerHTML='<div class="tin"><div class="tl"><span>Transparan</span><b id="jtp"></b><span>Pekat</span></div><div class="trk"><div class="fill" id="jtf"></div><div class="thumb" id="jtt"></div></div></div>';document.body.appendChild(tune);
var tb=nav.querySelector('[data-t=chat]');tb.insertAdjacentHTML('beforeend','<span class="hold" id="jhold"></span>');
var tOn=false,tHold=null,tIdle=null,tPtr=null,tSx=0,tSl=1,tLx=0,tLb=0,tRb=1,tLv=1;
function tPaint(){var r=(tLv-OPMIN)/(1-OPMIN);$('#jtf').style.width=r*100+'%';$('#jtt').style.left=r*100+'%';$('#jtp').textContent=Math.round((1-tLv)*100)+'%';}
function tEnd(){clearTimeout(tHold);tb.classList.remove('holding');}
function tOpen(){tOn=true;var n=nav.getBoundingClientRect();tune.style.left=(n.left+n.width*.1)+'px';tune.style.width=(n.width*.8)+'px';tune.style.bottom=(window.innerHeight-n.top+10)+'px';tune.classList.add('on');
  tLb=n.left+n.width*.1;tRb=n.left+n.width*.9;tLv=getOp();tSx=tLx;tSl=tLv;tPaint();if(TAB!=='chat')setTab('chat');try{navigator.vibrate&&navigator.vibrate(25);}catch(e){}}
function tClose(){if(!tOn)return;tOn=false;tune.classList.remove('on');setOp(tLv,true);}
tb.addEventListener('pointerdown',function(e){window.__tuneSwallow=false;tPtr=e.pointerId;try{tb.setPointerCapture(e.pointerId);}catch(_){}tSx=e.clientX;tLx=e.clientX;clearTimeout(tIdle);
  if(tOn){tSl=tLv;return;}
  tb.classList.remove('holding');void tb.offsetWidth;tb.classList.add('holding');
  tHold=setTimeout(function(){tEnd();window.__tuneSwallow=true;tOpen();},2000);});
tb.addEventListener('pointermove',function(e){tLx=e.clientX;if(!tOn||e.pointerId!==tPtr)return;
  var dx=e.clientX-tSx,r;if(dx<0){r=Math.min(1,-dx/Math.max(40,tSx-tLb));tLv=tSl-r*(tSl-OPMIN);}else{r=Math.min(1,dx/Math.max(40,tRb-tSx));tLv=tSl+r*(1-tSl);}
  setOp(tLv,false);tPaint();});
['pointerup','pointercancel'].forEach(function(n){tb.addEventListener(n,function(e){if(e.pointerId!==tPtr)return;tPtr=null;tEnd();if(tOn){setOp(tLv,true);clearTimeout(tIdle);tIdle=setTimeout(tClose,1000);}});});
tb.addEventListener('contextmenu',function(e){e.preventDefault();});
(function(){var g=$('#grp');if(!g)return;new MutationObserver(function(){if(TAB==='grup'&&!g.classList.contains('open'))setTab('chat');else if(TAB==='chat'&&!window.__jchat&&!g.classList.contains('open'))setTab('peta');}).observe(g,{attributes:true,attributeFilter:['class']});})();

/* ---------- Profil ---------- */
function seg(key,opts,cur){return '<div class="jseg">'+opts.map(function(o){return '<button type="button" data-k="'+key+'" data-v="'+o[0]+'" aria-pressed="'+(cur===o[0])+'">'+o[1]+'</button>';}).join('')+'</div>';}
var pfHome=null;
function renderProf(){
  var name='',col='#1F5FB5';
  try{name=JSON.parse(localStorage.getItem('jc_name')||'""')||'';var c=JSON.parse(localStorage.getItem('jc_color')||'null');if(c)col=c;}catch(e){}
  var ini=(name||'J').trim().charAt(0).toUpperCase();
  var lum=function(h){var n=parseInt(h.slice(1),16);return (.2126*(n>>16&255)+.7152*(n>>8&255)+.0722*(n&255))/255;};
  var pm=document.getElementById('pfMount');
  var keep=pm&&pm.parentNode&&pm.closest('#jprof');
  vProf.innerHTML='<div class="jscr" style="padding-top:12px"><div class="jhd"><div class="jav" style="background:'+col+';color:'+(lum(col)<.4?'#fff':'#14202B')+'">'+esc(ini)+'</div><div style="font-size:18px;font-weight:800">'+esc(name||'Jecom')+'</div></div>'+
  '<div class="jcrd" id="jpfbox" style="padding:12px 14px"></div>'+
  '<div class="jlbl">Teman</div><div class="jcrd" id="jteman" style="padding:0 14px"></div>'+
  '<div class="jlbl">Akun</div><div class="jcrd" id="jacct">'+(window.__jchat?window.__jchat.acct():'')+'</div>'+
  '<div class="jlbl">Pengaturan</div><div class="jcrd">'+
  '<button class="jrow" data-a="tamp">'+ic('sliders')+'<span class="g">Tampilan</span>'+ic('chev',18)+'</button>'+
  '<button class="jrow" data-a="about">'+ic('info')+'<span class="g">Tentang</span>'+ic('chev',18)+'</button></div></div>';
  var box=vProf.querySelector('#jpfbox');
  if(pm){box.appendChild(pm);pm.hidden=false;}
  var jt=vProf.querySelector('#jteman');if(jt&&window.__jteman)window.__jteman.mount(jt);
}
vProf.addEventListener('click',function(e){
  var b=e.target.closest('[data-a]');if(!b)return;
  if(b.dataset.a==='tamp'){renderTamp();vProf.hidden=true;vTamp.hidden=false;}
  else if(b.dataset.a==='about'){var a=$('#about');if(a)a.hidden=false;}
});
function renderTamp(){
  var ui='1';try{ui=String(+localStorage.getItem('jc_ui')||1);}catch(e){}
  var th='dark',op=85;try{var c=JSON.parse(localStorage.getItem('jc_chat_v1')||'{}');th=c.th||'dark';op=c.op||85;}catch(e){}
  vTamp.innerHTML='<div class="jtop"><button class="jib" data-a="back" aria-label="Kembali">'+ic('back')+'</button><h2>Tampilan</h2></div><div class="jscr">'+
  '<div class="jlbl">Tampilan aplikasi</div>'+seg('app',[['light','Terang'],['dark','Gelap'],['auto','Ikuti HP']],LOOK.app)+
  '<div class="jlbl">Tampilan peta</div>'+seg('map',[['light','Putih'],['dark','Gelap'],['app','Ikuti aplikasi']],LOOK.map)+
  '<div class="jlbl">Transparan chat</div><div style="display:flex;align-items:center;gap:12px;margin:0 0 14px"><input type="range" id="jop" min="20" max="100" step="5" value="'+Math.round(getOp()*100)+'" style="flex:1"><span style="font-weight:800;font-size:13px;min-width:38px;text-align:right">'+Math.round((1-getOp())*100)+'%</span></div>'+
  '<div class="jlbl">Ukuran tampilan</div>'+seg('ui',[['1','Kecil'],['2','Sedang'],['3','Besar']],ui)+'</div>';
}
vTamp.addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  if(b.dataset.a==='back'){vTamp.hidden=true;renderProf();vProf.hidden=false;return;}
  var k=b.dataset.k,v=b.dataset.v;if(!k)return;
  if(k==='app'){LOOK.app=v;saveLook();applyTheme();}
  else if(k==='map'){LOOK.map=v;saveLook();applyTheme();}
  else if(k==='cth'){var t=document.querySelector('#chTh [data-th="'+v+'"]');if(t)t.click();}
  else if(k==='ui'){var u=document.querySelector('#uiSize [data-u="'+v+'"]');if(u)u.click();}
  renderTamp();
});
vTamp.addEventListener('input',function(e){
  if(e.target.id==='jop'){var v=setOp(e.target.value/100,true);var sp=e.target.nextElementSibling;if(sp)sp.textContent=Math.round((1-v)*100)+'%';}
});

/* ---------- Urgent ---------- */
var UC=[['transum','Transum terdekat','bus'],['masjid','Masjid','mosque'],['mm','Minimarket','store'],['spbu','SPBU','fuel'],['rs','Rumah sakit','hosp']];
function renderUrg(){
  vUrg.innerHTML='<div class="jscr" style="padding-top:14px">'+UC.map(function(c){return '<button type="button" class="jug" data-c="'+c[0]+'"><span class="ui2">'+ic(c[2])+'</span><span class="t">'+c[1]+'</span>'+ic('chev',18)+'</button>';}).join('')+'</div>'+
  '<div class="jemg">'+[['badge','Polisi','110'],['hosp','Ambulans','119'],['flame','Pemadam','113']].map(function(x){return '<a href="tel:'+x[2]+'" aria-label="Telepon '+x[1]+'">'+ic(x[0],24)+x[1]+'<small>'+x[2]+'</small></a>';}).join('')+'</div>';
}
vUrg.addEventListener('click',function(e){var b=e.target.closest('.jug');if(!b)return;openUgo(b.dataset.c);});

var U={c:null,pos:null,shown:null,pick:null,guide:false,route:null,map:null,mks:[],me:null,tmr:null,items:[],busy:0};
function hav(a,b){var R=6371000,p1=a.lat*Math.PI/180,p2=b.lat*Math.PI/180,dl=(b.lon-a.lon)*Math.PI/180,dp=p2-p1;var h=Math.sin(dp/2)*Math.sin(dp/2)+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)*Math.sin(dl/2);return 2*R*Math.asin(Math.sqrt(h));}
function fdist(m){return m<1000?Math.max(10,Math.round(m/10)*10)+' m':(Math.round(m/100)/10).toString().replace('.',',')+' km';}
function wmin(m){return Math.max(1,Math.round(m*1.25/75));}
function curPos(){var J=window.__jc;return J&&J.S.gps?{lat:J.S.gps.lat,lon:J.S.gps.lon}:null;}
function loadPOI(){
  if(window.__POI)return Promise.resolve(window.__POI);
  if(U._pp)return U._pp;
  var urls=['poi.js','https://tim-jejak.github.io/jejakcommuter/poi.js'];
  U._pp=new Promise(function(res){(function t(i){if(i>=urls.length){U._pp=null;return res(null);}var s=document.createElement('script');s.src=urls[i];s.onload=function(){res(window.__POI||null);};s.onerror=function(){t(i+1);};document.head.appendChild(s);})(0);});
  return U._pp;
}
async function fetchRS(p){
  var key='jc_rs_'+p.lat.toFixed(2)+'_'+p.lon.toFixed(2),c=null;
  try{c=JSON.parse(localStorage.getItem(key)||'null');}catch(e){}
  if(c&&Date.now()-c.t<14*864e5)return c.d;
  var q='[out:json][timeout:25];nwr[amenity=hospital](around:3000,'+p.lat+','+p.lon+');out center 60;';
  var ctl=new AbortController(),to=setTimeout(function(){ctl.abort();},20000);
  try{
    var r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:'data='+encodeURIComponent(q),headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:ctl.signal});
    var j=await r.json();clearTimeout(to);
    var d=(j.elements||[]).map(function(e){return [e.lat||(e.center&&e.center.lat),e.lon||(e.center&&e.center.lon),(e.tags&&(e.tags.name||e.tags.operator))||'Rumah sakit',''];}).filter(function(x){return x[0];});
    try{localStorage.setItem(key,JSON.stringify({t:Date.now(),d:d}));}catch(e){}
    return d;
  }catch(e){clearTimeout(to);return c?c.d:[];}
}
async function dataFor(c,p){
  var J=window.__jc;
  if(c==='transum'){
    var t=Math.floor(J.S.t||0);
    return J.ST.map(function(s){var li=[...s.lines][0],L=J.LINES[li]||{};return {lat:s.lat,lon:s.lon,name:(s.g==='tj'?'Halte ':'Stasiun ')+s.name,tag:L.label||'',col:L.col||'#555'};});
  }
  if(c==='rs'){var P=await loadPOI();var arr=(P&&P.rs)?P.rs:await fetchRS(p);return arr.map(function(r){return {lat:r[0],lon:r[1],name:r[2]};});}
  var P2=await loadPOI();var arr2=(P2&&P2[c])||[];return arr2.map(function(r){return {lat:r[0],lon:r[1],name:r[2]};});
}
function ucat(c){return UC.filter(function(x){return x[0]===c;})[0];}
function nearby(p){
  return U.all.map(function(x,i){return {i:i,name:x.name,lat:x.lat,lon:x.lon,tag:x.tag,col:x.col,d:hav(p,x)};}).filter(function(x){return x.d<=2000;}).sort(function(a,b){return a.d-b.d;}).slice(0,30);
}
async function openUgo(c){
  U.c=c;U.fit=true;U.pick=null;U.guide=false;U.route=null;U.pos=null;U.shown=null;U.all=null;U.items=[];stopPulse();
  var cat=ucat(c);
  vUrg.hidden=true;vUgo.hidden=false;
  vUgo.innerHTML='<div class="jtop"><button class="jib" data-a="back" aria-label="Kembali">'+ic('back')+'</button><h2>'+cat[1]+'</h2></div><div id="jgb"></div><div class="jmap"><div id="jmapc" style="position:absolute;inset:0"></div><button type="button" class="jrcb" data-a="rc" aria-label="Lokasi saya">'+ic('nav',18)+'</button><span class="rad">2 km</span></div><div class="jscr" id="jlist" style="padding:0"></div>';
  var el=$('#jmapc');
  if(window.maplibregl){
    var J=window.__jc;
    U.map=new maplibregl.Map({container:el,style:'https://tiles.openfreemap.org/styles/liberty',center:[106.86,-6.22],zoom:12,interactive:true,dragRotate:false,pitchWithRotate:false,touchPitch:false,attributionControl:false,fadeDuration:0,pixelRatio:Math.min(window.devicePixelRatio||1,1.5)});
    trackMap(U.map);
    U.map.on('dragstart',function(){if(U.nav)U.follow=false;});
    U.map.on('load',function(){
      U.map.addSource('jr',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
      U.map.addSource('jc2',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
      U.map.addLayer({id:'jc2l',type:'line',source:'jc2',paint:{'line-color':'#6b7a89','line-width':1.5,'line-dasharray':[2,2]}});
      U.map.addLayer({id:'jrc',type:'line',source:'jr',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#fff','line-width':9,'line-opacity':.9}});
      U.map.addLayer({id:'jrl',type:'line',source:'jr',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#D8262B','line-width':5.5}});
      U.ready=true;drawUgo();
    });
  }
  $('#jlist').innerHTML='<div class="jempty">Mencari lokasi</div>';
  var J2=window.__jc;
  if(!curPos()&&J2&&J2.locate)J2.locate(function(){});
  var tries=0;
  (function waitPos(){
    if(TAB!=='urgent'||vUgo.hidden||U.c!==c)return;
    var p=curPos();
    if(!p){if(++tries>40){$('#jlist').innerHTML='<div class="jempty">Aktifkan izin lokasi lalu buka lagi</div>';return;}setTimeout(waitPos,500);return;}
    dataFor(c,p).then(function(all){if(U.c!==c)return;U.all=all;U.pos=p;U.shown=p;U.items=nearby(p);drawUgo();});
    U.tmr=setInterval(tick,10000);
  })();
}
function stopUgo(){stopUNav();stopPulse();U.revealing=false;clearInterval(U.tmr);U.tmr=null;if(U.map){try{maps.splice(maps.indexOf(U.map),1);U.map.remove();}catch(e){}U.map=null;U.ready=false;}U.mks=[];U.me=null;U.c=null;}
async function tick(){
  if(!U.all||vUgo.hidden)return;
  var p=curPos();if(!p||!U.shown)return;
  if(hav(p,U.shown)<20)return;
  U.shown=p;U.items=nearby(p);
  if(U.guide&&U.pick!==null&&!U.nav){var t=U.items.filter(function(x){return x.i===U.pick;})[0];if(t){if(t.d<30){U.guide=false;U.route=null;toast('Kamu sudah sampai');}else fetchRoute(t);}}
  drawUgo();
}
async function fetchRoute(t){
  var J=window.__jc,p=U.shown,seq=++U.busy;
  try{var v=await J.valhalla(p,{lat:t.lat,lon:t.lon},'pedestrian');if(seq===U.busy&&v&&v.coords&&v.coords.length){var first=!U.route;U.route=v.coords;if(first){if(!U.nav)U.needFit=true;U.needReveal=true;}drawUgo();}}catch(e){}
}
function zoomFor(lat){var m=U.map.getContainer();var px=Math.min(m.clientWidth,m.clientHeight)/2-8;if(px<40)px=100;return Math.log2(156543.03*Math.cos(lat*Math.PI/180)*px/2000);}
function circle(p){var pts=[];for(var i=0;i<=64;i++){var a=i/64*2*Math.PI;pts.push([p.lon+2000*Math.sin(a)/(111320*Math.cos(p.lat*Math.PI/180)),p.lat+2000*Math.cos(a)/110540]);}return {type:'Feature',geometry:{type:'LineString',coordinates:pts}};}
function setRoute(co){if(!U.map||!U.ready)return;U.map.getSource('jr').setData({type:'FeatureCollection',features:co?[{type:'Feature',geometry:{type:'LineString',coordinates:co}}]:[]});}
function fitRoute(co,p){if(!U.map)return;var b=new maplibregl.LngLatBounds([p.lon,p.lat],[p.lon,p.lat]);co.forEach(function(c){b.extend(c);});U.map.fitBounds(b,{padding:{top:50,bottom:50,left:50,right:50},maxZoom:17.5,duration:800});}
function revealRoute(co){
  var seq=U.rev=(U.rev||0)+1,cum=[0],i;
  for(i=1;i<co.length;i++)cum.push(cum[i-1]+Math.hypot(co[i][0]-co[i-1][0],(co[i][1]-co[i-1][1])));
  var tot=cum[cum.length-1]||1,t0=performance.now(),D=1100;U.revealing=true;
  (function f(t){
    if(seq!==U.rev||!U.map)return;
    var k=Math.min(1,(t-t0)/D),target=tot*(1-Math.pow(1-k,3)),out=[co[0]],j=1;
    while(j<co.length&&cum[j]<=target){out.push(co[j]);j++;}
    if(j<co.length){var r=(target-cum[j-1])/((cum[j]-cum[j-1])||1);out.push([co[j-1][0]+(co[j][0]-co[j-1][0])*r,co[j-1][1]+(co[j][1]-co[j-1][1])*r]);}
    setRoute(out.length>1?out:null);
    if(k<1)requestAnimationFrame(f);else{U.revealing=false;setRoute(co);}
  })(t0);
}
function mixHex(a,b,k){var pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16),o=0,sh;for(sh=16;sh>=0;sh-=8){var x=(pa>>sh)&255,y=(pb>>sh)&255;o=(o<<8)|Math.round(x+(y-x)*k);}return '#'+('000000'+o.toString(16)).slice(-6);}
function startPulse(){
  if(U.pulseOn)return;U.pulseOn=true;var t0=performance.now();
  (function f(t){
    if(!U.pulseOn||!U.map||!U.ready){U.pulseOn=false;return;}
    var k=(Math.sin((t-t0)/1000*2*Math.PI*.9)+1)/2;
    try{U.map.setPaintProperty('jrl','line-color',mixHex('#6A0E12','#FF5A5F',k));}catch(e){}
    requestAnimationFrame(f);
  })(t0);
}
function stopPulse(){U.pulseOn=false;}

/* ---------- navigasi Urgent (Mulai) ---------- */
function curFix(){var J=window.__jc;if(!J)return null;var f=J.S.fix||J.S.gps;return f?{lat:f.lat,lon:f.lon}:null;}
function projRoute(co,p){
  var k=[Math.cos(p.lat*Math.PI/180)*111320,110540],best=1e12,bi=0,bu=0,bb=0,cum=[0],i,tot=0;
  for(i=1;i<co.length;i++){var sl=Math.hypot((co[i][0]-co[i-1][0])*k[0],(co[i][1]-co[i-1][1])*k[1]);tot+=sl;cum.push(tot);}
  for(i=1;i<co.length;i++){
    var ax=(co[i-1][0]-p.lon)*k[0],ay=(co[i-1][1]-p.lat)*k[1],bx=(co[i][0]-p.lon)*k[0],by=(co[i][1]-p.lat)*k[1],dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy;
    var u=l2?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/l2)):0,d=Math.hypot(ax+u*dx,ay+u*dy);
    if(d<best){best=d;bi=i;bu=u;bb=(Math.atan2(dx,dy)*180/Math.PI+360)%360;}
  }
  var seg=cum[bi]-cum[bi-1]||0,along=cum[bi-1]+bu*seg;
  var pt=[co[bi-1][0]+(co[bi][0]-co[bi-1][0])*bu,co[bi-1][1]+(co[bi][1]-co[bi-1][1])*bu];
  return {d:best,rem:Math.max(0,tot-along),brg:bb,trim:[pt].concat(co.slice(bi))};
}
function uCompassH(a,b,g){if(a==null||b==null||g==null)return null;if(Math.abs(b)<35)return (360-a)%360;var r=Math.PI/180;a*=r;b*=r;g*=r;var cA=Math.cos(a),sA=Math.sin(a),cB=Math.cos(b),sB=Math.sin(b),cG=Math.cos(g),sG=Math.sin(g);var rA=-cA*sG-sA*sB*cG,rB=-sA*sG+cA*sB*cG,h=Math.atan2(rA,rB);if(h<0)h+=2*Math.PI;return h*180/Math.PI;}
function uOri(e){
  if(!U.nav)return;var h=null;
  if(typeof e.webkitCompassHeading==='number')h=e.webkitCompassHeading;
  else if(e.absolute||e.type==='deviceorientationabsolute')h=uCompassH(e.alpha,e.beta,e.gamma);
  if(h==null||isNaN(h))return;
  if(U.hd==null)U.hd=h;else{var d=((h-U.hd+540)%360)-180;U.hd=(U.hd+d*.25+360)%360;}
  var now=performance.now();
  if(U.follow&&U.map&&now-(U.hdT||0)>180){var cur=U.map.getBearing(),dd=Math.abs(((U.hd-cur+540)%360)-180);if(dd>3){U.hdT=now;U.map.easeTo({bearing:U.hd,duration:200,easing:function(x){return x;}});}}
}
async function uCompassOn(){
  if(U.cmp)return;U.cmp=true;U.hd=null;
  try{if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){var pm=await DeviceOrientationEvent.requestPermission();if(pm!=='granted'){U.cmp=false;return;}}}catch(e){}
  window.addEventListener('deviceorientationabsolute',uOri,true);window.addEventListener('deviceorientation',uOri,true);
}
function uCompassOff(){U.cmp=false;U.hd=null;window.removeEventListener('deviceorientationabsolute',uOri,true);window.removeEventListener('deviceorientation',uOri,true);}
function startUNav(){
  var sel=U.items.filter(function(x){return x.i===U.pick;})[0];if(!sel||!U.guide||!U.map)return;
  var J=window.__jc;if(J&&J.locate)J.locate(function(){});
  U.nav=true;U.follow=true;U.off=0;U.rem=sel.d;U.trim=null;U.lastRe=0;
  vUgo.classList.add('unav');uCompassOn();
  try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(function(w){U.wl=w;}).catch(function(){});}catch(e){}
  setTimeout(function(){try{U.map.resize();}catch(e){}uNavTick(true);},120);
  clearInterval(U.nvTmr);U.nvTmr=setInterval(function(){uNavTick(false);},1000);
  drawUgo();
}
function stopUNav(){
  if(!U.nav&&!U.nvTmr)return;
  U.nav=false;clearInterval(U.nvTmr);U.nvTmr=null;uCompassOff();U.trim=null;U.rem=null;
  try{U.wl&&U.wl.release();}catch(e){}U.wl=null;
  vUgo.classList.remove('unav');
  if(U.map){try{U.map.resize();U.map.easeTo({pitch:0,bearing:0,duration:500});}catch(e){}}
}
function uNavTick(first){
  if(!U.nav||!U.map||!U.ready)return;
  var p=curFix(),sel=U.items.filter(function(x){return x.i===U.pick;})[0];if(!p||!sel)return;
  U.shown=p;
  var co=(U.route&&U.route.length>1)?U.route:[[p.lon,p.lat],[sel.lon,sel.lat]],r=projRoute(co,p);
  U.rem=r.rem;U.trim=r.trim;
  if(U.me)U.me.setLngLat([p.lon,p.lat]);
  var g=document.getElementById('jgbt');if(g)g.textContent=sel.name+' · '+fdist(r.rem)+' · '+wmin(r.rem)+' mnt jalan';
  if(!U.revealing)setRoute(r.trim);
  if(r.rem<30&&hav(p,{lat:sel.lat,lon:sel.lon})<40){toast('Kamu sudah sampai');stopUNav();U.guide=false;U.route=null;drawUgo();return;}
  U.off=(U.route&&r.d>50)?U.off+1:0;
  if(U.off>=2&&Date.now()-U.lastRe>8000){U.lastRe=Date.now();U.off=0;toast('Rute diperbarui');U.route=null;U.needReveal=false;fetchRoute({lat:sel.lat,lon:sel.lon});}
  if(U.follow)U.map.easeTo({center:[p.lon,p.lat],zoom:17,bearing:(U.hd!=null?U.hd:r.brg),pitch:50,duration:first?600:900,padding:{top:40,bottom:80,left:0,right:0}});
}
function drawUgo(){
  var cat=ucat(U.c),p=U.shown;if(!cat)return;
  var L=$('#jlist');if(!L)return;
  if(!p){return;}
  var items=U.items,sel=items.filter(function(x){return x.i===U.pick;})[0]||null;
  if(U.pick!==null&&!sel){U.pick=null;U.guide=false;U.route=null;}
  var gb=$('#jgb');
  if(!U.guide&&U.nav)stopUNav();
  gb.innerHTML=(U.guide&&sel)?'<div class="jgb"><span id="jgbt">'+esc(sel.name)+' · '+(U.nav&&U.rem!=null?fdist(U.rem)+' · '+wmin(U.rem):fdist(sel.d)+' · '+wmin(sel.d))+' mnt jalan</span><button type="button" data-a="gend">Selesai</button></div>':'';
  L.innerHTML=items.length?items.map(function(x){
    var on=x.i===U.pick;
    return '<button type="button" class="jpl" data-i="'+x.i+'" aria-pressed="'+on+'">'+(x.tag?'<span class="jbd" style="background:'+esc(x.col)+'">'+esc(x.tag)+'</span>':'')+'<span class="t">'+esc(x.name)+'</span><span class="d">'+fdist(x.d)+'</span></button>'+
    (on?'<div class="jact">'+(!U.guide?'<button type="button" class="p" data-a="guide">'+ic('nav',16)+' Arahkan ke sini</button>':'<button type="button" class="p" data-a="start">'+ic('nav',16)+' Mulai</button><button type="button" data-a="guide">Berhenti arahkan</button>')+'</div>':'');
  }).join(''):'<div class="jempty">Tidak ada dalam 2 km</div>';
  if(!U.map||!U.ready)return;
  var m=U.map;
  if(U.fit){m.jumpTo({center:[p.lon,p.lat],zoom:zoomFor(p.lat)});U.fit=false;}
  m.getSource('jc2').setData({type:'FeatureCollection',features:[circle(p)]});
  if(U.guide&&sel){
    var co=(U.route&&U.route.length>1)?U.route:[[p.lon,p.lat],[sel.lon,sel.lat]];
    if(U.needFit){U.needFit=false;fitRoute(co,p);}
    if(U.needReveal){U.needReveal=false;revealRoute(co);}
    else if(!U.revealing)setRoute(U.nav&&U.trim?U.trim:co);
    startPulse();
  }else{stopPulse();U.revealing=false;setRoute(null);}
  U.mks.forEach(function(k){k.remove();});U.mks=[];
  items.forEach(function(x){
    var e=document.createElement('button');e.type='button';e.className='jpin'+(x.i===U.pick?' sel':'');e.setAttribute('aria-label',x.name);e.innerHTML=ic(cat[2],x.i===U.pick?18:15);e.style.padding='0';e.style.cursor='pointer';
    e.addEventListener('click',function(ev){ev.stopPropagation();stopUNav();U.pick=x.i;U.guide=false;U.route=null;drawUgo();});
    U.mks.push(new maplibregl.Marker({element:e}).setLngLat([x.lon,x.lat]).addTo(m));
  });
  if(!U.me){var me=document.createElement('div');me.className='jme';U.me=new maplibregl.Marker({element:me}).setLngLat([p.lon,p.lat]).addTo(m);}else if(!U.nav)U.me.setLngLat([p.lon,p.lat]);
  U.me.getElement().classList.toggle('red',!!U.guide);
}
vUgo.addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  if(b.dataset.a==='back'){stopUgo();vUgo.hidden=true;renderUrg();vUrg.hidden=false;return;}
  if(b.dataset.a==='gend'){stopUNav();U.guide=false;U.route=null;drawUgo();return;}
  if(b.dataset.a==='start'){startUNav();return;}
  var sel=U.items.filter(function(x){return x.i===U.pick;})[0];
  if(b.dataset.a==='guide'&&sel){if(U.guide)stopUNav();U.guide=!U.guide;U.route=null;if(U.guide){U.needFit=true;fetchRoute(sel);}drawUgo();return;}
  if(b.dataset.a==='rc'){var pp=(U.nav?curFix():null)||U.shown||curPos();if(pp&&U.map){if(U.nav){U.follow=true;U.map.easeTo({center:[pp.lon,pp.lat],zoom:17,pitch:50,bearing:U.hd!=null?U.hd:U.map.getBearing(),duration:500});}else U.map.easeTo({center:[pp.lon,pp.lat],zoom:Math.max(U.map.getZoom(),15.5),duration:500});}return;}
  if(b.dataset.i!==undefined){stopUNav();U.pick=+b.dataset.i;U.guide=false;U.route=null;drawUgo();}
});

/* ---------- mulai ---------- */
function init(){
  applyTheme();
  var ab=$('#about');if(ab){var t=ab.querySelector('#abT');if(t)t.textContent='Tentang';ab.querySelectorAll('h3').forEach(function(h){if(/^(Ukuran tampilan|Profil dan warna)$/.test(h.textContent.trim()))h.hidden=true;});var us=$('#uiSize');if(us)us.hidden=true;}
  var J=window.__jc;
  if(J&&J.map)trackMap(J.map);
}
(function w(n){if(window.__jc&&window.__jc.map)return init();if(n>200){return init();}setTimeout(function(){w(n+1);},100);})(0);
window.__jshell={setTab:setTab,look:LOOK,toast:toast,refreshProf:function(){if(!vProf.hidden)renderProf();},openGrp:function(){var b=$('#grpBtn');if(!b)return;TAB='grup';vChat.hidden=true;b.click();}};
})();
