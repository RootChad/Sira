/* Sira — les décors du monde 3D
   Modèles simples (palmiers, acacias, maisons de terre, tentes, puits, la Ka'ba, la mosquée du Prophète,
   les forts de Khaybar, chevaux, chameaux, pions), grain du sol, mer animée, nuages, oiseaux, particules.
   Les tailles sont en mètres ; le monde est en kilomètres. Les décors sont un peu agrandis pour rester lisibles. */
import * as THREE from "./vendor/three.module.min.js";

const D2R = Math.PI / 180;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (t) => t * t * (3 - 2 * t);
const sstep = (a, b, v) => smooth(clamp((v - a) / (b - a)));
export function rng(seed) { // mulberry32 : un hasard reproductible
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const seedOf = (s) => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

/* ------------------------------------------------------------------ */
/* Assemblage de modèles : morceaux colorés fusionnés en une géométrie  */
/* ------------------------------------------------------------------ */
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
export const M = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
function part(geo, color, m) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  if (m) g.applyMatrix4(m);
  for (const k of Object.keys(g.attributes)) if (k !== "position" && k !== "normal") g.deleteAttribute(k);
  const c = new THREE.Color(color), n = g.attributes.position.count, col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}
function merge(parts) {
  let n = 0;
  for (const p of parts) n += p.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3);
  let o = 0;
  for (const p of parts) {
    if (!p.attributes.normal) p.computeVertexNormals();
    pos.set(p.attributes.position.array, o * 3); nor.set(p.attributes.normal.array, o * 3); col.set(p.attributes.color.array, o * 3);
    o += p.attributes.position.count;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}
// prisme de tente : largeur 1 (x), hauteur 1 (y), longueur 1 (z)
function prism() {
  const a = [-0.5, 0, -0.5], b = [0.5, 0, -0.5], c = [0, 1, -0.5], d = [-0.5, 0, 0.5], e = [0.5, 0, 0.5], f = [0, 1, 0.5];
  const tri = [a, c, b, d, e, f, a, d, f, a, f, c, b, c, f, b, f, e];
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(tri.flat(), 3));
  g.computeVertexNormals();
  return g;
}

