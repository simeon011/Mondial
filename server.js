// Мондиал 2026 — локален сървър с живи данни
// Източници: Elo от eloratings.net, програма/съдии от api.fifa.com,
// детайлни статистики по играч и отбор от site.api.espn.com
const http = require("http");
const fs = require("fs");
const path = require("path");
const Model = require("./public/model.js");   // общ модел (същия като в сайта)

const PORT = process.env.PORT || 3026;   // Render задава PORT автоматично; локално е 3026
const PUB = path.join(__dirname, "public");
const CACHE_FILE = path.join(__dirname, "stats-cache.json");
const PRED_FILE = path.join(__dirname, "predictions.json");

// замразени прогнози отпреди мача: matchId -> прогноза (за отчитане на успеваемостта)
let predStore = {};
try { predStore = JSON.parse(fs.readFileSync(PRED_FILE, "utf8")); } catch (e) {}

// история на преките срещи (H2H), не се мени — пази се на диска
const H2H_FILE = path.join(__dirname, "h2h-cache.json");
let h2hCache = {};
try { h2hCache = JSON.parse(fs.readFileSync(H2H_FILE, "utf8")); } catch (e) {}

const FIFA_CALENDAR = "https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&count=500&language=en";
const ELO_TSV = "https://eloratings.net/World.tsv";
const ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";

// FIFA код -> код на eloratings.net (сверено по рейтингите на всички 48 отбора)
const ELO_CODES = {
  MEX:"MX", KOR:"KR", CZE:"CZ", RSA:"ZA",
  SUI:"CH", CAN:"CA", BIH:"BA", QAT:"QA",
  BRA:"BR", MAR:"MA", SCO:"SQ", HAI:"HT",
  TUR:"TR", PAR:"PY", AUS:"AU", USA:"US",
  ECU:"EC", GER:"DE", CIV:"CI", CUW:"CW",
  NED:"NL", JPN:"JP", SWE:"SE", TUN:"TN",
  BEL:"BE", IRN:"IR", EGY:"EG", NZL:"NZ",
  ESP:"ES", URU:"UY", CPV:"CV", KSA:"SA",
  FRA:"FR", NOR:"NO", SEN:"SN", IRQ:"IQ",
  ARG:"AR", AUT:"AT", ALG:"DZ", JOR:"JO",
  POR:"PT", COL:"CO", UZB:"UZ", COD:"CD",
  ENG:"EN", CRO:"HR", PAN:"PA", GHA:"GH",
};

// статистики по изигран мач (не се променят — пазят се на диска)
let statsCache = {};
try { statsCache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); } catch (e) {}

let eloCache = { t: 0, data: null };
let matchCache = { t: 0, data: null };
const espnSbCache = {}; // дата -> мачове от ESPN за деня

const loc = a => (a && a[0] ? a[0].Description : null);

async function getElo() {
  if (eloCache.data && Date.now() - eloCache.t < 6 * 3600e3) return eloCache.data;
  const txt = await (await fetch(ELO_TSV)).text();
  const byCode = {};
  txt.split("\n").forEach(l => {
    const c = l.split("\t");
    // колони: 2=код, 3=рейтинг; опашка: ...матчове W D L GF GA (последните две = голове за/против всевременно)
    if (c.length > 3) {
      const n = c.length;
      const matches = Number(c[n - 9]) || 0;
      const gf = Number(c[n - 2]) || 0, ga = Number(c[n - 1]) || 0;
      byCode[c[2]] = {
        elo: Number(c[3]),
        gfpm: matches ? gf / matches : null,   // голове за на мач (всевременно)
        gapm: matches ? ga / matches : null,   // голове против на мач
      };
    }
  });
  const elo = {}, history = {};
  for (const [fifa, code] of Object.entries(ELO_CODES)) {
    const d = byCode[code];
    elo[fifa] = d ? d.elo : null;
    history[fifa] = d ? { gfpm: d.gfpm, gapm: d.gapm } : null;
  }
  const out = { elo, history };
  eloCache = { t: Date.now(), data: out };
  console.log("Elo рейтингите и голевите профили са обновени.");
  return out;
}

