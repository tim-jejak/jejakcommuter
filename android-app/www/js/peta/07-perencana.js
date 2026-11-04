'use strict';
/* ---------- perencana door-to-door ---------- */
const MASKS=[
  {key:'all',allow:()=>true},
  {key:'rail',allow:L=>['krl','mrt','lrt','whoosh'].includes(L.cls)},
  {key:'krl',allow:L=>L.cls==='krl'},
  {key:'metro',allow:L=>L.cls==='mrt'||L.cls==='lrt'},
  {key:'tj',allow:L=>L.mode==='tj'}
];
let planSeq=0;
const parkable=s=>s.g==='krl'||s.g==='lrt'||(s.g==='mrt'&&/^(lebak bulus|dukuh atas|blok m)$/.test(normName(s.name)));
function sigOf(legs){return legs.filter(l=>l.kind==='ride').map(l=>l.line+'>'+l.toSid).join('/');}
async function plan(){
  stopAnim();const o=S.from,d=S.to;if(!o||!d)return;const my=++planSeq,t=Math.floor(S.t),dist=hav(o,d);
  $('#out').innerHTML='<div class="status">Mencari rute…</div>';S.opts=[];S.sel=-1;draw();
  const jobsM=[valMulti(o,d,'motor_scooter').then(rs=>({kind:'motorM',rs})),valMulti(o,d,'auto').then(rs=>({kind:'carM',rs}))];
  if(dist<=7000)jobsM.push(valhalla(o,d,'pedestrian').then(v=>({kind:'walk',v})));
  const np={};ST.forEach(s=>{if(!parkable(s))return;const dd=hav(o,s);if(!(s.g in np)||dd<np[s.g].d)np[s.g]={id:s.id,d:dd};});
  const okA=x=>{const s=ST[x.sid];if(x.d<=500)return true;if(parkable(s))return !!np[s.g]&&np[s.g].id===s.id;return x.d<=1200;};
  const NO=stationsNear(o,6000,40).filter(okA).slice(0,14),ND=stationsNear(d,6000,12),cand=[];const nearest={};NO.forEach(x=>{const g=ST[x.sid].g;if(!(g in nearest))nearest[g]=x.sid;});
  MASKS.forEach(M=>{let best=[];
    NO.forEach(A=>{const R=dijk(A.sid,t,M.allow,200);
      ND.forEach(B=>{const tt=R.dist[B.sid];if(!isFinite(tt)||A.sid===B.sid)return;const est=accEst(A.d)+tt+accEst(B.d);best.push({est,A,B,R});});});
    best.sort((a,b)=>a.est-b.est);
    for(const c of best.slice(0,14)){const r=legsFrom(c.R.prev,c.R.dist,c.A.sid,c.B.sid,t);if(!r.legs.some(l=>l.kind==='ride'))continue;
      cand.push({mask:M.key,est:c.est,A:c.A,B:c.B,near:nearest[ST[c.A.sid].g]===c.A.sid,legs:r.legs,transit:r.total,sig:sigOf(r.legs)+'@'+c.A.sid});if(cand.filter(x=>x.mask===M.key).length>=(M.key==='all'?7:5))break;}
    let nf=0;for(const A0 of NO){if(nf>=2)break;const bb2=best.find(c=>c.A.sid===A0.sid);if(!bb2)continue;nf++;const r2=legsFrom(bb2.R.prev,bb2.R.dist,bb2.A.sid,bb2.B.sid,t);if(r2.legs.some(l=>l.kind==='ride'))cand.push({mask:M.key,est:bb2.est,A:bb2.A,B:bb2.B,near:nearest[ST[bb2.A.sid].g]===bb2.A.sid,nearest:A0.sid===NO[0].sid,legs:r2.legs,transit:r2.total,sig:sigOf(r2.legs)+'@'+bb2.A.sid});}
    const nb=best.find(c=>ST[c.A.sid].g!=='tj'&&c.A.sid===nearest[ST[c.A.sid].g]);
    if(nb){const r=legsFrom(nb.R.prev,nb.R.dist,nb.A.sid,nb.B.sid,t);if(r.legs.some(l=>l.kind==='ride'))cand.push({mask:M.key,est:nb.est,A:nb.A,B:nb.B,near:true,legs:r.legs,transit:r.total,sig:sigOf(r.legs)+'@'+nb.A.sid});}
  });
  for(let k=cand.length-1;k>=0;k--){const c=cand[k],s=ST[c.A.sid];const rideD=hav(s,ST[c.B.sid]);if(dist<1200||c.B.d>dist*0.6+400||rideD<400||c.A.d+rideD+c.B.d>dist*1.8+1500){cand.splice(k,1);continue;}if(c.A.d<=500||!parkable(s))continue;const l0=c.legs[0];if(!(c.A.d<=4000&&l0.kind==='ride'&&LINES[l0.line].M.group===s.g))cand.splice(k,1);}
  const seen=new Set(),pick=[];cand.sort((a,b)=>(a.est+a.A.d/8000)-(b.est+b.A.d/8000)).forEach(c=>{if(seen.has(c.sig))return;seen.add(c.sig);if(pick.length<16||c.near||c.nearest)pick.push(c);});
  const tj=pick.map(c=>{
    const fs=ST[c.A.sid],ls=ST[c.B.sid];
    const am=(hav(o,fs)<=500||!parkable(fs))?'pedestrian':'motor_scooter',em=hav(ls,d)<=900?'pedestrian':'motor_scooter';
    const A={lat:fs.lat,lon:fs.lon},B={lat:ls.lat,lon:ls.lon};
    return Promise.all([valhalla(o,A,am),valhalla(B,d,em)]).then(([acc,egr])=>({kind:'transit',c,fs,ls,acc,egr,am,em}));});
  const res=await Promise.all([...jobsM,...tj]);if(my!==planSeq)return;
  const opts=[];res.forEach(x=>{if(x.kind==='motorM')mkRoad('motor',x.rs).forEach(z=>opts.push(z));else if(x.kind==='carM')mkRoad('mobil',x.rs).forEach(z=>opts.push(z));else if(x.kind==='walk')opts.push(mkWalk(x.v));else opts.push(mkTransit(x));});
  /* satu opsi terbaik per kombinasi lini dan titik naik: titik turun dipilih dari waktu nyata ojol/jalan kaki */
  const bestBy=new Map();opts.forEach(o=>{if(!o.sigAB)return;const b=bestBy.get(o.sigAB);if(!b||o.score<b.score)bestBy.set(o.sigAB,o);});
  let fin=opts.filter(o=>!o.sigAB||bestBy.get(o.sigAB)===o);
  const trans=fin.filter(o=>o.sigAB).sort((a,b)=>a.score-b.score),keepT=new Set(trans.slice(0,9));trans.forEach(o=>{if(o.nearest)keepT.add(o);});
  opts.length=0;fin.forEach(o=>{if(!o.sigAB||keepT.has(o))opts.push(o);});
  S.opts=opts;sortOpts();S.sel=0;S.filter='all';S.noTransit=!pick.length&&dist>1500;draw();render();if(NAV.resume){NAV.resume=false;setTimeout(startNav,200);}if(opts[0])fitFeatures(opts[0].features);
}
const bandNow=()=>band(Math.floor(S.t));
function sortOpts(){const cur=S.opts[S.sel];S.opts.sort(S.sortBy==='near'?((a,b)=>(a.acc-b.acc)||(a.total-b.total)):(S.sortBy==='fast'?((a,b)=>a.total-b.total):((a,b)=>a.score-b.score)));S.sel=cur?S.opts.indexOf(cur):0;}
function mkRoad(kind,rs){const car=kind==='mobil',t0=Math.floor(S.t),ex=trafficExtra(t0,car),mid=(ex[0]+ex[1])/2;
  const arr=rs.map(r=>{const base=(car||r.est)?r.min:r.min*MOTOR_CAL;return Object.assign({base},r);}).sort((a,b)=>a.base-b.base);
  const pick=[];arr.forEach(r=>{if(pick.length<2&&!pick.some(p=>Math.abs(p.base-r.base)<1&&Math.abs(p.m-r.m)/p.m<.03))pick.push(r);});
  return pick.map((r,i)=>{const total=r.base+mid,lbl=car?'Mobil pribadi':'Motor pribadi';
    const via1=r.via.length?' · '+r.via[0]:'';
    return {key:kind+i,acc:1e9,score:total+(car?25:20)+i*2,title:lbl+' · jalur '+(i+1),total,
      sub:km1(r.m)+(r.est?' · garis lurus':'')+via1,
      modes:[kind],features:[{kind:'motor',color:'#14202B',coords:r.coords}],
      steps:[{k:'motor',title:(car?'Mobil':'Motor')+' sampai tujuan (jalur '+(i+1)+')',detail:km1(r.m)+via1}],
      notes:['Perkiraan'],last:null};});}