export function buildModels() {
  const G = {};
  // palmier dattier : un tronc, une couronne de palmes qui retombent
  {
    const parts = [part(new THREE.CylinderGeometry(0.2, 0.33, 11, 5, 3), "#6b5236", M(0, 5.5, 0))];
    const frond = new THREE.ConeGeometry(0.75, 5.2, 4, 1).translate(0, 2.6, 0);
    for (let k = 0; k < 11; k++) {
      const a = (k / 11) * Math.PI * 2 + (k % 2) * 0.2, droop = (k % 3 === 0 ? 8 : 32) * D2R;
      const dir = new THREE.Vector3(Math.cos(a) * Math.cos(droop), -Math.sin(droop) + (k % 3 === 0 ? 0.7 : 0), Math.sin(a) * Math.cos(droop)).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      const m = new THREE.Matrix4().compose(new THREE.Vector3(0, 11, 0), q, new THREE.Vector3(1, 1, 0.3));
      parts.push(part(frond, k % 2 ? "#3f5a26" : "#4f6a2e", m));
    }
    parts.push(part(new THREE.IcosahedronGeometry(0.5, 0), "#8a5a22", M(0, 10.6, 0))); // les régimes de dattes
    G.palm = merge(parts);
  }
  // acacia : tronc court, couronne plate en ombrelle
  G.acacia = merge([
    part(new THREE.CylinderGeometry(0.13, 0.22, 2.6, 4), "#5a4632", M(0, 1.3, 0)),
    part(new THREE.CylinderGeometry(0.08, 0.12, 1.8, 4), "#5a4632", M(0.5, 2.6, 0, 0, 0, -0.7)),
    part(new THREE.CylinderGeometry(0.08, 0.12, 1.8, 4), "#5a4632", M(-0.45, 2.6, 0.2, 0.2, 0, 0.7)),
    part(new THREE.IcosahedronGeometry(1, 0), "#6c7a43", M(0, 3.4, 0, 0, 0, 0, 3.6, 0.85, 3.2))
  ]);
  // arbre rond des vergers (Ta'if) et jujubier (sidr)
  G.tree = merge([
    part(new THREE.CylinderGeometry(0.15, 0.25, 2.4, 4), "#5a4632", M(0, 1.2, 0)),
    part(new THREE.IcosahedronGeometry(1, 1), "#4c6a30", M(0, 3.4, 0, 0, 0, 0, 2.4, 2.1, 2.4))
  ]);
  G.shrub = merge([part(new THREE.IcosahedronGeometry(1, 0), "#7b7a4b", M(0, 0.35, 0, 0, 0, 0, 1, 0.6, 1))]);
  G.rock = merge([part(new THREE.DodecahedronGeometry(1, 0), "#7a6450", M(0, 0.35, 0, 0.3, 0.5, 0.2, 1, 0.7, 1))]);
  // maison de terre : un cube, une porte sombre, un toit plat plus clair
  {
    const box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0).toNonIndexed();
    const n = box.attributes.position.count, col = new Float32Array(n * 3);
    box.computeVertexNormals();
    const top = new THREE.Color("#d8b888"), side = new THREE.Color("#b08a5c");
    for (let i = 0; i < n; i++) { const c = box.attributes.normal.array[i * 3 + 1] > 0.5 ? top : side; col.set([c.r, c.g, c.b], i * 3); }
    box.setAttribute("color", new THREE.BufferAttribute(col, 3));
    for (const k of Object.keys(box.attributes)) if (!["position", "normal", "color"].includes(k)) box.deleteAttribute(k);
    G.house = merge([box, part(new THREE.BoxGeometry(0.22, 0.5, 0.02), "#3b2c20", M(0.15, 0.25, 0.505))]);
  }
  // tente bédouine en poil de chèvre, tente blanche de pèlerin
  G.tent = merge([part(prism(), "#3a302a")]);
  G.whiteTent = merge([part(new THREE.ConeGeometry(1, 1, 8, 1), "#efe9dc", M(0, 0.5, 0))]);
  // puits : margelle de pierre, eau sombre, une potence de bois
  G.well = merge([
    part(new THREE.TorusGeometry(1.5, 0.5, 5, 12), "#8e7a62", M(0, 0.4, 0, Math.PI / 2)),
    part(new THREE.CircleGeometry(1.1, 12), "#1d3440", M(0, 0.55, 0, -Math.PI / 2)),
    part(new THREE.BoxGeometry(0.15, 2.4, 0.15), "#5a4632", M(-1.5, 1.2, 0)),
    part(new THREE.BoxGeometry(0.15, 2.4, 0.15), "#5a4632", M(1.5, 1.2, 0)),
    part(new THREE.BoxGeometry(3.2, 0.15, 0.15), "#5a4632", M(0, 2.4, 0))
  ]);
  // abri de palmes (al-'arish), sur pieux
  G.hut = merge([
    ...[[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]].map(([x, z]) => part(new THREE.CylinderGeometry(0.12, 0.14, 2.6, 4), "#5a4632", M(x, 1.3, z))),
    part(new THREE.BoxGeometry(4.4, 0.35, 4.4), "#6d6a3a", M(0, 2.7, 0))
  ]);
  // pion : la forme d'une pièce de jeu, sans figure humaine
  {
    const prof = [[0, 0], [0.95, 0], [0.9, 0.22], [0.55, 0.42], [0.42, 1.25], [0.62, 1.42], [0.3, 1.58], [0, 1.6]].map(([x, y]) => new THREE.Vector2(x, y));
    G.pawn = merge([part(new THREE.LatheGeometry(prof, 6), "#ffffff"), part(new THREE.IcosahedronGeometry(0.5, 0), "#ffffff", M(0, 1.98, 0))]);
  }
  // cheval (le cavalier est un pion posé dessus)
  G.horse = merge([
    part(new THREE.BoxGeometry(0.7, 0.72, 1.8), "#6a4429", M(0, 1.35, 0)),
    part(new THREE.BoxGeometry(0.34, 0.95, 0.42), "#6a4429", M(0, 1.85, 0.88, 0.55, 0, 0)),
    part(new THREE.BoxGeometry(0.28, 0.3, 0.62), "#5b3a23", M(0, 2.28, 1.2, 0.25, 0, 0)),
    ...[[-0.22, 0.7], [0.22, 0.7], [-0.22, -0.7], [0.22, -0.7]].map(([x, z]) => part(new THREE.BoxGeometry(0.15, 1.05, 0.15), "#3d281a", M(x, 0.52, z))),
    part(new THREE.BoxGeometry(0.1, 0.75, 0.12), "#2c1d14", M(0, 1.3, -0.98, -0.4, 0, 0))
  ]);
  // chameau
  G.camel = merge([
    part(new THREE.BoxGeometry(0.8, 0.75, 1.9), "#b08a5a", M(0, 1.95, 0)),
    part(new THREE.IcosahedronGeometry(0.55, 1), "#a8814f", M(0, 2.45, -0.1, 0, 0, 0, 1, 0.75, 1.3)),
    part(new THREE.BoxGeometry(0.28, 1.1, 0.3), "#b08a5a", M(0, 2.3, 1.15, -0.5, 0, 0)),
    part(new THREE.BoxGeometry(0.28, 0.3, 0.62), "#9c7748", M(0, 2.8, 1.5, 0.15, 0, 0)),
    ...[[-0.26, 0.72], [0.26, 0.72], [-0.26, -0.72], [0.26, -0.72]].map(([x, z]) => part(new THREE.BoxGeometry(0.16, 1.6, 0.16), "#8d6b42", M(x, 0.8, z)))
  ]);
  G.sheep = merge([
    part(new THREE.IcosahedronGeometry(0.45, 0), "#ebe4d4", M(0, 0.55, 0, 0, 0, 0, 0.85, 0.75, 1.15)),
    part(new THREE.BoxGeometry(0.2, 0.22, 0.3), "#3a3330", M(0, 0.7, 0.5))
  ]);
  G.idol = merge([part(new THREE.BoxGeometry(0.6, 2.0, 0.5), "#8b8178", M(0, 1.0, 0)), part(new THREE.IcosahedronGeometry(0.38, 0), "#8b8178", M(0, 2.25, 0))]);
  G.arrow = merge([part(new THREE.BoxGeometry(0.035, 0.035, 1), "#3b2a1c"), part(new THREE.ConeGeometry(0.06, 0.18, 4), "#2a2a2a", M(0, 0, 0.58, Math.PI / 2, 0, 0))]);
  G.pole = merge([part(new THREE.CylinderGeometry(0.05, 0.06, 4.6, 4), "#4a3626", M(0, 2.3, 0))]);
  G.flag = new THREE.PlaneGeometry(1.7, 1.05, 10, 1).translate(0.85, 3.95, 0);
  // une butte douce, dont le bord s'enfonce dans le sol
  G.mound = new THREE.SphereGeometry(1, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, -0.15, 0);
  G.trench = merge([part(new THREE.BoxGeometry(1, 1, 1), "#2a2119", M(0, -0.45, 0))]);
  G.earth = merge([part(new THREE.CylinderGeometry(0.5, 0.9, 1, 5, 1), "#8a7055", M(0, 0.4, 0, 0, 0, 0, 1, 0.8, 1))]);
  // forts de Khaybar : une tour de pierre et son mur
  G.fort = merge([
    part(new THREE.BoxGeometry(14, 14, 14), "#8b7458", M(0, 7, 0)),
    part(new THREE.BoxGeometry(9, 7, 9), "#9a8263", M(3, 17, -2)),
    part(new THREE.BoxGeometry(30, 4, 1.5), "#7f6a51", M(10, 2, 10)),
    part(new THREE.BoxGeometry(1.5, 4, 22), "#7f6a51", M(-12, 2, 4))
  ]);
  return G;
}

