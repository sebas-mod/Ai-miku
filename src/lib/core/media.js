/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
// Pengelola gambar thumbnail berbasis URL.
// Semua sumber diatur di config.js -> thumbUrl,
// dan bisa ditimpa saat bot berjalan lewat command .setthumb (disimpan di database).
import axios from "axios";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import config from "../../../config.js";
import thumbnailSettings from "../../settings/thumbnail.js";
const settingsThumbUrl = thumbnailSettings.thumbUrl;
import { getDatabase } from "../data/database.js";

const BLANK = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=", "base64");
const cache = new Map(); // url -> Buffer
const pending = new Map(); // url -> Promise<Buffer|null>

function override(name) {
  try {
    return getDatabase()?.setting?.("mediaUrl")?.[name] || "";
  } catch {
    return "";
  }
}

export function getThumbUrl(key = "menu") {
  const map = config.thumbUrl || settingsThumbUrl || {};
  return override(key) || map[key] || override("default") || map.default || "";
}

async function download(url) {
  if (cache.has(url)) return cache.get(url);
  if (pending.has(url)) return pending.get(url);

  // Path lokal (mis. "src/assets/thumbs/levelup.jpg") dibaca langsung dari disk.
  if (!/^https?:\/\//i.test(url)) {
    const job = fs.promises
      .readFile(path.resolve(process.cwd(), url))
      .then((buf) => {
        cache.set(url, buf);
        return buf;
      })
      .catch(() => null)
      .finally(() => pending.delete(url));
    pending.set(url, job);
    return job;
  }

  const job = axios
    .get(url, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: { "User-Agent": "Mozilla/5.0" },
    })
    .then((res) => {
      const buf = Buffer.from(res.data);
      cache.set(url, buf);
      return buf;
    })
    .catch(() => null)
    .finally(() => pending.delete(url));

  pending.set(url, job);
  return job;
}

/** Ambil thumbnail sebagai Buffer. withFallback=false -> null jika gagal/kosong. */
export async function fetchThumb(key = "menu", withFallback = true) {
  const url = getThumbUrl(key);
  const buf = url ? await download(url) : null;
  return buf || (withFallback ? BLANK : null);
}

/** Versi sinkron: pakai cache, download di background bila belum ada. */
export function getThumb(key = "menu") {
  const url = getThumbUrl(key);
  if (!url) return BLANK;
  const hit = cache.get(url);
  if (hit) return hit;
  download(url);
  return BLANK;
}

/** Download semua thumbnail saat startup agar getThumb() langsung siap. */
export async function preloadThumbs() {
  const map = config.thumbUrl || settingsThumbUrl || {};
  const urls = new Set(Object.keys(map).map((k) => getThumbUrl(k)).filter(Boolean));
  await Promise.allSettled([...urls].map((u) => download(u)));
}

/**
 * Kompatibilitas untuk pemanggil lama: ambil gambar berdasarkan key.
 * Mengembalikan Buffer dari cache URL, atau gambar kosong 1x1 jika URL belum diisi / belum terunduh.
 */
export function getAssetBuffer(key = "menu") {
  const url = getThumbUrl(key);
  if (!url) return BLANK;
  const hit = cache.get(url);
  if (hit) return hit;
  download(url);
  return BLANK;
}

// ───────── Thumbnail JPEG siap pakai (jpegThumbnail quoted/location) ─────────
// WhatsApp hanya menampilkan jpegThumbnail kalau berupa JPEG kecil. Gambar dari URL bisa PNG/WebP/besar,
// jadi di sini selalu diunduh (ditunggu sampai selesai), diperkecil, dan dijadikan JPEG. Hasil di-cache.
const jpegCache = new Map();
let blankJpeg = null;

async function blankThumb() {
  if (!blankJpeg) {
    blankJpeg = await sharp({ create: { width: 64, height: 64, channels: 3, background: { r: 24, g: 24, b: 32 } } })
      .jpeg()
      .toBuffer();
  }
  return blankJpeg;
}

/**
 * Thumbnail JPEG dari config.thumbUrl[key] (default: "small").
 * Tidak pernah melempar error: kalau URL kosong/gagal diunduh, mengembalikan JPEG polos kecil.
 */
export async function getJpegThumb(key = "small", { width = 300, height = 300, fit = "cover", quality = 80 } = {}) {
  const url = getThumbUrl(key);
  const id = `${url}|${width}x${height}|${fit}|${quality}`;
  if (url && jpegCache.has(id)) return jpegCache.get(id);
  try {
    const raw = url ? await download(url) : null;
    if (!raw) return await blankThumb();
    const out = await sharp(raw).rotate().resize(width, height, { fit, background: "#000000" }).jpeg({ quality }).toBuffer();
    jpegCache.set(id, out);
    return out;
  } catch {
    return await blankThumb();
  }
}
