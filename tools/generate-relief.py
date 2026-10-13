"""Sira — fond de carte en relief (data/map-relief.jpg)

Rend un relief ombré aux couleurs du désert, à partir des cartes d'altitude de data/terrain
(Terrain Tiles : SRTM, GMTED2010, ETOPO1), dans la projection de Mercator de la carte SVG
(js/map-data.js, 600 × 760). La projection est retrouvée à partir des lieux déjà projetés.

Usage : python3 tools/generate-relief.py   (demande numpy et Pillow)
"""
import json, math, re
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
TER = ROOT / "data" / "terrain"
SCALE = 2                     # 1200 × 1520 pixels pour une carte de 600 × 760
W, H = 600 * SCALE, 760 * SCALE

# --- la projection : x = k·λ + tx ; y = ty − k·ln(tan(π/4 + φ/2)), ajustée sur les lieux connus
src = (ROOT / "js" / "map-data.js").read_text()
data = json.loads(src[src.index("{"):src.rindex("}") + 1])
proj, geo = data["places"], data["geo"]["places"]
rows, xs, ys = [], [], []
for k, p in proj.items():
    if k not in geo:
        continue
    lon, lat = geo[k]
    rows.append((math.radians(lon), math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))))
    xs.append(p[0]); ys.append(p[1])
A = np.array(rows)
kx, tx = np.linalg.lstsq(np.c_[A[:, 0], np.ones(len(A))], np.array(xs), rcond=None)[0]
ky, ty = np.linalg.lstsq(np.c_[-A[:, 1], np.ones(len(A))], np.array(ys), rcond=None)[0]
print(f"projection : kx={kx:.1f} ky={ky:.1f} tx={tx:.1f} ty={ty:.1f}")

px, py = np.meshgrid((np.arange(W) + 0.5) / SCALE, (np.arange(H) + 0.5) / SCALE)
lon = np.degrees((px - tx) / kx)
lat = np.degrees(2 * np.arctan(np.exp((ty - py) / ky)) - math.pi / 2)

# --- les altitudes : la grille la plus fine disponible en chaque point
index = json.loads((TER / "index.json").read_text())
grids = []
for name, m in index.items():
    a = np.asarray(Image.open(TER / f"{name}.png").convert("RGB")).astype(np.float32)
    grids.append((m["step"], m, a[:, :, 0] * 256 + a[:, :, 1] - 1000))
grids.sort(key=lambda g: -g[0])          # du plus grossier au plus fin : le fin écrase le grossier
h = np.full((H, W), -1500.0, np.float32)
for step, m, g in grids:
    fx = (lon - m["lon"][0]) / step
    fy = (m["lat"][1] - lat) / step
    ok = (fx >= 0) & (fy >= 0) & (fx < m["cols"] - 1) & (fy < m["rows"] - 1)
    if step < 0.02:
        continue                          # les grilles très fines n'apportent rien à cette échelle
    x0 = np.clip(np.floor(fx).astype(int), 0, m["cols"] - 2); y0 = np.clip(np.floor(fy).astype(int), 0, m["rows"] - 2)
    tx_, ty_ = fx - x0, fy - y0
    v = (g[y0, x0] * (1 - tx_) + g[y0, x0 + 1] * tx_) * (1 - ty_) + (g[y0 + 1, x0] * (1 - tx_) + g[y0 + 1, x0 + 1] * tx_) * ty_
    h = np.where(ok, v, h)
# un léger lissage (moyenne 3 × 3) pour effacer les marches entre les grilles
hp = np.pad(h, 1, mode="edge")
h = sum(hp[1 + dy:H + 1 + dy, 1 + dx:W + 1 + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1)) / 9

# --- les couleurs : désert, montagnes, mers peu profondes et profondes
def ramp(v, stops):
    xs_ = np.array([s[0] for s in stops], np.float32)
    cs = np.array([[int(s[1][i:i + 2], 16) for i in (1, 3, 5)] for s in stops], np.float32)
    out = np.empty(v.shape + (3,), np.float32)
    for c in range(3):
        out[..., c] = np.interp(v, xs_, cs[:, c])
    return out

land = ramp(h, [(0, "#eadbb8"), (150, "#e3cfa4"), (500, "#d8bf92"), (900, "#c8a77a"), (1500, "#ad8a68"), (2200, "#8f7058"), (3000, "#7a6152"), (4200, "#e9e4dc")])
sea = ramp(h, [(-4000, "#1f4d6b"), (-1500, "#2a6584"), (-400, "#3f86a0"), (-80, "#6db3b9"), (-15, "#9fd5cd"), (0, "#c6e4d6")])

