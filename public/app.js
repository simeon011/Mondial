// Мондиал 2026 — прогнози на живо
"use strict";

// български имена на отборите (FIFA код -> име)
const BG = {
  MEX:"Мексико", KOR:"Южна Корея", CZE:"Чехия", RSA:"Южна Африка",
  SUI:"Швейцария", CAN:"Канада", BIH:"Босна и Херцеговина", QAT:"Катар",
  BRA:"Бразилия", MAR:"Мароко", SCO:"Шотландия", HAI:"Хаити",
  TUR:"Турция", PAR:"Парагвай", AUS:"Австралия", USA:"САЩ",
  ECU:"Еквадор", GER:"Германия", CIV:"Кот д'Ивоар", CUW:"Кюрасао",
  NED:"Нидерландия", JPN:"Япония", SWE:"Швеция", TUN:"Тунис",
  BEL:"Белгия", IRN:"Иран", EGY:"Египет", NZL:"Нова Зеландия",
  ESP:"Испания", URU:"Уругвай", CPV:"Кабо Верде", KSA:"Саудитска Арабия",
  FRA:"Франция", NOR:"Норвегия", SEN:"Сенегал", IRQ:"Ирак",
  ARG:"Аржентина", AUT:"Австрия", ALG:"Алжир", JOR:"Йордания",
  POR:"Португалия", COL:"Колумбия", UZB:"Узбекистан", COD:"ДР Конго",
  ENG:"Англия", CRO:"Хърватия", PAN:"Панама", GHA:"Гана",
  // държави на съдии извън 48-те отбора
  ITA:"Италия", POL:"Полша", ROU:"Румъния", SVN:"Словения", SVK:"Словакия",
  UKR:"Украйна", LTU:"Литва", ISR:"Израел", GEO:"Грузия", BUL:"България",
  GUA:"Гватемала", HON:"Хондурас", SLV:"Салвадор", CRC:"Коста Рика",
  PER:"Перу", CHI:"Чили", VEN:"Венецуела", BOL:"Боливия",
  GAM:"Гамбия", ZAM:"Замбия", MOZ:"Мозамбик", KEN:"Кения", LBY:"Либия",
  UAE:"ОАЕ", OMA:"Оман", TJK:"Таджикистан", MAS:"Малайзия", SGP:"Сингапур", CHN:"Китай",
};
const STAGE_BG = {
  "First Stage":"Групова фаза", "Round of 32":"1/16-финали", "Round of 16":"Осминафинали",
  "Quarter-final":"Четвъртфинали", "Quarter-finals":"Четвъртфинали",
  "Semi-final":"Полуфинали", "Semi-finals":"Полуфинали",
  "Play-off for third place":"Мач за 3-то място", "Final":"Финал",
};

const name = code => BG[code] || code;
const flag = code => code ? `<img src="https://api.fifa.com/api/v3/picture/flags-sq-2/${code}" alt="${code}">` : "";
const pc = p => (100 * p).toFixed(0) + "%";
const pc1 = p => (100 * p).toFixed(1) + "%";

// ---- модел (общ със сървъра — всички сметки са в model.js) ----
// Тук само тънки препратки, които подават текущите данни (DATA) на общия модел.
const clamp = Model.clamp;
const compositeLambdas = m => Model.compositeLambdas(DATA, m);
const predictFromLambdas = Model.predictFromLambdas;
const predictCards = (m, we) => Model.predictCards(DATA, m, we);
const predictCorners = (m, lA, lB) => Model.predictCorners(DATA, m, lA, lB);

// текст за все още неопределен отбор (елиминации)
function phText(ph){
  if (!ph) return "очаква се";
  let m;
  if ((m = ph.match(/^1([A-L])$/))) return "1-ви от група " + m[1];
  if ((m = ph.match(/^2([A-L])$/))) return "2-ри от група " + m[1];
  if ((m = ph.match(/^3([A-L]+)$/))) return "3-ти (" + m[1].split("").join("/") + ")";
  if ((m = ph.match(/^W(\d+)$/))) return "Победител от мач " + m[1];
  if ((m = ph.match(/^L(\d+)$/))) return "Загубил от мач " + m[1];
  if ((m = ph.match(/^([A-L])(\d)$/))) return "Група " + m[1];
  return ph;
}

// ---- състояние ----
let DATA = null;
let activeTab = "schedule";
let filter = "all";
const openMatches = new Set();

let reloadTimer = null;
function scheduleNext(){
  clearTimeout(reloadTimer);
  const live = DATA && DATA.matches && DATA.matches.some(m => m.status === 3);
  reloadTimer = setTimeout(load, live ? 30e3 : 5 * 60e3);
}

async function load(){
  const status = document.getElementById("status");
  try {
    const r = await fetch("/api/data");
    DATA = await r.json();
    if (DATA.error) throw new Error(DATA.error);
    const live = DATA.matches.some(m => m.status === 3);
    status.innerHTML = "Обновено: " + new Date(DATA.updatedAt).toLocaleTimeString("bg-BG") +
      " · " + DATA.matches.length + " мача · " + (live ? "🔴 на живо — обновяване на 30 сек" : "обновяване на 5 мин");
    renderAccuracy();
    render();
    scheduleNext();
  } catch (e) {
    status.innerHTML = '<span class="err">Грешка при зареждане (' + e.message + ") — нов опит след 30 сек.</span>";
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(load, 30e3);
  }
}

// успеваемост на прогнозите (от сървъра — по завършилите мачове)
function renderAccuracy(){
  const el = document.getElementById("accuracy");
  const a = DATA.accuracy;
  if (!a || !a.outcome.n) { el.innerHTML = ""; return; }
  const pct = o => o.n ? Math.round(100 * o.ok / o.n) : 0;
  el.innerHTML = `🎯 Успеваемост (${a.outcome.n} ${a.outcome.n === 1 ? "мач" : "мача"}): ` +
    `<b>изход ${pct(a.outcome)}%</b> · голове ${pct(a.ou)}% · гол-гол ${pct(a.btts)}%`;
}

function render(){
  document.getElementById("filters").style.display = activeTab === "schedule" ? "flex" : "none";
  const c = document.getElementById("content");
  if (!DATA) return;
  if (activeTab === "schedule") c.innerHTML = renderSchedule();
  else if (activeTab === "groups") c.innerHTML = renderGroups();
  else if (activeTab === "champion") c.innerHTML = renderChampion();
  else if (activeTab === "stats") c.innerHTML = renderLeaderboards();
  else c.innerHTML = renderRefs();
}

// ---- програма ----
function matchPassesFilter(m){
  const today = new Date().toDateString();
  if (filter === "today") return new Date(m.date).toDateString() === today;
  if (filter === "upcoming") return m.status !== 0;
  if (filter === "played") return m.status === 0;
  return true;
}

