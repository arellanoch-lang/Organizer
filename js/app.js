import { RACE, HYBRID, WARMUP, ZONES, RUN_WEEKS, RUN_STRATEGY, RUN_RULES, IG, IG_WEEKS, IG_POSTS } from "./data.js";
import { state, save, replaceState, uid } from "./store.js";

/* ---------- utilidades ---------- */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => iso(new Date());
const addDays = (s, n) => { const d = new Date(s + "T12:00"); d.setDate(d.getDate() + n); return iso(d); };
const dayFmt = new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short" });
const longFmt = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });
const fd = s => dayFmt.format(new Date(s + "T12:00"));
const fill = s => esc(s).replace(/\[([^\]]+)\]/g, '<span class="fill">[$1]</span>');
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const AREAS = { personal: "Personal", freelance: "Freelance", unixo: "UNIXO", ig: "Instagram", run: "Correr" };
const STATUS = { lead: "Posible cliente", propuesta: "Propuesta enviada", pausa: "En pausa", cliente: "Cliente activo", pasado: "Cliente pasado", descartado: "Descartado" };
const RUN_TAG = { easy: "Suave", tempo: "Umbral", fast: "Series", race: "Carrera", test: "Test" };
const fname = f => f === "reel" ? "Reel" : f === "story" ? "Historia" : "Carrusel";

const daysToRace = () => Math.ceil((new Date(`${RACE.date}T${RACE.time}`) - new Date()) / 864e5);

/* ---------- fuentes de la agenda ---------- */
function runSessions() {
  const out = [];
  RUN_WEEKS.forEach(w => w.s.forEach(([date, type, title, detail, target, pre]) => {
    const key = "s" + date;
    out.push({ date: state.runMove[key] || date, planned: date, key, type, title, detail, target, week: w.n, done: state.runDone[key] ?? !!pre });
  }));
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

// Clases de hybrid entre dos fechas, ya con los cambios de día aplicados.
// Se miran 31 días a cada lado por si alguna se ha movido dentro del rango.
function hybridDays(from, to) {
  const out = [];
  const start = addDays(from, -31) < HYBRID.from ? HYBRID.from : addDays(from, -31);
  const cap = addDays(today(), 400);
  const end = addDays(to, 31) > cap ? cap : addDays(to, 31);
  for (let d = start; d <= end; d = addDays(d, 1)) {
    if (!HYBRID.days.includes(new Date(d + "T12:00").getDay())) continue;
    const date = state.runMove["h" + d] || d;
    if (date >= from && date <= to) out.push({ key: "h" + d, date });
  }
  return out;
}

function igPosts() {
  // El id sale de la fecha original; si la cambias, se guarda en igMove.
  const base = IG_POSTS.map(p => ({ ...p, id: "ig" + p.date, extra: false, date: (state.igMove || {})["ig" + p.date] || p.date }));
  const extra = state.igExtra.map(p => ({ ...p, extra: true }));
  return [...base, ...extra]
    .map(p => ({ ...p, done: state.igDone[p.id] ?? !!p.pre }))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

function agenda(from, to) {
  const out = [];
  const inR = d => d && d >= from && d <= to;
  runSessions().forEach(s => {
    if (inR(s.date)) out.push({ date: s.date, kind: "run", key: s.key, area: "run", title: (s.type === "race" ? "🏁 " : "🏃 ") + s.title, sub: [s.type === "easy" ? "Antes, de calentamiento: " + WARMUP : "", s.detail, s.target].filter(Boolean).join(" · "), done: s.done });
  });
  hybridDays(from, to).forEach(h => {
    out.push({ date: h.date, time: HYBRID.time, kind: "run", key: h.key, area: "run", title: "🏋️ " + HYBRID.title, sub: "Clase", done: !!state.runDone[h.key] });
  });
  igPosts().forEach(p => {
    if (inR(p.date)) out.push({ date: p.date, time: p.time || "", kind: "ig", key: p.id, area: "ig", title: `${fname(p.f)}: ${p.title}`, sub: p.need ? "Material: " + p.need : "", done: p.done, link: "insta" });
  });
  state.tasks.forEach(t => {
    if (inR(t.date)) out.push({ date: t.date, time: t.time || "", kind: "task", key: t.id, area: t.area, title: t.text, done: t.done });
  });
  state.contacts.forEach(c => (c.followups || []).forEach(f => {
    if (inR(f.date)) out.push({ date: f.date, kind: "fu", key: `${c.id}|${f.id}`, area: "freelance", title: `📞 Contactar a ${c.name}${c.company ? " (" + c.company + ")" : ""}`, sub: f.reason, done: f.done, link: "freelance" });
  }));
  state.unixo.phases.forEach(p => p.tasks.forEach(t => {
    if (inR(t.date)) out.push({ date: t.date, kind: "ux", key: `${p.id}|${t.id}`, area: "unixo", title: t.text, sub: p.name, done: t.done, link: "unixo" });
  }));
  const order = { run: 0, ig: 1, fu: 2, ux: 3, task: 4 };
  // Por día; dentro del día, primero lo que no tiene hora y luego por hora.
  return out.sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || "") || order[a.kind] - order[b.kind]);
}

