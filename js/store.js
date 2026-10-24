import { SEED_CONTACTS, UNIXO_SEED, EXTRA_CONTACTS, TEMPLATES_SEED, OFFER_CONDITIONS } from "./data.js";

// Condiciones del primer borrador (identidad equivocada): si no se tocaron, se cambian por las buenas.
const OLD_COND = "Precio cerrado y pago único, sin cuotas mensuales.\nForma de pago: [50 % al aceptar la oferta y 50 % a la entrega].\nPlazo de entrega: [3] semanas desde la aceptación.\nIncluye [2] rondas de cambios y una sesión para explicarte cómo usarlo.\nValidez de la oferta: 30 días.";

// Todo se guarda en este dispositivo (localStorage). Usa «Copia de seguridad»
// para pasar los datos a otro móvil o guardarlos fuera.

const KEY = "organizer-v1";

const empty = () => ({
  version: 1,
  runDone: {},     // id de sesión ("s2026-10-07", "f2026-10-06") -> true/false
  runMove: {},     // entreno o clase de hybrid -> nuevo día
  runNotes: {},    // entreno -> { km, time, hr, feel, text }
  igDone: {},      // fecha de publicación -> true/false
  igMove: {},      // publicación del plan -> nueva fecha
  igHidden: {},    // publicaciones del plan que has borrado
  igExtra: [],     // publicaciones añadidas a mano
  tasks: [],       // {id, text, date, area, done, created}
  contacts: [],    // {id, name, company, phone, email, status, service, value, source, link, notes, followups[], log[]}
  reviews: {},     // lunes de la semana -> { text }
  templates: [],   // mensajes tipo del CRM {id, name, subject, text}
  profile: {},     // mis datos para la oferta {name, email, phone, city, nif, web}
  offerCond: "",   // condiciones por defecto de la oferta
  offerSeq: 0,     // último número de oferta
  unixo: { summary: "", phases: [] },
});

export let state = load();

function load() {
  let st = null;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && typeof raw === "object") st = { ...empty(), ...raw, unixo: { ...empty().unixo, ...(raw.unixo || {}) } };
  } catch (e) { /* datos corruptos o almacenamiento bloqueado: empezamos de cero */ }
  st ||= { ...empty(), contacts: structuredClone(SEED_CONTACTS) };
  // El plan de UNIXO se carga una sola vez, y solo si la sección está vacía.
  if (!st.unixoSeeded && !st.unixo.phases.length && !st.unixo.summary) st.unixo = structuredClone(UNIXO_SEED);
  st.unixoSeeded = true;
  // Octubre 2026: se borra el calendario antiguo de Instagram (llega uno nuevo).
  if (!st.igReset1) Object.assign(st, { igExtra: [], igDone: {}, igMove: {}, igHidden: {}, igReset1: true });
  // Clientes nuevos añadidos al código: entran una sola vez.
  st.extraAdded ||= {};
  for (const c of EXTRA_CONTACTS) {
    if (st.extraAdded[c.id]) continue;
    if (!st.contacts.some(x => x.id === c.id)) st.contacts.push(structuredClone(c));
    st.extraAdded[c.id] = true;
  }
  // Plantillas de mensajes y datos de la oferta: se cargan una vez.
  if (!st.templatesSeeded) {
    if (!st.templates.length) st.templates = structuredClone(TEMPLATES_SEED);
    st.profile = { name: "Christel Arellano", email: "", phone: "", city: "", nif: "", web: "", ...st.profile };
    st.offerCond ||= OFFER_CONDITIONS;
    st.templatesSeeded = true;
  }
  if (!st.offerCond || st.offerCond === OLD_COND) st.offerCond = OFFER_CONDITIONS;
  return st;
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { alert("No se ha podido guardar. Haz una copia de seguridad cuanto antes."); }
}

export function replaceState(next) {
  if (!next || typeof next !== "object" || next.version !== 1) throw new Error("Archivo no válido");
  state = { ...empty(), ...next, unixo: { ...empty().unixo, ...(next.unixo || {}) } };
  save();
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
