/* Sira — la 3D du voyage (Three.js)
   Prend en charge deux moments quand le navigateur sait afficher du WebGL :
   - les foules : des milliers de sphères posées sur la plaine, vues en perspective ;
   - les cartes : l'Arabie en relief, la caméra suit l'Hégire, les lettres s'élèvent en arcs.
   Sans WebGL, ce module ne s'active pas et le voyage garde sa version 2D. */
import * as THREE from "./vendor/three.module.min.js";

const U = window.Sira;
const M = window.SIRA_MAP;
const S = window.SIRA;

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (e) {
    return false;
  }
}

if (U && M && webglAvailable()) setup();

function setup() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const damp = (a, b, k) => a + (b - a) * k;

  const canvas = document.getElementById("glCanvas");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    return; // pas de 3D : on reste en 2D
  }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 800);
  const hemi = new THREE.HemisphereLight(0xfff1d6, 0x2a2440, 1.3);
  const sun = new THREE.DirectionalLight(0xffe2b0, 1.8);
  sun.position.set(-40, 60, 30);
  scene.add(hemi, sun);

  let chapter = null;
  let size = { W: 0, H: 0, dpr: 1 };
  const camPos = new THREE.Vector3(0, 60, 120), camLook = new THREE.Vector3();

  /* ---------------------------------------------------------------- */
  /* Foules                                                            */
  /* ---------------------------------------------------------------- */
  const MAX = 10000;
  const WD = 100, DD = 36; // largeur et profondeur de la plaine, en unités 3D
  const crowd = new THREE.Group();
  scene.add(crowd);
  const dotGeo = new THREE.IcosahedronGeometry(0.3, 1);
  const dotMat = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.05, emissive: 0x2a2210, emissiveIntensity: 0.6 });
  const dots = new THREE.InstancedMesh(dotGeo, dotMat, MAX);
  dots.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  dots.frustumCulled = false;
  crowd.add(dots);
  const palette = (U.crowdColors ? U.crowdColors() : ["#f4d27e"]).map((c) => new THREE.Color(c));
  const P = { x: new Float32Array(MAX), z: new Float32Array(MAX), a: new Float32Array(MAX), c: new Uint8Array(MAX).fill(255) };
  for (let i = 0; i < MAX; i++) { P.x[i] = (Math.random() - 0.5) * WD; P.z[i] = DD * 2; dots.setColorAt(i, palette[0]); }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v3 = new THREE.Vector3(), sc = new THREE.Vector3();

  // éléments de décor des foules
  const props = {
    trench: new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, DD * 1.25), new THREE.MeshStandardMaterial({ color: 0x14161f, roughness: 0.9 })),
    hill: new THREE.Mesh(new THREE.ConeGeometry(9, 5, 7, 1), new THREE.MeshStandardMaterial({ color: 0x9a8160, roughness: 0.95, flatShading: true })),
    kaaba: (() => {
      const g = new THREE.Group();
      const cube = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.4, 2.2), new THREE.MeshStandardMaterial({ color: 0x0d0e14, roughness: 0.7 }));
      cube.position.y = 1.2;
      const band = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.28, 2.24), new THREE.MeshStandardMaterial({ color: 0xd8b25a, metalness: 0.6, roughness: 0.35, emissive: 0x3a2a08 }));
      band.position.y = 1.85;
      g.add(cube, band);
      return g;
    })(),
    boundary: (() => {
      const g = new THREE.Group();
      const mat = new THREE.MeshBasicMaterial({ color: 0xf4d27e });
      for (let i = 0; i < 12; i++) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 1.4), mat);
        b.position.z = -DD * 0.6 + i * 2.6;
        g.add(b);
      }
      return g;
    })()
  };
  Object.values(props).forEach((m) => { m.visible = false; crowd.add(m); });

  const space = () => ({
    X: (u) => (u - 0.5) * WD, Y: (v) => (v - 0.5) * DD, w: WD, h: DD, sp: 0.66, mobile: size.W < 800,
    LY: (-0.12 - 0.5) * DD, LYH: (-0.5 - 0.5) * DD, enter: DD * 2.2
  });
  let F = null, fName = null, fT0 = 0;

  /* ---------------------------------------------------------------- */
  /* Carte en relief                                                   */
  /* ---------------------------------------------------------------- */
  const MS = 0.1; // 1 unité de carte = 0,1 unité 3D
  const TOP = 0.75; // hauteur du plateau
  const wx = (px) => (px - M.w / 2) * MS, wz = (py) => (py - M.h / 2) * MS;
  const at = (pt, y = TOP) => new THREE.Vector3(wx(pt[0]), y, wz(pt[1]));
  const map = new THREE.Group();
  map.visible = false;
  scene.add(map);
  let mapBuilt = false;
  const hijra = {}, letters = [];
  const LETTERS = [["jerusalem", "heraclius"], ["ctesiphon", "khosrow"], ["aksum", "negus"], ["alexandria", "muqawqis"], ["hajar", "mundhir"], ["bosra", "harith"]];

  function buildMap() {
    mapBuilt = true;
    // le contour des terres vient de Natural Earth (chemin SVG fait de M, L et Z)
    const shapes = [];
    for (const ring of M.land.match(/M[^M]+/g) || []) {
      const pts = [];
      ring.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => { pts.push(new THREE.Vector2(wx(+x), -wz(+y))); return ""; });
      if (pts.length > 2) shapes.push(new THREE.Shape(pts));
    }
    const land = new THREE.ExtrudeGeometry(shapes, { depth: TOP, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 1, curveSegments: 1 });
    land.rotateX(-Math.PI / 2);
    const landMesh = new THREE.Mesh(land, [
      new THREE.MeshStandardMaterial({ color: 0x27315e, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0xc19a4c, roughness: 0.5, metalness: 0.3, emissive: 0x2c1f08 })
    ]);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ color: 0x0b1738, roughness: 0.3, metalness: 0.35 }));
    sea.rotation.x = -Math.PI / 2;
    sea.position.y = -0.05;
    map.add(sea, landMesh);

    const glow = (color) => new THREE.MeshBasicMaterial({ color, toneMapped: false });
    const pin = (pt, color = 0xf4d27e, h = 1.2) => {
      const g = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, h, 6), glow(color));
      stem.position.y = h / 2;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), glow(color));
      head.position.y = h;
      g.add(stem, head);
      g.position.copy(at(pt));
      map.add(g);
      return g;
    };

    // l'Hégire
    const curve = new THREE.CatmullRomCurve3(M.routes.hijra.map((p) => at(p, TOP + 0.12)), false, "centripetal");
    hijra.curve = curve;
    hijra.tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 400, 0.11, 8, false), glow(0xf4d27e));
    hijra.count = hijra.tube.geometry.index.count;
    hijra.traveler = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), glow(0xfff3d0));
    hijra.light = new THREE.PointLight(0xffd98a, 30, 14, 2);
    hijra.traveler.add(hijra.light);
    hijra.pins = { mecca: pin(M.places.mecca), thawr: pin(M.places.thawr, 0xfff3d0, 0.8), medina: pin(M.places.medina) };
    hijra.group = new THREE.Group();
    hijra.group.add(hijra.tube, hijra.traveler);
    map.add(hijra.group);

    // les lettres aux souverains : des arcs qui s'élèvent au-dessus de la carte
    const origin = at(M.places.medina, TOP);
    hijra.medinaPin = hijra.pins.medina;
    for (const [to, who] of LETTERS) {
      const end = at(M.places[to], TOP);
      const mid = origin.clone().lerp(end, 0.5);
      mid.y = TOP + origin.distanceTo(end) * 0.32;
      const c = new THREE.QuadraticBezierCurve3(origin.clone(), mid, end);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(c, 120, 0.1, 6, false), glow(0xf4d27e));
      const p = pin(M.places[to], 0xfff3d0, 1.4);
      letters.push({ to, who, tube, count: tube.geometry.index.count, pin: p, end });
      map.add(tube);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Interface avec le voyage (story.js)                               */
  /* ---------------------------------------------------------------- */
  function handles(c) { return !!(c && (c.crowd || c.scene === "map")); }

  function setChapter(c) {
    chapter = c;
    canvas.hidden = !c;
    if (!c) return;
    if (c.scene === "map" && !mapBuilt) buildMap();
    map.visible = c.scene === "map";
    crowd.visible = !!c.crowd;
    if (c.scene === "map") {
      const mode = c.map || "hijra";
      hijra.group.visible = mode === "hijra";
      Object.entries(hijra.pins).forEach(([k, g]) => { g.visible = mode === "hijra" || k === "medina"; });
      letters.forEach((l) => { l.tube.visible = l.pin.visible = mode === "letters"; });
      scene.fog = new THREE.Fog(0x111d44, 40, 140);
      hemi.intensity = 0.8; sun.color.set(0xb9c6ff); sun.intensity = 1.2;
    } else {
      scene.fog = null;
      hemi.intensity = 1.3; sun.color.set(0xffe2b0); sun.intensity = 1.8;
    }
    if (c.crowd !== fName) { fName = c.crowd || null; F = null; fT0 = performance.now(); }
    Object.values(props).forEach((m) => { m.visible = false; });
  }

  function resize(W, H) {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    if (W === size.W && H === size.H && dpr === size.dpr) return;
    size = { W, H, dpr };
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    F = null; // les formations dépendent du format de l'écran
  }

  // place le centre de la scène 3D sur un point de l'écran (à côté du texte)
  function aim(cx, cy, W, H) {
    camera.setViewOffset(W, H, W / 2 - cx, H / 2 - cy, W, H);
    camera.updateProjectionMatrix();
  }

  function render(dt, t, p, st) {
    if (!chapter) return;
    resize(st.W, st.H);
    const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 2.5);
    if (chapter.crowd) renderCrowd(dt, t, p, st, k);
    else renderMap(t, p, st, k);
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    renderer.render(scene, camera);
  }

  function renderCrowd(dt, t, p, st, k) {
    const sp = space();
    if (!F) F = U.formation(fName, sp);
    if (!F) return;
    const n = Math.min(F.n, MAX);
    const o = [0, 0, 1];
    const since = (performance.now() - fT0) / 1000;
    const kk = reduceMotion ? 1 : 1 - Math.exp(-dt * 3);
    let last = 0;
    for (let i = 0; i < MAX; i++) {
      let ta = 0;
      if (i < n) {
        o[2] = 1;
        const c = F.pos(i, p, t, o);
        ta = o[2];
        if (P.c[i] !== c) { P.c[i] = c; dots.setColorAt(i, palette[c] || palette[0]); dots.instanceColor.needsUpdate = true; }
        const go = since > ((i * 7919) % 1000) / 1000 * 0.6 ? kk : 0;
        P.x[i] += (o[0] - P.x[i]) * go;
        P.z[i] += (o[1] - P.z[i]) * go;
      } else if (P.a[i] < 0.01) continue;
      P.a[i] += (ta - P.a[i]) * (reduceMotion ? 1 : Math.min(1, dt * 3));
      const s = Math.max(0.0001, P.a[i]);
      v3.set(P.x[i], 0.3 * s, P.z[i]);
      sc.set(s, s, s);
      m4.compose(v3, q, sc);
      dots.setMatrixAt(i, m4);
      if (P.a[i] > 0.01) last = i + 1;
    }
    dots.count = last;
    dots.instanceMatrix.needsUpdate = true;

    props.trench.visible = !!F.trench;
    props.trench.position.set(sp.X(0.47), 0.05, sp.Y(0.5));
    props.boundary.visible = !!F.boundary;
    props.boundary.position.set(sp.X(0.86), 0.1, 0);
    props.hill.visible = !!F.hill;
    props.hill.position.set(sp.X(0.5), 2.4, sp.Y(0.4));
    props.kaaba.visible = !!F.kaaba;
    props.kaaba.position.set(sp.X(0.5), 0, sp.Y(0.5));

    // caméra : la plaine se place à côté du texte, et tourne doucement avec le défilement
    const { W, H, fb, mobile } = st;
    aim(fb.x + fb.w / 2, fb.y + fb.h * 0.55, W, H);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const visW = (WD * 1.12) / (fb.w / W); // largeur visible voulue
    const r = visW / (2 * Math.tan(fov / 2) * camera.aspect);
    const az = reduceMotion ? 0 : (p - 0.5) * 0.5 + Math.sin(t * 0.07) * 0.04;
    const el = THREE.MathUtils.degToRad(mobile ? 44 : 36);
    const target = new THREE.Vector3(0, 0, 0);
    const pos = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(r * 0.92);
    camPos.lerp(pos, k); camLook.lerp(target, k);
  }

  function renderMap(t, p, st, k) {
    const { W, H, mobile } = st;
    if (mobile) aim(W / 2, H * 0.32, W, H); else aim(W * (document.documentElement.dir === "rtl" ? 0.32 : 0.68), H * 0.5, W, H);
    if ((chapter.map || "hijra") === "hijra") {
      if (chapter.type !== "event") p = 0; // l'ouverture de la période : départ de La Mecque
      const q = smooth(clamp((p - 0.18) / 0.72));
      hijra.tube.geometry.setDrawRange(0, Math.floor((hijra.count * q) / 6) * 6);
      const pt = hijra.curve.getPointAt(Math.max(0.0001, q));
      hijra.traveler.position.copy(pt);
      hijra.light.intensity = 20 + Math.sin(t * 3) * 6;
      // la caméra suit le voyageur ; pendant les trois nuits, elle tourne autour de la grotte
      const tan = hijra.curve.getTangentAt(Math.min(0.999, Math.max(0.001, q)));
      const dist = 11 * Math.max(1, 1.3 / camera.aspect); // plus de recul sur un écran étroit
      let pos;
      if (p < 0.18) {
        const a = t * 0.25;
        pos = pt.clone().add(new THREE.Vector3(Math.cos(a) * dist * 0.7, dist * 0.6, Math.sin(a) * dist * 0.7));
      } else {
        pos = pt.clone().add(new THREE.Vector3(-tan.x * dist + 4, dist * 0.75, -tan.z * dist + 3));
      }
      camPos.lerp(pos, k * 0.8); camLook.lerp(pt, k);
      setFog(dist * 1.8);
    } else {
      letters.forEach((l, i) => {
        const qi = smooth(clamp(p * 1.8 - i * 0.12));
        l.tube.geometry.setDrawRange(0, Math.floor((l.count * qi) / 6) * 6);
        l.on = qi > 0.95;
        l.pin.scale.setScalar(l.on ? 1 : 0.5);
      });
      const center = at([M.w * 0.5, M.h * 0.42], 0);
      const a = (reduceMotion ? 0 : (p - 0.5) * 0.6) + 0.15;
      const r = Math.max(70, 52 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect));
      const pos = center.clone().add(new THREE.Vector3(Math.sin(a) * r * 0.55, r * 0.8, Math.cos(a) * r * 0.55));
      camPos.lerp(pos, k); camLook.lerp(center, k);
      setFog(r);
    }
  }
  // le brouillard suit le recul de la caméra, pour fondre l'horizon sans cacher la carte
  function setFog(r) {
    if (!scene.fog) return;
    scene.fog.near = r * 0.9;
    scene.fog.far = r * 3;
  }

  // étiquettes : on projette les points 3D sur l'écran et on écrit avec les outils du voyage
  const proj = new THREE.Vector3();
  function toScreen(x, y, z) {
    proj.set(x, y, z).project(camera);
    return [(proj.x * 0.5 + 0.5) * size.W, (-proj.y * 0.5 + 0.5) * size.H, proj.z < 1];
  }
  function overlay(ctx, label, legend) {
    if (!chapter) return;
    const T = U.T();
    if (chapter.crowd && F) {
      for (const [x, z, big, small] of F.labels()) {
        const [sx, sy, ok] = toScreen(x, 2.2, z);
        if (ok) label(sx, sy, big, small, "center");
      }
      if (F.boundary) { const [sx, sy] = toScreen(space().X(0.86), 0, DD * 0.75); label(sx, sy + 16, "", T.crowd.haram, "center"); }
      if (F.scale) legend(F.scale === 1 ? T.crowd.one : T.crowd.many.replace("{n}", U.num(Math.round(F.scale))));
    } else if (chapter.scene === "map" && mapBuilt) {
      if ((chapter.map || "hijra") === "hijra") {
        for (const id of ["mecca", "thawr", "medina"]) {
          const pt = at(M.places[id], TOP + (id === "thawr" ? 1.1 : 1.6));
          const [sx, sy, ok] = toScreen(pt.x, pt.y, pt.z);
          if (ok) label(sx, sy - (id === "thawr" ? -34 : 8), "", U.tr(S.places[id]), "center");
        }
      } else {
        for (const l of letters) {
          if (!l.on) continue;
          const [sx, sy, ok] = toScreen(l.end.x, TOP + 2.2, l.end.z);
          if (ok) label(sx, sy, "", T.rulers[l.who], "center");
        }
        const md = at(M.places.medina, TOP + 1.6);
        const [mx, my] = toScreen(md.x, md.y, md.z);
        label(mx, my - 6, "", U.tr(S.places.medina), "center");
      }
    }
  }

  U.onLang.push(() => { F = null; });
  U.stage3d = { handles, setChapter, render, overlay };
  canvas.hidden = true;
}
