/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
// Penyimpanan auth ringkas untuk Baileys.
//
// useMultiFileAuthState membuat 1 file untuk setiap key (ratusan sampai ribuan
// file). Di sini key digabung per tipe, sehingga folder session hanya berisi
// creds.json + beberapa file keys-<tipe>.json. Penulisan di-debounce dan atomik
// (tulis ke file sementara lalu rename), serta di-flush saat proses berhenti.
//
// File session lama (format useMultiFileAuthState) otomatis dimigrasi.
import fs from "fs";
import path from "path";
import {
  BufferJSON,
  initAuthCreds,
  proto,
} from "@rexxhayanasi/elaina-baileys";

// Urutan penting: nama yang lebih panjang harus dicek lebih dulu saat migrasi.
const KNOWN_TYPES = [
  "app-state-sync-version",
  "app-state-sync-key",
  "sender-key-memory",
  "lid-mapping",
  "device-list",
  "sender-key",
  "pre-key",
  "session",
  "tctoken",
  "identity-key",
];

// Tipe yang hanya cache dan aman dibuang kapan saja (akan dibuat ulang otomatis).
const SAFE_TO_PRUNE = ["sender-key-memory", "device-list"];

const FLUSH_DELAY_MS = 700;
const registry = new Map(); // dir -> instance
let exitHooked = false;

const keysFile = (dir, type) => path.join(dir, `keys-${type}.json`);

function writeAtomicSync(file, text) {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}

async function writeAtomic(file, text) {
  const tmp = `${file}.tmp`;
  await fs.promises.writeFile(tmp, text);
  await fs.promises.rename(tmp, file);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"), BufferJSON.reviver);
  } catch {
    return null;
  }
}

function hookExit() {
  if (exitHooked) return;
  exitHooked = true;
  const flushAll = () => {
    for (const inst of registry.values()) {
      try {
        inst.flushSync();
      } catch {}
    }
  };
  process.on("exit", flushAll);
  for (const sig of ["SIGINT", "SIGTERM"]) {
    process.on(sig, () => {
      flushAll();
      // Jangan menahan proses tetap hidup jika tidak ada handler lain.
      if (process.listenerCount(sig) <= 1) process.exit(0);
    });
  }
}

function migrateLegacyFiles(dir, data) {
  let migrated = 0;
  const done = [];
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".json") || name === "creds.json") continue;
    if (name.startsWith("keys-")) continue;
    const type = KNOWN_TYPES.find((t) => name.startsWith(`${t}-`));
    if (!type) continue;
    const rawId = name.slice(type.length + 1, -".json".length);
    const id = rawId.replace(/__/g, "/").replace(/--/g, "::");
    const value = readJson(path.join(dir, name));
    if (value === null) continue;
    (data[type] ||= {})[id] = value;
    done.push(name);
    migrated++;
  }
  return { migrated, files: done };
}

