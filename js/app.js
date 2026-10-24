import { RACE, HYBRID, WARMUP, ZONES, RUN_WEEKS, RUN_STRATEGY, RUN_RULES, IG, OFFER_PAY, OFFER_HIGHLIGHTS } from "./data.js";
import { state, save, replaceState, uid } from "./store.js";
import { photos, loadPhotos, addPhoto, deletePhoto, exportPhotos, importPhotos } from "./photos.js";

/* ---------- utilidades ---------- */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => iso(new Date());
const addDays = (s, n) => { const d = new Date(s + "T12:00"); d.setDate(d.getDate() + n); return iso(d); };
const mondayOf = s => addDays(s, -((new Date(s + "T12:00").getDay() + 6) % 7));
const dayFmt = new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short" });
const longFmt = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });
const fd = s => dayFmt.format(new Date(s + "T12:00"));
const fill = s => esc(s).replace(/\[([^\]]+)\]/g, '<span class="fill">[$1]</span>');
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const initials = name => String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
const stripEmoji = s => s.replace(/^\p{Extended_Pictographic}️?\s*/u, "");

// Números escritos a mano: «7,2» km, «1.200 €».
const kmOf = v => { const n = parseFloat(String(v ?? "").replace(",", ".")); return isFinite(n) && n > 0 ? n : 0; };
const euros = v => { const n = parseFloat(String(v ?? "").replace(/[€\s.]/g, "").replace(",", ".")); return isFinite(n) && n > 0 ? n : 0; };
const money = n => n ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: "always" }).format(n) : "—";
const kmFmt = n => n.toLocaleString("es-ES", { maximumFractionDigits: 1 });
// «52:30» → 3150 s; «1:05:00» → 3900 s; «45» → 45 min.
const secs = t => {
  const p = String(t ?? "").trim().split(":").filter(Boolean).map(Number);
  if (!p.length || p.some(isNaN)) return 0;
  return p.length === 1 ? p[0] * 60 : p.reduce((a, v) => a * 60 + v, 0);
};
const paceFmt = s => { if (!s) return "—"; const r = Math.round(s); return `${Math.floor(r / 60)}:${pad(r % 60)}/km`; };
const safeUrl = u => /^https?:\/\//i.test(u) ? u : "https://" + u;

const AREAS = { personal: "Personal", freelance: "Freelance", unixo: "UNIXO", ig: "Instagram", run: "Correr" };
const STATUS = { lead: "Posible cliente", propuesta: "Propuesta enviada", cliente: "Cliente activo", pausa: "En pausa", pasado: "Cliente pasado", descartado: "Descartado" };
const PIPE = Object.keys(STATUS);
const CLOSED = ["pasado", "descartado"];
const SERVICES = ["Web", "Tienda online", "App", "Reservas / pedidos online", "Mantenimiento", "Otro"];
const SOURCES = ["Recomendación", "Instagram", "Contacto directo", "Web", "Otro"];
const ACT = { call: "📞 Llamada", whatsapp: "💬 WhatsApp", email: "✉️ Email", meeting: "🤝 Reunión", note: "📝 Nota" };
const ACT_ICON = { ...Object.fromEntries(Object.entries(ACT).map(([k, v]) => [k, v.split(" ")[0]])), done: "✅", stage: "🔀" };
const RUN_TAG = { easy: "Suave", tempo: "Umbral", fast: "Series", race: "Carrera", test: "Test" };
const FEEL = ["", "😫 Muy mal", "😕 Regular", "🙂 Bien", "😀 Muy bien", "🤩 Genial"];
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
  return state.igExtra
    .map(p => ({ ...p, done: !!state.igDone[p.id] }))
    .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
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
  // Los clientes descartados o pasados ya no generan avisos de contacto.
  state.contacts.filter(c => !CLOSED.includes(c.status)).forEach(c => (c.followups || []).forEach(f => {
    if (inR(f.date)) out.push({ date: f.date, kind: "fu", key: `${c.id}|${f.id}`, area: "freelance", title: `📞 ${c.name}${c.company ? " (" + c.company + ")" : ""}`, sub: f.reason, done: f.done, link: "freelance:" + c.id });
  }));
  state.unixo.phases.forEach(p => p.tasks.forEach(t => {
    if (inR(t.date)) out.push({ date: t.date, kind: "ux", key: `${p.id}|${t.id}`, area: "unixo", title: t.text, sub: p.name, done: t.done, link: "unixo" });
  }));
  const order = { run: 0, ig: 1, fu: 2, ux: 3, task: 4 };
  // Por día; dentro del día, primero lo que no tiene hora y luego por hora.
  return out.sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || "") || order[a.kind] - order[b.kind]);
}

const overdueItems = () => agenda("0000-01-01", addDays(today(), -1)).filter(i => !i.done && i.kind !== "run");

// Pasos de una fase ordenados por fecha; los que no tienen fecha, al final.
const byDate = tasks => [...tasks].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));

function nextUnixoStep() {
  for (const p of state.unixo.phases) for (const t of byDate(p.tasks)) if (!t.done) return { phase: p, task: t };
  return null;
}

function nextFollowup(c) {
  return (c.followups || []).filter(f => !f.done).sort((a, b) => a.date.localeCompare(b.date))[0] || null;
}

/* ---------- piezas de interfaz ---------- */
const LINK_TXT = { insta: "Ver en Instagram", unixo: "Ver en UNIXO" };

// Una tarea de la agenda. Se toca para ver sus opciones; el ✓ la marca hecha.
function itemRow(it, o = {}) {
  const k = `data-kind="${it.kind}" data-key="${esc(it.key)}"`;
  const actions = [
    it.kind === "run" && it.key.startsWith("s") && `<a class="btn small" href="#correr:${esc(it.key)}">📝 Cómo fue</a>`,
    it.link && `<a class="btn small" href="#${esc(it.link)}">${LINK_TXT[it.link] || "Abrir ficha del cliente"} →</a>`,
    !it.done && `<button type="button" class="btn small" data-act="remind" ${k}>🔔 Avisarme</button>`,
    !it.done && !o.late && `<label class="chg">Cambiar día <input type="date" class="mini-date" data-act="move-date" ${k} value="${it.date}"></label>`,
  ].filter(Boolean).join("");
  return `<div class="item${it.done ? " done" : ""}" style="--c:var(--a-${it.area})">
    <input type="checkbox" aria-label="Hecho" data-act="toggle" ${k}${it.done ? " checked" : ""}>
    <div class="item-body">
      <details class="more" data-keep="it-${esc(it.kind)}-${esc(it.key)}">
        <summary>
          <span class="item-top">${it.time ? `<span class="item-time mono">${esc(it.time)}</span>` : ""}<span class="item-title">${esc(it.title)}</span><span class="tag">${AREAS[it.area] || ""}</span></span>
          ${it.sub ? `<span class="item-sub clamp">${esc(it.sub)}</span>` : ""}
          ${o.date ? `<span class="item-date">${fd(it.date)}</span>` : ""}
        </summary>
        <div class="item-actions">${actions}</div>
      </details>
      ${o.late && !it.done ? moveControls(it) : ""}
    </div>
  </div>`;
}

// Botones para pasar algo atrasado a otro día (o borrarlo).
function moveControls(it) {
  const k = `data-kind="${it.kind}" data-key="${esc(it.key)}"`;
  return `<div class="move">
    <span class="muted small">Pasar a:</span>
    <button type="button" class="btn small" data-act="move" ${k} data-to="${today()}">Hoy</button>
    <button type="button" class="btn small" data-act="move" ${k} data-to="${addDays(today(), 1)}">Mañana</button>
    <input type="date" class="mini-date" data-act="move-date" ${k} min="${today()}" aria-label="Otra fecha">
    ${it.kind === "ig" ? `<button type="button" class="btn small danger" data-act="del-post" data-id="${esc(it.key)}">Borrar</button>` : ""}
    ${it.kind === "task" ? `<button type="button" class="btn small danger" data-act="del-task-late" data-key="${esc(it.key)}">Borrar</button>` : ""}
  </div>`;
}

const bell = (kind, key) => `<button type="button" class="bell" aria-label="Avisarme" title="Avisarme" data-act="remind" data-kind="${kind}" data-key="${esc(key)}">🔔</button>`;

function quickForm(withId = false) {
  return `<form class="quick" data-form="quick">
    <label class="sr"${withId ? ' for="q-text"' : ""}>Nueva idea o tarea</label>
    <input${withId ? ' id="q-text"' : ""} name="text" placeholder="Apunta lo que se te ocurra…" autocomplete="off" required>
    <div class="row">
      <select name="area" aria-label="Área">${Object.entries(AREAS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>
      <input type="date" name="date" aria-label="Fecha (opcional)">
      <input type="time" name="time" aria-label="Hora (opcional)">
      <button class="btn primary">Añadir</button>
    </div>
    <p class="hint">Sin fecha se queda en <a href="#ideas">Ideas</a>. Con fecha aparece en «Mi día» ese día.</p>
  </form>`;
}

const tiles = list => `<div class="tiles">${list.map(([l, v, s]) => `<div class="tile"><span class="tile-l">${l}</span><b class="tile-v">${v}</b>${s ? `<span class="tile-s">${s}</span>` : ""}</div>`).join("")}</div>`;

/* ---------- Mi día ---------- */
const SHORT = { ig: "📸", fu: "", ux: "🧥", task: "✅" };

