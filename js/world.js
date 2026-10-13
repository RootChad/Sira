/* Sira — le monde 3D
   Le vrai relief de l'Arabie (données SRTM), un ciel calculé selon l'heure,
   une caméra qui vole d'un lieu réel à l'autre, les itinéraires posés sur le terrain,
   les foules sur les champs de bataille et des découvertes à toucher.
   Sans WebGL, ou si les données ne se chargent pas, le voyage garde sa version 2D. */
import * as THREE from "./vendor/three.module.min.js";
import { Sky } from "./vendor/Sky.js";
import { createDecor } from "./world-decor.js";
import { createBattles } from "./world-battles.js";
import { createDirector } from "./world-director.js";

const U = window.Sira;
const S = window.SIRA;
const WD = S && S.world;
const GEO = window.SIRA_MAP && window.SIRA_MAP.geo;

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (e) {
    return false;
  }
}
if (U && WD && GEO && webglAvailable()) boot().catch(() => { /* on reste en 2D */ });

/* ------------------------------------------------------------------ */
/* Géographie : projection, altitudes                                  */
/* ------------------------------------------------------------------ */
const LON0 = 41, LAT0 = 23;
const KX = 111.32 * Math.cos((LAT0 * Math.PI) / 180), KZ = 110.57; // km par degré
const EXAG = 1.8; // le relief est un peu accentué pour qu'il se lise
const X = (lon) => (lon - LON0) * KX;
const Z = (lat) => (LAT0 - lat) * KZ;
const lonOf = (x) => x / KX + LON0;
const latOf = (z) => LAT0 - z / KZ;
const Y = (h) => (h > 0 ? (h / 1000) * EXAG : (h / 1000) * EXAG * 0.25);
const D2R = Math.PI / 180;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (t) => t * t * (3 - 2 * t);
const sstep = (a, b, v) => smooth(clamp((v - a) / (b - a)));
const lerp = (a, b, t) => a + (b - a) * t;
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = smooth(xf), v = smooth(yf);
  return lerp(lerp(hash(xi, yi), hash(xi + 1, yi), u), lerp(hash(xi, yi + 1), hash(xi + 1, yi + 1), u), v);
}
const fbm = (x, y) => vnoise(x, y) * 0.55 + vnoise(x * 2.3, y * 2.3) * 0.3 + vnoise(x * 5.1, y * 5.1) * 0.15;
function haversine(a, b) {
  const R = 6371, dl = (b[1] - a[1]) * D2R, dg = (b[0] - a[0]) * D2R;
  const h = Math.sin(dl / 2) ** 2 + Math.cos(a[1] * D2R) * Math.cos(b[1] * D2R) * Math.sin(dg / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function loadGrid(name, meta) {
  const res = await fetch(`data/terrain/${name}.png`);
  if (!res.ok) throw new Error(name);
  const bmp = await createImageBitmap(await res.blob(), { colorSpaceConversion: "none", premultiplyAlpha: "none" });
  const c = document.createElement("canvas");
  c.width = bmp.width; c.height = bmp.height;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bmp, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  const h = new Float32Array(c.width * c.height);
  for (let i = 0; i < h.length; i++) h[i] = d[i * 4] * 256 + d[i * 4 + 1] - 1000;
  return { name, ...meta, h };
}
function gridH(g, lon, lat) {
  const fx = (lon - g.lon[0]) / g.step, fy = (g.lat[1] - lat) / g.step;
  if (fx < 0 || fy < 0 || fx > g.cols - 1 || fy > g.rows - 1) return null;
  const x0 = Math.min(g.cols - 2, Math.floor(fx)), y0 = Math.min(g.rows - 2, Math.floor(fy)), tx = fx - x0, ty = fy - y0;
  const i = y0 * g.cols + x0;
  return lerp(lerp(g.h[i], g.h[i + 1], tx), lerp(g.h[i + g.cols], g.h[i + g.cols + 1], tx), ty);
}

/* ------------------------------------------------------------------ */
/* Couleurs du sol                                                     */
/* ------------------------------------------------------------------ */
const col = (h) => new THREE.Color(h);
// une palette de désert d'Arabie : sable clair, plaines de gravier, lits d'oued pâles, granit brun-rouge du Hijaz
const SAND = col("#e2c79c"), SAND2 = col("#cfaa78"), DUNE = col("#e9b97c"), COAST = col("#eee2c6"), GRAVEL = col("#b7a184"), WADI = col("#ecdcba"),
  ROCK = col("#8e6b52"), ROCK2 = col("#5b4335"), GRANITE = col("#7a4c3a"), BASALT = col("#33302e"), GREEN = col("#4f6b34"),
  HIGHGREEN = col("#6f7a4c"), FLOOR = col("#2f5f6e"), SHALLOW = col("#7cc4bd");
// champs de lave (harra), approximatifs
const HARRA = [[39.95, 23.3, 0.35, 1.2], [40.2, 25.6, 0.55, 0.45], [37.4, 27.0, 0.45, 0.6], [41.4, 22.8, 0.3, 0.3], [38.6, 25.4, 0.35, 0.35],
  [39.665, 24.43, 0.05, 0.12], [39.548, 24.46, 0.035, 0.1], [36.9, 32.4, 0.6, 0.5], [40.7, 19.0, 0.3, 0.4]];
// oasis et vallées vertes
const OASES = [[39.61, 24.47, 0.045], [39.617, 24.439, 0.02], [39.29, 25.7, 0.06], [40.415, 21.27, 0.06], [36.57, 28.38, 0.04],
  [37.92, 26.6, 0.05], [38.0, 24.25, 0.04], [35.24, 31.77, 0.15], [36.3, 33.5, 0.3]];
const NILE = [[32.9, 24.1], [32.7, 25.7], [32.75, 26.2], [31.7, 27.2], [31.2, 29.9], [31.2, 31.2]];
function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
const tmp = new THREE.Color();
function groundColor(lon, lat, h, slope, out, fine, concave = 0) {
  // sous la mer : des lagons turquoise près des côtes, un bleu profond au large
  if (h <= 0) { out.copy(FLOOR).lerp(SHALLOW, sstep(-45, -2, h)).lerp(COAST, sstep(-6, 0, h) * 0.5); return out; }
  const f = fine ? 40 : 6;
  const n = fbm(lon * f, lat * f), n2 = fbm(lon * f * 2.7 + 9, lat * f * 2.7);
  out.copy(SAND).lerp(SAND2, n * 0.8);
  // plaines de gravier (reg) sur les plateaux, sable dans les creux
  out.lerp(GRAVEL, sstep(250, 900, h) * 0.55 * (0.4 + 0.6 * n2));
  if (lon > 44 && lat > 17 && lat < 23) out.lerp(DUNE, 0.55 * n2); // le Rub' al-Khali
  if (lat > 27 && lat < 30 && lon > 38 && lon < 44) out.lerp(DUNE, 0.35 * n2); // le Nefoud
  if (h < 30) out.lerp(COAST, sstep(30, 0, h) * 0.5);
  // les lits d'oued : pâles, plats, au fond des vallées
  out.lerp(WADI, clamp(concave * 1.6) * (1 - sstep(0.06, 0.2, slope)) * 0.75);
  // la roche : pentes fortes, crêtes, et le granit sombre des montagnes du Hijaz
  const rock = clamp(sstep(0.09, 0.3, slope) + sstep(900, 2300, h) * 0.4 + clamp(-concave * 1.2) * 0.35);
  out.lerp(tmp.copy(ROCK).lerp(lon < 43 && lat < 28 ? GRANITE : ROCK2, n2 * 0.9), rock);
  // champs de lave : un contour déformé par le bruit, pour des taches irrégulières
  let harra = 0;
  for (const [x, y, rx, ry] of HARRA) {
    const d = Math.hypot((lon - x) / rx, (lat - y) / ry);
    if (d > 1.8) continue;
    const warp = (fbm(lon * 3.1 + x, lat * 3.1 + y) - 0.5) * 1.1 + (fbm(lon * 11, lat * 11) - 0.5) * 0.35;
    harra = Math.max(harra, sstep(1.05, 0.6, d + warp) * (0.55 + 0.45 * n2));
  }
  if (harra) out.lerp(BASALT, harra * 0.82);
  if (lat < 15.5 && h > 1400) out.lerp(HIGHGREEN, 0.55 * n);
  if (lat < 17.5 && lon > 42.6 && h > 1700) out.lerp(HIGHGREEN, 0.45 * n);
  if (lat > 32.5 && lon < 37.5) out.lerp(HIGHGREEN, 0.4);
  let green = 0;
  for (const [x, y, r] of OASES) {
    const d = Math.hypot((lon - x) / Math.cos(lat * D2R), lat - y) / r;
    if (d < 1) green = Math.max(green, (1 - d) * (0.5 + 0.8 * n2));
  }
  for (let i = 0; i < NILE.length - 1; i++) { const d = segDist([lon, lat], NILE[i], NILE[i + 1]); if (d < 0.08) green = Math.max(green, 1 - d / 0.08); }
  if (green) out.lerp(GREEN, clamp(green));
  return out;
}

/* ------------------------------------------------------------------ */
/* Démarrage                                                           */
/* ------------------------------------------------------------------ */
async function boot() {
  const index = await (await fetch("data/terrain/index.json")).json();
  const names = Object.keys(index);
  const grids = await Promise.all(names.map((n) => loadGrid(n, index[n])));
  // la grille la plus large sert de fond ; les autres, du plus fin au plus grossier, se posent dessus
  const region = grids.reduce((a, b) => (b.step > a.step ? b : a));
  const locals = grids.filter((g) => g !== region).sort((a, b) => a.step - b.step);
  const hAt = (lon, lat) => {
    for (const g of locals) { const v = gridH(g, lon, lat); if (v !== null) return v; }
    const v = gridH(region, lon, lat);
    return v === null ? -800 : v;
  };
  const yAt = (x, z) => Y(hAt(lonOf(x), latOf(z)));
  setup({ region, locals, hAt, yAt });
}

function setup({ region, locals, hAt, yAt }) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = () => window.innerWidth < 800;
  const canvas = document.getElementById("glCanvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.55;
  // les ombres portées : arbres, maisons, pions et chevaux sur le sol
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 60000);

  /* --- ciel, soleil, étoiles --- */
  const sky = new Sky();
  sky.scale.setScalar(40000);
  const su = sky.material.uniforms;
  su.turbidity.value = 7; su.rayleigh.value = 1.6; su.mieCoefficient.value = 0.005; su.mieDirectionalG.value = 0.82;
  scene.add(sky);
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(sky.geometry, sky.material));
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envRT = null;

  const sun = new THREE.DirectionalLight(0xffffff, 2.5);
  const moon = new THREE.DirectionalLight(0x9db4ff, 0.3);
  moon.position.set(-0.4, 0.8, 0.3);
  const hemi = new THREE.HemisphereLight(0xbcd3ea, 0x7a6248, 0.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile() ? 1024 : 2048, mobile() ? 1024 : 2048);
  sun.shadow.bias = -0.0003;
  scene.add(sun, sun.target, moon, hemi);

  const starGeo = new THREE.BufferGeometry();
  const sp = [];
  for (let i = 0; i < 3500; i++) {
    const u = Math.random(), v = Math.random() * 0.9 + 0.1;
    const th = u * Math.PI * 2, ph = Math.acos(v);
    sp.push(Math.sin(ph) * Math.cos(th) * 30000, Math.cos(ph) * 30000, Math.sin(ph) * Math.sin(th) * 30000);
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xfff6e0, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);
  scene.fog = new THREE.FogExp2(0xd6cdbd, 0.0002);

  /* --- terrain --- */
  const isMobile = mobile();
  function buildTerrain(g, dec, sink) {
    const cols = Math.floor((g.cols - 1) / dec) + 1, rows = Math.floor((g.rows - 1) / dec) + 1;
    const pos = new Float32Array(cols * rows * 3);
    const lonlat = new Float32Array(cols * rows * 2);
    const hs = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      const lon = g.lon[0] + i * dec * g.step, lat = g.lat[1] - j * dec * g.step;
      const h = g.h[j * dec * g.cols + i * dec];
      hs[k] = h; lonlat[k * 2] = lon; lonlat[k * 2 + 1] = lat;
      pos[k * 3] = X(lon); pos[k * 3 + 1] = Y(sink ? sink(lon, lat, h, dec * g.step) : h); pos[k * 3 + 2] = Z(lat);
    }
    const idx = new Uint32Array((cols - 1) * (rows - 1) * 6);
    let p = 0;
    for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
      const a = j * cols + i, b = a + 1, c = a + cols, d = c + 1;
      idx[p++] = a; idx[p++] = c; idx[p++] = b; idx[p++] = b; idx[p++] = c; idx[p++] = d;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.computeVertexNormals();
    const nor = geo.attributes.normal.array;
    const colors = new Float32Array(cols * rows * 3);
    const c = new THREE.Color();
    const fine = g.step < 0.02;
    const skirtOn = g !== region;
    // le creux ou la bosse du relief autour de chaque point (les oueds, les crêtes)
    const cellM = dec * g.step * 111000;
    for (let k = 0; k < cols * rows; k++) {
      const i = k % cols, j = (k - i) / cols;
      const hl = hs[j * cols + Math.max(0, i - 1)], hr = hs[j * cols + Math.min(cols - 1, i + 1)], hu = hs[Math.max(0, j - 1) * cols + i], hd = hs[Math.min(rows - 1, j + 1) * cols + i];
      const concave = (((hl + hr + hu + hd) / 4 - hs[k]) / cellM) * 15;
      groundColor(lonlat[k * 2], lonlat[k * 2 + 1], hs[k], 1 - nor[k * 3 + 1], c, fine, concave);
      colors[k * 3] = c.r; colors[k * 3 + 1] = c.g; colors[k * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    // une « jupe » sur les bords des zones détaillées, pour qu'aucun jour n'apparaisse
    if (skirtOn) {
      const edge = [];
      for (let i = 0; i < cols; i++) edge.push(i);
      for (let j = 1; j < rows; j++) edge.push(j * cols + cols - 1);
      for (let i = cols - 2; i >= 0; i--) edge.push((rows - 1) * cols + i);
      for (let j = rows - 2; j > 0; j--) edge.push(j * cols);
      edge.push(0);
      const sPos = [], sCol = [];
      for (let e = 0; e < edge.length - 1; e++) {
        const a = edge[e], b = edge[e + 1];
        const ax = pos[a * 3], ay = pos[a * 3 + 1], az = pos[a * 3 + 2], bx = pos[b * 3], by = pos[b * 3 + 1], bz = pos[b * 3 + 2];
        sPos.push(ax, ay, az, ax, ay - 0.6, az, bx, by, bz, bx, by, bz, ax, ay - 0.6, az, bx, by - 0.6, bz);
        for (let q = 0; q < 6; q++) sCol.push(colors[a * 3] * 0.7, colors[a * 3 + 1] * 0.7, colors[a * 3 + 2] * 0.7);
      }
      const sg = new THREE.BufferGeometry();
      sg.setAttribute("position", new THREE.Float32BufferAttribute(sPos, 3));
      sg.setAttribute("color", new THREE.Float32BufferAttribute(sCol, 3));
      sg.computeVertexNormals();
      return [geo, sg];
    }
    return [geo];
  }
  const groundMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0 });
  const skirtMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide });
  // Sous les zones détaillées, la grande zone doit rester partout en dessous du relief fin.
  // Chaque sommet prend le minimum du relief fin sur le carré de ±1 maille qui l'entoure :
  // tout point d'une maille étant dans le carré de ses quatre sommets, la surface grossière reste dessous.
  const sinkUnder = (finer) => (lon, lat, h, cell) => {
    let m = h;
    for (const g of finer) {
      if (lon + cell < g.lon[0] || lon - cell > g.lon[1] || lat + cell < g.lat[0] || lat - cell > g.lat[1]) continue;
      const i0 = Math.max(0, Math.floor((lon - cell - g.lon[0]) / g.step)), i1 = Math.min(g.cols - 1, Math.ceil((lon + cell - g.lon[0]) / g.step));
      const j0 = Math.max(0, Math.floor((g.lat[1] - lat - cell) / g.step)), j1 = Math.min(g.rows - 1, Math.ceil((g.lat[1] - lat + cell) / g.step));
      for (let j = j0; j <= j1; j += 2) for (let i = i0; i <= i1; i += 2) m = Math.min(m, g.h[j * g.cols + i]);
      m -= g.step >= 0.05 ? 15 : 60; // entre deux couches grossières, un écart invisible
    }
    return m;
  };
  // construction progressive : le fond d'abord, puis une zone par étape, pour ne pas figer la page
  const base = new THREE.Mesh(buildTerrain(region, isMobile ? 2 : 1, sinkUnder(locals))[0], groundMat);
  base.receiveShadow = true;
  scene.add(base);
  const queue = [...locals].sort((a, b) => b.step - a.step);
  const buildNext = () => {
    const g = queue.shift();
    if (!g) return;
    const finer = locals.filter((o) => o.step < g.step);
    const [geo, skirt] = buildTerrain(g, isMobile ? 2 : 1, finer.length ? sinkUnder(finer) : null);
    const m = new THREE.Mesh(geo, groundMat);
    m.receiveShadow = true;
    scene.add(m, new THREE.Mesh(skirt, skirtMat));
    setTimeout(buildNext, 30);
  };
  setTimeout(buildNext, 30);
  // décors (arbres, villes, monuments), grain du sol, batailles
  const decor = createDecor({ scene, X, Z, Y, hAt, isMobile, WD, renderer });
  decor.patchGround(groundMat);
  const benv = { scene, X, Z, yAt, isMobile, U, camTarget: [0, 0] };
  const battles = createBattles(benv, decor);
  // sur un écran étroit, la caméra recule un peu pour garder les deux armées dans le cadre
  const bcam = (ph) => { const c = battles.camFor(ph); if (mobile()) c.dist *= 1.45; return c; };
  // le réalisateur : pendant une simulation, la caméra filme les moments clés, plan par plan
  const director = createDirector(battles);
  const localG = new THREE.Group();
  scene.add(localG);
  // la mer suit la caméra, à la taille de la vue : un plan géant fausse la profondeur
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 24, 24), new THREE.MeshStandardMaterial({ color: 0x15506a, roughness: 0.1, metalness: 0, transparent: true, opacity: 0.8, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 }));
  decor.patchSea(sea.material);
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = 0.002;
  scene.add(sea);

  /* --- éclats de lumière (sprites) --- */
  const glowTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,248,225,1)"); gr.addColorStop(0.25, "rgba(255,220,150,0.65)"); gr.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const glow = (size, color = 0xffffff, opacity = 1) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    s.scale.setScalar(size);
    return s;
  };
  const gold = new THREE.MeshBasicMaterial({ color: 0xffd27a, toneMapped: false, fog: false });

  // tout ce qui dépend du chapitre vit dans ce groupe, vidé à chaque changement
  const fxGroup = new THREE.Group();
  scene.add(fxGroup);
  const disposeGroup = () => { while (fxGroup.children.length) { const o = fxGroup.children.pop(); o.traverse?.((m) => { if (m.geometry && m.geometry !== crowdGeo) m.geometry.dispose(); }); } };

  /* --- foules --- */
  const MAXD = 10000;
  const crowdGeo = decor.G.pawn;
  const crowdMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, emissive: 0x231a08, emissiveIntensity: 0.35, flatShading: true });
  crowdMat.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * 0.3;"); };
  const dots = new THREE.InstancedMesh(crowdGeo, crowdMat, MAXD);
  dots.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  dots.frustumCulled = false;
  dots.count = 0;
  dots.castShadow = true;
  scene.add(dots);
  const palette = (U.crowdColors ? U.crowdColors() : ["#f4d27e"]).map((c) => new THREE.Color(c));
  for (let i = 0; i < MAXD; i++) dots.setColorAt(i, palette[0]);
  const DP = { x: new Float32Array(MAXD), z: new Float32Array(MAXD), a: new Float32Array(MAXD), c: new Uint8Array(MAXD).fill(255) };
  const CW = 1.6, CD = 0.58; // la plaine des foules : 1,6 km sur 0,58 km
  const crowdSpace = () => ({ X: (u) => (u - 0.5) * CW, Y: (v) => (v - 0.5) * CD, w: CW, h: CD, sp: 0.014, mobile: mobile(), LY: -CD * 0.24, LYH: -CD * 0.62, enter: CD * 2.2 });
  let F = null, fT0 = 0, crowd = null;
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3();
  // repère local de la foule : x vers l'est (rot 0), z vers le sud, en km
  const toWorld = (fx, fz) => {
    const r = (crowd.rot || 0) * D2R, cx = X(crowd.at[0]), cz = Z(crowd.at[1]);
    return [cx + fx * Math.cos(r) + fz * Math.sin(r), cz - fx * Math.sin(r) + fz * Math.cos(r)];
  };

  /* --- état du chapitre --- */
  let chapter = null, view = null, t0 = performance.now();
  const cam = { x: X(41), z: Z(23), dist: 2300, pitch: 55, head: 0 };
  let fly = null, hour = 23, hourFrom = 23, hourTo = 23, envHour = -99, hourT0 = performance.now();
  let battle = null, bPhase = -1, lastP = 0, spoken = -1, voiceCut = false, free = false, paused = false;
  const marks = [], hots = [];
  let routeObj = null, arcs = [], beam = null, travel = null;

  const P = (id) => WD.P[id] || (GEO.places[id] && GEO.places[id]);
  const nameOf = (id) => (WD.names[id] ? U.tr(WD.names[id]) : S.places[id] ? U.tr(S.places[id]) : id);

  function tube(points, radius, color) {
    const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
    const segs = Math.min(1600, points.length * 6);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, radius, 6, false), color ? new THREE.MeshBasicMaterial({ color, toneMapped: false, fog: false }) : gold);
    m.userData = { curve, count: m.geometry.index.count };
    return m;
  }
  // un itinéraire épouse le relief
  function draped(lonlat, lift) {
    const pts = [];
    for (let i = 0; i < lonlat.length - 1; i++) {
      const a = lonlat[i], b = lonlat[i + 1];
      const n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.01));
      for (let k = 0; k < n; k++) {
        const t = k / n, lon = lerp(a[0], b[0], t), lat = lerp(a[1], b[1], t);
        pts.push(new THREE.Vector3(X(lon), Math.max(0, Y(hAt(lon, lat))) + lift, Z(lat)));
      }
    }
    const e = lonlat[lonlat.length - 1];
    pts.push(new THREE.Vector3(X(e[0]), Math.max(0, Y(hAt(e[0], e[1]))) + lift, Z(e[1])));
    return pts;
  }
  function arc(a, b, height, radius, color) {
    const A = new THREE.Vector3(X(a[0]), Math.max(0, Y(hAt(a[0], a[1]))), Z(a[1]));
    const B = new THREE.Vector3(X(b[0]), Math.max(0, Y(hAt(b[0], b[1]))), Z(b[1]));
    const M = A.clone().lerp(B, 0.5); M.y += height;
    const curve = new THREE.QuadraticBezierCurve3(A, M, B);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, radius, 6, false), color ? new THREE.MeshBasicMaterial({ color, toneMapped: false, fog: false, transparent: true }) : gold);
    m.userData = { curve, count: m.geometry.index.count, end: b };
    return m;
  }

  function setChapter(c) {
    chapter = c;
    canvas.hidden = !c;
    if (!c) { battle = null; battles.stop(); renderPanel(); return; }
    view = WD.views[c.id] || WD.views.intro;
    t0 = performance.now();
    closeCard();
    // une bataille (ou une scène simulée) prend la main sur la caméra et l'heure
    battle = battles.has(c.id) && battles.start(c.id) ? battles.def(c.id) : null;
    if (!battle) { battles.stop(); director.stop(); }
    view.battle = !!battle;
    bPhase = 0; spoken = -1; voiceCut = false; paused = false;
    if (free) setFree(false, true);
    renderPanel();
    // vol de la caméra vers le nouveau lieu
    const to = battle ? bcam(0) : { x: X(view.at[0]), z: Z(view.at[1]), dist: view.dist, pitch: view.pitch, head: view.head };
    const travelKm = Math.hypot(to.x - cam.x, to.z - cam.z);
    const bump = Math.max(0, travelKm * 0.9 - (cam.dist + to.dist) / 2);
    fly = reduceMotion ? null : { from: { ...cam }, to, t0, dur: 1600 + Math.min(3200, Math.sqrt(travelKm) * 90), bump };
    if (!fly) Object.assign(cam, to);
    if (battle) { director.reset(battle, performance.now() / 1000, to.head); cineTitle(0, fly ? fly.dur * 0.6 : 300); }
    else cineTitle(-1);
    hourFrom = hour; hourTo = battle ? battle.phases[0].hour : view.cycle ? 22 : view.hour; hourT0 = performance.now();
    // décor du chapitre
    disposeGroup();
    while (localG.children.length) { const o = localG.children.pop(); if (o.dispose) o.dispose(); }
    decor.local(view, c.id, localG);
    const nightNow = hourTo < 6 || hourTo > 19;
    decor.setBirds(view, nightNow);
    decor.setSmoke(view);
    marks.length = 0; arcs = []; beam = null; routeObj = null; travel = null;
    const scale = view.dist;
    for (const id of battle ? [] : view.marks || []) {
      const at = id === "mecca" ? WD.P.kaaba : id === "medina" ? WD.P.nabawi : P(id);
      if (!at) continue;
      const g = glow(scale * 0.035, 0xffd98a, 0.95);
      g.position.set(X(at[0]), Math.max(0, Y(hAt(at[0], at[1]))) + scale * 0.004, Z(at[1]));
      fxGroup.add(g);
      marks.push({ id, at, obj: g });
    }
    if (view.route && GEO.routes[view.route]) {
      const lift = scale * 0.003;
      routeObj = tube(draped(GEO.routes[view.route], lift), scale * 0.0022);
      routeObj.geometry.setDrawRange(0, 0);
      fxGroup.add(routeObj);
      travel = glow(scale * 0.05, 0xfff3d0);
      fxGroup.add(travel);
    }
    if (view.isra) {
      const a = arc(WD.P.kaaba, WD.P.jerusalem, 420, 3.2, 0xfff1c8);
      a.geometry.setDrawRange(0, 0); fxGroup.add(a); arcs.push(a);
      beam = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 1, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff1c8, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
      beam.position.set(X(WD.P.jerusalem[0]), 0, Z(WD.P.jerusalem[1]));
      beam.scale.y = 0.001; fxGroup.add(beam);
    }
    if (view.letters) {
      for (const [to, who] of [["jerusalem", "heraclius"], ["ctesiphon", "khosrow"], ["aksum", "negus"], ["alexandria", "muqawqis"], ["hajar", "mundhir"], ["bosra", "harith"]]) {
        const end = P(to);
        const a = arc(WD.P.nabawi, end, haversine(WD.P.nabawi, end) * 0.3, 4.5);
        a.geometry.setDrawRange(0, 0); a.userData.who = who; fxGroup.add(a); arcs.push(a);
      }
    }
    if (view.delegations) {
      for (const from of WD.delegations) {
        const a = arc(from, WD.P.nabawi, haversine(from, WD.P.nabawi) * 0.22, 3.5, 0xfff3d0);
        a.geometry.setDrawRange(0, 0); fxGroup.add(a); arcs.push(a);
      }
    }
    if (view.qibla) {
      const j = arc(WD.P.nabawi, WD.P.jerusalem, 260, 5, 0xfff3d0);
      const m = arc(WD.P.nabawi, WD.P.kaaba, 160, 5, 0xffd27a);
      fxGroup.add(j, m); arcs.push(j, m);
    }
    if (view.beam) {
      const b = view.beam;
      const gy = Y(hAt(b[0], b[1]));
      beam = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.09, 6, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe7a8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
      beam.position.set(X(b[0]), gy + 3, Z(b[1]));
      const g = glow(0.6, 0xffe7a8); g.position.set(X(b[0]), gy + 0.02, Z(b[1])); g.userData.cave = true;
      fxGroup.add(beam, g);
    }
    if (view.crowd && !battle) {
      crowd = view.crowd;
      if (crowd.name !== (F && F.name)) { F = U.formation(crowd.name, crowdSpace()); if (F) F.name = crowd.name; fT0 = performance.now(); }
    } else { crowd = null; F = null; }
    // découvertes de ce chapitre
    renderHots();
  }

  /* --- découvertes : boutons posés sur le terrain --- */
  const hotBox = document.getElementById("worldHot");
  const card = document.getElementById("discoverCard");
  function renderHots() {
    hotBox.innerHTML = "";
    hots.length = 0;
    const T = U.T();
    WD.discoveries.forEach((d, i) => {
      if (!d.ch.includes(chapter.id)) return;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "hot";
      b.dataset.i = i;
      b.setAttribute("aria-label", T.discover + " : " + U.tr(d).t);
      b.innerHTML = `<span class="hot-ring"></span><span class="hot-dot">+</span><span class="hot-label">${U.tr(d).t}</span>`;
      hotBox.appendChild(b);
      hots.push({ d, el: b, pos: new THREE.Vector3(X(d.at[0]), Math.max(0, Y(hAt(d.at[0], d.at[1]))), Z(d.at[1])) });
    });
  }
  hotBox.addEventListener("click", (ev) => {
    const b = ev.target.closest(".hot");
    if (b) openCard(WD.discoveries[+b.dataset.i], b);
  });
  let cardOpener = null;
  function openCard(d, opener) {
    const T = U.T();
    const kaabaKm = haversine(d.at, WD.P.kaaba), nabawiKm = haversine(d.at, WD.P.nabawi);
    const near = kaabaKm < 600 ? [kaabaKm, T.fromKaaba] : [nabawiKm, T.fromMedina];
    const h = hAt(d.at[0], d.at[1]);
    const lat = U.num(Math.round(d.at[1] * 100) / 100), lon = U.num(Math.round(d.at[0] * 100) / 100);
    card.querySelector("h3").textContent = U.tr(d).t;
    card.querySelector(".dc-text").textContent = U.tr(d).d;
    card.querySelector(".dc-data").innerHTML =
      (h > 0 ? `<span>${T.altitude} ≈ ${U.num(Math.round(h / 10) * 10)} m</span>` : "") +
      (near[0] > 0.3 ? `<span>${U.num(Math.round(near[0] * 10) / 10)} km ${near[1]}</span>` : "") +
      `<span>${lat}° N · ${lon}° E</span>`;
    // la photographie du lieu
    const ph = card.querySelector(".dc-photo"), pc = d.img && U.photos && U.photos.get(d.img);
    ph.hidden = true;
    ph.onclick = null;
    if (pc) {
      U.photos.load([pc.file]).then((found) => {
        if (!found.length || card.hidden || card.querySelector("h3").textContent !== U.tr(d).t) return;
        ph.querySelector("img").src = found[0].src;
        ph.hidden = false;
        ph.onclick = () => U.photos.open([pc], 0, ph, U.tr(d).t);
      });
    }
    card.hidden = false;
    cardOpener = opener;
    card.querySelector(".dc-close").focus({ preventScroll: true });
  }
  function closeCard() {
    if (card.hidden) return;
    card.hidden = true;
    if (cardOpener && document.body.contains(cardOpener)) cardOpener.focus({ preventScroll: true });
  }
  card.addEventListener("click", (ev) => { if (ev.target.closest(".dc-close")) closeCard(); });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") closeCard(); });

  /* --- lumière selon l'heure --- */
  const sunVec = new THREE.Vector3();
  const FOG_DAY = new THREE.Color("#d9cdb6"), FOG_DUSK = new THREE.Color("#c4916c"), FOG_NIGHT = new THREE.Color("#070b1c");
  const fogCol = new THREE.Color();
  function applyHour(hr) {
    const t = (hr - 6) / 12;
    const el = 72 * Math.sin(Math.PI * t), az = (90 + 180 * t) * D2R;
    sunVec.set(Math.sin(az) * Math.cos(el * D2R), Math.sin(el * D2R), -Math.cos(az) * Math.cos(el * D2R));
    su.sunPosition.value.copy(sunVec);
    const day = sstep(-4, 12, el), night = sstep(2, -10, el), low = 1 - sstep(4, 30, el);
    sun.position.copy(sunVec).multiplyScalar(1000);
    sun.intensity = 3.2 * day;
    sun.color.setRGB(1, lerp(0.95, 0.72, low), lerp(0.88, 0.5, low));
    // la nuit, un clair de lune bleuté laisse lire le relief
    moon.intensity = 1.3 * night;
    hemi.intensity = lerp(0.5, 0.42, day);
    hemi.color.set(day > 0.5 ? 0xbcd3ea : 0x6474a8);
    hemi.groundColor.set(day > 0.5 ? 0x7a6248 : 0x2a2c3a);
    starMat.opacity = night;
    renderer.toneMappingExposure = lerp(1.05, 0.55, day);
    fogCol.copy(FOG_NIGHT).lerp(FOG_DUSK, sstep(-10, 2, el)).lerp(FOG_DAY, sstep(6, 25, el));
    scene.fog.color.copy(fogCol);
    if (Math.abs(hr - envHour) > 0.75) {
      envHour = hr;
      if (envRT) envRT.dispose();
      envRT = pmrem.fromScene(envScene, 0, 1, 50000);
      scene.environment = envRT.texture;
      scene.environmentIntensity = lerp(0.15, 0.7, day);
    }
    return { el, night };
  }

  /* --- rendu de chaque image --- */
  let size = { W: 0, H: 0 };
  const sh = (a, b) => { let d = ((b - a + 540) % 360) - 180; return a + d; }; // plus court chemin angulaire
  function render(dt, t, p, st) {
    if (!chapter) return;
    const { W, H } = st;
    if (W !== size.W || H !== size.H) {
      size = { W, H };
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile() ? 1.5 : 1.75));
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      F = null; if (crowd) { F = U.formation(crowd.name, crowdSpace()); if (F) F.name = crowd.name; }
    }
    const now = performance.now();
    // la caméra
    if (fly) {
      const k = clamp((now - fly.t0) / fly.dur), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      cam.x = lerp(fly.from.x, fly.to.x, e); cam.z = lerp(fly.from.z, fly.to.z, e);
      cam.dist = Math.exp(lerp(Math.log(fly.from.dist), Math.log(fly.to.dist), e)) + fly.bump * Math.sin(Math.PI * e);
      cam.pitch = lerp(fly.from.pitch, fly.to.pitch, e) + (fly.bump > 0 ? 22 * Math.sin(Math.PI * e) : 0);
      cam.head = lerp(fly.from.head, sh(fly.from.head, fly.to.head), e);
      if (k >= 1) fly = null;
    } else if (!reduceMotion && !free) cam.head += (view.spin || 0) * dt;
    // l'itinéraire se trace, et la caméra peut suivre le voyageur
    if (routeObj) {
      const q = view === WD.views.hijra ? smooth(clamp((p - 0.18) / 0.72)) : smooth(clamp(p / 0.8));
      routeObj.geometry.setDrawRange(0, Math.floor((routeObj.userData.count * q) / 6) * 6);
      const pt = routeObj.userData.curve.getPointAt(Math.max(0.0001, q));
      travel.position.copy(pt);
      if (view.follow && !fly && !free) { cam.x = lerp(cam.x, pt.x, 0.08); cam.z = lerp(cam.z, pt.z, 0.08); }
      routeQ = q;
    }
    arcs.forEach((a, i) => {
      let q = 1;
      if (view.isra) q = smooth(clamp(p / 0.45));
      else if (view.letters) q = smooth(clamp(p * 1.8 - i * 0.12));
      else if (view.delegations) q = smooth(clamp(p * 1.6 - (i / arcs.length) * 0.7));
      else if (view.qibla) { const sw = smooth(clamp((p - 0.2) / 0.5)); a.material.opacity = i === 0 ? 1 - sw * 0.85 : 0.15 + sw * 0.85; }
      a.geometry.setDrawRange(0, Math.floor((a.userData.count * q) / 6) * 6);
      a.userData.q = q;
    });
    if (beam && view.isra) { const w = smooth(clamp((p - 0.5) / 0.35)); beam.scale.y = Math.max(0.001, w * 2600); beam.position.y = beam.scale.y / 2; }
    if (beam && view.beam) beam.material.opacity = 0.5 * smooth(clamp(p * 1.6));
    // la bataille : positions, phases, caméra et heure de chaque phase
    const pxScale = (H * renderer.getPixelRatio()) / (2 * Math.tan((camera.fov * D2R) / 2));
    if (battle) {
      p = toBattle(p);
      benv.camTarget[0] = cam.x; benv.camTarget[1] = cam.z;
      const ph = battles.update(dt, t, p, pxScale);
      if (ph !== bPhase && ph >= 0) {
        bPhase = ph;
        hourFrom = hour; hourTo = battle.phases[ph].hour; hourT0 = now;
        renderPanel();
        if (!free) cineTitle(ph, 250);
      }
      // en caméra libre, on ne reprend pas la main : seul le récit avance
      if (!free && ph >= 0) direct(dt, now, t, p, ph);
      if (ph !== spoken && ph >= 0) {
        spoken = ph;
        const x = U.tr(battle.phases[ph]);
        if (U.voice) U.voice.say(x.t + ". " + x.d, { replace: voiceCut });
        voiceCut = false;
      }
      updatePanel(p);
    }
    lastP = p;
    // l'heure : transition douce, ou la nuit qui laisse place à l'aube pendant l'Hégire
    const since = (now - hourT0) / 1000;
    if (view.cycle) hour = lerp(22, 30.5, smooth(clamp(p))) % 24;
    else hour = lerp(hourFrom, hourTo + (Math.abs(hourTo - hourFrom) > 12 ? (hourTo > hourFrom ? -24 : 24) : 0), smooth(clamp(since / 2.5)));
    hour = (hour + 24) % 24;
    applyHour(hour);
    decor.update(dt, t, cam, hour, pxScale);
    soundMood(now);
    // la foule
    if (F && crowd) renderCrowd(dt, t, p);
    else dots.count = 0;
    // placement de la caméra
    const tx = cam.x, tz = cam.z;
    const ty = Math.max(0, yAt(tx, tz));
    let pr = cam.pitch * D2R, hr = cam.head * D2R;
    if (battle && !free && !reduceMotion) {
      const stt = battles.stats, shake = (stt.melee * 0.8 + stt.gallop * 0.6) * clamp(0.5 / cam.dist, 0.25, 1);
      hr += (Math.sin(t * 0.83) * 0.3 + Math.sin(t * 1.9 + 1) * 0.12 + Math.sin(t * 14.3) * 0.45 * shake) * D2R;
      pr += (Math.sin(t * 0.67 + 2) * 0.22 + Math.sin(t * 17.1 + 3) * 0.32 * shake) * D2R;
    }
    const fx = Math.sin(hr), fz = -Math.cos(hr);
    const cx = tx - fx * Math.cos(pr) * cam.dist, cz = tz - fz * Math.cos(pr) * cam.dist;
    let cy = ty + Math.sin(pr) * cam.dist;
    cy = Math.max(cy, Math.max(0, yAt(cx, cz)) + cam.dist * 0.04 + 0.05);
    camera.position.set(cx, cy, cz);
    camera.near = Math.max(0.005, cam.dist * 0.002);
    camera.updateProjectionMatrix();
    camera.lookAt(tx, ty, tz);
    // la boîte des ombres suit le sujet, à la taille de la vue
    const S = clamp(cam.dist * 1.15, 0.35, 9), sc = sun.shadow.camera;
    sun.target.position.set(tx, ty, tz);
    sun.position.set(tx + sunVec.x * S * 3, ty + Math.max(0.05, sunVec.y) * S * 3, tz + sunVec.z * S * 3);
    sun.target.updateMatrixWorld();
    if (sc.right !== S) { sc.left = -S; sc.right = S; sc.top = S; sc.bottom = -S; sc.near = 0.01; sc.far = S * 8; sc.updateProjectionMatrix(); sun.shadow.normalBias = (S / 1024) * 1.5; }
    // le sujet se place à côté du texte
    const rtl = document.documentElement.dir === "rtl";
    // sur mobile, le sujet se place entre le panneau du haut et la fiche du bas
    const ax = mobile() ? W / 2 : W * (rtl ? 0.34 : 0.66), ay = mobile() ? H * (battle && !free ? 0.38 : free ? 0.48 : 0.32) : H * 0.5;
    camera.setViewOffset(W, H, W / 2 - ax, H / 2 - ay, W, H);
    scene.fog.density = 0.24 / Math.max(cam.dist, 0.5);
    sky.position.copy(camera.position);
    const seaSize = Math.max(60, cam.dist * 60);
    sea.scale.set(seaSize, seaSize, 1);
    sea.position.x = tx; sea.position.z = tz;
    // les éclats gardent une taille lisible
    for (const m of marks) m.obj.scale.setScalar(cam.dist * 0.035 * (1 + 0.08 * Math.sin(t * 2)));
    if (travel) travel.scale.setScalar(cam.dist * 0.05);
    fxGroup.children.forEach((o) => { if (o.userData.cave) o.scale.setScalar(0.5 + 0.08 * Math.sin(t * 3)); });
    renderer.render(scene, camera);
    placeHots();
    telemetry(tx, tz);
  }
  let routeQ = 0;

  function renderCrowd(dt, t, p) {
    const n = Math.min(F.n, MAXD);
    const o = [0, 0, 1];
    const since = (performance.now() - fT0) / 1000;
    const kk = reduceMotion ? 1 : 1 - Math.exp(-dt * 3);
    const r = 0.0042; // un pion grossi pour rester lisible depuis la caméra
    let last = 0;
    for (let i = 0; i < MAXD; i++) {
      let ta = 0;
      if (i < n) {
        o[2] = 1;
        const c = F.pos(i, p, t, o);
        ta = o[2];
        if (DP.c[i] !== c) { DP.c[i] = c; dots.setColorAt(i, palette[c] || palette[0]); dots.instanceColor.needsUpdate = true; }
        const go = since > (((i * 7919) % 1000) / 1000) * 0.6 ? kk : 0;
        DP.x[i] += (o[0] - DP.x[i]) * go;
        DP.z[i] += (o[1] - DP.z[i]) * go;
      } else if (DP.a[i] < 0.01) continue;
      DP.a[i] += (ta - DP.a[i]) * (reduceMotion ? 1 : Math.min(1, dt * 3));
      const s = Math.max(0.00001, DP.a[i]) * r;
      const [wx, wz] = toWorld(DP.x[i], DP.z[i]);
      v3.set(wx, Math.max(0, yAt(wx, wz)), wz);
      s3.set(s, s, s);
      m4.compose(v3, q4, s3);
      dots.setMatrixAt(i, m4);
      if (DP.a[i] > 0.01) last = i + 1;
    }
    dots.count = last;
    dots.instanceMatrix.needsUpdate = true;
  }

  /* --- boutons de découverte et données en direct --- */
  const proj = new THREE.Vector3();
  function toScreen(v) {
    proj.copy(v).project(camera);
    return [(proj.x * 0.5 + 0.5) * size.W, (-proj.y * 0.5 + 0.5) * size.H, proj.z < 1 && proj.z > -1];
  }
  function placeHots() {
    const cardEl = document.querySelector(".st-chapter.is-active .st-card");
    const cr = cardEl ? cardEl.getBoundingClientRect() : null;
    for (const h of hots) {
      const [x, y, ok] = toScreen(h.pos);
      const hidden = !ok || x < 10 || y < 70 || x > size.W - 10 || y > size.H - 80 || (cr && x > cr.left - 20 && x < cr.right + 20 && y > cr.top - 20 && y < cr.bottom + 20);
      h.el.hidden = hidden;
      if (!hidden) h.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    }
  }
  const tele = document.getElementById("worldTele");
  let teleT = 0;
  function telemetry(tx, tz) {
    const now = performance.now();
    if (now - teleT < 200) return;
    teleT = now;
    const T = U.T();
    const lon = lonOf(tx), lat = latOf(tz), h = hAt(lon, lat);
    const hr = hour;
    const tod = hr < 4.5 || hr >= 20 ? "night" : hr < 6.5 ? "dawn" : hr < 11 ? "morning" : hr < 14 ? "noon" : hr < 17 ? "afternoon" : "dusk";
    let extra = "";
    if (routeObj && WD.km[view.route]) {
      const total = WD.km[view.route];
      extra = `<span>${T.travelled} ≈ ${U.num(Math.round((total * routeQ) / 5) * 5)} km</span>`;
    }
    // les jours de l'Hégire suivent le voyageur, comme les kilomètres
    if (view === WD.views.hijra) extra += `<span>${T.day} ${U.num(Math.max(1, Math.ceil(routeQ * 12)))}</span>`;
    tele.innerHTML = `<span class="tod tod-${tod}">${T.tod[tod]}</span>` +
      `<span>${U.num(Math.round(Math.abs(lat) * 100) / 100)}° ${lat >= 0 ? "N" : "S"} · ${U.num(Math.round(lon * 100) / 100)}° E</span>` +
      (h > 0 ? `<span>${T.ground} ≈ ${U.num(Math.round(h / 10) * 10)} m</span>` : `<span>${T.sea}</span>`) + extra;
  }

  // étiquettes des lieux et des foules, écrites avec les outils du voyage
  function overlay(ctx, label, legend) {
    if (!chapter) return;
    const T = U.T();
    for (const m of marks) {
      // pas d'étiquette là où une découverte porte déjà un nom
      if (hots.some((h) => Math.abs(h.d.at[0] - m.at[0]) < 0.004 && Math.abs(h.d.at[1] - m.at[1]) < 0.004)) continue;
      const v = m.obj.position.clone(); v.y += cam.dist * 0.02;
      const [x, y, ok] = toScreen(v);
      if (ok) label(x, y, "", nameOf(m.id), "center");
    }
    for (const a of arcs) {
      if (!a.userData.who || (a.userData.q || 0) < 0.95) continue;
      const e = a.userData.end, v = new THREE.Vector3(X(e[0]), Y(hAt(e[0], e[1])) + cam.dist * 0.02, Z(e[1]));
      const [x, y, ok] = toScreen(v);
      if (ok) label(x, y, "", T.rulers[a.userData.who], "center");
    }
    if (view.qibla) {
      const sw = smooth(clamp((performance.now() - t0) / ((chapter.len || 1.25) * 4000) / 0.7));
      const v = new THREE.Vector3(X(WD.P.nabawi[0]), 30, Z(WD.P.nabawi[1]));
      const [x, y] = toScreen(v);
      label(x, y - 40, "", "Qibla → " + (sw < 0.5 ? T.qiblaNorth : T.qiblaSouth), "center");
    }
    if (battle) {
      for (const [x3, y3, z3, big, small] of battles.labels(lastP)) {
        const [x, y, ok] = toScreen(new THREE.Vector3(x3, y3, z3));
        if (ok) label(x, y, big, small, "center");
      }
    }
    if (F && crowd) {
      for (const [lx, lz, big, small] of F.labels()) {
        const [wx, wz] = toWorld(lx, lz);
        const [x, y, ok] = toScreen(new THREE.Vector3(wx, yAt(wx, wz) + 0.05, wz));
        if (ok) label(x, y, big, small, "center");
      }
      if (F.scale) legend(F.scale === 1 ? T.pawn.one : T.pawn.many.replace("{n}", U.num(Math.round(F.scale))));
    }
    if (view.iqra) {
      const p = clamp((performance.now() - t0) / ((chapter.len || 1.25) * 4000));
      const wa = smooth(clamp((p - 0.2) * 2.2));
      if (wa > 0.01) {
        const size = Math.min(window.innerWidth * (mobile() ? 0.28 : 0.11), 150);
        const cx = mobile() ? window.innerWidth / 2 : window.innerWidth * (document.documentElement.dir === "rtl" ? 0.34 : 0.66);
        const cy = mobile() ? window.innerHeight * 0.14 : window.innerHeight * 0.22;
        ctx.save();
        ctx.globalAlpha = wa; ctx.textAlign = "center";
        ctx.shadowColor = "rgba(255,214,130,0.9)"; ctx.shadowBlur = 30; ctx.fillStyle = "#ffe9b0";
        ctx.font = `${size}px Amiri, "Noto Naskh Arabic", serif`;
        ctx.fillText("اقْرَأْ", cx, cy + size * 0.35);
        ctx.shadowBlur = 0;
        if (T.iqraMeaning) { ctx.font = `italic ${Math.max(15, size * 0.16)}px "Alegreya Sans", sans-serif`; ctx.fillStyle = "rgba(255,240,210,0.85)"; ctx.fillText(T.iqraMeaning, cx, cy + size * 0.75); }
        ctx.restore();
      }
    }
  }

  /* --- le panneau de la simulation : phases, texte, accès direct --- */
  const panel = document.getElementById("battlePanel");
  function renderPanel() {
    if (!panel) return;
    document.body.classList.toggle("battle-on", !!battle);
    panel.hidden = !battle;
    if (!battle) { document.body.classList.remove("card-peek", "cine-hide"); return; }
    wake();
    const T = U.T(), ph = battle.phases[Math.max(0, bPhase)], n = battle.phases.length;
    panel.querySelector(".bt-step").textContent = `${T.simulation} · ${T.phase} ${U.num(Math.max(0, bPhase) + 1)}/${U.num(n)}`;
    panel.querySelector(".bt-title").textContent = U.tr(ph).t;
    panel.querySelector(".bt-text").textContent = U.tr(ph).d;
    const sc = battles.scale, scale = panel.querySelector(".bt-scale");
    if (scale) scale.textContent = sc === 1 ? T.pawn.one : T.pawn.many.replace("{n}", U.num(sc));
    const info = panel.querySelector(".bt-info");
    if (info) info.setAttribute("aria-pressed", String(document.body.classList.contains("card-peek")));
    const steps = panel.querySelector(".bt-steps");
    if (steps.children.length !== n || steps.dataset.ch !== chapter.id || steps.dataset.lang !== document.documentElement.lang) {
      steps.dataset.ch = chapter.id; steps.dataset.lang = document.documentElement.lang;
      steps.innerHTML = battle.phases.map((x, i) => `<button type="button" data-ph="${i}" aria-label="${T.phase} ${U.num(i + 1)} : ${U.tr(x).t.replace(/"/g, "&quot;")}"><i></i></button>`).join("");
    }
    const pb = panel.querySelector(".bt-pause");
    if (pb) { pb.setAttribute("aria-pressed", String(paused)); pb.setAttribute("aria-label", paused ? T.resume : T.pause); pb.classList.toggle("paused", paused); }
    [...steps.children].forEach((b, i) => { b.classList.toggle("done", i < bPhase); b.classList.toggle("on", i === bPhase); b.setAttribute("aria-current", i === bPhase ? "step" : "false"); });
  }
  function updatePanel(p) {
    if (!panel || !battle) return;
    const ph = battle.phases, i = Math.max(0, bPhase), a = ph[i].p, b = i + 1 < ph.length ? ph[i + 1].p : 1;
    const bar = panel.querySelector(`.bt-steps [data-ph="${i}"] i`);
    if (bar) bar.style.width = (clamp((p - a) / (b - a)) * 100).toFixed(1) + "%";
  }
  if (panel) panel.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-ph]");
    if (b && battle && U.seekChapter) { voiceCut = true; spoken = -1; U.seekChapter(storyAt(+b.dataset.ph) + 0.001); }
    if (ev.target.closest(".bt-replay") && U.seekChapter) { voiceCut = true; spoken = -1; paused = false; U.seekChapter(0); renderPanel(); }
    if (ev.target.closest(".bt-pause")) { paused = !paused; renderPanel(); }
    if (ev.target.closest(".bt-toggle")) panel.classList.toggle("open");
    if (ev.target.closest(".bt-info")) { document.body.classList.toggle("card-peek"); renderPanel(); }
  });

  /* --- la mise en scène : plans, coupes, titres --- */
  function direct(dt, now, t, p, ph) {
    const D = director.want(p, ph, t, { base: bcam(ph), cur: cam, aspect: size.W / Math.max(1, size.H), mobile: mobile() });
    if (!D) return;
    const to = { x: D.x, z: D.z, dist: D.dist, pitch: D.pitch, head: D.head };
    if (D.isNew) {
      // un nouveau plan : on coupe quand il est loin du précédent, sinon la caméra glisse jusqu'à lui
      const gap = Math.hypot(to.x - cam.x, to.z - cam.z), ratio = Math.abs(Math.log(to.dist / cam.dist));
      if (reduceMotion || gap > Math.max(cam.dist, to.dist) * 0.8 || ratio > 2.2) { Object.assign(cam, to); fly = null; if (!reduceMotion) dip(); }
      else fly = { from: { ...cam }, to, t0: now, dur: D.newPhase ? 2600 : 2200, bump: 0, track: true };
      return;
    }
    if (fly) { if (fly.track) fly.to = to; return; } // le mouvement en cours vise le sujet là où il se trouve
    // le plan suit son sujet, avec l'inertie d'une caméra tenue
    const k = 1 - Math.exp(-dt * 2.2), kh = 1 - Math.exp(-dt * 1.6);
    cam.x += (to.x - cam.x) * k; cam.z += (to.z - cam.z) * k;
    cam.dist *= Math.exp(Math.log(to.dist / cam.dist) * kh);
    cam.pitch += (to.pitch - cam.pitch) * kh;
    cam.head += (((to.head - cam.head + 540) % 360) - 180) * kh;
  }
  const cine = document.getElementById("cine");
  let titleT = 0, titleT2 = 0;
  // un fondu au noir très bref, comme une coupe au montage
  function dip() {
    if (!cine) return;
    cine.classList.remove("dip");
    void cine.offsetWidth;
    cine.classList.add("dip");
  }
  // le titre de la phase s'inscrit sur l'image, puis s'efface
  function cineTitle(ph, delay = 0) {
    if (!cine) return;
    clearTimeout(titleT); clearTimeout(titleT2);
    cine.classList.remove("title-on");
    if (ph < 0 || !battle || reduceMotion) return;
    titleT = setTimeout(() => {
      if (!battle || free) return;
      const T = U.T(), x = battle.phases[ph];
      const ev = chapter && S.events.find((e) => e.id === chapter.ev);
      cine.querySelector(".ct-k").textContent = ph === 0 && ev ? U.tr(ev).title : `${T.phase} ${U.num(ph + 1)}/${U.num(battle.phases.length)}`;
      cine.querySelector(".ct-t").textContent = U.tr(x).t;
      cine.classList.add("title-on");
      titleT2 = setTimeout(() => cine.classList.remove("title-on"), ph === 0 ? 4200 : 3200);
    }, delay);
  }
  // sur mobile, pendant la simulation, l'interface s'efface pour laisser l'image ; un toucher la rappelle
  let idleT = 0;
  function wake() {
    document.body.classList.remove("cine-hide");
    clearTimeout(idleT);
    if (!battle || !mobile()) return;
    idleT = setTimeout(() => {
      const b = document.body.classList;
      if (battle && mobile() && !free && !paused && !b.contains("drawer-open") && !b.contains("sheet-open") && !b.contains("card-peek") && document.getElementById("audioMenu").hidden) b.add("cine-hide");
    }, 3500);
  }
  document.addEventListener("pointerdown", wake, true);
  document.addEventListener("keydown", wake, true);

  function handles(c) { return !!c; }
  /* --- le rythme : chaque phase dure au moins le temps de la lire --- */
  function timing(b) {
    const D = b.phases.map((x, i) => {
      const e = i + 1 < b.phases.length ? b.phases[i + 1].p : 1, tx = U.tr(x);
      const words = (tx.t + " " + tx.d).split(/\s+/).length;
      return Math.max((e - x.p) * b.dur, 6 + words * 0.38);
    });
    const cum = [0];
    D.forEach((d) => cum.push(cum[cum.length - 1] + d));
    return { D, cum, total: cum[cum.length - 1] };
  }
  // temps du récit (0 → 1) → progression de la bataille
  function toBattle(ps) {
    const T = timing(battle), s = clamp(ps) * T.total, ph = battle.phases;
    let i = 0;
    while (i < ph.length - 1 && s >= T.cum[i + 1]) i++;
    const f = clamp((s - T.cum[i]) / T.D[i]), e = i + 1 < ph.length ? ph[i + 1].p : 1;
    return lerp(ph[i].p, e, f);
  }
  const storyAt = (i) => { const T = timing(battle); return T.cum[i] / T.total; };
  const duration = (c) => (c && battles.has(c.id) ? timing(battles.def(c.id)).total * 1000 : 0);
  // le récit attend : la voix n'a pas fini la phase, ou la scène est en pause
  function hold(ps) {
    if (!battle) return false;
    if (paused) return true;
    if (!U.voice || !U.voice.on || !U.voice.speaking) return false;
    const T = timing(battle), i = Math.max(0, bPhase), next = i + 1 < battle.phases.length ? T.cum[i + 1] / T.total : 1;
    return ps >= next - 0.004;
  }

  /* --- caméra libre : tourner, zoomer, se déplacer --- */
  const camLayer = document.getElementById("camLayer"), camBtn = document.getElementById("camBtn"), camHint = document.getElementById("camHint");
  let hintT = 0;
  function homeCam() { return battle ? bcam(Math.max(0, bPhase)) : { x: X(view.at[0]), z: Z(view.at[1]), dist: view.dist, pitch: view.pitch, head: view.head }; }
  function setFree(v, silent) {
    free = !!v;
    document.body.classList.toggle("cam-free", free);
    if (camBtn) {
      camBtn.setAttribute("aria-pressed", String(free));
      camBtn.querySelector("span").textContent = free ? U.T().camBack : U.T().camFree;
    }
    if (free) {
      fly = null;
      if (camHint) { camHint.hidden = false; clearTimeout(hintT); hintT = setTimeout(() => { camHint.hidden = true; }, 4500); }
    } else {
      if (camHint) camHint.hidden = true;
      if (!silent && view) { const to = homeCam(); fly = reduceMotion ? null : { from: { ...cam }, to, t0: performance.now(), dur: 1800, bump: 0 }; if (!fly) Object.assign(cam, to); }
    }
  }
  if (camBtn) camBtn.addEventListener("click", () => setFree(!free));
  const orbit = (dx, dy) => { cam.head -= dx * 0.28; cam.pitch = clamp(cam.pitch + dy * 0.22, 6, 86); };
  const zoom = (k) => { cam.dist = clamp(cam.dist * k, 0.12, 2800); };
  function pan(dx, dy) {
    const kpx = (cam.dist * 2 * Math.tan((camera.fov * D2R) / 2)) / Math.max(200, size.H), h = cam.head * D2R;
    const rx = Math.cos(h), rz = Math.sin(h), fx = Math.sin(h), fz = -Math.cos(h);
    const up = 1 / Math.max(0.35, Math.sin(cam.pitch * D2R));
    cam.x += (-rx * dx + fx * dy * up) * kpx; cam.z += (-rz * dx + fz * dy * up) * kpx;
  }
  const ptrs = new Map();
  let pinch = null;
  function onDown(e) {
    if (!free) return;
    e.preventDefault();
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, btn: e.button, shift: e.shiftKey });
    if (e.target.setPointerCapture) try { e.target.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
    fly = null;
  }
  function onMove(e) {
    const pt = ptrs.get(e.pointerId);
    if (!pt || !free) return;
    const dx = e.clientX - pt.x, dy = e.clientY - pt.y;
    if (ptrs.size === 1) {
      if (pt.btn === 2 || pt.shift || e.ctrlKey) pan(dx, dy); else orbit(dx, dy);
    } else if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      const d0 = Math.hypot(a.x - b.x, a.y - b.y);
      pt.x = e.clientX; pt.y = e.clientY;
      const [c, d] = [...ptrs.values()];
      const d1 = Math.hypot(c.x - d.x, c.y - d.y);
      if (d0 > 0 && d1 > 0) zoom(d0 / d1);
      pan(dx / 2, dy / 2);
      return;
    }
    pt.x = e.clientX; pt.y = e.clientY;
  }
  const onUp = (e) => { ptrs.delete(e.pointerId); };
  if (camLayer) {
    camLayer.addEventListener("pointerdown", onDown);
    camLayer.addEventListener("pointermove", onMove);
    camLayer.addEventListener("pointerup", onUp);
    camLayer.addEventListener("pointercancel", onUp);
    camLayer.addEventListener("contextmenu", (e) => e.preventDefault());
    camLayer.addEventListener("wheel", (e) => { e.preventDefault(); e.stopPropagation(); zoom(Math.exp((e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY) * 0.0012)); }, { passive: false });
  }
  // à la souris, on peut aussi saisir la scène directement, hors de la fiche du chapitre
  const story = document.getElementById("story");
  if (story) story.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !chapter || free) return;
    if (e.target.closest(".st-card, button, a, .st-intro-inner, .st-outro-inner, .st-period-inner")) return;
    setFree(true);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, btn: 0 });
    const mv = (ev) => onMove(ev), up = (ev) => { onUp(ev); window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && free) setFree(false); });

  /* --- l'ambiance sonore suit la scène --- */
  let moodT = 0;
  function soundMood(now) {
    if (!U.sound || !U.sound.on || now - moodT < 600) return;
    moodT = now;
    const night = hour < 5.3 || hour > 19.2;
    const st = battle ? battles.stats : null;
    const sea = hAt(lonOf(cam.x), latOf(cam.z)) <= 0 || view.route === "abyssinia" ? 0.7 : 0;
    const near = view.dist < 20;
    U.sound.mood({
      night, sea, crickets: night && near ? 0.8 : night ? 0.3 : 0, birds: !night && near && !battle ? 0.5 : 0,
      wind: battle ? 0.35 : view.dist > 300 ? 0.55 : 0.45,
      battle: st ? st.melee : 0, gallop: st ? st.gallop : 0, arrows: st ? st.arrows : 0, fire: st ? st.fires : 0, storm: st ? st.storm : 0,
      bells: view.route && view.dist < 200 ? 0.5 : st ? st.march * 0.6 : 0, town: !night && near && !battle && view.marks && view.marks.length ? 0.4 : 0
    });
  }
  U.onLang.push(() => { if (chapter) { F = null; if (crowd) { F = U.formation(crowd.name, crowdSpace()); if (F) F.name = crowd.name; } renderHots(); renderPanel(); } });
  U.onLang.push(() => { if (camBtn) camBtn.querySelector("span").textContent = free ? U.T().camBack : U.T().camFree; });
  U.stage3d = { handles, setChapter, render, overlay, duration, hold, world: true };
  canvas.hidden = true;
  if (U.stageReady) U.stageReady();
}
