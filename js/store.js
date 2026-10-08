import { SEED_CONTACTS, UNIXO_SEED } from "./data.js";

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
  igExtra: [],     // publicaciones añadidas a mano
  tasks: [],       // {id, text, date, area, done, created}
  contacts: [],    // {id, name, company, phone, email, status, notes, followups[], log[]}
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
