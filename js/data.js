/* Contenu de la Sira — trilingue (fr / en / ar).
   Dates : années grégoriennes approximatives selon les sources classiques
   (Ibn Hisham, Ibn Sa'd, al-Mubarakpuri). Les âges suivent le calendrier lunaire,
   comme dans la tradition. Lorsque les savants divergent, le texte le signale. */

const SIRA = (window.SIRA = {});

/* Les trois grandes périodes de la vie du Prophète ﷺ */
SIRA.periods = [
  { id: "early",  from: 570, to: 610,
    fr: "Avant la révélation", en: "Before the revelation", ar: "قبل البعثة" },
  { id: "mecca",  from: 610, to: 622,
    fr: "La période mecquoise", en: "The Meccan period", ar: "العهد المكي" },
  { id: "medina", from: 622, to: 632,
    fr: "La période médinoise", en: "The Medinan period", ar: "العهد المدني" }
];

/* Événements.
   year : année grégorienne (début) ; end : fin éventuelle
   ah : année de l'Hégire (négatif = années avant l'Hégire)
   age : âge du Prophète ﷺ (lunaire, approximatif)
   icon : symbole SVG ; route / place : liens vers la carte */
SIRA.events = [
  {
    id: "birth", year: 570, ah: -53, age: "0", period: "early", icon: "star", place: "mecca",
    fr: {
      title: "Naissance à La Mecque",
      summary: "L'Année de l'Éléphant, Muhammad ﷺ naît dans le clan des Banu Hashim, de la tribu de Quraysh.",
      details: "Il naît un lundi du mois de Rabi' al-Awwal (le 12 selon l'avis le plus répandu). Son père 'Abdullah est mort quelques mois avant sa naissance, à Yathrib. Son grand-père 'Abd al-Muttalib, chef respecté de La Mecque, le porte jusqu'à la Ka'ba et lui donne le nom de Muhammad, « celui qui est loué ». La même année, l'armée d'Abraha, venue du Yémen avec des éléphants pour détruire la Ka'ba, avait été anéantie (sourate al-Fil)."
    },
    en: {
      title: "Birth in Mecca",
      summary: "In the Year of the Elephant, Muhammad ﷺ is born into the clan of Banu Hashim, of the tribe of Quraysh.",
      details: "He was born on a Monday in the month of Rabi' al-Awwal (the 12th according to the most widespread view). His father 'Abdullah had died a few months earlier, in Yathrib. His grandfather 'Abd al-Muttalib, a respected leader of Mecca, carried him to the Ka'ba and named him Muhammad, \"the praised one\". That same year, the army of Abraha, which had come from Yemen with elephants to destroy the Ka'ba, was destroyed (Surat al-Fil)."
    },
    ar: {
      title: "المولد في مكة",
      summary: "في عام الفيل، وُلد محمد ﷺ في بني هاشم من قبيلة قريش.",
      details: "وُلد يوم الاثنين من شهر ربيع الأول (في الثاني عشر منه على القول المشهور). وكان أبوه عبد الله قد توفي قبل مولده بأشهر في يثرب. فحمله جده عبد المطلب سيد مكة إلى الكعبة وسمّاه محمدًا. وفي العام نفسه أهلك الله جيش أبرهة الذي جاء من اليمن بالفيلة ليهدم الكعبة (سورة الفيل)."
    }
  },
  {
    id: "halima", year: 570, end: 574, ah: -53, age: "0–4", period: "early", icon: "tent",
    fr: {
      title: "Dans le désert, chez Halima",
      summary: "Confié à la nourrice Halima as-Sa'diyya, il grandit parmi les Banu Sa'd, dans l'air pur du désert.",
      details: "Selon la coutume des familles de La Mecque, le nourrisson est confié à une famille bédouine. Halima et son mari voient leur maison bénie dès son arrivée : leur chamelle donne à nouveau du lait, leurs bêtes prospèrent. Il apprend la langue arabe la plus pure. C'est là qu'eut lieu l'ouverture de sa poitrine (charh as-sadr) par deux anges, avant qu'il ne retourne auprès de sa mère Amina."
    },
    en: {
      title: "In the desert, with Halima",
      summary: "Entrusted to the wet-nurse Halima as-Sa'diyya, he grows up among the Banu Sa'd, in the clean air of the desert.",
      details: "Following the custom of Meccan families, the infant was entrusted to a Bedouin family. Halima and her husband saw their home blessed from the day he arrived: their she-camel gave milk again and their flocks prospered. He learned the purest Arabic. It was there that the opening of his chest (sharh as-sadr) by two angels took place, before he returned to his mother Amina."
    },
    ar: {
      title: "في البادية عند حليمة",
      summary: "استُرضع في بني سعد عند حليمة السعدية، فنشأ في هواء البادية النقي.",
      details: "جريًا على عادة أهل مكة، دُفع الرضيع إلى مرضعة من البادية. فرأت حليمة وزوجها البركة في بيتهما منذ قدومه: درّت ناقتهما وسمنت غنمهما. وتعلّم هناك أفصح العربية. وفي بني سعد كانت حادثة شق الصدر، ثم رُدّ إلى أمه آمنة."
    }
  },
  {
    id: "amina", year: 576, ah: -47, age: "6", period: "early", icon: "crescent", place: "abwa",
    fr: {
      title: "Décès de sa mère Amina",
      summary: "Au retour d'une visite à Yathrib, sa mère meurt à al-Abwa'. Il est orphelin à six ans.",
      details: "Amina avait emmené son fils voir ses oncles maternels des Banu an-Najjar à Yathrib, et la tombe de son père. Sur le chemin du retour, elle tombe malade et meurt à al-Abwa'. La fidèle servante Umm Ayman (Baraka) ramène l'enfant à La Mecque, où son grand-père 'Abd al-Muttalib le prend sous sa protection et l'entoure d'une affection particulière."
    },
    en: {
      title: "Death of his mother Amina",
      summary: "Returning from a visit to Yathrib, his mother dies at al-Abwa'. He is an orphan at six.",
      details: "Amina had taken her son to see his maternal relatives, the Banu an-Najjar of Yathrib, and his father's grave. On the way back she fell ill and died at al-Abwa'. The faithful Umm Ayman (Baraka) brought the child back to Mecca, where his grandfather 'Abd al-Muttalib took him in and surrounded him with special affection."
    },
    ar: {
      title: "وفاة أمه آمنة",
      summary: "في طريق العودة من يثرب توفيت أمه بالأبواء، فصار يتيم الأبوين وهو ابن ست سنين.",
      details: "خرجت به آمنة إلى أخواله بني النجار في يثرب وزارت قبر أبيه. وفي طريق العودة مرضت وتوفيت بالأبواء. فرجعت به أم أيمن بركة إلى مكة، فكفله جده عبد المطلب وأحاطه بعطف خاص."
    }
  },
  {
    id: "grandfather", year: 578, ah: -45, age: "8", period: "early", icon: "crescent", place: "mecca",
    fr: {
      title: "Sous la protection d'Abu Talib",
      summary: "Son grand-père 'Abd al-Muttalib meurt. Son oncle Abu Talib le prend chez lui.",
      details: "Avant de mourir, 'Abd al-Muttalib confie l'enfant à Abu Talib, frère de son père 'Abdullah. Abu Talib, de condition modeste mais très respecté, l'aime comme ses propres enfants et le protégera toute sa vie. Le jeune Muhammad ﷺ garde les moutons des Mecquois contre quelques pièces : « Il n'est pas un prophète qui n'ait gardé des moutons », dira-t-il plus tard."
    },
    en: {
      title: "In the care of Abu Talib",
      summary: "His grandfather 'Abd al-Muttalib dies. His uncle Abu Talib takes him into his home.",
      details: "Before his death, 'Abd al-Muttalib entrusted the child to Abu Talib, the brother of his father 'Abdullah. Abu Talib, of modest means but highly respected, loved him like his own children and protected him all his life. Young Muhammad ﷺ tended the sheep of the Meccans for a small wage: \"There is no prophet who did not tend sheep,\" he later said."
    },
    ar: {
      title: "في كفالة أبي طالب",
      summary: "توفي جده عبد المطلب، فكفله عمه أبو طالب.",
      details: "أوصى عبد المطلب قبل موته بالصبي إلى أبي طالب شقيق أبيه عبد الله. وكان أبو طالب قليل المال عظيم المكانة، فأحبه كأولاده وحماه طوال حياته. ورعى محمد ﷺ الغنم لأهل مكة على قراريط، وقال بعد ذلك: «ما بعث الله نبيًا إلا رعى الغنم»."
    }
  },
  {
    id: "bahira", year: 582, ah: -41, age: "12", period: "early", icon: "caravan", place: "bosra", route: "syria",
    fr: {
      title: "La caravane de Syrie et le moine Bahira",
      summary: "Il accompagne Abu Talib en Syrie. À Bosra, le moine Bahira reconnaît en lui les signes d'un futur prophète.",
      details: "Lors d'un voyage commercial vers le Cham, la caravane fait halte près de Bosra. Le moine chrétien Bahira, qui d'habitude ignorait les voyageurs, les invite à un repas. Il observe l'enfant, l'interroge, et voit entre ses épaules le sceau de la prophétie. Il conseille à Abu Talib de le ramener vite à La Mecque et de veiller sur lui."
    },
    en: {
      title: "The Syrian caravan and the monk Bahira",
      summary: "He travels with Abu Talib to Syria. At Bosra, the monk Bahira recognises in him the signs of a future prophet.",
      details: "On a trading journey to Sham, the caravan stopped near Bosra. The Christian monk Bahira, who usually ignored travellers, invited them to a meal. He watched the boy, questioned him, and saw between his shoulders the seal of prophethood. He advised Abu Talib to take him back to Mecca quickly and to watch over him."
    },
    ar: {
      title: "رحلة الشام والراهب بحيرا",
      summary: "خرج مع عمه أبي طالب في تجارة إلى الشام، فعرف فيه الراهب بحيرا في بُصرى علامات النبوة.",
      details: "نزل الركب قرب بصرى، فصنع لهم الراهب بحيرا طعامًا ولم يكن يفعل ذلك. فجعل ينظر إلى الغلام ويسأله، ورأى خاتم النبوة بين كتفيه، فنصح أبا طالب أن يرجع به إلى بلده ويحذر عليه."
    }
  },
  {
    id: "fudul", year: 590, ah: -32, age: "20", period: "early", icon: "rings", place: "mecca",
    fr: {
      title: "Le pacte des vertueux (Hilf al-Fudul)",
      summary: "Il participe à une alliance des clans de Quraysh pour défendre toute personne opprimée à La Mecque.",
      details: "Après qu'un marchand yéménite a été spolié par un notable mecquois, plusieurs clans se réunissent dans la maison de 'Abdullah ibn Jud'an. Ils jurent de prendre le parti de l'opprimé, quel qu'il soit, jusqu'à ce que justice lui soit rendue. Des années plus tard, le Prophète ﷺ dira : « Si l'on m'y appelait aujourd'hui en Islam, je répondrais. »"
    },
    en: {
      title: "The Pact of the Virtuous (Hilf al-Fudul)",
      summary: "He takes part in an alliance of Quraysh clans to defend anyone wronged in Mecca.",
      details: "After a Yemeni merchant was cheated by a Meccan notable, several clans gathered in the house of 'Abdullah ibn Jud'an. They swore to side with the wronged, whoever they were, until justice was done. Years later the Prophet ﷺ said: \"If I were called to it today in Islam, I would answer.\""
    },
    ar: {
      title: "حلف الفضول",
      summary: "شهد حلفًا بين بطون قريش على نصرة كل مظلوم في مكة.",
      details: "بعد أن ظلم أحدُ وجهاء مكة تاجرًا من زبيد، اجتمعت بطون من قريش في دار عبد الله بن جدعان، فتعاهدوا أن يكونوا مع المظلوم حتى يُردّ إليه حقه. وقال النبي ﷺ بعد ذلك: «لو أُدعى به في الإسلام لأجبت»."
    }
  },
  {
    id: "khadija", year: 595, ah: -27, age: "25", period: "early", icon: "rings", place: "mecca",
    fr: {
      title: "Mariage avec Khadija",
      summary: "Connu comme al-Amin, « le digne de confiance », il épouse Khadija bint Khuwaylid, une commerçante respectée.",
      details: "Khadija lui confie une caravane vers la Syrie. Son honnêteté et les bénéfices du voyage la touchent ; c'est elle qui propose le mariage. Elle a environ quarante ans selon l'avis le plus connu. Ils vivront vingt-cinq ans ensemble, dans l'amour et la fidélité. Tous ses enfants, sauf Ibrahim, naîtront de cette union."
    },
    en: {
      title: "Marriage to Khadija",
      summary: "Known as al-Amin, \"the trustworthy\", he marries Khadija bint Khuwaylid, a respected merchant.",
      details: "Khadija entrusted him with a caravan to Syria. His honesty and the profit of the journey moved her, and she proposed marriage. She was about forty according to the best-known view. They lived together for twenty-five years in love and loyalty. All his children except Ibrahim were born of this union."
    },
    ar: {
      title: "الزواج من خديجة",
      summary: "عُرف بالأمين، فتزوج خديجة بنت خويلد، التاجرة ذات الشرف والمال.",
      details: "خرج في تجارة لخديجة إلى الشام، فأعجبها صدقه وأمانته وربح تجارته، فعرضت عليه الزواج. وكانت في الأربعين على المشهور. وعاشا معًا خمسًا وعشرين سنة في مودة ووفاء، ورُزق منها أولاده كلهم إلا إبراهيم."
    }
  },
  {
    id: "kaaba", year: 605, ah: -17, age: "35", period: "early", icon: "kaaba", place: "mecca",
    fr: {
      title: "La reconstruction de la Ka'ba",
      summary: "Il évite une guerre entre les clans en replaçant la Pierre noire de façon que tous y participent.",
      details: "Après une crue qui a fragilisé la Ka'ba, Quraysh la reconstruit. Au moment de remettre la Pierre noire, chaque clan veut cet honneur et les armes sont près d'être tirées. On décide de suivre l'avis du premier qui entrera : c'est Muhammad ﷺ. Il pose la pierre sur un manteau, demande à chaque chef d'en tenir un bord, puis la place lui-même."
    },
    en: {
      title: "Rebuilding the Ka'ba",
      summary: "He prevents a war between the clans by setting the Black Stone so that all can share in the honour.",
      details: "After a flood weakened the Ka'ba, Quraysh rebuilt it. When the Black Stone had to be put back, every clan wanted the honour and swords were nearly drawn. They agreed to follow the judgement of the first man to enter: it was Muhammad ﷺ. He laid the stone on a cloak, had each chief hold an edge, then set it in place himself."
    },
    ar: {
      title: "بناء الكعبة",
      summary: "حال دون حرب بين القبائل حين وضع الحجر الأسود بطريقة أشركت الجميع في الشرف.",
      details: "جددت قريش بناء الكعبة بعد سيل أصدعها. ولما بلغوا موضع الحجر الأسود اختصموا فيمن يضعه حتى كادوا يقتتلون، فاتفقوا على تحكيم أول داخل، فكان محمدًا ﷺ. فبسط رداءه ووضع الحجر فيه، وأمر كل قبيلة أن تأخذ بطرف منه، ثم وضعه بيده."
    }
  },
  {
    id: "revelation", year: 610, ah: -13, age: "40", period: "mecca", icon: "cave", place: "mecca",
    fr: {
      title: "La première révélation",
      summary: "Dans la grotte de Hira, l'ange Jibril lui apporte les premiers versets : « Lis, au nom de ton Seigneur qui a créé. »",
      details: "Il aimait se retirer pour méditer dans la grotte de Hira, sur le Jabal an-Nour. Une nuit du mois de Ramadan, l'ange Jibril (Gabriel) lui apparaît et lui fait réciter les premiers versets de la sourate al-'Alaq. Bouleversé, il rentre auprès de Khadija qui le rassure : « Par Dieu, Dieu ne t'humiliera jamais. » Elle est la première à croire en lui, suivie de 'Ali, d'Abu Bakr et de Zayd ibn Haritha."
    },
    en: {
      title: "The first revelation",
      summary: "In the cave of Hira, the angel Jibril brings him the first verses: \"Read, in the name of your Lord who created.\"",
      details: "He liked to withdraw to meditate in the cave of Hira, on Jabal an-Nour. One night in Ramadan, the angel Jibril (Gabriel) appeared and had him recite the first verses of Surat al-'Alaq. Shaken, he returned to Khadija, who reassured him: \"By God, God will never disgrace you.\" She was the first to believe in him, followed by 'Ali, Abu Bakr and Zayd ibn Haritha."
    },
    ar: {
      title: "بدء الوحي",
      summary: "في غار حراء نزل عليه جبريل بأول آيات: «اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ».",
      details: "كان يحب الخلوة والتعبد في غار حراء بجبل النور. وفي ليلة من رمضان جاءه جبريل فأقرأه أول سورة العلق. فرجع إلى خديجة يرجف فؤاده، فقالت: «كلا والله ما يخزيك الله أبدًا». فكانت أول من آمن به، ثم علي وأبو بكر وزيد بن حارثة."
    }
  },
  {
    id: "public", year: 613, ah: -10, age: "43", period: "mecca", icon: "mountain", place: "mecca",
    fr: {
      title: "L'appel public",
      summary: "Après trois ans de prédication discrète, il appelle ouvertement Quraysh depuis la colline d'as-Safa.",
      details: "Sur l'ordre divin « Avertis tes proches parents » (26:214), il monte sur as-Safa et appelle les clans. L'opposition grandit, menée par Abu Lahab et Abu Jahl. Les plus faibles des croyants sont persécutés : Bilal est torturé sous le soleil, la famille de Yasir martyrisée — Sumayya devient la première martyre de l'Islam."
    },
    en: {
      title: "The public call",
      summary: "After three years of quiet preaching, he openly calls Quraysh from the hill of as-Safa.",
      details: "Following the divine command \"Warn your nearest kin\" (26:214), he climbed as-Safa and called the clans. Opposition grew, led by Abu Lahab and Abu Jahl. The weakest believers were persecuted: Bilal was tortured under the sun and the family of Yasir was martyred — Sumayya became the first martyr of Islam."
    },
    ar: {
      title: "الجهر بالدعوة",
      summary: "بعد ثلاث سنين من الدعوة السرية، صعد الصفا ونادى بطون قريش جهرًا.",
      details: "لما نزل قوله تعالى «وَأَنذِرْ عَشِيرَتَكَ الْأَقْرَبِينَ» صعد الصفا ونادى بطون قريش. فاشتدت المعارضة بقيادة أبي لهب وأبي جهل، وعُذّب المستضعفون: بلال تحت حر الشمس، وآل ياسر حتى استشهدت سمية أول شهيدة في الإسلام."
    }
  },
  {
    id: "abyssinia", year: 615, ah: -8, age: "45", period: "mecca", icon: "ship", place: "aksum", route: "abyssinia",
    fr: {
      title: "L'émigration en Abyssinie",
      summary: "Des musulmans persécutés traversent la mer Rouge et trouvent refuge auprès du Négus, roi chrétien juste.",
      details: "Le Prophète ﷺ conseille aux siens de partir vers l'Abyssinie, « où règne un roi auprès de qui personne n'est opprimé ». Un premier groupe part la cinquième année de la prophétie, suivi d'un second de plus de quatre-vingts personnes. Quraysh envoie 'Amr ibn al-'As les réclamer. Ja'far ibn Abi Talib récite devant le Négus le début de la sourate Maryam ; le roi pleure et refuse de livrer les réfugiés."
    },
    en: {
      title: "The migration to Abyssinia",
      summary: "Persecuted Muslims cross the Red Sea and find refuge with the Negus, a just Christian king.",
      details: "The Prophet ﷺ advised his followers to go to Abyssinia, \"where there is a king under whom no one is wronged\". A first group left in the fifth year of prophethood, followed by a second of more than eighty people. Quraysh sent 'Amr ibn al-'As to bring them back. Ja'far ibn Abi Talib recited the opening of Surat Maryam before the Negus; the king wept and refused to hand the refugees over."
    },
    ar: {
      title: "الهجرة إلى الحبشة",
      summary: "عبر المستضعفون البحر الأحمر فوجدوا الأمان عند النجاشي، الملك النصراني العادل.",
      details: "قال لهم النبي ﷺ: «إن بأرض الحبشة ملكًا لا يُظلم عنده أحد». فهاجرت طائفة في السنة الخامسة من البعثة، ثم هجرة ثانية زاد عددها على الثمانين. وأرسلت قريش عمرو بن العاص ليردهم، فقرأ جعفر بن أبي طالب على النجاشي صدر سورة مريم، فبكى ورفض تسليمهم."
    }
  },
  {
    id: "boycott", year: 617, end: 619, ah: -6, age: "47–49", period: "mecca", icon: "chain", place: "mecca",
    fr: {
      title: "Le boycott dans le vallon d'Abu Talib",
      summary: "Quraysh impose un boycott total aux Banu Hashim : trois années de faim dans le vallon (chi'b) d'Abu Talib.",
      details: "Un document affiché dans la Ka'ba interdit de commercer avec les Banu Hashim et les Banu al-Muttalib, de se marier avec eux, de les fréquenter. Musulmans et non-musulmans du clan endurent la faim. Le boycott prend fin quand des Mecquois honteux décident de le rompre ; on découvre que les termites ont rongé le document, à l'exception des mots « En Ton nom, ô Allah »."
    },
    en: {
      title: "The boycott in the valley of Abu Talib",
      summary: "Quraysh imposes a total boycott on Banu Hashim: three years of hunger in the valley (shi'b) of Abu Talib.",
      details: "A document hung inside the Ka'ba banned all trade, marriage and dealings with Banu Hashim and Banu al-Muttalib. Muslims and non-Muslims of the clan suffered hunger together. The boycott ended when ashamed Meccans decided to break it; the document was found eaten by termites, except for the words \"In Your name, O Allah\"."
    },
    ar: {
      title: "حصار الشِّعب",
      summary: "قاطعت قريش بني هاشم مقاطعة شاملة، فحوصروا ثلاث سنين في شعب أبي طالب.",
      details: "علّقت قريش صحيفة في جوف الكعبة تمنع البيع والزواج والمخالطة مع بني هاشم وبني المطلب، فجاعوا مسلمهم وكافرهم. وانتهى الحصار حين قام نفر من قريش بنقض الصحيفة، فوُجدت الأرضة قد أكلتها إلا «باسمك اللهم»."
    }
  },
  {
    id: "sorrow", year: 619, ah: -3, age: "49", period: "mecca", icon: "crescent", place: "mecca",
    fr: {
      title: "L'Année de la tristesse",
      summary: "En peu de temps, il perd son oncle protecteur Abu Talib et son épouse bien-aimée Khadija.",
      details: "La dixième année de la prophétie, Abu Talib meurt, puis Khadija quelques semaines ou mois plus tard. Le Prophète ﷺ perd à la fois son soutien social et son soutien intime. Cette année est appelée 'Am al-Huzn, l'Année de la tristesse. Il restera fidèle toute sa vie au souvenir de Khadija."
    },
    en: {
      title: "The Year of Sorrow",
      summary: "Within a short time he loses his protecting uncle Abu Talib and his beloved wife Khadija.",
      details: "In the tenth year of prophethood, Abu Talib died, followed weeks or months later by Khadija. The Prophet ﷺ lost both his protection in society and his closest support at home. This year is called 'Am al-Huzn, the Year of Sorrow. He remained loyal to Khadija's memory all his life."
    },
    ar: {
      title: "عام الحزن",
      summary: "فقد في مدة يسيرة عمه الناصر أبا طالب وزوجه الحبيبة خديجة.",
      details: "في السنة العاشرة من البعثة توفي أبو طالب، ثم توفيت خديجة بعده بأسابيع أو أشهر، ففقد النبي ﷺ سنده في قومه وسكنه في بيته، فسُمي ذلك العام عام الحزن. وبقي وفيًا لذكرى خديجة طول حياته."
    }
  },
  {
    id: "taif", year: 619, ah: -3, age: "50", period: "mecca", icon: "mountain", place: "taif", route: "taif",
    fr: {
      title: "Le voyage à Ta'if",
      summary: "Il part chercher soutien auprès de la tribu de Thaqif. Rejeté et chassé à coups de pierres, il répond par une prière.",
      details: "Accompagné de Zayd ibn Haritha, il passe une dizaine de jours à Ta'if. Les notables le repoussent et lancent contre lui les enfants et les esclaves, qui le blessent. Réfugié dans un verger, il adresse à Dieu une prière émouvante. Un jeune chrétien, 'Addas, lui offre du raisin. L'ange des montagnes propose d'écraser la ville ; il refuse, espérant que de leurs descendants naîtront des croyants. Il rentre à La Mecque sous la protection d'al-Mut'im ibn 'Adi."
    },
    en: {
      title: "The journey to Ta'if",
      summary: "He seeks support from the tribe of Thaqif. Rejected and driven out with stones, he answers with a prayer.",
      details: "With Zayd ibn Haritha he spent about ten days in Ta'if. The leaders rejected him and set children and slaves on him, who wounded him. Sheltering in an orchard, he made a moving prayer to God. A young Christian named 'Addas offered him grapes. The angel of the mountains offered to crush the town; he refused, hoping that believers would come from their descendants. He returned to Mecca under the protection of al-Mut'im ibn 'Adi."
    },
    ar: {
      title: "رحلة الطائف",
      summary: "خرج يطلب النصرة من ثقيف، فردّوه وأغروا به السفهاء يرمونه بالحجارة، فدعا ربه.",
      details: "خرج ومعه زيد بن حارثة فأقام بالطائف نحو عشرة أيام، فردّه أشرافهم وأغروا به صبيانهم وعبيدهم حتى أدموا قدميه. فلجأ إلى بستان ودعا بالدعاء المشهور، وقدّم له عدّاس النصراني قطفًا من عنب. وجاءه ملك الجبال يعرض أن يطبق عليهم الأخشبين فأبى، وقال: «أرجو أن يُخرج الله من أصلابهم من يعبد الله وحده». ثم دخل مكة في جوار المطعم بن عدي."
    }
  },
  {
    id: "isra", year: 620, ah: -2, age: "51", period: "mecca", icon: "ascent", place: "jerusalem", route: "isra",
    fr: {
      title: "Le Voyage nocturne et l'Ascension",
      summary: "En une nuit, il est transporté de La Mecque à Jérusalem (al-Isra'), puis élevé à travers les cieux (al-Mi'raj).",
      details: "Monté sur al-Buraq, accompagné de Jibril, il se rend à la mosquée al-Aqsa, où il dirige la prière des prophètes, puis monte à travers les sept cieux. C'est lors de cette nuit que les cinq prières quotidiennes sont prescrites. La date exacte est discutée ; on la situe généralement un à trois ans avant l'Hégire. « Gloire à Celui qui a fait voyager de nuit Son serviteur… » (17:1)."
    },
    en: {
      title: "The Night Journey and the Ascension",
      summary: "In one night he is taken from Mecca to Jerusalem (al-Isra'), then raised through the heavens (al-Mi'raj).",
      details: "Riding al-Buraq, with Jibril beside him, he went to al-Aqsa mosque, where he led the prophets in prayer, then ascended through the seven heavens. On this night the five daily prayers were prescribed. The exact date is debated; it is usually placed one to three years before the Hijra. \"Glory be to the One who took His servant by night…\" (17:1)."
    },
    ar: {
      title: "الإسراء والمعراج",
      summary: "أُسري به ليلًا من مكة إلى بيت المقدس، ثم عُرج به إلى السماوات العلى.",
      details: "ركب البراق مع جبريل إلى المسجد الأقصى فصلّى بالأنبياء إمامًا، ثم عُرج به إلى السماوات السبع، وفي تلك الليلة فُرضت الصلوات الخمس. واختُلف في تاريخها، والأكثر أنها قبل الهجرة بسنة إلى ثلاث. «سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى» (الإسراء: ١)."
    }
  },
  {
    id: "aqaba", year: 621, end: 622, ah: -1, age: "51–52", period: "mecca", icon: "rings", place: "mecca",
    fr: {
      title: "Les serments d'al-'Aqaba",
      summary: "Des habitants de Yathrib prêtent serment au Prophète ﷺ et l'invitent à venir chez eux.",
      details: "Pendant le pèlerinage, douze hommes de Yathrib (des tribus Aws et Khazraj) prêtent un premier serment à al-'Aqaba, près de Mina. Il envoie avec eux Mus'ab ibn 'Umayr pour enseigner l'Islam. L'année suivante, soixante-treize hommes et deux femmes s'engagent à le protéger comme ils protègent leurs familles : la voie de l'Hégire est ouverte."
    },
    en: {
      title: "The pledges of al-'Aqaba",
      summary: "People of Yathrib pledge allegiance to the Prophet ﷺ and invite him to their city.",
      details: "During the pilgrimage, twelve men from Yathrib (of the Aws and Khazraj tribes) made a first pledge at al-'Aqaba, near Mina. He sent Mus'ab ibn 'Umayr back with them to teach Islam. The following year seventy-three men and two women pledged to protect him as they protected their own families: the way to the Hijra was open."
    },
    ar: {
      title: "بيعتا العقبة",
      summary: "بايع رجال من يثرب النبي ﷺ ودعوه إلى بلدهم.",
      details: "في موسم الحج بايعه اثنا عشر رجلًا من الأوس والخزرج عند العقبة بمنى، فبعث معهم مصعب بن عمير يعلمهم الإسلام. وفي العام التالي بايعه ثلاثة وسبعون رجلًا وامرأتان على أن يمنعوه مما يمنعون منه أهليهم، فانفتح طريق الهجرة."
    }
  },
  {
    id: "hijra", year: 622, ah: 1, age: "53", period: "medina", icon: "route", place: "medina", route: "hijra",
    fr: {
      title: "L'Hégire vers Médine",
      summary: "Il quitte La Mecque de nuit avec Abu Bakr, se cache trois nuits dans la grotte de Thawr et rejoint Yathrib.",
      details: "Quraysh projette de l'assassiner. Cette nuit-là, 'Ali dort dans son lit. Avec Abu Bakr, il se cache trois nuits dans la grotte de Thawr, au sud de La Mecque, puis prend une route côtière inhabituelle avec le guide 'Abdullah ibn Urayqit. Il arrive à Quba', où il fonde la première mosquée, puis entre à Yathrib, qui deviendra Madinat an-Nabi, « la ville du Prophète ». Cet événement marque le début du calendrier musulman, choisi plus tard par 'Umar."
    },
    en: {
      title: "The Hijra to Medina",
      summary: "He leaves Mecca at night with Abu Bakr, hides three nights in the cave of Thawr and reaches Yathrib.",
      details: "Quraysh plotted to kill him. That night 'Ali slept in his bed. With Abu Bakr he hid for three nights in the cave of Thawr, south of Mecca, then took an unusual coastal route with the guide 'Abdullah ibn Urayqit. He reached Quba', where he founded the first mosque, then entered Yathrib, which would become Madinat an-Nabi, \"the city of the Prophet\". This event marks the start of the Muslim calendar, later chosen by 'Umar."
    },
    ar: {
      title: "الهجرة إلى المدينة",
      summary: "خرج من مكة ليلًا مع أبي بكر، واختبأ في غار ثور ثلاث ليال، ثم بلغ يثرب.",
      details: "ائتمرت قريش على قتله، فبات علي في فراشه. وخرج مع أبي بكر فمكثا في غار ثور جنوب مكة ثلاث ليال، ثم سلكا طريق الساحل مع الدليل عبد الله بن أريقط. فنزل قباء وأسس أول مسجد، ثم دخل يثرب فصارت «مدينة النبي». ومن هذا الحدث جعل عمر بداية التقويم الهجري."
    }
  },
  {
    id: "medina", year: 622, end: 623, ah: 1, age: "53", period: "medina", icon: "mosque", place: "medina",
    fr: {
      title: "Fonder une communauté",
      summary: "Construction de la Mosquée du Prophète, fraternité entre émigrés et Ansar, et charte de Médine.",
      details: "Sa chamelle s'arrête sur un terrain où il bâtit, avec ses compagnons, une mosquée simple de briques crues et de troncs de palmiers. Il unit chaque émigré mecquois (muhajir) à un habitant de Médine (ansari) par un lien de fraternité. Un document, la Sahifa de Médine, définit les droits et devoirs des musulmans, des tribus juives et des autres habitants de la ville."
    },
    en: {
      title: "Founding a community",
      summary: "Building of the Prophet's Mosque, brotherhood between Emigrants and Ansar, and the Charter of Medina.",
      details: "His she-camel knelt on a plot where, with his companions, he built a simple mosque of mud bricks and palm trunks. He joined each Meccan emigrant (muhajir) to a Medinan helper (ansari) in a bond of brotherhood. A document, the Sahifa of Medina, set out the rights and duties of the Muslims, the Jewish tribes and the other people of the city."
    },
    ar: {
      title: "بناء المجتمع",
      summary: "بناء المسجد النبوي، والمؤاخاة بين المهاجرين والأنصار، وكتابة الصحيفة.",
      details: "بركت ناقته في مِربد فبنى فيه مع أصحابه مسجدًا من اللَّبِن وجذوع النخل. وآخى بين المهاجرين والأنصار، وكتب الصحيفة التي نظمت الحقوق والواجبات بين المسلمين واليهود وسائر أهل المدينة."
    }
  },
  {
    id: "qibla", year: 624, ah: 2, age: "54", period: "medina", icon: "compass", place: "medina",
    fr: {
      title: "Changement de la qibla et jeûne de Ramadan",
      summary: "La direction de la prière passe de Jérusalem à la Ka'ba ; le jeûne du mois de Ramadan est prescrit.",
      details: "Environ seize ou dix-sept mois après l'Hégire, alors que le Prophète ﷺ espérait se tourner vers la Ka'ba, le verset est révélé : « Tourne ton visage vers la Mosquée sacrée » (2:144). La même année est prescrit le jeûne du mois de Ramadan, ainsi que la zakat al-fitr."
    },
    en: {
      title: "Change of qibla and the fast of Ramadan",
      summary: "The direction of prayer turns from Jerusalem to the Ka'ba; the fast of Ramadan is prescribed.",
      details: "About sixteen or seventeen months after the Hijra, as the Prophet ﷺ hoped to face the Ka'ba, the verse was revealed: \"Turn your face toward the Sacred Mosque\" (2:144). That same year the fast of Ramadan was prescribed, along with zakat al-fitr."
    },
    ar: {
      title: "تحويل القبلة وفرض الصيام",
      summary: "تحولت القبلة من بيت المقدس إلى الكعبة، وفُرض صيام رمضان.",
      details: "بعد ستة عشر أو سبعة عشر شهرًا من الهجرة، وكان النبي ﷺ يحب أن يُوجَّه إلى الكعبة، نزل قوله تعالى: «فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ» (البقرة: ١٤٤). وفي العام نفسه فُرض صيام رمضان وزكاة الفطر."
    }
  },
  {
    id: "badr", year: 624, ah: 2, age: "54", period: "medina", icon: "banner", place: "badr", route: "badr", battle: "badr",
    fr: {
      title: "La bataille de Badr",
      summary: "Le 17 Ramadan, environ 313 musulmans font face à près de 1 000 Mecquois et remportent une victoire décisive.",
      details: "Partis intercepter une caravane de Quraysh, les musulmans se retrouvent face à une armée bien plus nombreuse et mieux équipée. Après une nuit de prière du Prophète ﷺ, la bataille tourne en leur faveur ; plusieurs chefs de Quraysh, dont Abu Jahl, y trouvent la mort. Le Coran appelle ce jour Yawm al-Furqan, « le jour du Discernement » (8:41). Les prisonniers sachant écrire pouvaient se libérer en enseignant l'écriture à dix enfants de Médine."
    },
    en: {
      title: "The Battle of Badr",
      summary: "On 17 Ramadan, about 313 Muslims face nearly 1,000 Meccans and win a decisive victory.",
      details: "Having set out to intercept a Quraysh caravan, the Muslims found themselves facing a much larger and better-equipped army. After a night the Prophet ﷺ spent in prayer, the battle turned in their favour; several Quraysh leaders, including Abu Jahl, were killed. The Qur'an calls it Yawm al-Furqan, \"the Day of Criterion\" (8:41). Literate prisoners could earn their freedom by teaching ten children of Medina to write."
    },
    ar: {
      title: "غزوة بدر الكبرى",
      summary: "في السابع عشر من رمضان، واجه نحو ٣١٣ من المسلمين قرابة ألف من قريش، فكان النصر.",
      details: "خرج المسلمون لاعتراض عير قريش، فإذا هم أمام جيش يفوقهم عددًا وعُدّة. وبات النبي ﷺ ليلته يدعو ربه، فكان النصر، وقُتل عدد من صناديد قريش منهم أبو جهل. وسمّى القرآن ذلك اليوم «يوم الفرقان» (الأنفال: ٤١). وكان فداء من يحسن الكتابة من الأسرى أن يعلّم عشرة من صبيان المدينة."
    }
  },
  {
    id: "uhud", year: 625, ah: 3, age: "55", period: "medina", icon: "banner", place: "uhud", battle: "uhud",
    fr: {
      title: "La bataille d'Uhud",
      summary: "Au pied du mont Uhud, environ 700 musulmans affrontent 3 000 Mecquois venus venger Badr.",
      details: "Le Prophète ﷺ poste cinquante archers sur une colline avec l'ordre de ne jamais la quitter. Les musulmans prennent l'avantage, mais la plupart des archers descendent, croyant la victoire acquise. Khalid ibn al-Walid contourne alors la colline. Le Prophète ﷺ est blessé et son oncle Hamza tombe en martyr. Le Coran tire de cette épreuve des leçons d'obéissance et de patience (sourate Al 'Imran)."
    },
    en: {
      title: "The Battle of Uhud",
      summary: "At the foot of Mount Uhud, about 700 Muslims face 3,000 Meccans who came to avenge Badr.",
      details: "The Prophet ﷺ placed fifty archers on a hill, ordering them never to leave it. The Muslims gained the upper hand, but most archers came down, thinking the battle won. Khalid ibn al-Walid then rode round the hill. The Prophet ﷺ was wounded and his uncle Hamza was martyred. The Qur'an draws lessons of obedience and patience from this trial (Surat Al 'Imran)."
    },
    ar: {
      title: "غزوة أحد",
      summary: "عند جبل أحد، واجه نحو ٧٠٠ من المسلمين ثلاثة آلاف من قريش جاؤوا يثأرون لبدر.",
      details: "جعل النبي ﷺ خمسين من الرماة على الجبل وأمرهم ألا يبرحوا مكانهم. فلما ظهر المسلمون نزل أكثر الرماة ظنًا منهم أن المعركة انتهت، فالتفّ خالد بن الوليد من خلفهم. وجُرح النبي ﷺ واستشهد عمه حمزة. وفي سورة آل عمران دروس في الطاعة والصبر من هذه المحنة."
    }
  },
  {
    id: "khandaq", year: 627, ah: 5, age: "57", period: "medina", icon: "trench", place: "medina", battle: "khandaq",
    fr: {
      title: "La bataille du Fossé (al-Khandaq)",
      summary: "Une coalition d'environ 10 000 hommes assiège Médine. Les musulmans creusent un fossé pour la protéger.",
      details: "Sur la suggestion de Salman al-Farisi, les musulmans creusent en quelques jours un long fossé au nord de Médine ; le Prophète ﷺ y travaille avec eux, une pierre attachée sur le ventre contre la faim. Les coalisés (al-Ahzab) ne peuvent franchir l'obstacle. Après près d'un mois de siège, un vent glacial et la discorde dispersent leur camp. Le Prophète ﷺ déclare : « Désormais, c'est nous qui irons vers eux. »"
    },
    en: {
      title: "The Battle of the Trench (al-Khandaq)",
      summary: "A coalition of about 10,000 men besieges Medina. The Muslims dig a trench to protect it.",
      details: "On the advice of Salman al-Farisi, the Muslims dug a long trench north of Medina in a matter of days; the Prophet ﷺ worked alongside them, a stone tied to his stomach against hunger. The confederates (al-Ahzab) could not cross it. After nearly a month of siege, a freezing wind and discord broke up their camp. The Prophet ﷺ said: \"From now on, we will go to them.\""
    },
    ar: {
      title: "غزوة الخندق (الأحزاب)",
      summary: "حاصرت الأحزاب المدينة بنحو عشرة آلاف مقاتل، فحفر المسلمون خندقًا يحميها.",
      details: "أشار سلمان الفارسي بحفر الخندق، فحفره المسلمون شمال المدينة في أيام، والنبي ﷺ يعمل معهم وقد ربط حجرًا على بطنه من الجوع. فعجزت الأحزاب عن عبوره، وبعد قرابة شهر من الحصار فرّقتهم ريح باردة والخلاف بينهم. فقال ﷺ: «الآن نغزوهم ولا يغزوننا»."
    }
  },
  {
    id: "hudaybiyya", year: 628, ah: 6, age: "58", period: "medina", icon: "scroll", place: "hudaybiyya", route: "hudaybiyya",
    fr: {
      title: "Le traité d'al-Hudaybiyya",
      summary: "Venus en pèlerins, 1 400 musulmans sont arrêtés aux portes de La Mecque. Une trêve de dix ans est signée.",
      details: "Le Prophète ﷺ part accomplir la 'umra, sans intention de combattre. Bloqués à al-Hudaybiyya, les compagnons prêtent le serment d'al-Ridwan sous un arbre. Le traité semble défavorable : rentrer sans pèlerinage cette année, rendre les Mecquois venus se convertir. Pourtant, la sourate al-Fath l'appelle « une victoire éclatante » : la paix permet à l'Islam de se répandre comme jamais."
    },
    en: {
      title: "The Treaty of al-Hudaybiyya",
      summary: "Arriving as pilgrims, 1,400 Muslims are stopped outside Mecca. A ten-year truce is signed.",
      details: "The Prophet ﷺ set out to perform 'umra, with no intention of fighting. Blocked at al-Hudaybiyya, the companions took the Pledge of al-Ridwan under a tree. The treaty looked unfavourable: return home without the pilgrimage this year, and send back Meccans who came to embrace Islam. Yet Surat al-Fath calls it \"a clear victory\": peace allowed Islam to spread as never before."
    },
    ar: {
      title: "صلح الحديبية",
      summary: "خرج ١٤٠٠ من المسلمين معتمرين فصُدّوا عن مكة، فعُقدت هدنة عشر سنين.",
      details: "خرج النبي ﷺ معتمرًا لا يريد قتالًا، فلما مُنع عند الحديبية بايعه أصحابه بيعة الرضوان تحت الشجرة. وبدت شروط الصلح مجحفة: يرجعون عامهم هذا، ويُردّ من جاء من قريش مسلمًا. لكن الله سمّاه «فتحًا مبينًا» في سورة الفتح، إذ انتشر الإسلام في الهدنة انتشارًا لم يسبق."
    }
  },
  {
    id: "letters", year: 628, ah: 7, age: "58", period: "medina", icon: "seal", place: "medina",
    fr: {
      title: "Les lettres aux souverains",
      summary: "Il écrit à Héraclius, à Khosro, au Négus, au Muqawqis d'Égypte et à d'autres rois pour les inviter à l'Islam.",
      details: "Pour authentifier ses lettres, il fait graver une bague d'argent portant l'inscription « Muhammad Rasul Allah ». Les réactions varient : Héraclius s'informe avec intérêt, le Négus accueille la lettre avec respect, le Muqawqis envoie des présents, tandis que Khosro déchire la lettre."
    },
    en: {
      title: "Letters to the rulers",
      summary: "He writes to Heraclius, Khosrow, the Negus, the Muqawqis of Egypt and other kings, inviting them to Islam.",
      details: "To authenticate his letters he had a silver ring engraved with \"Muhammad Rasul Allah\". Reactions varied: Heraclius made careful enquiries, the Negus received the letter with respect, the Muqawqis sent gifts, while Khosrow tore the letter apart."
    },
    ar: {
      title: "الرسائل إلى الملوك",
      summary: "كتب إلى هرقل وكسرى والنجاشي والمقوقس وغيرهم يدعوهم إلى الإسلام.",
      details: "اتخذ خاتمًا من فضة نقشه «محمد رسول الله» يختم به كتبه. فتباينت ردودهم: سأل هرقل عنه سؤال المهتم، وأكرم النجاشي الكتاب، وأهدى المقوقس الهدايا، ومزّق كسرى الكتاب."
    }
  },
  {
    id: "khaybar", year: 628, ah: 7, age: "58", period: "medina", icon: "fortress", place: "khaybar", route: "khaybar",
    fr: {
      title: "Khaybar et la 'umra accomplie",
      summary: "Les forteresses de Khaybar sont prises ; l'année suivante, les musulmans accomplissent enfin la 'umra.",
      details: "Khaybar, oasis fortifiée au nord de Médine, était devenue un centre d'hostilité contre les musulmans. Après un siège, les forteresses tombent ; 'Ali ibn Abi Talib reçoit l'étendard. Les habitants gardent leurs palmeraies contre la moitié des récoltes. Au même moment, Ja'far et les derniers émigrés d'Abyssinie reviennent. En Dhu al-Qa'da, selon le traité, les musulmans accomplissent la 'umra de compensation (al-Qada')."
    },
    en: {
      title: "Khaybar and the completed 'umra",
      summary: "The fortresses of Khaybar are taken; the next year the Muslims finally perform the 'umra.",
      details: "Khaybar, a fortified oasis north of Medina, had become a centre of hostility against the Muslims. After a siege the fortresses fell; 'Ali ibn Abi Talib carried the banner. The inhabitants kept their palm groves in exchange for half the harvest. At the same time Ja'far and the last emigrants returned from Abyssinia. In Dhu al-Qa'da, as agreed in the treaty, the Muslims performed the make-up 'umra (al-Qada')."
    },
    ar: {
      title: "خيبر وعمرة القضاء",
      summary: "فُتحت حصون خيبر، وفي العام التالي أدى المسلمون العمرة.",
      details: "كانت خيبر واحة محصنة شمال المدينة صارت مركزًا للعداء، ففُتحت حصونها بعد حصار، وأُعطي الراية علي بن أبي طالب. وأُقرّ أهلها على نخيلهم بشطر ثمرها. وقدم جعفر ومن بقي من مهاجري الحبشة. وفي ذي القعدة أدى المسلمون عمرة القضاء وفق شروط الصلح."
    }
  },
  {
    id: "mutah", year: 629, ah: 8, age: "59", period: "medina", icon: "banner", place: "mutah", route: "mutah",
    fr: {
      title: "L'expédition de Mu'ta",
      summary: "Une armée de 3 000 hommes affronte une force byzantine bien plus nombreuse aux confins de la Syrie.",
      details: "Après le meurtre de son émissaire, le Prophète ﷺ envoie une armée vers le nord, sans y prendre part lui-même. Les trois chefs qu'il a désignés — Zayd ibn Haritha, Ja'far ibn Abi Talib et 'Abdullah ibn Rawaha — tombent l'un après l'autre. Khalid ibn al-Walid prend le commandement et ramène l'armée en bon ordre ; il reçoit le surnom de « Sabre de Dieu »."
    },
    en: {
      title: "The expedition of Mu'tah",
      summary: "An army of 3,000 men faces a far larger Byzantine force on the edge of Syria.",
      details: "After his envoy was killed, the Prophet ﷺ sent an army north, without taking part himself. The three commanders he had named — Zayd ibn Haritha, Ja'far ibn Abi Talib and 'Abdullah ibn Rawaha — fell one after another. Khalid ibn al-Walid took command and brought the army back in good order; he was given the name \"Sword of God\"."
    },
    ar: {
      title: "سرية مؤتة",
      summary: "جيش من ثلاثة آلاف يواجه جموع الروم الكثيرة على تخوم الشام.",
      details: "بعد قتل رسوله، بعث النبي ﷺ جيشًا إلى الشمال ولم يخرج فيه. فاستشهد أمراؤه الثلاثة واحدًا بعد واحد: زيد بن حارثة وجعفر بن أبي طالب وعبد الله بن رواحة. فأخذ الراية خالد بن الوليد وانحاز بالجيش، فسُمّي «سيف الله»."
    }
  },
  {
    id: "conquest", year: 630, ah: 8, age: "60", period: "medina", icon: "key", place: "mecca", route: "conquest",
    fr: {
      title: "L'ouverture de La Mecque",
      summary: "Avec 10 000 compagnons, il entre à La Mecque presque sans combat et pardonne à ceux qui l'avaient persécuté.",
      details: "Quraysh ayant rompu la trêve d'al-Hudaybiyya, le Prophète ﷺ marche sur La Mecque en Ramadan de l'an 8. Il y entre humblement, la tête inclinée sur sa monture. Il purifie la Ka'ba des quelque 360 idoles en récitant : « La vérité est venue et l'erreur a disparu » (17:81). Il rend la clé de la Ka'ba à 'Uthman ibn Talha et proclame l'amnistie générale : « Allez, vous êtes libres. » Bilal lance l'appel à la prière du haut de la Ka'ba."
    },
    en: {
      title: "The opening of Mecca",
      summary: "With 10,000 companions he enters Mecca almost without fighting and forgives those who had persecuted him.",
      details: "After Quraysh broke the truce of al-Hudaybiyya, the Prophet ﷺ marched on Mecca in Ramadan of year 8. He entered humbly, his head bowed over his mount. He cleared the Ka'ba of some 360 idols, reciting: \"Truth has come and falsehood has vanished\" (17:81). He gave the key of the Ka'ba back to 'Uthman ibn Talha and proclaimed a general amnesty: \"Go, you are free.\" Bilal called the adhan from the roof of the Ka'ba."
    },
    ar: {
      title: "فتح مكة",
      summary: "دخل مكة في عشرة آلاف من أصحابه دون قتال يُذكر، وعفا عمّن آذوه.",
      details: "لما نقضت قريش صلح الحديبية سار إليها النبي ﷺ في رمضان سنة ثمان، فدخلها متواضعًا خافضًا رأسه على راحلته. وطهّر الكعبة من نحو ثلاثمئة وستين صنمًا وهو يقرأ: «جَاءَ الْحَقُّ وَزَهَقَ الْبَاطِلُ» (الإسراء: ٨١). وردّ مفتاح الكعبة إلى عثمان بن طلحة، وقال لقريش: «اذهبوا فأنتم الطلقاء». وأذّن بلال على ظهر الكعبة."
    }
  },
  {
    id: "hunayn", year: 630, ah: 8, age: "60", period: "medina", icon: "banner", place: "hunayn",
    fr: {
      title: "La bataille de Hunayn",
      summary: "Quelques semaines après, les tribus Hawazin et Thaqif attaquent. D'abord surpris, les musulmans l'emportent.",
      details: "Fiers de leur nombre — environ 12 000 —, les musulmans sont pris en embuscade dans la vallée de Hunayn et se dispersent. Le Prophète ﷺ reste ferme et appelle ses compagnons, qui se regroupent. La victoire est obtenue. Le Coran rappelle que le nombre ne suffit pas (9:25). Lors du partage du butin, il apaise les Ansar par des paroles restées célèbres."
    },
    en: {
      title: "The Battle of Hunayn",
      summary: "A few weeks later the Hawazin and Thaqif tribes attack. Surprised at first, the Muslims prevail.",
      details: "Proud of their numbers — about 12,000 — the Muslims were ambushed in the valley of Hunayn and scattered. The Prophet ﷺ stood firm and called his companions, who rallied. Victory followed. The Qur'an reminds that numbers alone are not enough (9:25). When the spoils were shared, he reassured the Ansar with words that remained famous."
    },
    ar: {
      title: "غزوة حنين",
      summary: "بعد أسابيع هاجمت هوازن وثقيف، فانكشف المسلمون أول الأمر ثم كان النصر.",
      details: "أعجبت المسلمين كثرتهم، وكانوا نحو اثني عشر ألفًا، فكمن لهم العدو في وادي حنين فتفرقوا. وثبت النبي ﷺ ينادي أصحابه فاجتمعوا إليه، فكان النصر. وذكّر القرآن بأن الكثرة لا تغني شيئًا (التوبة: ٢٥). وعند قسمة الغنائم طيّب خاطر الأنصار بكلمات خالدة."
    }
  },
  {
    id: "tabuk", year: 630, ah: 9, age: "61", period: "medina", icon: "palm", place: "tabuk", route: "tabuk",
    fr: {
      title: "L'expédition de Tabuk",
      summary: "Sa dernière expédition : 30 000 hommes marchent vers le nord en pleine chaleur. Il n'y a pas de combat.",
      details: "Apprenant qu'une armée byzantine se rassemble, il mobilise les musulmans en été, en période de disette. 'Uthman ibn 'Affan équipe une grande partie de l'armée, Abu Bakr donne tous ses biens. Arrivés à Tabuk, ils ne trouvent pas d'ennemi ; le Prophète ﷺ y reste une vingtaine de jours et conclut des accords avec les populations de la région. La sourate at-Tawba évoque cette « heure difficile »."
    },
    en: {
      title: "The expedition of Tabuk",
      summary: "His last expedition: 30,000 men march north in the summer heat. There is no fighting.",
      details: "Hearing that a Byzantine army was gathering, he called the Muslims out in summer, in a time of scarcity. 'Uthman ibn 'Affan equipped a large part of the army and Abu Bakr gave all his wealth. At Tabuk they found no enemy; the Prophet ﷺ stayed about twenty days and made agreements with the peoples of the area. Surat at-Tawba speaks of this \"hour of hardship\"."
    },
    ar: {
      title: "غزوة تبوك",
      summary: "آخر غزواته: ثلاثون ألفًا يسيرون شمالًا في شدة الحر، ولم يقع قتال.",
      details: "بلغه أن الروم يتجمعون، فاستنفر المسلمين في الصيف وزمن العسرة. فجهّز عثمان بن عفان كثيرًا من الجيش، وجاء أبو بكر بماله كله. فلما بلغوا تبوك لم يجدوا عدوًا، فأقام النبي ﷺ نحو عشرين ليلة وصالح أهل تلك النواحي. وفي سورة التوبة ذكر «ساعة العسرة»."
    }
  },
  {
    id: "delegations", year: 630, end: 631, ah: 9, age: "61", period: "medina", icon: "tent", place: "medina",
    fr: {
      title: "L'Année des délégations",
      summary: "Les tribus de toute l'Arabie envoient des délégations à Médine pour embrasser l'Islam.",
      details: "Après l'ouverture de La Mecque, les tribus arabes, qui attendaient l'issue entre le Prophète ﷺ et Quraysh, viennent en grand nombre : Thaqif de Ta'if, les tribus du Yémen, de Najd, de Bahrayn… Le Prophète ﷺ les reçoit, leur enseigne et envoie avec eux des enseignants comme Mu'adh ibn Jabal au Yémen. Cette année-là, Abu Bakr dirige le pèlerinage."
    },
    en: {
      title: "The Year of Delegations",
      summary: "Tribes from all over Arabia send delegations to Medina to embrace Islam.",
      details: "After the opening of Mecca, the Arab tribes, who had been waiting to see the outcome between the Prophet ﷺ and Quraysh, came in great numbers: Thaqif of Ta'if, tribes from Yemen, Najd, Bahrayn… The Prophet ﷺ received them, taught them, and sent teachers back with them, such as Mu'adh ibn Jabal to Yemen. That year Abu Bakr led the pilgrimage."
    },
    ar: {
      title: "عام الوفود",
      summary: "توافدت القبائل من أنحاء الجزيرة إلى المدينة تعلن إسلامها.",
      details: "كانت العرب تتربص بما يكون بين النبي ﷺ وقريش، فلما فُتحت مكة أقبلت الوفود: ثقيف من الطائف، وقبائل اليمن ونجد والبحرين… فكان يستقبلهم ويعلمهم ويبعث معهم المعلمين، كمعاذ بن جبل إلى اليمن. وفي هذا العام حجّ أبو بكر بالناس."
    }
  },
  {
    id: "farewell", year: 632, ah: 10, age: "63", period: "medina", icon: "arafat", place: "mecca", route: "farewell",
    fr: {
      title: "Le pèlerinage d'adieu",
      summary: "Son unique pèlerinage, avec plus de 100 000 fidèles. À 'Arafat, il prononce le sermon d'adieu.",
      details: "En Dhu al-Hijja de l'an 10, il enseigne les rites du hajj par l'exemple : « Prenez de moi vos rites. » Dans son sermon, il proclame le caractère sacré de la vie, des biens et de l'honneur, recommande le bon traitement des femmes, abolit l'usure et la vengeance de sang, et rappelle qu'« un Arabe n'a aucune supériorité sur un non-Arabe, ni un non-Arabe sur un Arabe, si ce n'est par la piété ». Le verset est révélé : « Aujourd'hui, J'ai parachevé pour vous votre religion » (5:3)."
    },
    en: {
      title: "The Farewell Pilgrimage",
      summary: "His only pilgrimage, with more than 100,000 believers. At 'Arafat he delivers the Farewell Sermon.",
      details: "In Dhu al-Hijja of year 10 he taught the rites of hajj by example: \"Take your rites from me.\" In his sermon he declared the sanctity of life, property and honour, urged kind treatment of women, abolished usury and blood vengeance, and reminded that \"an Arab has no superiority over a non-Arab, nor a non-Arab over an Arab, except by piety\". The verse was revealed: \"Today I have perfected your religion for you\" (5:3)."
    },
    ar: {
      title: "حجة الوداع",
      summary: "حجته الوحيدة، وقد شهدها أكثر من مئة ألف، وخطب في عرفات خطبة الوداع.",
      details: "في ذي الحجة سنة عشر علّم الناس مناسكهم بفعله وقال: «لتأخذوا مناسككم». وفي خطبته أعلن حرمة الدماء والأموال والأعراض، وأوصى بالنساء خيرًا، ووضع ربا الجاهلية ودماءها، وقال: «لا فضل لعربي على أعجمي ولا لأعجمي على عربي إلا بالتقوى». ونزل قوله تعالى: «الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ» (المائدة: ٣)."
    }
  },
  {
    id: "death", year: 632, ah: 11, age: "63", period: "medina", icon: "dome", place: "medina",
    fr: {
      title: "Le décès du Prophète ﷺ",
      summary: "Le lundi 12 Rabi' al-Awwal de l'an 11, il s'éteint à Médine, dans la chambre de 'Aïcha, à l'âge de 63 ans.",
      details: "Après quelques jours de fièvre, il demande à Abu Bakr de diriger la prière. Ses dernières paroles sont : « Avec le Compagnon suprême. » Face au choc des compagnons, Abu Bakr déclare : « Quiconque adorait Muhammad, Muhammad est mort ; quiconque adore Allah, Allah est vivant et ne meurt pas », puis récite le verset 3:144. Il est enterré à l'endroit même où il est mort, aujourd'hui sous la Coupole verte de la Mosquée du Prophète."
    },
    en: {
      title: "The passing of the Prophet ﷺ",
      summary: "On Monday 12 Rabi' al-Awwal, year 11, he passes away in Medina, in 'A'isha's room, at the age of 63.",
      details: "After several days of fever, he asked Abu Bakr to lead the prayer. His last words were: \"With the Highest Companion.\" As the companions reeled from the shock, Abu Bakr declared: \"Whoever worshipped Muhammad, Muhammad has died; whoever worships Allah, Allah is alive and does not die,\" then recited verse 3:144. He was buried where he died, today beneath the Green Dome of the Prophet's Mosque."
    },
    ar: {
      title: "وفاة النبي ﷺ",
      summary: "يوم الاثنين الثاني عشر من ربيع الأول سنة ١١ توفي بالمدينة في حجرة عائشة عن ثلاث وستين سنة.",
      details: "اشتدت به الحمّى أيامًا فأمر أبا بكر أن يصلي بالناس. وكان آخر ما قال: «اللهم الرفيق الأعلى». ولما اضطرب الصحابة قال أبو بكر: «من كان يعبد محمدًا فإن محمدًا قد مات، ومن كان يعبد الله فإن الله حي لا يموت»، وتلا الآية ١٤٤ من آل عمران. ودُفن حيث قُبض، وهو اليوم تحت القبة الخضراء في المسجد النبوي."
    }
  }
];

