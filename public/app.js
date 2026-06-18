// Мондиал 2026 — прогнози на живо (двуезичен: BG / EN)
"use strict";

// ---- език ----
let lang = localStorage.getItem("lang") || "bg";
const loc = () => lang === "bg" ? "bg-BG" : "en-GB";

// имена на отборите по код
const NAMES = {
  bg: {
    MEX:"Мексико", KOR:"Южна Корея", CZE:"Чехия", RSA:"Южна Африка", SUI:"Швейцария", CAN:"Канада",
    BIH:"Босна и Херцеговина", QAT:"Катар", BRA:"Бразилия", MAR:"Мароко", SCO:"Шотландия", HAI:"Хаити",
    TUR:"Турция", PAR:"Парагвай", AUS:"Австралия", USA:"САЩ", ECU:"Еквадор", GER:"Германия",
    CIV:"Кот д'Ивоар", CUW:"Кюрасао", NED:"Нидерландия", JPN:"Япония", SWE:"Швеция", TUN:"Тунис",
    BEL:"Белгия", IRN:"Иран", EGY:"Египет", NZL:"Нова Зеландия", ESP:"Испания", URU:"Уругвай",
    CPV:"Кабо Верде", KSA:"Саудитска Арабия", FRA:"Франция", NOR:"Норвегия", SEN:"Сенегал", IRQ:"Ирак",
    ARG:"Аржентина", AUT:"Австрия", ALG:"Алжир", JOR:"Йордания", POR:"Португалия", COL:"Колумбия",
    UZB:"Узбекистан", COD:"ДР Конго", ENG:"Англия", CRO:"Хърватия", PAN:"Панама", GHA:"Гана",
    ITA:"Италия", POL:"Полша", ROU:"Румъния", SVN:"Словения", SVK:"Словакия", UKR:"Украйна", LTU:"Литва",
    ISR:"Израел", GEO:"Грузия", BUL:"България", GUA:"Гватемала", HON:"Хондурас", SLV:"Салвадор",
    CRC:"Коста Рика", PER:"Перу", CHI:"Чили", VEN:"Венецуела", BOL:"Боливия", GAM:"Гамбия", ZAM:"Замбия",
    MOZ:"Мозамбик", KEN:"Кения", LBY:"Либия", UAE:"ОАЕ", OMA:"Оман", TJK:"Таджикистан", MAS:"Малайзия",
    SGP:"Сингапур", CHN:"Китай",
  },
  en: {
    MEX:"Mexico", KOR:"South Korea", CZE:"Czechia", RSA:"South Africa", SUI:"Switzerland", CAN:"Canada",
    BIH:"Bosnia & Herzegovina", QAT:"Qatar", BRA:"Brazil", MAR:"Morocco", SCO:"Scotland", HAI:"Haiti",
    TUR:"Türkiye", PAR:"Paraguay", AUS:"Australia", USA:"USA", ECU:"Ecuador", GER:"Germany",
    CIV:"Ivory Coast", CUW:"Curaçao", NED:"Netherlands", JPN:"Japan", SWE:"Sweden", TUN:"Tunisia",
    BEL:"Belgium", IRN:"Iran", EGY:"Egypt", NZL:"New Zealand", ESP:"Spain", URU:"Uruguay",
    CPV:"Cape Verde", KSA:"Saudi Arabia", FRA:"France", NOR:"Norway", SEN:"Senegal", IRQ:"Iraq",
    ARG:"Argentina", AUT:"Austria", ALG:"Algeria", JOR:"Jordan", POR:"Portugal", COL:"Colombia",
    UZB:"Uzbekistan", COD:"DR Congo", ENG:"England", CRO:"Croatia", PAN:"Panama", GHA:"Ghana",
    ITA:"Italy", POL:"Poland", ROU:"Romania", SVN:"Slovenia", SVK:"Slovakia", UKR:"Ukraine", LTU:"Lithuania",
    ISR:"Israel", GEO:"Georgia", BUL:"Bulgaria", GUA:"Guatemala", HON:"Honduras", SLV:"El Salvador",
    CRC:"Costa Rica", PER:"Peru", CHI:"Chile", VEN:"Venezuela", BOL:"Bolivia", GAM:"Gambia", ZAM:"Zambia",
    MOZ:"Mozambique", KEN:"Kenya", LBY:"Libya", UAE:"UAE", OMA:"Oman", TJK:"Tajikistan", MAS:"Malaysia",
    SGP:"Singapore", CHN:"China",
  },
};
const STAGES = {
  bg: { "First Stage":"Групова фаза", "Round of 32":"1/16-финали", "Round of 16":"Осминафинали", "Quarter-final":"Четвъртфинали", "Quarter-finals":"Четвъртфинали", "Semi-final":"Полуфинали", "Semi-finals":"Полуфинали", "Play-off for third place":"Мач за 3-то място", "Final":"Финал" },
  en: { "First Stage":"Group stage", "Round of 32":"Round of 32", "Round of 16":"Round of 16", "Quarter-final":"Quarter-final", "Quarter-finals":"Quarter-finals", "Semi-final":"Semi-final", "Semi-finals":"Semi-finals", "Play-off for third place":"Third-place play-off", "Final":"Final" },
};

