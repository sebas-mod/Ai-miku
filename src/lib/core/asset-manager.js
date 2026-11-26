/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { createCanvas } from "@napi-rs/canvas";
import { getAssetBuffer as getThumbBuffer } from "./media.js";

// Pemetaan nama aset lama -> key thumbUrl di config.js
const KEY_MAP = {
  "vemzo-allmenu": "allmenu",
  "vemzo-menu": "menu",
  "vemzo-small": "small",
};

let defaultAvatar = null;

/** Foto profil kosong (siluet abu-abu), digambar lokal supaya tidak bergantung pada URL. */
function makeDefaultAvatar() {
  const size = 512;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, "#d9dde3");
  bg.addColorStop(1, "#aeb4bd");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.38, size * 0.19, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size / 2, size * 0.92, size * 0.34, size * 0.3, 0, Math.PI, 0);
  ctx.fill();
  return canvas.toBuffer("image/png");
}

/**
 * Ambil aset berdasarkan nama. Selalu mengembalikan Buffer.
 *  - "pp-kosong"  : foto profil kosong buatan lokal
 *  - lainnya      : thumbnail dari config.thumbUrl (lihat media.js)
 */
export function getAssetBuffer(name = "default") {
  if (name === "pp-kosong") {
    if (!defaultAvatar) defaultAvatar = makeDefaultAvatar();
    return defaultAvatar;
  }
  return getThumbBuffer(KEY_MAP[name] || name);
}

export default { getAssetBuffer };