/* Lieux de la carte */
SIRA.places = {
  mecca:      { fr: "La Mecque", en: "Mecca", ar: "مكة المكرمة", major: true },
  medina:     { fr: "Médine", en: "Medina", ar: "المدينة المنورة", major: true },
  taif:       { fr: "Ta'if", en: "Ta'if", ar: "الطائف" },
  badr:       { fr: "Badr", en: "Badr", ar: "بدر" },
  uhud:       { fr: "Uhud", en: "Uhud", ar: "أحد", hidden: true },
  khaybar:    { fr: "Khaybar", en: "Khaybar", ar: "خيبر" },
  hudaybiyya: { fr: "al-Hudaybiyya", en: "al-Hudaybiyya", ar: "الحديبية", hidden: true },
  hunayn:     { fr: "Hunayn", en: "Hunayn", ar: "حنين", hidden: true },
  tabuk:      { fr: "Tabuk", en: "Tabuk", ar: "تبوك" },
  mutah:      { fr: "Mu'ta", en: "Mu'tah", ar: "مؤتة" },
  bosra:      { fr: "Bosra", en: "Bosra", ar: "بُصرى" },
  aksum:      { fr: "Aksoum (Abyssinie)", en: "Aksum (Abyssinia)", ar: "أكسوم (الحبشة)" },
  abwa:       { fr: "al-Abwa'", en: "al-Abwa'", ar: "الأبواء" },
  thawr:      { fr: "Grotte de Thawr", en: "Cave of Thawr", ar: "غار ثور", hidden: true },
  quba:       { fr: "Quba'", en: "Quba'", ar: "قباء", hidden: true },
  jerusalem:  { fr: "Jérusalem (al-Aqsa)", en: "Jerusalem (al-Aqsa)", ar: "بيت المقدس" },
  yanbu:      { fr: "Yanbu'", en: "Yanbu'", ar: "ينبع", hidden: true },
  shuaybah:   { fr: "Port d'ash-Shu'ayba", en: "Port of ash-Shu'aybah", ar: "ميناء الشعيبة" }
};