function mapTeam(t) {
  if (!t || !t.IdCountry) return null;
  return { code: t.IdCountry, name: loc(t.TeamName) || t.ShortClubName, idTeam: t.IdTeam };
}

async function getMatches() {
  // при мач на живо опресняваме програмата на 25 сек, иначе на 3 мин
  const hasLive = matchCache.data && matchCache.data.some(m => m.status === 3);
  const ttl = hasLive ? 25e3 : 3 * 60e3;
  if (matchCache.data && Date.now() - matchCache.t < ttl) return matchCache.data;
  const j = await (await fetch(FIFA_CALENDAR)).json();
  const ms = (j.Results || []).map(m => {
    const home = mapTeam(m.Home), away = mapTeam(m.Away);
    const refO = (m.Officials || []).find(o => o.OfficialType === 1);
    return {
      id: m.IdMatch,
      stage: m.IdStage,
      stageName: loc(m.StageName),
      group: loc(m.GroupName),
      date: m.Date,
      status: m.MatchStatus,            // 0 = изигран, 3 = на живо, друго = предстоящ
      matchTime: m.MatchTime || null,   // напр. "67'" при мач на живо
      minute: m.MatchTime ? parseInt(m.MatchTime, 10) || 0 : 0,
      matchNumber: m.MatchNumber,
      home, away,
      hs: m.HomeTeamScore, as: m.AwayTeamScore,
      hp: m.HomeTeamPenaltyScore, ap: m.AwayTeamPenaltyScore,
      winner: m.Winner ? (home && m.Winner === home.idTeam ? home.code : away ? away.code : null) : null,
      phA: m.PlaceHolderA, phB: m.PlaceHolderB,
      stadium: m.Stadium ? loc(m.Stadium.Name) : null,
      city: m.Stadium ? loc(m.Stadium.CityName) : null,
      stadiumCountry: m.Stadium ? m.Stadium.IdCountry : null,
      referee: refO ? { id: refO.OfficialId, name: loc(refO.Name), country: refO.IdCountry } : null,
    };
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
  matchCache = { t: Date.now(), data: ms };
  console.log("Програмата е обновена: " + ms.length + " мача.");
  return ms;
}

// ---- ФИФА: събития от мача (корнери, засади + резервен вариант за всичко друго) ----
// типове: 0 = гол, 2 = жълт, 3 = червен, 12 = удар, 15 = засада, 16 = корнер, 18 = нарушение, 57 = спасяване
const blankTeam = () => ({ goals: 0, shots: 0, onTarget: 0, corners: 0, fouls: 0, offsides: 0, y: 0, r: 0 });

async function fetchFifaStats(m) {
  const live = await (await fetch(`https://api.fifa.com/api/v3/live/football/17/285023/${m.stage}/${m.id}`)).json();
  const names = {};
  for (const side of [live.HomeTeam, live.AwayTeam]) {
    for (const p of (side && side.Players) || []) {
      names[p.IdPlayer] = { name: loc(p.PlayerName) || loc(p.ShortName) || "?", shirt: p.ShirtNumber };
    }
  }
  const tl = await (await fetch(`https://api.fifa.com/api/v3/timelines/17/285023/${m.stage}/${m.id}?language=en`)).json();
  const teamOf = id => (m.home && id === m.home.idTeam) ? m.home.code : (m.away ? m.away.code : null);
  const teams = { [m.home.code]: blankTeam(), [m.away.code]: blankTeam() };
  const players = {};
  const P = (e, code) => {
    if (!e.IdPlayer) return null;
    if (!players[e.IdPlayer]) {
      const n = names[e.IdPlayer] || {};
      players[e.IdPlayer] = { name: n.name || "Играч " + e.IdPlayer, shirt: n.shirt || null, team: code, apps: 1, shots: 0, onTarget: 0, goals: 0, assists: 0, fouls: 0, foulsSuffered: 0, y: 0, r: 0, saves: 0 };
    }
    return players[e.IdPlayer];
  };
  for (const e of tl.Event || []) {
    const code = teamOf(e.IdTeam);
    if (!code) continue;
    const t = teams[code], p = P(e, code);
    switch (e.Type) {
      case 0:  t.goals++;    if (p) p.goals++; break;
      case 2:  t.y++;        if (p) p.y++;     break;
      case 3:  t.r++;        if (p) p.r++;     break;
      case 12: t.shots++;    if (p) p.shots++; break;
      case 15: t.offsides++;                   break;
      case 16: t.corners++;                    break;
      case 18: t.fouls++;    if (p) p.fouls++; break;
      case 57: {
        const opp = code === m.home.code ? m.away.code : m.home.code;
        teams[opp].onTarget++;
        break;
      }
    }
  }
  teams[m.home.code].onTarget += teams[m.home.code].goals;
  teams[m.away.code].onTarget += teams[m.away.code].goals;
  return { teams, players };
}

// ---- ESPN: детайлни статистики по играч и отбор ----
const d8 = (date, off = 0) => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + off);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
};

