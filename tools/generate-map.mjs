import fs from 'fs';
import {feature} from 'topojson-client';
import {geoMercator, geoPath} from 'd3-geo';
const topo = JSON.parse(fs.readFileSync(new URL('./node_modules/world-atlas/land-50m.json', import.meta.url)));
const land = feature(topo, topo.objects.land);
const W = 600, H = 760;
const bbox = {type:'Feature',geometry:{type:'MultiPoint',coordinates:[[31.5,10.5],[50,35]]}};
const proj = geoMercator().fitExtent([[0,0],[W,H]], bbox);
proj.clipExtent([[-5,-5],[W+5,H+5]]);
const path = geoPath(proj).digits(1);
const d = path(land);
const places = {
  mecca:[39.826,21.4225], medina:[39.611,24.468], taif:[40.415,21.27], badr:[38.774,23.728],
  uhud:[39.613,24.505], khaybar:[39.29,25.70], hudaybiyya:[39.62,21.45], hunayn:[40.10,21.55],
  tabuk:[36.57,28.38], mutah:[35.70,31.08], bosra:[36.48,32.52], aksum:[38.72,14.13],
  abwa:[39.10,23.10], thawr:[39.85,21.38], quba:[39.617,24.439], jerusalem:[35.235,31.778],
  yanbu:[38.06,24.09], shuaybah:[39.4,20.9]
};
const out = {};
for (const [k,v] of Object.entries(places)) { const p = proj(v); out[k]=[+p[0].toFixed(1), +p[1].toFixed(1)]; }
const labels = {hijaz:[41.4,22.7],najd:[44.5,24.5],yemen:[45,15.5],sham:[37.3,33.8],habasha:[38,12.2],redsea:[36.4,24.1],gulf:[49.3,27.4],egypt:[32.4,27]};
const lab = {};
for (const [k,v] of Object.entries(labels)) { const p = proj(v); lab[k]=[+p[0].toFixed(1), +p[1].toFixed(1)]; }
const P = places;
const routes = {
  syria:[P.mecca,[39.5,23.0],P.medina,[37.92,26.6],P.tabuk,[36.2,30.2],P.bosra],
  abyssinia:[P.mecca,P.shuaybah,[39.2,18.5],[39.65,15.3],P.aksum],
  taif:[P.mecca,[40.15,21.38],P.taif],
  isra:[P.mecca,[37.2,27.5],P.jerusalem],
  hijra:[P.mecca,P.thawr,[39.45,21.7],[39.15,22.4],[38.95,23.1],[38.98,23.7],[39.35,24.2],P.quba,P.medina],
  badr:[P.medina,[39.1,24.1],P.badr],
  khaybar:[P.medina,[39.45,25.1],P.khaybar],
  hudaybiyya:[P.medina,[39.3,23.3],[39.45,22.3],P.hudaybiyya],
  conquest:[P.medina,[39.4,23.3],[39.6,22.3],P.mecca],
  tabuk:[P.medina,[37.92,26.6],P.tabuk],
  mutah:[P.medina,[37.92,26.6],P.tabuk,[36.2,30.0],P.mutah],
  farewell:[P.medina,[39.4,23.3],[39.6,22.3],P.mecca]
};
const r = {}, km = {};
const hav=(a,b)=>{const R=6371,t=Math.PI/180,dl=(b[1]-a[1])*t,dg=(b[0]-a[0])*t;const h=Math.sin(dl/2)**2+Math.cos(a[1]*t)*Math.cos(b[1]*t)*Math.sin(dg/2)**2;return 2*R*Math.asin(Math.sqrt(h));};
for (const [k,pts] of Object.entries(routes)) { let s=0; for(let i=1;i<pts.length;i++) s+=hav(pts[i-1],pts[i]); km[k]=Math.round(s/10)*10; }
for (const [k,pts] of Object.entries(routes)) r[k] = pts.map(v=>{const p=proj(v);return [+p[0].toFixed(1),+p[1].toFixed(1)];});
fs.writeFileSync(new URL('../js/map-data.js', import.meta.url), `/* Land outline generated from Natural Earth (public domain) via world-atlas, Mercator projection.\n   Routes are approximate, drawn for learning purposes. */\nwindow.SIRA_MAP = ${JSON.stringify({w:W,h:H,land:d,places:out,labels:lab,routes:r})};\n`);
console.log(d.length, out, lab);
