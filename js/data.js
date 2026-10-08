// Contenido fijo de los planes. Copiado de los artefactos «Plan 10K París» y
// «Calendario Instagram Octubre». Lo que marques como hecho se guarda aparte.

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

export const IG = {
  account: "@lemondenais",
  rules: [
    "<b>Primer segundo:</b> una frase gancho en pantalla, grande y legible.",
    "<b>Música:</b> en los reels, una canción en tendencia de la biblioteca de Instagram (las que llevan la flecha ↗).",
    "<b>Texto:</b> info útil + una pregunta al final para que comenten.",
    "<b>Hashtags:</b> 3–5 concretos. Añade siempre la ubicación.",
    "<b>Lo que va [entre corchetes]</b> lo rellenas con tu experiencia real.",
    "<b>Tus hijas no salen:</b> fotos y clips donde no aparezcan (de espaldas, solo pies o manos, o tú sola).",
  ],
};

export const IG_WEEKS = [
  { n: "Semana 1", from: "2026-10-01", to: "2026-10-04", stories: "Encuesta «¿Paros o Santorini?» y, el sábado, adelanto: «Mañana os cuento un reto que me da un poco de miedo…»." },
  { n: "Semana 2", from: "2026-10-05", to: "2026-10-11", stories: "Tu reloj o app tras cada entreno, encuesta «¿Has corrido alguna carrera?» y caja de preguntas «¿Consejos para mi primera 10K?»." },
  { n: "Semana 3", from: "2026-10-12", to: "2026-10-18", stories: "Respuestas a los consejos que te lleguen, «¿Qué costumbre francesa te sorprende más?» y el entreno largo del fin de semana." },
  { n: "Semana 4", from: "2026-10-19", to: "2026-10-25", stories: "Recuerdos de Nueva York, encuesta «¿Viajas con horario o improvisando?» y cómo va la cuenta atrás." },
  { n: "Semana 5", from: "2026-10-26", to: "2026-10-31", stories: "Resumen del mes de entrenos y encuesta «¿Me acompañáis hasta París?»." },
];