SIRA.regions = {
  hijaz: { fr: "HIJAZ", en: "HIJAZ", ar: "الحجاز" },
  najd: { fr: "NAJD", en: "NAJD", ar: "نجد" },
  yemen: { fr: "YÉMEN", en: "YEMEN", ar: "اليمن" },
  sham: { fr: "CHAM", en: "SHAM", ar: "الشام" },
  habasha: { fr: "ABYSSINIE", en: "ABYSSINIA", ar: "الحبشة" },
  redsea: { fr: "Mer Rouge", en: "Red Sea", ar: "البحر الأحمر", sea: true, rotate: 60 },
  gulf: { fr: "Golfe", en: "Gulf", ar: "الخليج", sea: true },
  egypt: { fr: "ÉGYPTE", en: "EGYPT", ar: "مصر" }
};

/* Itinéraires : distances et durées approximatives d'après les sources */
SIRA.routes = [
  { id: "hijra", event: "hijra", spiritual: false,
    fr: { name: "L'Hégire", info: "La Mecque → grotte de Thawr → route côtière → Quba' → Médine. Environ 450 km, parcourus en une douzaine de jours dont trois nuits cachés dans la grotte." },
    en: { name: "The Hijra", info: "Mecca → cave of Thawr → coastal road → Quba' → Medina. About 450 km, covered in roughly twelve days, including three nights hidden in the cave." },
    ar: { name: "الهجرة", info: "مكة ← غار ثور ← طريق الساحل ← قباء ← المدينة. نحو ٤٥٠ كم، قطعها في قرابة اثني عشر يومًا منها ثلاث ليال في الغار." } },
  { id: "syria", event: "bahira",
    fr: { name: "Caravanes de Syrie", info: "La route marchande de Quraysh vers le Cham, environ 1 300 km : un mois de voyage. Il l'emprunte enfant avec Abu Talib, puis adulte pour Khadija." },
    en: { name: "Syrian caravans", info: "The Quraysh trade route to Sham, about 1,300 km: a month's journey. He travelled it as a boy with Abu Talib, then as a man for Khadija." },
    ar: { name: "رحلة الشام", info: "طريق تجارة قريش إلى الشام، نحو ١٣٠٠ كم: مسيرة شهر. سلكها صبيًا مع أبي طالب، ثم رجلًا في تجارة خديجة." } },
  { id: "abyssinia", event: "abyssinia",
    fr: { name: "Vers l'Abyssinie", info: "Les compagnons gagnent le port d'ash-Shu'ayba, traversent la mer Rouge et rejoignent le royaume d'Aksoum." },
    en: { name: "To Abyssinia", info: "The companions reach the port of ash-Shu'aybah, cross the Red Sea and reach the kingdom of Aksum." },
    ar: { name: "إلى الحبشة", info: "خرج الصحابة إلى ميناء الشعيبة، فعبروا البحر الأحمر إلى مملكة أكسوم." } },
  { id: "taif", event: "taif",
    fr: { name: "Ta'if", info: "Environ 90 km à travers les montagnes, à pied, accompagné de Zayd ibn Haritha." },
    en: { name: "Ta'if", info: "About 90 km through the mountains, on foot, with Zayd ibn Haritha." },
    ar: { name: "الطائف", info: "نحو ٩٠ كم عبر الجبال، ماشيًا ومعه زيد بن حارثة." } },
  { id: "isra", event: "isra", spiritual: true,
    fr: { name: "Al-Isra'", info: "Le Voyage nocturne de La Mecque à Jérusalem, accompli en une seule nuit : un miracle, et non un itinéraire terrestre." },
    en: { name: "Al-Isra'", info: "The Night Journey from Mecca to Jerusalem, made in a single night: a miracle, not an overland route." },
    ar: { name: "الإسراء", info: "رحلة ليلية من المسجد الحرام إلى المسجد الأقصى في ليلة واحدة: معجزة لا طريق برّي." } },
  { id: "badr", event: "badr",
    fr: { name: "Badr", info: "Environ 150 km au sud-ouest de Médine, sur la route des caravanes." },
    en: { name: "Badr", info: "About 150 km south-west of Medina, on the caravan road." },
    ar: { name: "بدر", info: "نحو ١٥٠ كم جنوب غرب المدينة على طريق القوافل." } },
  { id: "hudaybiyya", event: "hudaybiyya",
    fr: { name: "Al-Hudaybiyya", info: "Les pèlerins s'arrêtent à la limite du territoire sacré, à une vingtaine de kilomètres de La Mecque." },
    en: { name: "Al-Hudaybiyya", info: "The pilgrims stop at the edge of the sacred territory, some twenty kilometres from Mecca." },
    ar: { name: "الحديبية", info: "توقف المعتمرون عند حدود الحرم على نحو عشرين كيلومترًا من مكة." } },
  { id: "khaybar", event: "khaybar",
    fr: { name: "Khaybar", info: "Oasis fortifiée à environ 150 km au nord de Médine." },
    en: { name: "Khaybar", info: "A fortified oasis about 150 km north of Medina." },
    ar: { name: "خيبر", info: "واحة محصنة على نحو ١٥٠ كم شمال المدينة." } },
  { id: "mutah", event: "mutah",
    fr: { name: "Mu'ta", info: "Plus de 1 000 km vers le nord, à l'est de la mer Morte. Le Prophète ﷺ n'y participe pas." },
    en: { name: "Mu'tah", info: "Over 1,000 km north, east of the Dead Sea. The Prophet ﷺ did not take part." },
    ar: { name: "مؤتة", info: "أكثر من ١٠٠٠ كم شمالًا، شرق البحر الميت. ولم يشهدها النبي ﷺ." } },
  { id: "conquest", event: "conquest",
    fr: { name: "Ouverture de La Mecque", info: "Dix mille hommes marchent de Médine vers La Mecque en Ramadan de l'an 8." },
    en: { name: "Opening of Mecca", info: "Ten thousand men march from Medina to Mecca in Ramadan of year 8." },
    ar: { name: "فتح مكة", info: "سار عشرة آلاف من المدينة إلى مكة في رمضان سنة ٨." } },
  { id: "tabuk", event: "tabuk",
    fr: { name: "Tabuk", info: "Environ 700 km vers le nord, dans la chaleur de l'été : la plus longue expédition qu'il ait conduite." },
    en: { name: "Tabuk", info: "About 700 km north, in the summer heat: the longest expedition he led." },
    ar: { name: "تبوك", info: "نحو ٧٠٠ كم شمالًا في حر الصيف: أبعد غزوة خرج فيها." } },
  { id: "farewell", event: "farewell",
    fr: { name: "Pèlerinage d'adieu", info: "De Médine à La Mecque, puis Mina, 'Arafat et Muzdalifa : les rites du hajj tels qu'on les accomplit encore aujourd'hui." },
    en: { name: "Farewell Pilgrimage", info: "From Medina to Mecca, then Mina, 'Arafat and Muzdalifah: the rites of hajj as they are still performed today." },
    ar: { name: "حجة الوداع", info: "من المدينة إلى مكة، ثم منى وعرفات ومزدلفة: مناسك الحج كما تؤدى اليوم." } }
];

