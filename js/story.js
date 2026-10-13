/* Sira — le voyage immersif
   Une scène fixe (ciel, paysages, foules) réagit au défilement des chapitres.
   Aucune figure humaine : les personnes sont représentées par des points. */
(function () {
  "use strict";

  const S = window.SIRA;
  const M = window.SIRA_MAP;
  const U = window.Sira; // utilitaires partagés (langue, formats)
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const hash = (i, s = 1) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
  const eventById = Object.fromEntries(S.events.map((e) => [e.id, e]));

  /* ------------------------------------------------------------------ */
  /* Chapitres du voyage                                                 */
  /* ------------------------------------------------------------------ */
  const CHAPTERS = [
    { id: "intro", type: "intro", scene: "night" },
    { id: "p-early", type: "period", period: "early", verse: "character", scene: "meccaNight" },
    { ev: "birth", scene: "meccaNight", len: 1.5, fx: "birds" },
    { ev: "halima", scene: "desert", fx: "sand" },
    { ev: "amina", scene: "dusk" },
    { ev: "grandfather", scene: "dusk" },
    { ev: "bahira", scene: "caravan", len: 1.4, fx: "sand" },
    { ev: "fudul", scene: "meccaDay" },
    { ev: "khadija", scene: "caravan", fx: "sand" },
    { ev: "kaaba", scene: "meccaDay" },
    { id: "p-mecca", type: "period", period: "mecca", verse: "iqra", scene: "hira" },
    { ev: "revelation", scene: "hira", len: 1.9, fx: "rays" },
    { ev: "public", scene: "harsh", fx: "heat" },
    { ev: "abyssinia", scene: "sea", len: 1.4 },
    { ev: "boycott", scene: "harsh", fx: "heat" },
    { ev: "sorrow", scene: "dusk", fx: "fall" },
    { ev: "taif", scene: "taif" },
    { ev: "isra", scene: "isra", len: 2.1, fx: "isra" },
    { ev: "aqaba", scene: "hills", crowd: "aqaba", len: 1.3 },
    { id: "p-medina", type: "period", period: "medina", verse: "hijra", scene: "map" },
    { ev: "hijra", scene: "map", map: "hijra", len: 2.3 },
    { ev: "medina", scene: "medina", len: 1.6 },
    { ev: "qibla", scene: "qibla", len: 1.4 },
    { ev: "badr", scene: "field", crowd: "badr", len: 1.7 },
    { ev: "uhud", scene: "uhud", crowd: "uhud", len: 1.8 },
    { ev: "khandaq", scene: "trench", crowd: "khandaq", len: 1.6, fx: "wind" },
    { ev: "hudaybiyya", scene: "tree", crowd: "hudaybiyya", len: 1.5 },
    { ev: "letters", scene: "map", map: "letters", len: 1.6 },
    { ev: "khaybar", scene: "fort" },
    { ev: "mutah", scene: "field", crowd: "mutah", len: 1.4 },
    { ev: "conquest", scene: "meccaValley", crowd: "conquest", len: 2 },
    { ev: "hunayn", scene: "valley", crowd: "hunayn", len: 1.5 },
    { ev: "tabuk", scene: "desertOpen", crowd: "tabuk", len: 1.5, fx: "sand" },
    { ev: "delegations", scene: "oasis", crowd: "delegations", len: 1.5 },
    { ev: "farewell", scene: "arafat", crowd: "farewell", len: 2 },
    { ev: "death", scene: "dome", len: 1.8, verse: "death" },
    { id: "outro", type: "outro", scene: "night" }
  ];
  CHAPTERS.forEach((c) => { if (c.ev) { c.id = c.ev; c.type = "event"; } });
  const storyEvents = CHAPTERS.filter((c) => c.type === "event");

  /* ------------------------------------------------------------------ */
  /* Palettes de ciel et de silhouettes                                  */
  /* ------------------------------------------------------------------ */
  const PAL = {
    night:       { sky: ["#02040f", "#0a1236", "#1f2456"], stars: 1, moon: [0.74, 0.2], far: "#151c42", mid: "#0f1533", near: "#080b1e" },
    meccaNight:  { sky: ["#03061a", "#0d1844", "#2a3168"], stars: 1, moon: [0.76, 0.18], far: "#1b2452", mid: "#121a3d", near: "#090d24" },
    meccaDay:    { sky: ["#3b78b8", "#8dbfe0", "#f1dcb4"], sun: [0.82, 0.16, "#fff6da"], far: "#b48d6a", mid: "#86624a", near: "#553c2d" },
    meccaValley: { sky: ["#3b78b8", "#8dbfe0", "#f1dcb4"], sun: [0.86, 0.14, "#fff6da"], far: "#b48d6a", mid: "#86624a", near: "#553c2d" },
    harsh:       { sky: ["#c8692e", "#e89a52", "#f6d696"], sun: [0.5, 0.14, "#fffbea"], far: "#bd8152", mid: "#935c3b", near: "#663d26" },
    desert:      { sky: ["#4a8ccb", "#a0cce6", "#f5ddaa"], sun: [0.72, 0.2, "#fff3c6"], far: "#e3b87d", mid: "#cf9a5c", near: "#b07740" },
    desertOpen:  { sky: ["#5a94cf", "#b2d4e8", "#f7e2b4"], sun: [0.5, 0.12, "#fffbe8"], far: "#e8c189", mid: "#d6a466", near: "#bb8448" },
    dusk:        { sky: ["#181539", "#683d66", "#ee8f58"], stars: 0.35, sun: [0.6, 0.66, "#ffb37a"], far: "#563350", mid: "#3a2240", near: "#22142a" },
    caravan:     { sky: ["#35679f", "#dba57c", "#f8c98b"], sun: [0.28, 0.58, "#ffd9a0"], far: "#d0975f", mid: "#b37645", near: "#87552f" },
    hira:        { sky: ["#010208", "#060a22", "#14183f"], stars: 1, far: "#1d2456", mid: "#121840", near: "#080b1f" },
    sea:         { sky: ["#1c3060", "#7a8db6", "#f4c69a"], sun: [0.66, 0.52, "#ffe0b4"], far: "#3a4c78", mid: "#2b3b64", near: "#1c284a" },
    taif:        { sky: ["#2b4677", "#c4836e", "#f0b27a"], sun: [0.24, 0.52, "#ffd3a2"], far: "#695a78", mid: "#4a3e5c", near: "#2a293d" },
    isra:        { sky: ["#010109", "#05072a", "#14144a"], stars: 1, far: "#0b0d2c", mid: "#0c0f30", near: "#04050f" },
    hills:       { sky: ["#050819", "#141c48", "#2c2a5a"], stars: 0.9, moon: [0.22, 0.18], far: "#1a2147", mid: "#131938", near: "#0a0e22" },
    map:         { sky: ["#050b20", "#0a1533", "#111d44"], stars: 0.35, far: "#000000", mid: "#000000", near: "#000000" },
    medina:      { sky: ["#27496d", "#8bb0ac", "#f3d9a4"], sun: [0.78, 0.62, "#fff0c8"], far: "#4d786a", mid: "#2e584a", near: "#1b3a30" },
    oasis:       { sky: ["#27496d", "#8bb0ac", "#f3d9a4"], sun: [0.84, 0.3, "#fff0c8"], far: "#4d786a", mid: "#2e584a", near: "#1b3a30" },
    qibla:       { sky: ["#2f6a9c", "#a2c8d6", "#f2e0b8"], sun: [0.84, 0.2, "#fff6d8"], far: "#5d8a78", mid: "#386656", near: "#20433a" },
    field:       { sky: ["#20264a", "#68586c", "#c98f70"], sun: [0.9, 0.36, "#ffcf9e"], far: "#5c4850", mid: "#3c3040", near: "#241c29" },
    uhud:        { sky: ["#2a3a64", "#8a7486", "#dba27c"], sun: [0.16, 0.24, "#ffe2b8"], far: "#7a4a3e", mid: "#5a352e", near: "#33201e" },
    trench:      { sky: ["#252f47", "#69788a", "#b6bcc2"], far: "#4b5364", mid: "#343b4a", near: "#1e232e" },
    tree:        { sky: ["#3772ae", "#9bc5df", "#ecdcb8"], sun: [0.3, 0.16, "#fff8e0"], far: "#b5976e", mid: "#8a6e4f", near: "#57442f" },
    fort:        { sky: ["#3c68a0", "#b4c6d6", "#e8d2a8"], sun: [0.18, 0.24, "#fff4d4"], far: "#87776a", mid: "#5c5045", near: "#38302a" },
    valley:      { sky: ["#121834", "#46466c", "#a68d88"], stars: 0.4, far: "#38344e", mid: "#28253e", near: "#181627" },
    arafat:      { sky: ["#64a2da", "#badbef", "#f8edd2"], sun: [0.5, 0.1, "#ffffff"], far: "#c6ad88", mid: "#a68c68", near: "#836d4e" },
    dome:        { sky: ["#090e2c", "#2c2858", "#996a6c"], stars: 0.6, moon: [0.3, 0.2], far: "#1c1f40", mid: "#131733", near: "#0a0d21" }
  };

  /* ------------------------------------------------------------------ */
  /* Décors SVG (générés)                                                */
  /* ------------------------------------------------------------------ */
  const VW = 1600, VH = 900;
  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function ridge(seed, base, rough, step, peaks) {
    const r = rng(seed);
    let d = `M-60,${VH + 20} `;
    for (let x = -60; x <= VW + 60; x += step) {
      let y = base;
      for (const [px, ph, pw] of peaks) { const t = Math.max(0, 1 - Math.abs(x - px) / pw); y -= ph * Math.pow(t, 1.35); }
      y -= rough * (r() - 0.5);
      d += `L${x},${y.toFixed(1)} `;
    }
    return d + `L${VW + 60},${VH + 20}Z`;
  }
  function dune(base, amp, f1, f2, ph) {
    let d = `M-60,${VH + 20} `;
    for (let x = -60; x <= VW + 60; x += 25) {
      const y = base - amp * (0.55 * Math.sin(x * f1 + ph) + 0.45 * Math.sin(x * f2 + ph * 1.7));
      d += `L${x},${y.toFixed(1)} `;
    }
    return d + `L${VW + 60},${VH + 20}Z`;
  }
  const path = (d, fill, extra = "") => `<path d="${d}" fill="${fill}" ${extra}/>`;
  // une plaine presque plate, où se posent les foules
  const plain = (seed, base, fill) => path(ridge(seed, base, 4, 50, []), fill);
  function houses(seed, fill, by, cx, gap, hMin, hMax) {
    const r = rng(seed);
    let d = "";
    for (let x = -60; x < VW + 60;) {
      const w = 36 + r() * 70, h = hMin + r() * (hMax - hMin);
      if (Math.abs(x + w / 2 - cx) > gap) d += `M${x.toFixed(0)},${by} v${(-h).toFixed(0)} h${w.toFixed(0)} v${h.toFixed(0)}Z `;
      x += w + r() * 6;
    }
    return path(d, fill);
  }
  function kaaba(cx, by, s) {
    return `<g transform="translate(${cx} ${by}) scale(${s})">` +
      `<ellipse cx="0" cy="-4" rx="150" ry="24" fill="url(#kglow)"/>` +
      `<path d="M-40 -68 L0 -86 L40 -68 L0 -50Z" fill="#2a2d38"/>` +
      `<path d="M-40 -68 L0 -50 V0 L-40 -18Z" fill="#0f1118"/>` +
      `<path d="M0 -50 L40 -68 V-18 L0 0Z" fill="#1c1f2e"/>` +
      `<path d="M-40 -60 L0 -42 V-36 L-40 -54Z M0 -42 L40 -60 V-54 L0 -36Z" fill="#d8b25a"/>` +
      `<path d="M12 -33 L24 -38 V-20 L12 -15Z" fill="#d8b25a"/></g>`;
  }
  function mecca(p, seed) {
    return path(ridge(seed, 650, 18, 30, [[300, 210, 420], [1250, 260, 480], [880, 120, 300]]), p.far) +
      houses(seed + 1, p.mid, 820, 900, 150, 50, 120) +
      houses(seed + 2, p.near, 870, 900, 120, 25, 70) +
      kaaba(900, 872, 1.35);
  }
  function tent(x, y, s, fill) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-130 0 L-108 -52 L-56 -66 L0 -58 L52 -70 L104 -50 L130 0Z" fill="${fill}"/>` +
      `<path d="M-20 0 L-14 -40 L14 -40 L20 0Z" fill="#000" opacity=".45"/>` +
      `<path d="M-108 -52 L-150 4 M104 -50 L150 4" stroke="${fill}" stroke-width="3"/></g>`;
  }
  function acacia(x, y, s, fill) {
    return `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}">` +
      `<path d="M-5 0 C-5 -40 -3 -60 -22 -86 L-17 -89 C-3 -70 -1 -60 2 -72 C4 -82 18 -93 27 -97 L29 -93 C15 -83 9 -70 7 -50 C7 -30 6 -15 6 0Z"/>` +
      `<ellipse cx="-30" cy="-97" rx="72" ry="14"/><ellipse cx="26" cy="-103" rx="64" ry="13"/><ellipse cx="-4" cy="-112" rx="52" ry="11"/></g>`;
  }
  function palm(x, y, h, fill, lean, cls = "palm") {
    const tx = x + lean, ty = y - h, w = Math.max(5, h / 20);
    let s = `<path d="M${x},${y} Q${x + lean * 0.15},${y - h * 0.55} ${tx},${ty}" stroke="${fill}" stroke-width="${w.toFixed(1)}" fill="none" stroke-linecap="round"/>`;
    const fr = [[-80, 14], [-64, 42], [-34, 56], [74, 10], [60, 40], [30, 56], [-12, -30], [16, -32], [-40, -14], [44, -16]];
    for (const [dx, dy] of fr) {
      const k = h / 180;
      s += `<path d="M${tx},${ty} q${(dx * 0.45 * k).toFixed(1)},${(-26 * k).toFixed(1)} ${(dx * k).toFixed(1)},${(dy * k).toFixed(1)}" stroke="${fill}" stroke-width="${Math.max(2.5, w * 0.55).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
    }
    return `<g class="${cls}" style="transform-origin:${x}px ${y}px">${s}</g>`;
  }
  function camel(x, y, s, fill, delay) {
    const legs = [["a", 24, 45, 22], ["b", 33, 45, 35], ["b", 56, 45, 54], ["a", 64, 43, 66]]
      .map(([c, x1, y1, x2]) => `<path class="leg ${c}" d="M${x1} ${y1} L${x2} 77" style="animation-delay:${delay}s"/>`).join("");
    return `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}" stroke="${fill}" stroke-width="4.2" stroke-linecap="round">` +
      `<path stroke="none" d="M10 40 C12 30 20 22 30 18 C38 12 48 12 54 20 C58 26 62 30 66 30 C68 22 70 14 76 10 C80 7 86 8 90 12 L91 15 C88 16 84 15 81 15 C79 22 76 32 70 42 C66 47 58 48 50 47 L30 47 C20 47 12 46 10 40Z"/>` +
      `<path stroke="none" d="M30 15 h24 l-2 -9 h-20Z" opacity=".85"/>` +
      `<path d="M10 40 L6 55" stroke-width="2.2" fill="none"/>${legs}</g>`;
  }
  function waves(base, amp, period, fill, cls) {
    let d = `M-200,${VH + 20} `;
    for (let x = -200; x <= VW + period + 200; x += 20) d += `L${x},${(base + amp * Math.sin((x / period) * Math.PI * 2)).toFixed(1)} `;
    return `<path class="${cls}" d="${d}L${VW + period + 200},${VH + 20}Z" fill="${fill}" style="--period:${period}px"/>`;
  }
  function jerusalem(x, y, s, fill) {
    let cren = "";
    for (let i = -300; i < 300; i += 22) cren += `M${i},-40 h12 v-10 h-12Z `;
    return `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}">` +
      `<path d="M-300 0 V-40 H300 V0Z ${cren}"/>` +
      `<path d="M-250 -40 V-78 H-70 V-40Z"/><path d="M-182 -78 A22 22 0 0 1 -138 -78Z"/>` +
      `<path d="M-10 -40 V-90 L10 -100 H110 L130 -90 V-40Z"/><path d="M18 -100 V-120 H102 V-100Z"/>` +
      `<path class="dome-gold" d="M14 -120 A46 46 0 0 1 106 -120Z" fill="#d9b25a"/><path d="M60 -166 v-14" stroke="#d9b25a" stroke-width="3"/>` +
      `<ellipse cx="-285" cy="-80" rx="9" ry="40"/><ellipse cx="200" cy="-75" rx="10" ry="36"/><ellipse cx="225" cy="-66" rx="8" ry="27"/></g>`;
  }
  function mosqueBricks(cx, by, fill) {
    const cols = 24, rows = 8, bw = 20, bh = 10, x0 = cx - (cols * bw) / 2;
    let s = "";
    for (let i = 0; i < 7; i++) {
      const px = x0 + 30 + i * ((cols * bw - 60) / 6);
      s += `<path d="M${px},${by} V${by - 150}" stroke="#6b5136" stroke-width="7"/>`;
    }
    s += `<path d="M${x0 - 10},${by - 150} H${x0 + cols * bw + 10} V${by - 138} H${x0 - 10}Z" fill="#6f8a5a"/>`;
    let k = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r < 6 && c >= 11 && c <= 12) continue; // porte
        s += `<rect class="brick" data-k="${k++}" x="${(x0 + c * bw).toFixed(0)}" y="${by - (r + 1) * bh}" width="${bw - 1.5}" height="${bh - 1.5}" rx="1" fill="${fill}"/>`;
      }
    }
    return `<g class="mosque">${s}</g>`;
  }
  function fortress(x, y, s, fill) {
    let cren = "";
    for (let i = -60; i < 60; i += 16) cren += `M${i},-90 h9 v-10 h-9Z `;
    return `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}"><path d="M-60 0 V-90 H60 V0Z ${cren}"/><path d="M-80 0 V-120 H-50 V0Z M50 0 V-130 H80 V0Z"/><path d="M-80 -120 h30 v-10 h-30Z M50 -130 h30 v-10 h-30Z"/></g>`;
  }
  function prophetMosque(cx, by, p) {
    let arches = "";
    for (let x = cx - 280; x < cx + 280; x += 40) arches += `M${x + 8},${by} v-26 a12 12 0 0 1 24 0 v26Z `;
    const minaret = (mx) => `<path d="M${mx - 10},${by - 60} V${by - 250} h20 V${by - 60}Z M${mx - 16},${by - 200} h32 v8 h-32Z M${mx - 10},${by - 250} L${mx},${by - 290} L${mx + 10},${by - 250}Z" fill="${p.mid}"/>`;
    return `<g>${minaret(cx - 250)}${minaret(cx + 250)}` +
      `<path d="M${cx - 300},${by} V${by - 60} H${cx + 300} V${by}Z" fill="${p.mid}"/><path d="${arches}" fill="#f6d68a" opacity=".55"/>` +
      `<ellipse cx="${cx}" cy="${by - 120}" rx="140" ry="90" fill="url(#domeGlow)"/>` +
      `<path d="M${cx - 42},${by - 60} V${by - 92} H${cx + 42} V${by - 60}Z" fill="${p.mid}"/>` +
      `<path class="green-dome" d="M${cx - 50},${by - 92} C${cx - 50},${by - 150} ${cx - 10},${by - 160} ${cx},${by - 178} C${cx + 10},${by - 160} ${cx + 50},${by - 150} ${cx + 50},${by - 92}Z" fill="#2f8d58"/>` +
      `<path d="M${cx},${by - 178} v-16" stroke="#d9b25a" stroke-width="3"/></g>`;
  }

  function buildScenes() {
    const P = PAL;
    const scenes = {
      night: () => path(dune(760, 30, 0.004, 0.009, 1), P.night.far) + path(dune(830, 26, 0.005, 0.011, 4), P.night.near),
      meccaNight: () => mecca(P.meccaNight, 11),
      meccaDay: () => mecca(P.meccaDay, 11),
      harsh: () => mecca(P.harsh, 11),
      desert: () => path(dune(640, 50, 0.003, 0.007, 2), P.desert.far) + path(dune(730, 46, 0.004, 0.009, 5), P.desert.mid) +
        tent(930, 800, 1.1, "#3b2a22") + path(dune(840, 34, 0.005, 0.012, 7), P.desert.near),
      desertOpen: () => path(dune(600, 44, 0.003, 0.006, 3), P.desertOpen.far) + path(dune(680, 30, 0.004, 0.008, 6), P.desertOpen.mid) + path(dune(840, 36, 0.005, 0.011, 9), P.desertOpen.near),
      dusk: () => path(dune(700, 34, 0.003, 0.008, 3), P.dusk.far) + path(dune(780, 30, 0.004, 0.01, 6), P.dusk.mid) +
        acacia(990, 800, 1.5, P.dusk.near) + path(dune(850, 22, 0.005, 0.012, 1), P.dusk.near),
      caravan: () => path(dune(640, 48, 0.003, 0.007, 8), P.caravan.far) + path(dune(740, 40, 0.004, 0.009, 2), P.caravan.mid) +
        `<g class="caravan">${[0, 1, 2, 3, 4].map((i) => camel(560 + i * 125, 690 + (i % 2) * 6, 1.25, "#3a2416", -i * 0.37)).join("")}</g>` +
        path(dune(850, 30, 0.005, 0.012, 4), P.caravan.near),
      hira: () => path(ridge(21, 700, 20, 30, [[300, 160, 360], [1350, 200, 400]]), P.hira.far) +
        path(ridge(22, 790, 14, 20, [[920, 470, 560]]), P.hira.mid) +
        `<circle class="cave-glow" cx="935" cy="372" r="60" fill="url(#caveGlow)"/><circle cx="935" cy="374" r="5" fill="#ffe6a6"/>` +
        path(ridge(23, 860, 10, 30, [[200, 60, 300], [1500, 80, 300]]), P.hira.near),
      sea: () => path(ridge(31, 610, 10, 40, [[200, 60, 400], [1400, 50, 400]]), P.sea.far) +
        waves(640, 6, 160, "#2c3d66", "wave w1") +
        `<g class="ship-wrap"><g class="ship" transform="translate(900 700)"><path d="M-95 0 L95 0 L72 28 L-72 28Z" fill="#20160f"/><path d="M0 2 V-140" stroke="#20160f" stroke-width="5"/><path d="M-8 -136 L96 -14 L-70 -14Z" fill="#f1e3c6" opacity=".92"/></g></g>` +
        waves(700, 10, 220, "#22325a", "wave w2") + waves(780, 14, 300, "#18244a", "wave w3"),
      taif: () => path(ridge(41, 600, 30, 25, [[400, 260, 420], [1100, 300, 460], [1500, 180, 300]]), P.taif.far) +
        path(ridge(42, 720, 20, 25, [[700, 120, 400], [1300, 140, 380]]), P.taif.mid) +
        [560, 650, 760, 860, 960, 1060, 1160].map((x, i) => `<g fill="${P.taif.near}"><rect x="${x - 4}" y="${760 - 10 - (i % 3) * 6}" width="8" height="40"/><circle cx="${x}" cy="${740 - (i % 3) * 6}" r="${34 + (i % 2) * 8}"/></g>`).join("") +
        path(ridge(43, 860, 8, 40, []), P.taif.near),
      isra: () => path(ridge(51, 820, 14, 40, [[300, 60, 400], [1300, 60, 400]]), P.isra.mid) +
        jerusalem(640, 820, 0.9, "#181c46") + kaaba(1050, 834, 0.7) + path(ridge(52, 880, 6, 40, []), P.isra.near),
      hills: () => path(ridge(61, 600, 16, 30, [[500, 160, 420], [1200, 190, 420]]), P.hills.far) +
        plain(62, 640, P.hills.mid) +
        [[860, 700], [1060, 690], [960, 715]].map(([x, y], i) => `<circle class="lantern" style="animation-delay:${i * 0.7}s" cx="${x}" cy="${y}" r="26" fill="url(#lampGlow)"/><circle cx="${x}" cy="${y}" r="3" fill="#ffd98a"/>`).join("") +
        plain(63, 820, P.hills.near),
      medina: () => path(ridge(71, 690, 10, 40, [[300, 80, 400], [1350, 120, 400]]), P.medina.far) +
        [380, 480, 1240, 1340].map((x, i) => palm(x, 800, 210 + (i % 2) * 40, P.medina.mid, (i % 2 ? 14 : -10), "palm grow")).join("") +
        mosqueBricks(900, 820, "#a8805a") +
        [250, 600, 1180, 1460].map((x, i) => palm(x, 880, 300 + (i % 2) * 50, P.medina.near, (i % 2 ? -18 : 16), "palm grow")).join("") +
        path(ridge(72, 880, 6, 40, []), P.medina.near),
      oasis: () => path(ridge(171, 590, 10, 40, [[300, 80, 400], [1350, 120, 400]]), P.oasis.far) +
        [180, 300, 420, 1260, 1380, 1500].map((x, i) => palm(x, 640, 200 + (i % 3) * 30, P.oasis.mid, i % 2 ? 12 : -12)).join("") +
        plain(172, 625, P.oasis.mid) + plain(173, 810, P.oasis.near),
      qibla: () => path(ridge(71, 690, 10, 40, [[300, 80, 400], [1350, 120, 400]]), P.qibla.far) +
        [380, 1300].map((x, i) => palm(x, 820, 240, P.qibla.mid, i ? 12 : -10)).join("") +
        `<g class="compass" transform="translate(900 360)"><circle r="150" fill="none" stroke="#e8c776" stroke-width="2" opacity=".8"/>` +
        `<circle r="134" fill="#0b1730" opacity=".28"/><g fill="#e8c776" opacity=".55"><rect x="-26" y="-26" width="52" height="52"/><rect x="-26" y="-26" width="52" height="52" transform="rotate(45)"/></g>` +
        `<g class="needle"><path d="M0 -128 L14 0 L0 18 L-14 0Z" fill="#f2d27a"/><path d="M0 18 L10 0 L0 128 L-10 0Z" fill="#e8c776" opacity=".35"/></g>` +
        `<text class="q-north" y="-168" text-anchor="middle"></text><text class="q-south" y="190" text-anchor="middle"></text></g>` +
        path(ridge(72, 860, 6, 40, []), P.qibla.near),
      field: () => path(ridge(81, 560, 14, 30, [[400, 120, 420], [1200, 150, 420]]), P.field.far) + plain(82, 600, P.field.mid) + plain(83, 800, P.field.near),
      uhud: () => path(ridge(91, 560, 30, 20, [[1000, 330, 620]]), P.uhud.far) + plain(92, 610, P.uhud.mid) + path(ridge(93, 700, 8, 20, [[180, 110, 200]]), P.uhud.near),
      trench: () => path(ridge(101, 560, 20, 30, [[300, 200, 300], [1400, 120, 300]]), P.trench.far) + houses(102, P.trench.mid, 615, 2000, 0, 14, 40) + plain(103, 612, P.trench.mid) + plain(104, 810, P.trench.near),
      tree: () => path(ridge(111, 560, 14, 30, [[300, 100, 400], [1300, 120, 420]]), P.tree.far) + plain(112, 600, P.tree.mid) + acacia(1080, 640, 1.25, P.tree.near) + plain(113, 810, P.tree.near),
      meccaValley: () => path(ridge(161, 600, 20, 25, [[250, 260, 420], [1350, 280, 460], [800, 120, 300]]), P.meccaValley.far) + plain(162, 620, P.meccaValley.mid) + plain(163, 810, P.meccaValley.near),
      fort: () => path(ridge(121, 650, 20, 30, [[400, 150, 400], [1200, 170, 420]]), P.fort.far) +
        path(ridge(122, 780, 16, 25, [[700, 90, 220], [1050, 110, 240]]), P.fort.mid) +
        fortress(700, 700, 0.9, P.fort.near) + fortress(1050, 680, 1.05, P.fort.near) +
        [560, 860, 1240, 1380].map((x, i) => palm(x, 860, 190 + (i % 2) * 40, P.fort.near, i % 2 ? 12 : -12)).join("") + path(ridge(123, 880, 6, 40, []), P.fort.near),
      valley: () => path(ridge(131, 700, 30, 20, [[250, 520, 520]]), P.valley.far) + path(ridge(132, 700, 30, 20, [[1450, 560, 560]]), P.valley.mid) + plain(133, 640, P.valley.mid) + plain(134, 820, P.valley.near),
      arafat: () => path(ridge(141, 560, 20, 30, [[300, 200, 400], [1300, 220, 420]]), P.arafat.far) + plain(142, 600, P.arafat.mid) + plain(143, 810, P.arafat.near),
      dome: () => path(ridge(151, 720, 14, 30, [[300, 120, 400], [1350, 140, 400]]), P.dome.far) +
        [470, 560, 1240, 1330].map((x, i) => palm(x, 840, 220 + (i % 2) * 40, P.dome.mid, i % 2 ? 12 : -12)).join("") +
        prophetMosque(900, 850, P.dome) + path(ridge(152, 885, 6, 40, []), P.dome.near),
      map: () => ""
    };
    const defs = `<defs>
      <radialGradient id="kglow"><stop offset="0" stop-color="#fff2c8" stop-opacity=".55"/><stop offset="1" stop-color="#fff2c8" stop-opacity="0"/></radialGradient>
      <radialGradient id="caveGlow"><stop offset="0" stop-color="#ffe7a8" stop-opacity=".95"/><stop offset=".4" stop-color="#ffcf6e" stop-opacity=".35"/><stop offset="1" stop-color="#ffcf6e" stop-opacity="0"/></radialGradient>
      <radialGradient id="lampGlow"><stop offset="0" stop-color="#ffd98a" stop-opacity=".8"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
      <radialGradient id="domeGlow"><stop offset="0" stop-color="#7fe0a8" stop-opacity=".35"/><stop offset="1" stop-color="#7fe0a8" stop-opacity="0"/></radialGradient>
    </defs>`;
    $("#sceneSvg").innerHTML = defs + Object.entries(scenes).map(([id, fn]) => `<g class="scene" data-scene="${id}">${fn()}</g>`).join("");
  }

  /* ------------------------------------------------------------------ */
  /* Carte de la scène (Hégire, lettres)                                 */
  /* ------------------------------------------------------------------ */
  const LETTERS = [
    { to: "jerusalem", who: "heraclius" }, { to: "ctesiphon", who: "khosrow" }, { to: "aksum", who: "negus" },
    { to: "alexandria", who: "muqawqis" }, { to: "hajar", who: "mundhir" }, { to: "bosra", who: "harith" }
  ];
  const mapLens = {};
  function smoothPath(pts) {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0]},${p2[1]}`;
    }
    return d;
  }
  function buildMap() {
    const svg = $("#stageMap");
    const P = M.places;
    const arc = (a, b) => {
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
      return `M${a[0]},${a[1]} Q${(mx - dy * 0.25).toFixed(1)},${(my + dx * 0.25).toFixed(1)} ${b[0]},${b[1]}`;
    };
    const pinLabel = { mecca: [-3, 1.2, "end"], thawr: [-3, 6.5, "end"], medina: [-3, 1.6, "end"] };
    const destLabel = (to) => ({ ctesiphon: [-9, -9, "end"], hajar: [-9, -9, "end"], bosra: [-6, -10, "end"], jerusalem: [8, 20, "start"], alexandria: [2, 24, "start"] }[to] || [9, -9, "start"]);
    svg.innerHTML =
      `<rect x="-400" y="-400" width="1400" height="1600" class="sm-sea"/>` +
      `<image class="sm-relief" href="data/map-relief.jpg" x="0" y="0" width="600" height="760" preserveAspectRatio="none"/>` +
      `<path class="sm-land" d="${M.land}"/>` +
      `<g class="sm-hijra"><path class="sm-route" id="smHijra" d="${smoothPath(M.routes.hijra)}"/>` +
      Object.entries(pinLabel).map(([id, [dx, dy, a]]) => `<g class="sm-pin" data-id="${id}"><circle cx="${P[id][0]}" cy="${P[id][1]}" r="1.5"/><text x="${P[id][0] + dx}" y="${P[id][1] + dy}" text-anchor="${a}"></text></g>`).join("") +
      `<circle class="sm-traveler" id="smTraveler" r="2.2" cx="${P.mecca[0]}" cy="${P.mecca[1]}"/></g>` +
      `<g class="sm-letters">${LETTERS.map((l, i) => `<path class="sm-arc" data-i="${i}" d="${arc(P.medina, P[l.to])}"/>`).join("")}` +
      `<circle class="sm-origin" cx="${P.medina[0]}" cy="${P.medina[1]}" r="6"/>` +
      LETTERS.map((l, i) => { const [dx, dy, a] = destLabel(l.to); return `<g class="sm-dest" data-i="${i}"><circle cx="${P[l.to][0]}" cy="${P[l.to][1]}" r="5"/><text x="${P[l.to][0] + dx}" y="${P[l.to][1] + dy}" text-anchor="${a}"></text></g>`; }).join("") + `</g>`;
    const h = $("#smHijra");
    mapLens.hijra = h.getTotalLength();
    h.style.strokeDasharray = `${mapLens.hijra} ${mapLens.hijra}`;
    h.style.strokeDashoffset = mapLens.hijra;
    $$(".sm-arc", svg).forEach((p) => { const L = p.getTotalLength(); p.dataset.len = L; p.style.strokeDasharray = `${L} ${L}`; p.style.strokeDashoffset = L; });
  }
  function mapLabels() {
    $$("#stageMap .sm-pin").forEach((g) => { g.querySelector("text").textContent = U.tr(S.places[g.dataset.id]); });
    $$("#stageMap .sm-dest").forEach((g) => { g.querySelector("text").textContent = U.T().rulers[LETTERS[+g.dataset.i].who]; });
  }
  function fitMapView(mode) {
    const svg = $("#stageMap");
    if (mode === "hijra") {
      const pts = M.routes.hijra;
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const x0 = Math.min(...xs) - 40, x1 = Math.max(...xs) + 40, y0 = Math.min(...ys) - 14, y1 = Math.max(...ys) + 14;
      svg.setAttribute("viewBox", `${x0} ${y0} ${x1 - x0} ${y1 - y0}`);
    } else svg.setAttribute("viewBox", `0 0 ${M.w} ${M.h}`);
    svg.dataset.mode = mode;
  }

  /* ------------------------------------------------------------------ */
  /* Rendu des chapitres                                                 */
  /* ------------------------------------------------------------------ */
  function verseBlock(key) {
    const v = S.verses[key];
    if (!v) return "";
    const L = U.lang();
    return `<blockquote class="st-verse"><p class="st-verse-ar" lang="ar">﴿ ${esc(v.ar)} ﴾</p>` +
      (L !== "ar" ? `<p class="st-verse-tr">${L === "fr" ? "« " + esc(v.fr) + " »" : "“" + esc(v.en) + "”"}</p>` : "") +
      `<cite>${esc(U.tr(v.ref))}</cite></blockquote>`;
  }
  function renderStory() {
    const T = U.T();
    const box = $("#story");
    const prev = activeIndex >= 0 ? CHAPTERS[activeIndex].id : null;
    const prevEl = prev && $("#ch-" + prev);
    const prevOff = prevEl ? window.scrollY - prevEl.offsetTop : 0;
    const open = new Set($$(".st-card.open", box).map((n) => n.dataset.id));
    box.innerHTML = CHAPTERS.map((c, i) => {
      const len = c.len || 1.25;
      if (c.type === "intro") {
        return `<section class="st-intro" id="ch-intro" data-i="${i}">
          <div class="st-intro-inner">
            <p class="st-intro-ar" lang="ar">السيرة النبوية</p>
            <h1>${esc(T.introTitle)}</h1>
            <p class="st-intro-lead">${esc(T.introLead)}</p>
            <div class="st-intro-actions">
              <button type="button" class="st-btn st-btn-gold" data-go="p-early">${esc(T.start)}</button>
              <button type="button" class="st-btn st-btn-line" data-film>${esc(T.watchFilm)}</button>
              <button type="button" class="st-btn st-btn-line" data-sound aria-pressed="${Sound.on}">${esc(Sound.on ? T.soundOff : T.soundOn)}</button>
              ${U.voice && U.voice.supported ? `<button type="button" class="st-btn st-btn-line" data-voice aria-pressed="${U.voice.on}">${esc(U.voice.on ? T.voiceOff : T.voiceOn)}</button>` : ""}
            </div>
            <p class="st-cue" aria-hidden="true"><span></span>${esc(T.scrollCue)}</p>
          </div></section>`;
      }
      if (c.type === "outro") {
        return `<section class="st-outro" id="ch-outro" data-i="${i}"><div class="st-outro-inner">
          ${verseBlock("mercy")}
          <p class="st-salawat" lang="ar">صلى الله عليه وسلم</p>
          <p class="st-outro-lead">${esc(T.outroLead)}</p>
          <div class="st-intro-actions">
            <a class="st-btn st-btn-gold" href="#map">${esc(T.outroMap)}</a>
            <a class="st-btn st-btn-line" href="#quiz">${esc(T.outroQuiz)}</a>
            <button type="button" class="st-btn st-btn-line" data-go="intro">${esc(T.outroAgain)}</button>
          </div></div></section>`;
      }
      if (c.type === "period") {
        const p = S.periods.find((x) => x.id === c.period);
        return `<section class="st-period" id="ch-${c.id}" data-i="${i}" style="--len:1.2">
          <div class="st-period-inner">
            <p class="st-period-years">${U.digits(p.from)} – ${U.digits(p.to)}</p>
            <h2>${esc(U.tr(p))}</h2>
            <p class="st-period-line">${esc(T.periodLines[c.period])}</p>
            ${verseBlock(c.verse)}
          </div></section>`;
      }
      const e = eventById[c.ev];
      const t = U.tr(e);
      const isOpen = open.has(c.id);
      const age = U.ageText(e);
      return `<section class="st-chapter" id="ch-${c.id}" data-i="${i}" style="--len:${len}">
        <article class="st-card${isOpen ? " open" : ""}" data-id="${c.id}" data-period="${e.period}">
          <p class="st-date"><b>${U.yearText(e)}</b><span>${esc(U.ahText(e))}${age ? U.SEP() + esc(age) : ""}</span></p>
          <h2>${esc(t.title)}</h2>
          <p class="st-summary">${esc(t.summary)}</p>
          <div class="st-more"${isOpen ? "" : " hidden"}><p>${esc(t.details)}</p>${c.verse ? verseBlock(c.verse) : ""}</div>
          <div class="st-actions">
            <button type="button" class="st-link" data-more aria-expanded="${isOpen}">${esc(isOpen ? T.readLess : T.readMore)}</button>
            ${e.route || e.place ? `<button type="button" class="st-link" data-map="${e.id}" aria-haspopup="dialog">${esc(T.seeOnMap)}</button>` : ""}
            ${U.photos && U.photos.has(c.id) ? `<button type="button" class="st-link" data-photos="${c.id}" data-label="${esc(t.title)}" aria-haspopup="dialog">${esc(T.seePhotos)}</button>` : ""}
          </div>
        </article></section>`;
    }).join("");
    mapLabels();
    sceneLabels();
    renderDrawer();
    renderHudTrack();
    sections = $$("#story > section");
    const again = prev && $("#ch-" + prev);
    if (again) window.scrollTo(0, again.offsetTop + prevOff);
    activeIndex = -1;
    onScroll();
  }
  function sceneLabels() {
    const T = U.T();
    const n = $("#sceneSvg .q-north"), s = $("#sceneSvg .q-south");
    if (n) { n.textContent = "↑ " + T.qiblaNorth; s.textContent = "↓ " + T.qiblaSouth; }
  }

  $("#story").addEventListener("click", (ev) => {
    const more = ev.target.closest("[data-more]");
    if (more) {
      const card = more.closest(".st-card");
      setOpen(card, !card.classList.contains("open"));
      if (card.classList.contains("open") && U.voice && U.voice.on) { const c = CHAPTERS.find((x) => x.id === card.dataset.id); if (c) U.voice.say(U.tr(eventById[c.ev]).details, { replace: true }); }
      return;
    }
    const go = ev.target.closest("[data-go]");
    if (go) { goTo(go.dataset.go); return; }
    if (ev.target.closest("[data-film]")) { setPlaying(true); goTo("p-early"); return; }
    const snd = ev.target.closest("[data-sound]");
    if (snd) { toggleSound(); return; }
    if (ev.target.closest("[data-voice]")) { toggleVoice(); return; }
    const mapLink = ev.target.closest("[data-map]");
    if (mapLink) { ev.preventDefault(); openSheet(mapLink.dataset.map, mapLink); }
  });
  function setOpen(card, on) {
    card.classList.toggle("open", on);
    $(".st-more", card).hidden = !on;
    const b = $("[data-more]", card);
    b.setAttribute("aria-expanded", String(on));
    b.textContent = on ? U.T().readLess : U.T().readMore;
  }
  function goTo(id, openCard) {
    const el = $("#ch-" + id);
    if (!el) return;
    const card = $(".st-card", el);
    if (openCard && card) setOpen(card, true);
    window.scrollTo({ top: el.offsetTop, behavior: reduceMotion ? "auto" : "smooth" });
  }

  /* ------------------------------------------------------------------ */
  /* Carte d'un événement, ouverte par-dessus le chapitre                */
  /* (on ne quitte pas le voyage : à la fermeture, on est au même endroit) */
  /* ------------------------------------------------------------------ */
  let sheetEvent = null, sheetOpener = null, sheetAnim = 0;
  const placeAt = (pt) => Object.keys(M.places).find((k) => M.places[k][0] === pt[0] && M.places[k][1] === pt[1]);
  function openSheet(id, opener) {
    const e = eventById[id];
    if (!e) return;
    sheetEvent = e;
    sheetOpener = opener || null;
    const box = $("#mapSheet");
    box.hidden = false;
    document.body.classList.add("sheet-open");
    renderSheet();
    $("#sheetClose").focus({ preventScroll: true });
  }
  function closeSheet() {
    const box = $("#mapSheet");
    if (box.hidden) return;
    box.hidden = true;
    document.body.classList.remove("sheet-open");
    cancelAnimationFrame(sheetAnim);
    if (sheetOpener) sheetOpener.focus({ preventScroll: true });
  }
  function renderSheet() {
    const e = sheetEvent;
    if (!e) return;
    const T = U.T();
    const r = e.route ? S.routes.find((x) => x.id === e.route) : null;
    $("#sheetDate").textContent = U.yearText(e) + U.SEP() + U.ahText(e);
    $("#sheetTitle").textContent = r ? U.tr(r).name : U.tr(e).title;
    $("#sheetInfo").textContent = r ? U.tr(r).info : U.tr(e).summary;
    const svg = $("#sheetMap");
    // les lieux à nommer : extrémités de l'itinéraire, et le lieu de l'événement
    const pts = r ? M.routes[e.route] : [M.places[e.place]];
    const ids = new Set();
    if (r) { [pts[0], pts[pts.length - 1]].forEach((pt) => { const k = placeAt(pt); if (k) ids.add(k); }); }
    if (e.place && M.places[e.place]) ids.add(e.place);
    // cadrage : l'itinéraire ou le lieu, avec de la marge, au format du cadre
    const all = [...pts, ...[...ids].map((k) => M.places[k])];
    const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
    const box = svg.getBoundingClientRect();
    const ratio = box.width / Math.max(1, box.height);
    let w = Math.max(Math.max(...xs) - Math.min(...xs), 50) * 1.5 + 40;
    let h = Math.max(Math.max(...ys) - Math.min(...ys), 50) * 1.3 + 40;
    if (w / h > ratio) h = w / ratio; else w = h * ratio;
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    svg.setAttribute("viewBox", `${(cx - w / 2).toFixed(1)} ${(cy - h / 2).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
    const k = w / Math.max(1, box.width); // unités de carte par pixel, pour garder des tailles fixes à l'écran
    const fs = (px) => (px * k).toFixed(2);
    const others = S.routes.filter((x) => x.id !== e.route).map((x) => `<path class="ms-other" d="${smoothPath(M.routes[x.id])}" style="stroke-width:${fs(1.5)}"/>`).join("");
    const label = (id) => {
      const [x, y] = M.places[id];
      const left = x < cx;
      return `<g class="ms-place"><circle cx="${x}" cy="${y}" r="${fs(5)}" style="stroke-width:${fs(2)}"/>` +
        `<text x="${(x + (left ? -1 : 1) * 9 * k).toFixed(1)}" y="${(y + 4 * k).toFixed(1)}" text-anchor="${left ? "end" : "start"}" style="font-size:${fs(14)}px;stroke-width:${fs(4)}px">${esc(U.tr(S.places[id]))}</text></g>`;
    };
    svg.innerHTML = `<rect x="-400" y="-400" width="1400" height="1600" class="ms-sea"/><image class="ms-relief" href="data/map-relief.jpg" x="0" y="0" width="600" height="760" preserveAspectRatio="none"/><path class="ms-land" d="${M.land}" style="stroke-width:${fs(1)}"/>` + others +
      (r ? `<path class="ms-route${r.spiritual ? " spiritual" : ""}" id="sheetRoute" d="${smoothPath(pts)}" style="stroke-width:${fs(4)}"/><circle class="ms-traveler" id="sheetTraveler" r="${fs(6)}" cx="${pts[0][0]}" cy="${pts[0][1]}"/>` : "") +
      [...ids].map(label).join("") +
      (!r ? `<circle class="ms-pulse" cx="${M.places[e.place][0]}" cy="${M.places[e.place][1]}" r="${fs(18)}" style="stroke-width:${fs(2)}"/>` : "");
    // le tracé se dessine
    cancelAnimationFrame(sheetAnim);
    const route = $("#sheetRoute");
    if (!route) return;
    const L = route.getTotalLength();
    if (!r.spiritual) route.style.strokeDasharray = `${L} ${L}`;
    const tv = $("#sheetTraveler");
    const t0 = performance.now(), dur = reduceMotion ? 0 : 1800;
    const step = (now) => {
      const q = dur ? smooth(clamp((now - t0) / dur)) : 1;
      if (!r.spiritual) route.style.strokeDashoffset = L * (1 - q);
      const pt = route.getPointAtLength(L * q);
      tv.setAttribute("cx", pt.x); tv.setAttribute("cy", pt.y);
      if (q < 1) sheetAnim = requestAnimationFrame(step);
    };
    sheetAnim = requestAnimationFrame(step);
  }
  $("#mapSheet").addEventListener("click", (ev) => {
    if (ev.target === $("#mapSheet") || ev.target.closest("#sheetClose, #sheetBack")) closeSheet();
    else if (ev.target.closest("#sheetFull")) {
      const id = sheetEvent && sheetEvent.id;
      closeSheet();
      if (id && U.showOnMap) U.showOnMap(id);
    }
  });
  document.addEventListener("keydown", (ev) => {
    if ($("#mapSheet").hidden) return;
    if (ev.key === "Escape") closeSheet();
    if (ev.key === "Tab") { // le focus reste dans la fenêtre
      const f = $$("#mapSheet button");
      if (ev.shiftKey && document.activeElement === f[0]) { ev.preventDefault(); f[f.length - 1].focus(); }
      else if (!ev.shiftKey && document.activeElement === f[f.length - 1]) { ev.preventDefault(); f[0].focus(); }
    }
  });
  window.addEventListener("resize", () => { if (!$("#mapSheet").hidden) renderSheet(); });

  /* ------------------------------------------------------------------ */
  /* Tiroir des chapitres et barre de vie                                */
  /* ------------------------------------------------------------------ */
  function renderDrawer() {
    $("#drawerList").innerHTML = S.periods.map((p) => `<li class="dr-period" style="--c:var(--p-${p.id})"><b>${esc(U.tr(p))}</b><ol>` +
      storyEvents.filter((c) => eventById[c.ev].period === p.id).map((c) => {
        const e = eventById[c.ev];
        return `<li><button type="button" data-jump="${c.id}"><span>${U.yearText(e)}</span>${esc(U.tr(e).title)}</button></li>`;
      }).join("") + `</ol></li>`).join("");
  }
  function openDrawer(on) {
    $("#drawer").hidden = !on;
    document.body.classList.toggle("drawer-open", on);
    $("#chaptersBtn").setAttribute("aria-expanded", String(on));
    if (on) { const curBtn = $(`#drawerList [data-jump="${CHAPTERS[activeIndex] ? CHAPTERS[activeIndex].id : ""}"]`); (curBtn || $("#drawerList button")).focus(); }
    else $("#chaptersBtn").focus();
  }
  $("#chaptersBtn").addEventListener("click", () => openDrawer($("#drawer").hidden));
  $("#drawer").addEventListener("click", (ev) => {
    if (ev.target.closest("[data-close]") || ev.target === $("#drawer")) return openDrawer(false);
    const b = ev.target.closest("[data-jump]");
    if (b) { openDrawer(false); goTo(b.dataset.jump); }
  });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && !$("#drawer").hidden) openDrawer(false); });

  const START = 570, END = 632;
  const yearPct = (y) => ((y - START) / (END - START)) * 100;
  function renderHudTrack() {
    $("#hudTrack").innerHTML = S.periods.map((p) => `<i class="hud-seg" style="flex:${p.to - p.from};--c:var(--p-${p.id})"></i>`).join("") +
      storyEvents.map((c) => { const e = eventById[c.ev]; return `<button type="button" class="hud-tick" style="inset-inline-start:${yearPct(e.year)}%" data-jump="${c.id}" aria-label="${esc(U.yearText(e) + " — " + U.tr(e).title)}"></button>`; }).join("") +
      `<span class="hud-marker" id="hudMarker"></span>`;
  }
  $("#hudTrack").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-jump]");
    if (b) goTo(b.dataset.jump);
  });

  /* ------------------------------------------------------------------ */
  /* Défilement : chapitre actif et progression                          */
  /* ------------------------------------------------------------------ */
  let sections = [];
  let activeIndex = -1;
  let progress = 0;
  let storyVisible = true;
  function onScroll() {
    if (!sections.length) return;
    const line = window.innerHeight * 0.5;
    let idx = -1;
    for (let i = 0; i < sections.length; i++) {
      const r = sections[i].getBoundingClientRect();
      if (r.top <= line && r.bottom > line) { idx = i; break; }
    }
    if (idx === -1) idx = sections[0].getBoundingClientRect().top > line ? 0 : sections.length - 1;
    if (idx !== activeIndex) setActive(idx);
  }
  // la scène s'anime d'elle-même : la progression suit le temps passé sur le chapitre
  let chapterT0 = 0;
  // un chapitre de bataille dure le temps de sa simulation
  const chapterDur = (c) => (gl && U.stage3d && U.stage3d.duration && U.stage3d.duration(c)) || (c.type === "event" ? (c.len || 1.25) * 4000 : 4000);
  const readTime = (c) => {
    if (c.type === "intro") return 800;
    if (c.type !== "event") return 9000;
    const words = U.tr(eventById[c.ev]).summary.split(/\s+/).length;
    return Math.max(9000, 4000 + words * 400);
  };
  function updateMarker() {
    const c = CHAPTERS[activeIndex];
    if (!c) return;
    let year = START;
    if (c.type === "event") {
      const k = storyEvents.indexOf(c);
      const y0 = eventById[c.ev].year, y1 = storyEvents[k + 1] ? eventById[storyEvents[k + 1].ev].year : END;
      year = lerp(y0, y1, progress * 0.8);
    } else if (c.type === "period") year = S.periods.find((x) => x.id === c.period).from;
    else if (c.type === "outro") year = END;
    const mk = $("#hudMarker");
    if (mk) mk.style.insetInlineStart = yearPct(year) + "%";
  }
  function setActive(idx) {
    activeIndex = idx;
    const c = CHAPTERS[idx];
    chapterT0 = performance.now();
    progress = reduceMotion ? 1 : 0;
    const st = $("#stage");
    st.classList.remove("kb");
    void st.offsetWidth;
    st.style.setProperty("--kb", (chapterDur(c) + readTime(c)) / 1000 + "s");
    if (!reduceMotion && c.scene !== "map" && !(U.stage3d && U.stage3d.world)) st.classList.add("kb");
    sections.forEach((s, i) => s.classList.toggle("is-active", i === idx));
    $$("#sceneSvg .scene").forEach((g) => g.classList.toggle("on", g.dataset.scene === c.scene));
    const stage = $("#stage");
    stage.dataset.scene = c.scene;
    stage.classList.toggle("map-on", c.scene === "map");
    if (c.scene === "map") fitMapView(c.map || "hijra");
    setPalette(PAL[c.scene] || PAL.night);
    narrate(c);
    // la 3D (stage3d.js) prend en charge les foules et les cartes quand le navigateur le permet
    gl = !!(U.stage3d && U.stage3d.handles(c));
    stage.classList.toggle("gl-on", gl);
    if (U.stage3d) U.stage3d.setChapter(gl ? c : null);
    setCrowd(gl ? null : c.crowd || null);
    fxMode = gl ? null : c.fx || null;
    const hud = $("#hud");
    if (c.type === "event") {
      const e = eventById[c.ev];
      hud.classList.add("on");
      flip($("#hudYear"), U.yearText(e));
      $("#hudMeta").textContent = U.ahText(e) + (U.ageText(e) ? U.SEP() + U.ageText(e) : "");
      $("#hudTitle").textContent = U.tr(e).title;
    } else if (c.type === "period") {
      const p = S.periods.find((x) => x.id === c.period);
      hud.classList.add("on");
      flip($("#hudYear"), U.digits(p.from));
      $("#hudMeta").textContent = U.tr(p);
      $("#hudTitle").textContent = "";
    } else hud.classList.remove("on");
    $$("#drawerList [data-jump]").forEach((b) => b.classList.toggle("current", b.dataset.jump === c.id));
    if (U.photos) U.photos.setChapter(c.id, c.type === "event" ? U.tr(eventById[c.ev]).title : c.type === "period" ? U.tr(S.periods.find((x) => x.id === c.period)) : "");
    Sound.scene(c);
  }
  /* --- lecture automatique et navigation --- */
  let playing = false;
  function setPlaying(on) {
    playing = on;
    const b = $("#hudPlay");
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", on ? U.T().pause : U.T().autoplay);
    // la scène déjà jouée le reste ; seul le temps de lecture repart de zéro
    const c = CHAPTERS[activeIndex];
    if (on && c) chapterT0 = Math.max(chapterT0, performance.now() - chapterDur(c));
  }
  const step = (d) => { const i = clamp(activeIndex + d, 0, CHAPTERS.length - 1); goTo(CHAPTERS[i].id); };
  $("#hudPlay").addEventListener("click", () => setPlaying(!playing));
  $("#hudPrev").addEventListener("click", () => step(-1));
  $("#hudNext").addEventListener("click", () => step(1));
  // le calage écran par écran ne vaut que pour le voyage : on le lève pour rejoindre l'exploration
  let snapHold = 0;
  const unsnap = () => { document.documentElement.classList.remove("snap"); snapHold = performance.now() + 2500; };
  U.unsnap = unsnap;
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest('a[href^="#"]');
    if (a && !a.getAttribute("href").startsWith("#ch-")) unsnap();
  }, true);
  // le calage revient seulement quand le défilement s'est arrêté dans le voyage
  let settleTimer = 0;
  window.addEventListener("scroll", () => {
    clearTimeout(settleTimer);
    const settle = () => {
      if (performance.now() < snapHold) { settleTimer = setTimeout(settle, 300); return; }
      document.documentElement.classList.toggle("snap", storyVisible);
    };
    settleTimer = setTimeout(settle, 350);
  }, { passive: true });

  // un geste de molette ou une touche = un chapitre
  const busy = () => document.body.classList.contains("sheet-open") || document.body.classList.contains("drawer-open") || document.body.classList.contains("cam-free") || document.body.classList.contains("photo-open");
  let wheelAcc = 0, wheelLock = 0;
  window.addEventListener("wheel", (ev) => {
    if (!storyVisible || busy() || ev.ctrlKey) return;
    const card = ev.target.closest(".st-card, .drawer-panel");
    if (card && card.scrollHeight > card.clientHeight + 2) {
      const atTop = card.scrollTop <= 0, atEnd = card.scrollTop + card.clientHeight >= card.scrollHeight - 2;
      if ((ev.deltaY < 0 && !atTop) || (ev.deltaY > 0 && !atEnd)) return; // on lit d'abord la fin du texte
    }
    const last = activeIndex === CHAPTERS.length - 1;
    if (last && ev.deltaY > 0) return; // après le dernier écran, on rejoint l'exploration librement
    ev.preventDefault();
    const now = performance.now();
    if (now < wheelLock) return;
    wheelAcc += ev.deltaMode === 1 ? ev.deltaY * 30 : ev.deltaY;
    if (Math.abs(wheelAcc) > 40) {
      step(Math.sign(wheelAcc));
      wheelAcc = 0;
      wheelLock = now + 850;
    }
  }, { passive: false });
  window.addEventListener("keydown", (ev) => {
    if (!storyVisible || busy() || ev.target.closest("input, textarea, select, [contenteditable]")) return;
    const down = ["ArrowDown", "PageDown", " "].includes(ev.key) && !ev.shiftKey;
    const up = ["ArrowUp", "PageUp"].includes(ev.key) || (ev.key === " " && ev.shiftKey);
    if (!down && !up) return;
    if (down && activeIndex === CHAPTERS.length - 1) return;
    if (ev.target.closest("button, a") && ev.key === " ") return;
    ev.preventDefault();
    step(down ? 1 : -1);
  });

  function flip(el, text) {
    if (el.textContent === text) return;
    el.classList.remove("flip");
    void el.offsetWidth;
    el.textContent = text;
    el.classList.add("flip");
  }

  /* ------------------------------------------------------------------ */
  /* Ciel (canvas)                                                       */
  /* ------------------------------------------------------------------ */
  const sky = $("#skyCanvas"), fx = $("#fxCanvas");
  const sctx = sky.getContext("2d"), fctx = fx.getContext("2d");
  let W = 0, H = 0, DPR = 1, mobile = false, fb = { x: 0, y: 0, w: 0, h: 0 };
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const cur = { sky: [hex("#02040f"), hex("#0a1236"), hex("#1f2456")], stars: 1, sunA: 0, sun: [0.7, 0.2], sunC: hex("#ffffff"), moonA: 1, moon: [0.74, 0.2] };
  let target = PAL.night;
  function setPalette(p) { target = p; }
  const stars = Array.from({ length: 260 }, (_, i) => ({ x: hash(i, 3), y: Math.pow(hash(i, 5), 1.6) * 0.75, r: 0.4 + hash(i, 7) * 1.3, tw: hash(i, 9) * Math.PI * 2 }));

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.75);
    W = window.innerWidth; H = window.innerHeight;
    mobile = W < 800;
    for (const c of [sky, fx]) { c.width = W * DPR; c.height = H * DPR; c.style.width = W + "px"; c.style.height = H + "px"; }
    sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    fctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // zone où se posent les foules : sur la plaine, à côté du texte (au-dessus sur mobile)
    fb = mobile ? { x: W * 0.06, y: H * 0.4, w: W * 0.88, h: H * 0.16 } : { x: W * 0.46, y: H * 0.56, w: W * 0.5, h: H * 0.26 };
    if (U.lang() === "ar" && !mobile) fb.x = W * 0.04;
    crowdFormation = null;
    moonCache = null;
    onScroll();
  }

  // croissant : un disque dont on retire un second disque décalé
  let moonCache = null;
  function moonSprite(r) {
    const key = Math.round(r * DPR);
    if (moonCache && moonCache.key === key) return moonCache.c;
    const c = document.createElement("canvas");
    c.width = c.height = Math.ceil((r * 2 + 4) * DPR);
    const g = c.getContext("2d");
    g.scale(DPR, DPR);
    g.fillStyle = "#faf2da";
    g.beginPath(); g.arc(r + 2, r + 2, r, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = "destination-out";
    g.beginPath(); g.arc(r + 2 + r * 0.42, r + 2 - r * 0.2, r * 0.86, 0, Math.PI * 2); g.fill();
    moonCache = { key, c };
    return c;
  }

  function drawSky(dt, t) {
    const k = 1 - Math.exp(-dt * 2.2);
    for (let i = 0; i < 3; i++) { const tc = hex(target.sky[i]); for (let j = 0; j < 3; j++) cur.sky[i][j] = lerp(cur.sky[i][j], tc[j], k); }
    cur.stars = lerp(cur.stars, target.stars || 0, k);
    cur.sunA = lerp(cur.sunA, target.sun ? 1 : 0, k);
    if (target.sun) { cur.sun[0] = lerp(cur.sun[0], target.sun[0], k); cur.sun[1] = lerp(cur.sun[1], target.sun[1], k); const sc = hex(target.sun[2]); for (let j = 0; j < 3; j++) cur.sunC[j] = lerp(cur.sunC[j], sc[j], k); }
    cur.moonA = lerp(cur.moonA, target.moon ? 1 : 0, k);
    if (target.moon) { cur.moon[0] = lerp(cur.moon[0], target.moon[0], k); cur.moon[1] = lerp(cur.moon[1], target.moon[1], k); }

    const g = sctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgb(cur.sky[0])); g.addColorStop(0.6, rgb(cur.sky[1])); g.addColorStop(1, rgb(cur.sky[2]));
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, W, H);

    if (cur.stars > 0.02) {
      for (const s of stars) {
        const a = cur.stars * (0.55 + 0.45 * Math.sin(t * 1.3 + s.tw));
        sctx.fillStyle = `rgba(255,248,230,${a.toFixed(3)})`;
        sctx.fillRect(s.x * W, s.y * H, s.r, s.r);
      }
    }
    if (cur.sunA > 0.02) {
      const x = cur.sun[0] * W, y = cur.sun[1] * H, r = Math.min(W, H) * 0.06;
      const sg = sctx.createRadialGradient(x, y, 0, x, y, r * 6);
      sg.addColorStop(0, rgb(cur.sunC, 0.9 * cur.sunA)); sg.addColorStop(0.15, rgb(cur.sunC, 0.45 * cur.sunA)); sg.addColorStop(1, rgb(cur.sunC, 0));
      sctx.fillStyle = sg; sctx.fillRect(0, 0, W, H);
      sctx.fillStyle = rgb(cur.sunC, cur.sunA); sctx.beginPath(); sctx.arc(x, y, r, 0, Math.PI * 2); sctx.fill();
    }
    if (cur.moonA > 0.02) {
      const x = cur.moon[0] * W, y = cur.moon[1] * H, r = Math.min(W, H) * 0.045;
      const mg = sctx.createRadialGradient(x, y, 0, x, y, r * 5);
      mg.addColorStop(0, `rgba(210,200,255,${0.25 * cur.moonA})`); mg.addColorStop(1, "rgba(210,200,255,0)");
      sctx.fillStyle = mg; sctx.fillRect(x - r * 5, y - r * 5, r * 10, r * 10);
      const mc = moonSprite(r);
      sctx.globalAlpha = cur.moonA;
      sctx.drawImage(mc, x - r - 2, y - r - 2, mc.width / DPR, mc.height / DPR);
      sctx.globalAlpha = 1;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Effets et foules (canvas avant-plan)                                */
  /* ------------------------------------------------------------------ */
  let fxMode = null;
  let gl = false;
  const sand = Array.from({ length: 140 }, (_, i) => ({ x: hash(i, 11), y: 0.35 + hash(i, 13) * 0.6, v: 0.02 + hash(i, 17) * 0.05, r: 0.6 + hash(i, 19) * 1.4 }));
  const birds = Array.from({ length: 46 }, (_, i) => ({ dx: hash(i, 23) * 0.28, dy: hash(i, 29) * 0.16, ph: hash(i, 31) * 6.28, s: 0.7 + hash(i, 37) * 0.6 }));
  const fall = Array.from({ length: 70 }, (_, i) => ({ x: hash(i, 41), y: hash(i, 43), v: 0.04 + hash(i, 47) * 0.05 }));
  const warp = Array.from({ length: 160 }, (_, i) => ({ x: hash(i, 51), y: hash(i, 53), v: 0.3 + hash(i, 57) }));

  // projection des coordonnées SVG (1600×900, slice, ancré en bas) vers l'écran
  function svgPt(x, y) {
    const sv = $("#sceneSvg").getBoundingClientRect();
    const s = Math.max(sv.width / VW, sv.height / VH);
    return [sv.left + (sv.width - VW * s) / 2 + x * s, sv.top + (sv.height - VH * s) + y * s, s];
  }

  function drawFx(dt, t) {
    fctx.clearRect(0, 0, W, H);
    const p = progress;
    if (fxMode === "sand" || fxMode === "wind") {
      const wind = fxMode === "wind";
      fctx.fillStyle = wind ? "rgba(220,228,240,0.45)" : "rgba(250,226,180,0.35)";
      for (const s of sand) {
        s.x += s.v * dt * (wind ? 4 : 1);
        if (s.x > 1.05) s.x = -0.05;
        fctx.fillRect(s.x * W, s.y * H + Math.sin(t + s.x * 10) * 6, s.r * (wind ? 6 : 1.5), s.r);
      }
    }
    if (fxMode === "heat") {
      fctx.fillStyle = "rgba(255,220,160,0.06)";
      for (let i = 0; i < 6; i++) fctx.fillRect(0, H * (0.55 + i * 0.05) + Math.sin(t * 2 + i) * 4, W, 2);
    }
    if (fxMode === "fall") {
      fctx.fillStyle = "rgba(200,190,230,0.35)";
      for (const f of fall) {
        f.y += f.v * dt;
        if (f.y > 1) { f.y = 0; f.x = Math.random(); }
        fctx.fillRect(f.x * W, f.y * H, 1, 9);
      }
    }
    if (fxMode === "birds") {
      // les oiseaux (Ababil) traversent le ciel
      const cx = ((t * 0.045) % 1.4) - 0.2;
      fctx.strokeStyle = "rgba(220,214,245,0.75)";
      fctx.lineWidth = 1.4;
      for (const b of birds) {
        const x = (cx + b.dx) * W, y = (0.16 + b.dy + Math.sin(t * 0.8 + b.ph) * 0.01) * H;
        const f = Math.sin(t * 9 + b.ph) * 4 * b.s;
        fctx.beginPath(); fctx.moveTo(x - 7 * b.s, y - f); fctx.lineTo(x, y); fctx.lineTo(x + 7 * b.s, y - f); fctx.stroke();
      }
    }
    if (fxMode === "rays") drawRays(t, p);
    if (fxMode === "isra") drawIsra(t, p);
    drawCrowd(dt, t, p);
    if (gl) U.stage3d.overlay(fctx, label, legend);
  }

  function drawRays(t, p) {
    const [x, y] = svgPt(935, 372);
    const a = smooth(clamp(p * 1.6));
    fctx.save();
    fctx.translate(x, y);
    fctx.rotate(t * 0.04);
    for (let i = 0; i < 24; i++) {
      const ang = (i / 24) * Math.PI * 2;
      const len = Math.max(W, H) * (0.6 + 0.3 * Math.sin(t * 0.7 + i));
      const g = fctx.createLinearGradient(0, 0, Math.cos(ang) * len, Math.sin(ang) * len);
      g.addColorStop(0, `rgba(255,228,160,${0.16 * a})`); g.addColorStop(1, "rgba(255,228,160,0)");
      fctx.fillStyle = g;
      fctx.beginPath(); fctx.moveTo(0, 0);
      fctx.lineTo(Math.cos(ang - 0.03) * len, Math.sin(ang - 0.03) * len);
      fctx.lineTo(Math.cos(ang + 0.03) * len, Math.sin(ang + 0.03) * len);
      fctx.fill();
    }
    fctx.restore();
    // le premier mot révélé
    const wa = smooth(clamp((p - 0.15) * 2.2));
    if (wa > 0.01) {
      const size = Math.min(W * (mobile ? 0.28 : 0.11), 150);
      const cx = mobile ? W / 2 : fb.x + fb.w / 2, cy = mobile ? H * 0.16 : H * 0.2;
      fctx.save();
      fctx.globalAlpha = wa;
      fctx.textAlign = "center";
      fctx.shadowColor = "rgba(255,214,130,0.9)"; fctx.shadowBlur = 30;
      fctx.fillStyle = "#ffe9b0";
      fctx.font = `${size}px Amiri, "Noto Naskh Arabic", serif`;
      fctx.fillText("اقْرَأْ", cx, cy + size * 0.35);
      fctx.shadowBlur = 0;
      if (U.T().iqraMeaning) {
        fctx.font = `italic ${Math.max(15, size * 0.16)}px "Alegreya Sans", sans-serif`;
        fctx.fillStyle = "rgba(255,240,210,0.85)";
        fctx.fillText(U.T().iqraMeaning, cx, cy + size * 0.75);
      }
      fctx.restore();
    }
  }

  function drawIsra(t, p) {
    const [mx, my] = svgPt(1050, 760);
    const [jx, jy] = svgPt(700, 690);
    const cx = (mx + jx) / 2, cy = Math.min(my, jy) - H * 0.32;
    const a = smooth(clamp(p / 0.45));
    const at = (u) => [(1 - u) * (1 - u) * mx + 2 * (1 - u) * u * cx + u * u * jx, (1 - u) * (1 - u) * my + 2 * (1 - u) * u * cy + u * u * jy];
    // l'arc lumineux de La Mecque à Jérusalem
    const steps = 70;
    for (let i = 0; i < steps * a; i++) {
      const u = i / steps, [x, y] = at(u);
      fctx.fillStyle = `rgba(255,236,190,${0.12 + 0.5 * u})`;
      fctx.beginPath(); fctx.arc(x, y, 1.2 + u * 2.4, 0, Math.PI * 2); fctx.fill();
    }
    if (a > 0 && a < 1) {
      const [x, y] = at(a);
      const g = fctx.createRadialGradient(x, y, 0, x, y, 40);
      g.addColorStop(0, "rgba(255,248,220,0.95)"); g.addColorStop(1, "rgba(255,248,220,0)");
      fctx.fillStyle = g; fctx.fillRect(x - 40, y - 40, 80, 80);
    }
    // l'ascension : les étoiles filent vers le haut
    const w = smooth(clamp((p - 0.5) / 0.35));
    if (w > 0.01) {
      const gj = fctx.createLinearGradient(jx, jy, jx, 0);
      gj.addColorStop(0, `rgba(255,240,200,${0.35 * w})`); gj.addColorStop(1, "rgba(255,240,200,0)");
      fctx.fillStyle = gj; fctx.fillRect(jx - 3, 0, 6, jy);
      fctx.fillStyle = `rgba(230,225,255,${0.5 * w})`;
      for (const s of warp) {
        s.y -= s.v * 0.012 * (1 + w * 6);
        if (s.y < -0.05) { s.y = 1.05; s.x = Math.random(); }
        fctx.fillRect(s.x * W, s.y * H, 1.2, 6 + w * 60 * s.v);
      }
    }
  }

  /* --- Foules : un point = une ou plusieurs personnes --- */
  const MAXDOTS = 10000;
  const D = { x: new Float32Array(MAXDOTS), y: new Float32Array(MAXDOTS), a: new Float32Array(MAXDOTS), ta: new Float32Array(MAXDOTS), c: new Uint8Array(MAXDOTS) };
  for (let i = 0; i < MAXDOTS; i++) { D.x[i] = hash(i, 61) * 1600; D.y[i] = 1200; }
  const COLORS = ["#f4d27e", "#d98a78", "#f7f2e6", "#9a948f", "#9fe0bf", "#ffe3a0"];
  let crowdName = null, crowdFormation = null, crowdT0 = 0;
  function setCrowd(name) {
    if (name !== crowdName) { crowdName = name; crowdFormation = null; crowdT0 = performance.now(); }
  }
  function blockPos(i, n, cx, cy, sp, ratio, out) {
    const cols = Math.max(1, Math.round(Math.sqrt(n * ratio)));
    const rows = Math.ceil(n / cols);
    const c = i % cols, r = Math.floor(i / cols);
    out[0] = cx + (c - cols / 2) * sp + (hash(i, 71) - 0.5) * sp * 0.25;
    out[1] = cy + (r - rows / 2) * sp * 0.8 + (hash(i, 73) - 0.5) * sp * 0.2;
  }
  function diskPos(i, n, cx, cy, R, flat, out) {
    const r = R * Math.sqrt((i + 0.5) / n), th = i * 2.39996;
    out[0] = cx + r * Math.cos(th);
    out[1] = cy + r * Math.sin(th) * flat;
  }
  // chaque formation : nombre de points, échelle (personnes par point), étiquettes et position de chaque point
  // L'espace (Sp) dit où poser les points : à l'écran pour la 2D, sur le sol pour la 3D (stage3d.js).
  function formation(name, Sp) {
    const T = U.T();
    const { X, Y, sp, LY, LYH } = Sp;
    const mobile = Sp.mobile;
    const fb = { w: Sp.w, h: Sp.h };
    const big = mobile ? 2 : 1;
    switch (name) {
      case "aqaba": return {
        n: 75, scale: 1, labels: () => [[X(0.5), LY, "75", T.crowd.pledge]],
        pos: (i, p, t, o) => { const th = (i / 75) * Math.PI * 2; const r = fb.h * 0.42 * (0.6 + 0.4 * smooth(clamp(p * 2))); o[0] = X(0.5) + Math.cos(th) * r * 1.6; o[1] = Y(0.5) + Math.sin(th) * r * 0.55; return 5; }
      };
      case "badr": return {
        n: 1313, scale: 1, labels: () => [[X(0.2 + 0.08 * progress), LY, U.num(313), T.crowd.muslims], [X(0.74 - 0.06 * progress), LY, "≈ " + U.num(1000), T.crowd.quraysh]],
        pos: (i, p, t, o) => {
          if (i < 313) { blockPos(i, 313, X(0.2 + 0.08 * p), Y(0.5), sp, 1.6, o); return 0; }
          blockPos(i - 313, 1000, X(0.74 - 0.06 * p), Y(0.5), sp, 1.8, o); return 1;
        }
      };
      case "uhud": return {
        n: 3700, scale: 1, labels: () => [[X(0.3), LY, U.num(700), T.crowd.muslims], [X(0.74), LY, U.num(3000), T.crowd.quraysh], ...(progress < 0.45 ? [[X(0.06), Y(1.25), U.num(50), T.crowd.archers]] : [])],
        pos: (i, p, t, o) => {
          if (i < 50) { // les archers sur la colline, qui finissent par la quitter
            const leave = smooth(clamp((p - 0.35) / 0.25));
            const hx = X(0.02) + (i % 10) * sp, hy = Y(0.75) + Math.floor(i / 10) * sp;
            blockPos(i, 50, X(0.32), Y(0.8), sp, 2, o);
            o[0] = lerp(hx, o[0], leave); o[1] = lerp(hy, o[1], leave); return 5;
          }
          if (i < 700) { blockPos(i - 50, 650, X(0.26), Y(0.45), sp, 1.4, o); return 0; }
          const j = i - 700;
          if (j < 200) { // la cavalerie contourne la colline
            const turn = smooth(clamp((p - 0.55) / 0.35));
            blockPos(j, 200, X(0.62), Y(0.15), sp, 2.5, o);
            if (turn > 0) {
              const ang = Math.PI * turn, cx = X(0.36), cy = Y(0.6);
              o[0] = lerp(o[0], cx - Math.cos(ang) * fb.w * 0.26 + (hash(j, 3) - 0.5) * 20, turn);
              o[1] = lerp(o[1], cy - Math.sin(ang) * fb.h * 0.55 + (hash(j, 5) - 0.5) * 14, turn);
            }
            return 1;
          }
          blockPos(j - 200, 2800, X(0.76), Y(0.5), sp, 1.6, o); return 1;
        }
      };
      case "khandaq": return {
        n: 6500, scale: 2, trench: true, labels: () => [[X(0.2), LY, U.num(3000), T.crowd.muslims], [X(0.75), LY, "≈ " + U.num(10000), T.crowd.confederates]],
        pos: (i, p, t, o) => {
          if (i < 1500) { blockPos(i, 1500, X(0.2), Y(0.5), sp * 0.85, 1.4, o); return 0; }
          const j = i - 1500;
          blockPos(j, 5000, X(0.76), Y(0.5), sp * 0.85, 1.6, o);
          o[0] -= fb.w * (smooth(clamp(p * 1.4)) * 0.04 + Math.sin(t * 1.5 + hash(j, 8) * 6) * 0.004); return 1;
        }
      };
      case "hudaybiyya": return {
        n: 1400, scale: 1, boundary: true, labels: () => [[X(0.36), LY, U.num(1400), T.crowd.pilgrims]],
        pos: (i, p, t, o) => {
          const gather = smooth(clamp((p - 0.35) / 0.4));
          blockPos(i, 1400, X(0.36), Y(0.5), sp, 2.4, o);
          if (gather > 0) { const d = [0, 0]; diskPos(i, 1400, X(0.5), Y(0.5), fb.h * 0.5, 0.7, d); o[0] = lerp(o[0], d[0], gather); o[1] = lerp(o[1], d[1], gather); }
          return 2;
        }
      };
      case "mutah": return {
        n: 7500, scale: 2, labels: () => [[X(0.2), LY, U.num(3000), T.crowd.muslims], [X(0.72), LYH, "?", T.crowd.byzantines]],
        pos: (i, p, t, o) => {
          if (i < 1500) { blockPos(i, 1500, X(0.2), Y(0.5), sp * 0.85, 1.4, o); return 0; }
          const j = i - 1500; diskPos(j, 6000, X(0.72), Y(0.5), fb.w * 0.28, 0.45, o); o[0] += (hash(j, 4) - 0.5) * 18; return 3;
        }
      };
      case "conquest": {
        const n = 5000 / big;
        return {
          n: n + 360, scale: 2 * big, kaaba: true,
          labels: () => [[X(0.5), LYH, U.num(10000), T.crowd.army], ...(progress > 0.35 && progress < 0.8 ? [[X(0.5), Y(1.25), "360", T.crowd.idols]] : [])],
          pos: (i, p, t, o) => {
            const cx = X(0.5), cy = Y(0.5);
            if (i >= n) { // les idoles autour de la Ka'ba
              const k = i - n, th = (k / 360) * Math.PI * 2;
              const gone = smooth(clamp((p - 0.45) / 0.3));
              o[0] = cx + Math.cos(th) * fb.h * 0.32; o[1] = cy + Math.sin(th) * fb.h * 0.2 + gone * 30 * hash(k, 2);
              o[2] = 0.9 * (1 - gone); return 3;
            }
            const s = i % 4, f = smooth(clamp(p * 1.7 - hash(i, 9) * 0.6));
            const starts = [[X(-0.1), Y(0.5)], [X(1.1), Y(0.45)], [X(0.25), Y(-0.6)], [X(0.8), Y(1.4)]];
            const d = [0, 0]; diskPos(i, n, cx, cy, fb.w * 0.4, mobile ? 0.36 : 0.34, d);
            if (Math.hypot((d[0] - cx) / 1.6, d[1] - cy) < fb.h * 0.3) d[0] += Math.sign(d[0] - cx || 1) * fb.h * 0.28;
            const st = starts[s];
            o[0] = lerp(st[0] + (hash(i, 6) - 0.5) * 40, d[0], f); o[1] = lerp(st[1] + (hash(i, 7) - 0.5) * 40, d[1], f);
            return 0;
          }
        };
      }
      case "hunayn": return {
        n: 3000, scale: 4, labels: () => [[X(0.5), LYH, "≈ " + U.num(12000), T.crowd.muslims]],
        pos: (i, p, t, o) => {
          const regroup = smooth(clamp((p - 0.4) / 0.3));
          const early = smooth(clamp(p / 0.25));
          const sx = X(hash(i, 21)), sy = Y(hash(i, 22) * 1.1 - 0.05);
          const d = [0, 0]; diskPos(i, 3000, X(0.5), Y(0.5), fb.w * 0.3, 0.42, d);
          const tight = [0, 0]; blockPos(i, 3000, X(0.5), Y(0.5), sp * 0.9, 2.4, tight);
          o[0] = lerp(lerp(tight[0], sx, early), d[0], regroup); o[1] = lerp(lerp(tight[1], sy, early), d[1], regroup);
          return 0;
        }
      };
      case "tabuk": return {
        n: 3000, scale: 10, labels: () => [[X(0.5), LYH, U.num(30000), T.crowd.army]],
        pos: (i, p, t, o) => {
          const u = (hash(i, 31) + t * 0.012) % 1;
          o[0] = X(1 - u); o[1] = Y(0.5 + Math.sin(u * 7) * 0.22) + (hash(i, 32) - 0.5) * fb.h * 0.22;
          o[2] = Math.min(1, u * 6, (1 - u) * 6);
          return 0;
        }
      };
      case "delegations": return {
        n: 1200, scale: 0, labels: () => [[X(0.5), LYH, "", T.crowd.delegations]],
        pos: (i, p, t, o) => {
          const g = Math.floor(i / 30), k = i % 30;
          const ang = hash(g, 41) * Math.PI * 2;
          const arrive = smooth(clamp(p * 1.6 - (g / 40) * 0.8));
          const sx = X(0.5) + Math.cos(ang) * fb.w * 0.75, sy = Y(0.5) + Math.sin(ang) * fb.h * 1.4;
          const d = [0, 0]; diskPos(i, 1200, X(0.5), Y(0.5), fb.w * 0.28, 0.4, d);
          o[0] = lerp(sx + (k % 6) * sp, d[0], arrive); o[1] = lerp(sy + Math.floor(k / 6) * sp, d[1], arrive);
          o[2] = arrive > 0.01 ? 1 : 0.5;
          return 2;
        }
      };
      case "farewell": {
        const n = mobile ? 4000 : 10000;
        return {
          n, scale: 100000 / n, hill: true, labels: () => [[X(0.5), LYH, U.T().more + " " + U.num(100000), T.crowd.pilgrims]],
          pos: (i, p, t, o) => {
            const f = smooth(clamp(p * 1.5 - hash(i, 51) * 0.5));
            const d = [0, 0]; diskPos(i, n, X(0.5), Y(0.6), fb.w * 0.5, mobile ? 0.42 : 0.32, d);
            if (Math.abs(d[0] - X(0.5)) < fb.w * 0.14 && d[1] < Y(0.55)) d[1] = Y(0.55) + hash(i, 52) * fb.h * 0.2; // pas sur la colline
            o[0] = d[0]; o[1] = lerp(Sp.enter, d[1], f);
            return 2;
          }
        };
      }
    }
    return null;
  }
  function screenSpace() {
    return {
      X: (u) => fb.x + fb.w * u, Y: (v) => fb.y + fb.h * v, w: fb.w, h: fb.h, sp: mobile ? 3 : 4.4, mobile,
      LY: fb.y + (mobile ? 2 : 16), LYH: fb.y - (mobile ? 34 : 50), // étiquettes : au-dessus des rangs, ou plus haut pour les grandes foules
      enter: H + 20
    };
  }
  function drawCrowd(dt, t, p) {
    if (crowdName && !crowdFormation) crowdFormation = formation(crowdName, screenSpace());
    const F = crowdName ? crowdFormation : null;
    const n = F ? Math.min(F.n, MAXDOTS) : 0;
    const out = [0, 0, 1];
    const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 3.2);
    const since = (performance.now() - crowdT0) / 1000;
    for (let i = 0; i < MAXDOTS; i++) {
      if (i < n) {
        out[2] = 1;
        D.c[i] = F.pos(i, p, t, out);
        D.ta[i] = out[2];
        const kk = since > hash(i, 81) * 0.6 ? Math.min(1, k * (0.6 + hash(i, 83) * 0.8)) : 0;
        D.x[i] += (out[0] - D.x[i]) * kk;
        D.y[i] += (out[1] - D.y[i]) * kk;
      } else {
        if (D.a[i] < 0.01) continue;
        D.ta[i] = 0;
      }
      D.a[i] += (D.ta[i] - D.a[i]) * (reduceMotion ? 1 : Math.min(1, dt * 3));
    }
    if (F && F.trench) {
      const x = fb.x + fb.w * 0.47;
      fctx.fillStyle = "rgba(10,12,20,0.75)"; fctx.fillRect(x - 7, fb.y - fb.h * 0.1, 14, fb.h * 1.2);
      fctx.fillStyle = "rgba(240,220,180,0.25)"; fctx.fillRect(x + 7, fb.y - fb.h * 0.1, 2, fb.h * 1.2);
    }
    if (F && F.boundary) {
      const x = fb.x + fb.w * 0.86;
      fctx.strokeStyle = "rgba(244,210,126,0.7)"; fctx.setLineDash([6, 6]); fctx.lineWidth = 2;
      fctx.beginPath(); fctx.moveTo(x, fb.y - fb.h * 0.1); fctx.lineTo(x, fb.y + fb.h * 1.1); fctx.stroke(); fctx.setLineDash([]);
      label(x, fb.y + fb.h * 1.1 + 18, "", U.T().crowd.haram, "center");
    }
    if (F && F.hill) {
      const cx = fb.x + fb.w * 0.5, by = fb.y + fb.h * 0.5, hw = Math.min(fb.w * 0.16, 120), hh = hw * 0.55;
      fctx.fillStyle = "#8b7556";
      fctx.beginPath(); fctx.moveTo(cx - hw, by); fctx.lineTo(cx - hw * 0.45, by - hh * 0.7); fctx.lineTo(cx - hw * 0.1, by - hh); fctx.lineTo(cx + hw * 0.3, by - hh * 0.85); fctx.lineTo(cx + hw, by); fctx.fill();
    }
    if (F && F.kaaba) {
      const cx = fb.x + fb.w * 0.5, cy = fb.y + fb.h * 0.5, s = mobile ? 9 : 13;
      fctx.fillStyle = "#0e1016"; fctx.fillRect(cx - s, cy - s, s * 2, s * 2);
      fctx.fillStyle = "#d8b25a"; fctx.fillRect(cx - s, cy - s * 0.5, s * 2, s * 0.3);
    }
    const r = mobile ? 1.7 : 2.3;
    let lastC = -1;
    for (let i = 0; i < MAXDOTS; i++) {
      const a = D.a[i];
      if (a < 0.02) continue;
      if (D.c[i] !== lastC) { fctx.fillStyle = COLORS[D.c[i]]; lastC = D.c[i]; }
      fctx.globalAlpha = a;
      fctx.fillRect(D.x[i] - r / 2, D.y[i] - r / 2, r, r);
    }
    fctx.globalAlpha = 1;
    if (F) {
      for (const [x, y, bigText, small] of F.labels()) label(x, y, bigText, small, "center");
      if (F.scale) legend(F.scale === 1 ? U.T().crowd.one : U.T().crowd.many.replace("{n}", U.num(Math.round(F.scale))));
    }
  }
  function label(x, y, bigText, small, align) {
    fctx.save();
    fctx.textAlign = align;
    fctx.shadowColor = "rgba(0,0,0,0.65)"; fctx.shadowBlur = 8;
    if (bigText) { fctx.fillStyle = "#fff4d6"; fctx.font = `${mobile ? 22 : 30}px Marcellus, "Reem Kufi", serif`; fctx.fillText(bigText, x, y); }
    fctx.fillStyle = "rgba(255,244,214,0.9)"; fctx.font = `600 ${mobile ? 11 : 13}px "Alegreya Sans", "Noto Naskh Arabic", sans-serif`;
    fctx.fillText(small, x, y + (bigText ? (mobile ? 16 : 20) : 0));
    fctx.restore();
  }
  function legend(text) {
    const ar = U.lang() === "ar";
    const x = fb.x + (ar ? fb.w : 0), y = fb.y + fb.h + (mobile ? 52 : 72);
    fctx.save();
    fctx.textAlign = ar ? "right" : "left";
    fctx.shadowColor = "rgba(0,0,0,0.6)"; fctx.shadowBlur = 6;
    fctx.fillStyle = COLORS[0];
    fctx.fillRect(ar ? x - 4 : x, y - 7, 4, 4);
    fctx.fillStyle = "rgba(255,244,214,0.85)";
    fctx.font = `500 ${mobile ? 11 : 13}px "Alegreya Sans", "Noto Naskh Arabic", sans-serif`;
    fctx.fillText(text, ar ? x - 10 : x + 10, y);
    fctx.restore();
  }

  /* ------------------------------------------------------------------ */
  /* Effets liés au défilement dans le SVG                               */
  /* ------------------------------------------------------------------ */
  let bricks = [];
  function updateSvg() {
    const c = CHAPTERS[activeIndex];
    if (!c) return;
    const p = progress;
    if (c.scene === "medina") {
      const built = smooth(clamp(p * 1.4));
      const n = Math.round(bricks.length * built);
      for (let i = 0; i < bricks.length; i++) bricks[i].classList.toggle("laid", i < n);
      $$('#sceneSvg [data-scene="medina"] .grow').forEach((g, i) => { g.style.transform = `scale(${(0.35 + 0.65 * smooth(clamp(p * 1.6 - i * 0.05))).toFixed(3)})`; });
    }
    if (c.scene === "qibla") {
      const nd = $("#sceneSvg .needle");
      if (nd) nd.setAttribute("transform", `rotate(${(smooth(clamp((p - 0.15) / 0.55)) * 180).toFixed(1)})`);
    }
    const cap = $("#mapCaption");
    if (c.scene === "map" && c.map === "hijra") {
      const L = mapLens.hijra;
      // trois nuits dans la grotte, puis la route
      const q = smooth(clamp((p - 0.18) / 0.72));
      const h = $("#smHijra");
      h.style.strokeDashoffset = L * (1 - q);
      const pt = h.getPointAtLength(L * q);
      const tv = $("#smTraveler"); tv.setAttribute("cx", pt.x); tv.setAttribute("cy", pt.y);
      $("#stageMap").classList.toggle("in-cave", p < 0.2);
      cap.textContent = p < 0.2 ? U.T().hijraCave : `≈ ${U.num(Math.round(450 * q))} km`;
    } else if (c.scene === "map" && c.map === "letters") {
      $$("#stageMap .sm-arc").forEach((a, i) => {
        const q = smooth(clamp(p * 1.8 - i * 0.12));
        a.style.strokeDashoffset = a.dataset.len * (1 - q);
        $(`#stageMap .sm-dest[data-i="${i}"]`).classList.toggle("on", q > 0.95);
      });
      cap.textContent = "";
    } else cap.textContent = "";
  }

  /* ------------------------------------------------------------------ */
  /* Ambiance sonore (synthétisée, sans fichier)                         */
  /* ------------------------------------------------------------------ */
  // le son est synthétisé par js/sound.js ; la voix par js/voice.js
  const Sound = {
    get on() { return !!(U.sound && U.sound.on); },
    toggle(v) { return U.sound ? U.sound.toggle(v) : false; },
    scene(c) { if (U.sound) U.sound.scene(c); }
  };
  /* --- le menu du son : voix, ambiance, musique --- */
  function syncAudio() {
    const T = U.T(), v = !!(U.voice && U.voice.on), snd = Sound.on;
    $$("[data-audio]").forEach((b) => {
      const k = b.dataset.audio;
      const val = k === "voice" ? v : snd && U.sound && U.sound[k];
      b.setAttribute("aria-checked", String(!!val));
    });
    $$("[data-sound]").forEach((b) => { b.setAttribute("aria-pressed", String(snd)); if (b.id !== "soundBtn") b.textContent = snd ? T.soundOff : T.soundOn; });
    $$("[data-voice]").forEach((b) => { b.setAttribute("aria-pressed", String(v)); b.textContent = v ? T.voiceOff : T.voiceOn; });
    const btn = $("#soundBtn");
    btn.classList.toggle("on", v || snd);
    btn.setAttribute("aria-pressed", String(v || snd));
    const note = $("#voiceNote");
    if (note) { const miss = U.voice && U.voice.supported && v && !U.voice.has(document.documentElement.lang); const none = U.voice && !U.voice.supported; note.hidden = !(miss || none); note.textContent = none ? T.voiceNone : T.voiceMissing; }
  }
  function toggleSound(force) {
    const on = Sound.toggle(force);
    if (on && U.sound && !U.sound.ambient && !U.sound.music) { U.sound.setPart("ambient", true); U.sound.setPart("music", true); }
    if (on) Sound.scene(CHAPTERS[activeIndex] || CHAPTERS[0]);
    syncAudio();
  }
  function toggleVoice(force) {
    if (!U.voice) return;
    const on = U.voice.set(force === undefined ? !U.voice.on : force);
    if (on) narrate(CHAPTERS[activeIndex], true);
    syncAudio();
  }
  // ce que la voix lit en arrivant sur un chapitre
  function narrate(c, replace = true) {
    if (!U.voice || !U.voice.on || !c) return;
    const T = U.T();
    let text = "";
    if (c.type === "event") { const e = eventById[c.ev], t = U.tr(e); text = t.title + ". " + t.summary; }
    else if (c.type === "period") { const p = S.periods.find((x) => x.id === c.period); text = U.tr(p) + ". " + T.periodLines[c.period]; }
    else if (c.type === "intro") text = T.introTitle + ". " + T.introLead;
    else if (c.type === "outro") text = T.outroLead;
    U.voice.say(text, { replace });
  }
  const menu = $("#audioMenu");
  function openMenu(v) {
    if (!menu) return;
    menu.hidden = !v;
    $("#soundBtn").setAttribute("aria-expanded", String(v));
    if (v) { syncAudio(); const r = $("#soundBtn").getBoundingClientRect(); menu.style.top = r.bottom + 8 + "px"; }
  }
  $("#soundBtn").addEventListener("click", (e) => { e.stopPropagation(); openMenu(menu ? menu.hidden : false); });
  if (menu) {
    menu.addEventListener("click", (e) => {
      e.stopPropagation();
      const b = e.target.closest("[data-audio]");
      if (!b) return;
      const k = b.dataset.audio;
      if (k === "voice") { toggleVoice(); return; }
      const now = !(Sound.on && U.sound[k]);
      // le son était coupé : on n'allume que ce qui vient d'être choisi
      if (now && !Sound.on) { U.sound.setPart(k === "music" ? "ambient" : "music", false); U.sound.setPart(k, true); Sound.toggle(true); Sound.scene(CHAPTERS[activeIndex] || CHAPTERS[0]); syncAudio(); return; }
      U.sound.setPart(k, now);
      if (!U.sound.ambient && !U.sound.music && Sound.on) toggleSound(false);
      syncAudio();
    });
    document.addEventListener("click", (e) => { if (!menu.hidden && !e.target.closest("#audioMenu")) openMenu(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { openMenu(false); $("#soundBtn").focus(); } });
  }
  if (U.voice) U.voice.onChange(() => syncAudio());

  /* ------------------------------------------------------------------ */
  /* Boucle                                                              */
  /* ------------------------------------------------------------------ */
  let last = performance.now();
  function frame(now) {
    const raw = now - last, dt = Math.min(0.05, raw / 1000);
    last = now;
    if (storyVisible) {
      const t = now / 1000;
      const c = CHAPTERS[activeIndex];
      if (c) {
        // la scène attend la voix (ou la pause) avant de passer à la phase suivante
        if (gl && U.stage3d.hold && U.stage3d.hold(progress)) chapterT0 += raw;
        const el = now - chapterT0;
        progress = reduceMotion ? 1 : clamp(el / chapterDur(c));
        updateMarker();
        // lecture automatique : on passe au chapitre suivant quand la scène et le texte ont eu leur temps
        const total = Math.max(chapterDur(c), readTime(c)) + 600;
        $("#hudPlayBar").style.width = playing ? (clamp(el / total) * 100).toFixed(1) + "%" : "0";
        const talking = U.voice && U.voice.on && U.voice.speaking;
        if (playing && el > total && !talking && !document.body.classList.contains("sheet-open") && !document.body.classList.contains("drawer-open") && !document.body.classList.contains("cam-free")) {
          if (activeIndex < CHAPTERS.length - 1) { chapterT0 = now; goTo(CHAPTERS[activeIndex + 1].id); }
          if (activeIndex + 1 >= CHAPTERS.length - 1) setPlaying(false);
        }
      }
      if (gl) U.stage3d.render(dt, t, progress, { W, H, fb, mobile });
      else drawSky(dt, t);
      drawFx(dt, t);
      updateSvg();
    }
    requestAnimationFrame(frame);
  }

  function init() {
    buildScenes();
    buildMap();
    bricks = $$('#sceneSvg [data-scene="medina"] .brick').sort((a, b) => +a.dataset.k - +b.dataset.k);
    renderStory();
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    new IntersectionObserver((entries) => {
      storyVisible = entries[0].isIntersecting;
      document.body.classList.toggle("story-off", !storyVisible);
      if (!storyVisible) document.documentElement.classList.remove("snap");
      if (!storyVisible && playing) setPlaying(false);
    }, { rootMargin: "-80px 0px -30% 0px" }).observe($("#story"));
    document.documentElement.classList.add("snap");
    U.onLang.push(() => { renderStory(); resize(); setPlaying(playing); if (!$("#mapSheet").hidden) renderSheet(); syncAudio(); });
    requestAnimationFrame(frame);
  }

  U.formation = formation;
  // le monde 3D a fini de charger : il reprend la scène en cours
  U.stageReady = () => { if (activeIndex >= 0) { const i = activeIndex; activeIndex = -1; setActive(i); } };
  U.crowdColors = () => COLORS.slice();
  U.openChapter = (id) => goTo(id, true);
  // revenir à un moment précis de la scène (phases d'une bataille)
  U.seekChapter = (p) => { const c = CHAPTERS[activeIndex]; if (c) { chapterT0 = performance.now() - clamp(p) * chapterDur(c); progress = clamp(p); } };
  U.storyInit = init;
})();
