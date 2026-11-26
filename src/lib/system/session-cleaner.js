/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
// Pembersih session otomatis (aman).
// Interval diatur di config.js -> session.autoClear.intervalMinutes (satuan menit).
//
// Yang TIDAK pernah dihapus: creds.json, session-*, pre-key-*, app-state-sync-key-*,
// lid-mapping-*, tctoken-*. Menghapus itu membuat pesan gagal didekripsi (Bad MAC).
// Yang dibersihkan hanya cache yang dibuat ulang otomatis oleh WhatsApp/Baileys.
import fs from "fs";
import path from "path";
import config from "../../../config.js";
import { logger } from "../core/logger.js";
import { getActiveAuthStore } from "./auth-store.js";

let timer = null;

// Mode file-per-key (session.compact = false): hanya file ini yang boleh dihapus.
const SAFE_PREFIX = ["sender-key-memory-", "device-list-"];
const STALE_PREFIX = ["sender-key-", "app-state-sync-version-"];
const STALE_AFTER_MS = 3 * 24 * 60 * 60 * 1000; // 3 hari tidak berubah

export function getSessionPath() {
  return path.join(
    process.cwd(),
    "storage",
    config.session?.folderName || "session",
  );
}

/** Bersihkan cache session yang aman dibuang. */
export function clearSessionFiles(dir = getSessionPath()) {
  const result = { deleted: 0, skipped: 0, missing: false, mode: "compact" };

  const store = getActiveAuthStore();
  if (store) {
    result.deleted = store.prune();
    result.skipped = Object.values(store.stats()).reduce((a, b) => a + b, 0);
    return result;
  }

  result.mode = "files";
  if (!fs.existsSync(dir)) return { ...result, missing: true };

  const now = Date.now();
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    let remove = SAFE_PREFIX.some((p) => name.startsWith(p));
    if (!remove && STALE_PREFIX.some((p) => name.startsWith(p))) {
      try {
        remove = now - fs.statSync(file).mtimeMs > STALE_AFTER_MS;
      } catch {}
    }
    if (!remove) {
      result.skipped++;
      continue;
    }
    try {
      fs.rmSync(file, { force: true });
      result.deleted++;
    } catch {
      result.skipped++;
    }
  }
  return result;
}

export function stopSessionCleaner() {
  if (timer) clearInterval(timer);
  timer = null;
}

export function startSessionCleaner() {
  stopSessionCleaner();

  const opt = config.session?.autoClear;
  if (!opt?.enabled) return false;

  const minutes = Math.max(1, Number(opt.intervalMinutes) || 60);
  timer = setInterval(() => {
    const r = clearSessionFiles();
    if (!r.missing && r.deleted > 0) {
      logger.info("session", `auto clear: ${r.deleted} dihapus, ${r.skipped} dipertahankan`);
    }
  }, minutes * 60 * 1000);
  timer.unref?.();

  logger.info("session", `auto clear session aktif tiap ${minutes} menit`);
  return true;
}