function refLine(m){
  if (!m.referee) return "";
  const r = DATA.referees[m.referee.id];
  let stats = "";
  if (r && r.matches > 0)
    stats = ` · ${r.matches} ${r.matches === 1 ? "мач" : "мача"} на турнира · ${(r.y / r.matches).toFixed(1)} жълти/мач · ${r.red} червени`;
  else stats = " · първи мач на турнира";
  return `<div class="refline">🧑‍⚖️ ${flag(m.referee.country)} ${m.referee.name} (${name(m.referee.country)})${stats}</div>`;
}

// Множители за прогнозата на играчите в конкретния мач:
// att = колко атакуващ ще е отборът спрямо обичайното му (мащабира удари/точни удари),
// foul = аутсайдер-фактор (изоставащият фаулира повече → мащабира нарушения/картони).
function teamProjMult(code, lam, we, isHome){
  const t = DATA.teamAgg[code];
  const avgGoals = (t && t.matches) ? t.gf / t.matches : 1.35;
  const att = clamp(lam / Math.max(avgGoals, 0.6), 0.65, 1.5);
  const foul = clamp(1 + 0.35 * (isHome ? (1 - 2 * we) : (2 * we - 1)), 0.7, 1.4);
  return { att, foul };
}

// Типични показатели на мач по позиция (за отбори без статистики, щом излезе съставът).
// 0 вратар, 1 защитник, 2 полузащитник, 3 нападател.
const POS_PRIOR = {
  0: { lbl: "Вр",   shots: 0.0, ot: 0.0,  fouls: 0.1, y: 0.05 },
  1: { lbl: "Защ",  shots: 0.5, ot: 0.15, fouls: 1.1, y: 0.22 },
  2: { lbl: "Полу", shots: 1.3, ot: 0.45, fouls: 1.2, y: 0.18 },
  3: { lbl: "Нап",  shots: 2.4, ot: 1.0,  fouls: 0.7, y: 0.12 },
};
const yChance = exp => exp > 0.03 ? (100 * (1 - Math.exp(-exp))).toFixed(0) + "%" : "–";

// Прогнозна статистика на играчите за конкретния мач (удари, точни удари, нарушения, шанс за картон).
// Ред на предимство: 1) реалните данни на играча, ако отборът вече е играл;
// 2) оценка по позиция от обявения състав; 3) отборна оценка (поне нещо конкретно).
function playerProjTable(code, mult, lineupSide, lam){
  const t = DATA.teamAgg[code];
  if (t && t.matches) {
    const players = Object.values(DATA.playerAgg)
      .filter(p => p.team === code && (p.shots + p.goals + p.fouls + p.y + p.r + p.saves) > 0)
      .sort((a, b) => (b.shots + b.goals * 2 + b.fouls) - (a.shots + a.goals * 2 + a.fouls))
      .slice(0, 10);
    if (players.length)
      return `<div class="ptitle">${flag(code)} ${name(code)} — прогноза за мача</div>
      <table class="ptable"><tr><th>Играч</th><th>Удари</th><th>Точни</th><th>Наруш.</th><th>🟨 шанс</th></tr>
      ${players.map(p => `<tr><td>${p.shirt ? p.shirt + ". " : ""}${p.name}${p.saves ? " 🧤" : ""}</td>
        <td>${((p.shots / p.apps) * mult.att).toFixed(1)}</td><td>${((p.onTarget / p.apps) * mult.att).toFixed(1)}</td>
        <td>${((p.fouls / p.apps) * mult.foul).toFixed(1)}</td><td>${yChance((p.y / p.apps) * mult.foul)}</td></tr>`).join("")}
      </table>`;
  }
  if (lineupSide && lineupSide.some(p => p.starter)) {   // съставът е излязъл — оценка по позиция
    const starters = lineupSide.filter(p => p.starter)
      .map(p => ({ ...p, pr: POS_PRIOR[p.pos] || POS_PRIOR[2] }))
      .sort((a, b) => b.pr.shots - a.pr.shots);
    return `<div class="ptitle">${flag(code)} ${name(code)} — прогноза по състав</div>
    <div class="note">Оценка по позиция (отборът още няма статистики на турнира).</div>
    <table class="ptable"><tr><th>Играч</th><th></th><th>Удари</th><th>Точни</th><th>Наруш.</th><th>🟨</th></tr>
    ${starters.map(p => `<tr><td>${p.shirt ? p.shirt + ". " : ""}${p.name}</td><td style="color:var(--faint)">${p.pr.lbl}</td>
      <td>${(p.pr.shots * mult.att).toFixed(1)}</td><td>${(p.pr.ot * mult.att).toFixed(1)}</td>
      <td>${(p.pr.fouls * mult.foul).toFixed(1)}</td><td>${yChance(p.pr.y * mult.foul)}</td></tr>`).join("")}
    </table>`;
  }
  // нито индивидуални данни, нито състав → поне отборна оценка за мача
  const tShots = clamp(4 + (lam || 1.3) * 5, 4, 22);
  const tOnT = tShots * 0.34;
  const tFouls = clamp(11 * mult.foul, 7, 16);
  return `<div class="ptitle">${flag(code)} ${name(code)} — очаквано за отбора</div>
  <div class="note">Индивидуалните числа по играч излизат след първия мач на отбора или щом се обяви съставът (~час преди старта).</div>
  <table class="ptable"><tr><th>Показател</th><th>Прогноза</th></tr>
    <tr><td>Удари</td><td>~${tShots.toFixed(0)}</td></tr>
    <tr><td>Точни удари</td><td>~${tOnT.toFixed(0)}</td></tr>
    <tr><td>Нарушения</td><td>~${tFouls.toFixed(0)}</td></tr>
  </table>`;
}

