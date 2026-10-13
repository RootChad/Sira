# Sira — la vie du Prophète Muhammad ﷺ

Un site web pour apprendre et faire connaître la **Sira**, la vie du Prophète Muhammad ﷺ, à l'aide de visualisations : frise chronologique, carte des itinéraires, chiffres clés, famille et quiz.

Disponible en **français**, **anglais** et **arabe** (avec mise en page de droite à gauche). Conçu d'abord pour le **mobile**.

## Le voyage

La page s'ouvre sur un **voyage immersif**, pensé comme un film : **un chapitre = un écran**. Un geste (molette, glissement, flèche du clavier) fait passer au chapitre suivant, et la scène s'anime d'elle-même : la foule se forme, le tracé se dessine, la caméra avance lentement. Le bouton lecture de la barre du bas déroule le voyage tout seul, au rythme du texte.

- **36 scènes** dessinées par le code : la nuit de La Mecque et les oiseaux d'Abraha, la tente de Halima dans le désert, les caravanes de Syrie, la lumière de la grotte de Hira avec le mot « اقرأ », la traversée vers l'Abyssinie, l'arc lumineux de l'Isra' vers Jérusalem, la construction de la mosquée de Médine brique par brique, la boussole de la qibla qui pivote, la Coupole verte…
- **Les foules sont faites de points** : 313 à Badr face à 1 000, les archers d'Uhud qui quittent la colline, le fossé, 10 000 compagnons qui convergent vers La Mecque pendant que tombent les 360 idoles, plus de 100 000 pèlerins à 'Arafat. Une légende indique combien de personnes représente chaque point.
- **Cartes animées** : le tracé de l'Hégire se dessine au défilement, avec le compteur de kilomètres ; les lettres aux souverains partent de Médine vers Jérusalem, Ctésiphon, Aksoum, Alexandrie, Bahreïn et Bosra.
- **Un monde en 3D, sur le vrai relief** (Three.js) : l'Arabie est reconstruite à partir des altitudes satellites (SRTM). La Ka'ba au fond de sa vallée, le Jabal an-Nour, les harra de lave autour de Médine, les monts de Ta'if à 1 600 m, la mer Rouge… La caméra vole d'un lieu à l'autre à chaque chapitre.
- **Le ciel et l'heure** : un ciel physique avec soleil, lune et étoiles. Chaque événement a son heure : la nuit de la révélation à Hira, l'aube de Badr, le coucher du soleil sur La Mecque. Pendant l'Hégire, les nuits et les jours passent, avec un compteur des jours de voyage.
- **Simulations** : les foules (313 à Badr face à 1 000, les archers d'Uhud, le fossé, 10 000 à la conquête, les pèlerins à 'Arafat) sont posées sur le vrai terrain ; les itinéraires épousent le relief ; les lettres aux souverains et les délégations s'élèvent en arcs.
- **Découvertes** : des points lumineux sur la scène s'ouvrent en fiches (23 au total) : pourquoi le fossé fut creusé au nord, le puits de Badr, la colline des archers, la direction de la qibla… avec l'altitude réelle et la distance à la Ka'ba ou à la mosquée du Prophète.
- **Télémétrie** : heure du jour, coordonnées, altitude du sol et kilomètres parcourus s'affichent en direct.
- Sans WebGL (ou en ouvrant le fichier sans serveur), le site reprend automatiquement la version 2D illustrée.
- **Carte sans quitter le récit** : « Voir sur la carte » ouvre une carte par-dessus le chapitre, cadrée sur l'itinéraire ou le lieu ; on la ferme et on retrouve sa place.
- **Barre de vie** en bas de l'écran : année grégorienne, année de l'Hégire, âge, et position sur les 63 années. On peut cliquer pour sauter à un événement. Un menu liste tous les chapitres.
- **Ambiance sonore** facultative (vent, mer, carillon), synthétisée dans le navigateur, sans fichier audio.

Le mouvement est réduit pour les personnes qui l'ont demandé dans leur système (`prefers-reduced-motion`).

## Explorer

| Section | Ce qu'elle montre |
| --- | --- |
| **Carte** | Fond de carte réel (Natural Earth) de l'Arabie, du Cham et de l'Abyssinie. 12 itinéraires animés, zoom sur le Hijaz, lieux cliquables. |
| **En chiffres** | 13 ans à La Mecque et 10 ans à Médine ; croissance de la communauté ; rapport des forces à Badr, Uhud et au Fossé. |
| **Famille** | Lignée, enfants, Mères des croyants. |
| **Quiz** | 11 questions, chacune reliée au chapitre correspondant. |

