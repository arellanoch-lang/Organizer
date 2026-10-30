// Contenido fijo de los planes (el 10K sale del artefacto «Plan 10K París»).
// Lo que marques como hecho se guarda aparte.

export const RACE = { date: "2026-12-06", time: "09:00", name: "Saucony 10K París", goal: "1:05:00" };

// Hybrid: clase fija martes y jueves a las 19:00 (se repite todas las semanas).
export const HYBRID = { from: "2026-10-06", days: [2, 4], time: "19:00", title: "Hybrid" };

// Los ejercicios de fuerza se hacen como calentamiento antes de cada rodaje suave.
export const WARMUP = "12 sentadillas, 10 zancadas por pierna, 15 elevaciones de gemelo, 30\" de plancha y 10 puentes de glúteo.";

export const ZONES = [
  { k: "easy", name: "Suave", num: "<150 ppm", txt: "9:00–9:45/km. Andar cuando pase de 150." },
  { k: "tempo", name: "Umbral", num: "160–170 ppm", txt: "6:40–6:45/km. Cómodamente duro, sin pasar de 170." },
  { k: "fast", name: "Series", num: ">170 ppm", txt: "6:15–6:30/km. Fuerte pero controlado." },
];

// [fecha del plan, tipo, título, detalle, objetivo, hecho, fecha real, cómo fue]
// La fecha del plan identifica la sesión (no cambiarla). Si se hizo otro día,
// va en «fecha real». «Cómo fue» rellena el desplegable 📝 con lo que se hizo
// (lo que escribas en el móvil tiene prioridad).
export const RUN_WEEKS = [
  { n: 1, focus: "Diagnóstico y empezar a ir suave de verdad", s: [
    ["2026-10-05", "test", "Test 3 km", "Hecho: 6:51 – 7:16 – 6:32 (2,5 km reales). FC máx. 187.", "", true, "",
      { km: "3,89", time: "28:32", hr: "168", text: "Salida rápida, bajón en el 2.º km y final apretado. Con 25 °. Estimación de 10K: 1h10–1h13." }],
    ["2026-10-07", "easy", "Rodaje 35'", "35 minutos continuos muy suaves.", "<150 ppm", true, "2026-10-09",
      { km: "3,86", time: "36:54", hr: "146", text: "Muchos tramos andando para no pasar de 150. Normal al empezar." }],
    ["2026-10-10", "easy", "Largo 7 km", "7 km suaves. Primer paso hacia los 12 km.", "<150 ppm", true, "2026-10-11",
      { km: "8,01", time: "1:18:31", hr: "152", feel: "4", text: "Primeros 45' alternando trote y paso; después trote casi seguido a 9:00–10:00/km. + 8 rectas de 30\" a 1,03 km." }]] },
  { n: 2, focus: "Velocidad corta y más volumen", s: [
    ["2026-10-12", "fast", "6 × 400 m", "Recuperación 2' trotando o andando.", "6:00/km · >170 ppm", true, "",
      { km: "4,36", time: "36:47", hr: "162", text: "Series: 6:12 · 6:02 · 6:10 · 6:18 · 6:13 · 5:58. Muy regulares, la última la más rápida." }],
    ["2026-10-14", "easy", "Rodaje 35' + rectas", "35' suaves y al final 4 × 20\" algo más rápido, con 1' andando.", "<150 ppm", true, "",
      { km: "4,87", time: "43:04", hr: "151", text: "35' casi sin parar a ~9:15/km y ~150 ppm con 26 °. Gran mejora en 5 días." }],
    ["2026-10-17", "easy", "Largo 8 km", "8 km suaves.", "<150 ppm", true, "2026-10-18",
      { km: "8,05", time: "1:13:48", hr: "154", text: "40\"/km más rápida que el domingo anterior con las mismas pulsaciones. Última media hora seguida." }]] },
  { n: 3, focus: "Primeros bloques a ritmo umbral", s: [
    ["2026-10-19", "fast", "5 × 800 m", "Recuperación 2' trotando.", "6:15/km", true, "2026-10-21",
      { km: "5,04", time: "38:52", hr: "162", text: "6:16 · 6:14 · 6:38 · 6:36 · la última parada a 370 m por cansancio y una cuesta fuerte. Para series: buscar llano." }],
    ["2026-10-21", "tempo", "3 × 8'", "Recuperación 2' trotando. Ritmo constante de principio a fin.", "6:40–6:45/km · 160–170 ppm", true, "2026-10-24",
      { km: "4,06", time: "30:00", hr: "172", text: "En La Estanca (llano). Bloques a 6:27 · 6:33 · 6:37/km. Muy regular, pero más rápido de lo previsto y en el límite de la zona 5. Calentamiento aparte: 1,14 km a 8:57, 140 ppm." }],
    ["2026-10-24", "easy", "Largo 9 km", "9 km muy suaves, aunque tengas que andar algo. Empieza con 5' andando rápido.", "<150 ppm", true, "2026-10-25",
      { km: "9,23", time: "1:25:15", hr: "149", feel: "4", text: "Por debajo de 150 al día siguiente del umbral. Primeros 40' con alguna parada; después seguido y más rápida: últimos km a 8:47–8:54. La tirada más larga desde mayo." }]] },
  { n: 4, focus: "Semana de asimilación (más ligera)", s: [
    ["2026-10-26", "easy", "Rodaje 40'", "40' suaves.", "<150 ppm", true, "2026-10-28",
      { km: "4,52", time: "40:08", hr: "149", text: "Casi sin parar (una parada hacia el minuto 9). El rodaje suave más rápido hasta ahora: 8:53/km a 149 ppm (el 9 oct, 9:34/km a 146 andando mucho)." }],
    ["2026-10-28", "fast", "4 × 1 km", "Recuperación 2'30\" trotando. En llano y controlada: ni un segundo más rápido, que el lunes hay test.", "6:25–6:30/km", true, "2026-10-30",
      { km: "4,72", time: "36:26", hr: "165", text: "Series: 6:39 · 6:41 · 6:39 · 6:28, con 22 °. 172–178 ppm al final de cada una. Las dos primeras costaron mucho y las dos últimas fueron las más fáciles: el registro empieza directamente en la 1.ª serie (sin calentamiento)." }],
    ["2026-10-31", "easy", "Largo 7 km", "7 km muy suaves, el día después de las series. Domingo, descanso antes del test.", "<150 ppm"]] },
  { n: 5, focus: "Test de control y bloques más largos", s: [
    ["2026-11-02", "test", "Test 3 km", "Igual que el primero, pero regular: mismo ritmo los 3 km. Llano y sin paradas.", "A tope controlado"],
    ["2026-11-04", "tempo", "2 × 12'", "Recuperación 3' trotando.", "6:40/km · 160–170 ppm"],
    ["2026-11-07", "easy", "Largo 10 km", "10 km suaves. Ya tienes la distancia.", "<150 ppm"]] },
  { n: 6, focus: "Ritmo continuo", s: [
    ["2026-11-09", "fast", "5 × 1 km", "Recuperación 2' trotando.", "6:20/km"],
    ["2026-11-11", "tempo", "20' continuos", "20 minutos seguidos a ritmo umbral.", "6:40/km · 160–170 ppm"],
    ["2026-11-14", "easy", "Largo 11 km", "Suaves, y los 2 últimos km a 6:45.", "<150 ppm, final más vivo"]] },
  { n: 7, focus: "Series largas a ritmo objetivo", s: [
    ["2026-11-16", "fast", "3 × 2 km", "Recuperación 3' trotando.", "6:25/km"],
    ["2026-11-18", "easy", "Rodaje 40'", "40' suaves.", "<150 ppm"],
    ["2026-11-21", "easy", "Largo 12 km", "12 km suaves. El más largo del plan.", "<150 ppm"]] },
  { n: 8, focus: "Última semana fuerte", s: [
    ["2026-11-23", "fast", "6 × 1 km", "Recuperación corta: 1'30\" trotando.", "6:20/km"],
    ["2026-11-25", "tempo", "25' a ritmo carrera", "25 minutos seguidos a ritmo objetivo.", "6:30/km"],
    ["2026-11-28", "tempo", "10 km con final", "6 km suaves + 4 km a ritmo carrera.", "<150 → 6:30/km"]] },
  { n: 9, focus: "Descarga: llegar fresca", s: [
    ["2026-11-30", "fast", "4 × 1 km", "Recuperación 2'. Sensaciones, no cansancio.", "6:30/km"],
    ["2026-12-02", "easy", "Rodaje 25' + rectas", "25' suaves + 4 × 20\" ágiles.", "<150 ppm"],
    ["2026-12-05", "easy", "Activación 15'", "15' muy suaves + 3 rectas cortas. Pierna suelta.", "<145 ppm"],
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
  "Garmin configurado con FC máxima 188 y zonas a medida (9 oct): zona 2 = suave, zona 4 = umbral, zona 5 = series.",
  "Los días suaves son suaves. Si las pulsaciones pasan de 150, anda 30–60 segundos y vuelve a trotar. Andar es parte del entreno.",
  "Series y umbral en llano (por ejemplo, La Estanca). En cuesta, guíate por las pulsaciones, no por el ritmo.",
  "Constancia por encima de todo: 3 sesiones cada semana, sin parones de varias semanas.",
  "Si tienes dolor (no cansancio) que cambia tu forma de correr, para y avisa.",
  "Si te saltas una sesión, no la recuperes: sigue con la siguiente.",
  "Tras el test del 2 de noviembre se ajustan ritmos, y si vas muy bien se revisa el objetivo.",
];

// Instagram: el calendario antiguo se ha borrado. El nuevo se cargará aquí.
export const IG = { account: "@lemondenais" };

// Los clientes viven solo en el móvil (no en el código, que es público).
// Se añaden desde la app con «+»; para no perderlos, haz copias de seguridad.
export const SEED_CONTACTS = [];
export const EXTRA_CONTACTS = [];

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

// Mensajes tipo del CRM. Variables: {nombre} {empresa} {servicio} {precio}
// {enlace} {fecha} {mi_nombre}. Se editan en Clientes → Plantillas.
export const TEMPLATES_SEED = [
  { id: "primer-contacto", name: "Primer contacto (reservas en su web)", subject: "Reservas online para {empresa}",
    text: "¡Hola {empresa}! Soy Christel, creo sistemas de reservas online para centros como el vuestro.\n\nHe visto vuestra web y que las citas se piden solo por WhatsApp. Os propongo añadir un botón \"Reservar cita\" en vuestra web: la clienta elige tratamiento, día y hora, y la cita entra directa en vuestra agenda. Menos mensajes que contestar mientras trabajáis y sin cambiar vuestra web.\n\nAsí se ve un ejemplo:\nhttps://arellanoch-lang.github.io/bocetos/bienestar-demo/\n\nPago único, sin cuotas mensuales. Si os interesa, os preparo uno con vuestros servicios, sin compromiso 😊" },
  { id: "propuesta", name: "Envío de propuesta", subject: "Propuesta para {empresa}",
    text: "Hola {nombre}, ¿qué tal?\n\nTe envío la propuesta para {empresa}: {enlace}\n\nEn ella verás cómo funcionaría, qué ganaría tu negocio y el precio cerrado: {precio}, pago único.\n\nCualquier duda me dices y lo hablamos.\n\nUn saludo,\n{mi_nombre}" },
  { id: "seguimiento", name: "¿Qué te parece la propuesta?", subject: "¿Qué te ha parecido la propuesta?",
    text: "Hola {nombre}, ¿qué tal?\n\nTe escribo para saber si has podido ver la propuesta que te envié para {empresa}. ¿Qué te ha parecido?\n\nSi quieres, lo vemos juntos en 10 minutos por teléfono y te resuelvo cualquier duda.\n\nUn saludo,\n{mi_nombre}" },
  { id: "oferta", name: "Te adjunto la oferta final", subject: "Oferta final · {empresa}",
    text: "Hola {nombre}:\n\nTe adjunto la oferta final para {empresa} con el precio y las condiciones que hablamos: {precio}, pago único.\n\nSi te parece bien, respóndeme con un «adelante» y te cuento los siguientes pasos para empezar.\n\nUn saludo,\n{mi_nombre}" },
];

// Mensajes tipo añadidos después: entran una sola vez en el móvil (si los borras, no vuelven).
export const EXTRA_TEMPLATES = [
  { id: "fresha-booksy", name: "Ya usa Fresha o Booksy", subject: "Una web propia para {empresa}",
    text: "Hola {nombre}, ¿qué tal?\n\nHe visto que ya gestionas las citas con [Fresha/Booksy]. ¡Genial, no hace falta cambiarlo!\n\nLo que te propongo es una web propia para {empresa}, con tu marca, tus trabajos y tus precios, que lleve directamente a tu [Fresha/Booksy] para reservar. Así tus clientas te encuentran en Google con tu nombre, y no dentro de la plataforma junto a otros centros.\n\nSi te parece, te preparo una prueba sin compromiso para que la veas.\n\nUn saludo,\n{mi_nombre}" },
];

// Condiciones por defecto del presupuesto.
export const OFFER_CONDITIONS = "3 meses de garantía desde la publicación: cualquier error se arregla gratis y os respondo en 48 horas laborables.\nCambios nuevos (otra sección, pagos online u otro idioma) se presupuestan aparte antes de empezar.\nEl plan de mantenimiento es opcional y se puede dar de baja cuando queráis.\nPlazo: publicada en unas 2 semanas desde vuestro sí; depende de lo rápido que nos paséis el material.\nValidez del presupuesto: 30 días.";
export const OFFER_PAY = "50 % al aceptar y 50 % al publicar la web";
export const OFFER_HIGHLIGHTS = [
  { label: "Alojamiento", value: "0 €" },
  { label: "Garantía", value: "3 meses" },
  { label: "Mantenimiento, opcional", value: "29 €/mes + IVA" },
];