const L = {
  bg: {
    brandPre:"Мондиал", subtitle:"Прогнози на живо · Elo + статистики от няколко източника",
    tab_schedule:"Програма", tab_groups:"Групи", tab_champion:"Шампион", tab_stats:"Класации", tab_refs:"Съдии", tab_info:"Инфо",
    f_all:"Всички", f_today:"Днес", f_upcoming:"Предстоящи", f_played:"Изиграни",
    loading:"Зареждане…", updated:"Обновено", liveRefresh:"🔴 на живо — обновяване на 20 сек", normalRefresh:"обновяване на 5 мин",
    loadErr:"Грешка при зареждане", retry:"нов опит след 30 сек",
    footer1:'Данни от eloratings.net, api.fifa.com и ESPN — обновяват се автоматично.', footer2:"Прогнозите са вероятности от Elo + голов профил + статистики, не са гаранции.", footer3:"⚠ Залагай само за забавление и с малки суми.",
    acc:"Успеваемост", a_outcome:"изход", a_goals:"голове", a_btts:"гол-гол",
    ph_await:"очаква се", ph_1st:"1-ви от група", ph_2nd:"2-ри от група", ph_3rd:"3-ти", ph_winner:"Победител от мач", ph_loser:"Загубил от мач", ph_group:"Група",
    ref_first:"първи мач на турнира", ref_ypg:"жълти/мач", ref_reds:"червени", ref_at:"на турнира",
    pp_forMatch:"прогноза за мача", pp_byLineup:"прогноза по състав", pp_forTeam:"очаквано за отбора",
    pp_note_pos:"Оценка по позиция (отборът още няма статистики на турнира).", pp_note_team:"Индивидуалните числа по играч излизат след първия мач на отбора или щом се обяви съставът (~час преди старта).",
    th_player:"Играч", th_shots:"Удари", th_ontarget:"Точни", th_fouls:"Наруш.", th_ycChance:"🟨 шанс", th_metric:"Показател", th_pred:"Прогноза",
    m_shots:"Удари", m_ontarget:"Точни удари", m_fouls:"Нарушения",
    pos_gk:"Вр", pos_def:"Защ", pos_mid:"Полу", pos_fwd:"Нап",
    st_possession:"Притежание %", st_corners:"Корнери", st_offsides:"Засади", st_passpct:"Точни пасове %", st_tackles:"Отнемания", st_interceptions:"Пресечени топки", st_yellow:"Жълти картони", st_red:"Червени картони",
    pl_inMatch:"Играчите в мача", th_goals:"Голове", th_assists:"Асист.", th_suffered:"Пострадал", th_cards:"Картони",
    v_title:"Примерна прогноза за мача", v_lineupOut:"✅ съставите излязоха", v_outcome:"Изход", v_wins:"печели", v_draw:"Равенство",
    conf_clear:"ясен фаворит", conf_slight:"лек превес", conf_open:"оспорван мач", v_result:"Резултат", v_expGoals:"очаквани голове",
    v_goals:"Голове", over:"Над 2.5", under:"Под 2.5", v_btts:"Гол-гол", yes:"Да", no:"Не", v_btts_sub:"и двата да бележат",
    v_cards:"Картони", lbl_yellow:"жълти", lbl_red:"червени", v_corners:"Корнери",
    phl_title:"Акценти по играчи:", phl_shots:"най-много удари", phl_card:"най-вероятен картон",
    ls_possession:"Притежание", ls_cards:"Картони 🟨🟥",
    lp_title:"Играчи на живо", lp_none:"още няма действия", lp_fouls:"наруш.", lp_ontarget:"точни",
    h2h_title:"Преки срещи (последни", h2h_draws:"равни",
    ts_title:"⚽ Кой ще отбележи (шанс за гол в мача)",
    pr_hit:"Прогнозата позна", over25:"над 2.5", under25:"под 2.5", yes_l:"да", no_l:"не", draw_l:"равен",
    sp_mild:"🙂 леко изненадващо", sp_surprise:"😮 изненада", sp_big:"🤯 голяма изненада", rf:"⚠️ рисков фаворит",
    live_now:"● НА ЖИВО", m_no:"мач №", time_suffix:" ч.", pens:"дузпи", corners_w:"корнера", live_winprob:"вероятност за победа сега", live_proj:"Прогноза до края",
    src_combines:"Прогнозата комбинира:", src_goalprofile:"голов профил", src_stats:"статистики", src_from:"от", src_statdetail:"(голове, владение, удари — FIFA & ESPN)", src_noMatches:"тези отбори още нямат мачове на турнира",
    st_expResult:"Очакван резултат", st_over25:"Над 2.5 гола", st_btts:"Двата бележат", st_advance:"Класиране —", st_power:"Сила (Elo + форма)",
    st_predcorners:"Прогноза корнери", st_predyellow:"Прогноза 🟨 жълти", st_predred:"Прогноза 🟥 червени",
    ref_label:"съдия:", ref_nodata:"(още няма данни)", ref_notnamed:"съдията не е обявен", red_atleastone:"% шанс за поне един",
    topscores:"Най-вероятни резултати:", pp_section:"📊 Прогнозна статистика на играчите за този мач",
    pp_secnote:"Нагласено за този съперник (по-атакуващ мач → повече удари; по-слабият отбор → повече нарушения).", pp_secnote_lineup:" Съставите излязоха — показани са титулярите.", pp_secnote_wait:" За отбори без изиграни мачове прогнозата излиза щом съставите се обявят (~час преди старта).",
    sched_empty:"Няма мачове за този филтър.",
    grp_played1:"от", grp_played2:"мача изиграни · 5000 симулации на оставащите",
    gh_team:"Отбор", gh_ptsnow:"Точки сега", gh_exp:"Очаквани", gh_1st:"1-во", gh_2nd:"2-ро", gh_3rd:"3-то",
    ch_title:"🏅 Прогнозна схема на турнира", ch_note:"3000 симулации на оставащия турнир. Всеки слот показва най-вероятния отбор и шанса му да стигне дотам; зеленото е предвиденият победител.", ch_note2:"групови мача изиграни — схемата се обновява след всеки мач. Превърти настрани →", ch_banner:"🏆 Прогнозиран шампион:", ch_final:"финал",
    r_final:"Финал",
    lb_scorers:"⚽ Голмайстори (битка за Златната бутонка)", lb_assists:"🅰️ Асистенции", lb_shots:"🎯 Най-много удари", lb_cards:"🟨 Най-наказвани", lb_attack:"🔥 Най-резултатни отбори", lb_defense:"🛡️ Най-стегната защита",
    lh_goals:"Голове", lh_assists:"Асист.", lh_apps:"Мачове", lh_shots:"Удари", lh_ontarget:"Точни", lh_fouls:"Нарушения", lh_team:"Отбор", lh_gpm:"Голове/мач", lh_total:"Общо", lh_gapm:"Допуснати/мач", lb_empty:"Още няма изиграни мачове — класациите ще се появят след първите срещи.",
    rf_title:"Съдии на турнира", rf_note:"Статистиките са от изиграните мачове на Мондиал 2026, които всеки съдия е ръководил.", rfh_ref:"Съдия", rfh_country:"Държава", rfh_matches:"Мачове", rfh_ytotal:"🟨 общо", rfh_ypm:"🟨/мач", rfh_next:"Следващ мач", rf_empty:"Още няма назначени съдии.",
  },
  en: {
    brandPre:"World Cup", subtitle:"Live predictions · Elo + multi-source stats",
    tab_schedule:"Schedule", tab_groups:"Groups", tab_champion:"Winner", tab_stats:"Leaders", tab_refs:"Referees", tab_info:"About",
    f_all:"All", f_today:"Today", f_upcoming:"Upcoming", f_played:"Played",
    loading:"Loading…", updated:"Updated", liveRefresh:"🔴 live — refreshing every 20s", normalRefresh:"refreshing every 5 min",
    loadErr:"Loading error", retry:"retrying in 30s",
    footer1:'Data from eloratings.net, api.fifa.com and ESPN — auto-updated.', footer2:"Predictions are probabilities from Elo + goal profile + stats, not guarantees.", footer3:"⚠ For fun only — bet small if at all.",
    acc:"Accuracy", a_outcome:"outcome", a_goals:"goals", a_btts:"BTTS",
    ph_await:"TBD", ph_1st:"1st of Group", ph_2nd:"2nd of Group", ph_3rd:"3rd", ph_winner:"Winner of match", ph_loser:"Loser of match", ph_group:"Group",
    ref_first:"first match at the tournament", ref_ypg:"yellow/match", ref_reds:"red", ref_at:"at the tournament",
    pp_forMatch:"match projection", pp_byLineup:"lineup projection", pp_forTeam:"team projection",
    pp_note_pos:"Estimated by position (team has no tournament stats yet).", pp_note_team:"Per-player numbers appear after the team's first match or once the lineup is out (~1h before kickoff).",
    th_player:"Player", th_shots:"Shots", th_ontarget:"On tgt", th_fouls:"Fouls", th_ycChance:"🟨 chance", th_metric:"Metric", th_pred:"Projection",
    m_shots:"Shots", m_ontarget:"Shots on target", m_fouls:"Fouls",
    pos_gk:"GK", pos_def:"DEF", pos_mid:"MID", pos_fwd:"FWD",
    st_possession:"Possession %", st_corners:"Corners", st_offsides:"Offsides", st_passpct:"Pass accuracy %", st_tackles:"Tackles", st_interceptions:"Interceptions", st_yellow:"Yellow cards", st_red:"Red cards",
    pl_inMatch:"Players in the match", th_goals:"Goals", th_assists:"Assists", th_suffered:"Fouled", th_cards:"Cards",
    v_title:"Match prediction", v_lineupOut:"✅ lineups out", v_outcome:"Outcome", v_wins:"to win", v_draw:"Draw",
    conf_clear:"clear favourite", conf_slight:"slight edge", conf_open:"toss-up", v_result:"Score", v_expGoals:"expected goals",
    v_goals:"Goals", over:"Over 2.5", under:"Under 2.5", v_btts:"BTTS", yes:"Yes", no:"No", v_btts_sub:"both teams to score",
    v_cards:"Cards", lbl_yellow:"yellow", lbl_red:"red", v_corners:"Corners",
    phl_title:"Player highlights:", phl_shots:"most shots", phl_card:"most likely booking",
    ls_possession:"Possession", ls_cards:"Cards 🟨🟥",
    lp_title:"Live players", lp_none:"no actions yet", lp_fouls:"fouls", lp_ontarget:"on tgt",
    h2h_title:"Head-to-head (last", h2h_draws:"draws",
    ts_title:"⚽ Who'll score (chance to score)",
    pr_hit:"Prediction hit", over25:"over 2.5", under25:"under 2.5", yes_l:"yes", no_l:"no", draw_l:"draw",
    sp_mild:"🙂 mild surprise", sp_surprise:"😮 surprise", sp_big:"🤯 big surprise", rf:"⚠️ risky favourite",
    live_now:"● LIVE", m_no:"match #", time_suffix:"", pens:"pens", corners_w:"corners", live_winprob:"win probability now", live_proj:"Projected final",
    src_combines:"Prediction combines:", src_goalprofile:"goal profile", src_stats:"stats", src_from:"from", src_statdetail:"(goals, possession, shots — FIFA & ESPN)", src_noMatches:"these teams have no tournament matches yet",
    st_expResult:"Expected score", st_over25:"Over 2.5 goals", st_btts:"Both to score", st_advance:"Advance —", st_power:"Power (Elo + form)",
    st_predcorners:"Predicted corners", st_predyellow:"Predicted 🟨 yellow", st_predred:"Predicted 🟥 red",
    ref_label:"ref:", ref_nodata:"(no data yet)", ref_notnamed:"referee not announced", red_atleastone:"% chance of at least one",
    topscores:"Most likely scores:", pp_section:"📊 Projected player stats for this match",
    pp_secnote:"Adjusted for this opponent (more attacking match → more shots; weaker team → more fouls).", pp_secnote_lineup:" Lineups out — starters shown.", pp_secnote_wait:" For teams without matches, projections appear once lineups are out (~1h before kickoff).",
    sched_empty:"No matches for this filter.",
    grp_played1:"of", grp_played2:"matches played · 5000 sims of the rest",
    gh_team:"Team", gh_ptsnow:"Points now", gh_exp:"Expected", gh_1st:"1st", gh_2nd:"2nd", gh_3rd:"3rd",
    ch_title:"🏅 Predicted bracket", ch_note:"3000 simulations of the rest of the tournament. Each slot shows the most likely team and its chance to reach there; green is the predicted winner.", ch_note2:"group matches played — the bracket updates after each match. Scroll sideways →", ch_banner:"🏆 Predicted winner:", ch_final:"final",
    r_final:"Final",
    lb_scorers:"⚽ Top scorers (Golden Boot race)", lb_assists:"🅰️ Assists", lb_shots:"🎯 Most shots", lb_cards:"🟨 Most booked", lb_attack:"🔥 Top-scoring teams", lb_defense:"🛡️ Best defences",
    lh_goals:"Goals", lh_assists:"Assists", lh_apps:"Matches", lh_shots:"Shots", lh_ontarget:"On tgt", lh_fouls:"Fouls", lh_team:"Team", lh_gpm:"Goals/match", lh_total:"Total", lh_gapm:"Conceded/match", lb_empty:"No matches played yet — leaderboards appear after the first games.",
    rf_title:"Tournament referees", rf_note:"Stats are from the Mondial 2026 matches each referee officiated.", rfh_ref:"Referee", rfh_country:"Country", rfh_matches:"Matches", rfh_ytotal:"🟨 total", rfh_ypm:"🟨/match", rfh_next:"Next match", rf_empty:"No referees assigned yet.",
  },
};
const t = k => (L[lang][k] !== undefined ? L[lang][k] : (L.bg[k] !== undefined ? L.bg[k] : k));
const matchesWord = n => lang === "bg" ? (n === 1 ? "мач" : "мача") : (n === 1 ? "match" : "matches");