function nextUnixoStep() {
  for (const p of state.unixo.phases) for (const t of p.tasks) if (!t.done) return { phase: p, task: t };
  return null;
}

function nextFollowup(c) {
  return (c.followups || []).filter(f => !f.done).sort((a, b) => a.date.localeCompare(b.date))[0] || null;
}

/* ---------- piezas de interfaz ---------- */
function itemRow(it, showDate) {
  return `<div class="item${it.done ? " done" : ""}" style="--c:var(--a-${it.area})">
    <input type="checkbox" aria-label="Hecho" data-act="toggle" data-kind="${it.kind}" data-key="${esc(it.key)}"${it.done ? " checked" : ""}>
    <div class="item-body">
      <div class="item-top">${it.time ? `<span class="item-time mono">${esc(it.time)}</span>` : ""}<span class="item-title">${esc(it.title)}</span><span class="tag">${AREAS[it.area] || ""}</span></div>
      ${it.sub ? `<div class="item-sub">${esc(it.sub)}</div>` : ""}
      ${showDate ? `<div class="item-date">${fd(it.date)}</div>` : ""}
      ${showDate && !it.done ? moveControls(it) : ""}
      ${!showDate && !it.done && it.kind === "run" ? `<label class="chg">Cambiar día <input type="date" class="mini-date" data-act="move-date" data-kind="run" data-key="${esc(it.key)}" value="${it.date}"></label>` : ""}
      ${it.link ? `<a class="item-link" href="#${it.link}">Ver en ${it.link === "insta" ? "Instagram" : AREAS[it.link]} →</a>` : ""}
    </div>
    ${it.done ? "" : bell(it.kind, it.key)}
  </div>`;
}

const bell = (kind, key) => `<button type="button" class="bell" aria-label="Avisarme" title="Avisarme" data-act="remind" data-kind="${kind}" data-key="${esc(key)}">🔔</button>`;

// Botones para pasar algo atrasado a otro día.
function moveControls(it) {
  const k = `data-kind="${it.kind}" data-key="${esc(it.key)}"`;
  return `<div class="move">
    <span class="muted small">Pasar a:</span>
    <button type="button" class="btn small" data-act="move" ${k} data-to="${today()}">Hoy</button>
    <button type="button" class="btn small" data-act="move" ${k} data-to="${addDays(today(), 1)}">Mañana</button>
    <input type="date" class="mini-date" data-act="move-date" ${k} min="${today()}" aria-label="Otra fecha">
  </div>`;
}

function quickForm(defaultArea = "personal") {
  return `<form class="card quick" data-form="quick">
    <label class="sr" for="q-text">Nueva idea o tarea</label>
    <input id="q-text" name="text" placeholder="Apunta lo que se te ocurra…" autocomplete="off" required>
    <div class="row">
      <select name="area" aria-label="Área">${Object.entries(AREAS).map(([k, v]) => `<option value="${k}"${k === defaultArea ? " selected" : ""}>${v}</option>`).join("")}</select>
      <input type="date" name="date" aria-label="Fecha (opcional)">
      <input type="time" name="time" aria-label="Hora (opcional)">
      <button class="btn primary">Añadir</button>
    </div>
    <p class="hint">Sin fecha se queda en <a href="#ideas">Ideas</a>. Con fecha aparece en «Hoy» ese día.</p>
  </form>`;
}

/* ---------- vistas ---------- */
const SHORT = { ig: "📸", fu: "", ux: "🧥", task: "✅" };

