/* Génère les cartes d'altitude du monde 3D (data/terrain/*.png).
   Source : Terrain Tiles (Mapzen / AWS Open Data, format « terrarium »),
   compilées à partir de SRTM, GMTED2010, ETOPO1 et autres données publiques.
   Chaque PNG stocke l'altitude en mètres + 1000 sur 16 bits (rouge = octet fort, vert = octet faible),
   sur une grille régulière en longitude / latitude, la première ligne étant au nord.

   Usage : cd tools && npm install && npm run terrain */
import fs from "fs";
import { execFileSync } from "child_process";
import { PNG } from "pngjs";

const OUT = new URL("../data/terrain/", import.meta.url);
const CACHE = process.env.TILE_CACHE || "/tmp/sira-terrain-tiles";
const SRC = (z, x, y) => `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;

// zones : toute la région, puis le détail des lieux principaux
export const AREAS = {
  far: { lon: [20, 64], lat: [0, 42], step: 0.1, z: 6 }, // jusqu'à l'horizon : Égypte, Corne de l'Afrique, Levant, Iran, Oman
  region: { lon: [31, 51], lat: [10, 36], step: 0.05, z: 7 },
  mecca: { lon: [39.55, 40.5], lat: [21.1, 21.7], step: 0.002, z: 11 }, // La Mecque, Hira, Thawr, Mina, 'Arafat, Ta'if, Hunayn, al-Hudaybiyya
  medina: { lon: [39.45, 39.8], lat: [24.3, 24.62], step: 0.001, z: 12 }, // Médine, Quba', Uhud, les harra
  badr: { lon: [38.62, 38.92], lat: [23.62, 23.88], step: 0.001, z: 12 },
  hijaz: { lon: [38.3, 40.7], lat: [20.9, 25.0], step: 0.01, z: 9 }, // la route de l'Hégire, al-Abwa', Badr, Khaybar au nord
  makka: { lon: [39.77, 39.91], lat: [21.36, 21.48], step: 0.0005, z: 13 } // la vallée de la Ka'ba, Hira, Thawr, Mina
};

fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const tiles = new Map();
function tile(z, x, y) {
  const key = `${z}/${x}/${y}`;
  if (tiles.has(key)) return tiles.get(key);
  const file = `${CACHE}/${z}-${x}-${y}.png`;
  if (!fs.existsSync(file)) execFileSync("curl", ["-s", "-f", "--retry", "3", "-o", file, SRC(z, x, y)]);
  const png = PNG.sync.read(fs.readFileSync(file));
  const h = new Float32Array(256 * 256);
  for (let i = 0; i < h.length; i++) {
    const r = png.data[i * 4], g = png.data[i * 4 + 1], b = png.data[i * 4 + 2];
    h[i] = r * 256 + g + b / 256 - 32768;
  }
  tiles.set(key, h);
  return h;
}
// altitude en un point (pixel mondial à la résolution z), interpolation bilinéaire
function px(z, X, Y) {
  const tx = Math.floor(X / 256), ty = Math.floor(Y / 256);
  return tile(z, tx, ty)[(Math.floor(Y) - ty * 256) * 256 + (Math.floor(X) - tx * 256)];
}
function sample(z, lon, lat) {
  const n = 2 ** z * 256;
  const X = ((lon + 180) / 360) * n - 0.5;
  const r = (lat * Math.PI) / 180;
  const Y = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n - 0.5;
  const x0 = Math.floor(X), y0 = Math.floor(Y), fx = X - x0, fy = Y - y0;
  const a = px(z, x0, y0), b = px(z, x0 + 1, y0), c = px(z, x0, y0 + 1), d = px(z, x0 + 1, y0 + 1);
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

const index = {};
for (const [name, A] of Object.entries(AREAS)) {
  const cols = Math.round((A.lon[1] - A.lon[0]) / A.step) + 1;
  const rows = Math.round((A.lat[1] - A.lat[0]) / A.step) + 1;
  const png = new PNG({ width: cols, height: rows });
  let min = Infinity, max = -Infinity;
  for (let j = 0; j < rows; j++) {
    const lat = A.lat[1] - j * A.step;
    for (let i = 0; i < cols; i++) {
      const lon = A.lon[0] + i * A.step;
      // un peu de lissage sur la grande zone, dont la grille est plus lâche que la source
      let h = sample(A.z, lon, lat);
      if (name === "region" || name === "far") {
        const d = A.step / 3;
        h = (h * 2 + sample(A.z, lon - d, lat) + sample(A.z, lon + d, lat) + sample(A.z, lon, lat - d) + sample(A.z, lon, lat + d)) / 6;
      }
      min = Math.min(min, h); max = Math.max(max, h);
      const v = Math.max(0, Math.min(65535, Math.round(h) + 1000));
      const k = (j * cols + i) * 4;
      png.data[k] = v >> 8; png.data[k + 1] = v & 255; png.data[k + 2] = 0; png.data[k + 3] = 255;
    }
  }
  fs.writeFileSync(new URL(`${name}.png`, OUT), PNG.sync.write(png, { colorType: 2 }));
  index[name] = { lon: A.lon, lat: A.lat, step: A.step, cols, rows, min: Math.round(min), max: Math.round(max) };
  console.log(name, cols + "×" + rows, "altitudes", Math.round(min), "→", Math.round(max), "m");
}
fs.writeFileSync(new URL("index.json", OUT), JSON.stringify(index, null, 1) + "\n");