async function espnScoreboard(day) {
  if (espnSbCache[day]) return espnSbCache[day];
  const j = await (await fetch(`${ESPN}/scoreboard?dates=${day}`)).json();
  const evs = (j.events || []).map(e => ({
    id: e.id,
    codes: ((e.competitions && e.competitions[0] && e.competitions[0].competitors) || []).map(c => c.team.abbreviation),
  }));
  espnSbCache[day] = evs;
  return evs;
}

async function findEspnId(m) {
  for (const off of [0, -1, 1]) {
    try {
      const evs = await espnScoreboard(d8(m.date, off));
      const hit = evs.find(e => e.codes.includes(m.home.code) && e.codes.includes(m.away.code));
      if (hit) return hit.id;
    } catch (e) { /* следващ ден */ }
  }
  return null;
}

async function fetchEspnStats(m) {
  const id = await findEspnId(m);
  if (!id) return null;
  const j = await (await fetch(`${ESPN}/summary?event=${id}`)).json();
  const teams = {};
  for (const t of (j.boxscore && j.boxscore.teams) || []) {
    const o = {};
    for (const s of t.statistics || []) {
      const v = Number(s.value != null ? s.value : s.displayValue);
      if (!Number.isNaN(v)) o[s.name] = v;
    }
    teams[t.team.abbreviation] = o;
  }
  const players = {};
  for (const side of j.rosters || []) {
    const code = (side.team && side.team.abbreviation) || (side.homeAway === "home" ? m.home.code : m.away.code);
    for (const p of side.roster || []) {
      if (!p.athlete || !p.stats) continue;
      const st = {};
      for (const s of p.stats) st[s.name] = Number(s.value) || 0;
      if (!(st.appearances > 0)) continue;
      players["e" + p.athlete.id] = {
        name: p.athlete.displayName, shirt: p.jersey || null, team: code,
        pos: p.position ? p.position.abbreviation : null, apps: 1,
        shots: st.totalShots || 0, onTarget: st.shotsOnTarget || 0,
        goals: st.totalGoals || 0, assists: st.goalAssists || 0,
        fouls: st.foulsCommitted || 0, foulsSuffered: st.foulsSuffered || 0,
        y: st.yellowCards || 0, r: st.redCards || 0, saves: st.saves || 0,
      };
    }
  }
  if (!Object.keys(players).length && !Object.keys(teams).length) return null;
  return { teams, players };
}

// обединение: ФИФА е основата, ESPN я обогатява (точни удари, притежание, отнемания...)
function mergeStats(e) {
  const teams = {};
  for (const [code, t] of Object.entries(e.fifaTeams || {})) teams[code] = { ...t };
  if (e.espnTeams) {
    for (const [code, s] of Object.entries(e.espnTeams)) {
      const t = teams[code] = teams[code] || blankTeam();
      if (s.totalShots != null) t.shots = s.totalShots;
      if (s.shotsOnTarget != null) t.onTarget = s.shotsOnTarget;
      if (s.wonCorners != null) t.corners = s.wonCorners;
      if (s.foulsCommitted != null) t.fouls = s.foulsCommitted;
      if (s.offsides != null) t.offsides = s.offsides;
      if (s.yellowCards != null) t.y = s.yellowCards;
      if (s.redCards != null) t.r = s.redCards;
      if (s.possessionPct != null) t.possession = s.possessionPct;
      if (s.effectiveTackles != null) t.tacklesEff = s.effectiveTackles;
      if (s.totalTackles != null) t.tacklesTot = s.totalTackles;
      if (s.interceptions != null) t.interceptions = s.interceptions;
      if (s.passPct != null) t.passPct = Math.round(s.passPct * 100);
    }
  }
  const players = (e.espnPlayers && Object.keys(e.espnPlayers).length) ? e.espnPlayers : (e.fifaPlayers || {});
  return { teams, players, src: e.espnOk ? "espn" : "fifa" };
}