// детайли за изигран мач: отборна статистика + играчи
function finishedDetails(m){
  const s = m.stats;
  if (!s) return "";
  const h = s.teams[m.home.code], a = s.teams[m.away.code];
  if (!h || !a) return "";
  const row = (l, x, y) => (x == null || y == null) ? "" : `<tr><td>${x}</td><th>${l}</th><td>${y}</td></tr>`;
  const cmp = `<table class="cmptable">
    ${row("Притежание %", h.possession, a.possession)}
    ${row("Удари", h.shots, a.shots)}
    ${row("Точни удари", h.onTarget, a.onTarget)}
    ${row("Корнери", h.corners, a.corners)}
    ${row("Нарушения", h.fouls, a.fouls)}
    ${row("Засади", h.offsides, a.offsides)}
    ${row("Точни пасове %", h.passPct, a.passPct)}
    ${row("Отнемания", h.tacklesEff != null ? h.tacklesEff + "/" + h.tacklesTot : null, a.tacklesEff != null ? a.tacklesEff + "/" + a.tacklesTot : null)}
    ${row("Пресечени топки", h.interceptions, a.interceptions)}
    ${row("Жълти картони", h.y, a.y)}
    ${row("Червени картони", h.r, a.r)}
  </table>`;
  const players = Object.values(s.players)
    .filter(p => (p.shots + p.goals + p.assists + p.fouls + p.foulsSuffered + p.y + p.r + p.saves) > 0)
    .sort((x, y) => x.team === y.team
      ? (y.shots + y.goals * 2 + y.fouls) - (x.shots + x.goals * 2 + x.fouls)
      : (x.team === m.home.code ? -1 : 1));
  const ptable = players.length ? `
  <div class="ptitle">Играчите в мача</div>
  <table class="ptable"><tr><th>Играч</th><th></th><th>Удари</th><th>Точни</th><th>Голове</th><th>Асист.</th><th>Наруш.</th><th>Пострадал</th><th>Картони</th></tr>
  ${players.map(p => `<tr><td>${p.shirt ? p.shirt + ". " : ""}${p.name}${p.saves ? " 🧤" + p.saves : ""}</td><td>${flag(p.team)}</td>
    <td>${p.shots}</td><td>${p.onTarget || 0}</td><td>${p.goals}</td><td>${p.assists || 0}</td><td>${p.fouls}</td><td>${p.foulsSuffered || 0}</td>
    <td>${"🟨".repeat(p.y)}${"🟥".repeat(p.r)}</td></tr>`).join("")}
  </table>` : "";
  return `<div class="details">${cmp}${ptable}</div>`;
}

// Обобщена "примерна прогноза за мача" — на едно място, на разбираем език.
function matchVerdict(m, r, p1, px, p2, cards, corners, ko){
  const A = name(m.home.code), B = name(m.away.code);
  let outcome, op;
  if (p1 >= px && p1 >= p2) { outcome = A + " печели"; op = p1; }
  else if (p2 >= px && p2 >= p1) { outcome = B + " печели"; op = p2; }
  else { outcome = "Равенство"; op = px; }
  const conf = op > 0.60 ? "ясен фаворит" : op > 0.45 ? "лек превес" : "оспорван мач";
  const over = r.over25;
  const overTxt = over >= 0.5 ? `Над 2.5 (${pc(over)})` : `Под 2.5 (${pc(1 - over)})`;
  const bttsTxt = r.btts >= 0.5 ? `Да (${pc(r.btts)})` : `Не (${pc(1 - r.btts)})`;
  const ts = r.top[0];
  const badge = m.lineup ? `<span class="vbadge">✅ съставите излязоха</span>` : "";
  const row = (ic, l, v, sub) => `<div class="vrow"><span>${ic} ${l}</span><b>${v}${sub ? ` <span class="vsub">${sub}</span>` : ""}</b></div>`;
  return `<div class="verdict">
    <div class="verdict-head">📋 Примерна прогноза за мача ${badge}</div>
    ${row("🏆", "Изход", `${outcome} · ${pc(op)}`, conf)}
    ${row("⚽", "Резултат", `${ts.i} : ${ts.j}`, `очаквани голове ${r.lA.toFixed(1)} : ${r.lB.toFixed(1)}`)}
    ${row("📈", "Голове", overTxt, "")}
    ${row("🥅", "Гол-гол", bttsTxt, "и двата да бележат")}
    ${row("🟨", "Картони", `~${cards.y.toFixed(1)} жълти`, `~${cards.r.toFixed(2)} червени`)}
    ${row("⛳", "Корнери", `~${corners.total.toFixed(1)}`, `${A} ${corners.a.toFixed(1)} · ${B} ${corners.b.toFixed(1)}`)}
  </div>`;
}

// Акценти по играчи: най-вероятен стрелец и най-вероятен картон (от двата отбора).
function playerHighlights(m, mh, ma){
  const pool = [];
  const add = (code, mult, lineupSide) => {
    const t = DATA.teamAgg[code];
    if (t && t.matches) {
      Object.values(DATA.playerAgg)
        .filter(p => p.team === code && (p.shots + p.fouls + p.y) > 0)
        .forEach(p => pool.push({ name: p.name, team: code,
          shots: (p.shots / p.apps) * mult.att,
          cardCh: 1 - Math.exp(-(p.y / p.apps) * mult.foul) }));
    } else if (lineupSide && lineupSide.some(p => p.starter)) {
      lineupSide.filter(p => p.starter).forEach(p => {
        const pr = POS_PRIOR[p.pos] || POS_PRIOR[2];
        pool.push({ name: p.name, team: code, shots: pr.shots * mult.att, cardCh: 1 - Math.exp(-pr.y * mult.foul) });
      });
    }
  };
  add(m.home.code, mh, m.lineup ? m.lineup.home : null);
  add(m.away.code, ma, m.lineup ? m.lineup.away : null);
  if (!pool.length) return "";
  const shot = pool.slice().sort((a, b) => b.shots - a.shots)[0];
  const card = pool.slice().sort((a, b) => b.cardCh - a.cardCh)[0];
  return `<div class="phl">🎯 <b>Акценти по играчи:</b> ` +
    `най-много удари — ${flag(shot.team)} ${shot.name} (~${shot.shots.toFixed(1)}) · ` +
    `най-вероятен картон — ${flag(card.team)} ${card.name} (${(card.cardCh * 100).toFixed(0)}%)</div>`;
}

// Жива вероятност за изхода: текущ резултат + очаквани голове за оставащото време.
function liveProb(hs, as, rlA, rlB){
  let p1 = 0, px = 0, p2 = 0;
  for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) {
    const p = Model.pois(rlA, i) * Model.pois(rlB, j);
    const fh = hs + i, fa = as + j;
    if (fh > fa) p1 += p; else if (fh === fa) px += p; else p2 += p;
  }
  return { p1, px, p2 };
}

// Статистика на живо (расте по време на мача).
function liveStatsHtml(m){
  if (!m.liveStats) return "";
  const h = m.liveStats[m.home.code], a = m.liveStats[m.away.code];
  if (!h || !a) return "";
  const bar = (x, y) => { const t = x + y || 1; return `<span class="lsbar"><i style="width:${x / t * 100}%"></i></span>`; };
  const row = (l, x, y, dx, dy) => `<div class="lsrow"><b>${dx != null ? dx : x}</b><span class="lsl">${l}</span><b>${dy != null ? dy : y}</b></div>${bar(x, y)}`;
  const cards = (h.y + a.y + h.r + a.r) > 0 ? row("Картони 🟨🟥", h.y + h.r, a.y + a.r) : "";
  const poss = (h.possession != null && a.possession != null)
    ? row("Притежание", h.possession, a.possession, Math.round(h.possession) + "%", Math.round(a.possession) + "%") : "";
  return `<div class="livestats">
    ${poss}
    ${row("Удари", h.shots, a.shots)}
    ${row("Точни удари", h.onTarget, a.onTarget)}
    ${row("Корнери", h.corners, a.corners)}
    ${row("Нарушения", h.fouls, a.fouls)}
    ${cards}
  </div>`;
}