function viewHoy() {
  const t = today();
  const overdue = overdueItems();
  const now = agenda(t, t);
  const flexible = now.filter(i => !i.time);
  const timed = now.filter(i => i.time);
  const soon = agenda(addDays(t, 1), addDays(t, 7));
  const inbox = state.tasks.filter(x => !x.date && !x.done).length;
  const left = now.filter(i => !i.done).length;
  const step = nextUnixoStep();
  const days = daysToRace();
  const reviewTime = [5, 6, 0, 1].includes(new Date().getDay()); // de viernes a lunes

  const byDay = {};
  soon.forEach(i => (byDay[i.date] ||= []).push(i));

  // Resumen en una línea: lo que hay hoy, de un vistazo.
  const summary = now.map(i => `<span class="sum${i.done ? " done" : ""}">${i.time ? `<b>${esc(i.time)}</b> ` : ""}${i.kind === "run" ? esc(i.title) : `${SHORT[i.kind]} ${esc(i.title)}`}</span>`).join("");
  const review = `<a class="card review-cta${reviewTime ? "" : " quiet"}" href="#semana"><span>📋</span><span><b>Repaso semanal</b><small>Qué hiciste, qué quedó pendiente y cómo viene la semana</small></span><span aria-hidden="true">›</span></a>`;

  return `<header class="hero">
      <p class="eyebrow">${esc(longFmt.format(new Date()))}</p>
      <h1>Tu día</h1>
      <p class="lead">${now.length ? (left ? `Te quedan <b>${plural(left, "cosa", "cosas")}</b> de ${now.length}` : "<b>Todo hecho por hoy</b> 🎉") : "Día libre en la agenda"}${days > 0 ? ` · faltan <b>${days} días</b> para París` : ""}</p>
      ${now.length ? `<div class="summary">${summary}</div>` : ""}
    </header>
    ${reviewTime ? review : ""}
    ${flexible.length ? `<section><h2>Durante el día</h2><div class="list">${flexible.map(i => itemRow(i)).join("")}</div></section>` : ""}
    ${timed.length ? `<section><h2>Con hora</h2><div class="list">${timed.map(i => itemRow(i)).join("")}</div></section>` : ""}
    ${!now.length ? `<p class="empty">Nada en la agenda de hoy. Aprovecha para la bandeja de ideas o el siguiente paso de UNIXO.</p>` : `<p class="hint">Toca una tarea para ver sus opciones. Con <b>+</b> añades cualquier cosa.</p>`}
    ${overdue.length ? `<section><h2 class="late-h">Atrasado</h2><div class="list">${overdue.map(i => itemRow(i, { late: true, date: true })).join("")}</div></section>` : ""}
    ${step ? `<section><h2>Siguiente paso UNIXO</h2>${itemRow({ kind: "ux", key: `${step.phase.id}|${step.task.id}`, area: "unixo", date: step.task.date || t, title: step.task.text, sub: step.phase.name + (step.task.date ? " · " + fd(step.task.date) : "") + (step.task.notes ? " · " + step.task.notes : ""), done: false, link: "unixo" })}</section>` : ""}
    ${inbox ? `<a class="card inbox" href="#ideas">💡 ${plural(inbox, "idea sin fecha", "ideas sin fecha")} en la bandeja →</a>` : ""}
    <section><h2>Próximos 7 días</h2>
      ${Object.keys(byDay).length ? Object.entries(byDay).map(([d, items]) => `<h3 class="day-h">${esc(fd(d))}</h3><div class="list">${items.map(i => itemRow(i)).join("")}</div>`).join("") : `<p class="empty">Semana despejada.</p>`}
    </section>
    ${reviewTime ? "" : review}`;
}

/* ---------- Repaso semanal ---------- */
function viewSemana() {
  const t = today();
  const arg = route()[1];
  const mon = /^\d{4}-\d{2}-\d{2}$/.test(arg || "") ? mondayOf(arg) : mondayOf(t);
  const sun = addDays(mon, 6), nextMon = addDays(mon, 7);
  const thisMon = mondayOf(t);
  const items = agenda(mon, sun);
  const done = items.filter(i => i.done);
  const pending = items.filter(i => !i.done && i.date < t && i.kind !== "run");
  const missedRuns = items.filter(i => !i.done && i.date < t && i.kind === "run");
  const rest = items.filter(i => !i.done && i.date >= t);
  const next = mon <= thisMon ? agenda(nextMon, addDays(nextMon, 6)) : [];
  const runs = items.filter(i => i.kind === "run" && i.key.startsWith("s"));
  const hybrids = items.filter(i => i.kind === "run" && i.key.startsWith("h"));
  const km = runs.reduce((a, i) => a + kmOf((state.runNotes[i.key] || {}).km), 0);
  const title = mon === thisMon ? "Esta semana" : mon === addDays(thisMon, -7) ? "Semana pasada" : mon > thisMon ? "Semana que viene" : "Semana del " + fd(mon);
  const note = ((state.reviews ||= {})[mon] || {}).text || "";
  const byDay = {};
  next.forEach(i => (byDay[i.date] ||= []).push(i));
  const monAfter = addDays(thisMon, 7);

  return `<a class="back" href="#hoy">‹ Mi día</a>
    <header class="hero"><p class="eyebrow">Repaso semanal</p><h1>${title}</h1>
      <div class="week-nav"><a class="btn small" href="#semana:${addDays(mon, -7)}" aria-label="Semana anterior">‹</a><span>${fd(mon)} – ${fd(sun)}</span><a class="btn small" href="#semana:${nextMon}" aria-label="Semana siguiente">›</a></div>
    </header>
    ${tiles([
      ["Entrenos", `${runs.filter(r => r.done).length}/${runs.length}`, hybrids.length ? `+ ${hybrids.filter(h => h.done).length}/${hybrids.length} hybrid` : ""],
      ["Kilómetros", km ? kmFmt(km) : "—", km ? "apuntados en «Cómo fue»" : "apúntalos en «Cómo fue»"],
      ["Tareas hechas", done.filter(i => i.kind === "task").length, ""],
      ["Contactos hechos", done.filter(i => i.kind === "fu").length, "clientes"],
      ["Pasos UNIXO", done.filter(i => i.kind === "ux").length, "hechos"],
    ])}
    ${pending.length ? `<section><h2 class="late-h">Se ha quedado pendiente</h2>
        <p class="muted small">Decide qué hacer con cada cosa: hacerla, pasarla a otro día o borrarla.</p>
        <div class="row bulk"><button type="button" class="btn small" data-act="move-all" data-week="${mon}" data-to="${t}">Todo a hoy</button><button type="button" class="btn small" data-act="move-all" data-week="${mon}" data-to="${monAfter}">Todo al lunes ${esc(fd(monAfter))}</button></div>
        <div class="list">${pending.map(i => itemRow(i, { late: true, date: true })).join("")}</div></section>`
      : mon <= thisMon ? `<p class="ok">✅ No se ha quedado nada pendiente.</p>` : ""}
    ${missedRuns.length ? `<p class="muted small">Entrenos sin marcar: ${missedRuns.map(i => esc(stripEmoji(i.title))).join(", ")}. Si te saltaste alguno, no lo recuperes: sigue con el plan.</p>` : ""}
    ${rest.length ? `<section><h2>${mon > thisMon ? "Lo que viene" : "Lo que queda esta semana"}</h2><div class="list">${rest.map(i => itemRow(i, { date: true })).join("")}</div></section>` : ""}
    ${done.length ? `<details class="card" data-keep="rev-done"><summary>Hecho (${done.length})</summary><ul class="done-list">${done.map(i => `<li><span class="mono">${fd(i.date)}</span> ${esc(stripEmoji(i.title))}</li>`).join("")}</ul></details>` : ""}
    ${next.length ? `<section><h2>La semana que viene</h2>${Object.entries(byDay).map(([d, list]) => `<h3 class="day-h">${esc(fd(d))}</h3><div class="list">${list.map(i => itemRow(i)).join("")}</div>`).join("")}</section>` : ""}
    <section class="card"><h2>Notas del repaso</h2>
      <textarea data-act="review" data-week="${mon}" rows="5" placeholder="¿Qué ha ido bien? ¿Qué cambiarías? ¿Qué es lo más importante la semana que viene?">${esc(note)}</textarea>
      <p class="hint">Se guarda solo.</p></section>`;
}

/* ---------- 10K ---------- */
// Desplegable de cada entreno: datos, comentario y capturas del reloj.
function runNotes(s) {
  const n = state.runNotes[s.key] || {};
  const pics = photos.get(s.key) || [];
  const k = `data-key="${s.key}"`;
  const filled = [n.km && n.km + " km", n.time, n.hr && n.hr + " ppm", FEEL[n.feel]].filter(Boolean).join(" · ");
  return `<details class="run-notes" data-keep="run-${s.key}">
    <summary>📝 Cómo fue${filled ? ` · <span class="muted">${esc(filled)}</span>` : ""}${pics.length ? ` · 📷 ${pics.length}` : ""}${n.text && !filled ? " · ✍️" : ""}</summary>
    <div class="row">
      <label>Distancia (km)<input inputmode="decimal" data-act="rnote" data-f="km" ${k} value="${esc(n.km)}" placeholder="7,2"></label>
      <label>Tiempo<input data-act="rnote" data-f="time" ${k} value="${esc(n.time)}" placeholder="52:30"></label>
      <label>FC media<input inputmode="numeric" data-act="rnote" data-f="hr" ${k} value="${esc(n.hr)}" placeholder="142"></label>
    </div>
    <label>Sensaciones<select data-act="rnote" data-f="feel" ${k}>${FEEL.map((f, i) => `<option value="${i || ""}"${String(n.feel || "") === String(i || "") ? " selected" : ""}>${f || "—"}</option>`).join("")}</select></label>
    <label>Comentario<textarea data-act="rnote" data-f="text" ${k} rows="3" placeholder="Cómo te has sentido, molestias, ritmo por km…">${esc(n.text)}</textarea></label>
    ${pics.length ? `<div class="pics">${pics.map(p => `<div class="pic"><img src="${p.url}" alt="Captura" data-act="photo-open" data-id="${p.id}" loading="lazy"><button type="button" class="x" aria-label="Borrar captura" data-act="photo-del" data-id="${p.id}">×</button></div>`).join("")}</div>` : ""}
    <label class="btn upload">📷 Añadir captura del reloj<input type="file" accept="image/*" multiple hidden data-act="rphoto" ${k}></label>
  </details>`;
}