// ---- Състави (титуляри) за предстоящи мачове — налични ~час преди старта ----
// Position: 0 вратар, 1 защитник, 2 полузащитник, 3 нападател; Status===1 = титуляр.
const lineupCache = {}; // matchId -> {home, away} (пази се след като веднъж излезе)

function mapLineup(side) {
  return ((side && side.Players) || []).map(p => ({
    name: loc(p.PlayerName) || loc(p.ShortName) || "?",
    shirt: p.ShirtNumber || null,
    pos: p.Position,
    starter: p.Status === 1,
  }));
}

async function getLineups(matches) {
  const now = Date.now();
  for (const m of matches) {
    if (m.status === 0 || !m.home || !m.away) continue;
    const dt = new Date(m.date).getTime() - now;
    if (dt > 4 * 3600e3 || dt < -3 * 3600e3) continue;   // само скоро започващи (от -3ч до +4ч)
    if (lineupCache[m.id]) { m.lineup = lineupCache[m.id]; continue; }
    try {
      const live = await (await fetch(`https://api.fifa.com/api/v3/live/football/17/285023/${m.stage}/${m.id}`)).json();
      const home = mapLineup(live.HomeTeam), away = mapLineup(live.AwayTeam);
      const ok = home.filter(p => p.starter).length >= 11 && away.filter(p => p.starter).length >= 11;
      if (ok) {
        const lineup = { home, away };
        lineupCache[m.id] = lineup; m.lineup = lineup;
        console.log("Съставите за " + m.home.code + "-" + m.away.code + " излязоха.");
      }
    } catch (e) { /* съставите още не са обявени — ще опитаме пак */ }
  }
}