// Статистика по играч на живо (голове, удари, нарушения, картони).
function livePlayersHtml(m){
  if (!m.livePlayers) return "";
  const side = code => {
    const list = (m.livePlayers[code] || []).slice(0, 6);
    if (!list.length) return `<div class="lpcol"><div class="lpt">${flag(code)} ${name(code)}</div><div class="note">още няма действия</div></div>`;
    return `<div class="lpcol"><div class="lpt">${flag(code)} ${name(code)}</div>${list.map(p => {
      const tags = [
        p.goals ? "⚽".repeat(p.goals) : "",
        p.shots ? `${p.shots} удар${p.shots > 1 ? "а" : ""}` : "",
        p.fouls ? `${p.fouls} наруш.` : "",
        "🟨".repeat(p.y) + "🟥".repeat(p.r),
      ].filter(Boolean).join(" · ");
      return `<div class="lprow"><span class="lpn">${p.shirt ? p.shirt + ". " : ""}${p.name}</span><span class="lpv">${tags}</span></div>`;
    }).join("")}</div>`;
  };
  return `<div class="lptitle">Играчи на живо</div><div class="liveplayers">${side(m.home.code)}${side(m.away.code)}</div>`;
}

// История на преките срещи (H2H).
function h2hLine(m){
  if (!m.h2h) return "";
  const h = m.h2h;
  const games = h.meetings.map(g => `<span class="h2hg">${new Date(g.date).getFullYear()}: ${g.a}–${g.b}</span>`).join("");
  return `<div class="h2h">
    <div class="h2h-head">🤝 Преки срещи (последни ${h.n})</div>
    <div class="h2h-sum">${flag(h.aCode)} ${name(h.aCode)} <b>${h.aW}</b> · ${h.dr} равни · <b>${h.bW}</b> ${name(h.bCode)} ${flag(h.bCode)}</div>
    <div class="h2h-games">${games}</div>
  </div>`;
}

// Кой ще отбележи: шанс всеки играч да вкара поне веднъж в мача.
function topScorers(m, mh, ma){
  const pool = [];
  const add = (code, mult, lineupSide) => {
    const t = DATA.teamAgg[code];
    if (t && t.matches) {
      Object.values(DATA.playerAgg).filter(p => p.team === code).forEach(p => {
        const raw = Math.max(p.goals / p.apps, (p.shots / p.apps) * 0.10);    // голове/мач или ~10% от ударите
        const rate = raw * (p.apps / (p.apps + 1.5));                          // придърпване при малко мачове
        const lam = rate * mult.att;
        if (lam > 0.03) pool.push({ name: p.name, shirt: p.shirt, team: code, p: 1 - Math.exp(-lam) });
      });
    } else if (lineupSide && lineupSide.some(p => p.starter)) {
      const GR = { 0: 0.005, 1: 0.06, 2: 0.18, 3: 0.45 };   // голов рейтинг по позиция
      lineupSide.filter(p => p.starter).forEach(p => {
        const lam = (GR[p.pos] != null ? GR[p.pos] : 0.15) * mult.att;
        pool.push({ name: p.name, shirt: p.shirt, team: code, p: 1 - Math.exp(-lam) });
      });
    }
  };
  add(m.home.code, mh, m.lineup ? m.lineup.home : null);
  add(m.away.code, ma, m.lineup ? m.lineup.away : null);
  if (!pool.length) return "";
  const top = pool.sort((a, b) => b.p - a.p).slice(0, 5);
  return `<div class="ptitle" style="margin-top:14px">⚽ Кой ще отбележи (шанс за гол в мача)</div>
    <div class="scorers">${top.map(p => `<div class="scorer"><span>${flag(p.team)} ${p.shirt ? p.shirt + ". " : ""}${p.name}</span><b>${(p.p * 100).toFixed(0)}%</b></div>`).join("")}</div>`;
}

// Резултат на прогнозата след завършил мач (позна ли — ✅/❌).
function predResultLine(m){
  if (!m.predEval || !m.prediction) return "";
  const e = m.predEval, P = m.prediction;
  const A = name(m.home.code), B = name(m.away.code);
  const pickName = o => o === "1" ? A : o === "2" ? B : "равен";
  const mk = ok => ok ? '<span class="hit">✅</span>' : '<span class="miss">❌</span>';
  const hits = [e.outcome.ok, e.ou.ok, e.btts.ok].filter(Boolean).length;
  return `<div class="predres">
    <div class="predres-head">📋 Прогнозата позна ${hits}/3 ${surpriseBadge(m)}</div>
    <div class="predres-rows">
      <span>${mk(e.outcome.ok)} Изход: ${pickName(P.outcome)}</span>
      <span>${mk(e.ou.ok)} Голове: ${P.ouPick === "over" ? "над 2.5" : "под 2.5"}</span>
      <span>${mk(e.btts.ok)} Гол-гол: ${P.bttsPick === "yes" ? "да" : "не"}</span>
    </div>
  </div>`;
}

// Изненада-индекс: колко малка вероятност моделът даваше на това, което реално стана.
function surpriseBadge(m){
  if (!m.prediction || !m.predEval) return "";
  const P = m.prediction, act = m.predEval.outcome.actual;
  const probActual = act === "1" ? P.p1 : act === "2" ? P.p2 : P.px;
  if (probActual >= 0.5) return "";                    // очакван изход
  if (probActual >= 0.33) return `<span class="surprise s1">🙂 леко изненадващо</span>`;
  if (probActual >= 0.18) return `<span class="surprise s2">😮 изненада</span>`;
  return `<span class="surprise s3">🤯 голяма изненада</span>`;
}

// Маркер "рисков фаворит": ясен, но не смазващ фаворит срещу съперник, който може да накаже.
function riskyFavBadge(homeWin, awayWin, lHome, lAway){
  const favWin = Math.max(homeWin, awayWin);
  const underdogL = homeWin >= awayWin ? lAway : lHome;   // очаквани голове на аутсайдера
  if (favWin >= 0.58 && favWin <= 0.82 && underdogL >= 0.85)
    return `<span class="riskyfav">⚠️ рисков фаворит</span>`;
  return "";
}