function viewHoy() {
  const t = today();
  const overdue = agenda("0000-01-01", addDays(t, -1)).filter(i => !i.done && i.kind !== "run");
  const now = agenda(t, t);
  const flexible = now.filter(i => !i.time);
  const timed = now.filter(i => i.time);
  const soon = agenda(addDays(t, 1), addDays(t, 7));
  const inbox = state.tasks.filter(x => !x.date && !x.done).length;
  const left = now.filter(i => !i.done).length;
  const step = nextUnixoStep();
  const days = daysToRace();

  const byDay = {};
  soon.forEach(i => (byDay[i.date] ||= []).push(i));

  // Resumen en una línea: lo que hay hoy, de un vistazo.
  const summary = now.map(i => `<span class="sum${i.done ? " done" : ""}">${i.time ? `<b>${esc(i.time)}</b> ` : ""}${i.kind === "run" ? esc(i.title) : `${SHORT[i.kind]} ${esc(i.title)}`}</span>`).join("");

  return `<header class="hero">
      <p class="eyebrow">${esc(longFmt.format(new Date()))}</p>
      <h1>Tu día</h1>
      <p class="lead">${now.length ? (left ? `Te quedan <b>${plural(left, "cosa", "cosas")}</b> de ${now.length}` : "<b>Todo hecho por hoy</b> 🎉") : "Día libre en la agenda"}${days > 0 ? ` · faltan <b>${days} días</b> para París` : ""}</p>
      ${now.length ? `<div class="summary">${summary}</div>` : ""}
    </header>
    ${flexible.length ? `<section><h2>Durante el día</h2><div class="list">${flexible.map(i => itemRow(i)).join("")}</div></section>` : ""}
    ${timed.length ? `<section><h2>Con hora</h2><div class="list">${timed.map(i => itemRow(i)).join("")}</div></section>` : ""}
    ${!now.length ? `<p class="empty">Nada en la agenda de hoy. Aprovecha para la bandeja de ideas o el siguiente paso de UNIXO.</p>` : ""}
    ${overdue.length ? `<section><h2 class="late-h">Atrasado</h2><div class="list">${overdue.map(i => itemRow(i, true)).join("")}</div></section>` : ""}
    ${step ? `<section><h2>Siguiente paso UNIXO</h2>${itemRow({ kind: "ux", key: `${step.phase.id}|${step.task.id}`, area: "unixo", title: step.task.text, sub: step.phase.name + (step.task.date ? " · " + fd(step.task.date) : ""), done: false, link: "unixo" })}</section>` : ""}
    <section><h2>Apuntar algo</h2>${quickForm()}</section>
    ${inbox ? `<a class="card inbox" href="#ideas">💡 ${plural(inbox, "idea sin fecha", "ideas sin fecha")} en la bandeja →</a>` : ""}
    <section><h2>Próximos 7 días</h2>
      ${Object.keys(byDay).length ? Object.entries(byDay).map(([d, items]) => `<h3 class="day-h">${esc(fd(d))}</h3><div class="list">${items.map(i => itemRow(i)).join("")}</div>`).join("") : `<p class="empty">Semana despejada.</p>`}
    </section>`;
}

function viewCorrer() {
  const sessions = runSessions();
  const done = sessions.filter(s => s.done).length;
  const days = daysToRace();
  const t = today();
  return `<header class="bib">
      <p class="eyebrow">${esc(RACE.name)} · domingo 6 de diciembre de 2026</p>
      <h1>Objetivo <span>${RACE.goal}</span></h1>
      <div class="facts"><span>Ritmo <b>6:30/km</b></span><span>Días <b>L · X · S</b></span><span>FC máx. <b>188</b></span>${days > 0 ? `<span>Faltan <b>${days} días</b></span>` : `<span><b>¡Día de carrera!</b></span>`}</div>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${sessions.length}" aria-valuenow="${done}"><i style="width:${(done / sessions.length) * 100}%"></i></div>
      <div class="facts"><span><b>${done}/${sessions.length}</b> sesiones hechas</span></div>
    </header>
    <section><h2>Zonas</h2><div class="zones">${ZONES.map(z => `<div class="zone" style="--c:var(--r-${z.k})"><strong>${z.name}</strong><span class="mono">${esc(z.num)}</span><small>${esc(z.txt)}</small></div>`).join("")}</div></section>
    ${RUN_WEEKS.map(w => {
      const ss = sessions.filter(s => s.week === w.n);
      const current = ss[0].date <= addDays(t, 6) && ss[ss.length - 1].date >= t;
      return `<section class="week${current ? " current" : ""}">
        <div class="week-h"><h2>Semana ${w.n}${current ? ' <span class="now">esta semana</span>' : ""}</h2><span>${esc(w.focus)}</span></div>
        <div class="list">${ss.map(s => `<div class="item${s.done ? " done" : ""}${s.type === "race" ? " race" : ""}" style="--c:var(--r-${s.type === "test" ? "fast" : s.type})">
          <input type="checkbox" aria-label="Hecho" data-act="toggle" data-kind="run" data-key="${s.key}"${s.done ? " checked" : ""}>
          <div class="item-body"><div class="item-top"><span class="item-date mono">${fd(s.date)}</span><span class="item-title">${esc(s.title)}</span><span class="tag">${RUN_TAG[s.type]}</span></div>
          <div class="item-sub">${s.type === "easy" ? "Calentamiento: " + esc(WARMUP) + "<br>" : ""}${esc(s.detail)}</div>${s.target ? `<div class="item-date mono">${esc(s.target)}</div>` : ""}
          ${s.done ? "" : `<label class="chg">${s.date !== s.planned ? `Movido (era el ${fd(s.planned)}) · ` : ""}Cambiar día <input type="date" class="mini-date" data-act="move-date" data-kind="run" data-key="${s.key}" value="${s.date}"></label>`}</div>
          ${s.done ? "" : bell("run", s.key)}</div>`).join("")}</div>
      </section>`;
    }).join("")}
    <section><h2>Calentamiento y hybrid</h2><div class="card"><p><b>Días de rodaje suave:</b> antes de salir, ${esc(WARMUP)}</p><p class="muted">Martes y jueves: hybrid a las ${HYBRID.time}. Aparece en «Tu día», donde puedes marcarlo o cambiarlo de día.</p></div></section>
    <section><h2>Estrategia de carrera</h2><div class="card"><table class="tbl">${RUN_STRATEGY.map(([a, b]) => `<tr><td class="mono">${a}</td><td>${esc(b)}</td></tr>`).join("")}</table></div></section>
    <section><h2>Reglas del plan</h2><ul class="card rules">${RUN_RULES.map(r => `<li>${esc(r)}</li>`).join("")}</ul></section>`;
}

