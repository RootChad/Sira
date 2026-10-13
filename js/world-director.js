/* Sira — le réalisateur
   Pendant une simulation, la caméra filme comme au cinéma. Chaque phase devient une courte
   séquence de plans : un plan d'ensemble qui situe la scène, puis un plan qui suit ceux qui
   agissent (la cavalerie qui contourne, les champions qui s'avancent, la poignée de sable),
   et enfin un plan rapproché sur la mêlée ou un plan large sur l'issue.
   Les plans se déduisent du déroulé de la bataille : rien n'est écrit à la main. */

const D2R = Math.PI / 180;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const angle = (de, dn) => Math.atan2(de, dn) / D2R; // 0 = nord, 90 = est (comme le cap de la caméra)
const near = (a, b) => ((b - a + 540) % 360) - 180; // écart angulaire le plus court

export function createDirector(battles) {
  let def = null, plans = [], key = "", st = null;

  function reset(b, t, head) {
    def = b; plans = [];
    key = "0:0"; st = { t0: t, head0: head };
  }

  // le découpage d'une phase en plans
  function plan(i) {
    if (plans[i]) return plans[i];
    const ph = def.phases, a = ph[i].p, b = i + 1 < ph.length ? ph[i + 1].p : 1;
    const an = battles.analyze(a, b);
    const cast = an.units.filter((u) => !u.herd);
    const h1 = cast[0] || null;
    let partner = null;
    if (h1) {
      // l'adversaire le plus engagé à proximité, sinon la cible de ses flèches
      const foes = cast.filter((u) => u.side !== h1.side)
        .map((u) => ({ u, d: Math.hypot(u.mid[0] - h1.mid[0], u.mid[1] - h1.mid[1]) }))
        .filter((o) => o.d < 1800 || o.u.id === h1.shoots)
        .sort((x, y) => (y.u.score - y.d * 0.15) - (x.u.score - x.d * 0.15));
      partner = foes.length ? foes[0].u : null;
      const target = h1.shoots && cast.find((u) => u.id === h1.shoots);
      if (target) partner = target;
    }
    const group = h1 ? cast.filter((u) => u.score >= h1.score * 0.45).map((u) => u.id) : [];
    // l'adversaire au contact, pour le plan rapproché de la mêlée
    const foe = h1 && h1.melee ? cast.filter((u) => u.side !== h1.side && u.melee)
      .sort((x, y) => Math.hypot(x.mid[0] - h1.mid[0], x.mid[1] - h1.mid[1]) - Math.hypot(y.mid[0] - h1.mid[0], y.mid[1] - h1.mid[1]))[0] : null;
    const shots = [{ t: 0, type: "establish" }];
    if (h1 && h1.score > 150) {
      const peb = an.pebbles[0];
      const moving = h1.travel > 120, lead = !cast[1] || h1.score > cast[1].score * 1.3;
      const mid = peb ? clamp((peb.p0 - a) / (b - a), 0.2, 0.7) : 0.3;
      if (peb) shots.push({ t: mid, type: "pebbles", ev: peb });
      else if (moving && lead) shots.push({ t: 0.3, type: "track" });
      else if (group.length > 1) shots.push({ t: 0.3, type: "group" });
      else if (moving) shots.push({ t: 0.3, type: "track" });
      else if (partner) shots.push({ t: 0.3, type: "two" });
      else shots.push({ t: 0.3, type: "orbit" });
      if (h1.melee || h1.small) shots.push({ t: Math.max(0.66, mid + 0.25), type: "close" });
      else if (group.length > 1 && shots[1].type !== "group") shots.push({ t: 0.7, type: "group" });
      else shots.push({ t: 0.72, type: "wide" });
    } else {
      // rien ne bouge : la caméra tourne lentement autour du lieu, puis prend du champ
      shots.push({ t: 0.32, type: "orbit" }, { t: 0.72, type: "wide" });
    }
    return (plans[i] = { a, b, h1, partner, foe, group, shots });
  }

  /* la caméra voulue maintenant.
     ctx : { base (plan d'ensemble prévu pour la phase), cur (caméra actuelle), aspect, mobile } */
  function want(p, i, t, ctx) {
    if (!def) return null;
    const P = plan(i);
    const f = clamp((p - P.a) / Math.max(1e-6, P.b - P.a));
    let k = 0;
    for (let j = 0; j < P.shots.length; j++) if (f >= P.shots[j].t) k = j;
    const shot = P.shots[k];
    const nk = i + ":" + k, isNew = nk !== key, newPhase = isNew && key.split(":")[0] !== String(i);
    if (isNew) { key = nk; st = { t0: t, head0: ctx.cur.head }; }
    const lf = clamp((f - shot.t) / ((k + 1 < P.shots.length ? P.shots[k + 1].t : 1) - shot.t));
    const ts = t - st.t0; // le temps du plan : la caméra continue de vivre quand le récit attend la voix
    const base = ctx.base;
    // le recul qui fait tenir un rayon r (km) dans le cadre, selon la forme de l'écran
    const tv = Math.tan(21 * D2R);
    const fit = (r) => clamp(r / Math.min(tv * (ctx.mobile ? 0.8 : 0.95), tv * ctx.aspect * (ctx.mobile ? 0.92 : 0.62)), 0.05, Math.max(0.3, base.dist * 1.5));
    // un cap perpendiculaire à une ligne, du côté où se trouve déjà la caméra (la règle des 180°)
    const across = (dir) => { const a = dir + 90, b = dir - 90; return Math.abs(near(st.head0, a)) < Math.abs(near(st.head0, b)) ? a : b; };
    // sur un écran en hauteur, une ligne se filme dans la profondeur, par-dessus l'épaule de celui qui agit
    const portrait = ctx.aspect < 0.9;
    const frame = (dir, r) => portrait ? { head: dir + 18, dist: fit(r * 0.72), pitch: 27 } : { head: across(dir), dist: fit(r), pitch: 20 };
    // le plan d'ensemble prévu pour la phase, un peu recentré sur ceux qui agissent
    const establish = () => {
      const S = P.group.length && battles.subject(P.group);
      const k = S && Math.hypot(S.x - base.x, S.z - base.z) < base.dist ? 0.35 : 0;
      return { x: lerp(base.x, S ? S.x : 0, k), z: lerp(base.z, S ? S.z : 0, k), dist: base.dist * lerp(1.12, 0.9, smooth(lf)), pitch: base.pitch, head: base.head + lerp(-7, 7, lf) + ts * 0.3 };
    };
    let D = null;
    const h1 = P.h1, pt = P.partner;
    switch (shot.type) {
      case "track": {
        const S = battles.subject([h1.id]);
        if (!S) break;
        const th = angle(h1.dir[0], h1.dir[1]); // le sens de la marche
        // la cavalerie se filme de dos, au galop ; l'infanterie de trois quarts
        const side = portrait ? 30 : 65;
        const head = h1.kind === "cav" ? th : st.head0 + near(st.head0, th + (near(th, st.head0) > 0 ? side : -side));
        const lead = S.r * 0.3; // on laisse de l'espace devant eux
        const len = Math.hypot(h1.dir[0], h1.dir[1]) || 1;
        D = { x: S.x + (h1.dir[0] / len) * lead, z: S.z - (h1.dir[1] / len) * lead, dist: fit(S.r * 1.15), pitch: h1.kind === "cav" ? 16 : 20, head: head + ts * 0.8 };
        break;
      }
      case "two": {
        const S = battles.subject([h1.id, pt.id]);
        if (!S) break;
        const line = angle(pt.mid[0] - h1.mid[0], pt.mid[1] - h1.mid[1]);
        const fr = frame(line, S.r);
        D = { x: S.x, z: S.z, dist: fr.dist, pitch: fr.pitch + 2, head: fr.head + ts * 0.6 };
        break;
      }
      case "group": {
        const S = battles.subject(P.group);
        if (!S) break;
        D = { x: S.x, z: S.z, dist: fit(S.r), pitch: Math.max(18, base.pitch - 2), head: base.head + near(base.head, st.head0) * 0.3 + ts * 0.7 };
        break;
      }
      case "close": {
        // un plan serré, bas, qui tourne lentement autour de l'action
        if (h1.small) {
          const ids = pt && Math.hypot(pt.mid[0] - h1.mid[0], pt.mid[1] - h1.mid[1]) < 300 ? [h1.id, pt.id] : [h1.id];
          const S = battles.subject(ids);
          if (!S) break;
          D = { x: S.x, z: S.z, dist: fit(S.r * 0.8), pitch: 12, head: st.head0 + 25 + ts * 2.2 };
          break;
        }
        // dans la mêlée : la ligne où les deux armées se touchent
        const A = battles.subject([h1.id]), F = P.foe && battles.subject([P.foe.id]);
        if (!A) break;
        const x = F ? (A.x + F.x) / 2 : A.x, z = F ? (A.z + F.z) / 2 : A.z;
        const line = F ? angle(F.x - A.x, -(F.z - A.z)) : st.head0;
        D = { x, z, dist: fit(clamp(A.r * 0.3, 0.05, 0.12)), pitch: 14, head: (F ? frame(line, 0.1).head : st.head0 + 25) + ts * 1.8 };
        break;
      }
      case "orbit":
        D = { x: base.x, z: base.z, dist: base.dist * 0.72, pitch: Math.max(14, base.pitch - 8), head: st.head0 + 10 + ts * 3 };
        break;
      case "pebbles": {
        const e = shot.ev, x = (e.from[0] + e.to[0]) / 2, z = (e.from[1] + e.to[1]) / 2;
        const r = Math.hypot(e.to[0] - e.from[0], e.to[1] - e.from[1]) / 2 + 0.05;
        const fr = frame(angle(e.to[0] - e.from[0], -(e.to[1] - e.from[1])), r);
        D = { x, z, dist: fr.dist, pitch: fr.pitch - 4, head: fr.head + ts * 0.5 };
        break;
      }
      case "wide":
        D = { x: base.x, z: base.z, dist: base.dist * 1.15, pitch: base.pitch + 3, head: base.head + ts * 0.9 };
        break;
    }
    if (!D) D = establish();
    D.isNew = isNew; D.newPhase = newPhase; D.shot = shot.type;
    return D;
  }

  return { reset, want, stop: () => { def = null; } };
}