const name = code => (NAMES[lang][code] || NAMES.bg[code] || code);
const stageName = s => (STAGES[lang][s] || s);
const flag = code => code ? `<img src="https://api.fifa.com/api/v3/picture/flags-sq-2/${code}" alt="${code}">` : "";
const pc = p => (100 * p).toFixed(0) + "%";
const pc1 = p => (100 * p).toFixed(1) + "%";

// ---- модел (общ със сървъра — всички сметки са в model.js) ----
const clamp = Model.clamp;
const compositeLambdas = m => Model.compositeLambdas(DATA, m);
const predictFromLambdas = Model.predictFromLambdas;
const predictCards = (m, we) => Model.predictCards(DATA, m, we);
const predictCorners = (m, lA, lB) => Model.predictCorners(DATA, m, lA, lB);

// текст за все още неопределен отбор (елиминации)
function phText(ph){
  if (!ph) return t("ph_await");
  let m;
  if ((m = ph.match(/^1([A-L])$/))) return t("ph_1st") + " " + m[1];
  if ((m = ph.match(/^2([A-L])$/))) return t("ph_2nd") + " " + m[1];
  if ((m = ph.match(/^3([A-L]+)$/))) return t("ph_3rd") + " (" + m[1].split("").join("/") + ")";
  if ((m = ph.match(/^W(\d+)$/))) return t("ph_winner") + " " + m[1];
  if ((m = ph.match(/^L(\d+)$/))) return t("ph_loser") + " " + m[1];
  if ((m = ph.match(/^([A-L])(\d)$/))) return t("ph_group") + " " + m[1];
  return ph;
}
const groupLabel = g => t("ph_group") + " " + g.replace("Group ", "").replace("Група ", "");

// ---- състояние ----
let DATA = null;
let activeTab = "schedule";
let filter = "all";
const openMatches = new Set();
let flashing = false;        // true само при тих ъпдейт на живи карти → светва промененото
const liveSnap = {};         // предишните живи стойности (за засичане на промяна)
let lastSig = "";            // подпис на изгледа (структура) — за да решим пълно или тихо обновяване

// ---- интерфейс (преводим): табове, филтри, заглавие, статус ----
const TABS = [["schedule","📅"],["groups","🏆"],["champion","🏅"],["stats","📊"],["refs","🧑‍⚖️"],["info","ℹ️"]];
const FILTERS = ["all","today","upcoming","played"];
function renderChrome(){
  document.documentElement.lang = lang;
  document.getElementById("brand").innerHTML = `${t("brandPre")} <span>2026</span>`;
  document.getElementById("subtitle").textContent = t("subtitle");
  document.getElementById("footer").innerHTML = `<p>${t("footer1")}</p><p>${t("footer2")}</p><p class="warn">${t("footer3")}</p>`;
  document.querySelectorAll(".langbtn").forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
  document.getElementById("tabs").innerHTML = TABS.map(([id, ic]) => `<button class="tab${id === activeTab ? " active" : ""}" data-tab="${id}"><span class="ic">${ic}</span> ${t("tab_" + id)}</button>`).join("");
  document.getElementById("filters").innerHTML = FILTERS.map(f => `<button class="chip${f === filter ? " active" : ""}" data-f="${f}">${t("f_" + f)}</button>`).join("");
}
function setStatus(){
  const status = document.getElementById("status");
  if (!DATA) return;
  const live = DATA.matches.some(m => m.status === 3);
  status.innerHTML = t("updated") + ": " + new Date(DATA.updatedAt).toLocaleTimeString(loc()) +
    " · " + DATA.matches.length + " " + matchesWord(DATA.matches.length) + " · " + (live ? t("liveRefresh") : t("normalRefresh"));
}

let reloadTimer = null;
function scheduleNext(){
  clearTimeout(reloadTimer);
  const live = DATA && DATA.matches && DATA.matches.some(m => m.status === 3);
  reloadTimer = setTimeout(load, live ? 20e3 : 5 * 60e3);
}

async function load(){
  try {
    const r = await fetch("/api/data");
    DATA = await r.json();
    if (DATA.error) throw new Error(DATA.error);
    setStatus();
    renderAccuracy();
    const sig = viewSig();
    if (sig !== lastSig) render();   // структурата се смени (нов мач/статус/таб) → пълно прерисуване
    else if (activeTab === "schedule" && DATA.matches.some(m => m.status === 3)) liveTick();   // тих ъпдейт само на живите карти
    scheduleNext();
  } catch (e) {
    document.getElementById("status").innerHTML = '<span class="err">' + t("loadErr") + " (" + e.message + ") — " + t("retry") + ".</span>";
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(load, 30e3);
  }
}

function renderAccuracy(){
  const el = document.getElementById("accuracy");
  const a = DATA && DATA.accuracy;
  if (!a || !a.outcome.n) { el.innerHTML = ""; return; }
  const pct = o => o.n ? Math.round(100 * o.ok / o.n) : 0;
  el.innerHTML = `🎯 ${t("acc")} (${a.outcome.n} ${matchesWord(a.outcome.n)}): ` +
    `<b>${t("a_outcome")} ${pct(a.outcome)}%</b> · ${t("a_goals")} ${pct(a.ou)}% · ${t("a_btts")} ${pct(a.btts)}%`;
}

// обвиваме таблиците, за да се скролват настрани на тесен екран (телефон)
function wrapTables(root){
  root.querySelectorAll("table").forEach(tb => {
    if (tb.parentElement && tb.parentElement.classList.contains("tscroll")) return;
    const w = document.createElement("div"); w.className = "tscroll";
    tb.parentNode.insertBefore(w, tb); w.appendChild(tb);
  });
}

function viewSig(){
  return activeTab + "|" + filter + "|" + lang + "|" + (DATA ? DATA.matches.map(m => m.id + m.status).join(",") : "");
}

