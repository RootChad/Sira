/* Sira — logique de la page */
(function () {
  "use strict";

  const S = window.SIRA;
  const M = window.SIRA_MAP;
  const LANGS = ["fr", "en", "ar"];
  const LOCALES = { fr: "fr-FR", en: "en-GB", ar: "ar-u-nu-arab" };
  const PERIOD_COLOR = { early: "var(--p-early)", mecca: "var(--p-mecca)", medina: "var(--p-medina)" };
  const START = 570, END = 632;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const el = (tag, attrs = {}, html) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "style") n.style.cssText = v; else n.setAttribute(k, v === true ? "" : v);
    }
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  const SVGNS = "http://www.w3.org/2000/svg";
  const svg = (tag, attrs = {}) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } }
  };

  /* ---------- Langue ---------- */
  let lang = (function () {
    const saved = store.get("sira-lang");
    if (LANGS.includes(saved)) return saved;
    const nav = (navigator.language || "fr").slice(0, 2);
    return LANGS.includes(nav) ? nav : "fr";
  })();
  const T = () => I18N[lang];
  const tr = (obj) => (obj && (obj[lang] ?? obj.fr)) || "";
  const num = (n) => new Intl.NumberFormat(LOCALES[lang]).format(n);
  const digits = (s) => lang === "ar" ? String(s).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]) : String(s);
  const get = (path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), T());

  // En arabe, le point médian se confond avec le zéro (٠) : on utilise un tiret.
  const SEP = () => (lang === "ar" ? " — " : " · ");

  const eventById = Object.fromEntries(S.events.map((e) => [e.id, e]));

  function yearText(e) {
    const y = e.end ? `${e.year}–${e.end}` : `${e.year}`;
    return digits(y);
  }
  function ahText(e) {
    if (e.ah < 0) return `${digits(-e.ah)} ${T().bhShort}`;
    return lang === "en" ? `${T().ahShort} ${digits(e.ah)}` : `${digits(e.ah)} ${T().ahShort}`;
  }
  function fmtAge(age) {
    const a = digits(age);
    return { fr: `${a} ans`, en: `age ${a}`, ar: `العمر ${a}` }[lang];
  }
  const ageText = (e) => (e.age === "0" ? "" : fmtAge(e.age));

  /* ---------- Thème ---------- */
  const root = document.documentElement;
  const savedTheme = store.get("sira-theme");
  if (savedTheme === "dark" || savedTheme === "light") root.dataset.theme = savedTheme;
  function isDark() {
    if (root.dataset.theme) return root.dataset.theme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function syncThemeIcon() {
    // L'icône montre le thème vers lequel on bascule.
    const btn = $("#themeBtn");
    btn.querySelector(".sun").style.display = isDark() ? "inline" : "none";
    btn.querySelector(".moon").style.display = isDark() ? "none" : "inline";
  }
  $("#themeBtn").addEventListener("click", () => {
    root.dataset.theme = isDark() ? "light" : "dark";
    store.set("sira-theme", root.dataset.theme);
    syncThemeIcon();
  });

  /* ---------- Hero ---------- */
  function buildStars() {
    const g = $("#stars");
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 110; i++) {
      const c = svg("circle", {
        cx: (rnd() * 1200).toFixed(1),
        cy: (rnd() * rnd() * 300).toFixed(1),
        r: (0.5 + rnd() * 1.3).toFixed(2),
        opacity: (0.35 + rnd() * 0.65).toFixed(2)
      });
      if (rnd() > 0.7) { c.classList.add("tw"); c.style.animationDelay = (rnd() * 4).toFixed(2) + "s"; }
      g.appendChild(c);
    }
  }
  function renderStats() {
    $("#heroStats").innerHTML = T().stats
      .map((s) => `<div><dt>${num(s.n)}</dt><dd>${esc(s.l)}</dd></div>`).join("");
  }

  /* ---------- Ruban de vie ---------- */
  const pct = (y) => ((y - START) / (END - START)) * 100;
  function renderRibbon() {
    const box = $("#ribbon");
    box.innerHTML = "";
    const width = box.clientWidth || 340;
    const minGap = 17; // px entre deux points d'une même ligne
    const lanes = [];
    const dots = el("div", { class: "ribbon-dots" });
    let maxLane = 0;
    S.events.forEach((e) => {
      const x = (pct(e.year) / 100) * width;
      let lane = lanes.findIndex((last) => x - last >= minGap);
      if (lane === -1) { lane = lanes.length; lanes.push(x); } else lanes[lane] = x;
      maxLane = Math.max(maxLane, lane);
      const t = tr(e);
      const b = el("button", {
        type: "button", class: "ribbon-dot",
        style: `inset-inline-start:${pct(e.year)}%;bottom:${lane * 18 + 6}px;--c:${PERIOD_COLOR[e.period]}`,
        "aria-label": `${yearText(e)} — ${t.title}`,
        "data-id": e.id
      });
      b.addEventListener("click", () => openEvent(e.id));
      b.addEventListener("mouseenter", () => showTip(b, e));
      b.addEventListener("focus", () => showTip(b, e));
      b.addEventListener("mouseleave", hideTip);
      b.addEventListener("blur", hideTip);
      dots.appendChild(b);
    });
    dots.style.height = (maxLane + 1) * 18 + 10 + "px";
    box.appendChild(dots);

    const bar = el("div", { class: "ribbon-bar" });
    S.periods.forEach((p) => {
      bar.appendChild(el("div", {
        class: "ribbon-seg", style: `flex:${p.to - p.from};--c:${PERIOD_COLOR[p.id]}`, title: tr(p)
      }, `<span class="seg-long">${esc(tr(p))}</span><span class="seg-short">${digits(p.from)}–${digits(p.to)}</span>`));
    });
    box.appendChild(bar);

    const axis = el("div", { class: "ribbon-axis" });
    // âges selon la tradition (calendrier lunaire)
    [[570, "0"], [590, "20"], [610, "40"], [622, "53"], [632, "63"]].forEach(([y, a]) => {
      const edge = y === START ? " first" : y === END ? " last" : "";
      axis.appendChild(el("div", { class: "ribbon-tick" + edge, style: `inset-inline-start:${pct(y)}%` },
        `<b>${digits(y)}</b><span>${esc(fmtAge(a))}</span>`));
    });
    box.appendChild(axis);

    const legend = el("div", { class: "ribbon-legend" });
    legend.innerHTML = S.periods.map((p) => `<span><i style="--c:${PERIOD_COLOR[p.id]}"></i>${esc(tr(p))}${SEP()}${digits(p.from)}–${digits(p.to)}</span>`).join("");
    box.appendChild(legend);
    box.appendChild(el("div", { class: "ribbon-tip", id: "ribbonTip", hidden: true }));
  }
  function showTip(btn, e) {
    const tip = $("#ribbonTip");
    if (!tip) return;
    const t = tr(e);
    tip.innerHTML = `${esc(t.title)}<small>${yearText(e)}${SEP()}${esc(ahText(e))}</small>`;
    const box = $("#ribbon").getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    let x = r.left + r.width / 2 - box.left;
    x = Math.max(110, Math.min(box.width - 110, x));
    if (lang === "ar") tip.style.right = box.width - x + "px", tip.style.left = "";
    else tip.style.left = x + "px", tip.style.right = "";
    tip.style.top = r.top - box.top + "px";
    tip.hidden = false;
  }
  function hideTip() { const tip = $("#ribbonTip"); if (tip) tip.hidden = true; }

  /* ---------- Versets ---------- */
  function renderVerses() {
    $$("[data-verse]").forEach((box) => {
      const v = S.verses[box.dataset.verse];
      box.innerHTML =
        `<div class="verse-ornament"><svg aria-hidden="true"><use href="#rosette"/></svg></div>` +
        `<p class="verse-ar" lang="ar">﴿ ${esc(v.ar)} ﴾</p>` +
        (lang !== "ar" ? `<p class="verse-tr"><span class="sr">${esc(T().verseMeaning)}: </span>${lang === "fr" ? "« " + esc(v.fr) + " »" : "“" + esc(v.en) + "”"}</p>` : "") +
        `<p class="verse-ref">${esc(tr(v.ref))}</p>`;
    });
  }

  /* ---------- Frise ---------- */
  let filter = "all";
  function renderFilters() {
    const box = $("#filters");
    box.innerHTML = "";
    const opts = [{ id: "all", label: T().filterAll }].concat(S.periods.map((p) => ({ id: p.id, label: tr(p) })));
    opts.forEach((o) => {
      const b = el("button", {
        type: "button", class: "chip", "aria-pressed": String(filter === o.id),
        style: o.id !== "all" ? `--c:${PERIOD_COLOR[o.id]}` : ""
      }, (o.id !== "all" ? "<i></i>" : "") + esc(o.label));
      b.addEventListener("click", () => { filter = o.id; renderFilters(); applyFilter(); });
      box.appendChild(b);
    });
  }
  function applyFilter() {
    $$("#timelineList > li").forEach((li) => { li.hidden = filter !== "all" && li.dataset.period !== filter; });
  }
  function renderTimeline() {
    const list = $("#timelineList");
    const open = new Set($$(".tl-item.open", list).map((n) => n.dataset.id));
    list.innerHTML = "";
    S.periods.forEach((p) => {
      list.appendChild(el("li", { class: "tl-chapter", "data-period": p.id, style: `--c:${PERIOD_COLOR[p.id]}` },
        `<h3>${esc(tr(p))}</h3><p>${digits(p.from)} – ${digits(p.to)}</p>`));
      S.events.filter((e) => e.period === p.id).forEach((e) => {
        const t = tr(e);
        const isOpen = open.has(e.id);
        const age = ageText(e);
        const li = el("li", {
          class: "tl-item" + (isOpen ? " open" : ""), id: "ev-" + e.id, "data-id": e.id,
          "data-period": e.period, style: `--c:${PERIOD_COLOR[e.period]}`
        });
        li.innerHTML =
          `<div class="tl-node" aria-hidden="true"><svg><use href="#i-${e.icon}"/></svg></div>` +
          `<article class="tl-card">` +
          `<div class="tl-meta"><span class="tl-year${e.end ? " range" : ""}">${yearText(e)}</span>` +
          `<span class="tl-sub"><b>${esc(ahText(e))}</b>${age ? SEP() + esc(age) : ""}</span></div>` +
          `<h4>${esc(t.title)}</h4>` +
          `<p class="tl-summary">${esc(t.summary)}</p>` +
          `<p class="tl-details" id="det-${e.id}"${isOpen ? "" : " hidden"}>${esc(t.details)}</p>` +
          `<div class="tl-actions">` +
          `<button type="button" class="link-btn" data-act="toggle" aria-expanded="${isOpen}" aria-controls="det-${e.id}">${esc(isOpen ? T().readLess : T().readMore)}</button>` +
          (e.route || e.place ? `<button type="button" class="link-btn" data-act="map"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>${esc(T().seeOnMap)}</button>` : "") +
          `</div></article>`;
        list.appendChild(li);
      });
    });
    applyFilter();
  }
  $("#timelineList").addEventListener("click", (ev) => {
    const btn = ev.target.closest("button[data-act]");
    if (!btn) return;
    const li = btn.closest(".tl-item");
    const e = eventById[li.dataset.id];
    if (btn.dataset.act === "toggle") toggleEvent(li, !li.classList.contains("open"));
    else if (btn.dataset.act === "map") {
      if (e.route) selectRoute(e.route, true); else selectPlace(e.place, true);
      $("#map").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  });
  function toggleEvent(li, on) {
    li.classList.toggle("open", on);
    $(".tl-details", li).hidden = !on;
    const b = $('[data-act="toggle"]', li);
    b.setAttribute("aria-expanded", String(on));
    b.textContent = on ? T().readLess : T().readMore;
  }
  function openEvent(id) {
    const li = $("#ev-" + id);
    if (!li) return;
    if (li.hidden) { filter = "all"; renderFilters(); applyFilter(); }
    toggleEvent(li, true);
    li.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    li.classList.remove("flash");
    void li.offsetWidth;
    li.classList.add("flash");
    setTimeout(() => li.classList.remove("flash"), 2200);
  }

  /* ---------- Carte ---------- */
  const FULL = { x: 0, y: 0, w: M.w, h: M.h };
  const HIJAZ = { x: 180, y: 278, w: 165, h: 209 };
  // Position des étiquettes en pixels écran : [dx, dy, ancre]
  const LABEL = {
    mecca: [-9, 4, "end"], medina: [9, 4, "start"], taif: [8, 8, "start"], badr: [-8, 4, "end"],
    khaybar: [8, 4, "start"], hudaybiyya: [-6, -9, "end"], hunayn: [6, -9, "start"],
    tabuk: [8, 4, "start"], mutah: [8, 5, "start"], bosra: [8, 4, "start"], aksum: [8, 4, "start"],
    abwa: [-8, 4, "end"], jerusalem: [8, 4, "start"], shuaybah: [-8, 12, "end"]
  };
  const FULL_LABELS = new Set(["mecca", "medina", "khaybar", "tabuk", "mutah", "bosra", "aksum", "jerusalem"]);
  let view = { ...FULL };
  let activeRoute = "hijra";
  let activePlace = null;
  let mapBuilt = false;
  const mapEls = { routes: {}, hits: {}, places: {} };

  function smoothPath(pts) {
    if (pts.length < 3) return "M" + pts.map((p) => p.join(",")).join("L");
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
    }
    return d;
  }

  function buildMap() {
    const s = $("#mapSvg");
    s.appendChild(svg("path", { class: "map-land", d: M.land }));
    // rose des vents
    const rose = svg("g", { id: "mapRose" });
    const u = svg("use", { href: "#rosette", width: 40, height: 40, x: -20, y: -20 });
    u.style.color = "var(--gold)";
    rose.appendChild(u);
    const n = svg("text", { y: -26, "text-anchor": "middle", class: "map-region" });
    n.textContent = "N";
    rose.appendChild(n);
    s.appendChild(rose);
    s.appendChild(svg("g", { id: "mapRegions" }));
    const gR = svg("g", { id: "mapRoutes" });
    S.routes.forEach((r) => {
      const d = smoothPath(M.routes[r.id]);
      const p = svg("path", { d, class: "map-route" + (r.spiritual ? " spiritual" : ""), "data-id": r.id });
      const hit = svg("path", { d, class: "map-route-hit", "data-id": r.id });
      hit.addEventListener("click", () => selectRoute(r.id, true));
      gR.appendChild(p); gR.appendChild(hit);
      mapEls.routes[r.id] = p;
      mapEls.hits[r.id] = hit;
    });
    s.appendChild(gR);
    const traveler = svg("circle", { class: "map-traveler", r: 5, cx: -50, cy: -50, id: "mapTraveler" });
    s.appendChild(traveler);
    const gP = svg("g", { id: "mapPlaces" });
    Object.entries(S.places).forEach(([id, p]) => {
      if (p.hidden) return;
      const [x, y] = M.places[id];
      const g = svg("g", { class: "map-place" + (p.major ? " major" : ""), "data-id": id, tabindex: 0, role: "button" });
      g.appendChild(svg("circle", { cx: x, cy: y, r: 4 }));
      g.appendChild(svg("text", { x, y }));
      g.addEventListener("click", () => selectPlace(id, true));
      g.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); selectPlace(id, true); } });
      gP.appendChild(g);
      mapEls.places[id] = g;
    });
    s.appendChild(gP);
    $("#mapZoom").addEventListener("click", () => {
      const zoomed = view.w < FULL.w * 0.6;
      animateView(zoomed ? FULL : HIJAZ);
    });
    window.addEventListener("resize", debounce(() => { scaleMap(); renderRibbon(); }, 150));
    mapBuilt = true;
  }

  function renderMapText() {
    $("#mapTitleSr").textContent = T().mapTitle;
    const gReg = $("#mapRegions");
    gReg.innerHTML = "";
    Object.entries(S.regions).forEach(([id, r]) => {
      const [x, y] = M.labels[id];
      const t = svg("text", { x, y, "text-anchor": "middle", class: r.sea ? "map-region map-sea" : "map-region", "data-base": r.sea ? 12 : 11 });
      if (r.rotate) t.setAttribute("transform", `rotate(${r.rotate} ${x} ${y})`);
      if (lang === "ar") t.setAttribute("data-ar", "");
      t.textContent = tr(r);
      gReg.appendChild(t);
    });
    Object.entries(mapEls.places).forEach(([id, g]) => {
      g.querySelector("text").textContent = tr(S.places[id]);
      g.setAttribute("aria-label", tr(S.places[id]));
    });
    $("#mapZoom").textContent = view.w < FULL.w * 0.6 ? T().zoomAll : T().zoomHijaz;
    scaleMap();
  }

  // Conserve une taille constante à l'écran pour les traits, points et textes.
  function scaleMap() {
    const s = $("#mapSvg");
    const px = (s.clientWidth || 360) / view.w; // pixels par unité
    const k = 1 / px;
    const detailed = px > 1.5;
    Object.entries(mapEls.routes).forEach(([id, p]) => {
      const on = id === activeRoute;
      p.style.strokeWidth = (on ? 3.4 : 2) * k;
      if (p.classList.contains("spiritual")) p.style.strokeDasharray = `${2 * k} ${6 * k}`;
      mapEls.hits[id].style.strokeWidth = 16 * k;
    });
    Object.entries(mapEls.places).forEach(([id, g]) => {
      const [x, y] = M.places[id];
      const c = g.querySelector("circle");
      const big = S.places[id].major;
      c.setAttribute("r", (big ? 5.5 : 4) * k);
      c.style.strokeWidth = 1.5 * k;
      const t = g.querySelector("text");
      const [dx, dy, anchor] = LABEL[id] || [8, 4, "start"];
      t.setAttribute("x", x + dx * k);
      t.setAttribute("y", y + dy * k);
      t.setAttribute("text-anchor", anchor);
      t.style.fontSize = (big ? 13.5 : 12) * k + "px";
      t.style.strokeWidth = 3 * k;
      t.style.display = detailed || FULL_LABELS.has(id) || id === activePlace ? "" : "none";
      g.classList.toggle("on", id === activePlace);
    });
    $$("#mapRegions text").forEach((t) => {
      t.style.fontSize = +t.dataset.base * k + "px";
      t.style.display = detailed ? "none" : "";
    });
    const tv = $("#mapTraveler");
    tv.setAttribute("r", 5 * k);
    tv.style.strokeWidth = 2 * k;
    const rose = $("#mapRose");
    const rx = view.x + view.w - 30 * k, ry = view.y + 44 * k;
    rose.setAttribute("transform", `translate(${rx} ${ry}) scale(${k * 0.9})`);
    rose.querySelector("text").style.fontSize = "12px";
  }

  function setView(v) {
    view = v;
    $("#mapSvg").setAttribute("viewBox", `${v.x.toFixed(2)} ${v.y.toFixed(2)} ${v.w.toFixed(2)} ${v.h.toFixed(2)}`);
    scaleMap();
  }
  let viewAnim = 0;
  function animateView(target) {
    cancelAnimationFrame(viewAnim);
    $("#mapZoom").textContent = target.w < FULL.w * 0.6 ? T().zoomAll : T().zoomHijaz;
    if (reduceMotion) return setView(target);
    const from = { ...view }, t0 = performance.now(), dur = 750;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setView({ x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e, w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e });
      if (p < 1) viewAnim = requestAnimationFrame(step);
    };
    viewAnim = requestAnimationFrame(step);
  }
  function fitView(pts) {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const ratio = FULL.w / FULL.h;
    let w = Math.max(x1 - x0, 60) + 70, h = Math.max(y1 - y0, 60) + 70;
    if (w / h > ratio) h = w / ratio; else w = h * ratio;
    if (w > FULL.w * 0.75) return { ...FULL };
    let x = (x0 + x1) / 2 - w / 2, y = (y0 + y1) / 2 - h / 2;
    x = Math.max(0, Math.min(FULL.w - w, x));
    y = Math.max(0, Math.min(FULL.h - h, y));
    return { x, y, w, h };
  }

  let travelAnim = 0;
  function drawRoute(id, animate) {
    const p = mapEls.routes[id];
    cancelAnimationFrame(travelAnim);
    const tv = $("#mapTraveler");
    const len = p.getTotalLength();
    const spiritual = p.classList.contains("spiritual");
    const end = p.getPointAtLength(len);
    if (!animate || reduceMotion) {
      tv.setAttribute("cx", end.x); tv.setAttribute("cy", end.y);
      return;
    }
    if (!spiritual) {
      p.style.strokeDasharray = `${len} ${len}`;
      p.style.strokeDashoffset = len;
    }
    const t0 = performance.now(), dur = Math.min(2200, 900 + len * 3);
    const step = (now) => {
      const q = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - q, 3);
      if (!spiritual) p.style.strokeDashoffset = len * (1 - e);
      const pt = p.getPointAtLength(len * e);
      tv.setAttribute("cx", pt.x); tv.setAttribute("cy", pt.y);
      if (q < 1) travelAnim = requestAnimationFrame(step);
      else if (!spiritual) { p.style.strokeDasharray = ""; p.style.strokeDashoffset = ""; }
    };
    travelAnim = requestAnimationFrame(step);
  }

  function selectRoute(id, animate) {
    activeRoute = id;
    activePlace = null;
    Object.entries(mapEls.routes).forEach(([rid, p]) => p.classList.toggle("active", rid === id));
    renderRouteList();
    renderMapInfo();
    // le trait actif passe au premier plan
    const p = mapEls.routes[id];
    p.parentNode.appendChild(p); p.parentNode.appendChild(mapEls.hits[id]);
    scaleMap();
    if (animate) animateView(fitView(M.routes[id]));
    drawRoute(id, animate);
  }
  function selectPlace(id, animate) {
    activePlace = id;
    activeRoute = null;
    Object.values(mapEls.routes).forEach((p) => p.classList.remove("active"));
    $("#mapTraveler").setAttribute("cx", -50);
    renderRouteList();
    renderMapInfo();
    scaleMap();
    if (animate) {
      const [x, y] = M.places[id];
      animateView(fitView([[x - 40, y - 40], [x + 40, y + 40]]));
    }
  }
  function renderRouteList() {
    const box = $("#routeList");
    box.innerHTML = "";
    S.routes.forEach((r) => {
      const b = el("button", { type: "button", class: "chip", "aria-pressed": String(activeRoute === r.id) }, esc(tr(r).name));
      b.addEventListener("click", () => selectRoute(r.id, true));
      box.appendChild(b);
    });
  }
  function eventLink(e) {
    return `<button type="button" class="link-btn" data-open="${e.id}">${esc(T().readEvent)} →</button>`;
  }
  function renderMapInfo() {
    const box = $("#mapInfo");
    if (activeRoute) {
      const r = S.routes.find((x) => x.id === activeRoute);
      const e = eventById[r.event];
      box.innerHTML =
        `<p class="tl-sub" style="--c:${PERIOD_COLOR[e.period]}"><b>${yearText(e)}${SEP()}${esc(ahText(e))}</b></p>` +
        `<h3>${esc(tr(r).name)}</h3><p>${esc(tr(r).info)}</p>` +
        `<div class="tl-actions">${eventLink(e)}</div>`;
    } else if (activePlace) {
      const evs = S.events.filter((e) => e.place === activePlace);
      box.innerHTML = `<h3>${esc(tr(S.places[activePlace]))}</h3>` +
        (evs.length ? `<ul>${evs.map((e) => `<li><button type="button" class="link-btn" data-open="${e.id}">${yearText(e)} — ${esc(tr(e).title)}</button></li>`).join("")}</ul>` : "");
    }
  }
  $("#mapInfo").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-open]");
    if (b) openEvent(b.dataset.open);
  });

  /* ---------- Chiffres ---------- */
  function renderCharts() {
    // Mecque / Médine
    const mecca = S.periods[1], medina = S.periods[2];
    const yrs = { fr: "ans", en: "years", ar: "سنة" }[lang];
    const yrs10 = { fr: "ans", en: "years", ar: "سنوات" }[lang];
    $("#periodsChart").innerHTML =
      `<div class="split">` +
      `<div style="flex:13;--c:var(--p-mecca)"><b>${num(13)} ${yrs}</b><span>${esc(tr(mecca))}</span></div>` +
      `<div style="flex:10;--c:var(--p-medina)"><b>${num(10)} ${yrs10}</b><span>${esc(tr(medina))}</span></div>` +
      `</div>` +
      `<div class="split-scale" style="display:grid;grid-template-columns:13fr 10fr">` +
      `<span>${digits(610)}</span><span style="display:flex;justify-content:space-between"><span>${digits(622)}</span><span>${digits(632)}</span></span></div>`;

    // Croissance
    const max = Math.max(...S.growth.map((g) => g.value));
    $("#growthChart").innerHTML = `<div class="bars">` + S.growth.map((g) => {
      const last = g.value === max;
      const val = (last ? T().more + " " : "") + num(g.value);
      return `<div class="bar-row clickable" data-open="${g.event}" role="button" tabindex="0">` +
        `<div class="bar-label"><b>${esc(tr(g))} <span>${SEP().trim()} ${digits(g.year)}</span></b><span>${esc(val)}</span></div>` +
        `<div class="bar-track"><div class="bar-fill" style="width:${(g.value / max) * 100}%;--c:var(--p-medina)"></div></div></div>`;
    }).join("") + `</div>`;

    // Batailles
    const bmax = Math.max(...S.battles.map((b) => b.opponents));
    $("#battlesChart").innerHTML = S.battles.map((b) => {
      const ratio = Math.round(b.opponents / b.muslims);
      const e = eventById[b.event];
      return `<div class="battle bar-row clickable" data-open="${b.event}" role="button" tabindex="0">` +
        `<div class="battle-head"><h4>${esc(tr(b))}</h4><span>${esc(ahText(e))}${SEP()}≈ ${digits("1 : " + ratio)}</span></div>` +
        `<div class="battle-row"><span>${esc(T().muslims)}</span><div class="bar-track"><div class="bar-fill" style="width:${(b.muslims / bmax) * 100}%;--c:var(--p-medina)"></div></div><b>${num(b.muslims)}</b></div>` +
        `<div class="battle-row"><span>${esc(T().opponents)}</span><div class="bar-track"><div class="bar-fill" style="width:${(b.opponents / bmax) * 100}%;--c:var(--ink-soft)"></div></div><b>${num(b.opponents)}</b></div>` +
        `</div>`;
    }).join("") +
      `<div class="chart-legend"><span><i style="--c:var(--p-medina)"></i>${esc(T().muslims)}</span><span><i style="--c:var(--ink-soft)"></i>${esc(T().opponents)}</span></div>`;
  }
  document.addEventListener("click", (ev) => {
    const row = ev.target.closest(".charts [data-open]");
    if (row) openEvent(row.dataset.open);
  });
  document.addEventListener("keydown", (ev) => {
    if ((ev.key === "Enter" || ev.key === " ") && ev.target.matches(".charts [data-open]")) {
      ev.preventDefault(); openEvent(ev.target.dataset.open);
    }
  });

  /* ---------- Famille ---------- */
  function renderFamily() {
    const daughters = new Set(["Zaynab", "Ruqayya", "Umm Kulthum", "Fatima"]);
    $("#familyBox").innerHTML =
      `<div class="fam-block"><h3>${esc(T().lineageTitle)}</h3><p>${esc(T().lineageNote)}</p>` +
      `<ol class="lineage">${S.lineage.map((l) => `<li>${esc(tr(l))}</li>`).join("")}<li class="prophet">${esc(T().prophet)}</li></ol></div>` +
      `<div class="fam-block"><h3>${esc(T().childrenTitle)}</h3><p>${esc(T().childrenNote)}</p>` +
      `<div class="kids">${S.children.map((c) => `<div class="kid${daughters.has(c.en) ? " daughter" : ""}"><b>${esc(tr(c))}</b>${c.note ? `<small>${esc(tr(c.note))}</small>` : ""}</div>`).join("")}</div></div>` +
      `<div class="fam-block wives"><h3>${esc(T().wivesTitle)}</h3><p>${esc(T().wivesNote)}</p>` +
      `<ol>${S.wives.map((w) => `<li>${esc(tr(w))}</li>`).join("")}</ol></div>`;
  }

  /* ---------- Quiz ---------- */
  const quiz = { i: 0, score: 0, picked: null, done: false };
  function renderQuiz() {
    const box = $("#quizBox");
    const total = S.quiz.length;
    if (quiz.done) {
      const ratio = quiz.score / total;
      const msg = ratio >= 0.8 ? T().scoreGood : ratio >= 0.5 ? T().scoreMid : T().scoreLow;
      box.innerHTML =
        `<p class="quiz-score">${num(quiz.score)} / ${num(total)}</p>` +
        `<h3>${esc(T().scoreMsg(num(quiz.score), num(total)))}</h3><p class="lead">${esc(msg)}</p>` +
        `<div class="quiz-feedback"><button type="button" class="btn quiz-next" id="quizRestart">${esc(T().restart)}</button></div>`;
      $("#quizRestart").addEventListener("click", () => { Object.assign(quiz, { i: 0, score: 0, picked: null, done: false }); renderQuiz(); });
      return;
    }
    const q = S.quiz[quiz.i];
    const qt = tr(q);
    const answered = quiz.picked !== null;
    box.innerHTML =
      `<div class="quiz-progress" aria-hidden="true">${S.quiz.map((_, j) => `<i class="${j < quiz.i ? "done" : j === quiz.i ? "now" : ""}"></i>`).join("")}</div>` +
      `<p class="quiz-count">${esc(T().question)} ${num(quiz.i + 1)} ${esc(T().of)} ${num(total)}</p>` +
      `<h3>${esc(qt.q)}</h3>` +
      `<div class="quiz-options">${qt.o.map((o, j) => {
        let cls = "quiz-opt";
        if (answered && j === q.answer) cls += " right";
        else if (answered && j === quiz.picked) cls += " wrong";
        return `<button type="button" class="${cls}" data-j="${j}"${answered ? " disabled" : ""}>${esc(o)}</button>`;
      }).join("")}</div>` +
      (answered
        ? `<div class="quiz-feedback"><strong>${esc(quiz.picked === q.answer ? T().correct : T().wrong)}</strong>` +
          `<button type="button" class="link-btn" data-review="${q.event}">${esc(T().review)}</button>` +
          `<button type="button" class="btn quiz-next" id="quizNext">${esc(quiz.i + 1 < total ? T().next : T().finish)}</button></div>`
        : "");
    $$(".quiz-opt", box).forEach((b) => b.addEventListener("click", () => {
      quiz.picked = +b.dataset.j;
      if (quiz.picked === q.answer) quiz.score++;
      renderQuiz();
      $("#quizNext").focus({ preventScroll: true });
    }));
    const next = $("#quizNext");
    if (next) next.addEventListener("click", () => {
      quiz.picked = null;
      if (quiz.i + 1 < total) quiz.i++; else quiz.done = true;
      renderQuiz();
    });
    const rev = $("[data-review]", box);
    if (rev) rev.addEventListener("click", () => openEvent(rev.dataset.review));
  }

  /* ---------- Application de la langue ---------- */
  function applyLang(l) {
    lang = l;
    store.set("sira-lang", l);
    root.lang = l;
    root.dir = T().dir;
    document.title = T().pageTitle;
    const md = $('meta[name="description"]');
    if (md) md.setAttribute("content", T().metaDesc);
    $$("[data-i18n]").forEach((n) => { n.textContent = get(n.dataset.i18n) ?? n.textContent; });
    $$("[data-i18n-aria]").forEach((n) => n.setAttribute("aria-label", get(n.dataset.i18nAria)));
    $$(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
    renderStats();
    renderRibbon();
    renderVerses();
    renderFilters();
    renderTimeline();
    if (!mapBuilt) buildMap();
    renderMapText();
    renderRouteList();
    renderMapInfo();
    renderCharts();
    renderFamily();
    renderQuiz();
  }
  $$(".lang button").forEach((b) => b.addEventListener("click", () => applyLang(b.dataset.lang)));

  function debounce(fn, ms) { let t; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; }

  /* Le symbole ﷺ est un glyphe très large : on le met à l'échelle du texte. */
  function wrapPbuh(rootNode) {
    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => n.nodeValue.includes("ﷺ") && !n.parentNode.closest(".pbuh, title, script, style, svg")
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      const frag = document.createDocumentFragment();
      n.nodeValue.split("ﷺ").forEach((part, i) => {
        if (i) frag.appendChild(el("span", { class: "pbuh" }, "ﷺ"));
        if (part) frag.appendChild(document.createTextNode(part));
      });
      n.parentNode.replaceChild(frag, n);
    });
  }
  new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
    if (n.nodeType === 1) wrapPbuh(n);
    else if (n.nodeType === 3 && n.parentNode) wrapPbuh(n.parentNode);
  }))).observe(document.body, { childList: true, subtree: true });

  /* ---------- Démarrage ---------- */
  buildStars();
  wrapPbuh(document.body);
  syncThemeIcon();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", syncThemeIcon);
  applyLang(lang);
  selectRoute("hijra", false);
})();