function createStore(dir) {
  fs.mkdirSync(dir, { recursive: true });

  const data = {}; // type -> { id -> value }
  const dirty = new Set();
  let credsDirty = false;
  let timer = null;
  let writing = Promise.resolve();
  let disposed = false;

  // --- muat dari disk
  for (const name of fs.readdirSync(dir)) {
    const m = /^keys-(.+)\.json$/.exec(name);
    if (!m) continue;
    const obj = readJson(path.join(dir, name));
    if (obj && typeof obj === "object") data[m[1]] = obj;
  }

  const legacy = migrateLegacyFiles(dir, data);
  if (legacy.migrated > 0) {
    for (const type of Object.keys(data)) writeAtomicSync(
      keysFile(dir, type),
      JSON.stringify(data[type], BufferJSON.replacer),
    );
    for (const f of legacy.files) {
      try {
        fs.unlinkSync(path.join(dir, f));
      } catch {}
    }
  }

  const creds = readJson(path.join(dir, "creds.json")) || initAuthCreds();

  function schedule() {
    if (disposed || timer) return;
    timer = setTimeout(() => {
      timer = null;
      writing = writing.then(flush).catch(() => {});
    }, FLUSH_DELAY_MS);
    timer.unref?.();
  }

  function snapshot() {
    const files = [];
    if (credsDirty) {
      files.push([path.join(dir, "creds.json"), JSON.stringify(creds, BufferJSON.replacer, 2)]);
      credsDirty = false;
    }
    for (const type of dirty) {
      const obj = data[type] || {};
      const file = keysFile(dir, type);
      if (Object.keys(obj).length === 0) {
        files.push([file, null]);
      } else {
        files.push([file, JSON.stringify(obj, BufferJSON.replacer)]);
      }
    }
    dirty.clear();
    return files;
  }

  async function flush() {
    if (disposed) return;
    for (const [file, text] of snapshot()) {
      if (text === null) {
        await fs.promises.rm(file, { force: true });
      } else {
        await writeAtomic(file, text);
      }
    }
  }

  function flushSync() {
    if (disposed) return;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    for (const [file, text] of snapshot()) {
      if (text === null) fs.rmSync(file, { force: true });
      else writeAtomicSync(file, text);
    }
  }

  const keys = {
    get: async (type, ids) => {
      const out = {};
      const bucket = data[type] || {};
      for (const id of ids) {
        let value = bucket[id];
        if (value !== undefined && type === "app-state-sync-key" && value) {
          value = proto.Message.AppStateSyncKeyData.fromObject(value);
        }
        out[id] = value;
      }
      return out;
    },
    set: async (input) => {
      for (const type in input) {
        const bucket = (data[type] ||= {});
        for (const id in input[type]) {
          const value = input[type][id];
          if (value) bucket[id] = value;
          else delete bucket[id];
        }
        dirty.add(type);
      }
      schedule();
    },
  };

  const saveCreds = async () => {
    credsDirty = true;
    schedule();
  };

  /** Buang cache yang aman dibuang. Tidak menyentuh sesi percakapan. */
  function prune() {
    let removed = 0;
    for (const type of SAFE_TO_PRUNE) {
      const n = Object.keys(data[type] || {}).length;
      if (n > 0) {
        data[type] = {};
        dirty.add(type);
        removed += n;
      }
    }
    if (removed) schedule();
    return removed;
  }

  /** Hapus semua entri dari tipe tertentu (dipakai .clearsession). Mengembalikan jumlah entri yang dihapus. */
  function purge(types = []) {
    let removed = 0;
    for (const type of types) {
      const n = Object.keys(data[type] || {}).length;
      if (n > 0) {
        data[type] = {};
        dirty.add(type);
        removed += n;
      }
    }
    if (removed) schedule();
    return removed;
  }

  function stats() {
    const out = {};
    for (const [type, obj] of Object.entries(data)) {
      out[type] = Object.keys(obj).length;
    }
    return out;
  }

  function dispose() {
    disposed = true;
    if (timer) clearTimeout(timer);
    timer = null;
    dirty.clear();
    credsDirty = false;
  }

  // Simpan creds awal bila belum ada di disk
  if (!fs.existsSync(path.join(dir, "creds.json"))) {
    credsDirty = true;
    schedule();
  }

  return {
    dir,
    state: { creds, keys },
    saveCreds,
    flush,
    flushSync,
    prune,
    purge,
    stats,
    dispose,
    migrated: legacy.migrated,
  };
}

/** Ambil (atau buat) penyimpanan auth untuk folder tertentu. */
export function useCompactAuthState(dir) {
  const key = path.resolve(dir);
  const existing = registry.get(key);
  if (existing) {
    existing.flushSync();
    if (fs.existsSync(path.join(key, "creds.json"))) return existing;
    existing.dispose();
    registry.delete(key);
  }
  hookExit();
  const inst = createStore(key);
  registry.set(key, inst);
  return inst;
}

/** Penyimpanan aktif (jika ada), dipakai pembersih session. */
export function getActiveAuthStore() {
  return [...registry.values()][0] || null;
}

/** Tutup penyimpanan tanpa menulis ulang (dipakai saat logout menghapus folder). */
export function closeAuthStore(dir) {
  const key = path.resolve(dir);
  const inst = registry.get(key);
  if (inst) {
    inst.dispose();
    registry.delete(key);
  }
}