// Progreso: lo que apuntas en «Cómo fue», resumido por semanas.
function runProgress(sessions) {
  const t = today();
  const logged = sessions.map(s => {
    const n = state.runNotes[s.key] || {};
    const km = kmOf(n.km), sec = secs(n.time);
    return { ...s, n, km, sec, pace: km && sec ? sec / km : 0 };
  });
  const weeks = RUN_WEEKS.map(w => {
    const ss = logged.filter(s => s.week === w.n);
    return { n: w.n, km: ss.reduce((a, s) => a + s.km, 0), done: ss.filter(s => s.done).length, total: ss.length, from: ss[0].date, to: ss[ss.length - 1].date };
  });
  const totalKm = weeks.reduce((a, w) => a + w.km, 0);
  const paced = logged.filter(s => s.pace);
  const avgPace = paced.length ? paced.reduce((a, s) => a + s.sec, 0) / paced.reduce((a, s) => a + s.km, 0) : 0;
  const feels = logged.filter(s => +s.n.feel).map(s => +s.n.feel);
  const feelAvg = feels.length ? Math.round(feels.reduce((a, b) => a + b, 0) / feels.length) : 0;
  const done = logged.filter(s => s.done).length;
  const cur = weeks.findIndex(w => w.from <= addDays(t, 6) && w.to >= t);
  const recent = logged.filter(s => s.km || s.sec || +s.n.feel).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  // Gráfico de barras: km por semana (una sola serie, sin leyenda).
  const W = 320, H = 150, padX = 6, base = H - 22, top = 18;
  const max = Math.max(5, ...weeks.map(w => w.km));
  const slot = (W - padX * 2) / weeks.length, bw = slot - 10;
  const best = weeks.reduce((b, w, i) => (w.km > weeks[b].km ? i : b), 0);
  const bars = weeks.map((w, i) => {
    const x = padX + i * slot + 5, h = (w.km / max) * (base - top), y = base - h, r = Math.min(4, h);
    const path = h ? `<path d="M${x},${base} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${base} Z" class="bar-mark${i === cur ? " cur" : ""}"/>` : "";
    const label = w.km && (i === cur || i === best) ? `<text x="${x + bw / 2}" y="${y - 5}" class="bar-val">${kmFmt(w.km)}</text>` : "";
    const info = `Semana ${w.n}: ${w.km ? kmFmt(w.km) + " km" : "sin km apuntados"} · ${w.done}/${w.total} sesiones`;
    return `${path}${label}<text x="${x + bw / 2}" y="${H - 6}" class="bar-x${i === cur ? " cur" : ""}">S${w.n}</text>
      <rect x="${x - 4}" y="${top - 10}" width="${bw + 8}" height="${base - top + 26}" class="bar-hit" data-act="kmbar" data-info="${esc(info)}"><title>${esc(info)}</title></rect>`;
  }).join("");

  return `<section><h2>Tu progreso</h2>
    ${tiles([
      ["Sesiones hechas", `${done}/${sessions.length}`, ""],
      ["Km apuntados", totalKm ? kmFmt(totalKm) : "—", ""],
      ["Ritmo medio", paceFmt(avgPace), paced.length ? plural(paced.length, "entreno", "entrenos") + " con tiempo" : "apunta km y tiempo"],
      ["Sensaciones", feelAvg ? FEEL[feelAvg] : "—", ""],
    ])}
    <div class="card chart">
      <p class="chart-t">Kilómetros por semana</p>
      ${totalKm ? `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Kilómetros por semana del plan">${bars}<line x1="${padX}" x2="${W - padX}" y1="${base}" y2="${base}" class="bar-base"/></svg>
        <p id="km-readout" class="muted small">Toca una barra para ver la semana.</p>`
        : `<p class="muted">Al terminar un entreno, abre «📝 Cómo fue» y apunta los km y el tiempo: aquí verás cómo evolucionas.</p>`}
    </div>
    ${recent.length ? `<details class="card" data-keep="run-table"><summary>Últimos entrenos apuntados</summary>
      <div class="tbl-wrap"><table class="tbl data"><thead><tr><th>Día</th><th>Entreno</th><th>Km</th><th>Tiempo</th><th>Ritmo</th><th></th></tr></thead><tbody>
      ${recent.map(s => `<tr><td>${fd(s.date)}</td><td>${esc(s.title)}</td><td>${s.km ? kmFmt(s.km) : "—"}</td><td>${esc(s.n.time || "—")}</td><td>${paceFmt(s.pace)}</td><td>${(FEEL[s.n.feel] || "").split(" ")[0]}</td></tr>`).join("")}
      </tbody></table></div></details>` : ""}
  </section>`;
}

function viewCorrer() {
  const sessions = runSessions();
  const days = daysToRace();
  const t = today();
  return `<header class="bib">
      <p class="eyebrow">${esc(RACE.name)} · domingo 6 de diciembre de 2026</p>
      <h1>Objetivo <span>${RACE.goal}</span></h1>
      <div class="facts"><span>Ritmo <b>6:30/km</b></span><span>Días <b>L · X · S</b></span><span>FC máx. <b>188</b></span>${days > 0 ? `<span>Faltan <b>${days} días</b></span>` : `<span><b>¡Día de carrera!</b></span>`}</div>
    </header>
    ${runProgress(sessions)}
    <details class="card" data-keep="zones"><summary>Zonas de pulso</summary><div class="zones">${ZONES.map(z => `<div class="zone" style="--c:var(--r-${z.k})"><strong>${z.name}</strong><span class="mono">${esc(z.num)}</span><small>${esc(z.txt)}</small></div>`).join("")}</div></details>
    ${RUN_WEEKS.map(w => {
      const ss = sessions.filter(s => s.week === w.n);
      const current = ss[0].date <= addDays(t, 6) && ss[ss.length - 1].date >= t;
      return `<section class="week${current ? " current" : ""}">
        <div class="week-h"><h2>Semana ${w.n}${current ? ' <span class="now">esta semana</span>' : ""}</h2><span>${esc(w.focus)}</span></div>
        <div class="list">${ss.map(s => `<div class="item${s.done ? " done" : ""}${s.type === "race" ? " race" : ""}" style="--c:var(--r-${s.type === "test" ? "fast" : s.type})">
          <input type="checkbox" aria-label="Hecho" data-act="toggle" data-kind="run" data-key="${s.key}"${s.done ? " checked" : ""}>
          <div class="item-body"><div class="item-top"><span class="item-date mono">${fd(s.date)}</span><span class="item-title">${esc(s.title)}</span><span class="tag">${RUN_TAG[s.type]}</span></div>
          <div class="item-sub">${s.type === "easy" ? "Calentamiento: " + esc(WARMUP) + "<br>" : ""}${esc(s.detail)}</div>${s.target ? `<div class="item-date mono">${esc(s.target)}</div>` : ""}
          ${runNotes(s)}
          ${s.done ? "" : `<label class="chg">${s.date !== s.planned ? `Movido (era el ${fd(s.planned)}) · ` : ""}Cambiar día <input type="date" class="mini-date" data-act="move-date" data-kind="run" data-key="${s.key}" value="${s.date}"></label>`}</div>
          ${s.done ? "" : bell("run", s.key)}</div>`).join("")}</div>
      </section>`;
    }).join("")}
    <section><h2>Calentamiento y hybrid</h2><div class="card"><p><b>Días de rodaje suave:</b> antes de salir, ${esc(WARMUP)}</p><p class="muted">Martes y jueves: hybrid a las ${HYBRID.time}. Aparece en «Mi día», donde puedes marcarlo o cambiarlo de día.</p></div></section>
    <section><h2>Estrategia de carrera</h2><div class="card"><table class="tbl">${RUN_STRATEGY.map(([a, b]) => `<tr><td class="mono">${a}</td><td>${esc(b)}</td></tr>`).join("")}</table></div></section>
    <section><h2>Reglas del plan</h2><ul class="card rules">${RUN_RULES.map(r => `<li>${esc(r)}</li>`).join("")}</ul></section>`;
}

/* ---------- Instagram ---------- */
function postCard(p) {
  return `<article class="post ${p.f}${p.done ? " done" : ""}" id="${esc(p.id)}">
    <div class="post-top"><span class="when">${fd(p.date)}${p.time ? " · " + esc(p.time) : ""}</span><span class="chip ${p.f}">${fname(p.f)}</span></div>
    <h3>${esc(p.title)}</h3>
    ${p.cap ? `<div class="caption" id="cap-${esc(p.id)}">${fill(p.cap)}</div>` : ""}
    ${p.need ? `<p class="muted small"><b>Material:</b> ${esc(p.need)}</p>` : ""}
    <div class="actions">
      ${p.cap ? `<button type="button" class="btn" data-act="copy" data-id="${esc(p.id)}">Copiar texto</button>` : ""}
      <label class="check"><input type="checkbox" data-act="toggle" data-kind="ig" data-key="${esc(p.id)}"${p.done ? " checked" : ""}> Publicado</label>
      ${p.done ? "" : `<button type="button" class="btn" data-act="remind" data-kind="ig" data-key="${esc(p.id)}">🔔 Avisarme</button>`}
      <button type="button" class="btn ghost" data-act="del-post" data-id="${esc(p.id)}">Borrar</button>
    </div>
  </article>`;
}

function viewInsta() {
  const posts = igPosts();
  const late = posts.filter(p => !p.done && p.date < today()).length;
  return `<header class="hero"><p class="eyebrow">${esc(IG.account)}</p><h1>Instagram</h1>
      <p class="lead">${posts.length ? `<b>${posts.filter(p => p.done).length} de ${posts.length}</b> publicados.` : "Calendario vacío."}</p></header>
    ${posts.length ? "" : `<div class="card empty-card"><p><b>Aquí irá tu nuevo calendario.</b></p><p class="muted">Cuando lo tengas, pásamelo (artefacto, documento o captura) y lo cargo con fechas, horas y textos listos para copiar. Mientras tanto puedes añadir publicaciones a mano.</p></div>`}
    ${late ? `<div class="card late-card"><p><b>${plural(late, "publicación atrasada", "publicaciones atrasadas")}</b> sin publicar.</p><button type="button" class="btn danger small" data-act="del-late-posts">Borrar todas las atrasadas</button></div>` : ""}
    ${posts.length ? `<div class="list">${posts.map(postCard).join("")}</div>` : ""}
    <details class="card" data-keep="new-post"${posts.length ? "" : " open"}><summary>+ Añadir publicación</summary>
      <form data-form="post" class="form">
        <label>Título<input name="title" required></label>
        <div class="row"><label>Fecha<input type="date" name="date" required></label><label>Hora<input type="time" name="time" value="20:00"></label>
        <label>Formato<select name="f"><option value="reel">Reel</option><option value="carr">Carrusel</option><option value="story">Historia</option></select></label></div>
        <label>Texto de la publicación<textarea name="cap" rows="4"></textarea></label>
        <label>Material que necesitas<input name="need"></label>
        <button class="btn primary">Guardar publicación</button>
      </form></details>`;
}