# champs de lave (harra) et oasis, comme dans le monde 3D
def ellipse(cx, cy, rx, ry):
    return np.hypot((lon - cx) / rx, (lat - cy) / ry)
# un bruit doux, pour des contours irréguliers
def vnoise(f, seed):
    rng = np.random.default_rng(seed)
    n = int(f) + 2
    g = rng.random((n + 1, n + 1)).astype(np.float32)
    u = (lon - 25) / 40 * f; v = (lat - 5) / 40 * f
    x0 = np.clip(np.floor(u).astype(int), 0, n - 1); y0 = np.clip(np.floor(v).astype(int), 0, n - 1)
    tu = u - x0; tv = v - y0
    tu = tu * tu * (3 - 2 * tu); tv = tv * tv * (3 - 2 * tv)
    return (g[y0, x0] * (1 - tu) + g[y0, x0 + 1] * tu) * (1 - tv) + (g[y0 + 1, x0] * (1 - tu) + g[y0 + 1, x0 + 1] * tu) * tv
warp = (vnoise(60, 1) - 0.5) * 0.9 + (vnoise(180, 2) - 0.5) * 0.4
grain = 0.55 + 0.45 * vnoise(240, 3)
harra = np.zeros_like(h)
for cx, cy, rx, ry in [(39.95, 23.3, 0.35, 1.2), (40.2, 25.6, 0.55, 0.45), (37.4, 27.0, 0.45, 0.6), (41.4, 22.8, 0.3, 0.3), (38.6, 25.4, 0.35, 0.35), (36.9, 32.4, 0.6, 0.5), (40.7, 19.0, 0.3, 0.4)]:
    harra = np.maximum(harra, np.clip((1.0 - ellipse(cx, cy, rx, ry) - warp) * 2.0, 0, 1) * grain)
land = land * (1 - harra[..., None] * 0.5) + np.array([70, 62, 58], np.float32) * harra[..., None] * 0.5
green = np.zeros_like(h)
for cx, cy, r in [(39.61, 24.47, 0.12), (39.29, 25.7, 0.12), (40.415, 21.27, 0.12), (36.57, 28.38, 0.08), (35.24, 31.77, 0.35), (36.3, 33.5, 0.6)]:
    green = np.maximum(green, np.clip(1 - ellipse(cx, cy, r, r), 0, 1))
nile = np.zeros_like(h)
for a, b in [((32.9, 24.1), (32.7, 25.7)), ((32.7, 25.7), (31.7, 27.2)), ((31.7, 27.2), (31.2, 29.9)), ((31.2, 29.9), (31.2, 31.2))]:
    dx, dy = b[0] - a[0], b[1] - a[1]
    t = np.clip(((lon - a[0]) * dx + (lat - a[1]) * dy) / (dx * dx + dy * dy), 0, 1)
    d = np.hypot(lon - a[0] - t * dx, lat - a[1] - t * dy)
    nile = np.maximum(nile, np.clip(1 - d / 0.07, 0, 1) * (0.6 + 0.4 * vnoise(120, 4)))
green = np.maximum(green, nile)
land = land * (1 - green[..., None] * 0.6) + np.array([110, 130, 78], np.float32) * green[..., None] * 0.6

# --- l'ombrage : soleil au nord-ouest, relief accentué
cell = 111320 * (360 / (2 * math.pi * kx)) / SCALE * np.cos(np.radians(lat))  # mètres par pixel (approx.)
gy, gx = np.gradient(h * 6.0)
gx /= cell; gy /= cell
az, alt = math.radians(315), math.radians(42)
slope = np.arctan(np.hypot(gx, gy))
aspect = np.arctan2(-gx, gy)
shade = np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect)
shade = np.clip(shade, 0, 1)
is_land = h > 0
img = np.where(is_land[..., None], land * (0.42 + 0.72 * shade[..., None]), sea * (0.86 + 0.18 * shade[..., None]))
# une fine lisière claire le long des côtes
coast = np.asarray(Image.fromarray((is_land * 255).astype(np.uint8)).filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
img = img * (1 - coast[..., None] * 0.35) + np.array([248, 240, 222], np.float32) * coast[..., None] * 0.35

out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
out.save(ROOT / "data" / "map-relief.jpg", quality=80, optimize=True, progressive=True)
print("data/map-relief.jpg", out.size, (ROOT / "data" / "map-relief.jpg").stat().st_size // 1024, "Ko")
