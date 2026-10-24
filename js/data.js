// Contenido fijo de los planes (el 10K sale del artefacto «Plan 10K París»).
// Lo que marques como hecho se guarda aparte.

export const RACE = { date: "2026-12-06", time: "09:00", name: "Saucony 10K París", goal: "1:05:00" };

// Hybrid: clase fija martes y jueves a las 19:00 (se repite todas las semanas).
export const HYBRID = { from: "2026-10-06", days: [2, 4], time: "19:00", title: "Hybrid" };

// Los ejercicios de fuerza se hacen como calentamiento antes de cada rodaje suave.
export const WARMUP = "12 sentadillas, 10 zancadas por pierna, 15 elevaciones de gemelo, 30\" de plancha y 10 puentes de glúteo.";

export const ZONES = [
  { k: "easy", name: "Suave", num: "<145 ppm", txt: "8:30–9:00/km. Andar en cuestas si hace falta." },
  { k: "tempo", name: "Umbral", num: "160–170 ppm", txt: "6:30–6:45/km. Cómodamente duro." },
  { k: "fast", name: "Series", num: ">170 ppm", txt: "6:00–6:20/km. Fuerte pero controlado." },
];

// [fecha, tipo, título, detalle, objetivo, hecho de partida]
export const RUN_WEEKS = [
  { n: 1, focus: "Diagnóstico y empezar a ir suave de verdad", s: [
    ["2026-10-05", "test", "Test 3 km", "Hecho: 6:51 – 7:16 – 6:32 (2,5 km reales). FC máx. 187.", "", true],
    ["2026-10-07", "easy", "Rodaje 35'", "35 minutos continuos muy suaves.", "<145 ppm"],
    ["2026-10-10", "easy", "Largo 7 km", "7 km suaves. Primer paso hacia los 12 km.", "<145 ppm"]] },
  { n: 2, focus: "Velocidad corta y más volumen", s: [
    ["2026-10-12", "fast", "6 × 400 m", "Recuperación 2' trotando o andando.", "6:00/km · >170 ppm"],
    ["2026-10-14", "easy", "Rodaje 35' + rectas", "35' suaves y al final 4 × 20\" algo más rápido, con 1' andando.", "<145 ppm"],
    ["2026-10-17", "easy", "Largo 8 km", "8 km suaves.", "<145 ppm"]] },
  { n: 3, focus: "Primeros bloques a ritmo umbral", s: [
    ["2026-10-19", "fast", "5 × 800 m", "Recuperación 2' trotando.", "6:15/km"],
    ["2026-10-21", "tempo", "3 × 8'", "Recuperación 2' trotando.", "6:40/km · 160–170 ppm"],
    ["2026-10-24", "easy", "Largo 9 km", "9 km suaves.", "<145 ppm"]] },
  { n: 4, focus: "Semana de asimilación (más ligera)", s: [
    ["2026-10-26", "fast", "4 × 1 km", "Recuperación 2'30\" trotando.", "6:20/km"],
    ["2026-10-28", "easy", "Rodaje 40'", "40' suaves.", "<145 ppm"],
    ["2026-10-31", "easy", "Largo 7 km", "7 km suaves. Descarga antes del test.", "<145 ppm"]] },
  { n: 5, focus: "Test de control y bloques más largos", s: [
    ["2026-11-02", "test", "Test 3 km", "Igual que el primero, pero regular: mismo ritmo los 3 km. Llano y sin paradas.", "A tope controlado"],
    ["2026-11-04", "tempo", "2 × 12'", "Recuperación 3' trotando.", "6:35/km · 160–170 ppm"],
    ["2026-11-07", "easy", "Largo 10 km", "10 km suaves. Ya tienes la distancia.", "<145 ppm"]] },
  { n: 6, focus: "Ritmo continuo", s: [
    ["2026-11-09", "fast", "5 × 1 km", "Recuperación 2' trotando.", "6:15/km"],
    ["2026-11-11", "tempo", "20' continuos", "20 minutos seguidos a ritmo umbral.", "6:35/km · 160–170 ppm"],
    ["2026-11-14", "easy", "Largo 11 km", "Suaves, y los 2 últimos km a 6:45.", "<145 ppm, final más vivo"]] },
  { n: 7, focus: "Series largas a ritmo objetivo", s: [
    ["2026-11-16", "fast", "3 × 2 km", "Recuperación 3' trotando.", "6:25/km"],
    ["2026-11-18", "easy", "Rodaje 40'", "40' suaves.", "<145 ppm"],
    ["2026-11-21", "easy", "Largo 12 km", "12 km suaves. El más largo del plan.", "<145 ppm"]] },
  { n: 8, focus: "Última semana fuerte", s: [
    ["2026-11-23", "fast", "6 × 1 km", "Recuperación corta: 1'30\" trotando.", "6:15/km"],
    ["2026-11-25", "tempo", "25' a ritmo carrera", "25 minutos seguidos a ritmo objetivo.", "6:30/km"],
    ["2026-11-28", "tempo", "10 km con final", "6 km suaves + 4 km a ritmo carrera.", "<145 → 6:30/km"]] },
  { n: 9, focus: "Descarga: llegar fresca", s: [
    ["2026-11-30", "fast", "4 × 1 km", "Recuperación 2'. Sensaciones, no cansancio.", "6:30/km"],
    ["2026-12-02", "easy", "Rodaje 25' + rectas", "25' suaves + 4 × 20\" ágiles.", "<145 ppm"],
    ["2026-12-05", "easy", "Activación 15'", "15' muy suaves + 3 rectas cortas. Pierna suelta.", "<140 ppm"],
    ["2026-12-06", "race", "Saucony 10K París", "Sigue la estrategia de carrera.", "6:30/km → 1:05:00"]] },
];

