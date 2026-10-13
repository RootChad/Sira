/* Sira — les batailles, simulées sur le vrai terrain
   Chaque armée est un ensemble de pions (aucune figure humaine), de cavaliers et de chameaux.
   Leur position se calcule à partir de la progression du chapitre (0 → 1) : on peut revenir
   à n'importe quelle phase, la scène se recompose à l'identique. */
import * as THREE from "./vendor/three.module.min.js";
import { Particles, rng } from "./world-decor.js";
import { BATTLES } from "./battles-data.js";

const KM = 0.001, D2R = Math.PI / 180;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (t) => t * t * (3 - 2 * t);
const sstep = (a, b, v) => smooth(clamp((v - a) / (b - a)));
const lerp = (a, b, t) => a + (b - a) * t;
const H = (i, k) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
// musulmans en vert, Quraysh en rouge, leurs alliés en orange, pèlerins en blanc
const SIDE = ["#2f9a70", "#b8382a", "#d27a22", "#fbfaf6"];
const ARCHER = "#8fe0b8";

export function createBattles(env, decor) {
  const { scene, X, Z, yAt, isMobile, U } = env;
  const G = decor.G, matV = decor.matV;
  const EB = 3; // pions, chevaux et chameaux agrandis pour rester lisibles
  const root = new THREE.Group();
  scene.add(root);
  // un léger éclat propre : les pions restent lisibles à l'ombre et au crépuscule
  const glowUp = (mat, k) => { mat.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * " + k.toFixed(2) + ";"); }; return mat; };
  const pawnMat = glowUp(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.05, flatShading: true }), 0.3);
  const tentMat = glowUp(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true }), 0.35);
  const white = new THREE.Color(1, 1, 1);
  const pool = (geo, mat, max) => {
    const m = new THREE.InstancedMesh(geo, mat, max);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false;
    for (let i = 0; i < max; i++) m.setColorAt(i, white);
    m.count = 0;
    m.castShadow = true;
    root.add(m);
    return m;
  };
  const MAXP = isMobile ? 4500 : 8500;
  const pawns = pool(G.pawn, pawnMat, isMobile ? 2600 : 5200), soldiers = pool(G.soldier, pawnMat, MAXP), archers = pool(G.archer, pawnMat, 1600), horses = pool(G.horse, matV, 900), riders = pool(G.pawn, pawnMat, 900);
  const camels = pool(G.camel, matV, 1200), sheep = pool(G.sheep, matV, 1400), tents = pool(G.tent, matV, 700), arrows = pool(G.arrow, matV, 900);
  const wtents = pool(G.whiteTent, tentMat, 600);
  const idols = pool(G.idol, matV, 360), poles = pool(G.pole, matV, 24), trench = pool(G.trench, matV, 800), earth = pool(G.earth, matV, 800);
  const flagTime = { value: 0 };
  const flagMat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.85 });
  flagMat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = flagTime;
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nuniform float uTime;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nfloat fw = max(0.0, transformed.x);\ntransformed.z += sin(transformed.x * 3.2 - uTime * 7.0) * 0.16 * fw;\ntransformed.y += sin(transformed.x * 2.1 - uTime * 5.0) * 0.04 * fw;");
  };
  const flags = pool(G.flag, flagMat, 24);
  const dust = new Particles(isMobile ? 600 : 1600, { color: "#cdb48e", tex: decor.soft });
  const sand = new Particles(500, { color: "#f2d48a", tex: decor.soft, additive: true });
  const rain = new Particles(isMobile ? 500 : 1100, { color: "#b9c7d8", tex: decor.soft, minPx: 1.2 });
  const wind = new Particles(isMobile ? 400 : 900, { color: "#d3c09e", tex: decor.soft });
  const fires = new Particles(3200, { color: "#ffad55", tex: decor.soft, additive: true, minPx: 3 });
  const smoke = new Particles(isMobile ? 260 : 600, { color: "#8f877c", tex: decor.soft });
  for (const ps of [dust, sand, rain, wind, fires, smoke]) root.add(ps.points);
  const moundMat = new THREE.MeshStandardMaterial({ color: 0xcdb08a, roughness: 1 });
  const staticG = new THREE.Group();
  root.add(staticG);

  /* --- état --- */
  let B = null, units = [], scaleEff = 1, Ox = 0, Oz = 0, dur = 40;
  let tentList = [], wtentList = [], fireList = [], trenchSegs = [], idolList = [], bannerList = [];
  const W = (e, n, out) => { out[0] = Ox + e * KM; out[1] = Oz - n * KM; return out; };
  const wv = [0, 0];

  // longueur cumulée d'un tracé, pour y répartir des pions ou des feux
  const pathCache = new WeakMap();
  function pathAt(path, u, out) {
    let c = pathCache.get(path);
    if (!c) {
      const L = [0];
      for (let i = 1; i < path.length; i++) L.push(L[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
      c = L; pathCache.set(path, c);
    }
    const s = u * c[c.length - 1];
    let k = 1;
    while (k < c.length - 1 && c[k] < s) k++;
    const a = path[k - 1], b = path[k], seg = c[k] - c[k - 1], f = seg ? (s - c[k - 1]) / seg : 0;
    const de = (b[0] - a[0]) / (seg || 1), dn = (b[1] - a[1]) / (seg || 1);
    out[0] = a[0] + (b[0] - a[0]) * f; out[1] = a[1] + (b[1] - a[1]) * f; out[2] = de; out[3] = dn;
    return out;
  }
  const pt4 = [0, 0, 0, 0];

  /* --- formations : où se tient le pion i d'une unité, pour une clé donnée (mètres) --- */
  function layout(u, K, i, t, out) {
    const e = K[1], n = K[2], face = K[3] * D2R, mode = K[4], o = K[5] || {};
    const sp = o.sp || u.sp, N = u.N, hx = u.h[i * 4], hy = u.h[i * 4 + 1];
    let r = 0, b = 0;
    switch (mode) {
      case "path": {
        pathAt(o.path, (i + 0.5) / N, pt4);
        const off = (o.off || 0) - hy * (o.depth || 0), nx = -pt4[3], ny = pt4[2];
        out[0] = pt4[0] + nx * off + pt4[2] * (hx - 0.5) * 6;
        out[1] = pt4[1] + ny * off + pt4[3] * (hx - 0.5) * 6;
        if (o.dig) out[1] += Math.sin(t * 6 + hx * 30) * 0.8;
        return out;
      }
      case "annulus": {
        const a = ((o.a0 || 0) + ((o.a1 ?? 1) - (o.a0 || 0)) * hx) * Math.PI * 2, R = o.r0 + (o.r1 - o.r0) * Math.sqrt(hy);
        out[0] = e + Math.cos(a) * R; out[1] = n + Math.sin(a) * R;
        return out;
      }
      case "ring": {
        const a = (i / N) * Math.PI * 2, R = o.r || (sp * N) / 6.28;
        out[0] = e + Math.cos(a) * R; out[1] = n + Math.sin(a) * R;
        return out;
      }
      case "scatter": case "camp": case "rout": {
        const R = sp * Math.sqrt(N) * 0.62 * (o.spread || (mode === "rout" ? 2.2 : 1.4));
        const a = hx * Math.PI * 2, d = R * Math.sqrt(hy);
        r = Math.cos(a) * d; b = Math.sin(a) * d;
        if (mode === "rout") { b = b * 1.6 + R * 0.5; r += Math.sin(t * 2 + hx * 30) * sp * 0.5; }
        break;
      }
      default: { // block, line, column, melee : des rangs
        const cols = Math.max(1, Math.min(N, mode === "line" ? Math.ceil(N / 2) : o.w || (mode === "column" ? 4 : u.w || Math.ceil(Math.sqrt(N * 2)))));
        const c = i % cols, row = Math.floor(i / cols);
        r = (c - (cols - 1) / 2) * sp + (hx - 0.5) * sp * 0.3;
        b = row * sp * 0.9 + (hy - 0.5) * sp * 0.3;
        if (mode === "melee") { r += Math.sin(t * 3.1 + hx * 40) * sp * 0.6; b += Math.cos(t * 2.7 + hy * 40) * sp * 0.6 - sp * 0.4; }
      }
    }
    // avant = cap ; droite = cap + 90°
    const fe = Math.sin(face), fn = Math.cos(face);
    out[0] = e + fn * r - fe * b;
    out[1] = n - fe * r - fn * b;
    return out;
  }
  // où en est l'unité (avec un léger retard propre à chaque pion, pour que les rangs ondulent)
  const SG = { A: null, B: null, f: 0 };
  function seg(u, pm, o = SG) {
    const k = u.keys;
    o.A = o.B = k[k.length - 1]; o.f = 0;
    if (pm <= k[0][0]) { o.A = o.B = k[0]; return o; }
    for (let j = 0; j < k.length - 1; j++) if (pm < k[j + 1][0]) { o.A = k[j]; o.B = k[j + 1]; o.f = smooth((pm - k[j][0]) / (k[j + 1][0] - k[j][0])); break; }
    return o;
  }

  /* --- mise en place d'une bataille --- */
  function start(name) {
    stop();
    B = BATTLES[name];
    if (!B) return false;
    dur = B.dur;
    Ox = X(B.origin[0]); Oz = Z(B.origin[1]);
    // sur mobile, deux fois moins de pions pour les grandes armées
    const count = (s) => B.units.reduce((a, u) => a + (u.exact || u.type === "camel" || u.type === "sheep" ? 0 : Math.round(u.n / s)), 0);
    scaleEff = B.scale;
    while (count(scaleEff) > (isMobile ? 2600 : 7200)) scaleEff *= 2;
    const slots = { inf: 0, arch: 0, pil: 0, cav: 0, camel: 0, sheep: 0 };
    units = B.units.map((d, ui) => {
      const N = d.exact ? d.n : Math.max(1, Math.round(d.n / scaleEff));
      const h = new Float32Array(N * 4);
      for (let i = 0; i < h.length; i++) h[i] = H(i + ui * 7919, 3 + (i % 4));
      // fantassins armés, archers, pèlerins (sans armes), cavaliers, chameaux, moutons
      const kind = d.type === "inf" && d.side === 3 ? "pil" : d.type;
      const u = { ...d, N, h, cur: new Float32Array(N * 2), base: slots[kind], kind, lag: 0.018, center: [0, 0], vis: 0 };
      slots[kind] += N;
      u.losses = (d.loss || []).map(([p0, p1, c]) => [p0, p1, d.exact ? c : Math.max(1, Math.round(c / scaleEff))]);
      // couleur de chaque pion
      const col = new THREE.Color(d.type === "arch" ? ARCHER : SIDE[d.side] || SIDE[0]);
      const tgt = kind === "cav" ? riders : kind === "inf" ? soldiers : kind === "arch" ? archers : kind === "pil" ? pawns : null;
      if (tgt) for (let i = 0; i < N; i++) {
        if (u.base + i >= tgt.instanceMatrix.count) break;
        const c = col.clone().offsetHSL(0, 0, (u.h[i * 4 + 2] - 0.5) * 0.08);
        tgt.setColorAt(u.base + i, c);
      }
      if (kind === "cav") for (let i = 0; i < N; i++) horses.setColorAt(u.base + i, new THREE.Color().setHSL(0.07, 0.3, 0.55 + (u.h[i * 4 + 3] - 0.5) * 0.5));
      return u;
    });
    soldiers.count = Math.min(MAXP, slots.inf); archers.count = Math.min(1600, slots.arch); pawns.count = Math.min(pawns.instanceMatrix.count, slots.pil); riders.count = horses.count = Math.min(900, slots.cav);
    camels.count = Math.min(1200, slots.camel); sheep.count = Math.min(1400, slots.sheep);
    for (const m of [pawns, soldiers, archers, riders, horses, camels, sheep]) if (m.instanceColor) m.instanceColor.needsUpdate = true;
    buildProps();
    return true;
  }
  function stop() {
    B = null; units = [];
    for (const m of [pawns, soldiers, archers, horses, riders, camels, sheep, tents, wtents, arrows, idols, poles, flags, trench, earth]) m.count = 0;
    for (const ps of [dust, sand, rain, wind, fires, smoke]) ps.clear();
    while (staticG.children.length) staticG.remove(staticG.children[0]);
    tentList = []; wtentList = []; fireList = []; trenchSegs = []; idolList = []; bannerList = [];
  }
  const yW = (x, z) => Math.max(0, yAt(x, z));
  function buildProps() {
    const r = rng(1234);
    for (const pr of B.props || []) {
      if (pr.type === "wells") {
        staticG.add(decor.instanced(G.well, matV, pr.list.map(([e, n]) => { W(e, n, wv); return { x: wv[0], y: yW(wv[0], wv[1]), z: wv[1], s: KM * 2.6, ry: r() * 6 }; })));
      } else if (pr.type === "mound") {
        W(pr.at[0], pr.at[1], wv);
        const m = new THREE.Mesh(G.mound, moundMat);
        m.scale.set(pr.r * KM, pr.h * 1.8 * KM, pr.r * KM);
        m.position.set(wv[0], yW(wv[0], wv[1]) - 0.002, wv[1]);
        staticG.add(m);
      } else if (pr.type === "hut") {
        W(pr.at[0], pr.at[1], wv);
        const mound = (B.props.find((q) => q.type === "mound" && q.at[0] === pr.at[0] && q.at[1] === pr.at[1]) || { h: 0 }).h * 1.8 * KM;
        staticG.add(decor.instanced(G.hut, matV, [{ x: wv[0], y: yW(wv[0], wv[1]) + mound - 0.003, z: wv[1], s: KM * 2.4, ry: 0.4 }]));
      } else if (pr.type === "tree") {
        W(pr.at[0], pr.at[1], wv);
        staticG.add(decor.instanced(G.acacia, matV, [{ x: wv[0], y: yW(wv[0], wv[1]), z: wv[1], s: KM * pr.s * 1.6, ry: 1 }]));
      } else if (pr.type === "tents") {
        for (let i = 0; i < pr.n; i++) {
          const a = r() * 6.28, d = pr.r * Math.sqrt(r());
          W(pr.at[0] + Math.cos(a) * d, pr.at[1] + Math.sin(a) * d, wv);
          if (pr.white) { if (d < (pr.r0 || 220)) continue; wtentList.push({ x: wv[0], z: wv[1], y: yW(wv[0], wv[1]), s: 0.8 + r() * 0.5, show: pr.show }); continue; }
          tentList.push({ x: wv[0], z: wv[1], y: yW(wv[0], wv[1]), ry: Math.round(r() * 4) * 1.57 + (r() - 0.5) * 0.3, s: 0.85 + r() * 0.4, show: pr.show, blow: pr.blow, h: r() });
        }
      } else if (pr.type === "fires") {
        for (let i = 0; i < pr.n; i++) {
          if (pr.path) {
            pathAt(pr.path, (i + 0.5) / pr.n, pt4);
            W(pt4[0] - pt4[3] * pr.off, pt4[1] + pt4[2] * pr.off, wv);
          } else {
            const a = r() * 6.28, d = pr.r * Math.sqrt(r());
            W(pr.at[0] + Math.cos(a) * d, pr.at[1] + Math.sin(a) * d, wv);
          }
          fireList.push({ x: wv[0], z: wv[1], y: yW(wv[0], wv[1]) + 0.004, show: pr.show, h: r(), s: 0.7 + r() * 0.6 });
        }
      } else if (pr.type === "trench") {
        const L = [];
        for (let k = 1; k < pr.path.length; k++) L.push(Math.hypot(pr.path[k][0] - pr.path[k - 1][0], pr.path[k][1] - pr.path[k - 1][1]));
        const total = L.reduce((a, b) => a + b, 0), step = 16, ns = Math.min(780, Math.floor(total / step));
        for (let i = 0; i < ns; i++) {
          pathAt(pr.path, (i + 0.5) / ns, pt4);
          W(pt4[0], pt4[1], wv);
          const x = wv[0], z = wv[1];
          W(pt4[0] + pt4[3] * 11, pt4[1] - pt4[2] * 11, wv); // la terre rejetée côté Médine
          trenchSegs.push({ x, z, y: yW(x, z), ex: wv[0], ez: wv[1], ey: yW(wv[0], wv[1]), ry: Math.atan2(pt4[2], -pt4[3]), u: i / ns, p0: pr.p0, p1: pr.p1, len: (total / ns) * 1.05, h: r() });
        }
      } else if (pr.type === "idols") {
        const n = isMobile ? Math.round(pr.n / 2) : pr.n;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2, R = pr.r + (i % 3) * 6;
          W(Math.cos(a) * R, Math.sin(a) * R, wv);
          idolList.push({ x: wv[0], z: wv[1], y: yW(wv[0], wv[1]), a, fall: lerp(pr.fall[0], pr.fall[1], i / n), h: r() });
        }
      }
    }
    for (const b of B.banners || []) bannerList.push({ ...b, u: units.find((u) => u.id === b.unit) });
    tents.count = Math.min(700, tentList.length);
    wtents.count = Math.min(600, wtentList.length);
    trench.count = earth.count = Math.min(800, trenchSegs.length);
    idols.count = idolList.length;
    poles.count = flags.count = Math.min(24, bannerList.length);
    bannerList.forEach((b, i) => { if (i < 24) flags.setColorAt(i, new THREE.Color(b.color)); });
    if (flags.instanceColor) flags.instanceColor.needsUpdate = true;
    for (let i = 0; i < fireList.length && i < fires.max; i++) {
      fires.pos[i * 3] = fireList[i].x; fires.pos[i * 3 + 1] = fireList[i].y; fires.pos[i * 3 + 2] = fireList[i].z;
    }
  }

  /* --- chaque image --- */
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), yAx = new THREE.Vector3(0, 1, 0);
  const zero = new THREE.Matrix4().makeScale(0, 0, 0);
  const a2 = [0, 0], b2 = [0, 0], SU = { A: null, B: null, f: 0 };
  let phase = -1;
  const stats = { melee: 0, gallop: 0, arrows: 0, fires: 0, storm: 0, march: 0 };
  function update(dt, t, p, pxScale) {
    if (!B) return -1;
    flagTime.value = t;
    const emitK = Math.min(1, dt * 60);
    let meleeN = 0, gallopN = 0, marchN = 0, allN = 0;
    for (const u of units) {
      const tgt = u.kind === "inf" ? soldiers : u.kind === "arch" ? archers : u.kind === "pil" ? pawns : u.kind === "cav" ? horses : u.kind === "camel" ? camels : sheep;
      const max = tgt.instanceMatrix.count;
      let uvis = 1;
      if (u.show) uvis = sstep(u.show[0], u.show[0] + 0.015, p) * (1 - sstep(u.show[1] - 0.015, u.show[1], p));
      u.vis = uvis;
      // centre de l'unité (sans retard), pour l'étiquette et les étendards
      const { A: A0, B: B0, f: f0 } = seg(u, p, SU);
      u.center[0] = lerp(A0[1], B0[1], f0); u.center[1] = lerp(A0[2], B0[2], f0);
      u.face = lerp(A0[3], A0[3] + ((((B0[3] - A0[3]) % 360) + 540) % 360) - 180, f0);
      const segDur = (B0[0] - A0[0]) * dur;
      const speed = segDur > 0 && f0 > 0 && f0 < 1 ? Math.hypot(B0[1] - A0[1], B0[2] - A0[2]) / segDur : 0;
      const melee = (A0[4] === "melee" ? 1 - f0 : 0) + (B0[4] === "melee" ? f0 : 0);
      const camp = A0[4] === "camp" && B0[4] === "camp";
      if (u.kind === "inf" || u.kind === "arch" || u.kind === "cav") {
        const w = u.N * uvis;
        allN += w;
        meleeN += w * Math.min(1, melee);
        if (u.kind === "cav" && speed > 3) gallopN += w;
        if (speed > 1.2 && melee < 0.2) marchN += w;
      }
      for (let i = 0; i < u.N; i++) {
        const slot = u.base + i;
        if (slot >= max) break;
        let vis = uvis;
        // les pertes : certains pions disparaissent pendant l'intervalle donné
        if (u.losses.length) {
          let cum = 0;
          const hq = u.h[i * 4 + 2];
          for (const [l0, l1, c] of u.losses) {
            const fr = c / u.N;
            if (hq >= cum && hq < cum + fr) { const die = lerp(l0, l1, u.h[i * 4 + 3]); vis *= 1 - clamp((p - die) / 0.01); break; }
            cum += fr;
          }
        }
        if (vis < 0.01) { tgt.setMatrixAt(slot, zero); if (u.kind === "cav") riders.setMatrixAt(slot, zero); continue; }
        const pm = clamp(p - u.lag * u.h[i * 4]);
        const { A, B: Bk, f } = seg(u, pm);
        layout(u, A, i, t, a2);
        if (Bk !== A) { layout(u, Bk, i, t, b2); a2[0] = lerp(a2[0], b2[0], f); a2[1] = lerp(a2[1], b2[1], f); }
        u.cur[i * 2] = a2[0]; u.cur[i * 2 + 1] = a2[1];
        W(a2[0], a2[1], wv);
        const gy = yW(wv[0], wv[1]);
        const run = Math.min(1, speed / 4);
        const bob = run * Math.abs(Math.sin(t * (u.kind === "cav" ? 13 : 9) + u.h[i * 4] * 20)) * (u.kind === "cav" ? 1.1 : 0.6) * KM * EB;
        const yaw = camp || u.kind === "sheep" ? u.h[i * 4 + 1] * 6.28 : Math.PI - (u.face + (melee > 0.5 ? (u.h[i * 4 + 3] - 0.5) * 60 : 0)) * D2R;
        q.setFromAxisAngle(yAx, yaw);
        v.set(wv[0], gy + bob, wv[1]);
        const sc = vis * EB * KM * (u.kind === "inf" || u.kind === "arch" || u.kind === "pil" ? 0.78 : 0.95);
        s.set(sc, sc, sc);
        m4.compose(v, q, s);
        tgt.setMatrixAt(slot, m4);
        if (u.kind === "cav") {
          v.y += 1.6 * sc;
          s.setScalar(sc * 0.52);
          m4.compose(v, q, s);
          riders.setMatrixAt(slot, m4);
        }
      }
      // poussière : la mêlée, et les troupes qui courent
      if (uvis > 0.3 && (melee > 0.2 || speed > 2.5)) {
        const k = Math.min(u.kind === "cav" ? 4 : 6, (u.N * (melee > 0.2 ? 0.05 : 0.03) + 0.4) * emitK);
        for (let j = 0; j < k; j++) {
          if (Math.random() > k - j) break;
          const i = Math.floor(Math.random() * u.N);
          W(u.cur[i * 2], u.cur[i * 2 + 1], wv);
          dust.emit(wv[0], yW(wv[0], wv[1]) + 0.004, wv[1], (Math.random() - 0.5) * 0.004, 0.004, (Math.random() - 0.5) * 0.004, 3.5 + Math.random() * 2, 0.022 + Math.random() * 0.03, 1.6, melee > 0.2 ? 0.32 : 0.22);
        }
      }
    }
    for (const m of [pawns, soldiers, archers, horses, riders, camels, sheep]) m.instanceMatrix.needsUpdate = true;
    stats.melee = allN ? Math.min(1, (meleeN / allN) * 2) : 0;
    stats.gallop = Math.min(1, gallopN / 40);
    stats.march = allN ? Math.min(1, (marchN / allN) * 1.5) : 0;
    updateProps(dt, t, p);
    updateEvents(dt, t, p);
    for (const ps of [dust, sand, rain, wind, smoke]) ps.mat.uniforms.uScale.value = pxScale;
    smoke.update(dt, 0.08, -0.0002);
    fires.mat.uniforms.uScale.value = pxScale;
    dust.update(dt, 0.5, 0); sand.update(dt, 0.25, 0.01); rain.update(dt, 0, 0); wind.update(dt, 0.05, 0);
    let ph = 0;
    B.phases.forEach((x, i) => { if (p >= x.p) ph = i; });
    phase = ph;
    return ph;
  }
  let stormK = 0;
  function updateProps(dt, t, p) {
    const storm = (B.events || []).find((e) => e.type === "storm");
    stormK = storm ? sstep(storm.p0, storm.p0 + 0.06, p) : 0;
    const dir = storm ? storm.dir : [0, 0];
    // tentes : apparaissent, puis le vent les emporte
    tentList.forEach((tn, i) => {
      if (i >= 700) return;
      let vis = tn.show ? sstep(tn.show[0], tn.show[0] + 0.03, p) : 1;
      let dx = 0, dy = 0, dz = 0, rx = 0, rz = 0;
      if (tn.blow) {
        const b = clamp((p - lerp(tn.blow[0], tn.blow[1] - 0.04, tn.h)) / 0.05);
        if (b > 0) { dx = dir[0] * b * b * 0.35; dz = -dir[1] * b * b * 0.35; dy = Math.sin(b * Math.PI) * 0.03; rx = b * 2.5; rz = b * 1.7; vis *= 1 - sstep(0.6, 1, b); }
        else if (stormK > 0) rz = Math.sin(t * 14 + tn.h * 20) * 0.08 * stormK;
      }
      if (vis < 0.01) { tents.setMatrixAt(i, zero); return; }
      v.set(tn.x + dx, tn.y + dy, tn.z + dz);
      q.setFromEuler(new THREE.Euler(rx, tn.ry, rz));
      s.set(4.2 * tn.s * EB * 0.6 * KM * vis, 2.2 * tn.s * EB * 0.6 * KM * vis, 6.5 * tn.s * EB * 0.6 * KM * vis);
      m4.compose(v, q, s);
      tents.setMatrixAt(i, m4);
    });
    tents.instanceMatrix.needsUpdate = true;
    // la fumée des foyers monte entre les tentes, et se couche dans la tempête
    if (tentList.length && stormK < 0.5) {
      for (let k = 0; k < 8 * dt && Math.random() < 8 * dt; k++) {
        const tn = tentList[Math.floor(Math.random() * tentList.length)];
        const vis = tn.show ? sstep(tn.show[0], tn.show[0] + 0.03, p) : 1;
        if (vis < 0.5 || (tn.blow && p > tn.blow[0])) continue;
        smoke.emit(tn.x + 0.006, tn.y + 0.003, tn.z, 0.0015, 0.007, 0.0008, 12, 0.007, 4, 0.18);
      }
    }
    wtentList.forEach((tn, i) => {
      if (i >= 600) return;
      const vis = tn.show ? sstep(tn.show[0], tn.show[0] + 0.05, p) : 1;
      v.set(tn.x, tn.y, tn.z); q.identity();
      s.set(3 * tn.s * EB * KM * vis, 3.4 * tn.s * EB * KM * vis, 3 * tn.s * EB * KM * vis);
      m4.compose(v, q, s);
      wtents.setMatrixAt(i, vis < 0.01 ? zero : m4);
    });
    wtents.instanceMatrix.needsUpdate = true;
    // feux : vacillent la nuit, s'éteignent dans la tempête
    let nf = 0, lit = 0;
    for (let i = 0; i < fireList.length && i < fires.max; i++) {
      const f = fireList[i];
      const vis = f.show ? sstep(f.show[0], f.show[0] + 0.02, p) * (1 - sstep(f.show[1] - 0.02, f.show[1], p)) : 1;
      fires.size[i] = 0.016 * f.s * (1 + 0.15 * Math.sin(t * 11 + f.h * 30));
      fires.alpha[i] = vis * (1 - stormK) * (0.75 + 0.25 * Math.sin(t * 7 + f.h * 50));
      if (fires.alpha[i] > 0.2) lit++;
      nf = i + 1;
    }
    stats.fires = Math.min(1, lit / 60);
    fires.flush(nf);
    // le fossé se creuse d'ouest en est, la terre s'entasse du côté de Médine
    trenchSegs.forEach((sg, i) => {
      if (i >= 800) return;
      const dug = clamp((p - lerp(sg.p0, sg.p1, sg.u)) / 0.02);
      if (dug <= 0) { trench.setMatrixAt(i, zero); earth.setMatrixAt(i, zero); return; }
      q.setFromAxisAngle(yAx, sg.ry);
      v.set(sg.x, sg.y + 0.0012, sg.z);
      s.set(10 * KM, 5 * KM * dug, sg.len * KM);
      m4.compose(v, q, s); trench.setMatrixAt(i, m4);
      v.set(sg.ex, sg.ey, sg.ez);
      s.set((5 + sg.h * 3) * KM, 2.6 * KM * dug, (sg.len * 1.1) * KM);
      m4.compose(v, q, s); earth.setMatrixAt(i, m4);
    });
    trench.instanceMatrix.needsUpdate = earth.instanceMatrix.needsUpdate = true;
    // les idoles tombent une à une
    idolList.forEach((d, i) => {
      const f = clamp((p - d.fall) / 0.012);
      const gone = clamp((p - d.fall - 0.03) / 0.03);
      if (gone >= 1) { idols.setMatrixAt(i, zero); return; }
      v.set(d.x, d.y - gone * 0.002, d.z);
      q.setFromEuler(new THREE.Euler(Math.cos(d.a) * f * 1.5, d.a, Math.sin(d.a) * f * 1.5));
      s.setScalar(EB * 0.8 * KM * (1 - gone));
      m4.compose(v, q, s); idols.setMatrixAt(i, m4);
    });
    idols.instanceMatrix.needsUpdate = true;
    // étendards, portés au centre des unités
    bannerList.forEach((b, i) => {
      if (i >= 24) return;
      const u = b.u;
      if (!u || u.vis < 0.05) { poles.setMatrixAt(i, zero); flags.setMatrixAt(i, zero); return; }
      const f = u.face * D2R, r = b.at[0], bk = b.at[1];
      const e = u.center[0] + Math.cos(f) * r - Math.sin(f) * bk, n = u.center[1] - Math.sin(f) * r - Math.cos(f) * bk;
      W(e, n, wv);
      let down = 0;
      for (const [d0, d1] of b.down || []) down = Math.max(down, sstep(d0, d0 + 0.02, p) * (1 - sstep(d1 - 0.02, d1, p)));
      q.setFromEuler(new THREE.Euler(down * 1.35, Math.PI - f + 1.2, 0));
      v.set(wv[0], yW(wv[0], wv[1]), wv[1]);
      s.setScalar(EB * 1.25 * KM * u.vis);
      m4.compose(v, q, s);
      poles.setMatrixAt(i, m4); flags.setMatrixAt(i, m4);
    });
    poles.instanceMatrix.needsUpdate = flags.instanceMatrix.needsUpdate = true;
  }
  const pos = (ref, j, out) => {
    if (Array.isArray(ref)) { out[0] = ref[0]; out[1] = ref[1]; return out; }
    const u = units.find((x) => x.id === ref);
    if (!u) { out[0] = out[1] = 0; return out; }
    const i = Math.floor(H(j, 9) * u.N);
    out[0] = u.cur[i * 2]; out[1] = u.cur[i * 2 + 1];
    return out;
  };
  const fa = [0, 0], fb = [0, 0], dir3 = new THREE.Vector3(), zAx = new THREE.Vector3(0, 0, 1);
  function updateEvents(dt, t, p) {
    let na = 0;
    const camX = env.camTarget[0], camZ = env.camTarget[1];
    for (const ev of B.events || []) {
      if (ev.type === "arrows") {
        const fd = 1.4 / dur;
        if (p < ev.p0 - 0.01 || p > ev.p1 + fd) continue;
        for (let j = 0; j < ev.n && na < 900; j++) {
          const pj = lerp(ev.p0, ev.p1, H(j, 1 + ev.n));
          const sf = (p - pj) / fd;
          if (sf <= 0 || sf >= 1) continue;
          pos(ev.from, j, fa); pos(ev.to, j + 31, fb);
          if (ev.spread) { fa[0] += (H(j, 4) - 0.5) * ev.spread * 2; fb[0] += (H(j, 5) - 0.5) * ev.spread * 2; fb[1] += (H(j, 6) - 0.5) * 60; }
          const dist = Math.hypot(fb[0] - fa[0], fb[1] - fa[1]), apex = Math.max(25, dist * 0.3);
          W(lerp(fa[0], fb[0], sf), lerp(fa[1], fb[1], sf), wv);
          const g = lerp(yW(...W(fa[0], fa[1], [0, 0])), yW(...W(fb[0], fb[1], [0, 0])), sf);
          v.set(wv[0], g + (4 * apex * sf * (1 - sf) + 2) * KM, wv[1]);
          dir3.set((fb[0] - fa[0]) * KM, apex * 4 * (1 - 2 * sf) * KM, -(fb[1] - fa[1]) * KM).normalize();
          q.setFromUnitVectors(zAx, dir3);
          s.set(9 * KM, 9 * KM, 7 * KM);
          m4.compose(v, q, s);
          arrows.setMatrixAt(na++, m4);
        }
      } else if (ev.type === "pebbles" && p > ev.p0 && p < ev.p1) {
        W(ev.from[0], ev.from[1], wv);
        const x0 = wv[0], z0 = wv[1], y0 = yW(x0, z0) + 0.006;
        W(ev.to[0], ev.to[1], wv);
        const T = 2.2;
        for (let j = 0; j < 14 * dt * 60; j++) {
          sand.emit(x0 + (Math.random() - 0.5) * 0.02, y0, z0 + (Math.random() - 0.5) * 0.02,
            (wv[0] - x0) / T + (Math.random() - 0.5) * 0.06, 0.012 + Math.random() * 0.01, (wv[1] - z0) / T + (Math.random() - 0.5) * 0.06,
            T, 0.006 + Math.random() * 0.01, 3, 0.55);
        }
      } else if (ev.type === "rain" && p >= ev.p0 && p < ev.p1) {
        for (let j = 0; j < 260 * dt; j++) {
          const x = camX + (Math.random() - 0.5) * 2.4, z = camZ + (Math.random() - 0.5) * 2.4;
          rain.emit(x, yW(x, z) + 0.12 + Math.random() * 0.1, z, 0.004, -0.09, 0, 2.2, 0.0035, 0, 0.55);
        }
      } else if (ev.type === "storm" && p >= ev.p0) {
        const k = sstep(ev.p0, ev.p0 + 0.05, p);
        for (let j = 0; j < 90 * dt * k; j++) {
          const x = camX + (Math.random() - 0.5) * 9, z = camZ + (Math.random() - 0.5) * 9;
          wind.emit(x, yW(x, z) + 0.01 + Math.random() * 0.05, z, ev.dir[0] * 0.16, 0.004, -ev.dir[1] * 0.16, 3.5, 0.06 + Math.random() * 0.08, 1.2, 0.3);
        }
      }
    }
    arrows.count = na;
    stats.arrows = Math.min(1, na / 120);
    stats.storm = stormK;
    arrows.instanceMatrix.needsUpdate = true;
  }

  /* --- étiquettes des unités --- */
  function labels(p) {
    if (!B) return [];
    const out = [];
    for (const u of units) {
      if (!u.label || u.vis < 0.5) continue;
      if (u.labelP && (p < u.labelP[0] || p > u.labelP[1])) continue;
      let alive = u.N;
      for (const [l0, l1, c] of u.losses) if (p > l1) alive -= c;
      if (alive <= 0) continue;
      let e = u.center[0], n = u.center[1];
      const k = seg(u, p).A;
      if (k[4] === "path" || k[4] === "camp" || k[4] === "scatter" || k[4] === "rout") {
        // centre réel des pions
        let se = 0, sn = 0, c = 0;
        for (let i = 0; i < u.N; i += Math.max(1, Math.floor(u.N / 60))) { se += u.cur[i * 2]; sn += u.cur[i * 2 + 1]; c++; }
        e = se / c; n = sn / c;
      }
      W(e, n, wv);
      const num = u.num === undefined ? "" : (u.approx ? "≈ " : "") + U.num(u.num);
      out.push([wv[0], yW(wv[0], wv[1]) + 0.03, wv[1], num, U.tr(u.label)]);
    }
    return out;
  }

  return {
    has: (id) => !!BATTLES[id], def: (id) => BATTLES[id], start, stop, update, labels,
    get scale() { return scaleEff; }, stats, get phase() { return phase; }, get active() { return !!B; },
    camFor: (ph) => { const c = B.phases[ph].cam; return { x: Ox + c[0] * KM, z: Oz - c[1] * KM, dist: c[2], pitch: c[3], head: c[4] }; }
  };
}