/* ------------------------------------------------------------------ */
/* Textures                                                            */
/* ------------------------------------------------------------------ */
function noiseTexture(size = 256) {
  // bruit de valeur périodique, plusieurs octaves
  const d = new Uint8Array(size * size * 4);
  const lat = (n, s) => { const r = rng(s), a = new Float32Array(n * n); for (let i = 0; i < a.length; i++) a[i] = r(); return a; };
  const oct = [[8, 0.4], [16, 0.27], [32, 0.18], [64, 0.1], [128, 0.05]].map(([n, w], k) => ({ n, w, a: lat(n, 11 + k) }));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let v = 0;
    for (const o of oct) {
      const fx = (x / size) * o.n, fy = (y / size) * o.n, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = smooth(fx - x0), ty = smooth(fy - y0);
      const g = (i, j) => o.a[((j + o.n) % o.n) * o.n + ((i + o.n) % o.n)];
      v += o.w * ((g(x0, y0) * (1 - tx) + g(x0 + 1, y0) * tx) * (1 - ty) + (g(x0, y0 + 1) * (1 - tx) + g(x0 + 1, y0 + 1) * tx) * ty);
    }
    const k = (y * size + x) * 4, b = Math.round(clamp(v) * 255);
    d[k] = b; d[k + 1] = b; d[k + 2] = b; d[k + 3] = 255;
  }
  const t = new THREE.DataTexture(d, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}
function softTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.45, "rgba(255,255,255,0.5)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ------------------------------------------------------------------ */
/* Particules : poussière, sable, pluie, vent, fumée, feux             */
/* ------------------------------------------------------------------ */
export class Particles {
  constructor(max, { color = "#d8c2a0", additive = false, tex, minPx = 0 }) {
    this.max = max; this.n = 0;
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(max * 3); this.size = new Float32Array(max); this.alpha = new Float32Array(max);
    this.vel = new Float32Array(max * 3); this.life = new Float32Array(max); this.maxLife = new Float32Array(max); this.s0 = new Float32Array(max); this.grow = new Float32Array(max); this.a0 = new Float32Array(max);
    g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aSize", new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aAlpha", new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    g.setDrawRange(0, 0);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uTex: { value: tex }, uColor: { value: new THREE.Color(color) }, uScale: { value: 400 }, uMin: { value: minPx } },
      vertexShader: "uniform float uScale; uniform float uMin; attribute float aSize; attribute float aAlpha; varying float vA;\n" +
        "void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = clamp(aSize * uScale / max(-mv.z, 0.001), uMin, 400.0); vA = aAlpha; }",
      fragmentShader: "uniform sampler2D uTex; uniform vec3 uColor; varying float vA;\n" +
        "void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(uColor, t.a * vA); }",
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    this.points = new THREE.Points(g, this.mat);
    this.points.frustumCulled = false;
    this.geo = g;
  }
  emit(x, y, z, vx, vy, vz, life, size, grow = 1, alpha = 0.6) {
    let i = this.n < this.max ? this.n++ : Math.floor(Math.random() * this.max);
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    this.life[i] = 0; this.maxLife[i] = life; this.s0[i] = size; this.grow[i] = grow; this.a0[i] = alpha;
  }
  update(dt, drag = 0.6, gravity = 0) {
    let w = 0;
    const k = Math.exp(-drag * dt);
    for (let i = 0; i < this.n; i++) {
      this.life[i] += dt;
      if (this.life[i] >= this.maxLife[i]) continue;
      const f = this.life[i] / this.maxLife[i];
      if (w !== i) {
        for (let a = 0; a < 3; a++) { this.pos[w * 3 + a] = this.pos[i * 3 + a]; this.vel[w * 3 + a] = this.vel[i * 3 + a]; }
        this.life[w] = this.life[i]; this.maxLife[w] = this.maxLife[i]; this.s0[w] = this.s0[i]; this.grow[w] = this.grow[i]; this.a0[w] = this.a0[i];
      }
      this.vel[w * 3 + 1] -= gravity * dt;
      for (let a = 0; a < 3; a++) { this.vel[w * 3 + a] *= k; this.pos[w * 3 + a] += this.vel[w * 3 + a] * dt; }
      this.size[w] = this.s0[w] * (1 + this.grow[w] * f);
      this.alpha[w] = this.a0[w] * Math.min(1, f * 6) * (1 - f);
      w++;
    }
    this.n = w;
    this.geo.setDrawRange(0, w);
    for (const a of ["position", "aSize", "aAlpha"]) this.geo.attributes[a].needsUpdate = true;
  }
  clear() { this.n = 0; this.geo.setDrawRange(0, 0); }
  // pour des points fixes (feux) : on écrit soi-même pos, size, alpha, puis on publie n points
  flush(n) {
    this.n = 0;
    this.geo.setDrawRange(0, n);
    for (const a of ["position", "aSize", "aAlpha"]) this.geo.attributes[a].needsUpdate = true;
  }
}