function renderMatch(m){
  const time = new Date(m.date).toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" });
  const stage = m.group ? m.group.replace("Group", "Група") : (STAGE_BG[m.stageName] || m.stageName);
  const place = [m.stadium, m.city].filter(Boolean).join(", ");
  const live = m.status === 3;
  const finished = m.status === 0;

  const homeHtml = m.home
    ? `<span>${name(m.home.code)}</span> ${flag(m.home.code)}`
    : `<span class="ph">${phText(m.phA)}</span>`;
  const awayHtml = m.away
    ? `${flag(m.away.code)} <span>${name(m.away.code)}</span>`
    : `<span class="ph">${phText(m.phB)}</span>`;

  let mid, bar = "", details = "", cardsline = "", headBadge = "", liveLine = "";
  const canPredict = m.home && m.away && !finished;
  const predLine = finished ? predResultLine(m) : "";

  if (finished || live) {
    let s = (m.hs ?? "–") + " : " + (m.as ?? "–");
    let cls = "score";
    if (m.hp != null && m.ap != null && (m.hp || m.ap)) { s += ` (${m.hp}:${m.ap} дузпи)`; cls += " pen"; }
    mid = `<div class="${cls}">${s}</div>`;
    if (finished && m.stats) {
      const h = m.stats.teams[m.home.code], a = m.stats.teams[m.away.code];
      if (h && a && (h.y + a.y + h.r + a.r) > 0)
        cardsline = `<div class="cardsline">🟨 ${h.y + a.y} жълти${(h.r + a.r) ? " · 🟥 " + (h.r + a.r) + " червени" : ""} · ⛳ ${h.corners + a.corners} корнера</div>`;
      details = finishedDetails(m);
    }
  } else {
    mid = `<div class="vsmini">${time} ч.</div>`;
  }

  if (canPredict) {
    const comp = compositeLambdas(m);
    const eA = comp.A.e, eB = comp.B.e;
    const r = predictFromLambdas(comp.lA, comp.lB);
    const ko = m.stageName !== "First Stage";
    let p1 = r.p1, px = r.px, p2 = r.p2;
    if (ko) { const sh = 0.5 + (r.we - 0.5) * 0.6; p1 += px * sh; p2 += px * (1 - sh); px = 0; }
    if (live) {   // жива вероятност според текущия резултат и оставащото време
      const ml = Math.max(0, 92 - (m.minute || 0));
      const lp = liveProb(m.hs || 0, m.as || 0, comp.lA * ml / 90, comp.lB * ml / 90);
      p1 = lp.p1; px = lp.px; p2 = lp.p2;
      const evs = (m.liveEvents || []).slice(0, 6).map(e => `<span class="lev">${e.min} ${e.kind}${e.team ? " " + flag(e.team) : ""}</span>`).join("");
      liveLine = `<div class="livebox"><div class="livehdr">🔴 На живо ${m.matchTime || ""} · вероятност за победа сега</div>` +
        `${evs ? `<div class="levs">${evs}</div>` : ""}${liveStatsHtml(m)}${livePlayersHtml(m)}</div>`;
    }
    bar = `<div class="pbar">
      <div class="p1" style="width:${p1 * 100}%">${pc(p1)}</div>
      ${px > 0.01 ? `<div class="px" style="width:${px * 100}%">${pc(px)}</div>` : ""}
      <div class="p2" style="width:${p2 * 100}%">${pc(p2)}</div>
    </div>`;
    headBadge = riskyFavBadge(p1, p2, comp.lA, comp.lB);
    const maxP = r.top[0].p;
    const cards = predictCards(m, r.we);
    const corners = predictCorners(m, r.lA, r.lB);
    const mhMult = teamProjMult(m.home.code, comp.lA, r.we, true);
    const maMult = teamProjMult(m.away.code, comp.lB, r.we, false);
    const tm = (DATA.teamAgg[m.home.code]?.matches || 0) + (DATA.teamAgg[m.away.code]?.matches || 0);
    const srcNote = `<div class="srcnote">⚙️ Прогнозата комбинира: <b>Elo</b> + <b>голов профил</b> (eloratings)` +
      (tm ? ` + <b>статистики</b> от ${tm} ${tm === 1 ? "изигран мач" : "изиграни мача"} (голове, владение, удари — FIFA &amp; ESPN)` : " · тези отбори още нямат мачове на турнира") + `</div>`;
    const bonusTxt = b => b ? ` <span style="color:${b > 0 ? "var(--green)" : "var(--red)"}">${b > 0 ? "+" : ""}${b}</span>` : "";
    details = `<div class="details">
      ${matchVerdict(m, r, p1, px, p2, cards, corners, ko)}
      ${h2hLine(m)}
      ${srcNote}
      <div class="stats">
        <div class="stat"><div class="l">Очакван резултат</div><div class="v">${r.lA.toFixed(1)} : ${r.lB.toFixed(1)}</div></div>
        <div class="stat"><div class="l">Над 2.5 гола</div><div class="v">${pc1(r.over25)}</div></div>
        <div class="stat"><div class="l">Двата бележат</div><div class="v">${pc1(r.btts)}</div></div>
        ${ko ? `<div class="stat"><div class="l">Класиране — ${name(m.home.code)}</div><div class="v">${pc1(p1)}</div></div>` : ""}
        <div class="stat"><div class="l">Сила (Elo + форма)</div><div class="v" style="font-size:.86rem">${comp.A.base}${bonusTxt(comp.A.bonus)} : ${comp.B.base}${bonusTxt(comp.B.bonus)}</div></div>
      </div>
      <div class="stats">
        <div class="stat"><div class="l">Прогноза корнери</div><div class="v">~${corners.total.toFixed(1)}</div>
          <div class="l">${name(m.home.code)} ${corners.a.toFixed(1)} · ${name(m.away.code)} ${corners.b.toFixed(1)}</div></div>
        <div class="stat"><div class="l">Прогноза 🟨 жълти</div><div class="v">~${cards.y.toFixed(1)}</div>
          <div class="l">${name(m.home.code)} ${cards.yHome.toFixed(1)} · ${name(m.away.code)} ${cards.yAway.toFixed(1)}</div>
          <div class="l" style="margin-top:3px; opacity:.75">${m.referee ? "съдия: " + m.referee.name + (cards.hasRef ? "" : " (още няма данни)") : "съдията не е обявен"}</div></div>
        <div class="stat"><div class="l">Прогноза 🟥 червени</div><div class="v">~${cards.r.toFixed(2)}</div>
          <div class="l">${((1 - Math.exp(-cards.r)) * 100).toFixed(0)}% шанс за поне един</div></div>
      </div>
      <div style="font-size:.78rem;color:var(--muted);margin-bottom:6px">Най-вероятни резултати:</div>
      ${r.top.map(s => `<div class="scorerow"><div class="sc">${s.i} : ${s.j}</div>
        <div class="fill" style="width:${s.p / maxP * 45}%"></div><div class="pc">${pc1(s.p)}</div></div>`).join("")}
      <div class="ptitle" style="margin-top:16px">📊 Прогнозна статистика на играчите за този мач</div>
      <div class="note" style="margin-bottom:4px">Нагласено за този съперник (по-атакуващ мач → повече удари; по-слабият отбор → повече нарушения).${m.lineup ? " Съставите излязоха — показани са титулярите." : " За отбори без изиграни мачове прогнозата излиза щом съставите се обявят (~час преди старта)."}</div>
      ${playerHighlights(m, mhMult, maMult)}
      ${topScorers(m, mhMult, maMult)}
      <div class="cols2">
        <div>${playerProjTable(m.home.code, mhMult, m.lineup ? m.lineup.home : null, comp.lA)}</div>
        <div>${playerProjTable(m.away.code, maMult, m.lineup ? m.lineup.away : null, comp.lB)}</div>
      </div>
    </div>`;
  }

  return `<div class="match ${openMatches.has(m.id) ? "open" : ""}" onclick="toggleMatch('${m.id}')">
    <div class="mhead">
      <span>${live ? '<span class="live">● НА ЖИВО</span> · ' : ""}${stage} · мач №${m.matchNumber || "?"} ${headBadge}</span>
      <span>${place}</span>
    </div>
    <div class="mrow">
      <div class="tname home">${homeHtml}</div>${mid}<div class="tname">${awayHtml}</div>
    </div>
    ${liveLine}${bar}${cardsline}${predLine}${refLine(m)}${details}
  </div>`;
}

