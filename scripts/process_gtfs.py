#!/usr/bin/env python3
"""Olah GTFS TransJakarta menjadi tj-jadwal.json (ringkas) untuk jejakcommuter.
Pemakaian: python3 process_gtfs.py file_gtfs.zip tj-jadwal.json"""
import sys,zipfile,csv,io,json,collections,datetime

def rd(z,name):
    with z.open(name) as f:
        return list(csv.DictReader(io.TextIOWrapper(f,encoding='utf-8-sig')))

def mins(t):
    h,m,*_=t.split(':');return int(h)*60+int(m)

def merge_windows(wins):
    """wins: [(start,end,headway)] -> jarak gabungan 1/sum(1/h) per potongan waktu."""
    if not wins:return []
    pts=sorted({w[0] for w in wins}|{w[1] for w in wins})
    out=[]
    for a,b in zip(pts,pts[1:]):
        act=[w[2] for w in wins if w[0]<=a and w[1]>=b and w[2]>0]
        if not act:continue
        h=1/sum(1/x for x in act)
        h=max(1,round(h))
        if out and out[-1][1]==a and out[-1][2]==h:out[-1][1]=b
        else:out.append([a,b,h])
    return out

def enc(pts):
    out=[];pl=pn=0
    for la,lo in pts:
        a=round(la*1e5);b=round(lo*1e5)
        for v in (a-pl,b-pn):
            v=~(v<<1) if v<0 else v<<1
            while v>=0x20:out.append(chr((0x20|(v&0x1f))+63));v>>=5
            out.append(chr(v+63))
        pl,pn=a,b
    return ''.join(out)

def rdp(pts,eps):
    if len(pts)<3:return pts
    keep=[False]*len(pts);keep[0]=keep[-1]=True;st=[(0,len(pts)-1)]
    while st:
        i,j=st.pop();a=pts[i];b=pts[j];dx=b[0]-a[0];dy=b[1]-a[1];n=dx*dx+dy*dy;md=0;mk=-1
        for k in range(i+1,j):
            p=pts[k]
            if n==0:d=((p[0]-a[0])**2+(p[1]-a[1])**2)**.5
            else:
                t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/n));d=((p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2)**.5
            if d>md:md=d;mk=k
        if md>eps and mk>0:keep[mk]=True;st+=[(i,mk),(mk,j)]
    return [p for p,k in zip(pts,keep) if k]

def main(zp,outp):
    z=zipfile.ZipFile(zp)
    routes={r['route_id']:r for r in rd(z,'routes.txt')}
    trips=rd(z,'trips.txt')
    cal={c['service_id']:c for c in rd(z,'calendar.txt')}
    stops={s['stop_id']:s for s in rd(z,'stops.txt')}
    shp=collections.defaultdict(list)
    for r in rd(z,'shapes.txt'):shp[r['shape_id']].append((int(r['shape_pt_sequence']),float(r['shape_pt_lat']),float(r['shape_pt_lon'])))
    freq=collections.defaultdict(list)
    for f in rd(z,'frequencies.txt'):
        freq[f['trip_id']].append((mins(f['start_time']),min(mins(f['end_time'])+1,1440),int(f['headway_secs'])/60))
    seq=collections.defaultdict(list)
    for s in rd(z,'stop_times.txt'):
        seq[s['trip_id']].append((int(s['stop_sequence']),s['stop_id'],s['departure_time']))
    today=datetime.date.today().strftime('%Y%m%d')
    def days(sid):
        c=cal.get(sid)
        if not c or c['end_date']<today:return set()
        r=set()
        if any(c[d]=='1' for d in ('monday','tuesday','wednesday','thursday','friday')):r.add('wd')
        if c['saturday']=='1':r.add('sat')
        if c['sunday']=='1':r.add('sun')
        return r
    # tabel nama pemberhentian
    names=[];nid={}
    def sidx(stop_id):
        n=stops[stop_id]['stop_name'].strip()
        if n not in nid:nid[n]=len(names);names.append(n)
        return nid[n]
    out={}
    by=collections.defaultdict(list)
    for t in trips:by[t['route_id']].append(t)
    for rid,ts in by.items():
        r=routes.get(rid)
        if not r:continue
        dirs=collections.defaultdict(lambda:{'heads':collections.Counter(),'stops':[],'coords':[],'shape':'','w':{'wd':[],'sat':[],'sun':[]}})
        mx=collections.defaultdict(int)
        for t in ts:
            mx[t['direction_id'] or '0']=max(mx[t['direction_id'] or '0'],len(seq.get(t['trip_id'],[])))
        for t in ts:
            k0=t['direction_id'] or '0';d=dirs[k0]
            d['heads'][t['trip_headsign'].strip()]+=1
            sq=sorted(seq.get(t['trip_id'],[]))
            st=[sidx(x[1]) for x in sq]
            if len(st)>len(d['stops']):
                d['stops']=st;d['coords']=[[round(float(stops[x[1]]['stop_lat']),5),round(float(stops[x[1]]['stop_lon']),5)] for x in sq];d['shape']=t.get('shape_id','')
            if len(st)<0.6*mx[k0]:continue  # pola pendek tidak dihitung ke jarak antar bus utama
            dd=days(t['service_id'])
            for w in freq.get(t['trip_id'],[]):
                for k in dd:d['w'][k].append(w)
        dl=[]
        for k in sorted(dirs):
            d=dirs[k]
            if not d['stops']:continue
            pts=[(la,lo) for _,la,lo in sorted(shp.get(d['shape'],[]))]
            pl=enc(rdp(pts,0.00012)) if pts else ''
            dl.append({'h':[h for h,_ in d['heads'].most_common(3)],'s':d['stops'],'c':d['coords'],'p':pl,
                       'w':{k2:merge_windows(v) for k2,v in d['w'].items()}})
        if not dl:continue
        out[rid]={'n':r['route_short_name'],'name':r['route_long_name'],'cat':r['route_desc'],'col':'#'+(r['route_color'] or '888888'),'d':dl}
    data={'src':'Transjakarta (GTFS resmi)','built':datetime.date.today().isoformat(),'names':names,'routes':out}
    json.dump(data,open(outp,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
    print('rute',len(out),'halte unik',len(names),'ukuran',round(len(json.dumps(data,ensure_ascii=False))/1024),'KB')

if __name__=='__main__':main(sys.argv[1],sys.argv[2])