let igFilter = "all";
function postCard(p) {
  return `<article class="post ${p.f}${p.done ? " done" : ""}" id="${esc(p.id)}">
    <div class="post-top"><span class="when">${fd(p.date)}${p.time ? " · " + esc(p.time) : ""}</span><span class="chip ${p.f}">${fname(p.f)}</span></div>
    <h3>${esc(p.title)}</h3>
    ${p.pillar ? `<p class="muted small">${esc(p.pillar)}</p>` : ""}
    ${p.how && p.how.length ? `<details><summary>Cómo hacerlo</summary><ul>${p.how.map(x => `<li>${fill(x)}</li>`).join("")}</ul>${p.need ? `<p><b>Material:</b> ${esc(p.need)}</p>` : ""}</details>` : ""}
    ${p.cap ? `<div class="caption" id="cap-${esc(p.id)}">${fill(p.cap)}</div>` : ""}
    <div class="actions">
      ${p.cap ? `<button type="button" class="btn" data-act="copy" data-id="${esc(p.id)}">Copiar texto</button>` : ""}
      <label class="check"><input type="checkbox" data-act="toggle" data-kind="ig" data-key="${esc(p.id)}"${p.done ? " checked" : ""}> Publicado</label>
      ${p.done ? "" : `<button type="button" class="btn" data-act="remind" data-kind="ig" data-key="${esc(p.id)}">🔔 Avisarme</button>`}
      ${p.extra ? `<button type="button" class="btn ghost" data-act="del-post" data-id="${esc(p.id)}">Borrar</button>` : ""}
    </div>
  </article>`;
}

function viewInsta() {
  const posts = igPosts();
  const vis = p => igFilter === "all" || (igFilter === "todo" && !p.done) || p.f === igFilter;
  const n = posts.filter(p => p.done).length;
  const inWeek = p => !p.extra && IG_WEEKS.some(w => p.date >= w.from && p.date <= w.to);
  const extra = posts.filter(p => !inWeek(p));
  const weeks = IG_WEEKS.map(w => ({ ...w, posts: posts.filter(p => inWeek(p) && p.date >= w.from && p.date <= w.to && vis(p)) }));
  const extraVis = extra.filter(vis);
  return `<header class="hero"><p class="eyebrow">${esc(IG.account)}</p><h1>Instagram</h1>
      <p class="lead">2 reels y 1 carrusel por semana. Reels martes 20:00 y domingo 11:00; carruseles jueves 20:00. <b>${n} de ${posts.length}</b> publicados.</p></header>
    <details class="card"><summary>En cada publicación</summary><ul class="rules">${IG.rules.map(r => `<li>${r}</li>`).join("")}</ul></details>
    <div class="filter" role="group" aria-label="Filtrar">${[["all", "Todo"], ["todo", "Pendientes"], ["reel", "Reels"], ["carr", "Carruseles"]].map(([k, v]) => `<button type="button" data-act="igfilter" data-f="${k}" aria-pressed="${igFilter === k}">${v}</button>`).join("")}</div>
    ${weeks.map(w => w.posts.length ? `<section><div class="week-h"><h2>${w.n}</h2><span>${fd(w.from)} – ${fd(w.to)}</span></div>
      <p class="stories"><b>Historias:</b> ${esc(w.stories)}</p><div class="list">${w.posts.map(postCard).join("")}</div></section>` : "").join("")}
    ${extraVis.length ? `<section><h2>Más publicaciones</h2><div class="list">${extraVis.map(postCard).join("")}</div></section>` : ""}
    <details class="card"${extra.length ? "" : " open"}><summary>+ Añadir publicación</summary>
      <form data-form="post" class="form">
        <label>Título<input name="title" required></label>
        <div class="row"><label>Fecha<input type="date" name="date" required></label><label>Hora<input type="time" name="time" value="20:00"></label>
        <label>Formato<select name="f"><option value="reel">Reel</option><option value="carr">Carrusel</option><option value="story">Historia</option></select></label></div>
        <label>Texto de la publicación<textarea name="cap" rows="4"></textarea></label>
        <label>Material que necesitas<input name="need"></label>
        <button class="btn primary">Guardar publicación</button>
      </form></details>`;
}