function renderSchedule(){
  const ms = DATA.matches.filter(matchPassesFilter);
  if (!ms.length) return '<div class="loading">Няма мачове за този филтър.</div>';
  let html = "", lastDay = "";
  for (const m of ms) {
    const day = new Date(m.date).toLocaleDateString("bg-BG", { weekday: "long", day: "numeric", month: "long" });
    if (day !== lastDay) { html += `<div class="dayhead">${day}</div>`; lastDay = day; }
    html += renderMatch(m);
  }
  return html;
}

function toggleMatch(id){
  if (openMatches.has(id)) openMatches.delete(id); else openMatches.add(id);
  render();
}

// ---- групи: реални точки + симулация на оставащите мачове ----
function samplePois(l){
  const L = Math.exp(-l); let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}

function simGroup(groupMatches){
  const codes = [...new Set(groupMatches.flatMap(m => [m.home.code, m.away.code]))];
  const idx = Object.fromEntries(codes.map((c, i) => [c, i]));
  const N = 5000;
  const agg = codes.map(() => ({ pts: 0, pos: [0, 0, 0, 0] }));
  const fixed = [], future = [];
  for (const m of groupMatches) {
    const i = idx[m.home.code], j = idx[m.away.code];
    if (m.status === 0) fixed.push([i, j, m.hs, m.as]);
    else { const c = compositeLambdas(m); future.push([i, j, c.lA, c.lB]); }
  }
  const basePts = codes.map(() => 0), baseGd = codes.map(() => 0), baseGf = codes.map(() => 0);
  for (const [i, j, gi, gj] of fixed) {
    baseGd[i] += gi - gj; baseGd[j] += gj - gi; baseGf[i] += gi; baseGf[j] += gj;
    if (gi > gj) basePts[i] += 3; else if (gi < gj) basePts[j] += 3; else { basePts[i]++; basePts[j]++; }
  }
  for (let s = 0; s < N; s++) {
    const pts = [...basePts], gd = [...baseGd], gf = [...baseGf];
    for (const [i, j, lA, lB] of future) {
      const gi = samplePois(lA), gj = samplePois(lB);
      gd[i] += gi - gj; gd[j] += gj - gi; gf[i] += gi; gf[j] += gj;
      if (gi > gj) pts[i] += 3; else if (gi < gj) pts[j] += 3; else { pts[i]++; pts[j]++; }
    }
    const order = codes.map((_, t) => t).sort((a, b) =>
      pts[b] - pts[a] || gd[b] - gd[a] || gf[b] - gf[a] || Math.random() - 0.5);
    order.forEach((t, pos) => agg[t].pos[pos]++);
    codes.forEach((_, t) => agg[t].pts += pts[t]);
  }
  return codes.map((c, i) => ({
    code: c, now: basePts[i], pts: agg[i].pts / N,
    p1: agg[i].pos[0] / N, p2: agg[i].pos[1] / N, p3: agg[i].pos[2] / N,
  })).sort((a, b) => b.pts - a.pts);
}

function renderGroups(){
  const groups = {};
  for (const m of DATA.matches) {
    if (!m.group || !m.home || !m.away) continue;
    (groups[m.group] = groups[m.group] || []).push(m);
  }
  return Object.keys(groups).sort().map(g => {
    const rows = simGroup(groups[g]);
    const played = groups[g].filter(m => m.status === 0).length;
    return `<div class="gcard">
      <h3>${g.replace("Group", "Група")}</h3>
      <div class="note">${played} от ${groups[g].length} мача изиграни · 5000 симулации на оставащите</div>
      <table><tr><th>Отбор</th><th>Elo</th><th>Точки сега</th><th>Очаквани</th><th>1-во</th><th>2-ро</th><th>3-то</th></tr>
      ${rows.map((r, i) => `<tr class="${i === 0 ? "q1" : i === 1 ? "q2" : ""}">
        <td><div class="teamcell">${flag(r.code)} ${name(r.code)}</div></td>
        <td>${DATA.elo[r.code] || "?"}</td><td>${r.now}</td><td><b>${r.pts.toFixed(1)}</b></td>
        <td>${pc(r.p1)}</td><td>${pc(r.p2)}</td><td>${pc(r.p3)}</td></tr>`).join("")}
      </table></div>`;
  }).join("");
}

// ---- Прогноза за целия турнир (Монте Карло на остатъка) ----
let champCache = null, champKey = null;