// Събития на живо за мачовете в момента (голове, картони, смени).
async function getLiveData(matches) {
  for (const m of matches) {
    if (m.status !== 3 || !m.home || !m.away) continue;
    try {
      const tl = await (await fetch(`https://api.fifa.com/api/v3/timelines/17/285023/${m.stage}/${m.id}?language=en`)).json();
      // имена на играчите от състава (за статистиката по играч)
      const names = {};
      try {
        const live = await (await fetch(`https://api.fifa.com/api/v3/live/football/17/285023/${m.stage}/${m.id}`)).json();
        for (const side of [live.HomeTeam, live.AwayTeam]) for (const p of (side && side.Players) || [])
          names[p.IdPlayer] = { name: loc(p.PlayerName) || loc(p.ShortName) || "?", shirt: p.ShirtNumber };
      } catch (e) { /* без имена ще ползваме описанието */ }
      const teamOf = id => (m.home && id === m.home.idTeam) ? m.home.code : (m.away ? m.away.code : null);
      const evs = [];
      const stats = { [m.home.code]: blankTeam(), [m.away.code]: blankTeam() };
      const players = {};
      const P = (pid, code) => {
        if (!pid || !code) return null;
        if (!players[pid]) players[pid] = { team: code, name: (names[pid] && names[pid].name) || "Играч", shirt: names[pid] && names[pid].shirt || null, goals: 0, shots: 0, onTarget: 0, fouls: 0, y: 0, r: 0 };
        return players[pid];
      };
      for (const e of tl.Event || []) {
        const code = teamOf(e.IdTeam), t = code ? stats[code] : null, p = P(e.IdPlayer, code);
        if (t) switch (e.Type) {
          case 0: t.goals++; if (p) p.goals++; break;
          case 2: t.y++; if (p) p.y++; break;
          case 3: t.r++; if (p) p.r++; break;
          case 12: t.shots++; if (p) p.shots++; break;
          case 15: t.offsides++; break;
          case 16: t.corners++; break;
          case 18: t.fouls++; if (p) p.fouls++; break;
          case 57: { const opp = code === m.home.code ? m.away.code : m.home.code; if (stats[opp]) stats[opp].onTarget++; break; }
        }
        const kind = e.Type === 0 ? "⚽" : e.Type === 2 ? "🟨" : e.Type === 3 ? "🟥" : e.Type === 5 ? "🔄" : null;
        if (!kind) continue;
        evs.push({ min: e.MatchMinute || "", team: code, kind, desc: (e.EventDescription && e.EventDescription[0]) ? e.EventDescription[0].Description : "" });
      }
      stats[m.home.code].onTarget += stats[m.home.code].goals;
      stats[m.away.code].onTarget += stats[m.away.code].goals;
      // притежание на топката на живо от ESPN
      try {
        const eid = await findEspnId(m);
        if (eid) {
          const es = await (await fetch(`${ESPN}/summary?event=${eid}`)).json();
          for (const t of (es.boxscore && es.boxscore.teams) || []) {
            const code = t.team.abbreviation;
            const pos = (t.statistics || []).find(x => x.name === "possessionPct");
            if (stats[code] && pos) stats[code].possession = Number(pos.value != null ? pos.value : pos.displayValue);
          }
          // точни удари по играч (свързване по отбор + номер на фланелка)
          const byShirt = {};
          for (const pl of Object.values(players)) if (pl.shirt != null) byShirt[pl.team + "|" + pl.shirt] = pl;
          for (const side of es.rosters || []) {
            const code = side.team && side.team.abbreviation;
            for (const rp of side.roster || []) {
              const st = (rp.stats || []).find(x => x.name === "shotsOnTarget");
              const pl = byShirt[code + "|" + (rp.jersey || "")];
              if (pl && st) pl.onTarget = Number(st.value) || 0;
            }
          }
        }
      } catch (e) { /* без притежание */ }
      m.liveEvents = evs.slice(-12).reverse();
      m.liveStats = stats;
      // активните играчи по отбор (с поне едно действие), подредени по значимост
      const grouped = { [m.home.code]: [], [m.away.code]: [] };
      for (const pl of Object.values(players)) {
        if ((pl.goals + pl.shots + pl.fouls + pl.y + pl.r) > 0 && grouped[pl.team]) grouped[pl.team].push(pl);
      }
      for (const code of Object.keys(grouped))
        grouped[code].sort((a, b) => (b.goals * 3 + b.shots + b.fouls) - (a.goals * 3 + a.shots + a.fouls));
      m.livePlayers = grouped;
    } catch (e) { /* пропускаме */ }
  }
}

// История на преките срещи от ESPN (за предстоящи мачове до ~3 дни напред).
async function getH2H(matches) {
  let changed = false;
  const now = Date.now();
  for (const m of matches) {
    if (m.status === 0 || !m.home || !m.away) continue;
    const dt = new Date(m.date).getTime() - now;
    if (dt > 3 * 24 * 3600e3 || dt < -6 * 3600e3) continue;
    if (h2hCache[m.id]) { m.h2h = h2hCache[m.id]; continue; }
    try {
      const id = await findEspnId(m);
      if (!id) continue;
      const s = await (await fetch(`${ESPN}/summary?event=${id}`)).json();
      const comp = s.header && s.header.competitions && s.header.competitions[0];
      const idToCode = {};
      for (const c of (comp ? comp.competitors : [])) idToCode[c.team.id] = c.team.abbreviation;
      const games = (s.headToHeadGames && s.headToHeadGames[0] && s.headToHeadGames[0].events) || [];
      let aW = 0, bW = 0, dr = 0; const meetings = [];
      for (const g of games) {
        const hC = idToCode[g.homeTeamId], aC = idToCode[g.awayTeamId];
        const hsc = +g.homeTeamScore, asc = +g.awayTeamScore;
        let a, b;
        if (hC === m.home.code) { a = hsc; b = asc; }
        else if (aC === m.home.code) { a = asc; b = hsc; }
        else continue;
        if (a > b) aW++; else if (a < b) bW++; else dr++;
        meetings.push({ date: g.gameDate, a, b });
      }
      if (meetings.length) {
        m.h2h = h2hCache[m.id] = { aCode: m.home.code, bCode: m.away.code, aW, bW, dr, n: meetings.length, meetings: meetings.slice(0, 5) };
        changed = true;
      }
    } catch (e) { /* пропускаме */ }
  }
  if (changed) fs.writeFile(H2H_FILE, JSON.stringify(h2hCache), () => {});
}