## Choix éditoriaux

- **Aucune représentation figurée** du Prophète ﷺ ni de ses compagnons. Les illustrations évoquent les lieux (La Mecque, la Ka'ba, le Jabal an-Nour), les paysages et l'art géométrique (étoile à huit branches).
- Les **dates** sont celles retenues le plus souvent par les sources classiques (Ibn Hisham, Ibn Sa'd, al-Mubarakpuri). Quand les savants divergent (date de l'Isra', âge de Khadija…), le texte le signale.
- Les **âges** suivent le calendrier lunaire, comme dans la tradition (53 ans à l'Hégire, 63 ans au décès).
- Les **effectifs** sont des estimations rapportées par les sources ; ils varient selon les récits.

## Lancer le site

Aucun outil de compilation : ce sont des fichiers HTML, CSS et JavaScript.

```bash
# depuis la racine du projet
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Ouvrir `index.html` directement dans le navigateur fonctionne aussi, mais sans la 3D : les modules JavaScript demandent un serveur.

### Publier avec GitHub Pages

Dans le dépôt GitHub : **Settings → Pages → Build and deployment**, choisir *Deploy from a branch*, la branche voulue et le dossier `/ (root)`. Le site sera servi à l'adresse `https://<utilisateur>.github.io/<dépôt>/`.

## Structure

```
index.html          page unique, pictogrammes SVG et illustration d'en-tête
css/style.css       thèmes clair et sombre de l'exploration, mise en page responsive et RTL
css/story.css       le voyage : scène, chapitres, barre de vie
js/story.js         le voyage : chapitres, décors, foules, cartes animées, son
js/data.js          contenu trilingue : événements, lieux, itinéraires, chiffres, famille, quiz
js/i18n.js          textes de l'interface (fr / en / ar)
js/app.js           exploration (carte, chiffres, famille, quiz) et langue
js/world.js         le monde 3D du voyage : relief, ciel, caméra, foules, découvertes (module ES)
js/world-data.js    réglages de chaque plan (lieu, heure, cadrage) et fiches « découverte » (fr / en / ar)
js/vendor/          Three.js 0.169 et son ciel (Sky.js), licence MIT, fournis avec le site
js/map-data.js      contour des terres, lieux et itinéraires projetés (généré)
data/terrain/       cartes d'altitude en PNG 16 bits (générées)
tools/              scripts de génération de la carte et du relief
```

### Modifier le contenu

Tout le contenu se trouve dans `js/data.js`. Chaque événement a la forme :

```js
{
  id: "hijra", year: 622, ah: 1, age: "53", period: "medina",
  icon: "route", place: "medina", route: "hijra",
  fr: { title: "…", summary: "…", details: "…" },
  en: { … },
  ar: { … }
}
```

`ah` est négatif pour les années avant l'Hégire. Pour placer un événement dans le voyage, ajoutez-le à la liste `CHAPTERS` de `js/story.js` en choisissant sa scène (`scene`), et éventuellement une foule (`crowd`) ou un effet (`fx`).

### Régénérer la carte

Pour ajouter un lieu ou modifier un itinéraire, éditer `tools/generate-map.mjs` (coordonnées en longitude/latitude) puis :

```bash
cd tools
npm install
npm run map
```

### Régénérer le relief

Les altitudes du monde 3D viennent des *Terrain Tiles* (AWS Open Data). Pour changer une zone ou sa précision, éditer `AREAS` dans `tools/generate-terrain.mjs`, puis :

```bash
cd tools
npm install
npm run terrain   # télécharge les tuiles (curl) et écrit data/terrain/*.png et index.json
```

Chaque PNG garde l'altitude en mètres + 1000 sur 16 bits (rouge = octet fort, vert = octet faible). Pour placer la caméra d'un chapitre ou ajouter une découverte, éditer `js/world-data.js` (coordonnées en longitude/latitude).

## Sources

- Ibn Hisham, *as-Sira an-Nabawiyya*
- Ibn Sa'd, *at-Tabaqat al-Kubra*
- Safiur-Rahman al-Mubarakpuri, *ar-Rahiq al-Makhtum* (Le Nectar cacheté)
- Fond de carte : [Natural Earth](https://www.naturalearthdata.com/) (domaine public), via `world-atlas`
- Relief : [Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / AWS Open Data), compilées à partir de SRTM, GMTED2010 et ETOPO1 (USGS, NOAA, NASA)
- Moteur 3D : [Three.js](https://threejs.org/) (licence MIT)

صلى الله عليه وسلم
