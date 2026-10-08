// Capturas (por ejemplo, del reloj) asociadas a un entreno. Se guardan en
// IndexedDB porque localStorage no admite imágenes de este tamaño.

const DB = "organizer-photos";
const STORE = "photos";
let dbPromise = null;

function db() {
  dbPromise ||= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function run(mode, fn) {
  return db().then(d => new Promise((resolve, reject) => {
    const tx = d.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror = () => reject(tx.error);
  }));
}

// clave del entreno -> [{ id, url }]
export const photos = new Map();

function remember(rec) {
  const list = photos.get(rec.key) || [];
  list.push({ id: rec.id, url: URL.createObjectURL(rec.blob) });
  photos.set(rec.key, list);
}

export async function loadPhotos() {
  const all = await run("readonly", s => s.getAll());
  photos.forEach(list => list.forEach(p => URL.revokeObjectURL(p.url)));
  photos.clear();
  all.sort((a, b) => a.created - b.created).forEach(remember);
}

// Reduce la imagen para no llenar el móvil (las capturas suelen ser enormes).
async function shrink(file, max = 1600) {
  try {
    const img = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise(r => canvas.toBlob(b => r(b || file), "image/jpeg", 0.85));
  } catch (e) {
    return file; // formato que el navegador no sabe abrir: se guarda tal cual
  }
}

export async function addPhoto(key, file) {
  const rec = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), key, blob: await shrink(file), created: Date.now() };
  await run("readwrite", s => s.put(rec));
  remember(rec);
}

export async function deletePhoto(id) {
  await run("readwrite", s => s.delete(id));
  photos.forEach((list, key) => {
    const i = list.findIndex(p => p.id === id);
    if (i < 0) return;
    URL.revokeObjectURL(list[i].url);
    list.splice(i, 1);
    if (!list.length) photos.delete(key);
  });
}

const toDataURL = blob => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = () => reject(r.error);
  r.readAsDataURL(blob);
});

// Para la copia de seguridad: las imágenes viajan dentro del JSON.
export async function exportPhotos() {
  const all = await run("readonly", s => s.getAll());
  return Promise.all(all.map(async p => ({ id: p.id, key: p.key, created: p.created, data: await toDataURL(p.blob) })));
}

export async function importPhotos(list) {
  const recs = await Promise.all((list || []).map(async p => ({ id: p.id, key: p.key, created: p.created, blob: await (await fetch(p.data)).blob() })));
  await run("readwrite", s => { s.clear(); recs.forEach(r => s.put(r)); });
  await loadPhotos();
}
