# Sira — la vie du Prophète Muhammad ﷺ

Un site web pour apprendre et faire connaître la **Sira**, la vie du Prophète Muhammad ﷺ, à l'aide de visualisations : frise chronologique, carte des itinéraires, chiffres clés, famille et quiz.

Disponible en **français**, **anglais** et **arabe** (avec mise en page de droite à gauche). Conçu d'abord pour le **mobile**.

## Contenu

| Section | Ce qu'elle montre |
| --- | --- |
| **Sa vie en un coup d'œil** | Un ruban des 63 années (570–632) découpé en trois périodes : avant la révélation, La Mecque, Médine. Chaque point est un événement cliquable. |
| **Frise chronologique** | 32 événements, de la naissance au décès, datés dans les deux calendriers (grégorien et hégirien) avec l'âge du Prophète ﷺ. Filtre par période, texte détaillé, lien vers la carte. |
| **Carte** | Fond de carte réel (Natural Earth) de l'Arabie, du Cham et de l'Abyssinie. 12 itinéraires animés (Hégire, caravanes de Syrie, Abyssinie, Ta'if, Isra', Badr, Hudaybiyya…), zoom sur le Hijaz, lieux cliquables. |
| **En chiffres** | 13 ans à La Mecque et 10 ans à Médine ; croissance de la communauté (313 à Badr → plus de 100 000 au pèlerinage d'adieu) ; rapport des forces à Badr, Uhud et au Fossé. |
| **Famille** | Lignée, enfants, Mères des croyants. |
| **Quiz** | 11 questions, chacune reliée à l'événement correspondant. |

Deux versets encadrent le parcours (21:107 et 68:4), avec leur sens dans la langue choisie.

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

Ouvrir `index.html` directement dans le navigateur fonctionne aussi.

### Publier avec GitHub Pages

Dans le dépôt GitHub : **Settings → Pages → Build and deployment**, choisir *Deploy from a branch*, la branche voulue et le dossier `/ (root)`. Le site sera servi à l'adresse `https://<utilisateur>.github.io/<dépôt>/`.

## Structure

```
index.html          page unique, pictogrammes SVG et illustration d'en-tête
css/style.css       thèmes clair (aube) et sombre (nuit), mise en page responsive et RTL
js/data.js          contenu trilingue : événements, lieux, itinéraires, chiffres, famille, quiz
js/i18n.js          textes de l'interface (fr / en / ar)
js/app.js           rendu et interactions
js/map-data.js      contour des terres, lieux et itinéraires projetés (généré)
tools/              script de génération de la carte
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

`ah` est négatif pour les années avant l'Hégire. `icon` renvoie à un symbole `#i-…` défini en haut d'`index.html`.

### Régénérer la carte

Pour ajouter un lieu ou modifier un itinéraire, éditer `tools/generate-map.mjs` (coordonnées en longitude/latitude) puis :

```bash
cd tools
npm install
npm run map
```

## Sources

- Ibn Hisham, *as-Sira an-Nabawiyya*
- Ibn Sa'd, *at-Tabaqat al-Kubra*
- Safiur-Rahman al-Mubarakpuri, *ar-Rahiq al-Makhtum* (Le Nectar cacheté)
- Fond de carte : [Natural Earth](https://www.naturalearthdata.com/) (domaine public), via `world-atlas`

صلى الله عليه وسلم
