#!/usr/bin/env python3
"""Unduh minimarket, SPBU, dan masjid Jabodetabek dari OpenStreetMap (Overpass) lalu tulis poi.js.

Dijalankan tiap bulan oleh GitHub Actions. Bisa juga dijalankan manual:
    python3 scripts/bake_poi.py                 # unduh lalu tulis poi.js
    python3 scripts/bake_poi.py --from-dir d    # pakai mm.csv, spbu.csv, masjid.csv yang sudah ada di folder d
"""
import json, math, os, re, sys, time, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone

BBOX = "-6.80,106.38,-5.95,107.25"   # Jabodetabek: selatan,barat,utara,timur
FIELDS = 'out:csv(::lat,::lon,name,brand,operator,opening_hours,amenity,shop;false;"|")'
SERVERS = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"]
QUERIES = {
    "mm": '[%s][timeout:180];(nwr["shop"~"^(convenience|supermarket)$"](%s);nwr["amenity"="fuel"]["brand"~"Shell",i](%s);nwr["amenity"="fuel"]["name"~"Shell",i](%s););out center;',
    "spbu": '[%s][timeout:180];nwr["amenity"="fuel"](%s);out center;',
    "masjid": '[%s][timeout:240];nwr["amenity"="place_of_worship"]["religion"="muslim"](%s);out center;',
}
DEFAULT = {"mm": "Minimarket", "spbu": "SPBU", "masjid": "Masjid"}

def build(k):
    n = QUERIES[k].count("%s") - 1
    return QUERIES[k] % ((FIELDS,) + (BBOX,) * n)

def download(k):
    q = build(k).encode()
    last = None
    for attempt in range(6):
        for url in SERVERS:
            try:
                req = urllib.request.Request(url, data=b"data=" + urllib.parse.quote(q.decode()).encode(),
                                             headers={"Content-Type": "application/x-www-form-urlencoded",
                                                      "User-Agent": "jejakcommuter-bake/1.0 (bulanan, 3 permintaan)"})
                with urllib.request.urlopen(req, timeout=300) as r:
                    txt = r.read().decode("utf-8", "replace")
                if len(txt) > 50:
                    return txt
            except Exception as e:
                last = e
                print("gagal", k, url, e, file=sys.stderr)
        time.sleep(30 * (attempt + 1))
    raise SystemExit("Gagal mengunduh %s: %s" % (k, last))

def hav(a, b):
    R = 6371000.0
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dl = math.radians(b[1] - a[1]); dp = p2 - p1
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))

def parse(k, txt, drop_shell=False):
    out = []
    for line in txt.splitlines():
        f = line.split("|")
        if len(f) < 2:
            continue
        try:
            lat, lon = float(f[0]), float(f[1])
        except ValueError:
            continue
        f += [""] * (8 - len(f))
        def cl(x):
            x = x.strip()
            if len(x) >= 2 and x[0] == '"' and x[-1] == '"':
                x = x[1:-1].replace('""', '"')
            return x.strip()
        name, brand, oper, hours = cl(f[2]), cl(f[3]), cl(f[4]), cl(f[5])
        if drop_shell and re.search("shell", " ".join([name, brand, oper]), re.I):
            continue
        out.append([round(lat, 5), round(lon, 5), name or brand or oper or DEFAULT[k], hours[:60]])
    # buang duplikat: nama sama dan jarak < 25 m (mis. titik dan bangunan yang sama)
    out.sort(key=lambda r: (round(r[0], 3), round(r[1], 3)))
    keep, grid = [], {}
    for r in out:
        cell = (int(r[0] * 400), int(r[1] * 400))
        dup = False
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for s in grid.get((cell[0] + dx, cell[1] + dy), []):
                    if s[2] == r[2] and hav(s, r) < 25:
                        dup = True
        if not dup:
            keep.append(r)
            grid.setdefault(cell, []).append(r)
    return keep

def main():
    src = None
    if "--from-dir" in sys.argv:
        src = sys.argv[sys.argv.index("--from-dir") + 1]
    data = {}
    for k in ("mm", "spbu", "masjid"):
        if src:
            txt = open(os.path.join(src, k + ".csv"), encoding="utf-8").read()
        else:
            txt = download(k)
            time.sleep(10)
        data[k] = parse(k, txt, drop_shell=(k == "spbu"))
        print(k, len(data[k]), "titik")
    for k, mn in (("mm", 500), ("spbu", 100), ("masjid", 1000)):
        if len(data[k]) < mn:
            raise SystemExit("Data %s terlalu sedikit (%d), poi.js tidak ditimpa" % (k, len(data[k])))
    now = datetime.now(timezone.utc) + timedelta(hours=7)
    poi = {"v": 1, "date": now.strftime("%Y-%m-%d"), "area": "Jabodetabek", **data}
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(root, "poi.js")
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("window.__POI=" + json.dumps(poi, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print("ditulis", path, os.path.getsize(path), "byte")

if __name__ == "__main__":
    main()
