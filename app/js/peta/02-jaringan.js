'use strict';
/* ---------- bangun jaringan dari data OSM ---------- */
const NET=window.__NET, LINES=[], ST=[];
const clusterIdx=new Map();
NET.lines.forEach((d,li)=>{
  const ref=d.ref||'';
  let cls=d.mode;
  if(d.mode==='tj'){ cls=/^JAK/i.test(ref)?'mikro':(/^([1-9]|1[0-4])$/.test(ref)?'brt':'tj'); }
  const M=MODES[cls];
  const pts=decodePoly(d.p); const cd=[0]; for(let i=1;i<pts.length;i++) cd.push(cd[i-1]+hav({lat:pts[i-1][1],lon:pts[i-1][0]},{lat:pts[i][1],lon:pts[i][0]}));
  const label=d.mode==='tj'?(cls==='mikro'?'Mikro '+ref.replace(/^JAK\.?/i,'JAK'):'TJ '+ref):(d.short||d.name);
  const col=REFCOL[ref]||CLSCOL[cls]||'#555';
  const L={idx:li,id:d.id,cls,mode:d.mode,ref,name:d.name,label,col,M,pts,cd,len:cd[cd.length-1],n:d.s.length,s:d.s,sid:[],sd:[],segT:[],start:M.start,end:M.end,hw:M.hw};
  d.s.forEach((s,i)=>{
    const g=M.group,nm=normName(s[0]),key=g+'|'+nm;let list=clusterIdx.get(key)||[];let c=null;
    for(const k of list){ if(hav({lat:s[1],lon:s[2]},ST[k])<500){c=ST[k];break;} }
    if(!c){c={id:ST.length,name:cleanName(s[0]),lat:s[1],lon:s[2],g,n:1,lines:new Set(),cnt:0};ST.push(c);list.push(c.id);clusterIdx.set(key,list);}
    else { c.lat=(c.lat*c.n+s[1])/(c.n+1); c.lon=(c.lon*c.n+s[2])/(c.n+1); c.n++; }
    c.lines.add(li); L.sid.push(c.id); L.sd.push(cd[Math.min(s[3],cd.length-1)]);
  });
  for(let i=0;i<L.n-1;i++){ L.segT.push(Math.max(0.3,(L.sd[i+1]-L.sd[i])/(M.speed*1000/60)+M.dwell)); }
  L.bb=pts.reduce((b,p)=>[Math.min(b[0],p[0]),Math.min(b[1],p[1]),Math.max(b[2],p[0]),Math.max(b[3],p[1])],[999,999,-999,-999]);
  LINES.push(L);
});
const NS=ST.length, OFF=[]; let TOTALPOS=0; LINES.forEach(L=>{OFF.push(TOTALPOS);TOTALPOS+=L.n;});
const POS=ST.map(()=>[]); const POSLINE=new Int32Array(TOTALPOS);
LINES.forEach(L=>{for(let i=0;i<L.n;i++){POS[L.sid[i]].push([L.idx,i]);POSLINE[OFF[L.idx]+i]=L.idx;}});
const WALKADJ=ST.map(()=>[]);
(function(){ const grid=new Map(),cell=0.0045; const key=(a,b)=>a+','+b;
  ST.forEach(s=>{const k=key(Math.floor(s.lat/cell),Math.floor(s.lon/cell));(grid.get(k)||grid.set(k,[]).get(k)).push(s.id);});
  ST.forEach(a=>{const gi=Math.floor(a.lat/cell),gj=Math.floor(a.lon/cell);
    for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){const l=grid.get(key(gi+di,gj+dj));if(!l)continue;
      for(const j of l){ if(j<=a.id)continue; const b=ST[j]; const d=hav(a,b); const cross=(a.g!==b.g); if(d<=(cross?450:300)){const t=d*1.25/75+1; WALKADJ[a.id].push({to:b.id,t,d}); WALKADJ[b.id].push({to:a.id,t,d});} } } });
})();
function runningL(L,t){return t>=L.start&&t<L.end;}
function dijk(src,t,allow,maxT){
  const N=NS+TOTALPOS,dist=new Float64Array(N).fill(Infinity),prev=new Int32Array(N).fill(-1);
  const H=[];const push=(d,u)=>{H.push([d,u]);let i=H.length-1;while(i>0){const p=(i-1)>>1;if(H[p][0]<=H[i][0])break;[H[p],H[i]]=[H[i],H[p]];i=p;}};
  const pop=()=>{const top=H[0],l=H.pop();if(H.length){H[0]=l;let i=0;for(;;){const a=2*i+1,b=a+1;let s=i;if(a<H.length&&H[a][0]<H[s][0])s=a;if(b<H.length&&H[b][0]<H[s][0])s=b;if(s===i)break;[H[s],H[i]]=[H[i],H[s]];i=s;}}return top;};
  const relax=(v,nd,u)=>{if(nd<dist[v]-1e-6){dist[v]=nd;prev[v]=u;push(nd,v);}};
  dist[src]=0;push(0,src);
  while(H.length){const [d,u]=pop();if(d>dist[u])continue;if(d>maxT)break;
    if(u<NS){
      for(const [li,i] of POS[u]){const L=LINES[li];if(!allow(L)||!runningL(L,t))continue;relax(NS+OFF[li]+i,d+L.hw[band(t)]/2,u);}
      for(const w of WALKADJ[u]) relax(w.to,d+w.t,u);
    } else {
      const li=POSLINE[u-NS],L=LINES[li],i=u-NS-OFF[li];
      if(i+1<L.n) relax(u+1,d+L.segT[i],u);
      if(i>0) relax(u-1,d+L.segT[i-1],u);
      relax(L.sid[i],d+0.5,u);
    }
  }
  return {dist,prev};
}
function legsFrom(prev,dist,src,dst,t){
  const st=[];let c=dst;while(c!==-1&&c!==undefined){st.push(c);if(c===src)break;c=prev[c];}st.reverse();
  const legs=[];let cur=null,clock=0;
  for(let k=1;k<st.length;k++){const a=st[k-1],b=st[k];
    if(a<NS&&b<NS){const w=WALKADJ[a].find(x=>x.to===b);const m=w?w.t:1;if(cur&&cur.kind==='walk'){cur.min+=m;cur.to=b;}else{cur={kind:'walk',from:a,to:b,min:m};legs.push(cur);}clock+=m;}
    else if(a<NS&&b>=NS){const li=POSLINE[b-NS],L=LINES[li],i=b-NS-OFF[li],wait=L.hw[band(t)]/2;cur={kind:'ride',line:li,fromIdx:i,toIdx:i,fromSid:a,toSid:a,stops:0,min:0,wait,t0:clock};legs.push(cur);clock+=wait;}
    else if(a>=NS&&b>=NS){const li=cur.line,L=LINES[li],i=a-NS-OFF[li],j=b-NS-OFF[li];const m=L.segT[Math.min(i,j)];cur.toIdx=j;cur.toSid=L.sid[j];cur.stops++;cur.min+=m;clock+=m;}
    else { clock+=0.5; cur=null; }
  }
  return {legs,total:dist[dst]};
}
const stationsNear=(p,max,n)=>{
  const all=ST.map(s=>({sid:s.id,d:hav(p,s)})).filter(x=>x.d<=max).sort((a,b)=>a.d-b.d);
  const out=[],cnt={};all.forEach(x=>{const g=ST[x.sid].g;cnt[g]=(cnt[g]||0)+1;if(out.length<n&&cnt[g]<=4)out.push(x);});return out;};
const accEst=d=>d<=900?d*1.3/75:d*1.35/380+3;