export const IG_POSTS = [
  { date: "2026-10-01", time: "20:00", f: "carr", pre: true, pillar: "Viajes", title: "Paros vs Santorini en familia: ¿cuál elegir?",
    how: ["Ya está hecho y programado en Instagram."],
    cap: "¿Paros o Santorini? Hemos estado en las dos en familia y te cuento cuál elegiría según lo que busques 👇\n\nDesliza y dime: ¿tú cuál prefieres?\n\n#grecia #viajesenfamilia #santorini #paros #cicladas",
    need: "Nada: ya programado." },
  { date: "2026-10-04", time: "11:00", f: "reel", pillar: "Rumbo a París · 10K", title: "Mi primera carrera: 10 km en París el 6 de diciembre",
    how: ["Arranque de la serie. Clips tuyos: atarte las zapatillas, salir por la puerta, corriendo, respirando al parar.", "Texto 1: «Nunca he corrido una carrera».", "Texto 2: «El 6 de diciembre corro 10 km en París».", "Texto 3: «En mi ciudad. ¿Me acompañáis?»."],
    cap: "Nunca he corrido una carrera… y la primera va a ser en mi ciudad 🇫🇷\nEl 6 de diciembre corro los 10 km de la Saucony en París. Empieza la cuenta atrás.\n\n¿Me acompañáis en el camino? Os lo cuento cada domingo 🏃‍♀️\n\n#primeracarrera #10k #running #paris #correresdevalientes",
    need: "4–5 clips cortos tuyos corriendo (de espaldas o de pies también vale)." },
  { date: "2026-10-06", time: "20:00", f: "reel", pillar: "Humor", title: "Yo antes de salir a correr vs yo en el kilómetro 2",
    how: ["Plano 1: tú motivadísima, estirando (texto: «Yo antes de salir a correr»).", "Plano 2: tú parada, sin aire (texto: «Yo en el kilómetro 2»).", "Audio de humor en tendencia. 6–8 segundos."],
    cap: "Siempre la misma historia 😅\n¿A alguien más le pasa?\n\n#running #humorrunner #primeracarrera #correresdevalientes",
    need: "2 clips tuyos de 3 s." },
  { date: "2026-10-08", time: "20:00", f: "carr", pillar: "Parisina en Navarra", title: "Por qué mi primera carrera tenía que ser en París",
    how: ["Portada: una foto tuya en París con el título.", "3–4 diapositivas con tus razones reales: [volver a mi ciudad], [el reto], [quién te acompaña]…", "Última: «6 de diciembre. Cuenta atrás en marcha»."],
    cap: "Podría haber elegido cualquier carrera… pero la primera tenía que ser en casa 💙\nOs cuento por qué 👇\n\n#paris #primeracarrera #parisina #running",
    need: "Fotos tuyas en París + tus razones." },
  { date: "2026-10-11", time: "11:00", f: "reel", pillar: "Rumbo a París · 10K", title: "Diario hacia París #1",
    how: ["Resumen de la semana en 10 s: clips de entrenos + captura del reloj o app.", "Texto: «Semana 1 · [X] km · Lo más difícil: [ ]».", "Final: «Quedan [X] semanas»."],
    cap: "Diario hacia París #1 🏃‍♀️\nEsta semana: [X] km. Lo más difícil: [ ].\nQuedan [X] semanas para mi primera 10K.\n\n¿Algún consejo para una novata? Os leo 👇\n\n#primeracarrera #10k #running #diariorunner",
    need: "Clips de la semana + captura del reloj/app." },
  { date: "2026-10-13", time: "20:00", f: "reel", pillar: "Parisina en Navarra", title: "Cosas que hace una francesa en España que nadie entiende",
    how: ["Tú a cámara o texto sobre clips cotidianos.", "3–4 ejemplos reales: [cenar pronto], [la baguette], [los dos besos]…", "Final: «¿Cuál os parece más rara?»."],
    cap: "Parisina en Navarra desde hace [X] años… y hay cosas que no cambian 🥖🇫🇷\n¿Cuál os parece más rara?\n\n#francesaenespaña #parisina #navarra #culturafrancesa",
    need: "Clips del día a día (cocina, compra, desayuno)." },
  { date: "2026-10-15", time: "20:00", f: "carr", pillar: "Viajes", title: "Paros en 3 días: lo que hicimos y lo que no repetiría",
    how: ["Portada: el callejón blanco y azul.", "Día 1, Día 2, Día 3: [qué hicisteis cada día], incluida Lefkes.", "Dónde comer: [vuestros sitios].", "Qué evitar: [lo que no repetiríais]."],
    cap: "Paros en 3 días: lo que hicimos, dónde comimos y lo que no repetiría 👇\nGuárdalo si estás pensando en ir.\n\n#paros #grecia #viajesenfamilia #cicladas",
    need: "Fotos de Paros sin tus hijas + tu ruta real." },
  { date: "2026-10-18", time: "11:00", f: "reel", pillar: "Rumbo a París · 10K", title: "Diario hacia París #2",
    how: ["Mismo formato que el #1 (así se reconoce la serie).", "Texto: «Semana 2 · [X] km · Lo que he aprendido: [ ]».", "Si te han llegado consejos en comentarios, menciona uno."],
    cap: "Diario hacia París #2 🏃‍♀️\n[X] km esta semana. Lo que he aprendido: [ ].\nGracias por vuestros consejos, ¡los estoy probando!\n\n#primeracarrera #10k #running #diariorunner",
    need: "Clips de la semana + captura del reloj/app." },
  { date: "2026-10-20", time: "20:00", f: "reel", pillar: "Viajes", title: "Nueva York en 20 segundos",
    how: ["Cortes rápidos con tus fotos de Manhattan: graffiti de la calle 17, Edge, Little Island, edificio Friends, metro, Times Square.", "Texto inicial: «Nueva York en 20 segundos».", "Canción en tendencia con ritmo."],
    cap: "Nueva York en 20 segundos 🗽\n¿Cuál sería tu primera parada?\n\n#nuevayork #newyork #viajes #manhattan",
    need: "Fotos de Nueva York (sept. 2025) sin tus hijas." },
  { date: "2026-10-22", time: "20:00", f: "carr", pillar: "Parisina en Navarra", title: "París como una parisina: 7 sitios fuera de las guías",
    how: ["Portada: tu mejor foto de París.", "7 diapositivas: [7 sitios que recomiendas], por ejemplo el Jardin d'Acclimatation.", "Consejo práctico: moverse en patinete eléctrico.", "Última: «¿Te los apuntas para tu próximo viaje?»."],
    cap: "Soy parisina y estos son los sitios a los que llevaría a cualquiera en París (y no todos salen en las guías) 👇\nGuárdalo para tu próximo viaje.\n\n#paris #parisina #viajes #vacacionesenparis",
    need: "Fotos de París sin tus hijas." },
  { date: "2026-10-25", time: "11:00", f: "reel", pillar: "Rumbo a París · 10K", title: "Diario hacia París #3",
    how: ["Mismo formato de la serie.", "Texto: «Semana 3 · [X] km · Mi ritmo: [ ]».", "Enseña algo del material: zapatillas, reloj, camiseta."],
    cap: "Diario hacia París #3 🏃‍♀️\n[X] km y cada vez más cerca. ¿Qué no puede faltar en tu mochila de carrera?\n\n#primeracarrera #10k #running #diariorunner",
    need: "Clips de la semana + tu material." },
  { date: "2026-10-27", time: "20:00", f: "reel", pillar: "Viajes", title: "«A ver si adivináis dónde estamos…»",
    how: ["Reel ya hecho (sin la foto familiar).", "Añade una canción en tendencia desde Instagram."],
    cap: "A ver si adivináis dónde estamos… 👀\nPista: hay más cúpulas azules que nubes.\n\n#grecia #santorini #viajes #cicladas",
    need: "Nada: el vídeo está listo." },
  { date: "2026-10-29", time: "20:00", f: "carr", pillar: "Viajes", title: "Nueva York: lo que sí y lo que no",
    how: ["Portada: Times Square o el Edge.", "«Lo que sí»: [3–4 cosas que recomiendas].", "«Lo que no»: [2–3 cosas que no repetirías].", "Última: «¿Tienes dudas? Pregúntame»."],
    cap: "Nueva York: lo que volvería a hacer y lo que me saltaría 👇\n¿Tienes dudas para tu viaje? Pregúntame por aquí.\n\n#nuevayork #viajes #consejosdeviaje #newyork",
    need: "Tu lista real + fotos de Nueva York." },
  { date: "2026-10-31", time: "11:00", f: "reel", pillar: "Rumbo a París · 10K", title: "Diario hacia París #4 · Balance de octubre",
    how: ["Resumen del mes: km totales, mejor entreno, peor día.", "Texto final: «Quedan [X] semanas. Noviembre, allá voy»."],
    cap: "Diario hacia París #4 · Octubre en números 🏃‍♀️\n[X] km, [X] entrenos y muchas ganas.\nQuedan [X] semanas para la Saucony. ¿Seguimos juntas?\n\n#primeracarrera #10k #running #diariorunner",
    need: "Datos del mes de tu reloj/app + clips." },
];

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