// Тих ъпдейт: пресъздава САМО картите на живите мачове (без да пипа останалата страница),
// а промененото свети жълто (flashing = true).
function liveTick(){
  flashing = true;
  for (const m of DATA.matches) {
    if (m.status !== 3 || !matchPassesFilter(m)) continue;
    const el = document.querySelector(`.match[onclick*="${m.id}"]`);
    if (!el) continue;
    const tmp = document.createElement("div");
    tmp.innerHTML = renderMatch(m);
    const fresh = tmp.firstElementChild;
    if (fresh) { wrapTables(fresh); el.replaceWith(fresh); }
  }
  flashing = false;
}

function render(){
  const ff = document.getElementById("filters");
  if (ff) ff.style.display = activeTab === "schedule" ? "flex" : "none";
  const c = document.getElementById("content");
  if (!DATA && activeTab !== "info") return;
  if (activeTab === "info") c.innerHTML = renderAbout();
  else if (activeTab === "schedule") c.innerHTML = renderSchedule();
  else if (activeTab === "groups") c.innerHTML = renderGroups();
  else if (activeTab === "champion") c.innerHTML = renderChampion();
  else if (activeTab === "stats") c.innerHTML = renderLeaderboards();
  else c.innerHTML = renderRefs();
  wrapTables(c);
  lastSig = viewSig();
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
    stats = ` · ${r.matches} ${matchesWord(r.matches)} ${t("ref_at")} · ${(r.y / r.matches).toFixed(1)} ${t("ref_ypg")} · ${r.red} ${t("ref_reds")}`;
  else stats = " · " + t("ref_first");
  return `<div class="refline">🧑‍⚖️ ${flag(m.referee.country)} ${m.referee.name} (${name(m.referee.country)})${stats}</div>`;
}

function teamProjMult(code, lam, we, isHome){
  const tt = DATA.teamAgg[code];
  const avgGoals = (tt && tt.matches) ? tt.gf / tt.matches : 1.35;
  const att = clamp(lam / Math.max(avgGoals, 0.6), 0.65, 1.5);
  const foul = clamp(1 + 0.35 * (isHome ? (1 - 2 * we) : (2 * we - 1)), 0.7, 1.4);
  return { att, foul };
}

const POS_PRIOR = {
  0: { lbl: "pos_gk",  shots: 0.0, ot: 0.0,  fouls: 0.1, y: 0.05 },
  1: { lbl: "pos_def", shots: 0.5, ot: 0.15, fouls: 1.1, y: 0.22 },
  2: { lbl: "pos_mid", shots: 1.3, ot: 0.45, fouls: 1.2, y: 0.18 },
  3: { lbl: "pos_fwd", shots: 2.4, ot: 1.0,  fouls: 0.7, y: 0.12 },
};
const yChance = exp => exp > 0.03 ? (100 * (1 - Math.exp(-exp))).toFixed(0) + "%" : "–";

function playerProjTable(code, mult, lineupSide, lam){
  const tt = DATA.teamAgg[code];
  if (tt && tt.matches) {
    const players = Object.values(DATA.playerAgg)
      .filter(p => p.team === code && (p.shots + p.goals + p.fouls + p.y + p.r + p.saves) > 0)
      .sort((a, b) => (b.shots + b.goals * 2 + b.fouls) - (a.shots + a.goals * 2 + a.fouls))
      .slice(0, 10);
    if (players.length)
      return `<div class="ptitle">${flag(code)} ${name(code)} — ${t("pp_forMatch")}</div>
      <table class="ptable"><tr><th>${t("th_player")}</th><th>${t("th_shots")}</th><th>${t("th_ontarget")}</th><th>${t("th_fouls")}</th><th>${t("th_ycChance")}</th></tr>
      ${players.map(p => `<tr><td>${p.shirt ? p.shirt + ". " : ""}${p.name}${p.saves ? " 🧤" : ""}</td>
        <td>${((p.shots / p.apps) * mult.att).toFixed(1)}</td><td>${((p.onTarget / p.apps) * mult.att).toFixed(1)}</td>
        <td>${((p.fouls / p.apps) * mult.foul).toFixed(1)}</td><td>${yChance((p.y / p.apps) * mult.foul)}</td></tr>`).join("")}
      </table>`;
  }
  if (lineupSide && lineupSide.some(p => p.starter)) {
    const starters = lineupSide.filter(p => p.starter)
      .map(p => ({ ...p, pr: POS_PRIOR[p.pos] || POS_PRIOR[2] }))
      .sort((a, b) => b.pr.shots - a.pr.shots);
    return `<div class="ptitle">${flag(code)} ${name(code)} — ${t("pp_byLineup")}</div>
    <div class="note">${t("pp_note_pos")}</div>
    <table class="ptable"><tr><th>${t("th_player")}</th><th></th><th>${t("th_shots")}</th><th>${t("th_ontarget")}</th><th>${t("th_fouls")}</th><th>🟨</th></tr>
    ${starters.map(p => `<tr><td>${p.shirt ? p.shirt + ". " : ""}${p.name}</td><td style="color:var(--faint)">${t(p.pr.lbl)}</td>
      <td>${(p.pr.shots * mult.att).toFixed(1)}</td><td>${(p.pr.ot * mult.att).toFixed(1)}</td>
      <td>${(p.pr.fouls * mult.foul).toFixed(1)}</td><td>${yChance(p.pr.y * mult.foul)}</td></tr>`).join("")}
    </table>`;
  }
  const tShots = clamp(4 + (lam || 1.3) * 5, 4, 22);
  const tOnT = tShots * 0.34;
  const tFouls = clamp(11 * mult.foul, 7, 16);
  return `<div class="ptitle">${flag(code)} ${name(code)} — ${t("pp_forTeam")}</div>
  <div class="note">${t("pp_note_team")}</div>
  <table class="ptable"><tr><th>${t("th_metric")}</th><th>${t("th_pred")}</th></tr>
    <tr><td>${t("m_shots")}</td><td>~${tShots.toFixed(0)}</td></tr>
    <tr><td>${t("m_ontarget")}</td><td>~${tOnT.toFixed(0)}</td></tr>
    <tr><td>${t("m_fouls")}</td><td>~${tFouls.toFixed(0)}</td></tr>
  </table>`;
}

function finishedDetails(m){
  const s = m.stats;
  if (!s) return "";
  const h = s.teams[m.home.code], a = s.teams[m.away.code];
  if (!h || !a) return "";
  const row = (l, x, y) => (x == null || y == null) ? "" : `<tr><td>${x}</td><th>${l}</th><td>${y}</td></tr>`;
  const cmp = `<table class="cmptable">
    ${row(t("st_possession"), h.possession, a.possession)}
    ${row(t("m_shots"), h.shots, a.shots)}
    ${row(t("m_ontarget"), h.onTarget, a.onTarget)}
    ${row(t("st_corners"), h.corners, a.corners)}
    ${row(t("m_fouls"), h.fouls, a.fouls)}
    ${row(t("st_offsides"), h.offsides, a.offsides)}
    ${row(t("st_passpct"), h.passPct, a.passPct)}
    ${row(t("st_tackles"), h.tacklesEff != null ? h.tacklesEff + "/" + h.tacklesTot : null, a.tacklesEff != null ? a.tacklesEff + "/" + a.tacklesTot : null)}
    ${row(t("st_interceptions"), h.interceptions, a.interceptions)}
    ${row(t("st_yellow"), h.y, a.y)}
    ${row(t("st_red"), h.r, a.r)}
  </table>`;
  const players = Object.values(s.players)
    .filter(p => (p.shots + p.goals + p.assists + p.fouls + p.foulsSuffered + p.y + p.r + p.saves) > 0)
    .sort((x, y) => x.team === y.team
      ? (y.shots + y.goals * 2 + y.fouls) - (x.shots + x.goals * 2 + x.fouls)
      : (x.team === m.home.code ? -1 : 1));
  const ptable = players.length ? `
  <div class="ptitle">${t("pl_inMatch")}</div>
  <table class="ptable"><tr><th>${t("th_player")}</th><th></th><th>${t("th_shots")}</th><th>${t("th_ontarget")}</th><th>${t("th_goals")}</th><th>${t("th_assists")}</th><th>${t("th_fouls")}</th><th>${t("th_suffered")}</th><th>${t("th_cards")}</th></tr>
  ${players.map(p => `<tr><td>${p.shirt ? p.shirt + ". " : ""}${p.name}${p.saves ? " 🧤" + p.saves : ""}</td><td>${flag(p.team)}</td>
    <td>${p.shots}</td><td>${p.onTarget || 0}</td><td>${p.goals}</td><td>${p.assists || 0}</td><td>${p.fouls}</td><td>${p.foulsSuffered || 0}</td>
    <td>${"🟨".repeat(p.y)}${"🟥".repeat(p.r)}</td></tr>`).join("")}
  </table>` : "";
  return `<div class="details">${cmp}${ptable}</div>`;
}

