/* Sira — le son
   Tout est synthétisé dans le navigateur (aucun fichier audio) :
   - l'ambiance suit la scène : vent, mer, grillons la nuit, oiseaux dans les oasis, feux de camp,
     clochettes des caravanes, rumeur et fracas des batailles, chevaux au galop, flèches ;
   - la musique : une improvisation lente (taqsim) d'une flûte de roseau (ney) sur un bourdon,
     dans un maqâm choisi selon l'humeur du chapitre (hijaz, bayati, saba, rast).
   L'ambiance et la musique se règlent séparément. */
(function () {
  const U = window.Sira;
  const KEY = "sira-audio";
  const pref = { ambient: true, music: true };
  try { Object.assign(pref, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { /* rien */ }
  let ctx = null, on = false, out, ambBus, musBus, verb;
  const L = {}; // couches d'ambiance : { gain, target }
  const mood = { night: false, sea: 0, wind: 0.45, birds: 0, crickets: 0, fire: 0, battle: 0, gallop: 0, arrows: 0, bells: 0, storm: 0, town: 0, quiet: false, maqam: "hijaz" };

  /* --- briques --- */
  function noiseBuffer(kind) {
    const b = ctx.createBuffer(2, ctx.sampleRate * 4, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      let last = 0, b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < d.length; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
        else if (kind === "pink") { b0 = 0.997 * b0 + w * 0.029; b1 = 0.985 * b1 + w * 0.032; b2 = 0.95 * b2 + w * 0.048; d[i] = (b0 + b1 + b2 + w * 0.02) * 1.6; }
        else d[i] = w;
      }
    }
    return b;
  }
  let NB = {};
  const loopNoise = (kind) => { const s = ctx.createBufferSource(); s.buffer = NB[kind]; s.loop = true; s.loopStart = Math.random(); s.start(0, Math.random() * 3); return s; };
  // une réverbération douce : une réponse impulsionnelle de bruit qui s'éteint
  function makeVerb(sec = 3.2) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const c = ctx.createConvolver(); c.buffer = b; return c;
  }
  function layer(name, node, base = 1) {
    const g = ctx.createGain(); g.gain.value = 0;
    node.connect(g); g.connect(ambBus);
    L[name] = { gain: g, base };
    return g;
  }
  const set = (name, v, t = 1.6) => { const l = L[name]; if (l) l.gain.gain.setTargetAtTime(Math.max(0, v) * l.base, ctx.currentTime, t / 3); };
  const pan = (x) => { const p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain(); if (p.pan) p.pan.value = x; return p; };

  function init() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    NB = { white: noiseBuffer("white"), pink: noiseBuffer("pink"), brown: noiseBuffer("brown") };
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    out = ctx.createGain(); out.gain.value = 0; out.connect(comp); comp.connect(ctx.destination);
    verb = makeVerb(); const vg = ctx.createGain(); vg.gain.value = 0.55; verb.connect(vg); vg.connect(out);
    ambBus = ctx.createGain(); ambBus.gain.value = pref.ambient ? 1 : 0; ambBus.connect(out);
    musBus = ctx.createGain(); musBus.gain.value = pref.music ? 1 : 0; musBus.connect(out);
    // le vent : bruit rose filtré, dont la couleur et la force ondulent
    {
      const n = loopNoise("pink"), bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 420; bp.Q.value = 0.7;
      const l1 = ctx.createOscillator(); l1.frequency.value = 0.07; const g1 = ctx.createGain(); g1.gain.value = 240; l1.connect(g1); g1.connect(bp.frequency); l1.start();
      const g = layer("wind", n.connect(bp), 0.55);
      const l2 = ctx.createOscillator(); l2.frequency.value = 0.11; const g2 = ctx.createGain(); g2.gain.value = 0.12; l2.connect(g2); g2.connect(g.gain); l2.start();
    }
    // la mer : bruit brun, les vagues viennent par le planificateur
    { const n = loopNoise("brown"), lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 650; L.seaEnv = ctx.createGain(); L.seaEnv.gain.value = 0.3; n.connect(lp); lp.connect(L.seaEnv); layer("sea", L.seaEnv, 0.9); }
    // la rumeur d'une armée : grave, irrégulière
    {
      const n = loopNoise("brown"), lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 320;
      const l = ctx.createOscillator(); l.frequency.value = 0.31; const lg = ctx.createGain(); lg.gain.value = 120; l.connect(lg); lg.connect(lp.frequency); l.start();
      layer("rumble", n.connect(lp), 0.7);
    }
    // le feu : un souffle sourd (les craquements viennent du planificateur)
    { const n = loopNoise("brown"), lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 480; layer("fire", n.connect(lp), 0.25); }
    // la ville : un murmure lointain
    { const n = loopNoise("pink"), bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 600; bp.Q.value = 1.2; layer("town", n.connect(bp), 0.12); }
    // la tempête : un vent sifflant
    { const n = loopNoise("white"), bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900; bp.Q.value = 2.5;
      const l = ctx.createOscillator(); l.frequency.value = 0.23; const lg = ctx.createGain(); lg.gain.value = 500; l.connect(lg); lg.connect(bp.frequency); l.start();
      layer("storm", n.connect(bp), 0.35); }
    initMusic();
    setInterval(tick, 60);
  }

  /* --- événements ponctuels --- */
  const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  function burst(t, { freq = 3000, q = 1, dur = 0.05, peak = 0.3, type = "bandpass", p = 0, dest = ambBus }) {
    const s = ctx.createBufferSource(); s.buffer = NB.white;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(), pn = pan(p);
    s.connect(f); f.connect(g); g.connect(pn); pn.connect(dest);
    env(g, t, 0.002, peak, dur);
    s.start(t, Math.random() * 3); s.stop(t + dur + 0.05);
  }
  function tone(t, { f = 440, f2, type = "sine", a = 0.005, d = 0.2, peak = 0.1, p = 0, dest = ambBus, send = 0 }) {
    const o = ctx.createOscillator(), g = ctx.createGain(), pn = pan(p);
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + a + d * 0.6);
    o.connect(g); g.connect(pn); pn.connect(dest);
    if (send) { const sg = ctx.createGain(); sg.gain.value = send; g.connect(sg); sg.connect(verb); }
    env(g, t, a, peak, d);
    o.start(t); o.stop(t + a + d + 0.05);
  }
  const rnd = (a, b) => a + Math.random() * (b - a);
  const chance = (rate, dt) => Math.random() < rate * dt;
  let lastT = 0, nextWave = 0;
  function tick() {
    if (!on) return;
    const t = ctx.currentTime, dt = lastT ? Math.min(0.2, t - lastT) : 0.06;
    lastT = t;
    if (!pref.ambient) return;
    const m = mood;
    // vagues
    if (m.sea > 0.05 && t > nextWave) { const d = rnd(5, 9); L.seaEnv.gain.setTargetAtTime(1, t, 1.2); L.seaEnv.gain.setTargetAtTime(0.25, t + d * 0.45, 1.6); nextWave = t + d; }
    // grillons, la nuit
    if (m.crickets > 0.05 && chance(1.6 * m.crickets, dt)) {
      const f = rnd(4200, 4900), p = rnd(-0.7, 0.7), n = 2 + Math.floor(rnd(0, 3));
      for (let i = 0; i < n; i++) tone(t + i * 0.045, { f, d: 0.02, a: 0.004, peak: 0.018 * m.crickets, p });
    }
    // oiseaux, le jour, dans les oasis et les villes
    if (m.birds > 0.05 && chance(0.6 * m.birds, dt)) {
      const base = rnd(2600, 4200), n = 1 + Math.floor(rnd(0, 4)), p = rnd(-0.8, 0.8);
      for (let i = 0; i < n; i++) tone(t + i * rnd(0.09, 0.16), { f: base * rnd(0.9, 1.05), f2: base * rnd(1.15, 1.45), d: rnd(0.05, 0.12), peak: 0.035 * m.birds, p, send: 0.3 });
    }
    // craquements du feu
    if (m.fire > 0.05 && chance(9 * m.fire, dt)) burst(t, { freq: rnd(1800, 5200), q: 0.8, dur: rnd(0.008, 0.03), peak: rnd(0.04, 0.16) * m.fire, type: "highpass", p: rnd(-0.5, 0.5) });
    // clochettes des chameaux
    if (m.bells > 0.05 && chance(0.5 * m.bells, dt)) {
      const f0 = rnd(620, 900), p = rnd(-0.6, 0.6);
      [1, 2.76, 5.4].forEach((k, i) => tone(t, { f: f0 * k, a: 0.003, d: 1.4 / (1 + i), peak: 0.03 * m.bells / (1 + i * 1.5), p, send: 0.4 }));
    }
    // la bataille : chocs métalliques, galop, flèches
    if (m.battle > 0.05 && chance(5 * m.battle, dt)) {
      const p = rnd(-0.8, 0.8), pk = rnd(0.05, 0.14) * m.battle;
      [2350, 3700, 5900].forEach((f) => burst(t, { freq: f * rnd(0.95, 1.05), q: 30, dur: rnd(0.15, 0.35), peak: pk, p }));
    }
    if (m.gallop > 0.05 && chance(2.2 * m.gallop, dt)) {
      const p = rnd(-0.6, 0.6);
      [0, 0.09, 0.2].forEach((o) => tone(t + o, { f: 95, f2: 48, a: 0.004, d: 0.09, peak: 0.12 * m.gallop, p }));
    }
    if (m.arrows > 0.05 && chance(3 * m.arrows, dt)) {
      const s = ctx.createBufferSource(); s.buffer = NB.white;
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 6; f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(700, t + 0.45);
      const g = ctx.createGain(), pn = pan(rnd(-0.9, 0.9)); s.connect(f); f.connect(g); g.connect(pn); pn.connect(ambBus);
      env(g, t, 0.06, 0.08 * m.arrows, 0.4); s.start(t, rnd(0, 3)); s.stop(t + 0.6);
    }
  }
  function applyMood() {
    if (!ctx) return;
    const m = mood, q = m.quiet ? 0.4 : 1;
    set("wind", (m.wind + m.storm * 0.6) * q);
    set("sea", m.sea);
    set("rumble", m.battle * 0.9 + m.gallop * 0.3);
    set("fire", m.fire);
    set("town", m.town * q);
    set("storm", m.storm);
  }

  /* --- la musique : taqsim de ney sur un bourdon --- */
  const MAQAM = {
    hijaz: [0, 100, 400, 500, 700, 800, 1000],   // grave, dramatique : nuits, batailles, l'Hégire
    bayati: [0, 150, 300, 500, 700, 800, 1000],  // chaleureux : Médine, la communauté
    saba: [0, 150, 300, 400, 700, 800, 1000],    // recueilli : la révélation, la mort du Prophète ﷺ
    rast: [0, 200, 350, 500, 700, 900, 1050]     // lumineux : la naissance, la conquête, le pèlerinage
  };
  const TONIC = 293.66; // ré
  let drone = null, nextNote = 0, phrase = [], deg = 0;
  function initMusic() {
    // bourdon : ré et la, doux, qui respire lentement
    drone = ctx.createGain(); drone.gain.value = 0.0;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 520; lp.Q.value = 0.4;
    const l = ctx.createOscillator(); l.frequency.value = 0.045; const lg = ctx.createGain(); lg.gain.value = 180; l.connect(lg); lg.connect(lp.frequency); l.start();
    [[TONIC / 4, "sawtooth", 0], [TONIC / 4, "sawtooth", 7], [TONIC * 3 / 8, "sawtooth", -5], [TONIC / 2, "sine", 0]].forEach(([f, ty, det]) => {
      const o = ctx.createOscillator(); o.type = ty; o.frequency.value = f; o.detune.value = det; o.connect(lp); o.start();
    });
    lp.connect(drone); drone.connect(musBus);
    const s = ctx.createGain(); s.gain.value = 0.35; drone.connect(s); s.connect(verb);
    drone.gain.setTargetAtTime(0.05, ctx.currentTime, 2);
    setInterval(musicTick, 80);
  }
  const freqOf = (d) => {
    const sc = MAQAM[mood.maqam] || MAQAM.hijaz, o = Math.floor(d / 7), i = ((d % 7) + 7) % 7;
    return TONIC * Math.pow(2, (sc[i] + o * 1200) / 1200);
  };
  function makePhrase() {
    const n = 4 + Math.floor(rnd(0, 6)), out = [];
    let d = Math.random() < 0.6 ? deg : [0, 2, 4][Math.floor(rnd(0, 3))];
    for (let i = 0; i < n; i++) {
      const r = Math.random();
      d += r < 0.38 ? 1 : r < 0.76 ? -1 : r < 0.86 ? 2 : r < 0.94 ? -2 : 0;
      d = Math.max(-2, Math.min(9, d));
      const last = i === n - 1;
      if (last) d = Math.abs(d - 0) < Math.abs(d - 4) ? 0 : 4;
      out.push({ d, dur: last ? rnd(2.2, 3.6) : [0.42, 0.6, 0.85, 1.2, 1.7][Math.floor(rnd(0, 5))], orn: !last && Math.random() < 0.18 });
    }
    deg = d;
    return out;
  }
  function ney(t, f, dur, orn) {
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2200; lp.Q.value = 0.5;
    const vib = ctx.createOscillator(); vib.frequency.value = rnd(4.6, 5.6); const vg = ctx.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(14, t + Math.min(0.5, dur * 0.6)); vib.connect(vg);
    const oscs = [["sine", 1, 0.9], ["triangle", 1, 0.22], ["sine", 2, 0.07], ["sine", 3, 0.025]].map(([ty, k, a]) => {
      const o = ctx.createOscillator(), og = ctx.createGain(); o.type = ty;
      const start = orn ? f * Math.pow(2, 2 / 12) : f * Math.pow(2, -35 / 1200);
      o.frequency.setValueAtTime(start * k, t); o.frequency.exponentialRampToValueAtTime(f * k, t + (orn ? 0.07 : 0.09));
      vg.connect(o.detune); og.gain.value = a; o.connect(og); og.connect(lp); o.start(t); o.stop(t + dur + 0.6);
      return o;
    });
    // le souffle dans le roseau
    const s = ctx.createBufferSource(); s.buffer = NB.white;
    const bf = ctx.createBiquadFilter(); bf.type = "bandpass"; bf.frequency.value = f * 1.6; bf.Q.value = 1.4;
    const bg = ctx.createGain(); bg.gain.value = 0.09; s.connect(bf); bf.connect(bg); bg.connect(lp); s.start(t, rnd(0, 3)); s.stop(t + dur + 0.6);
    lp.connect(g); g.connect(musBus);
    const sg = ctx.createGain(); sg.gain.value = 0.7; g.connect(sg); sg.connect(verb);
    const peak = 0.075;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.14); g.gain.setValueAtTime(peak, t + Math.max(0.15, dur - 0.1)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.45);
    vib.start(t); vib.stop(t + dur + 0.6);
    void oscs;
  }
  function musicTick() {
    if (!on || !pref.music) return;
    const t = ctx.currentTime;
    if (t < nextNote - 0.2) return;
    if (!phrase.length) {
      // un silence entre deux phrases, plus long quand la scène est calme
      phrase = makePhrase();
      nextNote = Math.max(nextNote, t) + rnd(2.2, mood.quiet ? 6 : 4.5);
      return;
    }
    const n = phrase.shift();
    const at = Math.max(nextNote, t + 0.05);
    ney(at, freqOf(n.d), n.dur, n.orn);
    nextNote = at + n.dur * 0.92;
  }

  /* --- humeur selon le chapitre (2D) ou selon le monde 3D --- */
  function fromChapter(c) {
    const s = c.scene || "", ev = c.ev || c.id || "";
    const night = /night|hira|isra|hills|meccaNight/i.test(s) || ["revelation", "isra", "aqaba", "hijra", "p-mecca"].includes(ev);
    const battle = ["badr", "uhud", "khandaq", "mutah", "hunayn"].includes(ev);
    return {
      night, sea: s === "sea" ? 0.8 : 0, wind: s === "sea" ? 0.2 : battle ? 0.35 : 0.45, crickets: night ? 0.7 : 0,
      birds: !night && /oasis|medina|tree|dome/i.test(s) ? 0.6 : 0, battle: battle ? 0.35 : 0, gallop: 0, arrows: 0, fire: 0,
      bells: /caravan|desertOpen/i.test(s) || c.map ? 0.5 : 0, storm: c.fx === "wind" ? 0.3 : 0, town: /meccaValley|medina|dome/i.test(s) ? 0.5 : 0,
      quiet: ["revelation", "isra", "death"].includes(ev),
      maqam: ["revelation", "death", "sorrow", "taif"].includes(ev) ? "saba" : battle || night ? "hijaz" : ["birth", "conquest", "farewell", "kaaba"].includes(ev) ? "rast" : "bayati"
    };
  }
  const api = {
    get on() { return on; },
    get ambient() { return pref.ambient; },
    get music() { return pref.music; },
    toggle(v) {
      if (!ctx) { try { init(); } catch (e) { return false; } }
      on = v === undefined ? !on : !!v;
      ctx.resume();
      out.gain.cancelScheduledValues(ctx.currentTime);
      out.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.4);
      applyMood();
      return on;
    },
    setPart(part, v) {
      pref[part] = !!v;
      try { localStorage.setItem(KEY, JSON.stringify(pref)); } catch (e) { /* rien */ }
      if (!ctx) return;
      (part === "music" ? musBus : ambBus).gain.setTargetAtTime(v ? 1 : 0, ctx.currentTime, 0.4);
      if (part === "music" && drone) drone.gain.setTargetAtTime(v ? 0.05 : 0, ctx.currentTime, 1);
    },
    scene(c) { Object.assign(mood, fromChapter(c)); applyMood(); },
    // le monde 3D précise l'ambiance : heure, mer, foule, chevaux, flèches, feux, tempête
    mood(m) { Object.assign(mood, m); applyMood(); },
    // pendant que la voix parle, la musique et l'ambiance se font plus discrètes
    duck(v) { if (ctx) out.gain.setTargetAtTime(on ? (v ? 0.45 : 0.9) : 0, ctx.currentTime, 0.3); }
  };
  U.sound = api;
  if (U.voice) U.voice.onChange((speaking) => api.duck(speaking));
})();
