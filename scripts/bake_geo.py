# Ambil geometri rel (KRL/MRT/LRT/Whoosh) dan rute TransJakarta dari OpenStreetMap untuk Jabodetabek,
# disederhanakan (toleransi 4 m) -> data/jalur-geo.json. Dipakai server untuk cek lokasi laporan.
import osmium, json, math, sys
src = sys.argv[1]
TJ_WAYS = set()
class R(osmium.SimpleHandler):
    def relation(self, r):
        t = r.tags
        if t.get('route') not in ('bus', 'trolleybus'): return
        s = ' '.join([t.get('network', ''), t.get('operator', ''), t.get('name', ''), t.get('brand', '')]).lower()
        if 'transjakarta' not in s: return
        for m in r.members:
            if m.type == 'w': TJ_WAYS.add(m.ref)
R().apply_file(src)
def dp(pts, tol):
    if len(pts) < 3: return pts
    lat0 = math.radians(pts[0][0]); kx = 111320 * math.cos(lat0); ky = 110540
    P = [((p[1]) * kx, (p[0]) * ky) for p in pts]
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    st = [(0, len(pts) - 1)]
    while st:
        a, b = st.pop(); ax, ay = P[a]; bx, by = P[b]; dx, dy = bx - ax, by - ay; L = dx * dx + dy * dy
        mi, md = -1, 0
        for i in range(a + 1, b):
            px, py = P[i]
            if L == 0: d = math.hypot(px - ax, py - ay)
            else:
                u = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / L)); d = math.hypot(px - ax - u * dx, py - ay - u * dy)
            if d > md: md, mi = d, i
        if md > tol: keep[mi] = True; st += [(a, mi), (mi, b)]
    return [p for p, k in zip(pts, keep) if k]
OUT = []
class W(osmium.SimpleHandler):
    def way(self, w):
        t = w.tags; kind = None
        rw = t.get('railway')
        if rw in ('rail', 'subway', 'light_rail') and 'service' not in t:
            kind = 'mrt' if rw == 'subway' else 'lrt' if rw == 'light_rail' else ('whoosh' if t.get('highspeed') == 'yes' else 'krl')
        elif w.id in TJ_WAYS:
            kind = 'tj'
        if not kind: return
        try: pts = [(round(n.location.lat, 6), round(n.location.lon, 6)) for n in w.nodes]
        except osmium.InvalidLocationError: return
        if len(pts) < 2: return
        OUT.append([kind, [[a, b] for a, b in dp(pts, 4)]])
W().apply_file(src, locations=True)
c = {}
for k, p in OUT: c[k] = c.get(k, 0) + len(p)
print('ways', len(OUT), 'titik per jenis', c)
import os; os.makedirs('data', exist_ok=True); json.dump(OUT, open('data/jalur-geo.json', 'w'), separators=(',', ':'))