/* ------------------------------------------------------------------ */
/* Le décor fixe et le décor de chaque plan                            */
/* ------------------------------------------------------------------ */
export function createDecor(env) {
  const { scene, X, Z, Y, hAt, isMobile, WD, renderer } = env;
  const G = buildModels();
  const E = 1.6; // les décors sont agrandis pour rester lisibles de loin
  const matV = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0, flatShading: true });
  const soft = softTexture();
  const detail = noiseTexture(256);
  const KM = 0.001;
  const yOf = (lon, lat) => Math.max(0, Y(hAt(lon, lat)));
  const slopeAt = (lon, lat) => {
    const d = 0.0004, a = hAt(lon - d, lat), b = hAt(lon + d, lat), c = hAt(lon, lat - d), e = hAt(lon, lat + d);
    return Math.hypot(b - a, e - c) / 80; // pente approximative (m/m)
  };
  // une liste d'éléments posés au sol → un InstancedMesh
  const o3 = new THREE.Object3D();
  function instanced(geo, mat, list) {
    const m = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length));
    m.count = list.length;
    list.forEach((it, i) => {
      o3.position.set(it.x, it.y, it.z);
      o3.rotation.set(it.rx || 0, it.ry || 0, it.rz || 0);
      o3.scale.set(it.s * (it.sx || 1), it.s * (it.sy || 1), it.s * (it.sz || 1));
      o3.updateMatrix();
      m.setMatrixAt(i, o3.matrix);
      if (it.c) m.setColorAt(i, it.c);
    });
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
    return m;
  }
  const tint = (r, base, amp) => new THREE.Color(base).offsetHSL((r() - 0.5) * amp, (r() - 0.5) * amp, (r() - 0.5) * amp * 1.4);

  /* --- grain du sol : bruit à plusieurs échelles et relief fin selon la distance --- */
  function patchGround(mat) {
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uDetail = { value: detail };
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWPos;")
        .replace("#include <fog_vertex>", "#include <fog_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", `#include <common>
uniform sampler2D uDetail; varying vec3 vWPos;
float dn(vec2 p) { return texture2D(uDetail, p).r; }
vec3 sPerturb(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float fd) {
  vec3 sx = normalize(dFdx(surf_pos)), sy = normalize(dFdy(surf_pos));
  vec3 r1 = cross(sy, surf_norm), r2 = cross(surf_norm, sx);
  float det = dot(sx, r1) * fd;
  return normalize(abs(det) * surf_norm - sign(det) * (dHdxy.x * r1 + dHdxy.y * r2));
}`)
        .replace("#include <color_fragment>", `#include <color_fragment>
float camD = length(vViewPosition);
vec2 wp = vWPos.xz;
float n0 = dn(wp * 0.21 + 0.13), n1 = dn(wp * 1.7 + 0.37), n2 = dn(wp * 13.0 + 0.71), n3 = dn(wp * 95.0);
float f1 = 1.0 - smoothstep(25.0, 160.0, camD), f2 = 1.0 - smoothstep(2.5, 22.0, camD), f3 = 1.0 - smoothstep(0.35, 3.5, camD);
diffuseColor.rgb *= 1.0 + (n0 - 0.5) * 0.22 + (n1 - 0.5) * 0.3 * f1 + (n2 - 0.5) * 0.34 * f2 + (n3 - 0.5) * 0.3 * f3;`)
        .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
float b1 = 1.0 - smoothstep(6.0, 40.0, camD), b2 = 1.0 - smoothstep(1.0, 6.0, camD);
float hb = (n2 - 0.5) * b2 * 0.9 + (n3 - 0.5) * f3 * 0.7 + (n1 - 0.5) * b1 * 0.6;
normal = sPerturb(-vViewPosition, normal, vec2(dFdx(hb), dFdy(hb)) * 1.6, faceDirection);`);
    };
    mat.needsUpdate = true;
  }

  /* --- la mer : vaguelettes et reflets du soleil --- */
  const seaUniforms = { uTime: { value: 0 }, uDetail: { value: detail } };
  function patchSea(mat) {
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, seaUniforms);
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWPos;")
        .replace("#include <fog_vertex>", "#include <fog_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", `#include <common>
uniform sampler2D uDetail; uniform float uTime; varying vec3 vWPos;
float dn(vec2 p) { return texture2D(uDetail, p).r; }
vec3 sPerturb(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float fd) {
  vec3 sx = normalize(dFdx(surf_pos)), sy = normalize(dFdy(surf_pos));
  vec3 r1 = cross(sy, surf_norm), r2 = cross(surf_norm, sx);
  float det = dot(sx, r1) * fd;
  return normalize(abs(det) * surf_norm - sign(det) * (dHdxy.x * r1 + dHdxy.y * r2));
}`)
        .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
float camD = length(vViewPosition);
vec2 wp = vWPos.xz;
float w1 = dn(wp * 0.9 + vec2(uTime * 0.012, uTime * 0.007)) + dn(wp * 1.3 - vec2(uTime * 0.009, -uTime * 0.011));
float w2 = dn(wp * 11.0 + vec2(uTime * 0.05, 0.0)) + dn(wp * 15.0 - vec2(0.0, uTime * 0.06));
float hb = w1 * (1.0 - smoothstep(60.0, 400.0, camD)) * 0.8 + w2 * (1.0 - smoothstep(3.0, 30.0, camD)) * 0.6;
normal = sPerturb(-vViewPosition, normal, vec2(dFdx(hb), dFdy(hb)) * 2.0, faceDirection);`);
    };
    mat.needsUpdate = true;
  }

  /* --- le décor fixe : palmeraies, villes, monuments --- */
  const fixed = new THREE.Group();
  scene.add(fixed);
  const P = WD.P;
  const dense = isMobile ? 0.4 : 1;
  const houseAreas = [
    // [lon, lat, rayon m, nombre, altitude max au-dessus du centre (m)]
    [P.kaaba[0], P.kaaba[1], 820, 1500, 30, 55],
    [P.nabawi[0], P.nabawi[1], 420, 280, 40, 26], [P.quba[0], P.quba[1], 260, 110, 40, 22], [39.627, 24.452, 260, 90, 40, 0],
    [39.598, 24.468, 220, 70, 40, 0], [39.603, 24.452, 220, 60, 40, 0],
    [P.taif[0], P.taif[1], 520, 280, 60, 0], [P.khaybar[0] + 0.01, P.khaybar[1] - 0.012, 650, 160, 80, 0],
    [38.777, 23.738, 220, 40, 30, 0], [P.tabuk[0], P.tabuk[1], 320, 70, 40, 0]
  ];
  const groves = [
    // [lon, lat, rayon (°), nombre, essence]
    [39.612, 24.462, 0.034, 4200, "palm"], [39.617, 24.437, 0.016, 1400, "palm"], [39.635, 24.452, 0.014, 900, "palm"], [39.588, 24.476, 0.01, 260, "palm"],
    [39.285, 25.705, 0.045, 1700, "palm"], [38.776, 23.734, 0.006, 120, "palm"], [39.70, 21.62, 0.02, 420, "palm"], [39.1, 23.1, 0.008, 90, "palm"],
    [36.57, 28.38, 0.018, 260, "palm"], [P.taif[0], P.taif[1], 0.05, 900, "tree"], [40.38, 21.24, 0.03, 400, "tree"]
  ];
  function inHouses(lon, lat) {
    for (const [x, y, r] of houseAreas) {
      const dx = (lon - x) * 103000, dy = (lat - y) * 110570;
      if (dx * dx + dy * dy < r * r * 0.5) return true;
    }
    return false;
  }
  // des bosquets serrés, comme de vraies palmeraies, plutôt qu'un semis clairsemé
  function buildGroves() {
    for (const [lon0, lat0, R, count, kind] of groves) {
      const r = rng(seedOf(lon0 + ":" + lat0));
      const list = [];
      const want = Math.round(count * dense), per = kind === "palm" ? 90 : 40;
      const kx = 111320 * Math.cos(lat0 * D2R), kz = 110570;
      for (let g = 0; g < 200 && list.length < want; g++) {
        const a = r() * Math.PI * 2, d = R * Math.sqrt(r());
        const glon = lon0 + (Math.cos(a) * d) / Math.cos(lat0 * D2R), glat = lat0 + Math.sin(a) * d;
        if (hAt(glon, glat) <= 2 || slopeAt(glon, glat) > 0.1 || inHouses(glon, glat)) continue;
        const gr = 60 + r() * 120;
        for (let k = 0; k < per * 2 && list.length < want; k++) {
          const b = r() * Math.PI * 2, e = gr * Math.sqrt(r());
          const lon = glon + (Math.cos(b) * e) / kx, lat = glat + (Math.sin(b) * e) / kz;
          const h = hAt(lon, lat);
          if (h <= 2 || slopeAt(lon, lat) > 0.14) continue;
          const s = KM * E * (kind === "palm" ? 1.25 : 1) * (0.75 + r() * 0.45);
          list.push({ x: X(lon), y: Y(h), z: Z(lat), s, ry: r() * 6.28, rx: (r() - 0.5) * 0.12, rz: (r() - 0.5) * 0.12, c: tint(r, "#ffffff", 0.12) });
        }
      }
      if (list.length) fixed.add(instanced(G[kind], matV, list));
    }
  }
  function buildTowns() {
    houseAreas.forEach(([lon0, lat0, R, count, hMax, hole], idx) => {
      const r = rng(seedOf("town" + idx));
      const h0 = hAt(lon0, lat0);
      const list = [], ups = [];
      const want = Math.round(count * (isMobile ? 0.6 : 1));
      for (let k = 0; k < want * 6 && list.length < want; k++) {
        const a = r() * Math.PI * 2, d = R * Math.pow(r(), 0.75);
        if (d < hole) continue;
        const lon = lon0 + (Math.cos(a) * d) / (111320 * Math.cos(lat0 * D2R)), lat = lat0 + (Math.sin(a) * d) / 110570;
        const h = hAt(lon, lat);
        if (h <= 2 || h - h0 > hMax || slopeAt(lon, lat) > 0.22) continue;
        const w = (8 + r() * 9) * E, dpt = (8 + r() * 9) * E, ht = (3.5 + r() * 3) * E;
        const ry = (idx === 0 ? 0.35 : 0) + Math.round(r() * 3) * (Math.PI / 2) + (r() - 0.5) * 0.25;
        const base = { x: X(lon), y: Y(h) - 0.002, z: Z(lat), s: KM, sx: w, sy: ht + 2, sz: dpt, ry, c: tint(r, "#ffffff", 0.1) };
        list.push(base);
        if (r() < 0.28) ups.push({ ...base, y: base.y + (ht + 2) * KM, sx: w * 0.5, sy: ht * 0.75, sz: dpt * 0.5 });
      }
      if (list.length) fixed.add(instanced(G.house, matV, list.concat(ups)));
    });
  }
  // la Ka'ba : la kiswa sombre, sa bande dorée, la porte, le Hijr d'Ismaël, l'esplanade claire
  function buildKaaba() {
    const [lon, lat] = P.kaaba, y = Y(hAt(lon, lat));
    const k = new THREE.Group();
    const S = 2.2 * KM;
    const kiswa = new THREE.MeshStandardMaterial({ color: 0x15151a, roughness: 0.75 });
    const goldM = new THREE.MeshStandardMaterial({ color: 0xc9a24a, roughness: 0.35, metalness: 0.7 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(11.6, 13, 12.6), kiswa); body.position.y = 6.5;
    const band = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.9, 12.8), goldM); band.position.y = 9.3;
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 1.8), goldM); door.position.set(5.85, 3.8, 2.2);
    const hijr = new THREE.Mesh(new THREE.TorusGeometry(7.5, 0.7, 4, 20, Math.PI), new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.8 }));
    hijr.rotation.x = -Math.PI / 2; hijr.position.set(-6.3, 0.6, 0); hijr.rotation.z = Math.PI / 2;
    const plaza = new THREE.Mesh(new THREE.CircleGeometry(48, 40), new THREE.MeshStandardMaterial({ color: 0xe7dcc2, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.3;
    k.add(body, band, door, hijr, plaza);
    k.scale.setScalar(S);
    k.position.set(X(lon), y, Z(lat));
    k.rotation.y = -0.45; // la Ka'ba n'est pas alignée sur le nord
    fixed.add(k);
  }
  // une mosquée de l'an 1 : murs de briques crues, un auvent de palmes sur troncs de palmiers
  function buildMosque(at, w, d, roofSide, scale) {
    const [lon, lat] = at, y = Y(hAt(lon, lat));
    const g = new THREE.Group();
    const wall = new THREE.MeshStandardMaterial({ color: 0xb69872, roughness: 0.95 });
    const roofM = new THREE.MeshStandardMaterial({ color: 0x6c6238, roughness: 1 });
    const trunk = new THREE.MeshStandardMaterial({ color: 0x6b5236, roughness: 1 });
    const H = 3.3, T = 0.9;
    const add = (geo, mat, x, yy, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, yy, z); g.add(m); return m; };
    add(new THREE.BoxGeometry(w, H, T), wall, 0, H / 2, -d / 2); add(new THREE.BoxGeometry(w, H, T), wall, 0, H / 2, d / 2);
    add(new THREE.BoxGeometry(T, H, d), wall, -w / 2, H / 2, 0); add(new THREE.BoxGeometry(T, H, d), wall, w / 2, H / 2, 0);
    const rz = roofSide * (d / 2 - 4.5);
    add(new THREE.BoxGeometry(w - 1, 0.45, 8), roofM, 0, H + 0.1, rz);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) add(new THREE.CylinderGeometry(0.3, 0.35, H, 5), trunk, -w / 2 + 3 + i * ((w - 6) / 5), H / 2, rz - 2 + j * 4);
    add(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: 0xe0cfaa, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), 0, 0.08, 0).rotation.x = -Math.PI / 2;
    // les chambres des épouses du Prophète ﷺ, le long du mur est
    if (scale > 0) for (let i = 0; i < 5; i++) add(new THREE.BoxGeometry(5, 3, 4.4), wall, w / 2 + 2.9, 1.5, -d / 2 + 3 + i * 5.2);
    g.scale.setScalar(Math.abs(scale) * KM);
    g.position.set(X(lon), y, Z(lat));
    fixed.add(g);
  }
  function buildForts() {
    const [lon0, lat0] = P.khaybar;
    const r = rng(77), list = [];
    for (let k = 0; k < 400 && list.length < 8; k++) {
      const lon = lon0 + (r() - 0.5) * 0.09, lat = lat0 + (r() - 0.5) * 0.08;
      const h = hAt(lon, lat);
      const around = (hAt(lon + 0.004, lat) + hAt(lon - 0.004, lat) + hAt(lon, lat + 0.004) + hAt(lon, lat - 0.004)) / 4;
      if (h - around < 6 || list.some((f) => Math.hypot(f.lon - lon, f.lat - lat) < 0.012)) continue;
      list.push({ lon, lat, x: X(lon), y: Y(h) - 0.003, z: Z(lat), s: KM * E, ry: r() * 6.28 });
    }
    if (list.length) fixed.add(instanced(G.fort, matV, list));
  }
  // construction étalée, pour ne pas figer la page
  const jobs = [buildKaaba, () => buildMosque(P.nabawi, 34, 30, 1, 1.9), () => buildMosque(P.quba, 22, 22, -1, -1.9), () => buildMosque(P.qiblatayn, 18, 16, -1, -1.9), buildTowns, buildGroves, buildForts];
  const runJobs = () => { const j = jobs.shift(); if (!j) return; j(); setTimeout(runJobs, 40); };
  setTimeout(runJobs, 200);

  /* --- le décor de chaque plan : acacias, buissons, rochers autour du lieu --- */
  function local(view, id, group) {
    if (!view || view.dist > 30) return;
    const r = rng(seedOf(id));
    const [lon0, lat0] = view.at;
    const R = Math.min(14, Math.max(2.2, view.dist * 1.7)); // km
    const nA = Math.round((isMobile ? 220 : 650) * Math.min(1, 6 / R + 0.4)), nS = isMobile ? 500 : 1600, nR = isMobile ? 400 : 1300;
    const acacias = [], shrubs = [], rocks = [];
    const kx = 111.32 * Math.cos(lat0 * D2R), kz = 110.57;
    const pick = () => { const a = r() * Math.PI * 2, d = R * Math.sqrt(r()); return [lon0 + (Math.cos(a) * d) / kx, lat0 + (Math.sin(a) * d) / kz]; };
    for (let k = 0; k < nA * 6 && acacias.length < nA; k++) {
      const [lon, lat] = pick(), h = hAt(lon, lat);
      if (h <= 3 || inHouses(lon, lat)) continue;
      const sl = slopeAt(lon, lat);
      const around = (hAt(lon + 0.003, lat) + hAt(lon - 0.003, lat) + hAt(lon, lat + 0.003) + hAt(lon, lat - 0.003)) / 4;
      const wadi = clamp((around - h) / 8 + 0.3); // les arbres préfèrent le fond des vallées
      if (sl > 0.18 || r() > wadi) continue;
      acacias.push({ x: X(lon), y: Y(h), z: Z(lat), s: KM * E * (0.7 + r() * 0.6), ry: r() * 6.28, c: tint(r, "#ffffff", 0.14) });
    }
    for (let k = 0; k < nS * 3 && shrubs.length < nS; k++) {
      const [lon, lat] = pick(), h = hAt(lon, lat);
      if (h <= 3 || slopeAt(lon, lat) > 0.3) continue;
      shrubs.push({ x: X(lon), y: Y(h), z: Z(lat), s: KM * E * (0.8 + r() * 1.4), ry: r() * 6.28, c: tint(r, "#ffffff", 0.2) });
    }
    for (let k = 0; k < nR * 3 && rocks.length < nR; k++) {
      const [lon, lat] = pick(), h = hAt(lon, lat);
      const sl = slopeAt(lon, lat);
      if (h <= 3 || (sl < 0.08 && r() > 0.25)) continue;
      const big = r() < 0.06 ? 2.2 : 1;
      rocks.push({ x: X(lon), y: Y(h), z: Z(lat), s: KM * E * (0.8 + r() * 1.6) * big, ry: r() * 6.28, rx: r(), c: tint(r, "#ffffff", 0.25) });
    }
    if (acacias.length) group.add(instanced(G.acacia, matV, acacias));
    if (shrubs.length) group.add(instanced(G.shrub, matV, shrubs));
    if (rocks.length) group.add(instanced(G.rock, matV, rocks));
  }

  /* --- nuages : une couche vue de haut, comme sur une image satellite --- */
  const clouds = (() => {
    const N = 512, c = document.createElement("canvas"); c.width = c.height = N;
    const g = c.getContext("2d"), img = g.createImageData(N, N);
    const lat = (n, sd) => { const r = rng(sd), a = new Float32Array((n + 1) * (n + 1)); for (let i = 0; i < a.length; i++) a[i] = r(); return a; };
    const oct = [[6, 0.5], [13, 0.25], [27, 0.15], [55, 0.1]].map(([n, w], k) => ({ n, w, a: lat(n, 91 + k) }));
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let v = 0;
      for (const o of oct) {
        const fx = (x / N) * o.n, fy = (y / N) * o.n, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = smooth(fx - x0), ty = smooth(fy - y0), w = o.n + 1;
        v += o.w * ((o.a[y0 * w + x0] * (1 - tx) + o.a[y0 * w + x0 + 1] * tx) * (1 - ty) + (o.a[(y0 + 1) * w + x0] * (1 - tx) + o.a[(y0 + 1) * w + x0 + 1] * tx) * ty);
      }
      // des nuages plus rares sur le désert du sud, plus fréquents au nord
      const k = (y * N + x) * 4, al = sstep(0.6 + (y / N) * 0.06, 0.78, v) * 0.72;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = 255; img.data[k + 3] = Math.round(al * 255);
    }
    g.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const w = X(53) - X(29), h = Z(9) - Z(37);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.set((X(53) + X(29)) / 2, 11, (Z(9) + Z(37)) / 2);
    m.renderOrder = 5;
    scene.add(m);
    return m;
  })();

  /* --- oiseaux : une volée qui tourne au-dessus du lieu, le jour --- */
  const NB = isMobile ? 18 : 36;
  const wingGeo = new THREE.BufferGeometry();
  wingGeo.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0.25, 0, 0, -0.2, 1.1, 0, -0.05], 3));
  wingGeo.computeVertexNormals();
  const birdMat = new THREE.MeshBasicMaterial({ color: 0x2b2420, side: THREE.DoubleSide });
  const wingL = new THREE.InstancedMesh(wingGeo, birdMat, NB), wingR = new THREE.InstancedMesh(wingGeo, birdMat, NB);
  wingL.frustumCulled = wingR.frustumCulled = false;
  scene.add(wingL, wingR);
  const birds = { on: false, x: 0, z: 0, y: 0, r: 0.3 };
  function setBirds(view, night) {
    birds.on = !!view && view.dist < 12 && !night && !view.crowd && !view.battle;
    if (!birds.on) { wingL.count = wingR.count = 0; return; }
    const [lon, lat] = view.at;
    birds.x = X(lon) + 0.3; birds.z = Z(lat) - 0.2; birds.y = yOf(lon, lat) + 0.12 + view.dist * 0.02; birds.r = 0.12 + view.dist * 0.03;
    wingL.count = wingR.count = NB;
  }
  const bq = new THREE.Quaternion(), bq2 = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), fwd = new THREE.Vector3(0, 0, 1);
  function updateBirds(t, camDist) {
    if (!birds.on) return;
    const s = Math.max(0.004, camDist * 0.0012); // grossis pour rester visibles
    for (let i = 0; i < NB; i++) {
      const ph = t * (0.18 + (i % 5) * 0.012) + i * 0.37, rr = birds.r * (0.6 + ((i * 37) % 10) / 22);
      const x = birds.x + Math.cos(ph) * rr, z = birds.z + Math.sin(ph) * rr, y = birds.y + Math.sin(ph * 1.7 + i) * 0.02 + (i % 4) * 0.01;
      const flap = Math.sin(t * 9 + i * 1.3) * 0.6;
      bq.setFromAxisAngle(up, -ph);
      _v.set(x, y, z); _s.set(s, s, s);
      bq2.setFromAxisAngle(fwd, flap); _q.copy(bq).multiply(bq2);
      _m.compose(_v, _q, _s); wingR.setMatrixAt(i, _m);
      bq2.setFromAxisAngle(fwd, Math.PI - flap); _q.copy(bq).multiply(bq2);
      _m.compose(_v, _q, _s); wingL.setMatrixAt(i, _m);
    }
    wingL.instanceMatrix.needsUpdate = wingR.instanceMatrix.needsUpdate = true;
  }

  /* --- fumée des foyers au crépuscule --- */
  const smoke = new Particles(isMobile ? 160 : 400, { color: "#c9c1b4", tex: soft });
  scene.add(smoke.points);
  let smokeAt = null;
  function setSmoke(view) {
    smoke.clear();
    smokeAt = null;
    if (!view || view.dist > 16 || view.battle) return;
    const town = houseAreas.find(([lon, lat, R]) => Math.hypot((lon - view.at[0]) * 103, (lat - view.at[1]) * 110.6) < Math.max(3, view.dist * 0.9));
    if (town) smokeAt = { lon: town[0], lat: town[1], R: town[2] / 1000 };
  }

  function update(dt, t, cam, hour, viewH) {
    seaUniforms.uTime.value = t;
    // les décors fixes disparaissent quand on vole très haut
    fixed.visible = cam.dist < 120;
    const co = sstep(120, 600, cam.dist);
    clouds.material.opacity = 0.8 * co;
    clouds.visible = co > 0.01;
    updateBirds(t, cam.dist);
    // une fumée légère monte des maisons le soir et le matin
    if (smokeAt && ((hour > 16.5 && hour < 21) || (hour > 5.5 && hour < 8)) && Math.random() < dt * 14) {
      const a = Math.random() * 6.28, d = smokeAt.R * Math.sqrt(Math.random());
      const lon = smokeAt.lon + Math.cos(a) * d / 103, lat = smokeAt.lat + Math.sin(a) * d / 110.6;
      smoke.emit(X(lon), yOf(lon, lat) + 0.012, Z(lat), 0.004, 0.012, 0.002, 9, 0.012, 3, 0.35);
    }
    smoke.mat.uniforms.uScale.value = viewH;
    smoke.update(dt, 0.15, 0);
  }

  return { G, matV, soft, patchGround, patchSea, local, setBirds, setSmoke, update, instanced, yOf, E };
}