export const RUN_STRATEGY = [
  ["Km 1–2", "6:40/km. Sales con la emoción y la gente; contente aunque te parezca lento."],
  ["Km 3–8", "6:30/km clavado. Mira el reloj cada km, no cada minuto."],
  ["Km 9–10", "Lo que quede. Si vas bien, aprieta a 6:15 o más."],
  ["Antes", "Desayuno conocido 2–3 h antes. Nada nuevo ese día: ni zapatillas, ni geles, ni ropa."],
];

export const RUN_RULES = [
  "En series y umbral: 10–15' de calentamiento suave antes y 10' de trote o andar después.",
  "Configura tu Garmin con FC máxima 188 (ahora tiene 175) para que sus zonas coincidan con las de este plan.",
  "Los días suaves son suaves. Si las pulsaciones pasan de 145, baja el ritmo aunque parezca lentísimo.",
  "Constancia por encima de todo: 3 sesiones cada semana, sin parones de varias semanas.",
  "Si tienes dolor (no cansancio) que cambia tu forma de correr, para.",
  "Si te saltas una sesión, no la recuperes: sigue con la siguiente.",
  "Tras el test del 2 de noviembre se ajustan ritmos, y si vas muy bien se revisa el objetivo.",
];

// Instagram: el calendario antiguo se ha borrado. El nuevo se cargará aquí.
export const IG = { account: "@lemondenais" };

// Clientes de partida (solo se cargan la primera vez que se abre la app).
// Las fechas de seguimiento son propuestas: cámbialas desde la ficha.
export const SEED_CONTACTS = [
  { id: "c-valenia", name: "Valênia Simões", company: "", phone: "", email: "", status: "lead",
    notes: "", followups: [{ id: "f-valenia-1", date: "2026-10-08", reason: "Quedar con ella (reunión del jueves)", done: false }],
    log: [] },
  { id: "c-duo", name: "Dúo Pizzería", company: "Pedidos online", phone: "", email: "", status: "propuesta",
    notes: "", followups: [{ id: "f-duo-1", date: "2026-10-09", reason: "Preguntar si han visto la propuesta", done: false }],
    log: [{ date: "2026-10-06", text: "Propuesta enviada, sin respuesta todavía" }] },
  { id: "c-forno", name: "Forno Bomba", company: "Encargos online", phone: "", email: "", status: "propuesta",
    notes: "", followups: [{ id: "f-forno-1", date: "2026-10-09", reason: "Preguntar si han visto la propuesta", done: false }],
    log: [{ date: "2026-10-06", text: "Propuesta enviada, sin respuesta todavía" }] },
  { id: "c-masuri", name: "Masuri", company: "Reservas online", phone: "", email: "", status: "propuesta",
    notes: "", followups: [{ id: "f-masuri-1", date: "2026-10-07", reason: "Recordarle el boceto y preguntar qué le parece", done: false }],
    log: [{ date: "2026-10-04", text: "Boceto enviado, sin respuesta todavía" }] },
  { id: "c-clinica", name: "Marta Mateo Enciso", company: "Clínica podológica", phone: "", email: "", status: "pausa",
    notes: "Se le hizo un boceto de la web. Por ahora no está interesada.",
    followups: [{ id: "f-clinica-1", date: "2027-01-11", reason: "Volver a ofrecer la web", done: false }],
    log: [{ date: "2026-09-23", text: "Boceto enviado. Por ahora no está interesada" }] },
];