/* Croissance de la communauté : effectifs rapportés par les sources (approximatifs) */
SIRA.growth = [
  { event: "badr", year: 624, value: 313,
    fr: "Badr", en: "Badr", ar: "بدر" },
  { event: "hudaybiyya", year: 628, value: 1400,
    fr: "al-Hudaybiyya", en: "al-Hudaybiyya", ar: "الحديبية" },
  { event: "conquest", year: 630, value: 10000,
    fr: "Ouverture de La Mecque", en: "Opening of Mecca", ar: "فتح مكة" },
  { event: "tabuk", year: 630, value: 30000,
    fr: "Tabuk", en: "Tabuk", ar: "تبوك" },
  { event: "farewell", year: 632, value: 100000,
    fr: "Pèlerinage d'adieu", en: "Farewell Pilgrimage", ar: "حجة الوداع" }
];

/* Rapports de forces lors des grandes batailles (estimations classiques) */
SIRA.battles = [
  { event: "badr", muslims: 313, opponents: 1000,
    fr: "Badr", en: "Badr", ar: "بدر", ah: 2 },
  { event: "uhud", muslims: 700, opponents: 3000,
    fr: "Uhud", en: "Uhud", ar: "أحد", ah: 3 },
  { event: "khandaq", muslims: 3000, opponents: 10000,
    fr: "Le Fossé", en: "The Trench", ar: "الخندق", ah: 5 }
];