function simulateTournament(N){
  const allCodes = Object.keys(DATA.elo);
  const power = {};
  for (const code of allCodes) power[code] = Model.powerElo(DATA, { code }, {}).e;
  const koWin = (a, b) => Math.random() < Model.winExp(power[a] - power[b]) ? a : b;

  // групи + предварително изчислени лямбди за неизиграните групови мачове
  const groups = {};
  const teamGroup = {};
  const lamCache = {};
  for (const m of DATA.matches) {
    if (!m.group || !m.home || !m.away) continue;
    const g = m.group.replace("Group ", "").replace("Група ", "");
    (groups[g] = groups[g] || []).push(m);
    teamGroup[m.home.code] = g; teamGroup[m.away.code] = g;
    if (m.status !== 0) { const c = compositeLambdas(m); lamCache[m.id] = [c.lA, c.lB]; }
  }
  const ko = DATA.matches
    .filter(m => m.stageName && m.stageName !== "First Stage")
    .sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
  const thirdSlots = [...new Set(ko.filter(m => m.stageName === "Round of 32")
    .flatMap(m => [m.phA, m.phB]).filter(ph => /^3[A-L]{2,}$/.test(ph)))];

  function simGroupStandings(g) {
    const teams = {};
    for (const m of groups[g]) { teams[m.home.code] = teams[m.home.code] || { code: m.home.code, group: g, pts: 0, gd: 0, gf: 0 }; teams[m.away.code] = teams[m.away.code] || { code: m.away.code, group: g, pts: 0, gd: 0, gf: 0 }; }
    for (const m of groups[g]) {
      let gh, ga;
      if (m.status === 0) { gh = m.hs; ga = m.as; }
      else { const l = lamCache[m.id]; gh = samplePois(l[0]); ga = samplePois(l[1]); }
      const H = teams[m.home.code], A = teams[m.away.code];
      H.gf += gh; A.gf += ga; H.gd += gh - ga; A.gd += ga - gh;
      if (gh > ga) H.pts += 3; else if (gh < ga) A.pts += 3; else { H.pts++; A.pts++; }
    }
    return Object.values(teams).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || Math.random() - 0.5);
  }

  function assignThirds(qual) {
    const slots = thirdSlots.map(s => ({ ph: s, groups: s.slice(1).split("") })).sort((a, b) => a.groups.length - b.groups.length);
    const res = {}, used = new Set();
    (function bt(i) {
      if (i >= slots.length) return true;
      for (const t of qual) {
        if (used.has(t.code) || !slots[i].groups.includes(t.group)) continue;
        res[slots[i].ph] = t.code; used.add(t.code);
        if (bt(i + 1)) return true;
        used.delete(t.code);
      }
      return false;
    })(0);
    for (const s of slots) if (!res[s.ph]) { const t = qual.find(x => !used.has(x.code)); if (t) { res[s.ph] = t.code; used.add(t.code); } }
    return res;
  }

  const champ = {}, fin = {}, semi = {}, q8 = {}, slotCount = {}, advCount = {};
  for (const c of allCodes) { champ[c] = 0; fin[c] = 0; semi[c] = 0; q8[c] = 0; }

  for (let s = 0; s < N; s++) {
    const slot = {}, thirds = [];
    for (const g of Object.keys(groups)) {
      const st = simGroupStandings(g);
      slot["1" + g] = st[0].code; slot["2" + g] = st[1].code; slot["3" + g] = st[2] ? st[2].code : null;
      if (st[2]) thirds.push(st[2]);
    }
    thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || Math.random() - 0.5);
    const thirdMap = assignThirds(thirds.slice(0, 8));
    const resolve = ph => {
      if (slot[ph] !== undefined) return slot[ph];
      if (/^3[A-L]{2,}$/.test(ph)) return thirdMap[ph];
      const w = ph && ph.match(/^W(\d+)$/);
      return w ? winners[+w[1]] : null;
    };
    const winners = {};
    for (const m of ko) {
      if (m.stageName === "Play-off for third place") continue;
      const a = m.home ? m.home.code : resolve(m.phA);
      const b = m.away ? m.away.code : resolve(m.phB);
      if (!a || !b) continue;
      const mn = m.matchNumber;
      const sc = slotCount[mn] || (slotCount[mn] = { A: {}, B: {} });
      sc.A[a] = (sc.A[a] || 0) + 1; sc.B[b] = (sc.B[b] || 0) + 1;
      if (m.stageName === "Quarter-final") { q8[a]++; q8[b]++; }
      if (m.stageName === "Semi-final") { semi[a]++; semi[b]++; }
      if (m.stageName === "Final") { fin[a]++; fin[b]++; }
      const w = (m.status === 0 && m.winner) ? m.winner : koWin(a, b);
      const ac = advCount[mn] || (advCount[mn] = {});
      ac[w] = (ac[w] || 0) + 1;
      winners[mn] = w;
      if (m.stageName === "Final") champ[w]++;
    }
  }
  const rows = allCodes
    .map(c => ({ code: c, group: teamGroup[c] || "?", champ: champ[c] / N, fin: fin[c] / N, semi: semi[c] / N, q8: q8[c] / N }))
    .filter(t => t.q8 > 0.0005)
    .sort((a, b) => b.champ - a.champ || b.fin - a.fin);
  // данни за схемата: за всеки мач — най-вероятният отбор във всеки слот + предвиденият победител
  const topOf = o => { let best = null, bc = -1; for (const k in o) if (o[k] > bc) { bc = o[k]; best = k; } return best ? { code: best, p: bc / N } : null; };
  const bracket = {};
  for (const m of ko) {
    if (m.stageName === "Play-off for third place") continue;
    const sc = slotCount[m.matchNumber] || { A: {}, B: {} }, ac = advCount[m.matchNumber] || {};
    const a = topOf(sc.A), b = topOf(sc.B);
    let winSide = null;
    if (a && b) winSide = (ac[a.code] || 0) >= (ac[b.code] || 0) ? "A" : "B";
    bracket[m.matchNumber] = { a, b, winSide };
  }
  return { rows, bracket };
}