async function getAllStats(matches) {
  let changed = false;
  for (const m of matches) {
    if (m.status !== 0 || !m.home || !m.away) continue;
    let entry = statsCache[m.id];
    if (!entry) {
      entry = { fifaTeams: null, fifaPlayers: null, espnTeams: null, espnPlayers: null, espnOk: false };
      try {
        const f = await fetchFifaStats(m);
        entry.fifaTeams = f.teams; entry.fifaPlayers = f.players;
      } catch (e) { console.log("ФИФА статистики за " + m.id + ": " + e.message); continue; }
      statsCache[m.id] = entry;
      changed = true;
      console.log("Статистиките за " + m.home.code + "-" + m.away.code + " са изтеглени (ФИФА).");
    }
    // ESPN се опитва отново, докато успее (понякога се бавят след края на мача)
    if (!entry.espnOk && Date.now() - new Date(m.date).getTime() < 7 * 24 * 3600e3) {
      try {
        const es = await fetchEspnStats(m);
        if (es) {
          entry.espnTeams = es.teams; entry.espnPlayers = es.players; entry.espnOk = true;
          changed = true;
          console.log("Статистиките за " + m.home.code + "-" + m.away.code + " са обогатени (ESPN).");
        }
      } catch (e) { console.log("ESPN статистики за " + m.id + ": " + e.message); }
    }
  }
  if (changed) fs.writeFile(CACHE_FILE, JSON.stringify(statsCache), () => {});
  return statsCache;
}

function buildReferees(matches) {
  const refs = {};
  for (const m of matches) {
    if (!m.referee) continue;
    let r = refs[m.referee.id];
    if (!r) r = refs[m.referee.id] = { name: m.referee.name, country: m.referee.country, matches: 0, y: 0, red: 0, next: null };
    if (m.status === 0 && m.stats) {
      r.matches++;
      for (const t of Object.values(m.stats.teams)) { r.y += t.y; r.red += t.r; }
    } else if (m.status !== 0 && !r.next) {
      r.next = { date: m.date, home: m.home ? m.home.code : m.phA, away: m.away ? m.away.code : m.phB };
    }
  }
  return refs;
}

function buildAggregates(matches) {
  const teamAgg = {};   // сборове по отбор за целия турнир
  const playerAgg = {}; // сборове по играч
  const tournament = { matches: 0, corners: 0, y: 0, r: 0 };
  for (const m of matches) {
    if (m.status !== 0 || !m.stats) continue;
    tournament.matches++;
    for (const [code, t] of Object.entries(m.stats.teams)) {
      const a = teamAgg[code] = teamAgg[code] || { matches: 0, shots: 0, shotsAgainst: 0, onTarget: 0, corners: 0, fouls: 0, y: 0, r: 0, gf: 0, ga: 0, possession: 0 };
      const isHome = code === m.home.code;
      const opp = m.stats.teams[isHome ? m.away.code : m.home.code] || {};
      a.matches++; a.shots += t.shots; a.shotsAgainst += opp.shots || 0; a.onTarget += t.onTarget;
      a.corners += t.corners; a.fouls += t.fouls; a.y += t.y; a.r += t.r;
      a.gf += isHome ? (m.hs || 0) : (m.as || 0);    // официални голове за
      a.ga += isHome ? (m.as || 0) : (m.hs || 0);    // официални голове против
      a.possession += t.possession || 50;
      tournament.corners += t.corners; tournament.y += t.y; tournament.r += t.r;
    }
    for (const [id, p] of Object.entries(m.stats.players)) {
      const a = playerAgg[id] = playerAgg[id] || { name: p.name, shirt: p.shirt, team: p.team, pos: p.pos || null, apps: 0, shots: 0, onTarget: 0, goals: 0, assists: 0, fouls: 0, foulsSuffered: 0, y: 0, r: 0, saves: 0 };
      a.apps += p.apps || 1;
      a.shots += p.shots; a.onTarget += p.onTarget || 0; a.goals += p.goals; a.assists += p.assists || 0;
      a.fouls += p.fouls; a.foulsSuffered += p.foulsSuffered || 0; a.y += p.y; a.r += p.r; a.saves += p.saves || 0;
    }
  }
  return { teamAgg, playerAgg, tournament };
}