/* Famille */
SIRA.lineage = [
  { fr: "'Abd Manaf", en: "'Abd Manaf", ar: "عبد مناف" },
  { fr: "Hashim", en: "Hashim", ar: "هاشم" },
  { fr: "'Abd al-Muttalib", en: "'Abd al-Muttalib", ar: "عبد المطلب" },
  { fr: "'Abdullah & Amina", en: "'Abdullah & Amina", ar: "عبد الله وآمنة" }
];

SIRA.children = [
  { fr: "al-Qasim", en: "al-Qasim", ar: "القاسم", note: { fr: "mort en bas âge", en: "died in infancy", ar: "مات صغيرًا" } },
  { fr: "Zaynab", en: "Zaynab", ar: "زينب" },
  { fr: "Ruqayya", en: "Ruqayya", ar: "رقية" },
  { fr: "Umm Kulthum", en: "Umm Kulthum", ar: "أم كلثوم" },
  { fr: "Fatima", en: "Fatima", ar: "فاطمة", note: { fr: "seule à lui survivre", en: "the only one to outlive him", ar: "الوحيدة التي عاشت بعده" } },
  { fr: "'Abdullah", en: "'Abdullah", ar: "عبد الله", note: { fr: "mort en bas âge", en: "died in infancy", ar: "مات صغيرًا" } },
  { fr: "Ibrahim", en: "Ibrahim", ar: "إبراهيم", mother: "maria", note: { fr: "fils de Mariya, mort enfant", en: "son of Mariyah, died as a child", ar: "ابن مارية، مات صغيرًا" } }
];