function renderChampion(){
  if (champKey !== DATA.updatedAt) { champCache = simulateTournament(3000); champKey = DATA.updatedAt; }
  const { rows, bracket } = champCache;
  const playedGroup = DATA.matches.filter(m => m.group && m.status === 0).length;
  const totalGroup = DATA.matches.filter(m => m.group).length;
  const pcc = p => p >= 0.005 ? Math.round(p * 100) + "%" : "—";

  const ko = DATA.matches.filter(m => m.stageName && !["First Stage", "Play-off for third place"].includes(m.stageName));
  const byNum = {}; ko.forEach(m => byNum[m.matchNumber] = m);
  const finalM = ko.find(m => m.stageName === "Final");
  const wlink = ph => { const x = ph && ph.match(/^W(\d+)$/); return x ? +x[1] : null; };

  const cell = (fav, win) => fav
    ? `<div class="bteam${win ? " bwin" : ""}">${flag(fav.code)} <span class="bn">${fav.code}</span> <span class="bp">${pcc(fav.p)}</span></div>`
    : `<div class="bteam bempty">—</div>`;
  const box = m => { const b = bracket[m.matchNumber] || {}; return `<div class="bbox">${cell(b.a, b.winSide === "A")}${cell(b.b, b.winSide === "B")}</div>`; };
  function node(m) {
    if (!m) return "";
    const cA = wlink(m.phA), cB = wlink(m.phB);
    if (cA == null && cB == null) return `<div class="bnode">${box(m)}</div>`;
    return `<div class="bnode"><div class="bkids">${node(byNum[cA])}${node(byNum[cB])}</div><div class="bconn"></div>${box(m)}</div>`;
  }
  const champ0 = rows[0];

  return `<div class="gcard">
    <h3>🏅 Прогнозна схема на турнира</h3>
    <div class="note">3000 симулации на оставащия турнир. Всеки слот показва най-вероятния отбор и шанса му да стигне дотам; зеленото е предвиденият победител. ${playedGroup}/${totalGroup} групови мача изиграни — схемата се обновява след всеки мач. Превърти настрани →</div>
    <div class="champbanner">🏆 Прогнозиран шампион: ${flag(champ0.code)} <b>${name(champ0.code)}</b> · ${pcc(champ0.champ)} · финал ${pcc(champ0.fin)}</div>
    <div class="brackwrap"><div class="bround-heads"><span>1/16</span><span>1/8</span><span>¼</span><span>½</span><span>Финал</span></div>
    <div class="bracket">${node(finalM)}</div></div>
  </div>`;
}

// ---- Класации на турнира ----
function renderLeaderboards(){
  const players = Object.values(DATA.playerAgg);
  const pname = p => `${flag(p.team)} ${p.shirt ? p.shirt + ". " : ""}${p.name}`;
  function board(title, list, valCols){
    if (!list.length) return "";
    return `<div class="gcard">
      <h3>${title}</h3>
      <table><tr><th>#</th><th>Играч</th>${valCols.map(c => `<th>${c.h}</th>`).join("")}</tr>
      ${list.map((p, i) => `<tr class="${i === 0 ? "q1" : ""}"><td>${i + 1}</td>
        <td><div class="teamcell">${pname(p)}</div></td>
        ${valCols.map(c => `<td>${c.f(p)}</td>`).join("")}</tr>`).join("")}
      </table></div>`;
  }
  const top = (key, extra) => players.filter(p => p[key] > 0)
    .sort((a, b) => b[key] - a[key] || (extra ? b[extra] - a[extra] : 0) || a.apps - b.apps).slice(0, 12);

  const scorers = board("⚽ Голмайстори (битка за Златната бутонка)", top("goals", "assists"),
    [{ h: "Голове", f: p => `<b>${p.goals}</b>` }, { h: "Асист.", f: p => p.assists }, { h: "Мачове", f: p => p.apps }]);
  const assists = board("🅰️ Асистенции", top("assists", "goals"),
    [{ h: "Асист.", f: p => `<b>${p.assists}</b>` }, { h: "Голове", f: p => p.goals }]);
  const shots = board("🎯 Най-много удари", top("shots", "onTarget"),
    [{ h: "Удари", f: p => `<b>${p.shots}</b>` }, { h: "Точни", f: p => p.onTarget }, { h: "Голове", f: p => p.goals }]);
  const cards = board("🟨 Най-наказвани", players.filter(p => p.y + p.r > 0).sort((a, b) => (b.y + b.r * 2) - (a.y + a.r * 2) || b.fouls - a.fouls).slice(0, 12),
    [{ h: "🟨", f: p => p.y }, { h: "🟥", f: p => p.r }, { h: "Нарушения", f: p => p.fouls }]);

  // отбори
  const teams = Object.entries(DATA.teamAgg).map(([code, t]) => ({ code, ...t })).filter(t => t.matches);
  const teamBoard = (title, list, cols) => list.length ? `<div class="gcard"><h3>${title}</h3>
    <table><tr><th>#</th><th>Отбор</th>${cols.map(c => `<th>${c.h}</th>`).join("")}</tr>
    ${list.map((t, i) => `<tr class="${i === 0 ? "q1" : ""}"><td>${i + 1}</td><td><div class="teamcell">${flag(t.code)} ${name(t.code)}</div></td>
      ${cols.map(c => `<td>${c.f(t)}</td>`).join("")}</tr>`).join("")}</table></div>` : "";
  const attack = teamBoard("🔥 Най-резултатни отбори", [...teams].sort((a, b) => b.gf / b.matches - a.gf / a.matches).slice(0, 8),
    [{ h: "Голове/мач", f: t => `<b>${(t.gf / t.matches).toFixed(1)}</b>` }, { h: "Общо", f: t => t.gf }, { h: "Мачове", f: t => t.matches }]);
  const defense = teamBoard("🛡️ Най-стегната защита", [...teams].sort((a, b) => a.ga / a.matches - b.ga / b.matches).slice(0, 8),
    [{ h: "Допуснати/мач", f: t => `<b>${(t.ga / t.matches).toFixed(1)}</b>` }, { h: "Общо", f: t => t.ga }]);

  if (!players.length) return '<div class="loading">Още няма изиграни мачове — класациите ще се появят след първите срещи.</div>';
  return scorers + assists + shots + cards + attack + defense;
}

// ---- съдии ----
function renderRefs(){
  const refs = Object.values(DATA.referees).sort((a, b) => b.matches - a.matches || a.name.localeCompare(b.name));
  if (!refs.length) return '<div class="loading">Още няма назначени съдии.</div>';
  return `<div class="gcard">
    <h3>Съдии на турнира</h3>
    <div class="note">Статистиките са от изиграните мачове на Мондиал 2026, които всеки съдия е ръководил.</div>
    <table><tr><th>Съдия</th><th>Държава</th><th>Мачове</th><th>🟨 общо</th><th>🟨/мач</th><th>🟥</th><th>Следващ мач</th></tr>
    ${refs.map(r => {
      const next = r.next
        ? new Date(r.next.date).toLocaleDateString("bg-BG", { day: "numeric", month: "short" }) +
          " · " + (BG[r.next.home] || phText(r.next.home)) + " – " + (BG[r.next.away] || phText(r.next.away))
        : "—";
      return `<tr>
        <td><div class="teamcell">${flag(r.country)} ${r.name}</div></td>
        <td>${name(r.country)}</td><td>${r.matches}</td><td>${r.y}</td>
        <td>${r.matches ? (r.y / r.matches).toFixed(1) : "—"}</td><td>${r.red}</td>
        <td style="font-size:.8rem">${next}</td></tr>`;
    }).join("")}
    </table></div>`;
}

// ---- навигация ----
document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  activeTab = b.dataset.tab;
  render();
}));
document.querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  filter = b.dataset.f;
  render();
}));

load();   // следващите обновявания се пускат от scheduleNext() (30 сек при жив мач, иначе 5 мин)