function mkWalk(v){return {key:'walk',score:v.min,acc:S.from&&S.to&&hav(S.from,S.to)<=1500?0:1e8,title:'Jalan kaki',total:v.min,sub:km1(v.m),modes:['walk'],features:[{kind:'walk',color:'#4C5A68',coords:v.coords}],
  steps:[{k:'walk',title:'Jalan kaki sampai tujuan',detail:km1(v.m)+' · '+mnt(v.min)}],notes:[],last:null};}
const nm=s=>(s.g==='tj'?'halte ':'stasiun ')+s.name;
function arah(L,i,j){return j>i?cleanName(L.s[L.n-1][0]):cleanName(L.s[0][0]);}
function mkTransit(x){
  const {c,fs,ls,acc,egr,am,em}=x,legs=c.legs,steps=[],feats=[],notes=[],modes=new Set();
  const park=am==='motor_scooter'?3:0;const pins=[{lat:fs.lat,lon:fs.lon,name:nm(fs).replace(/^./,m=>m.toUpperCase())}];
  steps.push({k:am==='pedestrian'?'walk':'motor',title:(am==='pedestrian'?'Jalan kaki ke ':'Motor atau ojol ke ')+nm(fs),detail:km1(acc.m)+' · '+mnt(acc.min)+(am==='pedestrian'||!acc.via.length?'':' · '+acc.via[0])});
  feats.push({kind:am==='pedestrian'?'walk':'motor',color:'#14202B',coords:acc.coords});modes.add(am==='pedestrian'?'walk':'motor');
  let lastStart=Infinity,off=acc.min+park,rideNo=0;
  legs.forEach((l,i)=>{
    if(l.kind==='ride'){
      const L=LINES[l.line];modes.add(L.M.group);rideNo++;
      const lo=Math.min(l.fromIdx,l.toIdx),hi=Math.max(l.fromIdx,l.toIdx);
      const a=Math.min(L.s[lo][3],L.pts.length-1),b=Math.min(L.s[hi][3],L.pts.length-1);
      feats.push({kind:'ride',color:L.col,coords:(l.toIdx<l.fromIdx?L.pts.slice(a,b+1).reverse():L.pts.slice(a,b+1))});pins.push({lat:ST[l.toSid].lat,lon:ST[l.toSid].lon,name:nm(ST[l.toSid]).replace(/^./,m=>m.toUpperCase())});
      const dir=l.toIdx>=l.fromIdx?1:-1,sl=[];for(let q=l.fromIdx;q!==l.toIdx+dir;q+=dir){const ss=ST[L.sid[q]];sl.push({lat:ss.lat,lon:ss.lon,name:ss.name});}
      steps.push({k:'line',col:L.col,L,title:L.label+': '+nm(ST[l.fromSid]).replace(/^./,m=>m.toUpperCase())+' → '+nm(ST[l.toSid]),detail:mnt(l.min),stops:sl,min:l.min,n:l.stops,grp:L.M.group,lbl:L.label,dirTxt:arah(L,l.fromIdx,l.toIdx)});
      lastStart=Math.min(lastStart,L.end-(off+l.t0)-Math.floor(S.t));
    } else {
      const f=ST[l.from],tt=ST[l.to];
      const prev=legs.slice(0,i).reverse().find(z=>z.kind==='ride'),next=legs.slice(i+1).find(z=>z.kind==='ride');
      if(prev&&next){const PL=LINES[prev.line],NL=LINES[next.line];
        steps.push({k:'walk',title:'Transit di '+tt.name,detail:mnt(l.min)});}
      else steps.push({k:'walk',title:'Jalan kaki '+mnt(l.min)+' ke '+nm(tt),detail:''});
      feats.push({kind:'walk',color:'#4C5A68',coords:[[f.lon,f.lat],[tt.lon,tt.lat]]});
    }
  });
  const walkEst=hav(ls,S.to)*1.3/75;
  steps.push({k:em==='pedestrian'?'walk':'motor',title:(em==='pedestrian'?'Jalan kaki dari ':'Ojol atau ojek dari ')+nm(ls)+' ke tujuan',detail:km1(egr.m)+' · '+mnt(egr.min)+(em==='pedestrian'||!egr.via.length?'':' · '+egr.via[0])});
  feats.push({kind:em==='pedestrian'?'walk':'motor',color:'#14202B',coords:egr.coords});modes.add(em==='pedestrian'?'walk':'motor');
  const total=acc.min+park+c.transit+egr.min;
  const rideLines=legs.filter(l=>l.kind==='ride').map(l=>LINES[l.line]);
  if(am==='motor_scooter')notes.push('Motor diparkir di '+nm(fs));
  return {key:'tr'+c.sig,sigAB:rideLines.map(L=>L.idx).join('>')+'@'+c.A.sid,score:total+5*Math.max(0,rideLines.length-1)+(am==='motor_scooter'?3:0),acc:hav(S.from,fs),near:c.near,nearest:c.nearest,pins,fromName:fs.name,title:rideLines.map(L=>L.M.label).filter((v,i,a)=>a.indexOf(v)===i).join(' + ')+(am==='motor_scooter'?' (motor ke stasiun)':'')+' · naik di '+fs.name,total,sub:rideLines.length>1?(rideLines.length-1)+' kali pindah':'tanpa pindah',
    rideLines,modes:[...modes],features:feats,steps,notes:[...new Set(notes)],last:isFinite(lastStart)?lastStart:null,est:acc.est||egr.est};
}