/* ---------- Clientes (CRM) ---------- */
let clientFilter = "all";
try { clientFilter = localStorage.getItem("organizer-client-filter") || "all"; } catch (e) { /* sin almacenamiento */ }
let clientQuery = "";

const isDue = (c, t) => { const f = nextFollowup(c); return !CLOSED.includes(c.status) && !!f && f.date <= t; };

function viewFreelance() {
  const id = route()[1];
  if (id === "new") return viewNewContact();
  if (id === "plantillas") return viewTemplates();
  const one = id && findContact(id);
  if (one) return route()[2] === "oferta" ? viewOffer(one) : viewContact(one);

  const t = today();
  const all = [...state.contacts].sort((a, b) => {
    const fa = nextFollowup(a), fb = nextFollowup(b);
    return Number(CLOSED.includes(a.status)) - Number(CLOSED.includes(b.status))
      || (fa ? fa.date : "9999").localeCompare(fb ? fb.date : "9999") || a.name.localeCompare(b.name);
  });
  const count = k => all.filter(c => c.status === k).length;
  const sum = sts => all.filter(c => sts.includes(c.status)).reduce((a, c) => a + euros(c.value), 0);
  const due = all.filter(c => isDue(c, t)).length;
  if (clientFilter !== "all" && clientFilter !== "due" && !count(clientFilter)) clientFilter = "all";
  const cs = all.filter(c => clientFilter === "all" || (clientFilter === "due" ? isDue(c, t) : c.status === clientFilter));
  const chips = [["all", "Todos", all.length, ""], ["due", "📞 Por contactar", due, ""],
    ...PIPE.filter(k => count(k)).map(k => [k, STATUS[k], count(k), k])];

  return `<header class="hero hero-row"><div><p class="eyebrow">Freelance · apps y webs</p><h1>Clientes</h1></div><a class="btn small" href="#freelance:plantillas">✉️ Plantillas y oferta</a></header>
    ${tiles([
      ["Por contactar", due, due ? "hoy o atrasados" : "todo al día"],
      ["En juego", count("lead") + count("propuesta"), "posibles y propuestas"],
      ["En propuestas", money(sum(["propuesta"])), plural(count("propuesta"), "propuesta", "propuestas")],
      ["Ganado", money(sum(["cliente", "pasado"])), "activos y pasados"],
    ])}
    <div class="crm-tools">
      <input type="search" id="c-search" placeholder="Buscar por nombre, empresa…" value="${esc(clientQuery)}" aria-label="Buscar cliente">
      <a class="btn primary" href="#freelance:new">+ Nuevo</a>
    </div>
    ${all.length ? `<div class="filter" role="group" aria-label="Filtrar clientes">${chips.map(([k, label, n, st]) =>
      `<button type="button" data-act="cfilter" data-f="${k}" aria-pressed="${clientFilter === k}"${st ? ` class="st" style="--st:var(--st-${st})"` : ""}>${label} <span class="n">${n}</span></button>`).join("")}</div>` : ""}
    <div class="crm-list">${cs.map(c => crmRow(c, t)).join("") || `<p class="empty">${all.length ? "Ningún cliente con este filtro." : "Aún no hay clientes. Pulsa «+ Nuevo»."}</p>`}</div>
    <p class="empty" id="c-none" hidden>Ningún cliente coincide con la búsqueda.</p>`;
}

function crmRow(c, t) {
  const nf = nextFollowup(c), closed = CLOSED.includes(c.status);
  const late = !closed && nf && nf.date < t, now = !closed && nf && nf.date === t;
  const open = ["lead", "propuesta"].includes(c.status);
  const next = closed ? (c.status === "descartado" ? "Descartado" : "Cliente pasado")
    : nf ? `📞 ${fd(nf.date)} · ${esc(nf.reason)}` : open ? "⚠️ Sin próxima acción" : "Sin próxima acción";
  const search = [c.name, c.company, c.service, c.email, c.phone, c.notes].join(" ").toLowerCase();
  return `<a class="crm-row st-${c.status}" href="#freelance:${c.id}" style="--st:var(--st-${c.status})" data-search="${esc(search)}">
    <span class="avatar" aria-hidden="true">${esc(initials(c.name))}</span>
    <span class="crm-main">
      <span class="crm-name">${esc(c.name)}</span>
      ${c.company || c.service ? `<span class="crm-sub">${esc([c.company, c.service].filter(Boolean).join(" · "))}</span>` : ""}
      <span class="crm-next${late ? " late" : now ? " today" : !nf && open ? " warn" : ""}">${next}</span>
    </span>
    <span class="crm-side"><span class="pill st-${c.status}">${STATUS[c.status] || ""}</span>${euros(c.value) ? `<span class="crm-val">${money(euros(c.value))}</span>` : ""}</span>
  </a>`;
}

const options = (list, cur) => ["", ...list].map(v => `<option value="${esc(v)}"${v === (cur || "") ? " selected" : ""}>${v ? esc(v) : "—"}</option>`).join("");

function viewNewContact() {
  return `<a class="back" href="#freelance">‹ Clientes</a>
    <header class="hero"><h1>Nuevo cliente</h1></header>
    <form data-form="contact" class="card form">
      <label>Nombre *<input name="name" required autocomplete="off"></label>
      <label>Empresa o proyecto<input name="company" autocomplete="off"></label>
      <label>Persona de contacto<input name="person" autocomplete="off" placeholder="Con quién hablas (para saludar en los mensajes)"></label>
      <div class="row"><label>Teléfono<input name="phone" type="tel"></label><label>Email<input name="email" type="email"></label></div>
      <div class="row"><label>Servicio<select name="service">${options(SERVICES)}</select></label><label>Presupuesto (€)<input name="value" inputmode="decimal" placeholder="1.200"></label></div>
      <div class="row"><label>Origen<select name="source">${options(SOURCES)}</select></label><label>Estado<select name="status">${PIPE.map(k => `<option value="${k}">${STATUS[k]}</option>`).join("")}</select></label></div>
      <h3>Próxima acción</h3>
      <div class="row"><label>Cuándo<input type="date" name="date"></label><label>Qué hay que hacer<input name="reason" placeholder="Enviar propuesta, llamar para…"></label></div>
      <label>Notas<textarea name="notes" rows="3" placeholder="Qué necesita, cómo lo conociste…"></textarea></label>
      <button class="btn primary">Guardar cliente</button>
    </form>`;
}