// Прогнози + отчитане на успеваемостта. Прогнозата се "замразява", докато мачът е още предстоящ;
// щом започне/свърши, не се пипа — после се сравнява с реалния резултат.
function applyPredictions(matches, referees, agg, eloData) {
  const data = { elo: eloData.elo, history: eloData.history, teamAgg: agg.teamAgg, tournament: agg.tournament, referees };
  // "отзад" данни — само Elo + голов профил, без форма и без реалния резултат (честна оценка)
  const retroData = { elo: eloData.elo, history: eloData.history, teamAgg: {}, tournament: { matches: 0, corners: 0, y: 0, r: 0 }, referees: {} };
  let dirty = false;
  for (const m of matches) {
    if (!m.home || !m.away) continue;
    if (m.status !== 0 && m.status !== 3) {           // предстоящ (не започнал) → опресняваме прогнозата
      predStore[m.id] = Model.matchPrediction(data, m);
      dirty = true;
    } else if (m.status === 0 && m.hs != null && !predStore[m.id]) {
      // вече завършил без замразена прогноза → еднократна "отзад" прогноза от Elo профила
      predStore[m.id] = Object.assign(Model.matchPrediction(retroData, m), { retro: true });
      dirty = true;
    }
    const pred = predStore[m.id];
    if (pred) {
      m.prediction = pred;
      if (m.status === 0 && m.hs != null && m.as != null) m.predEval = Model.evaluate(pred, m);
    }
  }
  if (dirty) fs.writeFile(PRED_FILE, JSON.stringify(predStore), () => {});
  // обобщена успеваемост по завършилите мачове, които имат прогноза
  const acc = { outcome: { n: 0, ok: 0 }, ou: { n: 0, ok: 0 }, btts: { n: 0, ok: 0 } };
  for (const m of matches) {
    if (m.status === 0 && m.predEval)
      for (const k of ["outcome", "ou", "btts"]) { acc[k].n++; if (m.predEval[k].ok) acc[k].ok++; }
  }
  return acc;
}

async function buildData() {
  const [eloData, matches] = await Promise.all([getElo(), getMatches()]);
  const cache = await getAllStats(matches);
  for (const m of matches) m.stats = cache[m.id] ? mergeStats(cache[m.id]) : null;
  await getLineups(matches);
  await getLiveData(matches);
  await getH2H(matches);
  const agg = buildAggregates(matches);
  const referees = buildReferees(matches);
  const accuracy = applyPredictions(matches, referees, agg, eloData);
  return {
    updatedAt: new Date().toISOString(),
    elo: eloData.elo,
    history: eloData.history,
    matches,
    referees,
    accuracy,
    ...agg,
  };
}

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".ico": "image/x-icon" };

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/data")) {
      const data = await buildData();
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(data));
      return;
    }
    let file = req.url.split("?")[0];
    if (file === "/") file = "/index.html";
    const full = path.join(PUB, path.normalize(file));
    if (!full.startsWith(PUB) || !fs.existsSync(full)) {
      res.writeHead(404); res.end("Not found"); return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(full)] || "application/octet-stream" });
    fs.createReadStream(full).pipe(res);
  } catch (e) {
    console.error("Грешка:", e.message);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: e.message }));
  }
});

server.on("error", e => {
  if (e.code === "EADDRINUSE") {
    console.log("Сървърът вече върви на http://localhost:" + PORT);
    process.exit(0);
  }
  throw e;
});

server.listen(PORT, () => {
  console.log("Мондиал 2026 — отвори http://localhost:" + PORT + " в браузъра.");
  console.log("Не затваряй този прозорец, докато ползваш сайта.");
});
