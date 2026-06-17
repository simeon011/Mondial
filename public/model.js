// ===== Общ модел за прогнози — ползва се и от сайта (browser), и от сървъра (Node) =====
// Всички функции са "чисти": подават им се данните (data = { elo, history, teamAgg, tournament, referees }).
(function (root) {
  "use strict";

  const HOME_BONUS = 75;
  // среден всевременен рекорд на 48-те финалисти: ~1.66 отбелязани / ~1.19 допуснати на мач.
  // Делим на тези стойности, за да центрираме профилите около 1 (иначе головете се надуват).
  const LEAGUE_GF = 1.66;   // за атаката
  const LEAGUE_GA = 1.19;   // за защитата

  const factCache = [1];
  function fact(k){ if (factCache[k] === undefined) factCache[k] = fact(k - 1) * k; return factCache[k]; }
  const pois = (l, k) => Math.exp(-l) * Math.pow(l, k) / fact(k);
  const winExp = d => 1 / (1 + Math.pow(10, -d / 400));
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;

  function lambdas(eA, eB){
    const we = winExp(eA - eB);
    const total = 2.2 + 1.7 * Math.abs(we - 0.5);   // типичният мач ~2.4 гола; разгромите остават по-високи
    return [Math.max(total * we, .05), Math.max(total * (1 - we), .05)];
  }

  // Многоизточникова "сила": Elo + бонус от представянето в турнира (голова разлика, владение, удари).
  function powerElo(data, team, m){
    let base = (data.elo[team.code] || 1600);
    if (team.code === m.stadiumCountry) base += HOME_BONUS;
    const t = data.teamAgg[team.code];
    let bonus = 0;
    if (t && t.matches){
      const w = t.matches / (t.matches + 2);
      const gd = clamp((t.gf - t.ga) / t.matches, -3, 3);
      let dom = 0, k = 0;
      if (t.possession){ dom += (t.possession / t.matches - 50) / 50; k++; }
      if (t.shots + t.shotsAgainst > 0){ dom += (t.shots - t.shotsAgainst) / (t.shots + t.shotsAgainst); k++; }
      if (k) dom /= k;
      bonus = Math.round(w * (gd * 22 + dom * 35));
    }
    return { base: Math.round(base), e: Math.round(base) + bonus, bonus };
  }

  // Атакуващ/защитен профил (множители около 1) от всевременния голов рекорд + турнира.
  function attackProfile(data, code){
    const att = [], def = [];
    const h = data.history && data.history[code];
    if (h && h.gfpm){ att.push(h.gfpm / LEAGUE_GF); def.push(h.gapm / LEAGUE_GA); }
    const t = data.teamAgg[code];
    if (t && t.matches){
      for (let i = 0; i < t.matches; i++){
        att.push((t.gf / t.matches) / LEAGUE_GF);
        def.push((t.ga / t.matches) / LEAGUE_GA);
      }
      if (t.shots + t.shotsAgainst > 0) att.push((t.shots / (t.shots + t.shotsAgainst)) / 0.5);
    }
    const ma = mean(att), md = mean(def);
    return { att: clamp(ma == null ? 1 : ma, 0.6, 1.6), def: clamp(md == null ? 1 : md, 0.6, 1.6) };
  }

  // Очаквани голове: базови от силата, после коригирани с атака/защита от статистиките.
  function compositeLambdas(data, m){
    const A = powerElo(data, m.home, m), B = powerElo(data, m.away, m);
    let [lA, lB] = lambdas(A.e, B.e);
    const pa = attackProfile(data, m.home.code), pb = attackProfile(data, m.away.code);
    lA = Math.max(lA * Math.sqrt(pa.att * pb.def), 0.05);
    lB = Math.max(lB * Math.sqrt(pb.att * pa.def), 0.05);
    return { A, B, lA, lB };
  }

  function predictFromLambdas(lA, lB){
    let p1 = 0, px = 0, p2 = 0, over25 = 0;
    const scores = [];
    for (let i = 0; i <= 10; i++) for (let j = 0; j <= 10; j++){
      const p = pois(lA, i) * pois(lB, j);
      if (i > j) p1 += p; else if (i === j) px += p; else p2 += p;
      if (i + j >= 3) over25 += p;
      scores.push({ i, j, p });
    }
    scores.sort((a, b) => b.p - a.p);
    return { lA, lB, p1, px, p2, over25, btts: (1 - Math.exp(-lA)) * (1 - Math.exp(-lB)), top: scores.slice(0, 5), we: p1 + 0.5 * px };
  }

  function tournAvg(data){
    const T = data.tournament || { matches: 0, corners: 0, y: 0, r: 0 };
    const n = T.matches;
    return {
      y: (3.8 * 6 + (T.y || 0)) / (6 + n),
      r: (0.16 * 25 + (T.r || 0)) / (25 + n),
      c: (8.5 * 3 + (T.corners || 0)) / (3 + n),
      n,
    };
  }

  function teamShrunk(data, code, stat, prior, w){
    const t = data.teamAgg[code];
    if (!t || !t.matches) return prior;
    return (prior * w + t[stat]) / (w + t.matches);
  }

  function teamRoughness(data, code, avg){
    const t = data.teamAgg[code];
    if (!t || !t.matches) return 1;
    const rate = t.y / t.matches;
    return (1 * 2 + rate / (avg.y / 2)) / (2 + 1);
  }

  function predictCards(data, m, we){
    const avg = tournAvg(data);
    const close = 1 - 2 * Math.abs(we - 0.5);
    let r = avg.r * (0.85 + 0.30 * close);
    const rA = teamRoughness(data, m.home.code, avg);
    const rB = teamRoughness(data, m.away.code, avg);
    let y = avg.y * (0.80 + 0.40 * close) * (rA + rB) / 2;
    if (m.stageName !== "First Stage") { y *= 1.12; r *= 1.15; }
    const ref = m.referee ? data.referees[m.referee.id] : null;
    const hasRef = !!(ref && ref.matches > 0);
    if (hasRef) { const refMul = (ref.y / ref.matches) / avg.y; y *= (2 + refMul) / 3; }
    const wHome = rA * (1 + 0.4 * (1 - 2 * we));
    const wAway = rB * (1 + 0.4 * (2 * we - 1));
    const sum = wHome + wAway || 1;
    return { y, r, hasRef, yHome: y * wHome / sum, yAway: y * wAway / sum };
  }

  function predictCorners(data, m, lA, lB){
    const avg = tournAvg(data);
    const total = lA + lB;
    const ref = 2.8;
    const scale = Math.pow(total / ref, 0.4);
    const tot = avg.c * scale;
    const shareA = total > 0 ? lA / total : 0.5;
    let a = Math.max(tot * (0.5 + (shareA - 0.5) * 1.0), 1);
    let b = Math.max(tot - a, 1);
    a = teamShrunk(data, m.home.code, "corners", a, 3);
    b = teamShrunk(data, m.away.code, "corners", b, 3);
    return { a, b, total: a + b };
  }

  // Цялостна прогноза за мач + готовите "залози" (изход / над-под 2.5 / гол-гол).
  function matchPrediction(data, m){
    const comp = compositeLambdas(data, m);
    const r = predictFromLambdas(comp.lA, comp.lB);
    const ko = m.stageName !== "First Stage";
    let p1 = r.p1, px = r.px, p2 = r.p2;
    if (ko) { const sh = 0.5 + (r.we - 0.5) * 0.6; p1 += px * sh; p2 += px * (1 - sh); px = 0; }
    const cards = predictCards(data, m, r.we);
    const corners = predictCorners(data, m, comp.lA, comp.lB);
    const outcome = (p1 >= px && p1 >= p2) ? "1" : (p2 >= px && p2 >= p1) ? "2" : "X";
    return {
      lA: comp.lA, lB: comp.lB, p1, px, p2,
      over25: r.over25, btts: r.btts, topScore: r.top[0],
      cardsY: cards.y, cardsR: cards.r, corners: corners.total,
      outcome, ouPick: r.over25 >= 0.5 ? "over" : "under", bttsPick: r.btts >= 0.5 ? "yes" : "no",
    };
  }

  // Сравнение на прогнозата с реалния резултат на завършил мач.
  function evaluate(pred, m){
    const hs = m.hs, as = m.as;
    let actual;
    if (hs > as) actual = "1";
    else if (hs < as) actual = "2";
    else if (m.hp != null && m.ap != null && (m.hp || m.ap)) actual = m.hp > m.ap ? "1" : "2";  // дузпи
    else actual = "X";
    const tot = hs + as;
    const ou = tot >= 3 ? "over" : "under";
    const btts = (hs > 0 && as > 0) ? "yes" : "no";
    return {
      outcome: { pick: pred.outcome, actual, ok: pred.outcome === actual },
      ou: { pick: pred.ouPick, actual: ou, ok: pred.ouPick === ou },
      btts: { pick: pred.bttsPick, actual: btts, ok: pred.bttsPick === btts },
    };
  }

  const API = {
    HOME_BONUS, LEAGUE_GF, fact, pois, winExp, clamp, mean, lambdas,
    powerElo, attackProfile, compositeLambdas, predictFromLambdas, tournAvg,
    teamShrunk, teamRoughness, predictCards, predictCorners, matchPrediction, evaluate,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.Model = API;
})(typeof self !== "undefined" ? self : this);