const openContacts = new Set();
function viewFreelance() {
  const t = today();
  const cs = [...state.contacts].sort((a, b) => {
    const fa = nextFollowup(a), fb = nextFollowup(b);
    return (fa ? fa.date : "9999") .localeCompare(fb ? fb.date : "9999") || a.name.localeCompare(b.name);
  });
  const due = cs.filter(c => { const f = nextFollowup(c); return f && f.date <= t; }).length;
  return `<header class="hero"><p class="eyebrow">Apps y webs</p><h1>Freelance</h1>
      <p class="lead">${plural(state.contacts.length, "contacto", "contactos")}${due ? ` · <b>${plural(due, "pendiente", "pendientes")} de contactar</b>` : ""}</p></header>
    <details class="card"${state.contacts.length ? "" : " open"}><summary>+ Nuevo contacto</summary>
      <form data-form="contact" class="form">
        <label>Nombre<input name="name" required autocomplete="off"></label>
        <label>Empresa o proyecto<input name="company" autocomplete="off"></label>
        <div class="row"><label>Teléfono<input name="phone" type="tel"></label><label>Email<input name="email" type="email"></label></div>
        <label>Estado<select name="status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
        <div class="row"><label>Cuándo contactar<input type="date" name="date"></label><label>Por qué<input name="reason" placeholder="Enviar propuesta, llamar para…"></label></div>
        <label>Notas<textarea name="notes" rows="3"></textarea></label>
        <button class="btn primary">Guardar contacto</button>
      </form></details>
    <div class="list">${cs.map(c => contactCard(c, t)).join("") || `<p class="empty">Aún no hay contactos.</p>`}</div>`;
}

