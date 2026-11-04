'use strict';
/* ---------- kendaraan beranimasi ---------- */
function posOn(L,d){const cd=L.cd;let lo=0,hi=cd.length-1;if(d<=0)return L.pts[0];if(d>=cd[hi])return L.pts[hi];while(hi-lo>1){const m=(lo+hi)>>1;if(cd[m]<=d)lo=m;else hi=m;}const u=(d-cd[lo])/((cd[hi]-cd[lo])||1);return [L.pts[lo][0]+(L.pts[hi][0]-L.pts[lo][0])*u,L.pts[lo][1]+(L.pts[hi][1]-L.pts[lo][1])*u];}
function vehicles(){const t=S.t,out=[];if(!S.vis.veh||!mapReady||S.dim)return out;const z=map.getZoom(),bd=map.getBounds().toArray();
  LINES.forEach(L=>{
    if(L.bb[2]<bd[0][0]||L.bb[0]>bd[1][0]||L.bb[3]<bd[0][1]||L.bb[1]>bd[1][1])return;
    const grp=L.cls==='krl'?'krl':(['mrt','lrt','whoosh'].includes(L.cls)?'mrt':L.cls);if(!S.vis[grp]||!runningL(L,t))return;
    if(L.cls==='mikro'&&z<14)return; if(L.cls==='tj'&&z<13.5)return; if(L.cls==='brt'&&z<12.5)return;
    const hw=L.hw[band(t)],speedMS=L.M.speed*1000/60;const per=Math.max(1,Math.min(L.M.group==='tj'?3:9,Math.ceil(L.len/(speedMS*hw)*(L.M.group==='tj'?0.5:1))));
    const P=2*L.len/speedMS;
    for(let dir=0;dir<2;dir++)for(let k=0;k<per;k++){
      const ph=(((S.vt+(k+dir*0.5)*P/per)%P)+P)%P*speedMS; const d=ph<L.len?ph:2*L.len-ph;const c=posOn(L,d);
      if(c[0]<bd[0][0]-.02||c[0]>bd[1][0]+.02||c[1]<bd[0][1]-.02||c[1]>bd[1][1]+.02)continue;
      out.push({type:'Feature',properties:{col:L.col,k:L.M.group==='tj'?0:1},geometry:{type:'Point',coordinates:c}});}
  });return out;}
