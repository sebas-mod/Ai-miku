/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
// Pembersih folder database/cache otomatis (sama seperti session-cleaner.js).
// Interval diatur di config.js -> database.autoClearCache.intervalMinutes (satuan menit).
//
// Yang TIDAK pernah dihapus: database/main/*, database/lid-cache.json, database/miku_rpg_store.json.
// Yang dibersihkan hanya seluruh file sementara di dalam database/cache.
import fs from "fs";
import path from "path";
import config from "../../../config.js";
import { logger } from "../core/logger.js";

let timer = null;

export function getDatabaseCachePath() {
  return path.join(process.cwd(), "database", "cache");
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 1024) return `${bytes || 0} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

export function getDatabaseCacheStats(cacheDir = getDatabaseCachePath()) {
  const files = walkFiles(cacheDir);
  let totalBytes = 0;
  for (const f of files) {
    try {
      totalBytes += fs.statSync(f).size;
    } catch {}
  }
  return {
    exists: fs.existsSync(cacheDir),
    fileCount: files.length,
    totalBytes,
    formattedSize: formatBytes(totalBytes),
  };
}

/** Hapus otomatis semua file cache di dalam database/cache. */
export function clearDatabaseCache(cacheDir = getDatabaseCachePath()) {
  const result = {
    deleted: 0,
    failed: 0,
    freedBytes: 0,
    formattedFreed: "0 B",
    missing: false,
  };

  if (!fs.existsSync(cacheDir)) {
    return { ...result, missing: true };
  }

  for (const file of walkFiles(cacheDir)) {
    try {
      const size = fs.statSync(file).size;
      fs.rmSync(file, { force: true });
      result.deleted++;
      result.freedBytes += size;
    } catch {
      result.failed++;
    }
  }

  // Pastikan folder database/cache/audio tetap ada agar plugin download tidak error
  try {
    fs.mkdirSync(path.join(cacheDir, "audio"), { recursive: true });
  } catch {}

  result.formattedFreed = formatBytes(result.freedBytes);
  return result;
}

export function stopDatabaseCacheCleaner() {
  if (timer) clearInterval(timer);
  timer = null;
}

export function startDatabaseCacheCleaner() {
  stopDatabaseCacheCleaner();

  const opt = config.database?.autoClearCache;
  if (!opt?.enabled) return false;

  const minutes = Math.max(1, Number(opt.intervalMinutes) || 60);

  // Langsung bersihkan sekali saat bot mulai
  const initial = clearDatabaseCache();
  if (!initial.missing && initial.deleted > 0) {
    logger.info(
      "cache",
      `limpieza automática de base/caché: ${initial.deleted} archivos (${initial.formattedFreed}) eliminados`,
    );
  }

  timer = setInterval(() => {
    const r = clearDatabaseCache();
    if (!r.missing && r.deleted > 0) {
      logger.info(
        "cache",
        `limpieza automática de base/caché: ${r.deleted} archivos (${r.formattedFreed}) eliminados`,
      );
    }
  }, minutes * 60 * 1000);
  timer.unref?.();

  logger.info("cache", `limpieza automática de base/caché activa cada ${minutes} minutos`);
  return true;
}