function matchVerdict(m, r, p1, px, p2, cards, corners, ko){
  const A = name(m.home.code), B = name(m.away.code);
  let outcome, op;
  if (p1 >= px && p1 >= p2) { outcome = A + " " + t("v_wins"); op = p1; }
  else if (p2 >= px && p2 >= p1) { outcome = B + " " + t("v_wins"); op = p2; }
  else { outcome = t("v_draw"); op = px; }
  const conf = op > 0.60 ? t("conf_clear") : op > 0.45 ? t("conf_slight") : t("conf_open");
  const over = r.over25;
  const overTxt = over >= 0.5 ? `${t("over")} (${pc(over)})` : `${t("under")} (${pc(1 - over)})`;
  const bttsTxt = r.btts >= 0.5 ? `${t("yes")} (${pc(r.btts)})` : `${t("no")} (${pc(1 - r.btts)})`;
  const ts = r.top[0];
  const badge = m.lineup ? `<span class="vbadge">${t("v_lineupOut")}</span>` : "";
  const row = (ic, l, v, sub) => `<div class="vrow"><span>${ic} ${l}</span><b>${v}${sub ? ` <span class="vsub">${sub}</span>` : ""}</b></div>`;
  return `<div class="verdict">
    <div class="verdict-head">📋 ${t("v_title")} ${badge}</div>
    ${row("🏆", t("v_outcome"), `${outcome} · ${pc(op)}`, conf)}
    ${row("⚽", t("v_result"), `${ts.i} : ${ts.j}`, `${t("v_expGoals")} ${r.lA.toFixed(1)} : ${r.lB.toFixed(1)}`)}
    ${row("📈", t("v_goals"), overTxt, "")}
    ${row("🥅", t("v_btts"), bttsTxt, t("v_btts_sub"))}
    ${row("🟨", t("v_cards"), `~${cards.y.toFixed(1)} ${t("lbl_yellow")}`, `~${cards.r.toFixed(2)} ${t("lbl_red")}`)}
    ${row("⛳", t("v_corners"), `~${corners.total.toFixed(1)}`, `${A} ${corners.a.toFixed(1)} · ${B} ${corners.b.toFixed(1)}`)}
  </div>`;
}

