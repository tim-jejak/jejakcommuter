'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const RAD=Math.PI/180;
function hav(a,b){const dLat=(b.lat-a.lat)*RAD,dLon=(b.lon-a.lon)*RAD;const s=Math.sin(dLat/2)**2+Math.cos(a.lat*RAD)*Math.cos(b.lat*RAD)*Math.sin(dLon/2)**2;return 2*6371000*Math.asin(Math.sqrt(s));}
function fmt(min){min=((Math.floor(min)%1440)+1440)%1440;return String(Math.floor(min/60)).padStart(2,'0')+':'+String(min%60).padStart(2,'0');}
const km1=m=>m<1000?(Math.round(m/10)*10)+' m':(m/1000).toFixed(1).replace('.',',')+' km';
const mnt=x=>Math.max(1,Math.round(x))+' mnt';
const hm=m=>{m=Math.max(0,Math.floor(m));return (m>=60?Math.floor(m/60)+' j ':'')+(m%60)+' mnt';};
