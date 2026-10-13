/* Sira — la voix qui raconte
   Lecture du récit et des phases des batailles par la synthèse vocale du navigateur (fr, en, ar).
   Aucune donnée n'est envoyée : on utilise les voix installées sur l'appareil. */
(function () {
  const U = window.Sira;
  const synth = window.speechSynthesis;
  const KEY = "sira-voice";
  const LANGS = { fr: "fr", en: "en", ar: "ar" };
  let on = false, queue = [], current = null, voices = [], token = 0;
  try { on = localStorage.getItem(KEY) === "1"; } catch (e) { /* stockage indisponible */ }
  const supported = !!(synth && window.SpeechSynthesisUtterance);

  function loadVoices() { voices = supported ? synth.getVoices() : []; }
  if (supported) { loadVoices(); synth.addEventListener?.("voiceschanged", loadVoices); }
  // la plus belle voix disponible pour la langue
  function pick(lang) {
    const code = LANGS[lang] || "fr";
    const list = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(code));
    if (!list.length) return null;
    const score = (v) => {
      let s = 0;
      const n = v.name.toLowerCase(), l = v.lang.toLowerCase();
      if (/natural|neural|premium|enhanced|online/.test(n)) s += 6;
      if (/google/.test(n)) s += 4;
      if (/siri|amélie|amelie|thomas|daniel|samantha|maged|laila|tarik/.test(n)) s += 2;
      if (code === "fr" && l === "fr-fr") s += 2;
      if (code === "en" && (l === "en-gb" || l === "en-us")) s += 1;
      if (code === "ar" && (l === "ar-sa" || l === "ar-001")) s += 1;
      if (v.localService) s += 1;
      return s;
    };
    return list.sort((a, b) => score(b) - score(a))[0];
  }
  const has = (lang) => !!pick(lang);

  // le texte tel qu'on le prononce
  function clean(t, lang) {
    const pbuh = { fr: ", paix et salut sur lui,", en: ", peace be upon him,", ar: " صلى الله عليه وسلم" }[lang] || "";
    return String(t)
      .replace(/ﷺ/g, pbuh)
      .replace(/[﴿﴾]/g, "")
      .replace(/\s*\((?:[^()]*\d[^()]*)\)/g, "") // les références (8:17), (الأنفال: ١٧)
      .replace(/[«»"]/g, "")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }
  // Chrome coupe les longues phrases : on découpe par phrases
  function chunks(t) {
    const parts = t.match(/[^.!?؟…]+[.!?؟…]*/g) || [t];
    const out = [];
    for (const p of parts) {
      const s = p.trim();
      if (!s) continue;
      if (out.length && (out[out.length - 1] + " " + s).length < 180) out[out.length - 1] += " " + s;
      else out.push(s);
    }
    return out;
  }
  function next() {
    if (current || !queue.length) { if (!current && !queue.length) emit(); return; }
    const item = queue.shift();
    const u = new SpeechSynthesisUtterance(item.text);
    const v = pick(item.lang);
    if (v) u.voice = v;
    u.lang = v ? v.lang : { fr: "fr-FR", en: "en-GB", ar: "ar-SA" }[item.lang];
    u.rate = item.lang === "ar" ? 0.92 : 0.96;
    u.pitch = 1;
    const my = token;
    current = u;
    u.onend = u.onerror = () => { if (my !== token) return; current = null; if (item.done && !queue.some((q) => q.group === item.group)) item.done(); next(); };
    emit();
    synth.speak(u);
  }
  const listeners = [];
  const emit = () => listeners.forEach((fn) => fn(api.speaking));

  const api = {
    supported,
    get on() { return on && supported; },
    get speaking() { return !!current || queue.length > 0; },
    has,
    set(v) {
      on = !!v && supported;
      try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) { /* rien */ }
      if (!on) api.stop();
      emit();
      return on;
    },
    // dire un texte ; replace : on coupe ce qui était en cours
    say(text, { replace = false, done, group } = {}) {
      if (!api.on || !text) { if (done) done(); return; }
      const lang = document.documentElement.lang || "fr";
      if (replace) api.stop();
      const g = group || Math.random();
      const parts = chunks(clean(text, lang));
      parts.forEach((p, i) => queue.push({ text: p, lang, group: g, done: i === parts.length - 1 ? done : null }));
      next();
    },
    stop() {
      token++;
      queue = [];
      current = null;
      if (supported) synth.cancel();
      emit();
    },
    onChange(fn) { listeners.push(fn); }
  };
  // Chrome met parfois la synthèse en pause au bout de 15 s : on la relance
  if (supported) setInterval(() => { if (current && synth.paused) synth.resume(); }, 4000);
  U.voice = api;
  U.onLang.push(() => api.stop());
})();