// Plan de UNIXO montado a partir de los correos con proveedores (hasta el 8 oct).
// Solo se carga si la sección UNIXO está vacía. Todo se puede editar en la app.
export const UNIXO_SEED = {
  summary: `Sudaderas con capucha personalizadas. Primera tirada pequeña para probar: 30 unidades por color.

PROVEEDORES
• Raquel Castro (Parâmetros e Sonhos, Guimarães) · raquel.ma@sapo.pt · +351 960 282 838
  Hoodie 450 GSM oversized brushed fleece garment dye, ya personalizada.
  30 uds/color: 38,5 €/ud (50 uds: 38 €/ud). Colores que recomienda: 820 charcoal y azul 435.
  Producción 4–5 semanas. Muestra: 2 semanas y cuesta el doble (+100 %).
  No incluye etiquetas ni transporte. Espera tu respuesta desde el 29 sep.
• Maragatas Confecções (Eduardo) · maragatasconfecoes@gmail.com
  Mínimo 50 uds por color y modelo. Hacen bordado y DTF. Tiene la ficha desde el 14 sep; sin presupuesto aún.
• Formas Serigrafía (Esquiroz, Navarra) · Itsasne / Marta · 948 31 66 29 · L–V de 6 a 14 h
  Para presupuestar el estampado necesitan: archivos vectorizados y a tamaño (también la capucha),
  el Pantone (o elegir en su carta de colores) y saber quién pone las prendas y quién plancha.
• Sin respuesta: HTH Têxteis, Carmafil, Blusa (Arpitex te pasó a Raquel).`,
  phases: [
    { id: "ux1", name: "1. Elegir proveedor", tasks: [
      { id: "ux1a", text: "Formas Serigrafía: mandar archivos vectorizados a tamaño (delante, espalda y capucha), Pantone, y decir quién pone las prendas y el planchado", date: "2026-10-09", done: false },
      { id: "ux1b", text: "Maragatas: pedir el presupuesto de muestra y de producción con la ficha del 14 sep", date: "2026-10-09", done: false },
      { id: "ux1c", text: "Raquel: preguntar precio de la muestra, de etiquetas y del transporte a España", date: "2026-10-12", done: false },
      { id: "ux1d", text: "Comparar opciones (precio final por sudadera, mínimo, plazo) y elegir", date: "2026-10-16", done: false },
    ] },
    { id: "ux2", name: "2. Muestra", tasks: [
      { id: "ux2a", text: "Elegir color(es) y pedir la muestra", date: "2026-10-19", done: false },
      { id: "ux2b", text: "Revisar la muestra: tejido, talla, estampado y lavado", date: "2026-11-02", done: false },
    ] },
    { id: "ux3", name: "3. Producción", tasks: [
      { id: "ux3a", text: "Decidir tallas y cantidades (30 por color) y confirmar el pedido", date: "2026-11-06", done: false },
      { id: "ux3b", text: "Etiquetas y bolsas o packaging", date: "", done: false },
      { id: "ux3c", text: "Recibir la producción (4–5 semanas)", date: "2026-12-11", done: false },
    ] },
    { id: "ux4", name: "4. Venta", tasks: [
      { id: "ux4a", text: "Calcular el coste total por sudadera y fijar el precio de venta", date: "", done: false },
      { id: "ux4b", text: "Decidir dónde vender (Instagram, conocidos, web…)", date: "", done: false },
      { id: "ux4c", text: "Fotos de producto con la muestra", date: "", done: false },
    ] },
  ],
};