function viewContact(c) {
  const t = today();
  const nf = nextFollowup(c), closed = CLOSED.includes(c.status);
  const later = (c.followups || []).filter(f => !f.done && f !== nf).sort((a, b) => a.date.localeCompare(b.date));
  const wa = c.phone ? c.phone.replace(/[^\d+]/g, "").replace(/^\+/, "") : "";
  const log = (c.log || []).map((l, i) => ({ ...l, i })).sort((a, b) => b.date.localeCompare(a.date));
  const f = `data-cid="${c.id}"`;
  const quick = [["+2 días", 2], ["+1 semana", 7], ["+2 semanas", 14], ["+1 mes", 30]];
  return `<a class="back" href="#freelance">‹ Clientes</a>
    <header class="crm-head" style="--st:var(--st-${c.status})">
      <span class="avatar big" aria-hidden="true">${esc(initials(c.name))}</span>
      <div><h1>${esc(c.name)}</h1><p class="muted">${esc([c.company, c.service].filter(Boolean).join(" · ")) || "Sin empresa"}${euros(c.value) ? ` · <b>${money(euros(c.value))}</b>` : ""}</p></div>
    </header>
    <div class="contact-actions">
      ${c.phone ? `<a class="btn" href="tel:${esc(c.phone)}">📞 Llamar</a><a class="btn" href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener">💬 WhatsApp</a>` : ""}
      ${c.email ? `<a class="btn" href="mailto:${esc(c.email)}">✉️ Email</a>` : ""}
      ${c.link ? `<a class="btn" href="${esc(safeUrl(c.link))}" target="_blank" rel="noopener">📄 Propuesta</a>` : ""}
      ${!c.phone && !c.email ? `<span class="muted small">Añade teléfono o email en «Datos de contacto» para llamar o escribir desde aquí.</span>` : ""}
    </div>

    <section><h2>Estado</h2>
      <div class="stages" role="group" aria-label="Estado">${PIPE.map(k => `<button type="button" class="stage" data-act="cstatus-set" ${f} data-st="${k}" style="--st:var(--st-${k})" aria-pressed="${c.status === k}">${STATUS[k]}</button>`).join("")}</div>
    </section>

    <section class="card next-action${!closed && nf && nf.date < t ? " is-late" : ""}">
      <h2>Próxima acción</h2>
      ${closed ? `<p class="muted">Cliente cerrado: no hay avisos de contacto.</p>`
        : nf ? `<div class="na">
            <input type="checkbox" aria-label="Hecho" data-act="toggle" data-kind="fu" data-key="${c.id}|${nf.id}">
            <div><p class="na-date${nf.date < t ? " late" : ""}">${nf.date < t ? "Atrasado · " : nf.date === t ? "Hoy · " : ""}${fd(nf.date)}</p><p class="na-what">${esc(nf.reason)}</p>
              <div class="row na-tools"><label class="chg">Cambiar fecha <input type="date" class="mini-date" data-act="move-date" data-kind="fu" data-key="${c.id}|${nf.id}" value="${nf.date}"></label>
              <button type="button" class="btn small" data-act="remind" data-kind="fu" data-key="${c.id}|${nf.id}">🔔 Avisarme</button>
              <button type="button" class="btn small ghost" data-act="del-fu" data-key="${c.id}|${nf.id}">Quitar</button></div></div>
          </div><p class="hint">Cuando lo hagas, márcalo ✓ y programa el siguiente paso aquí abajo.</p>`
        : `<p class="warn">⚠️ No hay nada programado. Decide cuándo y por qué vuelves a contactar.</p>`}
      ${later.length ? `<p class="muted small">Después: ${later.map(x => `${fd(x.date)} · ${esc(x.reason)}`).join(" — ")}</p>` : ""}
      ${closed ? "" : `<form data-form="fu" ${f} class="form next-form">
        <label>${nf ? "Programar otra acción" : "Qué hay que hacer"}<input id="next-reason" name="reason" required placeholder="Llamar para cerrar el presupuesto…"></label>
        <div class="quick-dates">${quick.map(([l, n]) => `<button type="button" class="btn small" data-act="fu-date" data-to="${addDays(t, n)}">${l}</button>`).join("")}</div>
        <div class="row"><input type="date" name="date" required aria-label="Fecha"><button class="btn primary">Programar</button></div>
      </form>`}
    </section>

    ${messagesSection(c)}

    <section><h2>Actividad</h2>
      <form data-form="log" ${f} class="card form log-form">
        <div class="types" role="radiogroup" aria-label="Tipo">${Object.entries(ACT).map(([k, v], i) => `<label class="type"><input type="radio" name="type" value="${k}"${i === 0 ? " checked" : ""}><span>${v}</span></label>`).join("")}</div>
        <textarea name="text" rows="2" required placeholder="¿Qué habéis hablado? ¿Qué quedó pendiente?"></textarea>
        <div class="row"><input type="date" name="date" value="${t}" aria-label="Fecha"><button class="btn primary">Registrar</button></div>
      </form>
      ${log.length ? `<ol class="timeline">${log.map(l => `<li><span class="tl-icon" aria-hidden="true">${ACT_ICON[l.type] || "📝"}</span><div><span class="mono">${fd(l.date)}</span><p>${esc(l.text)}</p></div><button type="button" class="x" aria-label="Borrar" data-act="del-log" ${f} data-i="${l.i}">×</button></li>`).join("")}</ol>` : `<p class="empty">Sin actividad todavía.</p>`}
    </section>

    <section class="card"><h2>Proyecto</h2>
      <div class="form">
        <div class="row"><label>Servicio<select data-act="cfield" data-f="service" ${f}>${options(SERVICES, c.service)}</select></label>
          <label>Presupuesto (€)<input inputmode="decimal" data-act="cfield" data-f="value" ${f} value="${esc(c.value)}" placeholder="1.200"></label></div>
        <div class="row"><label>Origen<select data-act="cfield" data-f="source" ${f}>${options(SOURCES, c.source)}</select></label>
          <label>Enlace a la propuesta<input type="url" data-act="cfield" data-f="link" ${f} value="${esc(c.link)}" placeholder="https://…"></label></div>
        <label>Notas<textarea data-act="cfield" data-f="notes" ${f} rows="4" placeholder="Qué necesita, presupuesto, cómo lo conociste…">${esc(c.notes)}</textarea></label>
        <p class="hint">Se guarda solo.</p>
      </div>
    </section>

    <section class="card"><h2>Datos de contacto</h2>
      <div class="form">
        <label>Nombre<input data-act="cfield" data-f="name" ${f} value="${esc(c.name)}"></label>
        <label>Empresa o proyecto<input data-act="cfield" data-f="company" ${f} value="${esc(c.company)}"></label>
        <label>Persona de contacto<input data-act="cfield" data-f="person" ${f} value="${esc(c.person)}" placeholder="Con quién hablas"></label>
        <div class="row"><label>Teléfono<input type="tel" data-act="cfield" data-f="phone" ${f} value="${esc(c.phone)}"></label><label>Email<input type="email" data-act="cfield" data-f="email" ${f} value="${esc(c.email)}"></label></div>
      </div>
      <button type="button" class="btn danger small del-c" data-act="del-contact" ${f}>Borrar cliente</button>
    </section>`;
}

/* ---------- Mensajes tipo y oferta ---------- */
const VARS = ["nombre", "empresa", "servicio", "precio", "enlace", "fecha", "mi_nombre"];
let openTpl = null; // { cid, tid } del mensaje abierto en la ficha
let keepTpl = false; // para abrir un mensaje justo al llegar a la ficha

function fillTemplate(text, c) {
  const vars = {
    nombre: c.person || c.name, empresa: c.name,
    servicio: c.service ? c.service.toLowerCase() : "[servicio]",
    precio: euros(c.value) ? money(euros(c.value)) : "[precio]",
    enlace: c.link || "[enlace a la propuesta]",
    fecha: longFmt.format(new Date()).replace(/^\w+, /, ""),
    mi_nombre: state.profile.name || "",
  };
  return String(text || "").replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

const waLink = (phone, text) => `https://wa.me/${(phone || "").replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`;
const mailLink = (to, subject, body) => `mailto:${encodeURIComponent(to || "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

function messagesSection(c) {
  const open = openTpl && openTpl.cid === c.id && state.templates.find(t => t.id === openTpl.tid);
  return `<section class="card msgs"><h2>Mensajes</h2>
    <p class="hint">Elige un mensaje: se rellena con los datos de ${esc(c.person || c.name)}. Puedes retocarlo antes de enviarlo.</p>
    <div class="tpl-btns">${state.templates.map(t => `<button type="button" class="btn small" data-act="tpl-open" data-cid="${c.id}" data-tid="${t.id}" aria-pressed="${open && open.id === t.id}">${esc(t.name)}</button>`).join("")}</div>
    ${open ? `<div class="tpl-box">
      <textarea id="tpl-text" rows="9" aria-label="Mensaje">${esc(fillTemplate(open.text, c))}</textarea>
      ${/\[[^\]]+\]/.test(fillTemplate(open.text, c)) ? `<p class="warn small">Falta algún dato [entre corchetes]: complétalo aquí o en «Proyecto».</p>` : ""}
      <div class="row tpl-actions">
        <button type="button" class="btn" data-act="tpl-send" data-via="copy" data-cid="${c.id}">Copiar</button>
        <button type="button" class="btn" data-act="tpl-send" data-via="whatsapp" data-cid="${c.id}">💬 WhatsApp</button>
        <button type="button" class="btn" data-act="tpl-send" data-via="email" data-cid="${c.id}">✉️ Email</button>
      </div>
      ${open.id === "oferta" ? `<p class="hint">Primero prepara el PDF del presupuesto y luego envía este mensaje adjuntándolo.</p>` : ""}
    </div>` : ""}
    <a class="btn offer-btn" href="#freelance:${c.id}:oferta">📄 Preparar presupuesto (PDF)</a>
  </section>`;
}

function viewTemplates() {
  const p = state.profile;
  const pf = (k, label, type = "text", ph = "") => `<label>${label}<input type="${type}" data-act="pfield" data-f="${k}" value="${esc(p[k])}" placeholder="${esc(ph)}"></label>`;
  return `<a class="back" href="#freelance">‹ Clientes</a>
    <header class="hero"><p class="eyebrow">Clientes</p><h1>Plantillas y oferta</h1>
      <p class="lead">Escribe aquí tus mensajes de siempre. En la ficha de cada cliente se rellenan solos.</p></header>
    <div class="card vars"><p class="small"><b>Datos que se rellenan solos</b> (escríbelos tal cual, con llaves):</p>
      <div class="chips">${VARS.map(v => `<code>{${v}}</code>`).join("")}</div>
      <p class="hint">{nombre} es la persona de contacto (o el nombre del cliente si no la has puesto); {empresa} es el nombre del cliente. {precio} y {enlace} salen de «Proyecto».</p></div>
    ${state.templates.map((t, i) => `<section class="card tpl-edit">
      <label>Nombre del mensaje<input data-act="tfield" data-i="${i}" data-f="name" value="${esc(t.name)}"></label>
      <label>Asunto (para email)<input data-act="tfield" data-i="${i}" data-f="subject" value="${esc(t.subject)}"></label>
      <label>Texto<textarea data-act="tfield" data-i="${i}" data-f="text" rows="9">${esc(t.text)}</textarea></label>
      <button type="button" class="btn ghost small" data-act="tpl-del" data-i="${i}">Borrar mensaje</button>
    </section>`).join("")}
    <button type="button" class="btn" data-act="tpl-add">+ Añadir mensaje</button>
    <section class="card"><h2>Mis datos en el presupuesto</h2>
      <p class="hint">Salen en el pie del PDF. Se guarda solo.</p>
      <div class="form">
        ${pf("name", "Nombre")}
        <div class="row">${pf("email", "Email", "email", "tu@email.com")}${pf("phone", "Teléfono", "tel", "+34 …")}</div>
        <div class="row">${pf("city", "Ciudad", "text", "Corella, Navarra")}${pf("nif", "NIF (opcional)")}</div>
        ${pf("web", "Web (opcional)", "text", "www.…")}
      </div></section>
    <section class="card"><h2>Condiciones por defecto</h2>
      <p class="hint">Una por línea. Cada presupuesto nuevo empieza con estas, y en cada uno las puedes cambiar.</p>
      <textarea data-act="ocond-default" rows="7">${esc(state.offerCond)}</textarea></section>`;
}

// Presupuesto de un cliente: se crea la primera vez que lo abres.
// Formato y textos tomados del «Presupuesto Forno Bomba» (identidad de Christel Arellano).
function offerOf(c) {
  if (!c.offer) {
    state.offerSeq = (state.offerSeq || 0) + 1;
    c.offer = {
      num: `PR-${String(state.offerSeq).padStart(3, "0")}`,
      date: today(), valid: "30",
      title: c.service ? `${c.service} para ${c.name}` : `Propuesta para ${c.name}`,
      desc: "", lines: [{ text: c.service || "Proyecto completo", price: c.value || "" }],
      vat: "21", cond: state.offerCond,
    };
    save();
  }
  const o = c.offer;
  // Campos añadidos después: se completan sin tocar lo que ya hubiera.
  o.docType ??= "Presupuesto";
  o.pay ??= OFFER_PAY;
  o.highlights ??= structuredClone(OFFER_HIGHLIGHTS);
  return o;
}

const money2 = n => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 2, useGrouping: "always" }).format(n || 0);
const dmy = d => d ? d.split("-").reverse().join("/") : "";
const monthYear = d => d ? new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(d + "T12:00")) : "";

function offerDoc(c) {
  const o = offerOf(c), me = state.profile;
  const lines = o.lines.filter(l => l.text || l.price);
  const sub = lines.reduce((a, l) => a + euros(l.price), 0);
  const withVat = sub * 1.21;
  const cond = String(o.cond || "").split("\n").map(x => x.replace(/^[\s•\-–]+/, "").trim()).filter(Boolean);
  const hl = (o.highlights || []).filter(h => h.label || h.value);
  const contact = [me.phone, me.email, me.city, me.web, me.nif && "NIF " + me.nif].filter(Boolean);
  const vatLine = o.vat === "21" ? `+ IVA · ${money2(withVat)} en total · proyecto completo`
    : o.vat === "inc" ? "IVA incluido · proyecto completo" : "IVA no incluido · proyecto completo";
  const logo = `<div class="of-logo"><img src="brand/marca.png" alt=""><span><b>Christel</b><span>Web · Apps · Procesos</span></span></div>`;
  const longDate = o.date ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(o.date + "T12:00")) : "";
  return `<header class="of-head">${logo}<p class="of-lema">Soluciones digitales<br>que hacen crecer<br>tu negocio</p></header>
    <div class="of-filete"></div>
    <p class="of-doctype">${esc(o.docType)}</p>
    <dl class="of-datos">
      <dt>Cliente</dt><dd>${esc(c.name)}${c.person ? ` · ${esc(c.person)}` : ""}</dd>
      <dt>Proyecto</dt><dd>${esc(o.title)}</dd>
      <dt>Fecha</dt><dd>${esc(longDate)} · válido ${esc(o.valid)} días</dd>
      <dt>Ref.</dt><dd>${esc(o.num)}</dd>
    </dl>
    <h1 class="of-title">${esc(o.title)}</h1>
    ${o.desc ? `<p class="of-desc">${esc(o.desc)}</p>` : ""}
    <span class="of-rule"></span>
    <p class="of-eyebrow">01 · Qué incluye</p>
    <table class="of-table"><tbody>${lines.map(l => `<tr><td>${esc(l.text)}</td><td>${euros(l.price) ? money2(euros(l.price)) : ""}</td></tr>`).join("") || `<tr><td colspan="2">Añade los conceptos</td></tr>`}</tbody></table>
    <p class="of-eyebrow">02 · ${esc(o.docType)}</p>
    <div class="of-price">
      <div class="of-total"><span class="of-big">${money2(sub)}</span><span class="of-vat">${esc(vatLine)}</span>
        ${o.pay ? `<span class="of-pay">Forma de pago: ${esc(o.pay)}</span>` : ""}</div>
      ${hl.length ? `<div class="of-hl">${hl.map(h => `<div><span>${esc(h.label)}</span><b>${esc(h.value)}</b></div>`).join("")}</div>` : ""}
    </div>
    ${cond.length ? `<p class="of-eyebrow">03 · Condiciones</p><ul class="of-cond">${cond.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
    <div class="of-firma"><span class="of-eyebrow">Aceptación del cliente</span><span class="of-linea"></span><span class="of-small">Nombre, fecha y firma</span></div>
    <footer class="of-pie"><span>Christel · Web · Apps · Procesos</span><span>${contact.map(esc).join(" · ")}</span></footer>`;
}

function viewOffer(c) {
  const o = offerOf(c);
  const k = `data-cid="${c.id}"`;
  const of = (f, label, attrs = "") => `<label>${label}<input data-act="ofield" ${k} data-f="${f}" value="${esc(o[f])}" ${attrs}></label>`;
  return `<a class="back no-print" href="#freelance:${c.id}">‹ ${esc(c.name)}</a>
    <header class="hero no-print"><p class="eyebrow">${esc(o.docType)}</p><h1>${esc(c.name)}</h1>
      <p class="lead">Cambia lo que necesites: la vista previa de abajo se actualiza sola. Luego pulsa «Descargar PDF».</p></header>
    <section class="card no-print offer-form">
      <div class="row">${of("docType", "Tipo")}${of("num", "Número")}</div>
      <div class="row">${of("date", "Fecha", 'type="date"')}${of("valid", "Validez (días)", 'inputmode="numeric"')}</div>
      ${of("title", "Título")}
      <label>Frase de entrada (opcional)<textarea data-act="ofield" ${k} data-f="desc" rows="3" placeholder="Vuestros clientes encargan desde el móvil y lo recogen a la hora que eligen.">${esc(o.desc)}</textarea></label>
      <h3>Qué incluye</h3>
      <div class="ol-list">${o.lines.map((l, i) => `<div class="ol-row">
        <input data-act="oline" ${k} data-i="${i}" data-f="text" value="${esc(l.text)}" placeholder="Concepto" aria-label="Concepto">
        <input data-act="oline" ${k} data-i="${i}" data-f="price" value="${esc(l.price)}" placeholder="0 €" inputmode="decimal" aria-label="Importe">
        <button type="button" class="x" aria-label="Quitar" data-act="ol-del" ${k} data-i="${i}">×</button></div>`).join("")}</div>
      <button type="button" class="btn small" data-act="ol-add" ${k}>+ Añadir concepto</button>
      <label>IVA<select data-act="ofield" ${k} data-f="vat">
        ${[["21", "Precio + IVA (muestra el total con IVA 21 %)"], ["no", "IVA no incluido"], ["inc", "IVA incluido"]].map(([v, t]) => `<option value="${v}"${o.vat === v ? " selected" : ""}>${t}</option>`).join("")}</select></label>
      ${of("pay", "Forma de pago")}
      <h3>Recuadros destacados</h3>
      <div class="ol-list">${o.highlights.map((h, i) => `<div class="ol-row hl-row">
        <input data-act="ohl" ${k} data-i="${i}" data-f="label" value="${esc(h.label)}" placeholder="Garantía" aria-label="Título">
        <input data-act="ohl" ${k} data-i="${i}" data-f="value" value="${esc(h.value)}" placeholder="3 meses" aria-label="Valor">
        <button type="button" class="x" aria-label="Quitar" data-act="ohl-del" ${k} data-i="${i}">×</button></div>`).join("")}</div>
      <button type="button" class="btn small" data-act="ohl-add" ${k}>+ Añadir recuadro</button>
      <label>Condiciones (una por línea)<textarea data-act="ofield" ${k} data-f="cond" rows="6">${esc(o.cond)}</textarea></label>
      ${/\[[^\]]+\]/.test(o.cond + o.title + o.desc) ? `<p class="warn small">Hay datos [entre corchetes] por completar.</p>` : ""}
      <div class="row"><button type="button" class="btn primary" data-act="of-print">📄 Descargar PDF</button>
        <button type="button" class="btn" data-act="of-msg" ${k}>✉️ Mensaje para enviarlo</button></div>
      <p class="hint">En el móvil se abre «Imprimir»: elige <b>Guardar como PDF</b> y luego adjúntalo en WhatsApp o en el email.</p>
    </section>
    <p class="eyebrow no-print">Vista previa</p>
    <article id="offer-doc" class="offer">${offerDoc(c)}</article>`;
}

const refreshOffer = c => { const d = document.getElementById("offer-doc"); if (d) d.innerHTML = offerDoc(c); };

/* ---------- UNIXO ---------- */
// Un paso de UNIXO: al tocarlo se abre para editarlo y añadir notas.
function uxTask(p, t) {
  const key = `${p.id}|${t.id}`;
  return `<div class="item${t.done ? " done" : ""}" style="--c:var(--a-unixo)">
    <input type="checkbox" aria-label="Hecho" data-act="toggle" data-kind="ux" data-key="${key}"${t.done ? " checked" : ""}>
    <details class="ux-edit item-body" data-keep="ux-${t.id}">
      <summary>
        <span class="item-top">${t.date ? `<span class="item-date mono">${fd(t.date)}</span>` : `<span class="item-date">Sin fecha</span>`}<span class="item-title">${esc(t.text)}</span></span>
        ${t.notes ? `<span class="item-sub ux-notes">${esc(t.notes)}</span>` : ""}
        <span class="item-link">✏️ Editar o añadir información</span>
      </summary>
      <form data-form="uxedit" data-cid="${key}" class="form">
        <label>Paso<textarea name="text" rows="2" required>${esc(t.text)}</textarea></label>
        <div class="row">
          <label>Fecha<input type="date" name="date" value="${esc(t.date)}"></label>
          <label>Fase<select name="phase">${state.unixo.phases.map(ph => `<option value="${ph.id}"${ph.id === p.id ? " selected" : ""}>${esc(ph.name)}</option>`).join("")}</select></label>
        </div>
        <label>Información (precios, respuestas, contactos…)<textarea name="notes" rows="4">${esc(t.notes)}</textarea></label>
        <div class="row"><button class="btn primary">Guardar</button><button type="button" class="btn danger" data-act="del-ux" data-key="${key}">Borrar paso</button></div>
      </form>
    </details>
    ${t.done ? "" : bell("ux", key)}
  </div>`;
}

function viewUnixo() {
  const all = state.unixo.phases.flatMap(p => p.tasks);
  const done = all.filter(t => t.done).length;
  const step = nextUnixoStep();
  return `<header class="hero"><p class="eyebrow">Sudaderas</p><h1>UNIXO</h1>
      <p class="lead">${all.length ? `<b>${done}/${all.length}</b> pasos hechos` : "Crea las fases del plan y sus pasos."}</p>
      ${all.length ? `<div class="bar"><i style="width:${(done / all.length) * 100}%"></i></div>` : ""}</header>
    ${step ? `<div class="card next-step"><p class="eyebrow">Siguiente paso</p><p><b>${esc(step.task.text)}</b></p><p class="muted small">${esc(step.phase.name)}${step.task.date ? " · " + fd(step.task.date) : ""}</p></div>` : ""}
    <details class="card" data-keep="ux-help"><summary>¿Cómo se usa?</summary>
      <ol class="rules">
        <li>Haz solo el <b>siguiente paso</b> de arriba. También te sale en «Mi día» y, si tiene fecha, ese día.</li>
        <li>Cuando lo hagas, márcalo ✓ y aparece el siguiente.</li>
        <li>Toca un paso para cambiarlo o apuntar información (precios, respuestas…).</li>
        <li>¿Surge algo nuevo? Añádelo como paso dentro de su fase, con fecha si la tiene.</li>
      </ol></details>
    <details class="card" data-keep="ux-summary"${state.unixo.summary ? "" : " open"}><summary>Proveedores y notas del plan</summary>
      <textarea data-act="uxsummary" rows="6" placeholder="Objetivo, precios, proveedores, canales de venta…">${esc(state.unixo.summary)}</textarea></details>
    ${state.unixo.phases.map(p => {
      const d = p.tasks.filter(t => t.done).length;
      return `<section class="phase">
        <div class="week-h"><input class="phase-name" data-act="uxphase-name" data-pid="${p.id}" value="${esc(p.name)}" aria-label="Nombre de la fase"><span>${d}/${p.tasks.length}</span></div>
        <div class="list">${byDate(p.tasks).map(t => uxTask(p, t)).join("")}</div>
        <form data-form="uxtask" data-pid="${p.id}" class="row"><input name="text" required placeholder="Nuevo paso" aria-label="Nuevo paso"><input type="date" name="date" aria-label="Fecha"><button class="btn">Añadir</button></form>
        <button type="button" class="btn ghost small" data-act="del-phase" data-pid="${p.id}">Borrar fase</button>
      </section>`;
    }).join("")}
    <form data-form="uxphase" class="card row"><input name="name" required placeholder="Nueva fase (p. ej. «5. Segunda tirada»)" aria-label="Nueva fase"><button class="btn primary">Añadir fase</button></form>`;
}

/* ---------- Ideas ---------- */
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
      <p class="lead">Apunta todo aquí. Cuando sepas cuándo hacerlo, ponle fecha y saldrá en «Mi día».</p></header>
    <div class="card">${quickForm(true)}</div>
    <section><h2>Bandeja (sin fecha)</h2><div class="list">${inbox.map(row).join("") || `<p class="empty">Bandeja vacía.</p>`}</div></section>
    <section><h2>Con fecha</h2><div class="list">${planned.map(row).join("") || `<p class="empty">Nada programado.</p>`}</div></section>
    ${done.length ? `<details class="card"><summary>Hechas (${done.length})</summary><div class="list">${done.map(row).join("")}</div>
      <button type="button" class="btn ghost small" data-act="clear-done">Borrar las hechas</button></details>` : ""}`;
}

/* ---------- navegación y pintado ---------- */
const VIEWS = { hoy: viewHoy, semana: viewSemana, correr: viewCorrer, insta: viewInsta, freelance: viewFreelance, unixo: viewUnixo, ideas: viewIdeas };
const NAV = { semana: "hoy" }; // pestaña que se ilumina para vistas sin pestaña propia
const route = () => location.hash.slice(1).split(":");
const tab = () => (VIEWS[route()[0]] ? route()[0] : "hoy");

// Lo que vas escribiendo en un formulario se guarda al momento, para no
// perderlo si la app se recarga o se cierra el desplegable sin querer.
const DRAFTS = "organizer-drafts";
const draftId = f => f.dataset.form + ":" + (f.dataset.cid || f.dataset.pid || "");
function readDrafts() { try { return JSON.parse(localStorage.getItem(DRAFTS) || "{}"); } catch (e) { return {}; } }
function writeDrafts(d) { try { localStorage.setItem(DRAFTS, JSON.stringify(d)); } catch (e) { /* sin espacio: no pasa nada */ } }

function saveDraft(f) {
  const d = readDrafts();
  d[draftId(f)] = Object.fromEntries([...new FormData(f).entries()].filter(([, v]) => typeof v === "string"));
  writeDrafts(d);
}

document.addEventListener("input", e => {
  if (e.target.id === "c-search") { clientQuery = e.target.value; return applySearch(); }
  const el = e.target, act = el.dataset.act;
  if (act === "tfield") { state.templates[+el.dataset.i][el.dataset.f] = el.value; return save(); }
  if (act === "pfield") { state.profile[el.dataset.f] = el.value.trim(); return save(); }
  if (act === "ocond-default") { state.offerCond = el.value; return save(); }
  if (act === "ohl") {
    const c = findContact(el.dataset.cid);
    if (!c) return;
    offerOf(c).highlights[+el.dataset.i][el.dataset.f] = el.value;
    save(); return refreshOffer(c);
  }
  if (act === "ofield" || act === "oline") {
    const c = findContact(el.dataset.cid), o = c && offerOf(c);
    if (!o) return;
    if (act === "ofield") o[el.dataset.f] = el.value;
    else {
      o.lines[+el.dataset.i][el.dataset.f] = el.value;
      // El total de la oferta pasa a ser el presupuesto del cliente.
      const sub = o.lines.reduce((a, l) => a + euros(l.price), 0);
      if (sub) c.value = String(sub);
    }
    save(); return refreshOffer(c);
  }
  const f = e.target.closest("form[data-form]");
  if (f && e.target.name) saveDraft(f);
});

function restoreDrafts(root = document) {
  const d = readDrafts();
  root.querySelectorAll("form[data-form]").forEach(f => {
    const v = d[draftId(f)];
    // Solo cuenta como borrador si hay algo escrito (no solo la fecha o el tipo por defecto).
    if (!v || !["text", "name", "reason", "title", "notes", "cap"].some(k => v[k] && v[k].trim())) return;
    for (const [name, val] of Object.entries(v)) { const el = f.elements[name]; if (el && "value" in el) el.value = val; }
    const det = f.closest("details");
    if (det) det.open = true;
  });
}

// Búsqueda de clientes sin repintar (para no perder el teclado).
function applySearch() {
  const q = clientQuery.trim().toLowerCase();
  let shown = 0;
  document.querySelectorAll(".crm-row").forEach(r => { const ok = !q || r.dataset.search.includes(q); r.hidden = !ok; shown += ok; });
  const none = document.getElementById("c-none");
  if (none) none.hidden = !q || shown > 0;
}

let renderedDay = "";
let pendingFocus = "";
function render() {
  const t = tab();
  const view = document.getElementById("view");
  const keep = new Set([...view.querySelectorAll("details[data-keep][open]")].map(d => d.dataset.keep));
  view.innerHTML = VIEWS[t]();
  view.querySelectorAll("details[data-keep]").forEach(d => { if (keep.has(d.dataset.keep)) d.open = true; });
  restoreDrafts(view);
  applySearch();
  renderedDay = today();
  const navTab = NAV[t] || t;
  document.querySelectorAll("nav.tabs a").forEach(a => a.toggleAttribute("aria-current", a.getAttribute("href") === "#" + navTab));
  const late = overdueItems().length + agenda(today(), today()).filter(i => !i.done).length;
  const badge = document.getElementById("badge");
  badge.textContent = late || "";
  badge.hidden = !late;
  if (pendingFocus) {
    const el = view.querySelector(pendingFocus);
    pendingFocus = "";
    if (el) { const det = el.closest("details"); if (det) det.open = true; el.scrollIntoView({ block: "center" }); el.focus(); }
  }
}

/* ---------- acciones ---------- */
const findContact = id => state.contacts.find(c => c.id === id);
function findUx(key) {
  const [pid, tid] = key.split("|");
  const p = state.unixo.phases.find(x => x.id === pid);
  return { p, t: p && p.tasks.find(x => x.id === tid) };
}

function deletePost(id) {
  state.igExtra = state.igExtra.filter(p => p.id !== id);
  delete state.igDone[id];
}

function setDate(kind, key, date) {
  if (!date) return;
  if (kind === "run") state.runMove[key] = date;
  else if (kind === "task") { const t = state.tasks.find(x => x.id === key); if (t) t.date = date; }
  else if (kind === "ux") { const { t } = findUx(key); if (t) t.date = date; }
  else if (kind === "fu") {
    const [cid, fid] = key.split("|");
    const f = findContact(cid)?.followups.find(x => x.id === fid);
    if (f) f.date = date;
  } else if (kind === "ig") {
    const p = state.igExtra.find(x => x.id === key);
    if (p) p.date = date;
  }
}

function moveTo(kind, key, date) {
  if (!date) return;
  setDate(kind, key, date);
  save(); render();
}

function toggle(kind, key, on) {
  let focusNext = false;
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
      if (on) c.log.unshift({ date: today(), type: "done", text: "Hecho: " + f.reason, fu: fid });
      // En la ficha del cliente, tras marcarlo pasamos directamente a programar el siguiente.
      focusNext = on && route()[0] === "freelance" && route()[1] === cid && !nextFollowup(c);
    }
  }
  if (focusNext) pendingFocus = "#next-reason";
  save(); render();
}

// Enviar un mensaje tipo: copiar, abrir WhatsApp o el email, y apuntarlo en la actividad.
function sendTemplate(btn) {
  const c = findContact(btn.dataset.cid), t = openTpl && state.templates.find(x => x.id === openTpl.tid);
  const text = document.getElementById("tpl-text")?.value || "";
  if (!c || !t) return;
  const via = btn.dataset.via;
  if (via === "copy") {
    const ok = () => { btn.textContent = "Copiado ✓"; setTimeout(() => (btn.textContent = "Copiar"), 1600); };
    try { navigator.clipboard.writeText(text).then(ok, () => document.getElementById("tpl-text").select()); } catch (e) { document.getElementById("tpl-text").select(); }
    return;
  }
  if (via === "whatsapp") window.open(waLink(c.phone, text), "_blank", "noopener");
  else location.href = mailLink(c.email, fillTemplate(t.subject, c), text);
  (c.log ||= []).unshift({ date: today(), type: via, text: "Enviado: " + t.name });
  openTpl = null;
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
  if (act === "rnote") { (state.runNotes[el.dataset.key] ||= {})[el.dataset.f] = el.value; return save(); }
  if (act === "rphoto") {
    const files = [...el.files];
    el.value = "";
    Promise.all(files.map(f => addPhoto(el.dataset.key, f)))
      .catch(err => alert("No se ha podido guardar la captura: " + err.message))
      .then(render);
    return;
  }
  if (act === "review") { (state.reviews ||= {})[el.dataset.week] = { text: el.value }; return save(); }
  if (act === "cfield") {
    // Se guarda sin repintar, para no perder el toque en otro botón.
    const c = findContact(el.dataset.cid), v = el.value.trim();
    if (!c || (el.dataset.f === "name" && !v)) return;
    c[el.dataset.f] = el.dataset.f === "notes" ? el.value : v;
    if (el.dataset.f === "name") { const h = document.querySelector(".crm-head h1"); if (h) h.textContent = v; }
    return save();
  }
  if (act === "uxsummary") { state.unixo.summary = el.value; return save(); }
  if (act === "uxphase-name") { const p = state.unixo.phases.find(x => x.id === el.dataset.pid); if (p && el.value.trim()) p.name = el.value.trim(); return save(); }
  if (act === "tdate") { const t = state.tasks.find(x => x.id === el.dataset.key); if (t) t.date = el.value; save(); return render(); }
});

document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el || el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA") return;
  const act = el.dataset.act;
  if (act === "copy") return copyCaption(el.dataset.id, el);
  if (act === "move") return moveTo(el.dataset.kind, el.dataset.key, el.dataset.to);
  if (act === "remind") return openRemind(el.dataset.kind, el.dataset.key);
  if (act === "photo-open") { document.getElementById("photo-img").src = el.src; return document.getElementById("photo").showModal(); }
  if (act === "photo-del") { if (confirm("¿Borrar esta captura?")) deletePhoto(el.dataset.id).then(render); return; }
  if (act === "kmbar") { const r = document.getElementById("km-readout"); if (r) r.textContent = el.dataset.info; return; }
  if (act === "fu-date") {
    const f = el.closest("form");
    f.elements.date.value = el.dataset.to;
    saveDraft(f);
    return;
  }
  if (act === "cfilter") {
    clientFilter = el.dataset.f;
    try { localStorage.setItem("organizer-client-filter", clientFilter); } catch (e) { /* sin almacenamiento */ }
    return render();
  }
  if (act === "tpl-open") {
    const same = openTpl && openTpl.cid === el.dataset.cid && openTpl.tid === el.dataset.tid;
    openTpl = same ? null : { cid: el.dataset.cid, tid: el.dataset.tid };
    render();
    if (!same) document.getElementById("tpl-text")?.scrollIntoView({ block: "center" });
    return;
  }
  if (act === "tpl-send") return sendTemplate(el);
  if (act === "of-print") return window.print();
  if (act === "of-msg") { openTpl = { cid: el.dataset.cid, tid: "oferta" }; keepTpl = true; location.hash = "freelance:" + el.dataset.cid; return; }
  if (act === "add-go") {
    addDlg.close();
    pendingFocus = el.dataset.focus || "";
    if (location.hash === "#" + el.dataset.to) render(); // ya estabas ahí: no habrá hashchange
    else location.hash = el.dataset.to;
    return;
  }

  if (act === "del-post" && confirm("¿Borrar esta publicación?")) {
    deletePost(el.dataset.id);
  } else if (act === "del-late-posts") {
    const late = igPosts().filter(p => !p.done && p.date < today());
    if (!confirm(`¿Borrar ${plural(late.length, "publicación atrasada", "publicaciones atrasadas")} sin publicar?`)) return;
    late.forEach(p => deletePost(p.id));
  } else if (act === "move-all") {
    const mon = el.dataset.week;
    const list = agenda(mon, addDays(mon, 6)).filter(i => !i.done && i.date < today() && i.kind !== "run");
    if (!confirm(`¿Pasar ${plural(list.length, "cosa", "cosas")} al ${fd(el.dataset.to)}?`)) return;
    list.forEach(i => setDate(i.kind, i.key, el.dataset.to));
  } else if (act === "del-task-late" && confirm("¿Borrar esta tarea?")) {
    state.tasks = state.tasks.filter(t => t.id !== el.dataset.key);
  } else if (act === "del-fu") {
    const [cid, fid] = el.dataset.key.split("|"); const c = findContact(cid);
    c.followups = c.followups.filter(f => f.id !== fid);
  } else if (act === "cstatus-set") {
    const c = findContact(el.dataset.cid);
    if (!c || c.status === el.dataset.st) return;
    c.status = el.dataset.st;
    (c.log ||= []).unshift({ date: today(), type: "stage", text: "Estado: " + STATUS[c.status] });
  } else if (act === "del-log") {
    const c = findContact(el.dataset.cid);
    if (!c || !confirm("¿Borrar esta actividad?")) return;
    c.log.splice(+el.dataset.i, 1);
  } else if (act === "del-contact" && confirm("¿Borrar este cliente y todo su historial?")) {
    state.contacts = state.contacts.filter(c => c.id !== el.dataset.cid);
    save(); location.hash = "freelance"; return;
  } else if (act === "tpl-add") {
    state.templates.push({ id: uid(), name: "Nuevo mensaje", subject: "", text: "Hola {nombre}:\n\n\n\nUn saludo,\n{mi_nombre}" });
  } else if (act === "tpl-del") {
    if (!confirm("¿Borrar este mensaje tipo?")) return;
    state.templates.splice(+el.dataset.i, 1);
  } else if (act === "ohl-add") {
    offerOf(findContact(el.dataset.cid)).highlights.push({ label: "", value: "" });
  } else if (act === "ohl-del") {
    offerOf(findContact(el.dataset.cid)).highlights.splice(+el.dataset.i, 1);
  } else if (act === "ol-add") {
    offerOf(findContact(el.dataset.cid)).lines.push({ text: "", price: "" });
  } else if (act === "ol-del") {
    const o = offerOf(findContact(el.dataset.cid));
    o.lines.splice(+el.dataset.i, 1);
    if (!o.lines.length) o.lines.push({ text: "", price: "" });
  } else if (act === "del-ux" && confirm("¿Borrar este paso?")) {
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
  let closeAfter = "", goTo = "";
  if (kind === "quick") {
    if (!v.text) return;
    state.tasks.push({ id: uid(), text: v.text, date: v.date || "", time: v.date ? v.time || "" : "", area: v.area || "personal", done: false, created: today() });
  } else if (kind === "post") {
    state.igExtra.push({ id: "x" + uid(), date: v.date, time: v.time, f: v.f, title: v.title, cap: v.cap, need: v.need });
  } else if (kind === "contact") {
    const c = { id: uid(), name: v.name, company: v.company, person: v.person, phone: v.phone, email: v.email, status: v.status || "lead",
      service: v.service, value: v.value, source: v.source, link: "", notes: v.notes, followups: [], log: [{ date: today(), type: "note", text: "Cliente creado" }] };
    if (v.date) c.followups.push({ id: uid(), date: v.date, reason: v.reason || "Contactar", done: false });
    state.contacts.push(c);
    goTo = "freelance:" + c.id;
  } else if (kind === "fu") {
    findContact(f.dataset.cid).followups.push({ id: uid(), date: v.date, reason: v.reason, done: false });
  } else if (kind === "log") {
    const c = findContact(f.dataset.cid);
    (c.log ||= []).unshift({ date: v.date || today(), type: v.type || "note", text: v.text });
  } else if (kind === "uxtask") {
    state.unixo.phases.find(p => p.id === f.dataset.pid).tasks.push({ id: uid(), text: v.text, date: v.date || "", done: false });
  } else if (kind === "uxedit") {
    const { p, t } = findUx(f.dataset.cid);
    if (t) {
      Object.assign(t, { text: v.text, date: v.date || "", notes: v.notes });
      const to = state.unixo.phases.find(x => x.id === v.phase);
      if (to && to !== p) { p.tasks = p.tasks.filter(x => x !== t); to.tasks.push(t); }
    }
    closeAfter = `ux-${t ? t.id : ""}`;
  } else if (kind === "uxphase") {
    state.unixo.phases.push({ id: uid(), name: v.name, tasks: [] });
  }
  const d = readDrafts(); delete d[draftId(f)]; writeDrafts(d);
  save();
  if (f.closest("dialog")) { f.reset(); f.closest("dialog").close(); }
  if (goTo) { location.hash = goTo; return; }
  render();
  if (closeAfter) document.querySelector(`details[data-keep="${closeAfter}"]`)?.removeAttribute("open");
  if (kind === "quick" && !f.closest("dialog")) document.getElementById("q-text")?.focus();
});

/* ---------- botón «+»: añadir desde cualquier sitio ---------- */
const addDlg = document.getElementById("add");
document.getElementById("fab").addEventListener("click", () => {
  document.getElementById("add-body").innerHTML = `${quickForm()}
    <div class="add-more">
      <span class="muted small">O añade:</span>
      <button type="button" class="btn" data-act="add-go" data-to="freelance:new" data-focus="input[name=name]">💼 Cliente</button>
      <button type="button" class="btn" data-act="add-go" data-to="unixo" data-focus="form[data-form=uxtask] input[name=text]">🧥 Paso UNIXO</button>
      <button type="button" class="btn" data-act="add-go" data-to="insta" data-focus="form[data-form=post] input[name=title]">📸 Publicación</button>
    </div>`;
  restoreDrafts(addDlg);
  addDlg.showModal();
  addDlg.querySelector("input[name=text]").focus();
});

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
  document.getElementById("r-title").textContent = stripEmoji(it.title);
  document.getElementById("r-date").value = date;
  document.getElementById("r-time").value = time;
  remindDlg.showModal();
}

const icsText = s => String(s).replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\r?\n/g, "\\n");

function downloadReminder(it, date, time) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const start = date.replace(/-/g, "") + "T" + time.replace(":", "") + "00";
  const title = stripEmoji(it.title);
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
document.getElementById("export").addEventListener("click", async () => {
  let pics = [];
  try { pics = await exportPhotos(); } catch (e) { /* sin capturas */ }
  const blob = new Blob([JSON.stringify({ ...state, photos: pics })], { type: "application/json" });
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
    const { photos: pics, ...rest } = data;
    replaceState(rest);
    if (pics) await importPhotos(pics);
    menu.close(); render();
  } catch (err) { alert("No se ha podido leer la copia: " + err.message); }
  finally { e.target.value = ""; }
});

/* ---------- arranque ---------- */
window.addEventListener("hashchange", () => {
  if (!keepTpl) openTpl = null; // al cambiar de pantalla se cierra el mensaje abierto
  keepTpl = false;
  render();
  const focus = route()[0] === "correr" && route()[1] && document.querySelector(`details[data-keep="run-${CSS.escape(route()[1])}"]`);
  if (focus) { focus.open = true; focus.closest(".item").scrollIntoView({ block: "center" }); }
  else if (!document.activeElement || document.activeElement === document.body) window.scrollTo(0, 0);
});

// La app siempre abre en «Mi día». Si vuelves tras más de 15 minutos fuera
// (o al día siguiente), también vuelve a «Mi día»; si no, sigue donde estabas.
const AWAY = 15 * 60 * 1000;
let hiddenAt = 0;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { hiddenAt = Date.now(); return; }
  if (Date.now() - hiddenAt > AWAY && tab() !== "hoy") location.hash = "hoy";
  else if (today() !== renderedDay) render(); // solo si ha cambiado el día: así no se pierde lo que estés escribiendo
});
if (location.hash !== "#hoy") history.replaceState(null, "", "#hoy");
save(); // guarda ya los datos de partida y los cambios de versión
render();
loadPhotos().then(() => { if (tab() === "correr") render(); }).catch(() => {});

if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
