/* Sira — les lieux en vrai
   Des photographies des lieux de la Sira, venues de Wikimedia Commons (licences libres).
   L'image, son auteur et sa licence sont demandés à Commons au moment de l'affichage ;
   une photo introuvable est simplement passée. Aucune image ne représente de personne. */
(function () {
  const U = window.Sira;
  const C = (file, fr, en, ar) => ({ file, fr, en, ar });

  const PH = {
    kaabaNow: C("The Ka'ba, Great Mosque of Mecca, Saudi Arabia (4).jpg", "La Ka'ba aujourd'hui, au cœur de la Mosquée sacrée", "The Ka'ba today, at the heart of the Sacred Mosque", "الكعبة اليوم في قلب المسجد الحرام"),
    kaabaNow2: C("Kaaba Masjid Haraam Makkah.jpg", "La Ka'ba et l'esplanade des circumambulations", "The Ka'ba and the circumambulation area", "الكعبة والمطاف"),
    kaaba1880: C("Edited Khalili Collection Hajj and Arts of Pilgrimage arc.pp 0211.04 The Kaaba photo by M Sadiq Bey ca. 1880-ccbysa3.0.jpg", "L'une des premières photographies de la Ka'ba, vers 1880 (Muhammad Sadiq Bey)", "One of the first photographs of the Ka'ba, c. 1880 (Muhammad Sadiq Bey)", "من أوائل الصور الفوتوغرافية للكعبة، نحو عام ١٨٨٠ (محمد صادق بك)"),
    mecca1910: C("Mecca, ca. 1910. Bird's-eye of Kaaba with city in bg. (i.e., background) LOC matpc.04661.jpg", "La Ka'ba et la vieille ville de La Mecque, vers 1910 : les maisons serrées au fond de la vallée", "The Ka'ba and old Mecca, c. 1910: houses packed into the valley floor", "الكعبة ومكة القديمة نحو عام ١٩١٠، وبيوتها متلاصقة في بطن الوادي"),
    kaaba1880b: C("Kaba.jpg", "La Ka'ba photographiée en 1880", "The Ka'ba photographed in 1880", "الكعبة في صورة من عام ١٨٨٠"),
    nour: C("Jabal al-Nour And cave Hira.jpg", "Le Jabal an-Nour, la « montagne de la lumière » ; la grotte de Hira est près du sommet", "Jabal an-Nour, the \"mountain of light\"; the cave of Hira is near the top", "جبل النور، وغار حراء قرب قمته"),
    nour2: C("Jabbal An-Nour - Makkah (2241558560).jpg", "Le Jabal an-Nour, au nord-est de La Mecque", "Jabal an-Nour, north-east of Mecca", "جبل النور شمال شرقي مكة"),
    hira: C("Hira Cave.jpg", "L'entrée de la grotte de Hira, où fut révélé le premier verset", "The entrance to the cave of Hira, where the first verse was revealed", "مدخل غار حراء حيث نزل أول الوحي"),
    thawr: C("Jabele thor - panoramio.jpg", "Le Jabal Thawr, au sud de La Mecque, où le Prophète ﷺ et Abu Bakr se cachèrent trois nuits", "Jabal Thawr, south of Mecca, where the Prophet ﷺ and Abu Bakr hid for three nights", "جبل ثور جنوب مكة، حيث اختبأ النبي ﷺ وأبو بكر ثلاث ليال"),
    thawr2: C("Jabl e Thawr.jpg", "Le Jabal Thawr", "Jabal Thawr", "جبل ثور"),
    safa: C("Mount Safa Mecca.jpg", "Le rocher d'as-Safa, aujourd'hui à l'intérieur de la Mosquée sacrée", "The rock of as-Safa, now inside the Sacred Mosque", "صخرة الصفا داخل المسجد الحرام اليوم"),
    taif: C("Al-Hada mountain road, al-Taif region, Saudi Arabia (1).jpg", "La montée vers Ta'if par al-Hada : un escarpement de plus de 1 000 m", "The climb to Ta'if through al-Hada: an escarpment of over 1,000 m", "الطريق إلى الطائف عبر الهدا: جرف يزيد على ألف متر"),
    taif2: C("Taifroad.jpg", "Les montagnes autour de Ta'if", "The mountains around Ta'if", "الجبال حول الطائف"),
    quba: C("Quba Mosque (2024).jpg", "La mosquée de Quba', la première mosquée construite par le Prophète ﷺ", "Quba' Mosque, the first mosque built by the Prophet ﷺ", "مسجد قباء، أول مسجد بناه النبي ﷺ"),
    quba2: C("Quba Masjid.jpg", "La mosquée de Quba'", "Quba' Mosque", "مسجد قباء"),
    nabawi: C("Masjid Nabawi The Prophet's Mosque, Madina.jpg", "La Mosquée du Prophète aujourd'hui, avec la Coupole verte", "The Prophet's Mosque today, with the Green Dome", "المسجد النبوي اليوم والقبة الخضراء"),
    nabawi2: C("Bab al-Salam (Gate of Peace), one of the entrances of the Prophet's Mosque in Madinah, Saudi Arabia.jpg", "Bab as-Salam, l'une des portes de la Mosquée du Prophète", "Bab as-Salam, one of the gates of the Prophet's Mosque", "باب السلام، أحد أبواب المسجد النبوي"),
    dome: C("Green Dome of Madinah.jpg", "La Coupole verte, au-dessus de la chambre où repose le Prophète ﷺ", "The Green Dome, above the room where the Prophet ﷺ rests", "القبة الخضراء فوق الحجرة التي دُفن فيها النبي ﷺ"),
    dome2: C("Green dome, Masjid e Nabawi, Medina, KSA.jpg", "La Coupole verte", "The Green Dome", "القبة الخضراء"),
    medina1908: C("Old Al-Masjid Al-Nabawi 1908.jpg", "La Mosquée du Prophète et la vieille Médine en 1908", "The Prophet's Mosque and old Medina in 1908", "المسجد النبوي والمدينة القديمة عام ١٩٠٨"),
    qiblatayn: C("Masjid al-Qiblatain.jpg", "La mosquée des deux qiblas, où la direction de la prière changea", "The Mosque of the Two Qiblas, where the direction of prayer changed", "مسجد القبلتين حيث تحولت القبلة"),
    uhud: C("Mount Uhud.JPG", "Le mont Uhud, au nord de Médine", "Mount Uhud, north of Medina", "جبل أحد شمال المدينة"),
    rumat: C("Archers' Hill, Uhud.jpg", "La colline des archers (Jabal ar-Rumat), face au mont Uhud", "The archers' hill (Jabal ar-Rumat), facing Mount Uhud", "جبل الرماة أمام جبل أحد"),
    hamza: C("Hamza ibn Abdul-Muttalib Grave at Uhud.jpg", "Le cimetière des martyrs d'Uhud, où repose Hamza", "The cemetery of the martyrs of Uhud, where Hamza rests", "مقبرة شهداء أحد حيث يرقد حمزة"),
    badr: C("General view of the battlefield and burial ground of Badr, Saudi Arabia, site of the historic battle between the Prophet Muhammad and the Quraysh in 624 (2).jpg", "La plaine de Badr et le cimetière des martyrs", "The plain of Badr and the martyrs' cemetery", "سهل بدر ومقبرة الشهداء"),
    badr2: C("Cemetery of martyrs of The Battle of Badr Al Kubra at the wells of Badr.jpg", "Le cimetière des martyrs, près des puits de Badr", "The martyrs' cemetery near the wells of Badr", "مقبرة الشهداء قرب آبار بدر"),
    khandaq: C("Sab'u Masajid.jpg", "Les « Sept mosquées », sur le site de la bataille du Fossé", "The \"Seven Mosques\", on the site of the Battle of the Trench", "المساجد السبعة في موقع غزوة الخندق"),
    khandaq2: C("Battle of trench, Medina.JPG", "Les mosquées du Fossé, au pied du mont Sal'", "The Trench mosques at the foot of Mount Sal'", "مساجد الخندق عند سفح جبل سلع"),
    khaybar: C("Khaybar - fortress Qamus (1).jpg", "La forteresse d'al-Qamus, au-dessus de l'oasis de Khaybar", "The fortress of al-Qamus, above the Khaybar oasis", "حصن القموص فوق واحة خيبر"),
    khaybar2: C("Khaybar - deserted houses.jpg", "Les vieilles maisons de l'oasis de Khaybar", "The old houses of the Khaybar oasis", "البيوت القديمة في واحة خيبر"),
    hudaybiyya: C("Hudaibiyah Mosque - panoramio.jpg", "La mosquée d'al-Hudaybiyya (ash-Shumaysi)", "The mosque of al-Hudaybiyya (ash-Shumaysi)", "مسجد الحديبية (الشميسي)"),
    rahma: C("Jabal-e-Rehmat (Mount of Mercy) Mount Arafat.jpg", "Le Jabal ar-Rahma, dans la plaine de 'Arafat", "Jabal ar-Rahma, in the plain of 'Arafat", "جبل الرحمة في صعيد عرفات"),
    mina: C("Mina Overview.JPG", "La vallée de Mina et ses tentes", "The valley of Mina and its tents", "وادي منى وخيامه"),
    mina2: C("Some perspective on Mina - Flickr - Al Jazeera English.jpg", "Mina pendant le pèlerinage", "Mina during the pilgrimage", "منى في موسم الحج"),
    tabuk: C("قلعة تبوك.jpg", "La citadelle de Tabuk", "The citadel of Tabuk", "قلعة تبوك"),
    aqsa: C("Israel-2013(2)-Aerial-Jerusalem-Temple Mount-Al-Aqsa and Dome of the Rock (SE exposure).jpg", "L'esplanade d'al-Aqsa à Jérusalem, vue du ciel", "The al-Aqsa compound in Jerusalem, from the air", "المسجد الأقصى في القدس من الجو"),
    aqsa2: C("Al-Aqsa Mosque-Jerusalem.jpg", "Le Dôme du Rocher, sur l'esplanade d'al-Aqsa", "The Dome of the Rock, in the al-Aqsa compound", "قبة الصخرة في المسجد الأقصى"),
    negash: C("Negash, la moschea sul sito della più antica moschea d'etiopia, del vii secolo 03.jpg", "Negash (Éthiopie), sur le site de l'une des plus anciennes mosquées d'Afrique", "Negash (Ethiopia), on the site of one of Africa's oldest mosques", "النجاشي في الحبشة، موضع من أقدم مساجد إفريقيا"),
    aksum: C("Stelae, Aksum, Ethiopia (7158408756).jpg", "Les stèles d'Aksoum, capitale du royaume du Négus", "The stelae of Aksum, capital of the Negus's kingdom", "مسلات أكسوم عاصمة مملكة النجاشي"),
    mutah: C("Shrine of Ja'far al-Tayyar in Mazar, Karak, Jordan 01.JPG", "Le mausolée de Ja'far ibn Abi Talib, près de Mu'ta (Jordanie)", "The shrine of Ja'far ibn Abi Talib near Mu'tah (Jordan)", "مقام جعفر بن أبي طالب قرب مؤتة في الأردن"),
    mutah2: C("Al-Mazār al-Janūbī (Jaʿfar ibn Abī Ṭālib Shrine).jpg", "Al-Mazar, où reposent les martyrs de Mu'ta", "Al-Mazar, resting place of the martyrs of Mu'tah", "المزار حيث يرقد شهداء مؤتة"),
    bosra: C("Bosra pano Syria.jpg", "Bosra (Syrie), étape des caravanes de Quraysh", "Bosra (Syria), a stop for the Quraysh caravans", "بصرى الشام، محطة قوافل قريش"),
    bosra2: C("Roman Theatre in Bosra.jpg", "Le théâtre romain de Bosra", "The Roman theatre of Bosra", "المسرح الروماني في بصرى"),
    harra: C("Madina trip 224.jpg", "La roche volcanique des harra, autour de Médine", "The volcanic rock of the harra around Medina", "الحجارة البركانية في حرار المدينة"),
    desert: C("Deserts of Saudi Arabia.jpg", "Le désert d'Arabie et ses chameaux", "The Arabian desert and its camels", "صحراء الجزيرة العربية وإبلها"),
    palms: C("Date palm with fruits.jpg", "Un palmier dattier de Médine", "A date palm in Medina", "نخلة تمر في المدينة"),
    redsea: C("Yanbu Beach 1.jpg", "La côte de la mer Rouge, au Hijaz", "The Red Sea coast of the Hijaz", "ساحل البحر الأحمر في الحجاز"),
    hijaz: C("View from Al Shafa Road - Taif (7833873918).jpg", "Les montagnes du Hijaz près de Ta'if", "The Hijaz mountains near Ta'if", "جبال الحجاز قرب الطائف")
  };

  // les photos de chaque chapitre, dans l'ordre d'affichage
  const BY = {
    "p-early": ["mecca1910", "kaaba1880"], birth: ["mecca1910", "kaabaNow"], halima: ["desert", "hijaz"], grandfather: ["kaaba1880b", "kaabaNow2"],
    bahira: ["bosra", "bosra2", "desert"], fudul: ["kaaba1880", "mecca1910"], khadija: ["bosra", "desert"], kaaba: ["kaabaNow", "kaaba1880", "kaabaNow2"],
    "p-mecca": ["nour", "nour2"], revelation: ["hira", "nour", "nour2"], public: ["safa", "mecca1910"], abyssinia: ["negash", "aksum", "redsea"],
    boycott: ["mecca1910"], sorrow: ["kaaba1880b"], taif: ["taif", "taif2", "hijaz"], isra: ["aqsa", "aqsa2"], aqaba: ["mina", "mina2"],
    "p-medina": ["nabawi", "palms"], hijra: ["thawr", "thawr2", "quba"], medina: ["quba", "medina1908", "nabawi", "palms"], qibla: ["qiblatayn"],
    badr: ["badr", "badr2"], uhud: ["uhud", "rumat", "hamza"], khandaq: ["khandaq", "khandaq2", "harra"], hudaybiyya: ["hudaybiyya"],
    letters: ["nabawi2"], khaybar: ["khaybar", "khaybar2"], mutah: ["mutah", "mutah2"], conquest: ["kaaba1880", "mecca1910", "kaabaNow"],
    tabuk: ["tabuk", "desert"], delegations: ["nabawi2"], farewell: ["rahma", "mina"], death: ["dome", "nabawi", "dome2"]
  };

  /* --- informations Commons : vignette, auteur, licence --- */
  const info = new Map(); // fichier → { src, w, h, artist, license, page } | null (introuvable)
  const pending = new Map();
  const strip = (html) => { const d = document.createElement("div"); d.innerHTML = html || ""; return (d.textContent || "").replace(/\s+/g, " ").trim(); };
  function load(files) {
    const need = files.filter((f) => !info.has(f) && !pending.has(f));
    if (need.length) {
      const url = "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo" +
        "&iiprop=url|extmetadata&iiurlwidth=1400&iiextmetadatafilter=Artist|LicenseShortName&titles=" +
        encodeURIComponent(need.map((f) => "File:" + f).join("|"));
      const job = fetch(url).then((r) => r.json()).then((j) => {
        const norm = {};
        for (const n of (j.query && j.query.normalized) || []) norm[n.to] = n.from;
        const pages = (j.query && j.query.pages) || {};
        for (const k in pages) {
          const pg = pages[k];
          const file = (norm[pg.title] || pg.title || "").replace(/^File:/, "");
          const ii = pg.imageinfo && pg.imageinfo[0];
          if (!ii || pg.missing !== undefined) { info.set(file, null); continue; }
          const md = ii.extmetadata || {};
          info.set(file, {
            src: ii.thumburl || ii.url, w: ii.thumbwidth || ii.width, h: ii.thumbheight || ii.height,
            artist: strip(md.Artist && md.Artist.value), license: strip(md.LicenseShortName && md.LicenseShortName.value),
            page: ii.descriptionurl || "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(file.replace(/ /g, "_"))
          });
        }
        for (const f of need) if (!info.has(f)) info.set(f, null);
      }).catch(() => {
        // Commons injoignable : on tente l'adresse directe du fichier, sans crédit détaillé
        for (const f of need) if (!info.has(f)) info.set(f, {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(f) + "?width=1400",
          artist: "", license: "", page: "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(f.replace(/ /g, "_"))
        });
      }).finally(() => need.forEach((f) => pending.delete(f)));
      need.forEach((f) => pending.set(f, job));
    }
    return Promise.all(files.map((f) => pending.get(f))).then(() => files.map((f) => ({ file: f, ...(info.get(f) || {}) })).filter((x) => x.src));
  }
  const listFor = (id) => (BY[id] || []).map((k) => PH[k]).filter(Boolean);

  /* --- la visionneuse --- */
  const $ = (s) => document.querySelector(s);
  let items = [], at = 0, opener = null, title = "";
  function credit(it) {
    const T = U.T();
    const who = [it.artist, it.license].filter(Boolean).join(" · ");
    return `${T.photoBy} ${who ? escape(who) + " · " : ""}<a href="${it.page}" target="_blank" rel="noopener">Wikimedia Commons</a>`;
  }
  const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function show(i) {
    if (!items.length) return;
    at = (i + items.length) % items.length;
    const it = items[at], box = $("#photoBox"), img = $("#photoImg");
    box.classList.add("loading");
    img.onload = () => box.classList.remove("loading");
    img.onerror = () => { items.splice(at, 1); if (items.length) show(at); else close(); };
    img.src = it.src;
    img.alt = U.tr(it.cap);
    $("#photoCap").textContent = U.tr(it.cap);
    $("#photoCredit").innerHTML = credit(it);
    $("#photoCount").textContent = items.length > 1 ? `${U.num(at + 1)} / ${U.num(items.length)}` : "";
    box.classList.toggle("single", items.length < 2);
    // la suivante se prépare
    if (items.length > 1) { const n = new Image(); n.src = items[(at + 1) % items.length].src; }
  }
  function open(list, start, from, label) {
    const box = $("#photoBox");
    opener = from || null;
    title = label || "";
    $("#photoTitle").textContent = title;
    box.hidden = false;
    document.body.classList.add("photo-open");
    box.classList.add("loading");
    $("#photoCap").textContent = ""; $("#photoCredit").textContent = ""; $("#photoImg").removeAttribute("src");
    load(list.map((c) => c.file)).then((found) => {
      items = found.map((f) => ({ ...f, cap: list.find((c) => c.file === f.file) }));
      if (!items.length) { $("#photoCap").textContent = U.T().photoNone; box.classList.remove("loading"); return; }
      show(start || 0);
    });
    $("#photoClose").focus({ preventScroll: true });
  }
  function close() {
    const box = $("#photoBox");
    if (box.hidden) return;
    box.hidden = true;
    document.body.classList.remove("photo-open");
    if (opener && document.body.contains(opener)) opener.focus({ preventScroll: true });
  }

  /* --- la fenêtre « le lieu aujourd'hui » sur la scène --- */
  let thumbFor = null;
  function setChapter(id, label) {
    const th = $("#placePhoto");
    if (!th) return;
    const list = listFor(id);
    thumbFor = id;
    th.hidden = true;
    th.dataset.ch = id || "";
    th.dataset.label = label || "";
    if (!list.length) return;
    load([list[0].file]).then((found) => {
      if (thumbFor !== id || !found.length) return;
      const img = th.querySelector("img");
      img.onload = () => { if (thumbFor === id) th.hidden = false; };
      img.src = found[0].src;
      img.alt = "";
      th.querySelector(".pp-n").textContent = list.length > 1 ? U.num(list.length) : "";
    });
  }

  function init() {
    const box = $("#photoBox");
    if (!box) return;
    box.addEventListener("click", (ev) => {
      if (ev.target.closest("#photoClose") || ev.target === box) close();
      else if (ev.target.closest("#photoPrev")) show(at - 1);
      else if (ev.target.closest("#photoNext")) show(at + 1);
    });
    document.addEventListener("keydown", (ev) => {
      if (box.hidden) return;
      if (ev.key === "Escape") { ev.stopPropagation(); close(); }
      else if (ev.key === "ArrowRight") show(at + (document.documentElement.dir === "rtl" ? -1 : 1));
      else if (ev.key === "ArrowLeft") show(at + (document.documentElement.dir === "rtl" ? 1 : -1));
    }, true);
    // glisser du doigt pour passer d'une photo à l'autre
    let sx = null;
    box.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1) * (document.documentElement.dir === "rtl" ? -1 : 1));
    });
    const th = $("#placePhoto");
    if (th) th.addEventListener("click", () => open(listFor(th.dataset.ch), 0, th, th.dataset.label));
    document.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-photos]");
      if (b) { ev.preventDefault(); open(listFor(b.dataset.photos), 0, b, b.dataset.label || ""); }
    });
    U.onLang.push(() => { if (!box.hidden && items.length) show(at); });
  }

  U.photos = { has: (id) => listFor(id).length > 0, list: listFor, open, close, setChapter, get: (k) => PH[k], load };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