function playerHighlights(m, mh, ma){
  const pool = [];
  const add = (code, mult, lineupSide) => {
    const tt = DATA.teamAgg[code];
    if (tt && tt.matches) {
      Object.values(DATA.playerAgg)
        .filter(p => p.team === code && (p.shots + p.fouls + p.y) > 0)
        .forEach(p => pool.push({ name: p.name, team: code, shots: (p.shots / p.apps) * mult.att, cardCh: 1 - Math.exp(-(p.y / p.apps) * mult.foul) }));
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
  return `<div class="phl">🎯 <b>${t("phl_title")}</b> ` +
    `${t("phl_shots")} — ${flag(shot.team)} ${shot.name} (~${shot.shots.toFixed(1)}) · ` +
    `${t("phl_card")} — ${flag(card.team)} ${card.name} (${(card.cardCh * 100).toFixed(0)}%)</div>`;
}

function liveProb(hs, as, rlA, rlB){
  let p1 = 0, px = 0, p2 = 0;
  for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) {
    const p = Model.pois(rlA, i) * Model.pois(rlB, j);
    const fh = hs + i, fa = as + j;
    if (fh > fa) p1 += p; else if (fh === fa) px += p; else p2 += p;
  }
  return { p1, px, p2 };
}

function liveStatsHtml(m){
  if (!m.liveStats) return "";
  const h = m.liveStats[m.home.code], a = m.liveStats[m.away.code];
  if (!h || !a) return "";
  const snap = liveSnap[m.id] = liveSnap[m.id] || {};
  const prev = snap.s || {}, cur = {};
  const val = (key, num, disp) => {                       // светва жълто при промяна на показаната стойност
    const d = disp != null ? disp : num; cur[key] = d;
    const fl = (flashing && (key in prev) && prev[key] !== d) ? "flash" : "";
    return `<b class="${fl}">${d}</b>`;
  };
  const bar = (x, y) => { const tot = x + y || 1; return `<span class="lsbar"><i style="width:${x / tot * 100}%"></i></span>`; };
  const row = (key, l, x, y, dx, dy) => `<div class="lsrow">${val(key + "H", x, dx)}<span class="lsl">${l}</span>${val(key + "A", y, dy)}</div>${bar(x, y)}`;
  let html = `<div class="livestats">`;
  if (h.possession != null && a.possession != null) html += row("poss", t("ls_possession"), h.possession, a.possession, Math.round(h.possession) + "%", Math.round(a.possession) + "%");
  html += row("sh", t("m_shots"), h.shots, a.shots);
  html += row("ot", t("m_ontarget"), h.onTarget, a.onTarget);
  html += row("co", t("st_corners"), h.corners, a.corners);
  html += row("fo", t("m_fouls"), h.fouls, a.fouls);
  if ((h.y + a.y + h.r + a.r) > 0) html += row("ca", t("ls_cards"), h.y + h.r, a.y + a.r);
  html += `</div>`;
  snap.s = cur;
  return html;
}

function livePlayersHtml(m){
  if (!m.livePlayers) return "";
  const shotW = n => lang === "bg" ? (n > 1 ? "удара" : "удар") : (n > 1 ? "shots" : "shot");
  const snap = liveSnap[m.id] = liveSnap[m.id] || {};
  const prevP = snap.p || {}, curP = {};
  const side = code => {
    const list = (m.livePlayers[code] || []).slice(0, 6);
    if (!list.length) return `<div class="lpcol"><div class="lpt">${flag(code)} ${name(code)}</div><div class="note">${t("lp_none")}</div></div>`;
    return `<div class="lpcol"><div class="lpt">${flag(code)} ${name(code)}</div>${list.map(p => {
      const tags = [
        p.goals ? "⚽".repeat(p.goals) : "",
        p.shots ? `${p.shots} ${shotW(p.shots)}` : "",
        p.onTarget ? `${p.onTarget} ${t("lp_ontarget")}` : "",
        p.fouls ? `${p.fouls} ${t("lp_fouls")}` : "",
        "🟨".repeat(p.y) + "🟥".repeat(p.r),
      ].filter(Boolean).join(" · ");
      const key = code + "|" + (p.shirt || "") + "|" + p.name;
      curP[key] = tags;
      const fl = (flashing && (key in prevP) && prevP[key] !== tags) ? " flash" : "";
      return `<div class="lprow"><span class="lpn">${p.shirt ? p.shirt + ". " : ""}${p.name}</span><span class="lpv${fl}">${tags}</span></div>`;
    }).join("")}</div>`;
  };
  const html = `<div class="lptitle">${t("lp_title")}</div><div class="liveplayers">${side(m.home.code)}${side(m.away.code)}</div>`;
  snap.p = curP;
  return html;
}

function h2hLine(m){
  if (!m.h2h) return "";
  const h = m.h2h;
  const games = h.meetings.map(g => `<span class="h2hg">${new Date(g.date).getFullYear()}: ${g.a}–${g.b}</span>`).join("");
  return `<div class="h2h">
    <div class="h2h-head">🤝 ${t("h2h_title")} ${h.n})</div>
    <div class="h2h-sum">${flag(h.aCode)} ${name(h.aCode)} <b>${h.aW}</b> · ${h.dr} ${t("h2h_draws")} · <b>${h.bW}</b> ${name(h.bCode)} ${flag(h.bCode)}</div>
    <div class="h2h-games">${games}</div>
  </div>`;
}

function topScorers(m, mh, ma){
  const pool = [];
  const add = (code, mult, lineupSide) => {
    const tt = DATA.teamAgg[code];
    if (tt && tt.matches) {
      Object.values(DATA.playerAgg).filter(p => p.team === code).forEach(p => {
        const raw = Math.max(p.goals / p.apps, (p.shots / p.apps) * 0.10);
        const rate = raw * (p.apps / (p.apps + 1.5));
        const lam = rate * mult.att;
        if (lam > 0.03) pool.push({ name: p.name, shirt: p.shirt, team: code, p: 1 - Math.exp(-lam) });
      });
    } else if (lineupSide && lineupSide.some(p => p.starter)) {
      const GR = { 0: 0.005, 1: 0.06, 2: 0.18, 3: 0.45 };
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
  return `<div class="ptitle" style="margin-top:14px">${t("ts_title")}</div>
    <div class="scorers">${top.map(p => `<div class="scorer"><span>${flag(p.team)} ${p.shirt ? p.shirt + ". " : ""}${p.name}</span><b>${(p.p * 100).toFixed(0)}%</b></div>`).join("")}</div>`;
}

function predResultLine(m){
  if (!m.predEval || !m.prediction) return "";
  const e = m.predEval, P = m.prediction;
  const A = name(m.home.code), B = name(m.away.code);
  const pickName = o => o === "1" ? A : o === "2" ? B : t("draw_l");
  const mk = ok => ok ? '<span class="hit">✅</span>' : '<span class="miss">❌</span>';
  const hits = [e.outcome.ok, e.ou.ok, e.btts.ok].filter(Boolean).length;
  return `<div class="predres">
    <div class="predres-head">📋 ${t("pr_hit")} ${hits}/3 ${surpriseBadge(m)}</div>
    <div class="predres-rows">
      <span>${mk(e.outcome.ok)} ${t("v_outcome")}: ${pickName(P.outcome)}</span>
      <span>${mk(e.ou.ok)} ${t("v_goals")}: ${P.ouPick === "over" ? t("over25") : t("under25")}</span>
      <span>${mk(e.btts.ok)} ${t("v_btts")}: ${P.bttsPick === "yes" ? t("yes_l") : t("no_l")}</span>
    </div>
  </div>`;
}

function surpriseBadge(m){
  if (!m.prediction || !m.predEval) return "";
  const P = m.prediction, act = m.predEval.outcome.actual;
  const probActual = act === "1" ? P.p1 : act === "2" ? P.p2 : P.px;
  if (probActual >= 0.5) return "";
  if (probActual >= 0.33) return `<span class="surprise s1">${t("sp_mild")}</span>`;
  if (probActual >= 0.18) return `<span class="surprise s2">${t("sp_surprise")}</span>`;
  return `<span class="surprise s3">${t("sp_big")}</span>`;
}

function riskyFavBadge(homeWin, awayWin, lHome, lAway){
  const favWin = Math.max(homeWin, awayWin);
  const underdogL = homeWin >= awayWin ? lAway : lHome;
  if (favWin >= 0.58 && favWin <= 0.82 && underdogL >= 0.85)
    return `<span class="riskyfav">${t("rf")}</span>`;
  return "";
}

function renderMatch(m){
  const time = new Date(m.date).toLocaleTimeString(loc(), { hour: "2-digit", minute: "2-digit" });
  const stage = m.group ? groupLabel(m.group) : stageName(m.stageName);
  const place = [m.stadium, m.city].filter(Boolean).join(", ");
  const live = m.status === 3;
  const finished = m.status === 0;

  const homeHtml = m.home ? `<span>${name(m.home.code)}</span> ${flag(m.home.code)}` : `<span class="ph">${phText(m.phA)}</span>`;
  const awayHtml = m.away ? `${flag(m.away.code)} <span>${name(m.away.code)}</span>` : `<span class="ph">${phText(m.phB)}</span>`;

  let mid, bar = "", details = "", cardsline = "", headBadge = "", liveLine = "";
  const canPredict = m.home && m.away && !finished;
  const predLine = finished ? predResultLine(m) : "";

  if (finished || live) {
    let s = (m.hs ?? "–") + " : " + (m.as ?? "–");
    let cls = "score";
    if (m.hp != null && m.ap != null && (m.hp || m.ap)) { s += ` (${m.hp}:${m.ap} ${t("pens")})`; cls += " pen"; }
    mid = `<div class="${cls}">${s}</div>`;
    if (finished && m.stats) {
      const h = m.stats.teams[m.home.code], a = m.stats.teams[m.away.code];
      if (h && a && (h.y + a.y + h.r + a.r) > 0)
        cardsline = `<div class="cardsline">🟨 ${h.y + a.y} ${t("lbl_yellow")}${(h.r + a.r) ? " · 🟥 " + (h.r + a.r) + " " + t("lbl_red") : ""} · ⛳ ${h.corners + a.corners} ${t("corners_w")}</div>`;
      details = finishedDetails(m);
    }
  } else {
    mid = `<div class="vsmini">${time}${t("time_suffix")}</div>`;
  }

  if (canPredict) {
    const comp = compositeLambdas(m);
    const r = predictFromLambdas(comp.lA, comp.lB);
    const ko = m.stageName !== "First Stage";
    let p1 = r.p1, px = r.px, p2 = r.p2;
    if (ko) { const sh = 0.5 + (r.we - 0.5) * 0.6; p1 += px * sh; p2 += px * (1 - sh); px = 0; }
    const cards = predictCards(m, r.we);
    const corners = predictCorners(m, r.lA, r.lB);
    if (live) {
      const minute = m.minute || 0;
      const ml = Math.max(0, 92 - minute);
      const lp = liveProb(m.hs || 0, m.as || 0, comp.lA * ml / 90, comp.lB * ml / 90);
      p1 = lp.p1; px = lp.px; p2 = lp.p2;
      // живи прогнози за корнери/картони до края — смес от пред-мач очакване и реалния темп на мача
      const el2 = Math.min(minute, 90);
      const proj = (curr, pre) => { if (el2 < 1) return pre; const w = clamp(el2 / 70, 0, 1); const perMin = (pre / 90) * (1 - w) + (curr / Math.max(el2, 8)) * w; return curr + perMin * ml; };
      let projLine = "";
      const ls = m.liveStats;
      if (ls && ls[m.home.code] && ls[m.away.code]) {
        const curC = (ls[m.home.code].corners || 0) + (ls[m.away.code].corners || 0);
        const curY = (ls[m.home.code].y || 0) + (ls[m.away.code].y || 0);
        projLine = `<div class="liveproj">📈 ${t("live_proj")}: ~${proj(curC, corners.total).toFixed(0)} ${t("corners_w")} · ~${proj(curY, cards.y).toFixed(1)} ${t("lbl_yellow")}</div>`;
      }
      const evs = (m.liveEvents || []).slice(0, 6).map(e => `<span class="lev">${e.min} ${e.kind}${e.team ? " " + flag(e.team) : ""}</span>`).join("");
      liveLine = `<div class="livebox"><div class="livehdr">🔴 ${t("live_now").replace("● ", "")} ${m.matchTime || ""} · ${t("live_winprob")}</div>` +
        `${projLine}${evs ? `<div class="levs">${evs}</div>` : ""}${liveStatsHtml(m)}${livePlayersHtml(m)}</div>`;
    }
    bar = `<div class="pbar">
      <div class="p1" style="width:${p1 * 100}%">${pc(p1)}</div>
      ${px > 0.01 ? `<div class="px" style="width:${px * 100}%">${pc(px)}</div>` : ""}
      <div class="p2" style="width:${p2 * 100}%">${pc(p2)}</div>
    </div>`;
    headBadge = riskyFavBadge(p1, p2, comp.lA, comp.lB);
    const maxP = r.top[0].p;
    const mhMult = teamProjMult(m.home.code, comp.lA, r.we, true);
    const maMult = teamProjMult(m.away.code, comp.lB, r.we, false);
    const tm = (DATA.teamAgg[m.home.code]?.matches || 0) + (DATA.teamAgg[m.away.code]?.matches || 0);
    const srcNote = `<div class="srcnote">⚙️ ${t("src_combines")} <b>Elo</b> + <b>${t("src_goalprofile")}</b> (eloratings)` +
      (tm ? ` + <b>${t("src_stats")}</b> ${t("src_from")} ${tm} ${matchesWord(tm)} ${t("src_statdetail")}` : " · " + t("src_noMatches")) + `</div>`;
    const bonusTxt = b => b ? ` <span style="color:${b > 0 ? "var(--green)" : "var(--red)"}">${b > 0 ? "+" : ""}${b}</span>` : "";
    details = `<div class="details">
      ${matchVerdict(m, r, p1, px, p2, cards, corners, ko)}
      ${h2hLine(m)}
      ${srcNote}
      <div class="stats">
        <div class="stat"><div class="l">${t("st_expResult")}</div><div class="v">${r.lA.toFixed(1)} : ${r.lB.toFixed(1)}</div></div>
        <div class="stat"><div class="l">${t("st_over25")}</div><div class="v">${pc1(r.over25)}</div></div>
        <div class="stat"><div class="l">${t("st_btts")}</div><div class="v">${pc1(r.btts)}</div></div>
        ${ko ? `<div class="stat"><div class="l">${t("st_advance")} ${name(m.home.code)}</div><div class="v">${pc1(p1)}</div></div>` : ""}
        <div class="stat"><div class="l">${t("st_power")}</div><div class="v" style="font-size:.86rem">${comp.A.base}${bonusTxt(comp.A.bonus)} : ${comp.B.base}${bonusTxt(comp.B.bonus)}</div></div>
      </div>
      <div class="stats">
        <div class="stat"><div class="l">${t("st_predcorners")}</div><div class="v">~${corners.total.toFixed(1)}</div>
          <div class="l">${name(m.home.code)} ${corners.a.toFixed(1)} · ${name(m.away.code)} ${corners.b.toFixed(1)}</div></div>
        <div class="stat"><div class="l">${t("st_predyellow")}</div><div class="v">~${cards.y.toFixed(1)}</div>
          <div class="l">${name(m.home.code)} ${cards.yHome.toFixed(1)} · ${name(m.away.code)} ${cards.yAway.toFixed(1)}</div>
          <div class="l" style="margin-top:3px; opacity:.75">${m.referee ? t("ref_label") + " " + m.referee.name + (cards.hasRef ? "" : " " + t("ref_nodata")) : t("ref_notnamed")}</div></div>
        <div class="stat"><div class="l">${t("st_predred")}</div><div class="v">~${cards.r.toFixed(2)}</div>
          <div class="l">${((1 - Math.exp(-cards.r)) * 100).toFixed(0)}${t("red_atleastone")}</div></div>
      </div>
      <div style="font-size:.78rem;color:var(--muted);margin-bottom:6px">${t("topscores")}</div>
      ${r.top.map(s => `<div class="scorerow"><div class="sc">${s.i} : ${s.j}</div>
        <div class="fill" style="width:${s.p / maxP * 45}%"></div><div class="pc">${pc1(s.p)}</div></div>`).join("")}
      <div class="ptitle" style="margin-top:16px">${t("pp_section")}</div>
      <div class="note" style="margin-bottom:4px">${t("pp_secnote")}${m.lineup ? t("pp_secnote_lineup") : t("pp_secnote_wait")}</div>
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
      <span>${live ? `<span class="live">${t("live_now")}</span> · ` : ""}${stage} · ${t("m_no")}${m.matchNumber || "?"} ${headBadge}</span>
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
  if (!ms.length) return `<div class="loading">${t("sched_empty")}</div>`;
  let html = "", lastDay = "";
  for (const m of ms) {
    const day = new Date(m.date).toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long" });
    if (day !== lastDay) { html += `<div class="dayhead">${day}</div>`; lastDay = day; }
    html += renderMatch(m);
  }
  return html;
}

function toggleMatch(id){
  if (openMatches.has(id)) openMatches.delete(id); else openMatches.add(id);
  render();
}

// ---- групи ----
function samplePois(l){
  const L0 = Math.exp(-l); let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L0);
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
    const order = codes.map((_, t2) => t2).sort((a, b) =>
      pts[b] - pts[a] || gd[b] - gd[a] || gf[b] - gf[a] || Math.random() - 0.5);
    order.forEach((t2, pos) => agg[t2].pos[pos]++);
    codes.forEach((_, t2) => agg[t2].pts += pts[t2]);
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
      <h3>${groupLabel(g)}</h3>
      <div class="note">${played} ${t("grp_played1")} ${groups[g].length} ${t("grp_played2")}</div>
      <table><tr><th>${t("gh_team")}</th><th>Elo</th><th>${t("gh_ptsnow")}</th><th>${t("gh_exp")}</th><th>${t("gh_1st")}</th><th>${t("gh_2nd")}</th><th>${t("gh_3rd")}</th></tr>
      ${rows.map((r, i) => `<tr class="${i === 0 ? "q1" : i === 1 ? "q2" : ""}">
        <td><div class="teamcell">${flag(r.code)} ${name(r.code)}</div></td>
        <td>${DATA.elo[r.code] || "?"}</td><td>${r.now}</td><td><b>${r.pts.toFixed(1)}</b></td>
        <td>${pc(r.p1)}</td><td>${pc(r.p2)}</td><td>${pc(r.p3)}</td></tr>`).join("")}
      </table></div>`;
  }).join("");
}

// ---- Прогноза за целия турнир (Монте Карло) ----
let champCache = null, champKey = null;

function simulateTournament(N){
  const allCodes = Object.keys(DATA.elo);
  const power = {};
  for (const code of allCodes) power[code] = Model.powerElo(DATA, { code }, {}).e;
  const koWin = (a, b) => Math.random() < Model.winExp(power[a] - power[b]) ? a : b;

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
  const ko = DATA.matches.filter(m => m.stageName && m.stageName !== "First Stage").sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
  const thirdSlots = [...new Set(ko.filter(m => m.stageName === "Round of 32").flatMap(m => [m.phA, m.phB]).filter(ph => /^3[A-L]{2,}$/.test(ph)))];

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
      for (const tt of qual) {
        if (used.has(tt.code) || !slots[i].groups.includes(tt.group)) continue;
        res[slots[i].ph] = tt.code; used.add(tt.code);
        if (bt(i + 1)) return true;
        used.delete(tt.code);
      }
      return false;
    })(0);
    for (const s of slots) if (!res[s.ph]) { const tt = qual.find(x => !used.has(x.code)); if (tt) { res[s.ph] = tt.code; used.add(tt.code); } }
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
    .filter(tt => tt.q8 > 0.0005)
    .sort((a, b) => b.champ - a.champ || b.fin - a.fin);
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
  const key = DATA.updatedAt + "|" + lang;
  if (champKey !== key) { champCache = simulateTournament(3000); champKey = key; }
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
    <h3>${t("ch_title")}</h3>
    <div class="note">${t("ch_note")} ${playedGroup}/${totalGroup} ${t("ch_note2")}</div>
    <div class="champbanner">${t("ch_banner")} ${flag(champ0.code)} <b>${name(champ0.code)}</b> · ${pcc(champ0.champ)} · ${t("ch_final")} ${pcc(champ0.fin)}</div>
    <div class="brackwrap"><div class="bround-heads"><span>1/16</span><span>1/8</span><span>¼</span><span>½</span><span>${t("r_final")}</span></div>
    <div class="bracket">${node(finalM)}</div></div>
  </div>`;
}

// ---- Класации ----
function renderLeaderboards(){
  const players = Object.values(DATA.playerAgg);
  const pname = p => `${flag(p.team)} ${p.shirt ? p.shirt + ". " : ""}${p.name}`;
  function board(title, list, valCols){
    if (!list.length) return "";
    return `<div class="gcard"><h3>${title}</h3>
      <table><tr><th>#</th><th>${t("th_player")}</th>${valCols.map(c => `<th>${c.h}</th>`).join("")}</tr>
      ${list.map((p, i) => `<tr class="${i === 0 ? "q1" : ""}"><td>${i + 1}</td>
        <td><div class="teamcell">${pname(p)}</div></td>${valCols.map(c => `<td>${c.f(p)}</td>`).join("")}</tr>`).join("")}
      </table></div>`;
  }
  const top = (key, extra) => players.filter(p => p[key] > 0)
    .sort((a, b) => b[key] - a[key] || (extra ? b[extra] - a[extra] : 0) || a.apps - b.apps).slice(0, 12);

  const scorers = board(t("lb_scorers"), top("goals", "assists"),
    [{ h: t("lh_goals"), f: p => `<b>${p.goals}</b>` }, { h: t("lh_assists"), f: p => p.assists }, { h: t("lh_apps"), f: p => p.apps }]);
  const assists = board(t("lb_assists"), top("assists", "goals"),
    [{ h: t("lh_assists"), f: p => `<b>${p.assists}</b>` }, { h: t("lh_goals"), f: p => p.goals }]);
  const shots = board(t("lb_shots"), top("shots", "onTarget"),
    [{ h: t("lh_shots"), f: p => `<b>${p.shots}</b>` }, { h: t("lh_ontarget"), f: p => p.onTarget }, { h: t("lh_goals"), f: p => p.goals }]);
  const cards = board(t("lb_cards"), players.filter(p => p.y + p.r > 0).sort((a, b) => (b.y + b.r * 2) - (a.y + a.r * 2) || b.fouls - a.fouls).slice(0, 12),
    [{ h: "🟨", f: p => p.y }, { h: "🟥", f: p => p.r }, { h: t("lh_fouls"), f: p => p.fouls }]);

  const teams = Object.entries(DATA.teamAgg).map(([code, tt]) => ({ code, ...tt })).filter(tt => tt.matches);
  const teamBoard = (title, list, cols) => list.length ? `<div class="gcard"><h3>${title}</h3>
    <table><tr><th>#</th><th>${t("lh_team")}</th>${cols.map(c => `<th>${c.h}</th>`).join("")}</tr>
    ${list.map((tt, i) => `<tr class="${i === 0 ? "q1" : ""}"><td>${i + 1}</td><td><div class="teamcell">${flag(tt.code)} ${name(tt.code)}</div></td>
      ${cols.map(c => `<td>${c.f(tt)}</td>`).join("")}</tr>`).join("")}</table></div>` : "";
  const attack = teamBoard(t("lb_attack"), [...teams].sort((a, b) => b.gf / b.matches - a.gf / a.matches).slice(0, 8),
    [{ h: t("lh_gpm"), f: tt => `<b>${(tt.gf / tt.matches).toFixed(1)}</b>` }, { h: t("lh_total"), f: tt => tt.gf }, { h: t("lh_apps"), f: tt => tt.matches }]);
  const defense = teamBoard(t("lb_defense"), [...teams].sort((a, b) => a.ga / a.matches - b.ga / b.matches).slice(0, 8),
    [{ h: t("lh_gapm"), f: tt => `<b>${(tt.ga / tt.matches).toFixed(1)}</b>` }, { h: t("lh_total"), f: tt => tt.ga }]);

  if (!players.length) return `<div class="loading">${t("lb_empty")}</div>`;
  return scorers + assists + shots + cards + attack + defense;
}

// ---- съдии ----
function renderRefs(){
  const refs = Object.values(DATA.referees).sort((a, b) => b.matches - a.matches || a.name.localeCompare(b.name));
  if (!refs.length) return `<div class="loading">${t("rf_empty")}</div>`;
  return `<div class="gcard">
    <h3>${t("rf_title")}</h3>
    <div class="note">${t("rf_note")}</div>
    <table><tr><th>${t("rfh_ref")}</th><th>${t("rfh_country")}</th><th>${t("rfh_matches")}</th><th>${t("rfh_ytotal")}</th><th>${t("rfh_ypm")}</th><th>🟥</th><th>${t("rfh_next")}</th></tr>
    ${refs.map(r => {
      const next = r.next
        ? new Date(r.next.date).toLocaleDateString(loc(), { day: "numeric", month: "short" }) +
          " · " + (NAMES[lang][r.next.home] || phText(r.next.home)) + " – " + (NAMES[lang][r.next.away] || phText(r.next.away))
        : "—";
      return `<tr><td><div class="teamcell">${flag(r.country)} ${r.name}</div></td>
        <td>${name(r.country)}</td><td>${r.matches}</td><td>${r.y}</td>
        <td>${r.matches ? (r.y / r.matches).toFixed(1) : "—"}</td><td>${r.red}</td>
        <td style="font-size:.8rem">${next}</td></tr>`;
    }).join("")}
    </table></div>`;
}

// ---- Инфо / About ----
const ABOUT = {
  bg: `
  <div class="gcard about">
    <h3>ℹ️ За сайта</h3>
    <p>Това е безплатен прогнозен сайт за Световното първенство 2026. Тегли <b>живи данни</b> от три източника — Elo рейтингите от eloratings.net, програмата/резултатите/съдиите от официалното API на FIFA и детайлната статистика от ESPN — и ги обновява автоматично.</p>
    <p>Прогнозите се градят на <b>композитен модел</b>: сила по Elo + всевременен голов профил + реалната форма в турнира. След всеки изигран мач числата стават по-точни. <span class="warn">Това е забавление, не съвет за залози.</span></p>
  </div>
  <div class="gcard about">
    <h3>🔴 На живо по време на мач</h3>
    <ul>
      <li><b>Вероятност за победа в реално време</b> — преизчислява се според текущия резултат и оставащото време.</li>
      <li><b>Събития на живо</b> — голове, картони и смени с минутата.</li>
      <li><b>Отборна статистика на живо</b> — притежание, удари, точни удари, корнери, нарушения, картони (растат по време на мача).</li>
      <li><b>Статистика по играч на живо</b> — кой колко удара, нарушения, голове и картони има в момента.</li>
    </ul>
    <p class="note">Обновяване на ~30 сек, докато тече мач; иначе на 5 мин.</p>
  </div>
  <div class="gcard about">
    <h3>📂 Секциите</h3>
    <ul>
      <li><b>📅 Програма</b> — всички 104 мача по дни. Щракни върху мач за прогноза (изход, резултат, над/под 2.5, гол-гол, картони, корнери), очаквана статистика на играчите, „кой ще отбележи", преки срещи (H2H), а след мача — дали прогнозата е познала и колко изненадващ е бил резултатът.</li>
      <li><b>🏆 Групи</b> — класиранията на живо + 5000 симулации за шансовете за 1-во/2-ро/3-то място.</li>
      <li><b>🏅 Шампион</b> — прогнозна схема (bracket) на целия турнир от 3000 симулации: кой докъде стига и шанс за титлата.</li>
      <li><b>📊 Класации</b> — голмайстори, асистенции, удари, най-наказвани играчи и най-добри атаки/защити.</li>
      <li><b>🧑‍⚖️ Съдии</b> — статистика на всеки съдия (картони на мач) и следващият му мач.</li>
    </ul>
  </div>`,
  en: `
  <div class="gcard about">
    <h3>ℹ️ About</h3>
    <p>A free prediction site for the 2026 World Cup. It pulls <b>live data</b> from three sources — Elo ratings from eloratings.net, the schedule/results/referees from FIFA's official API, and detailed stats from ESPN — and refreshes automatically.</p>
    <p>Predictions use a <b>composite model</b>: Elo strength + all-time goal profile + real tournament form. After every match the numbers get sharper. <span class="warn">This is for fun, not betting advice.</span></p>
  </div>
  <div class="gcard about">
    <h3>🔴 Live during a match</h3>
    <ul>
      <li><b>Real-time win probability</b> — recalculated from the current score and time remaining.</li>
      <li><b>Live events</b> — goals, cards and substitutions with the minute.</li>
      <li><b>Live team stats</b> — possession, shots, shots on target, corners, fouls, cards (growing during the match).</li>
      <li><b>Live per-player stats</b> — each player's shots, fouls, goals and cards so far.</li>
    </ul>
    <p class="note">Refreshes every ~30s while a match is live; otherwise every 5 min.</p>
  </div>
  <div class="gcard about">
    <h3>📂 The sections</h3>
    <ul>
      <li><b>📅 Schedule</b> — all 104 matches by day. Tap a match for the prediction (outcome, score, over/under 2.5, BTTS, cards, corners), projected player stats, "who'll score", head-to-head, and after the match whether the prediction hit and how surprising the result was.</li>
      <li><b>🏆 Groups</b> — live standings + 5000 simulations for 1st/2nd/3rd place chances.</li>
      <li><b>🏅 Winner</b> — a predicted bracket of the whole tournament from 3000 simulations: who reaches where and title odds.</li>
      <li><b>📊 Leaders</b> — top scorers, assists, shots, most-booked players and best attacks/defences.</li>
      <li><b>🧑‍⚖️ Referees</b> — each referee's stats (cards per match) and their next match.</li>
    </ul>
  </div>`,
};
function renderAbout(){ return ABOUT[lang]; }

// ---- навигация ----
document.getElementById("tabs").addEventListener("click", e => {
  const b = e.target.closest(".tab"); if (!b) return;
  activeTab = b.dataset.tab; renderChrome(); render();
});
document.getElementById("filters").addEventListener("click", e => {
  const b = e.target.closest(".chip"); if (!b) return;
  filter = b.dataset.f; renderChrome(); render();
});
document.querySelector(".langtoggle").addEventListener("click", e => {
  const b = e.target.closest(".langbtn"); if (!b) return;
  lang = b.dataset.lang; localStorage.setItem("lang", lang);
  renderChrome(); setStatus(); renderAccuracy(); render();
});

renderChrome();
load();   // следващите обновявания се пускат от scheduleNext()
