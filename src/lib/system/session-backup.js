/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
// Backup & pembersihan session ala Kaguya (disesuaikan untuk penyimpanan compact Elysia).
//  - backupSessionNow : salin storage/session ke database/backup-session (MANUAL lewat
//    .backupsession, tidak ada backup otomatis). Simpan 3 backup terakhir.
//  - cleanSessionFiles : hapus sesi chat (session-*) dan kunci grup (sender-key-*) TANPA menyentuh
//    creds.json, jadi bot tidak logout. Sesi chat dibuat ulang otomatis saat ada pesan masuk.
import fs from "fs";
import path from "path";
import config from "../../../config.js";
import { logger } from "../core/logger.js";
import { getSessionPath } from "./session-cleaner.js";
import { getActiveAuthStore } from "./auth-store.js";

const DEST = path.join(process.cwd(), "database", "backup-session");
const opt = () => config.session?.backup || {};
const keepCount = () => Math.max(1, Number(opt().keep) || 3);

/** Daftar backup yang tersimpan (terlama -> terbaru). */
export function listBackups() {
  try {
    return fs.readdirSync(DEST).sort();
  } catch {
    return [];
  }
}

const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

/** Backup folder session sekarang. Mengembalikan path backup, atau null kalau gagal/belum login. */
export function backupSessionNow(src = getSessionPath()) {
  try {
    getActiveAuthStore()?.flushSync?.();
    if (!fs.existsSync(path.join(src, "creds.json"))) return null;

    const target = path.join(DEST, stamp());
    fs.mkdirSync(DEST, { recursive: true });
    fs.cpSync(src, target, { recursive: true });

    const all = fs.readdirSync(DEST).sort();
    for (const old of all.slice(0, Math.max(0, all.length - keepCount()))) {
      fs.rmSync(path.join(DEST, old), { recursive: true, force: true });
    }
    return target;
  } catch (e) {
    logger.warn("session", `gagal backup session: ${e.message}`);
    return null;
  }
}

// Mode file-per-key: session-*.json, sender-key-*.json (termasuk sender-key-memory-*)
const CLEANABLE = /^(session-|sender-key-|sender-key-memory-).*\.json$/;
// Mode compact: satu file per tipe
const COMPACT_TYPES = ["session", "sender-key", "sender-key-memory"];
const COMPACT_FILE = /^keys-(session|sender-key|sender-key-memory)\.json$/;

/**
 * Hapus sesi chat & kunci grup. Yang TIDAK disentuh: creds.json, pre-key, app-state-sync-key, dll.
 * @returns {{found:boolean, files:number, bytes:number, failed:number, mode:string}}
 */
export function cleanSessionFiles(dir = getSessionPath()) {
  const root = path.resolve(dir);
  if (!fs.existsSync(root)) return { found: false, files: 0, bytes: 0, failed: 0, mode: "-" };

  const sizeOf = (name) => {
    try {
      return fs.statSync(path.join(root, name)).size;
    } catch {
      return 0;
    }
  };

  // Bot sedang jalan dengan penyimpanan compact: bersihkan lewat store supaya tidak ditulis ulang.
  const store = getActiveAuthStore();
  if (store) {
    store.flushSync();
    const bytes = COMPACT_TYPES.reduce((a, t) => a + sizeOf(`keys-${t}.json`), 0);
    const files = store.purge(COMPACT_TYPES);
    store.flushSync();
    return { found: true, files, bytes, failed: 0, mode: "compact" };
  }

  // Bot tidak jalan (mis. npm run clean-session): hapus file langsung.
  let files = 0;
  let bytes = 0;
  let failed = 0;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!CLEANABLE.test(entry.name) && !COMPACT_FILE.test(entry.name)) continue;
    const size = sizeOf(entry.name);
    try {
      fs.rmSync(path.join(root, entry.name), { force: true });
      files++;
      bytes += size;
    } catch {
      failed++;
    }
  }
  return { found: true, files, bytes, failed, mode: "files" };
}
