/* Sira — le déroulé des batailles, phase par phase
   Les positions sont en mètres depuis le point d'origine : e vers l'est, n vers le nord.
   Les armées sont faites de pions (pas de figure humaine) ; un pion vaut « scale » personnes.
   Unité : side (0 musulmans, 1 Quraysh, 2 alliés de l'ennemi, 3 pèlerins), type (inf, arch, cav, camel, sheep),
   n (personnes, ou pions si exact), sp (écart en m), w (largeur du front), keys : [p, e, n, cap (°), formation, options].
   Les phases donnent le texte, la caméra [e, n, recul km, inclinaison, cap] et l'heure. */
const L = (fr, en, ar) => ({ fr, en, ar });
const ph = (p, cam, hour, fr, en, ar) => ({ p, cam, hour, fr: { t: fr[0], d: fr[1] }, en: { t: en[0], d: en[1] }, ar: { t: ar[0], d: ar[1] } });
const LB = {
  muslims: L("Musulmans", "Muslims", "المسلمون"), quraysh: L("Quraysh", "Quraysh", "قريش"), archers: L("Archers", "Archers", "الرماة"),
  khalid: L("Cavalerie de Khalid", "Khalid's cavalry", "خيل خالد"), ikrima: L("Cavalerie de 'Ikrima", "'Ikrima's cavalry", "خيل عكرمة"),
  captives: L("Prisonniers", "Prisoners", "الأسرى"), duel: L("Duel", "Duel", "المبارزة"), ghatafan: L("Ghatafan et alliés", "Ghatafan and allies", "غطفان وأحلافها"),
  amr: L("'Amr ibn Wudd", "'Amr ibn Wudd", "عمرو بن ود"), vanguard: L("Avant-garde", "Vanguard", "المقدمة"), hawazin: L("Hawazin et Thaqif", "Hawazin and Thaqif", "هوازن وثقيف"),
  army: L("L'armée", "The army", "الجيش"), pilgrims: L("Pèlerins en ihram", "Pilgrims in ihram", "المحرمون"), camels: L("Chameaux du sacrifice", "Sacrificial camels", "الهدي"),
  band: L("Groupe de Quraysh", "A Quraysh band", "نفر من قريش"), firm: L("Ceux qui tiennent bon", "Those who stand firm", "الثابتون")
};

// le tracé du fossé, au nord de Médine (mètres depuis le point d'origine du chapitre)
const TRENCH = [[-3200, -1300], [-1600, -320], [0, -120], [1700, -380], [3000, -1150]];