function contactCard(c, t) {
  const nf = nextFollowup(c);
  const fus = [...(c.followups || [])].sort((a, b) => Number(a.done) - Number(b.done) || a.date.localeCompare(b.date));
  const wa = c.phone ? c.phone.replace(/[^\d+]/g, "").replace(/^\+/, "") : "";
  return `<details class="contact" data-cid="${c.id}"${openContacts.has(c.id) ? " open" : ""}>
    <summary>
      <div class="contact-h"><b>${esc(c.name)}</b><span class="pill st-${c.status}">${STATUS[c.status] || ""}</span></div>
      ${c.company ? `<div class="muted small">${esc(c.company)}</div>` : ""}
      <div class="next${nf && nf.date < t ? " late" : nf && nf.date === t ? " today" : ""}">${nf ? `📞 ${fd(nf.date)} · ${esc(nf.reason)}` : "Sin próximo contacto"}</div>
    </summary>
    <div class="contact-body">
      <div class="links">${c.phone ? `<a class="btn" href="tel:${esc(c.phone)}">Llamar</a><a class="btn" href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a>` : ""}${c.email ? `<a class="btn" href="mailto:${esc(c.email)}">Email</a>` : ""}</div>
      <label>Estado<select data-act="cstatus" data-cid="${c.id}">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}"${k === c.status ? " selected" : ""}>${v}</option>`).join("")}</select></label>
      <h3>Cuándo y por qué contactar</h3>
      <div class="list">${fus.map(f => `<div class="item${f.done ? " done" : ""}" style="--c:var(--a-freelance)">
        <input type="checkbox" aria-label="Hecho" data-act="toggle" data-kind="fu" data-key="${c.id}|${f.id}"${f.done ? " checked" : ""}>
        <div class="item-body"><div class="item-top"><span class="item-date mono">${fd(f.date)}</span><span class="item-title">${esc(f.reason)}</span></div></div>
        ${f.done ? "" : bell("fu", `${c.id}|${f.id}`)}
        <button type="button" class="x" aria-label="Borrar" data-act="del-fu" data-key="${c.id}|${f.id}">×</button></div>`).join("") || `<p class="empty">Nada programado.</p>`}</div>
      <form data-form="fu" data-cid="${c.id}" class="row">
        <input type="date" name="date" required aria-label="Fecha">
        <input name="reason" required placeholder="Motivo" aria-label="Motivo">
        <button class="btn primary">Añadir</button>
      </form>
      <h3>Notas</h3>
      <textarea data-act="cnotes" data-cid="${c.id}" rows="3" placeholder="Presupuesto, qué necesita, cómo lo conociste…">${esc(c.notes)}</textarea>
      <h3>Historial</h3>
      <form data-form="log" data-cid="${c.id}" class="row"><input name="text" required placeholder="Qué hablasteis hoy" aria-label="Registro"><button class="btn">Registrar</button></form>
      <ul class="log">${(c.log || []).map(l => `<li><span class="mono">${fd(l.date)}</span> ${esc(l.text)}</li>`).join("")}</ul>
      <details class="edit"><summary>Editar datos</summary>
        <form data-form="cedit" data-cid="${c.id}" class="form">
          <label>Nombre<input name="name" required value="${esc(c.name)}"></label>
          <label>Empresa o proyecto<input name="company" value="${esc(c.company)}"></label>
          <div class="row"><label>Teléfono<input name="phone" type="tel" value="${esc(c.phone)}"></label><label>Email<input name="email" type="email" value="${esc(c.email)}"></label></div>
          <div class="row"><button class="btn primary">Guardar</button><button type="button" class="btn danger" data-act="del-contact" data-cid="${c.id}">Borrar contacto</button></div>
        </form></details>
    </div>
  </details>`;
}

function viewUnixo() {
  const all = state.unixo.phases.flatMap(p => p.tasks);
  const done = all.filter(t => t.done).length;
  const step = nextUnixoStep();
  return `<header class="hero"><p class="eyebrow">Sudaderas</p><h1>UNIXO</h1>
      <p class="lead">${all.length ? `<b>${done}/${all.length}</b> pasos hechos` : "Crea las fases del plan y sus pasos."}</p>
      ${all.length ? `<div class="bar"><i style="width:${(done / all.length) * 100}%"></i></div>` : ""}</header>
    ${step ? `<div class="card next-step"><p class="eyebrow">Siguiente paso</p><p><b>${esc(step.task.text)}</b></p><p class="muted small">${esc(step.phase.name)}${step.task.date ? " · " + fd(step.task.date) : ""}</p></div>` : ""}
    <details class="card"${state.unixo.summary ? "" : " open"}><summary>El plan (resumen)</summary>
      <textarea data-act="uxsummary" rows="6" placeholder="Objetivo, precios, proveedores, canales de venta…">${esc(state.unixo.summary)}</textarea></details>
    ${state.unixo.phases.map(p => {
      const d = p.tasks.filter(t => t.done).length;
      return `<section class="phase">
        <div class="week-h"><input class="phase-name" data-act="uxphase-name" data-pid="${p.id}" value="${esc(p.name)}" aria-label="Nombre de la fase"><span>${d}/${p.tasks.length}</span></div>
        <div class="list">${p.tasks.map(t => `<div class="item${t.done ? " done" : ""}" style="--c:var(--a-unixo)">
          <input type="checkbox" aria-label="Hecho" data-act="toggle" data-kind="ux" data-key="${p.id}|${t.id}"${t.done ? " checked" : ""}>
          <div class="item-body"><span class="item-title">${esc(t.text)}</span>
            <input type="date" class="mini-date" data-act="uxdate" data-key="${p.id}|${t.id}" value="${esc(t.date)}" aria-label="Fecha"></div>
          <button type="button" class="x" aria-label="Borrar" data-act="del-ux" data-key="${p.id}|${t.id}">×</button></div>`).join("")}</div>
        <form data-form="uxtask" data-pid="${p.id}" class="row"><input name="text" required placeholder="Nuevo paso" aria-label="Nuevo paso"><input type="date" name="date" aria-label="Fecha"><button class="btn">Añadir</button></form>
        <button type="button" class="btn ghost small" data-act="del-phase" data-pid="${p.id}">Borrar fase</button>
      </section>`;
    }).join("")}
    <form data-form="uxphase" class="card row"><input name="name" required placeholder="Nueva fase (p. ej. «1. Diseño y muestras»)" aria-label="Nueva fase"><button class="btn primary">Añadir fase</button></form>`;
}

function viewIdeas() {
  const inbox = state.tasks.filter(t => !t.date && !t.done);
  const planned = state.tasks.filter(t => t.date && !t.done).sort((a, b) => a.date.localeCompare(b.date));
  const done = state.tasks.filter(t => t.done);
  const row = t => `<div class="item${t.done ? " done" : ""}" style="--c:var(--a-${t.area})">
    <input type="checkbox" aria-label="Hecho" data-act="toggle" data-kind="task" data-key="${t.id}"${t.done ? " checked" : ""}>
    <div class="item-body"><div class="item-top"><span class="item-title">${esc(t.text)}</span><span class="tag">${AREAS[t.area] || ""}</span></div>
      <input type="date" class="mini-date" data-act="tdate" data-key="${t.id}" value="${esc(t.date)}" aria-label="Fecha"></div>
    <button type="button" class="x" aria-label="Borrar" data-act="del-task" data-key="${t.id}">×</button></div>`;
  return `<header class="hero"><p class="eyebrow">Para vaciar la cabeza</p><h1>Ideas y tareas</h1>
      <p class="lead">Apunta todo aquí. Cuando sepas cuándo hacerlo, ponle fecha y saldrá en «Hoy».</p></header>
    ${quickForm()}
    <section><h2>Bandeja (sin fecha)</h2><div class="list">${inbox.map(row).join("") || `<p class="empty">Bandeja vacía.</p>`}</div></section>
    <section><h2>Con fecha</h2><div class="list">${planned.map(row).join("") || `<p class="empty">Nada programado.</p>`}</div></section>
    ${done.length ? `<details class="card"><summary>Hechas (${done.length})</summary><div class="list">${done.map(row).join("")}</div>
      <button type="button" class="btn ghost small" data-act="clear-done">Borrar las hechas</button></details>` : ""}`;
}

const VIEWS = { hoy: viewHoy, correr: viewCorrer, insta: viewInsta, freelance: viewFreelance, unixo: viewUnixo, ideas: viewIdeas };
const tab = () => (VIEWS[location.hash.slice(1)] ? location.hash.slice(1) : "hoy");

function render() {
  const t = tab();
  document.getElementById("view").innerHTML = VIEWS[t]();
  document.querySelectorAll("nav.tabs a").forEach(a => a.toggleAttribute("aria-current", a.getAttribute("href") === "#" + t));
  const late = agenda("0000-01-01", addDays(today(), -1)).filter(i => !i.done && i.kind !== "run").length
    + agenda(today(), today()).filter(i => !i.done).length;
  const badge = document.getElementById("badge");
  badge.textContent = late || "";
  badge.hidden = !late;
}

/* ---------- acciones ---------- */
const findContact = id => state.contacts.find(c => c.id === id);
function findUx(key) {
  const [pid, tid] = key.split("|");
  const p = state.unixo.phases.find(x => x.id === pid);
  return { p, t: p && p.tasks.find(x => x.id === tid) };
}

function moveTo(kind, key, date) {
  if (!date) return;
  if (kind === "run") state.runMove[key] = date;
  else if (kind === "task") { const t = state.tasks.find(x => x.id === key); if (t) t.date = date; }
  else if (kind === "ux") { const { t } = findUx(key); if (t) t.date = date; }
  else if (kind === "fu") {
    const [cid, fid] = key.split("|");
    const f = findContact(cid)?.followups.find(x => x.id === fid);
    if (f) f.date = date;
  } else if (kind === "ig") {
    const extra = state.igExtra.find(p => p.id === key);
    if (extra) extra.date = date;
    else (state.igMove ||= {})[key] = date;
  }
  save(); render();
}

function toggle(kind, key, on) {
  if (kind === "run") state.runDone[key] = on;
  else if (kind === "ig") state.igDone[key] = on;
  else if (kind === "task") { const t = state.tasks.find(x => x.id === key); if (t) t.done = on; }
  else if (kind === "ux") { const { t } = findUx(key); if (t) t.done = on; }
  else if (kind === "fu") {
    const [cid, fid] = key.split("|");
    const c = findContact(cid), f = c && c.followups.find(x => x.id === fid);
    if (f) {
      f.done = on;
      c.log = (c.log || []).filter(l => l.fu !== fid);
      if (on) c.log.unshift({ date: today(), text: "Contactado: " + f.reason, fu: fid });
    }
  }
  save(); render();
}

function copyCaption(id, btn) {
  const p = igPosts().find(x => x.id === id);
  if (!p) return;
  const ok = () => { btn.textContent = "Copiado ✓"; setTimeout(() => (btn.textContent = "Copiar texto"), 1600); };
  const fallback = () => {
    const el = document.getElementById("cap-" + id);
    const r = document.createRange(); r.selectNodeContents(el);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    btn.textContent = "Seleccionado: cópialo";
  };
  try { navigator.clipboard.writeText(p.cap).then(ok, fallback); } catch (e) { fallback(); }
}

document.addEventListener("change", e => {
  const el = e.target, act = el.dataset.act;
  if (act === "toggle") return toggle(el.dataset.kind, el.dataset.key, el.checked);
  if (act === "move-date") return moveTo(el.dataset.kind, el.dataset.key, el.value);
  if (act === "cstatus") { findContact(el.dataset.cid).status = el.value; save(); return render(); }
  if (act === "cnotes") { findContact(el.dataset.cid).notes = el.value; return save(); }
  if (act === "uxsummary") { state.unixo.summary = el.value; return save(); }
  if (act === "uxphase-name") { const p = state.unixo.phases.find(x => x.id === el.dataset.pid); if (p && el.value.trim()) p.name = el.value.trim(); return save(); }
  if (act === "uxdate") { const { t } = findUx(el.dataset.key); if (t) t.date = el.value; save(); return render(); }
  if (act === "tdate") { const t = state.tasks.find(x => x.id === el.dataset.key); if (t) t.date = el.value; save(); return render(); }
});

document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el || el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA") return;
  const act = el.dataset.act;
  if (act === "copy") return copyCaption(el.dataset.id, el);
  if (act === "move") return moveTo(el.dataset.kind, el.dataset.key, el.dataset.to);
  if (act === "remind") return openRemind(el.dataset.kind, el.dataset.key);
  if (act === "igfilter") { igFilter = el.dataset.f; return render(); }
  if (act === "del-post" && confirm("¿Borrar esta publicación?")) {
    state.igExtra = state.igExtra.filter(p => p.id !== el.dataset.id); delete state.igDone[el.dataset.id];
  } else if (act === "del-fu") {
    const [cid, fid] = el.dataset.key.split("|"); const c = findContact(cid);
    c.followups = c.followups.filter(f => f.id !== fid);
  } else if (act === "del-contact" && confirm("¿Borrar este contacto y todo su historial?")) {
    state.contacts = state.contacts.filter(c => c.id !== el.dataset.cid); openContacts.delete(el.dataset.cid);
  } else if (act === "del-ux") {
    const { p, t } = findUx(el.dataset.key); if (p) p.tasks = p.tasks.filter(x => x !== t);
  } else if (act === "del-phase" && confirm("¿Borrar la fase y todos sus pasos?")) {
    state.unixo.phases = state.unixo.phases.filter(p => p.id !== el.dataset.pid);
  } else if (act === "del-task") {
    state.tasks = state.tasks.filter(t => t.id !== el.dataset.key);
  } else if (act === "clear-done" && confirm("¿Borrar todas las tareas hechas?")) {
    state.tasks = state.tasks.filter(t => !t.done);
  } else return;
  save(); render();
});

document.addEventListener("submit", e => {
  const f = e.target, kind = f.dataset.form;
  if (!kind) return;
  e.preventDefault();
  const v = Object.fromEntries(new FormData(f).entries());
  for (const k in v) v[k] = String(v[k]).trim();
  if (kind === "quick") {
    if (!v.text) return;
    state.tasks.push({ id: uid(), text: v.text, date: v.date || "", time: v.date ? v.time || "" : "", area: v.area || "personal", done: false, created: today() });
  } else if (kind === "post") {
    state.igExtra.push({ id: "x" + uid(), date: v.date, time: v.time, f: v.f, title: v.title, cap: v.cap, need: v.need, how: [] });
  } else if (kind === "contact") {
    const c = { id: uid(), name: v.name, company: v.company, phone: v.phone, email: v.email, status: v.status, notes: v.notes, followups: [], log: [{ date: today(), text: "Contacto creado" }] };
    if (v.date) c.followups.push({ id: uid(), date: v.date, reason: v.reason || "Contactar", done: false });
    state.contacts.push(c); openContacts.add(c.id);
  } else if (kind === "fu") {
    findContact(f.dataset.cid).followups.push({ id: uid(), date: v.date, reason: v.reason, done: false });
  } else if (kind === "log") {
    const c = findContact(f.dataset.cid); (c.log ||= []).unshift({ date: today(), text: v.text });
  } else if (kind === "cedit") {
    Object.assign(findContact(f.dataset.cid), { name: v.name, company: v.company, phone: v.phone, email: v.email });
  } else if (kind === "uxtask") {
    state.unixo.phases.find(p => p.id === f.dataset.pid).tasks.push({ id: uid(), text: v.text, date: v.date || "", done: false });
  } else if (kind === "uxphase") {
    state.unixo.phases.push({ id: uid(), name: v.name, tasks: [] });
  }
  save(); render();
  if (kind === "quick") document.getElementById("q-text")?.focus();
});

// Recordar qué fichas de contacto están abiertas entre repintados.
document.addEventListener("toggle", e => {
  const d = e.target;
  if (d.classList && d.classList.contains("contact")) d.open ? openContacts.add(d.dataset.cid) : openContacts.delete(d.dataset.cid);
}, true);

/* ---------- avisos ---------- */
// Sin servidor la app no puede mandar notificaciones con el móvil bloqueado.
// En su lugar crea un evento con alarma (.ics) que se guarda en la app de
// calendario del móvil, y es esa app la que avisa a la hora.
const remindDlg = document.getElementById("remind");
let remindItem = null;

function findItem(kind, key) {
  return agenda("2000-01-01", addDays(today(), 400)).find(i => i.kind === kind && i.key === key);
}

function openRemind(kind, key) {
  const it = findItem(kind, key);
  if (!it) return;
  remindItem = it;
  let date = it.date < today() ? today() : it.date, time = "09:00";
  if (it.time) {
    const d = new Date(`${it.date}T${it.time}`);
    d.setMinutes(d.getMinutes() - 30);
    if (iso(d) === it.date) time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  document.getElementById("r-title").textContent = it.title.replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, "");
  document.getElementById("r-date").value = date;
  document.getElementById("r-time").value = time;
  remindDlg.showModal();
}

const icsText = s => String(s).replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\r?\n/g, "\\n");

function downloadReminder(it, date, time) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const start = date.replace(/-/g, "") + "T" + time.replace(":", "") + "00";
  const title = it.title.replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, "");
  const desc = [it.time ? `A las ${it.time}` : "", it.sub || ""].filter(Boolean).join(". ");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Organizador//ES", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT", `UID:${uid()}@organizador`, `DTSTAMP:${stamp}`, `DTSTART:${start}`, "DURATION:PT15M",
    `SUMMARY:${icsText("🔔 " + title)}`, `DESCRIPTION:${icsText(desc)}`,
    "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsText(title)}`, "TRIGGER:PT0M", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR", "",
  ].join("\r\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([ics], { type: "text/calendar" })),
    download: `aviso-${date}.ics`,
  });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