SIRA.wives = [
  { fr: "Khadija bint Khuwaylid", en: "Khadija bint Khuwaylid", ar: "خديجة بنت خويلد" },
  { fr: "Sawda bint Zam'a", en: "Sawda bint Zam'a", ar: "سودة بنت زمعة" },
  { fr: "'Aïcha bint Abi Bakr", en: "'A'isha bint Abi Bakr", ar: "عائشة بنت أبي بكر" },
  { fr: "Hafsa bint 'Umar", en: "Hafsa bint 'Umar", ar: "حفصة بنت عمر" },
  { fr: "Zaynab bint Khuzayma", en: "Zaynab bint Khuzayma", ar: "زينب بنت خزيمة" },
  { fr: "Umm Salama", en: "Umm Salama", ar: "أم سلمة" },
  { fr: "Zaynab bint Jahsh", en: "Zaynab bint Jahsh", ar: "زينب بنت جحش" },
  { fr: "Juwayriya bint al-Harith", en: "Juwayriya bint al-Harith", ar: "جويرية بنت الحارث" },
  { fr: "Umm Habiba", en: "Umm Habiba", ar: "أم حبيبة" },
  { fr: "Safiyya bint Huyayy", en: "Safiyya bint Huyayy", ar: "صفية بنت حيي" },
  { fr: "Maymuna bint al-Harith", en: "Maymuna bint al-Harith", ar: "ميمونة بنت الحارث" }
];