export const BATTLES = {
  badr: {
    origin: [38.774, 23.728], dur: 40, scale: 1,
    units: [
      { id: "M", side: 0, type: "inf", n: 306, sp: 5, w: 62, label: LB.muslims, num: 313, keys: [
        [0, 330, 470, 180, "camp", { spread: 1.8 }], [0.13, 0, 300, 180, "block"], [0.55, 0, 300, 180, "block"], [0.62, 0, -120, 180, "melee"],
        [0.8, 0, -240, 180, "melee"], [0.9, 0, -520, 180, "scatter", { spread: 2 }], [1, 40, -380, 180, "block"]], loss: [[0.62, 0.85, 14]] },
      { id: "MH", side: 0, type: "cav", n: 2, exact: true, sp: 9, w: 2, keys: [[0, 140, 520, 180, "block"], [0.13, 190, 300, 180, "block"], [0.55, 190, 300, 180, "block"], [0.62, 190, -120, 180, "melee"], [0.9, 150, -600, 180, "scatter"], [1, 150, -450, 180, "block"]] },
      { id: "MC", side: 0, type: "inf", n: 3, exact: true, sp: 6, w: 3, label: LB.duel, labelP: [0.32, 0.5], keys: [
        [0, 330, 470, 180, "camp"], [0.13, 0, 318, 180, "block"], [0.3, 0, 318, 180, "block"], [0.36, 0, 25, 180, "line", { sp: 28 }], [0.42, 0, 12, 180, "melee", { sp: 28 }],
        [0.47, 0, 12, 180, "melee", { sp: 28 }], [0.53, 0, 318, 180, "block"], [0.62, 0, -110, 180, "melee"], [1, 0, -380, 180, "block"]] },
      { id: "MK", side: 0, type: "camel", n: 70, exact: true, sp: 7, keys: [[0, -380, 820, 200, "camp", { spread: 1.5 }], [1, -380, 820, 200, "camp", { spread: 1.5 }]] },
      { id: "Q", side: 1, type: "inf", n: 880, sp: 5, w: 110, label: LB.quraysh, num: 1000, approx: true, keys: [
        [0, 0, -1550, 0, "camp", { spread: 1.6 }], [0.1, 0, -1100, 0, "column", { w: 30 }], [0.2, 0, -430, 0, "block"], [0.55, 0, -430, 0, "block"], [0.62, 0, -150, 0, "melee"],
        [0.8, 0, -280, 0, "melee"], [0.88, 0, -1100, 180, "rout"], [1, 0, -2300, 180, "rout"]], loss: [[0.62, 0.86, 64]] },
      { id: "QH1", side: 1, type: "cav", n: 50, sp: 7, w: 8, keys: [
        [0, -260, -1650, 0, "camp"], [0.1, -300, -1150, 0, "column", { w: 5 }], [0.2, -380, -440, 0, "block"], [0.55, -380, -440, 0, "block"], [0.62, -300, -200, 20, "melee"],
        [0.8, -260, -300, 20, "melee"], [0.86, -400, -1200, 190, "rout"], [1, -500, -2500, 190, "rout"]], loss: [[0.62, 0.86, 3]] },
      { id: "QH2", side: 1, type: "cav", n: 50, sp: 7, w: 8, keys: [
        [0, 260, -1650, 0, "camp"], [0.1, 300, -1150, 0, "column", { w: 5 }], [0.2, 380, -440, 0, "block"], [0.55, 380, -440, 0, "block"], [0.62, 300, -200, 340, "melee"],
        [0.8, 260, -300, 340, "melee"], [0.86, 400, -1200, 170, "rout"], [1, 500, -2500, 170, "rout"]], loss: [[0.62, 0.86, 3]] },
      { id: "QC", side: 1, type: "inf", n: 3, exact: true, sp: 6, w: 3, keys: [
        [0, 0, -1550, 0, "camp"], [0.2, 0, -412, 0, "block"], [0.3, 0, -412, 0, "block"], [0.36, 0, -25, 0, "line", { sp: 28 }], [0.42, 0, -12, 0, "melee", { sp: 28 }], [1, 0, -12, 0, "melee", { sp: 28 }]],
        loss: [[0.43, 0.47, 3]] },
      { id: "QK", side: 1, type: "inf", n: 70, sp: 4, w: 10, show: [0.85, 1], label: LB.captives, num: 70, keys: [[0.85, 0, -330, 0, "scatter"], [1, 130, 560, 0, "block"]] },
      { id: "QM", side: 1, type: "camel", n: 260, exact: true, sp: 8, keys: [[0, -250, -1900, 30, "camp", { spread: 1.5 }], [1, -250, -1900, 30, "camp", { spread: 1.5 }]] }
    ],
    props: [
      { type: "wells", list: [[400, 600], [470, 560], [540, 590], [610, 545], [440, 480], [560, 470], [650, 610]] },
      { type: "mound", at: [230, 700], r: 70, h: 9 }, { type: "hut", at: [230, 700] },
      { type: "tents", at: [0, -1680], n: 70, r: 220 }
    ],
    banners: [
      { unit: "M", at: [0, -4], color: "#f4f1e8" }, { unit: "M", at: [-120, -3], color: "#151515" }, { unit: "M", at: [120, -3], color: "#151515" },
      { unit: "Q", at: [0, -4], color: "#8c2318", down: [[0.84, 1]] }
    ],
    events: [
      { type: "rain", p0: 0, p1: 0.12 },
      { type: "pebbles", from: [0, 330], to: [0, -400], p0: 0.47, p1: 0.56 },
      { type: "arrows", from: "Q", to: "M", p0: 0.52, p1: 0.6, n: 120 }, { type: "arrows", from: "M", to: "Q", p0: 0.54, p1: 0.6, n: 70 }
    ],
    phases: [
      ph(0, [150, -350, 2.8, 30, 10], 4.7,
        ["La veille", "Les musulmans campent près des puits de Badr et les tiennent. Dans la nuit, une pluie fine affermit le sable sous leurs pas. Quraysh campe de l'autre côté de la vallée."],
        ["The night before", "The Muslims camp by the wells of Badr and hold them. During the night a light rain firms the sand beneath their feet. Quraysh camps on the far side of the valley."],
        ["ليلة المعركة", "نزل المسلمون عند آبار بدر وسيطروا عليها، ونزل في الليل مطر خفيف ثبّت الرمل تحت أقدامهم، بينما عسكرت قريش في العدوة القصوى من الوادي."]),
      ph(0.13, [150, -150, 1.5, 24, 330], 6.2,
        ["Les rangs", "À l'aube du 17 Ramadan, le Prophète ﷺ aligne lui-même les rangs. 313 musulmans, avec 2 chevaux et 70 chameaux, font face à environ 1 000 Quraysh et leurs 100 cavaliers."],
        ["The ranks", "At dawn on 17 Ramadan, the Prophet ﷺ straightens the ranks himself. 313 Muslims, with 2 horses and 70 camels, face about 1,000 Quraysh and their 100 horsemen."],
        ["الصفوف", "في فجر السابع عشر من رمضان سوّى النبي ﷺ الصفوف بنفسه: ٣١٣ من المسلمين معهم فرسان وسبعون بعيرًا، في مواجهة نحو ألف من قريش معهم مئة فارس."]),
      ph(0.3, [0, 0, 0.42, 16, 90], 6.6,
        ["Les duels", "Selon la coutume, trois champions de Quraysh s'avancent : 'Utba, Shayba et al-Walid. Hamza, 'Ali et 'Ubayda leur répondent ; les trois Qurayshites tombent."],
        ["The duels", "As custom required, three champions of Quraysh step forward: 'Utba, Shayba and al-Walid. Hamza, 'Ali and 'Ubayda answer them; the three Qurayshis fall."],
        ["المبارزة", "خرج من قريش على عادة العرب ثلاثة: عتبة وشيبة والوليد، فبرز لهم حمزة وعلي وعبيدة، فقُتل الثلاثة من قريش."]),
      ph(0.46, [-300, 120, 0.9, 20, 120], 6.9,
        ["Une poignée de sable", "Le Prophète ﷺ lance vers l'ennemi une poignée de petits cailloux. Le Coran le rappelle : « Ce n'est pas toi qui as lancé lorsque tu as lancé, mais c'est Allah qui a lancé » (8:17)."],
        ["A handful of sand", "The Prophet ﷺ throws a handful of pebbles toward the enemy. The Qur'an recalls it: \"You did not throw when you threw, but it was Allah who threw\" (8:17)."],
        ["قبضة من الحصى", "رمى النبي ﷺ قريشًا بقبضة من الحصى، وفي ذلك نزل قوله تعالى: ﴿وَمَا رَمَيْتَ إِذْ رَمَيْتَ وَلَٰكِنَّ اللَّهَ رَمَىٰ﴾ (الأنفال: ١٧)."]),
      ph(0.6, [350, -300, 1.1, 24, 300], 7.2,
        ["La mêlée", "Les musulmans chargent. Le combat est bref ; plusieurs chefs de Quraysh, dont Abu Jahl, tombent."],
        ["The clash", "The Muslims charge. The fighting is short; several leaders of Quraysh fall, among them Abu Jahl."],
        ["الالتحام", "حمل المسلمون على قريش، وكان القتال قصيرًا، وسقط عدد من سادتها ومنهم أبو جهل."]),
      ph(0.84, [0, -500, 2.6, 30, 180], 7.8,
        ["La déroute", "Quraysh s'enfuit vers le sud. Soixante-dix des siens sont tués et soixante-dix faits prisonniers ; quatorze musulmans tombent en martyrs."],
        ["The rout", "Quraysh flees south. Seventy of its men are killed and seventy taken prisoner; fourteen Muslims fall as martyrs."],
        ["الهزيمة", "فرّت قريش نحو الجنوب، وقُتل منها سبعون وأُسر سبعون، واستشهد من المسلمين أربعة عشر."])
    ]
  },

  uhud: {
    origin: [39.6145, 24.5], dur: 46, scale: 1,
    units: [
      { id: "MU", side: 0, type: "inf", n: 650, sp: 5, w: 90, label: LB.muslims, num: 700, keys: [
        [0, 300, 380, 200, "block"], [0.16, 300, 380, 200, "block"], [0.22, 220, 60, 200, "melee"], [0.3, 160, -250, 200, "melee"],
        [0.38, 120, -700, 200, "scatter", { spread: 2.2 }], [0.56, 120, -650, 200, "scatter", { spread: 2.2 }], [0.64, 160, -380, 20, "melee"],
        [0.78, 260, 150, 20, "melee"], [0.9, 430, 760, 20, "block", { w: 40 }], [1, 430, 780, 200, "block", { w: 40 }]], loss: [[0.6, 0.86, 64]] },
      { id: "AR1", side: 0, type: "arch", n: 40, sp: 4, w: 10, label: LB.archers, num: 50, labelP: [0, 0.4], keys: [
        [0, -100, 60, 200, "block"], [0.36, -100, 60, 200, "block"], [0.46, 80, -560, 190, "scatter"], [0.56, 100, -620, 190, "scatter"],
        [0.64, 160, -380, 20, "melee"], [0.9, 430, 760, 20, "block", { w: 10 }], [1, 430, 800, 20, "block", { w: 10 }]], loss: [[0.62, 0.84, 6]] },
      { id: "AR2", side: 0, type: "arch", n: 10, sp: 4, w: 5, keys: [[0, -100, 38, 200, "block"], [1, -100, 38, 200, "block"]], loss: [[0.53, 0.58, 10]] },
      { id: "QU", side: 1, type: "inf", n: 2800, sp: 5, w: 150, label: LB.quraysh, num: 3000, keys: [
        [0, 100, -700, 20, "block"], [0.16, 100, -700, 20, "block"], [0.22, 150, -380, 20, "melee"], [0.3, 130, -520, 200, "rout"],
        [0.4, 100, -1350, 200, "rout"], [0.56, 100, -1200, 20, "scatter"], [0.64, 150, -430, 20, "melee"], [0.78, 250, 0, 20, "melee"],
        [0.9, 200, -450, 200, "block"], [1, 150, -1000, 200, "block"]], loss: [[0.2, 0.34, 22]] },
      { id: "KH", side: 1, type: "cav", n: 100, sp: 7, w: 10, label: LB.khalid, labelP: [0.4, 0.75], keys: [
        [0, -480, -480, 20, "block"], [0.3, -560, -700, 20, "block"], [0.46, -650, -380, 340, "column", { w: 4 }], [0.51, -560, 180, 20, "column", { w: 4 }],
        [0.55, -250, 330, 80, "column", { w: 4 }], [0.6, -60, 180, 140, "melee"], [0.66, 200, 420, 170, "melee"], [0.8, 300, 250, 170, "melee"],
        [0.92, -200, -250, 200, "column", { w: 4 }], [1, -320, -850, 190, "column", { w: 4 }]] },
      { id: "IK", side: 1, type: "cav", n: 100, sp: 7, w: 10, label: LB.ikrima, labelP: [0, 0.2], keys: [
        [0, 750, -460, 20, "block"], [0.22, 780, -450, 20, "block"], [0.3, 820, -800, 190, "rout"], [0.56, 700, -500, 330, "column", { w: 4 }],
        [0.68, 520, 220, 300, "melee"], [0.8, 420, 300, 300, "melee"], [1, 450, -900, 190, "column", { w: 4 }]] },
      { id: "QM", side: 1, type: "camel", n: 200, exact: true, sp: 8, keys: [[0, 380, -1680, 10, "camp", { spread: 1.5 }], [1, 380, -1680, 10, "camp", { spread: 1.5 }]] }
    ],
    props: [{ type: "mound", at: [-100, 55], r: 75, h: 16 }, { type: "tents", at: [120, -1520], n: 60, r: 220 }],
    banners: [{ unit: "MU", at: [0, -4], color: "#f4f1e8" }, { unit: "QU", at: [0, -4], color: "#8c2318", down: [[0.25, 0.56]] }],
    events: [
      { type: "arrows", from: "AR1", to: "IK", p0: 0.08, p1: 0.22, n: 90 }, { type: "arrows", from: "AR1", to: "KH", p0: 0.1, p1: 0.3, n: 90 },
      { type: "arrows", from: "QU", to: "MU", p0: 0.64, p1: 0.82, n: 110 }
    ],
    phases: [
      ph(0, [150, -250, 2.6, 30, 15], 6.7,
        ["Le dispositif", "Le mont Uhud dans le dos, 700 musulmans font face à 3 000 Quraysh et 200 cavaliers. Le Prophète ﷺ poste 50 archers sur une petite colline : « Ne quittez pas vos places, même si vous nous voyez l'emporter. »"],
        ["The positions", "With Mount Uhud at their backs, 700 Muslims face 3,000 Quraysh and 200 horsemen. The Prophet ﷺ posts 50 archers on a small hill: \"Do not leave your places, even if you see us winning.\""],
        ["التعبئة", "جعل المسلمون جبل أحد خلف ظهورهم، وهم سبعمئة في مواجهة ثلاثة آلاف من قريش معهم مئتا فارس، وأقام النبي ﷺ خمسين راميًا على جبل صغير وقال: «لا تبرحوا مكانكم وإن رأيتمونا ظهرنا عليهم»."]),
      ph(0.16, [180, -250, 1.2, 24, 60], 7.1,
        ["Le premier assaut", "Les musulmans enfoncent les lignes de Quraysh ; les porte-étendards ennemis tombent l'un après l'autre, et les archers tiennent la cavalerie à distance."],
        ["The first assault", "The Muslims break into the Quraysh lines; the enemy standard-bearers fall one after another, and the archers keep the cavalry at bay."],
        ["الجولة الأولى", "اخترق المسلمون صفوف قريش، وسقط حملة لوائها واحدًا بعد واحد، وصدّ الرماة خيلها."]),
      ph(0.32, [-50, -350, 1.5, 28, 350], 7.6,
        ["La victoire semble acquise", "Quraysh recule jusqu'à son camp. Croyant la bataille finie, quarante archers descendent prendre le butin ; dix seulement restent avec leur chef, 'Abdullah ibn Jubayr."],
        ["Victory seems won", "Quraysh falls back to its camp. Thinking the battle over, forty archers come down for the spoils; only ten stay with their leader, 'Abdullah ibn Jubayr."],
        ["النصر يلوح", "تراجعت قريش إلى معسكرها، فظن أربعون من الرماة أن المعركة انتهت فنزلوا للغنيمة، ولم يبق مع أميرهم عبد الله بن جبير إلا عشرة."]),
      ph(0.46, [-350, 100, 1.5, 32, 110], 8.2,
        ["La cavalerie contourne la colline", "Khalid ibn al-Walid voit la colline dégarnie. Ses cavaliers la contournent, tuent les derniers archers et frappent les musulmans dans le dos."],
        ["The cavalry rounds the hill", "Khalid ibn al-Walid sees the hill left bare. His horsemen ride round it, kill the last archers and strike the Muslims from behind."],
        ["الخيل تلتف حول الجبل", "رأى خالد بن الوليد الجبل وقد خلا من الرماة، فالتف بخيله حوله وقتل من بقي منهم، وهاجم المسلمين من خلفهم."]),
      ph(0.62, [200, 150, 1.1, 24, 200], 9,
        ["La confusion", "Pris entre deux fronts, les rangs se défont. La rumeur de la mort du Prophète ﷺ se répand ; son oncle Hamza tombe en martyr."],
        ["Confusion", "Caught between two fronts, the ranks break up. A rumour spreads that the Prophet ﷺ has been killed; his uncle Hamza falls as a martyr."],
        ["الاضطراب", "وقع المسلمون بين جبهتين فاضطربت صفوفهم، وشاع أن النبي ﷺ قُتل، واستشهد عمه حمزة."]),
      ph(0.84, [380, 500, 1.9, 28, 20], 10.5,
        ["Le repli sur la montagne", "Les musulmans se regroupent autour du Prophète ﷺ, blessé, sur les pentes du mont Uhud. Quraysh se retire sans marcher sur Médine. Soixante-dix musulmans sont tombés."],
        ["Withdrawal to the mountain", "The Muslims regroup around the wounded Prophet ﷺ on the slopes of Mount Uhud. Quraysh withdraws without marching on Medina. Seventy Muslims have fallen."],
        ["الانحياز إلى الجبل", "تجمّع المسلمون حول النبي ﷺ وقد جُرح، على سفح جبل أحد، وانصرفت قريش دون أن تقصد المدينة، واستشهد من المسلمين سبعون."])
    ]
  },

  khandaq: {
    origin: [39.603, 24.487], dur: 48, scale: 3,
    units: [
      { id: "MW", side: 0, type: "inf", n: 3000, sp: 6, label: LB.muslims, num: 3000, keys: [
        [0, 0, 0, 0, "path", { path: TRENCH, off: -22, depth: 14, dig: true }], [0.22, 0, 0, 0, "path", { path: TRENCH, off: -22, depth: 14, dig: true }],
        [0.27, 0, 0, 0, "path", { path: TRENCH, off: -45, depth: 10 }], [0.84, 0, 0, 0, "path", { path: TRENCH, off: -45, depth: 10 }],
        [0.93, -650, -880, 0, "camp", { spread: 1.3 }], [1, -650, -880, 0, "camp", { spread: 1.3 }]] },
      { id: "QZ", side: 1, type: "inf", n: 3700, sp: 6, w: 40, show: [0.22, 0.97], label: LB.quraysh, num: 4000, approx: true, keys: [
        [0.22, -3500, 5200, 160, "column", { w: 30 }], [0.34, -1900, 2000, 160, "camp", { spread: 1.5 }], [0.84, -1900, 2000, 160, "camp", { spread: 1.5 }],
        [0.92, -2600, 3800, 340, "rout"], [1, -3300, 5600, 340, "rout"]] },
      { id: "QZH", side: 1, type: "cav", n: 300, sp: 8, w: 12, show: [0.22, 0.97], keys: [
        [0.22, -3300, 5300, 160, "column", { w: 6 }], [0.34, -1450, 1500, 160, "block"], [0.84, -1450, 1500, 160, "block"],
        [0.92, -2200, 3300, 340, "column", { w: 6 }], [1, -2900, 5000, 340, "column", { w: 6 }]] },
      { id: "GT", side: 2, type: "inf", n: 6000, sp: 6, w: 50, show: [0.22, 0.97], label: LB.ghatafan, num: 6000, approx: true, keys: [
        [0.22, 3200, 5800, 200, "column", { w: 30 }], [0.36, 1700, 2300, 200, "camp", { spread: 1.5 }], [0.84, 1700, 2300, 200, "camp", { spread: 1.5 }],
        [0.92, 2400, 3900, 20, "rout"], [1, 3200, 5800, 20, "rout"]] },
      { id: "AM", side: 1, type: "cav", n: 5, exact: true, sp: 12, w: 5, show: [0.5, 0.8], label: LB.amr, labelP: [0.55, 0.7], keys: [
        [0.5, -900, 700, 170, "block"], [0.58, -700, -130, 180, "block"], [0.61, -700, -290, 180, "block"], [0.64, -700, -300, 180, "melee"],
        [0.7, -700, -300, 180, "melee"], [0.74, -700, -130, 0, "block"], [0.8, -800, 500, 0, "block"]], loss: [[0.67, 0.69, 1]] },
      { id: "AL", side: 0, type: "inf", n: 1, exact: true, sp: 6, show: [0.56, 0.8], keys: [
        [0.56, -700, -340, 0, "block"], [0.62, -700, -318, 0, "block"], [0.64, -704, -310, 0, "melee", { sp: 8 }], [0.7, -700, -312, 0, "melee", { sp: 8 }], [0.8, -700, -340, 0, "block"]] },
      { id: "QC", side: 1, type: "camel", n: 220, exact: true, sp: 9, show: [0.34, 0.92], keys: [[0, -2350, 2350, 0, "camp", { spread: 1.6 }], [1, -2350, 2350, 0, "camp", { spread: 1.6 }]] },
      { id: "GC", side: 2, type: "camel", n: 300, exact: true, sp: 9, show: [0.36, 0.92], keys: [[0, 2150, 2750, 0, "camp", { spread: 1.6 }], [1, 2150, 2750, 0, "camp", { spread: 1.6 }]] }
    ],
    props: [
      { type: "trench", path: TRENCH, p0: 0.02, p1: 0.24 },
      { type: "tents", at: [-650, -920], n: 40, r: 160 },
      { type: "tents", at: [-1900, 2050], n: 140, r: 420, show: [0.3, 1], blow: [0.85, 0.95] },
      { type: "tents", at: [1700, 2350], n: 160, r: 450, show: [0.34, 1], blow: [0.86, 0.96] },
      { type: "fires", at: [-1900, 2000], n: 220, r: 420, show: [0.66, 0.86] }, { type: "fires", at: [1700, 2300], n: 260, r: 460, show: [0.66, 0.86] },
      { type: "fires", path: TRENCH, off: -70, n: 90, show: [0.66, 0.86] }
    ],
    banners: [{ unit: "QZ", at: [0, 0], color: "#8c2318" }, { unit: "GT", at: [0, 0], color: "#b4651f" }],
    events: [
      { type: "arrows", from: [-1200, 120], to: [-1200, -280], spread: 200, p0: 0.42, p1: 0.56, n: 130 },
      { type: "arrows", from: [1000, 60], to: [1000, -360], spread: 200, p0: 0.43, p1: 0.56, n: 130 },
      { type: "arrows", from: [-900, -300], to: [-900, 150], spread: 200, p0: 0.44, p1: 0.56, n: 80 },
      { type: "storm", p0: 0.84, p1: 1, dir: [-1, 0.25] }
    ],
    phases: [
      ph(0, [0, -600, 4.2, 36, 0], 9.5,
        ["Creuser le fossé", "Sur le conseil de Salman le Perse, 3 000 musulmans creusent un fossé au nord de Médine, le seul côté ouvert : ailleurs, les champs de lave et les palmeraies protègent la ville. Le Prophète ﷺ creuse avec eux."],
        ["Digging the trench", "On the advice of Salman the Persian, 3,000 Muslims dig a trench north of Medina, its only open side: elsewhere lava fields and palm groves protect the city. The Prophet ﷺ digs alongside them."],
        ["حفر الخندق", "بمشورة سلمان الفارسي حفر ثلاثة آلاف من المسلمين خندقًا شمال المدينة، وهو جانبها المكشوف، أما سائر جهاتها فتحميها الحرار والنخيل، وكان النبي ﷺ يحفر معهم."]),
      ph(0.22, [0, 1100, 6.4, 38, 0], 14,
        ["L'arrivée des coalisés", "Quraysh, Ghatafan et leurs alliés arrivent : environ 10 000 hommes. Surpris par le fossé, qu'ils ne connaissaient pas, ils installent leurs camps."],
        ["The Confederates arrive", "Quraysh, Ghatafan and their allies arrive: about 10,000 men. Surprised by the trench, something unknown to them, they set up camp."],
        ["قدوم الأحزاب", "أقبلت قريش وغطفان وأحلافهما في نحو عشرة آلاف، وفوجئوا بالخندق ولم تكن العرب تعرفه، فعسكروا أمامه."]),
      ph(0.4, [-200, 0, 2.4, 28, 350], 15.5,
        ["Le siège", "Pendant près d'un mois, on échange des flèches d'un bord à l'autre. La faim, le froid et la peur pèsent sur Médine."],
        ["The siege", "For nearly a month, arrows fly from one bank to the other. Hunger, cold and fear weigh on Medina."],
        ["الحصار", "دام الحصار نحو شهر يترامى فيه الفريقان بالنبل، واشتد على أهل المدينة الجوع والبرد والخوف."]),
      ph(0.55, [-700, -150, 0.6, 22, 20], 16.2,
        ["La brèche", "Quelques cavaliers menés par 'Amr ibn Wudd franchissent le fossé à un endroit étroit. 'Ali relève le défi et le tue en duel ; les autres repassent le fossé."],
        ["The breach", "A few horsemen led by 'Amr ibn Wudd leap the trench at a narrow point. 'Ali takes up the challenge and kills him in single combat; the others cross back."],
        ["الثغرة", "اقتحم فرسان يقودهم عمرو بن ود الخندق من مكان ضيق، فبارزه علي فقتله، وفرّ الباقون."]),
      ph(0.68, [0, 700, 4.4, 32, 0], 20.5,
        ["Les nuits du siège", "Les feux des deux camps brillent au nord ; les musulmans montent la garde le long du fossé."],
        ["Nights of the siege", "The fires of the two camps glow in the north; the Muslims stand guard along the trench."],
        ["ليالي الحصار", "تتوهج نيران المعسكرين في الشمال، والمسلمون يحرسون الخندق."]),
      ph(0.84, [0, 1500, 5.2, 34, 0], 23,
        ["Le vent", "Une nuit, un vent glacial renverse les tentes, éteint les feux et emporte les marmites. Découragés, les coalisés lèvent le siège."],
        ["The wind", "One night an icy wind tears down the tents, puts out the fires and overturns the cooking pots. Disheartened, the Confederates lift the siege."],
        ["الريح", "أرسل الله في ليلة ريحًا باردة شديدة قلعت الخيام وأطفأت النيران وكفأت القدور، فرحل الأحزاب ﴿وَرَدَّ اللَّهُ الَّذِينَ كَفَرُوا بِغَيْظِهِمْ﴾."])
    ]
  },

  hunayn: {
    origin: [40.125, 21.55], dur: 42, scale: 6,
    units: [
      { id: "MU", side: 0, type: "inf", n: 10900, sp: 6, w: 22, label: LB.muslims, num: 12000, keys: [
        [0, -220, -3100, 0, "column", { w: 22 }], [0.2, -220, -1900, 0, "column", { w: 22 }], [0.3, -250, -2500, 180, "rout", { spread: 1.3 }],
        [0.42, -230, -1050, 0, "block", { w: 70 }], [0.5, -230, -1050, 0, "block", { w: 70 }], [0.62, -220, 600, 0, "melee", { w: 70 }],
        [0.74, -220, 1500, 0, "melee", { w: 70 }], [0.86, -220, 2500, 0, "scatter", { spread: 1.8 }], [1, -220, 2500, 0, "scatter", { spread: 1.8 }]] },
      { id: "VG", side: 0, type: "inf", n: 1000, sp: 6, w: 12, label: LB.vanguard, labelP: [0.12, 0.34], keys: [
        [0, -220, -1750, 0, "column", { w: 12 }], [0.2, -220, -150, 0, "column", { w: 12 }], [0.26, -200, -350, 180, "rout"], [0.34, -250, -2300, 180, "rout"],
        [0.42, -230, -950, 0, "block", { w: 30 }], [0.62, -220, 650, 0, "melee"], [0.86, -200, 2550, 0, "scatter", { spread: 1.8 }], [1, -200, 2550, 0, "scatter", { spread: 1.8 }]] },
      { id: "CORE", side: 0, type: "inf", n: 100, sp: 5, w: 10, label: LB.firm, num: 100, approx: true, labelP: [0.3, 0.46], keys: [
        [0, -220, -1700, 0, "block"], [0.2, -220, -900, 0, "block"], [0.3, -220, -900, 0, "ring", { r: 28 }], [0.44, -220, -900, 0, "ring", { r: 28 }],
        [0.5, -230, -1000, 0, "block"], [0.62, -220, 680, 0, "melee"], [1, -220, 2450, 0, "block"]] },
      { id: "HA1", side: 2, type: "arch", n: 800, sp: 6, show: [0.17, 0.72], keys: [[0, -950, -200, 90, "scatter", { spread: 2.2 }], [0.62, -950, -200, 90, "scatter", { spread: 2.2 }], [0.72, -700, 1700, 0, "rout"]] },
      { id: "HA2", side: 2, type: "arch", n: 800, sp: 6, show: [0.17, 0.72], keys: [[0, 520, -100, 270, "scatter", { spread: 2.2 }], [0.62, 520, -100, 270, "scatter", { spread: 2.2 }], [0.72, 200, 1700, 0, "rout"]] },
      { id: "HW", side: 2, type: "inf", n: 18000, sp: 6, w: 110, show: [0, 0.97], label: LB.hawazin, num: 20000, approx: true, keys: [
        [0, -220, 1900, 180, "block"], [0.22, -220, 1900, 180, "block"], [0.32, -220, 600, 180, "melee"], [0.5, -220, 500, 180, "block"],
        [0.62, -220, 1300, 180, "melee"], [0.74, -220, 1950, 0, "rout"], [0.86, -200, 3800, 0, "rout"], [1, -200, 5200, 0, "rout"]] },
      { id: "HC", side: 2, type: "camel", n: 420, exact: true, sp: 10, keys: [[0, -380, 3150, 0, "camp", { spread: 2.4 }], [1, -380, 3150, 0, "camp", { spread: 2.4 }]] },
      { id: "HS", side: 2, type: "sheep", n: 1300, exact: true, sp: 5, keys: [[0, 0, 3100, 0, "camp", { spread: 2.6 }], [1, 0, 3100, 0, "camp", { spread: 2.6 }]] }
    ],
    props: [{ type: "tents", at: [-250, 2900], n: 170, r: 520 }],
    banners: [{ unit: "CORE", at: [0, 0], color: "#f4f1e8" }, { unit: "MU", at: [0, -4], color: "#151515" }, { unit: "HW", at: [0, -4], color: "#b4651f" }],
    events: [
      { type: "arrows", from: "HA1", to: "VG", p0: 0.19, p1: 0.33, n: 260 }, { type: "arrows", from: "HA2", to: "VG", p0: 0.19, p1: 0.33, n: 260 },
      { type: "arrows", from: "HA1", to: "MU", p0: 0.24, p1: 0.4, n: 120 }
    ],
    phases: [
      ph(0, [-220, -2800, 3.6, 30, 0], 4.9,
        ["Dans l'obscurité", "12 000 musulmans, l'armée la plus nombreuse jamais réunie, entrent avant l'aube dans la vallée étroite de Hunayn. Certains se croient invincibles par leur nombre."],
        ["In the dark", "12,000 Muslims, the largest army yet assembled, enter the narrow valley of Hunayn before dawn. Some believe their numbers make them invincible."],
        ["في الغلس", "دخل اثنا عشر ألفًا من المسلمين، وهو أكبر جيش اجتمع لهم، وادي حنين الضيق قبل الفجر، وأعجبت بعضَهم كثرتُهم."]),
      ph(0.18, [-250, -400, 2.0, 26, 0], 5.5,
        ["L'embuscade", "Les archers de Hawazin, cachés sur les pentes, tirent tous ensemble. L'avant-garde se débande et reflue dans la vallée."],
        ["The ambush", "The Hawazin archers, hidden on the slopes, shoot all at once. The vanguard breaks and pours back down the valley."],
        ["الكمين", "رمى رماة هوازن المختبئون في الشعاب رمية رجل واحد، فانكشفت المقدمة وارتدت في الوادي."]),
      ph(0.36, [-230, -1250, 1.5, 24, 15], 5.9,
        ["Le ralliement", "Le Prophète ﷺ tient bon avec une poignée de compagnons. Sa voix portant loin, al-'Abbas appelle : « Ô compagnons de l'arbre ! » ; les musulmans reviennent vers lui."],
        ["The rally", "The Prophet ﷺ stands firm with a handful of companions. Al-'Abbas, whose voice carried far, calls out: \"O companions of the tree!\" and the Muslims return to him."],
        ["الثبات والنداء", "ثبت النبي ﷺ في نفر قليل، ونادى العباس وكان جهير الصوت: «يا أصحاب السمرة!» فعاد المسلمون إليه."]),
      ph(0.58, [-220, 700, 2.2, 28, 0], 6.5,
        ["La contre-attaque", "Les musulmans chargent ; Hawazin plie puis s'enfuit, abandonnant son camp."],
        ["The counter-attack", "The Muslims charge; Hawazin gives way and flees, leaving its camp behind."],
        ["الكرّة", "حمل المسلمون فانهزمت هوازن وتركت معسكرها."]),
      ph(0.82, [-220, 2700, 2.8, 32, 0], 8,
        ["Le camp abandonné", "Hawazin avait emmené ses familles et ses troupeaux : environ 24 000 chameaux et plus de 40 000 moutons et chèvres restent dans la vallée."],
        ["The abandoned camp", "Hawazin had brought its families and herds: some 24,000 camels and over 40,000 sheep and goats remain in the valley."],
        ["المعسكر المتروك", "كانت هوازن قد ساقت معها أهلها وأموالها، فبقي في الوادي نحو أربعة وعشرين ألف بعير وأكثر من أربعين ألف شاة."])
    ]
  },

  conquest: {
    origin: [39.8262, 21.4225], dur: 44, scale: 4,
    units: [
      { id: "MZ", side: 0, type: "inf", n: 10000, sp: 9, show: [0, 0.17], label: LB.army, num: 10000, keys: [[0, -13000, 21800, 140, "camp", { spread: 1.7 }], [1, -13000, 21800, 140, "camp", { spread: 1.7 }]] },
      { id: "CN", side: 0, type: "inf", n: 2500, sp: 5, w: 10, show: [0.16, 1], keys: [
        [0.16, 300, 4800, 180, "column", { w: 10 }], [0.36, 100, 900, 180, "column", { w: 10 }], [0.5, 0, 0, 0, "annulus", { r0: 80, r1: 430, a0: 0, a1: 0.25 }], [1, 0, 0, 0, "annulus", { r0: 80, r1: 430, a0: 0, a1: 0.25 }]] },
      { id: "CE", side: 0, type: "inf", n: 2500, sp: 5, w: 10, show: [0.16, 1], keys: [
        [0.16, 3600, 3200, 225, "column", { w: 10 }], [0.36, 650, 520, 225, "column", { w: 10 }], [0.5, 0, 0, 0, "annulus", { r0: 80, r1: 430, a0: 0.25, a1: 0.5 }], [1, 0, 0, 0, "annulus", { r0: 80, r1: 430, a0: 0.25, a1: 0.5 }]] },
      { id: "CW", side: 0, type: "inf", n: 2500, sp: 5, w: 10, show: [0.16, 1], keys: [
        [0.16, -4200, 400, 90, "column", { w: 10 }], [0.36, -820, 100, 90, "column", { w: 10 }], [0.5, 0, 0, 0, "annulus", { r0: 80, r1: 430, a0: 0.5, a1: 0.75 }], [1, 0, 0, 0, "annulus", { r0: 80, r1: 430, a0: 0.5, a1: 0.75 }]] },
      { id: "CS", side: 0, type: "inf", n: 2500, sp: 5, w: 10, show: [0.16, 1], keys: [
        [0.16, 600, -4700, 0, "column", { w: 10 }], [0.32, 230, -2100, 0, "column", { w: 10 }], [0.38, 200, -1750, 0, "melee", { w: 30 }], [0.44, 120, -1000, 0, "column", { w: 10 }],
        [0.54, 0, 0, 0, "annulus", { r0: 80, r1: 430, a0: 0.75, a1: 1 }], [1, 0, 0, 0, "annulus", { r0: 80, r1: 430, a0: 0.75, a1: 1 }]] },
      { id: "QX", side: 1, type: "inf", n: 40, exact: true, sp: 5, w: 10, show: [0.28, 0.48], label: LB.band, labelP: [0.3, 0.44], keys: [
        [0.28, 150, -1520, 180, "block"], [0.36, 180, -1690, 180, "melee"], [0.42, 200, -1720, 180, "melee"], [0.48, 600, -1250, 70, "rout"]], loss: [[0.37, 0.43, 12]] }
    ],
    props: [
      { type: "fires", at: [-13000, 21800], n: 2400, r: 1500, show: [0, 0.18] },
      { type: "idols", r: 26, n: 360, fall: [0.6, 0.78] }
    ],
    banners: [{ unit: "CN", at: [0, -4], color: "#151515" }, { unit: "CE", at: [0, -4], color: "#f4f1e8" }, { unit: "CW", at: [0, -4], color: "#f4f1e8" }, { unit: "CS", at: [0, -4], color: "#151515" }],
    events: [],
    phases: [
      ph(0, [-13000, 21800, 9, 30, 140], 21.5,
        ["Dix mille feux", "La veille, l'armée campe à Marr az-Zahran. Chaque homme allume un feu : de La Mecque, Quraysh découvre une plaine illuminée."],
        ["Ten thousand fires", "The night before, the army camps at Marr az-Zahran. Every man lights a fire: from Mecca, Quraysh sees a plain ablaze with light."],
        ["عشرة آلاف نار", "عسكر الجيش ليلةً بمرّ الظهران، وأوقد كل رجل نارًا، فرأت قريش الوادي يتلألأ بالنيران."]),
      ph(0.18, [0, 0, 7.5, 42, 0], 6.8,
        ["Quatre colonnes", "À l'aube, l'armée entre dans La Mecque par quatre côtés à la fois. L'ordre est de ne combattre que celui qui attaque."],
        ["Four columns", "At dawn the army enters Mecca from four sides at once. The order is to fight only those who attack."],
        ["أربع كتائب", "دخل الجيش مكة من جهاتها الأربع، وأُمر ألا يقاتل إلا من قاتله."]),
      ph(0.34, [250, -1650, 1.4, 26, 10], 7.8,
        ["Presque sans combat", "Seule la colonne de Khalid ibn al-Walid, au sud, est accrochée par un petit groupe. Partout ailleurs la ville se rend : est en sécurité qui entre chez Abu Sufyan, reste chez lui ou entre dans la Mosquée sacrée."],
        ["Almost without a fight", "Only Khalid ibn al-Walid's column, in the south, meets a small band. Everywhere else the city surrenders: whoever enters Abu Sufyan's house, stays at home or enters the Sacred Mosque is safe."],
        ["بلا قتال يُذكر", "لم يلقَ قتالًا إلا خالد بن الوليد في جنوب مكة من نفر قليل، واستسلمت المدينة: «من دخل دار أبي سفيان فهو آمن، ومن أغلق بابه فهو آمن، ومن دخل المسجد فهو آمن»."]),
      ph(0.56, [0, 0, 0.5, 26, 200], 9,
        ["Les idoles tombent", "Le Prophète ﷺ fait le tour de la Ka'ba et abat les 360 idoles qui l'entourent, en récitant : « La vérité est venue et le faux a disparu » (17:81)."],
        ["The idols fall", "The Prophet ﷺ circles the Ka'ba and brings down the 360 idols around it, reciting: \"Truth has come and falsehood has vanished\" (17:81)."],
        ["سقوط الأصنام", "طاف النبي ﷺ بالكعبة وحولها ثلاثمئة وستون صنمًا، فجعل يطعنها وهو يقرأ: ﴿جَاءَ الْحَقُّ وَزَهَقَ الْبَاطِلُ﴾ (الإسراء: ٨١)."]),
      ph(0.8, [0, 0, 1.6, 34, 330], 10.5,
        ["Le pardon", "Devant les Mecquois rassemblés, qui l'avaient combattu pendant vingt ans, il déclare : « Allez, vous êtes libres. »"],
        ["Forgiveness", "Before the assembled Meccans, who had fought him for twenty years, he declares: \"Go, you are free.\""],
        ["العفو", "قال لأهل مكة وقد اجتمعوا، وهم الذين حاربوه عشرين سنة: «اذهبوا فأنتم الطلقاء»."])
    ]
  },

  farewell: {
    origin: [39.9845, 21.3535], dur: 34, scale: 20,
    units: [
      { id: "PL", side: 3, type: "inf", n: 100000, sp: 9, w: 60, label: L("Pèlerins", "Pilgrims", "الحجاج"), num: 100000, approx: true, keys: [
        [0, -2600, 1900, 135, "column", { w: 60 }], [0.12, -1500, 1100, 135, "camp", { spread: 1.4 }], [0.36, 0, 221, 0, "annulus", { r0: 190, r1: 950 }], [1, 0, 221, 0, "annulus", { r0: 190, r1: 950 }]] },
      { id: "CM", side: 3, type: "camel", n: 320, exact: true, sp: 10, keys: [[0, -2500, 2000, 135, "column", { w: 8 }], [0.36, 0, 221, 0, "annulus", { r0: 950, r1: 1250 }], [1, 0, 221, 0, "annulus", { r0: 950, r1: 1250 }]] }
    ],
    props: [{ type: "mound", at: [0, 221], r: 170, h: 34 }, { type: "tents", at: [0, 221], n: 420, r: 1300, white: true, show: [0.28, 1] }],
    banners: [],
    events: [],
    phases: [
      ph(0, [-1200, 900, 3.6, 30, 135], 9,
        ["Vers 'Arafat", "Au matin du 9 Dhu l-Hijja de l'an 10, plus de 100 000 pèlerins quittent Mina pour la plaine de 'Arafat. C'est l'unique pèlerinage du Prophète ﷺ."],
        ["Towards 'Arafat", "On the morning of 9 Dhu l-Hijja in year 10, more than 100,000 pilgrims leave Mina for the plain of 'Arafat. It is the Prophet's ﷺ only pilgrimage."],
        ["إلى عرفات", "في صباح التاسع من ذي الحجة سنة عشر، خرج أكثر من مئة ألف حاج من منى إلى عرفات، وهي حجة النبي ﷺ الوحيدة."]),
      ph(0.36, [0, 221, 2.4, 28, 200], 13,
        ["Le sermon d'adieu", "Du haut de sa chamelle, le Prophète ﷺ s'adresse à la foule : « Vos vies, vos biens et votre honneur vous sont sacrés… Nul Arabe n'a de supériorité sur un non-Arabe, si ce n'est par la piété. »"],
        ["The farewell sermon", "From his camel, the Prophet ﷺ addresses the crowd: \"Your lives, your property and your honour are sacred to you… No Arab has superiority over a non-Arab, except by piety.\""],
        ["خطبة الوداع", "خطب النبي ﷺ الناس على ناقته: «إن دماءكم وأموالكم وأعراضكم عليكم حرام… لا فضل لعربي على أعجمي إلا بالتقوى»."]),
      ph(0.62, [0, 221, 1.0, 22, 250], 15.5,
        ["Le mont de la Miséricorde", "Les pèlerins se tiennent dans la plaine jusqu'au coucher du soleil, en invocations. « Le pèlerinage, c'est 'Arafat. »"],
        ["The Mount of Mercy", "The pilgrims stand on the plain until sunset, in supplication. \"Hajj is 'Arafat.\""],
        ["جبل الرحمة", "وقف الحجاج في عرفات يدعون حتى غروب الشمس، و«الحج عرفة»."]),
      ph(0.82, [0, 221, 3.2, 26, 280], 17.9,
        ["La religion parachevée", "Ce jour-là est révélé le verset : « Aujourd'hui, J'ai parachevé pour vous votre religion » (5:3). Quelques mois plus tard, le Prophète ﷺ s'éteint à Médine."],
        ["Religion perfected", "That day the verse is revealed: \"Today I have perfected your religion for you\" (5:3). A few months later, the Prophet ﷺ passes away in Medina."],
        ["إكمال الدين", "في ذلك اليوم نزل قوله تعالى: ﴿الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ﴾ (المائدة: ٣)، وبعد أشهر توفي النبي ﷺ في المدينة."])
    ]
  },

  hudaybiyya: {
    origin: [39.62, 21.44], dur: 38, scale: 1,
    units: [
      { id: "PL", side: 3, type: "inf", n: 1400, sp: 5, w: 14, label: LB.pilgrims, num: 1400, keys: [
        [0, -2500, 800, 110, "column", { w: 14 }], [0.25, -200, 100, 110, "camp", { spread: 1.5 }], [0.5, -200, 100, 110, "camp", { spread: 1.5 }],
        [0.62, 40, 20, 0, "annulus", { r0: 22, r1: 175 }], [0.8, 40, 20, 0, "annulus", { r0: 22, r1: 175 }], [1, -150, 80, 0, "camp", { spread: 1.5 }]] },
      { id: "CM", side: 3, type: "camel", n: 70, exact: true, sp: 8, label: LB.camels, num: 70, labelP: [0.2, 0.5], keys: [
        [0, -2560, 960, 110, "column", { w: 3 }], [0.25, -480, 260, 110, "camp", { spread: 1.3 }], [1, -480, 260, 110, "camp", { spread: 1.3 }]] }
    ],
    props: [{ type: "tree", at: [40, 20], s: 2.6 }],
    banners: [],
    events: [],
    phases: [
      ph(0, [-1300, 500, 2.2, 28, 110], 9,
        ["En pèlerinage", "1 400 musulmans en état de sacralisation (ihram) quittent Médine pour la 'umra, avec 70 chameaux destinés au sacrifice. Ils n'ont que leurs épées au fourreau."],
        ["On pilgrimage", "1,400 Muslims in the state of ihram leave Medina for the 'umra, with 70 camels for sacrifice. They carry only sheathed swords."],
        ["قاصدين العمرة", "خرج ألف وأربعمئة من المسلمين محرمين بالعمرة، يسوقون سبعين بدنة للهدي، ليس معهم إلا السيوف في القُرُب."]),
      ph(0.28, [-200, 100, 1.6, 28, 90], 11,
        ["Arrêtés à al-Hudaybiyya", "Quraysh leur barre la route. La chamelle du Prophète ﷺ s'agenouille à al-Hudaybiyya, à la limite du territoire sacré ; des messagers vont et viennent."],
        ["Halted at al-Hudaybiyya", "Quraysh bars their way. The Prophet's ﷺ camel kneels at al-Hudaybiyya, on the edge of the sacred territory; envoys come and go."],
        ["عند الحديبية", "صدّتهم قريش، وبركت ناقة النبي ﷺ بالحديبية على حدود الحرم، وتتابعت الرسل بين الفريقين."]),
      ph(0.52, [40, 20, 0.5, 22, 120], 14,
        ["Le serment sous l'arbre", "Quand la rumeur dit 'Uthman tué à La Mecque, les compagnons prêtent serment sous un arbre : c'est le serment d'ar-Ridwan, que mentionne le Coran (48:18)."],
        ["The pledge under the tree", "When rumour says 'Uthman has been killed in Mecca, the companions pledge themselves under a tree: the Pledge of Ridwan, mentioned in the Qur'an (48:18)."],
        ["بيعة الرضوان", "لما شاع أن عثمان قُتل بمكة بايع الصحابة تحت الشجرة بيعة الرضوان: ﴿لَّقَدْ رَضِيَ اللَّهُ عَنِ الْمُؤْمِنِينَ إِذْ يُبَايِعُونَكَ تَحْتَ الشَّجَرَةِ﴾."]),
      ph(0.78, [-100, 60, 1.3, 28, 60], 16,
        ["Le traité", "Une trêve de dix ans est conclue. Elle semble défavorable aux musulmans, mais le Coran l'appelle « une victoire éclatante » : dans les deux années qui suivent, plus de gens embrassent l'islam qu'auparavant."],
        ["The treaty", "A ten-year truce is concluded. It seems unfavourable to the Muslims, but the Qur'an calls it \"a clear victory\": in the two years that follow, more people embrace Islam than ever before."],
        ["الصلح", "عُقد صلح مدته عشر سنين، بدا في ظاهره مجحفًا بالمسلمين، وسماه القرآن ﴿فَتْحًا مُّبِينًا﴾، فدخل في الإسلام في السنتين التاليتين أكثر ممن دخله قبل ذلك."])
    ]
  }
};