document.getElementById("r-go").addEventListener("click", () => {
  const date = document.getElementById("r-date").value, time = document.getElementById("r-time").value;
  if (!remindItem || !date || !time) return;
  downloadReminder(remindItem, date, time);
  remindDlg.close();
});

/* ---------- copia de seguridad ---------- */
const menu = document.getElementById("menu");
document.getElementById("menu-btn").addEventListener("click", () => menu.showModal());
document.getElementById("export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `organizador-${today()}.json` });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
document.getElementById("import").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!confirm("Esto sustituye todos los datos de este dispositivo por los de la copia. ¿Seguir?")) return;
    replaceState(data);
    menu.close(); render();
  } catch (err) { alert("No se ha podido leer la copia: " + err.message); }
  finally { e.target.value = ""; }
});

/* ---------- arranque ---------- */
window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });

// La app siempre abre en «Tu día». Si vuelves tras más de 15 minutos fuera
// (o al día siguiente), también vuelve a «Tu día»; si no, sigue donde estabas.
const AWAY = 15 * 60 * 1000;
let hiddenAt = 0;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { hiddenAt = Date.now(); return; }
  if (Date.now() - hiddenAt > AWAY && tab() !== "hoy") location.hash = "hoy";
  else render();
});
if (location.hash !== "#hoy") history.replaceState(null, "", "#hoy");
render();

if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