/* Versets mis en avant (texte arabe + sens) */
SIRA.verses = {
  mercy: {
    ar: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ",
    fr: "Et Nous ne t'avons envoyé qu'en miséricorde pour les mondes.",
    en: "And We have not sent you except as a mercy to the worlds.",
    ref: { fr: "Sourate al-Anbiya', 21:107", en: "Surat al-Anbiya', 21:107", ar: "سورة الأنبياء، الآية ١٠٧" }
  },
  character: {
    ar: "وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ",
    fr: "Et tu es certes d'une moralité éminente.",
    en: "And indeed, you are of a great moral character.",
    ref: { fr: "Sourate al-Qalam, 68:4", en: "Surat al-Qalam, 68:4", ar: "سورة القلم، الآية ٤" }
  }
};

/* Quiz */
SIRA.quiz = [
  { event: "birth", answer: 0,
    fr: { q: "Comment appelle-t-on l'année de la naissance du Prophète ﷺ ?", o: ["L'Année de l'Éléphant", "L'Année de la tristesse", "L'Année des délégations", "L'Année de l'Hégire"] },
    en: { q: "What is the year of the Prophet's ﷺ birth called?", o: ["The Year of the Elephant", "The Year of Sorrow", "The Year of Delegations", "The Year of the Hijra"] },
    ar: { q: "بماذا يُعرف العام الذي وُلد فيه النبي ﷺ؟", o: ["عام الفيل", "عام الحزن", "عام الوفود", "عام الهجرة"] } },
  { event: "khadija", answer: 2,
    fr: { q: "Quel surnom les Mecquois lui donnaient-ils avant la prophétie ?", o: ["As-Siddiq", "Al-Faruq", "Al-Amin", "Sayf Allah"] },
    en: { q: "What name did the Meccans give him before prophethood?", o: ["As-Siddiq", "Al-Faruq", "Al-Amin", "Sayf Allah"] },
    ar: { q: "بأي لقب عرفه أهل مكة قبل البعثة؟", o: ["الصدّيق", "الفاروق", "الأمين", "سيف الله"] } },
  { event: "revelation", answer: 1,
    fr: { q: "Où eut lieu la première révélation ?", o: ["Dans la grotte de Thawr", "Dans la grotte de Hira", "Sur le mont Uhud", "À Ta'if"] },
    en: { q: "Where did the first revelation take place?", o: ["In the cave of Thawr", "In the cave of Hira", "On Mount Uhud", "In Ta'if"] },
    ar: { q: "أين كان بدء الوحي؟", o: ["غار ثور", "غار حراء", "جبل أحد", "الطائف"] } },
  { event: "revelation", answer: 3,
    fr: { q: "Quel est le premier mot révélé du Coran ?", o: ["Bismillah", "Al-hamdu", "Qul", "Iqra' (Lis)"] },
    en: { q: "What is the first revealed word of the Qur'an?", o: ["Bismillah", "Al-hamdu", "Qul", "Iqra' (Read)"] },
    ar: { q: "ما أول كلمة نزلت من القرآن؟", o: ["بسم الله", "الحمد", "قل", "اقرأ"] } },
  { event: "abyssinia", answer: 0,
    fr: { q: "Quel souverain accorda sa protection aux musulmans émigrés ?", o: ["Le Négus d'Abyssinie", "Héraclius", "Khosro", "Le Muqawqis"] },
    en: { q: "Which ruler gave protection to the Muslim emigrants?", o: ["The Negus of Abyssinia", "Heraclius", "Khosrow", "The Muqawqis"] },
    ar: { q: "أي ملك أجار المهاجرين من المسلمين؟", o: ["النجاشي ملك الحبشة", "هرقل", "كسرى", "المقوقس"] } },
  { event: "hijra", answer: 1,
    fr: { q: "Dans quelle grotte se cacha-t-il pendant l'Hégire ?", o: ["Hira", "Thawr", "Uhud", "Quba'"] },
    en: { q: "In which cave did he hide during the Hijra?", o: ["Hira", "Thawr", "Uhud", "Quba'"] },
    ar: { q: "في أي غار اختبأ أثناء الهجرة؟", o: ["حراء", "ثور", "أحد", "قباء"] } },
  { event: "hijra", answer: 2,
    fr: { q: "En quelle année grégorienne commence le calendrier de l'Hégire ?", o: ["570", "610", "622", "632"] },
    en: { q: "In which Gregorian year does the Hijri calendar begin?", o: ["570", "610", "622", "632"] },
    ar: { q: "في أي سنة ميلادية يبدأ التقويم الهجري؟", o: ["٥٧٠", "٦١٠", "٦٢٢", "٦٣٢"] } },
  { event: "khandaq", answer: 0,
    fr: { q: "Qui conseilla de creuser un fossé autour de Médine ?", o: ["Salman al-Farisi", "Khalid ibn al-Walid", "'Umar ibn al-Khattab", "Bilal"] },
    en: { q: "Who advised digging a trench around Medina?", o: ["Salman al-Farisi", "Khalid ibn al-Walid", "'Umar ibn al-Khattab", "Bilal"] },
    ar: { q: "من أشار بحفر الخندق حول المدينة؟", o: ["سلمان الفارسي", "خالد بن الوليد", "عمر بن الخطاب", "بلال"] } },
  { event: "hudaybiyya", answer: 3,
    fr: { q: "Quel traité le Coran appelle-t-il « une victoire éclatante » ?", o: ["Le pacte des vertueux", "Le serment d'al-'Aqaba", "La charte de Médine", "Le traité d'al-Hudaybiyya"] },
    en: { q: "Which treaty does the Qur'an call \"a clear victory\"?", o: ["The Pact of the Virtuous", "The pledge of al-'Aqaba", "The Charter of Medina", "The Treaty of al-Hudaybiyya"] },
    ar: { q: "أي صلح سمّاه القرآن «فتحًا مبينًا»؟", o: ["حلف الفضول", "بيعة العقبة", "صحيفة المدينة", "صلح الحديبية"] } },
  { event: "conquest", answer: 1,
    fr: { q: "Que dit-il aux Mecquois le jour de l'ouverture de La Mecque ?", o: ["« Rendez-vous ou combattez »", "« Allez, vous êtes libres »", "« Quittez la ville »", "« Payez une rançon »"] },
    en: { q: "What did he tell the Meccans on the day Mecca was opened?", o: ["\"Surrender or fight\"", "\"Go, you are free\"", "\"Leave the city\"", "\"Pay a ransom\""] },
    ar: { q: "ماذا قال لقريش يوم فتح مكة؟", o: ["«استسلموا أو قاتلوا»", "«اذهبوا فأنتم الطلقاء»", "«اخرجوا من مكة»", "«افدوا أنفسكم»"] } },
  { event: "death", answer: 2,
    fr: { q: "À quel âge le Prophète ﷺ est-il décédé ?", o: ["53 ans", "60 ans", "63 ans", "70 ans"] },
    en: { q: "At what age did the Prophet ﷺ pass away?", o: ["53", "60", "63", "70"] },
    ar: { q: "كم كان عمر النبي ﷺ عند وفاته؟", o: ["٥٣ سنة", "٦٠ سنة", "٦٣ سنة", "٧٠ سنة"] } }
];
