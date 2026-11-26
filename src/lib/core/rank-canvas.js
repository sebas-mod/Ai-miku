/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
// Canvas untuk: levelup, boostexp, leaderboard, toplevel, ranklist.
// Latar = file jpg lokal (thumbFile di src/settings/thumbnail.js), di-crop "cover" ke thumbSize[key].
import fs from "fs";
import path from "path";
import thumbnailSettings from "../../settings/thumbnail.js";
const { thumbFile, thumbSize } = thumbnailSettings;

// ───────── Library & font ─────────
let _lib = null;
async function lib() {
  if (_lib) return _lib;
  const mod = await import("@napi-rs/canvas");
  const dir = path.resolve(process.cwd(), "src/assets/fonts");
  try {
    for (const file of ["Inter-Regular.otf", "Inter-Bold.otf", "Inter-ExtraBold.otf"]) {
      const p = path.join(dir, file);
      if (fs.existsSync(p)) mod.GlobalFonts.registerFromPath(p, "ElysiaSans");
    }
  } catch {}
  _lib = mod;
  return mod;
}

const FONT = '"ElysiaSans", "Inter", "DejaVu Sans", sans-serif';
const f = (size, weight = "bold") => `${weight} ${size}px ${FONT}`;

const GOLD = "#f5c451";
const SILVER = "#cbd5e1";
const BRONZE = "#d08a4e";
const CYAN = "#5eead4";
const PURPLE = "#a78bfa";

// ───────── Format & teks ─────────
const EMOJI_RE = /[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200d\u20e3]/gu;

export function cleanText(s, fallback = "Petualang") {
  const t = String(s ?? "").replace(EMOJI_RE, "").replace(/\s+/g, " ").trim();
  return t || fallback;
}

export function fmtInt(n) {
  return Math.floor(Number(n) || 0).toLocaleString("id-ID");
}

export function fmtCompact(n) {
  n = Number(n) || 0;
  const units = [
    [1e15, "Q"],
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [v, u] of units) {
    if (Math.abs(n) >= v) return (n / v).toFixed(1).replace(/\.0$/, "") + u;
  }
  return fmtInt(n);
}

export function fmtMoney(n) {
  n = Number(n) || 0;
  return "Rp " + (n >= 1e12 ? fmtCompact(n) : fmtInt(n));
}

function fitText(ctx, text, maxW, size, weight = "bold", min = 16) {
  let s = size;
  ctx.font = f(s, weight);
  while (s > min && ctx.measureText(text).width > maxW) {
    s -= 2;
    ctx.font = f(s, weight);
  }
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}

function text(ctx, str, x, y, { size = 28, weight = "bold", color = "#fff", align = "left", maxW = 0, shadow = false } = {}) {
  ctx.save();
  ctx.font = f(size, weight);
  const out = maxW ? fitText(ctx, str, maxW, size, weight) : str;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  if (shadow) {
    ctx.shadowColor = typeof shadow === "string" ? shadow : "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 16;
  }
  ctx.fillText(out, x, y);
  ctx.restore();
  return out;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function panel(ctx, x, y, w, h, r, fill, stroke, lineWidth = 2) {
  ctx.save();
  rr(ctx, x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

function star(ctx, cx, cy, R, filled, color = GOLD) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? R : R * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function lockIcon(ctx, cx, cy, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy - 4, 7, Math.PI, 0);
  ctx.stroke();
  rr(ctx, cx - 10, cy - 3, 20, 15, 4);
  ctx.fill();
  ctx.restore();
}

function checkIcon(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#07211d";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.45, cy);
  ctx.lineTo(cx - r * 0.1, cy + r * 0.38);
  ctx.lineTo(cx + r * 0.5, cy - r * 0.35);
  ctx.stroke();
  ctx.restore();
}

function arrow(ctx, x, cy, len, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, cy);
  ctx.lineTo(x + len - 18, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + len, cy);
  ctx.lineTo(x + len - 30, cy - 24);
  ctx.lineTo(x + len - 30, cy + 24);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function progressBar(ctx, x, y, w, h, pct, c1, c2) {
  panel(ctx, x, y, w, h, h / 2, "rgba(255,255,255,0.14)");
  const fw = Math.max(h, (w * Math.min(100, Math.max(0, pct))) / 100);
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  panel(ctx, x, y, fw, h, h / 2, g);
}

// ───────── Gambar: latar & avatar ─────────
const _bgCache = new Map();
function backgroundBuffer(key) {
  if (_bgCache.has(key)) return _bgCache.get(key);
  let buf = null;
  try {
    const src = thumbFile[key];
    if (src) buf = fs.readFileSync(path.resolve(process.cwd(), src));
  } catch {}
  _bgCache.set(key, buf);
  return buf;
}

async function baseCanvas(key, overlay = 0.3) {
  const { createCanvas, loadImage } = await lib();
  const { width: w, height: h } = thumbSize[key];
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");

  let img = null;
  const buf = backgroundBuffer(key);
  if (buf) {
    try {
      img = await loadImage(buf);
    } catch {}
  }
  if (img) {
    const s = Math.max(w / img.width, h / img.height);
    const iw = img.width * s;
    const ih = img.height * s;
    ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
  } else {
    const g = ctx.createLinearGradient(0, 0, w * 0.4, h);
    g.addColorStop(0, "#1a1240");
    g.addColorStop(1, "#07061a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.fillStyle = `rgba(6,5,20,${overlay})`;
  ctx.fillRect(0, 0, w, h);
  return { canvas, ctx, w, h };
}

async function toImage(buf) {
  if (!buf) return null;
  try {
    const { loadImage } = await lib();
    return await loadImage(buf);
  } catch {
    return null;
  }
}

function drawAvatar(ctx, img, cx, cy, r, ring, ringW = 6) {
  ctx.save();
  ctx.shadowColor = ring;
  ctx.shadowBlur = 24;
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(cx, cy, r + ringW, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  if (img) {
    const s = Math.max((2 * r) / img.width, (2 * r) / img.height);
    const w = img.width * s;
    const h = img.height * s;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  } else {
    const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, "#d9dde3");
    g.addColorStop(1, "#aeb4bd");
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.15, r * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.95, r * 0.65, r * 0.6, 0, Math.PI, 0);
    ctx.fill();
  }
  ctx.restore();
}

function toBuffer(canvas) {
  return canvas.toBuffer("image/jpeg", 90);
}

// ───────── Avatar pengguna (pp -> fallback pp kosong) ─────────
/** Foto profil kosong: thumb "ppKosong", kalau gagal pakai siluet buatan lokal. */
export async function getBlankAvatar() {
  try {
    const media = await import("./media.js");
    const buf = await media.fetchThumb("ppKosong", false);
    if (buf && buf.length > 200) return buf;
  } catch {}
  try {
    const mod = await import("./asset-manager.js");
    return mod.getAssetBuffer("pp-kosong");
  } catch {}
  return null;
}

/** Foto profil user sebagai Buffer. Tidak punya pp / gagal -> pp kosong. Tidak pernah throw. */
export async function getUserAvatar(sock, jid) {
  try {
    if (jid && sock) {
      const id = String(jid).includes("@") ? jid : `${jid}@s.whatsapp.net`;
      const pp = await import("./profile-picture.js");
      const url = await pp.getProfilePicture(sock, id);
      if (url && url !== pp.DEFAULT_PP) {
        const axios = (await import("axios")).default;
        const res = await axios.get(url, {
          responseType: "arraybuffer",
          timeout: 8000,
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        const buf = Buffer.from(res.data);
        if (buf.length > 200) return buf;
      }
    }
  } catch {}
  return getBlankAvatar();
}

// ───────── 1. LEVEL UP ─────────
export async function renderLevelUp({
  name,
  avatar,
  oldLevel,
  newLevel,
  rankTitle = "",
  stars = 1,
  koinBonus = 0,
  energiBonus = 0,
  expInLevel = 0,
  expNeeded = 1,
  botName = "Elysia Assistant",
}) {
  const { canvas, ctx, w, h } = await baseCanvas("levelup");
  panel(ctx, 40, 40, w - 80, h - 80, 30, "rgba(10,8,30,0.58)", "rgba(245,196,81,0.55)", 3);

  drawAvatar(ctx, await toImage(avatar), 235, 315, 135, GOLD, 8);

  const X = 440;
  text(ctx, "LEVEL UP!", X, 112, { size: 32, weight: "800", color: GOLD });
  text(ctx, cleanText(name), X, 176, { size: 56, weight: "800", maxW: 700, shadow: true });

  // angka level lama -> baru (diskalakan supaya selalu muat)
  const oldS = String(oldLevel);
  const newS = String(newLevel);
  let kOld = 110;
  let kNew = 175;
  const measure = () => {
    ctx.font = f(kOld, "800");
    const a = ctx.measureText(oldS).width;
    ctx.font = f(kNew, "800");
    const b = ctx.measureText(newS).width;
    return a + b + 80 + 70;
  };
  while (measure() > 700 && kNew > 70) {
    kOld -= 6;
    kNew -= 10;
  }
  ctx.font = f(kOld, "800");
  const wOld = ctx.measureText(oldS).width;
  text(ctx, "LEVEL", X, 232, { size: 22, weight: "bold", color: "rgba(255,255,255,0.6)" });
  const baseY = 340;
  text(ctx, oldS, X, baseY, { size: kOld, weight: "800", color: "rgba(255,255,255,0.45)" });
  const ax = X + wOld + 30;
  arrow(ctx, ax, baseY - kNew * 0.33, 80, GOLD);
  text(ctx, newS, ax + 80 + 30, baseY, { size: kNew, weight: "800", color: GOLD, shadow: "rgba(245,196,81,0.7)" });

  // pangkat + bintang
  const title = cleanText(rankTitle, "");
  const tw = text(ctx, title, X, 398, { size: 30, weight: "bold", color: "#d7ccff", maxW: 520 });
  ctx.font = f(30, "bold");
  const sx = X + ctx.measureText(tw).width + 30;
  for (let i = 0; i < 5; i++) star(ctx, sx + i * 32 + 14, 389, 13, i < stars);

  // hadiah
  const chip = (cx, label) => {
    ctx.font = f(26, "bold");
    const cw = ctx.measureText(label).width + 48;
    panel(ctx, cx, 424, cw, 50, 25, "rgba(255,255,255,0.1)", "rgba(255,255,255,0.22)", 2);
    text(ctx, label, cx + 24, 458, { size: 26, weight: "bold", color: "#fff" });
    return cx + cw + 16;
  };
  let nx = chip(X, `+Rp ${fmtInt(koinBonus)}`);
  chip(nx, `+${fmtInt(energiBonus)} Energi`);

  // progress ke level berikutnya
  const pct = Math.min(100, Math.floor((expInLevel / Math.max(1, expNeeded)) * 100));
  progressBar(ctx, X, 505, 700, 24, pct, "#b8860b", GOLD);
  text(ctx, `EXP ${fmtInt(expInLevel)} / ${fmtInt(expNeeded)}  •  ${pct}%`, X, 566, {
    size: 24,
    weight: "bold",
    color: "rgba(255,255,255,0.8)",
  });
  text(ctx, cleanText(botName, ""), w - 70, 566, { size: 22, weight: "bold", color: "rgba(255,255,255,0.45)", align: "right" });

  return toBuffer(canvas);
}

// ───────── 2. BOOST EXP ─────────
export async function renderBoostExp({
  name,
  avatar,
  expGain,
  isCrit = false,
  totalExp = 0,
  level = 1,
  rankTitle = "",
  expInLevel = 0,
  expNeeded = 1,
  leveledUp = false,
  newLevel = level,
  botName = "Elysia Assistant",
}) {
  const { canvas, ctx, w, h } = await baseCanvas("boostexp");
  panel(ctx, 40, 40, w - 80, h - 80, 30, "rgba(8,16,28,0.58)", "rgba(94,234,212,0.55)", 3);

  drawAvatar(ctx, await toImage(avatar), 235, 315, 135, CYAN, 8);

  const X = 440;
  text(ctx, "ASTRAL TRAINING", X, 112, { size: 32, weight: "800", color: CYAN });
  text(ctx, cleanText(name), X, 176, { size: 56, weight: "800", maxW: leveledUp ? 470 : 700, shadow: true });

  if (leveledUp) {
    panel(ctx, 930, 128, 210, 56, 28, GOLD);
    text(ctx, `LEVEL UP! Lv.${newLevel}`, 1035, 166, { size: 24, weight: "800", color: "#2a1d00", align: "center", maxW: 190 });
  }

  const gain = `+${fmtInt(expGain)}`;
  let gs = 140;
  ctx.font = f(gs, "800");
  while (ctx.measureText(gain).width > 540 && gs > 60) {
    gs -= 8;
    ctx.font = f(gs, "800");
  }
  const gw = ctx.measureText(gain).width;
  text(ctx, gain, X, 330, { size: gs, weight: "800", color: CYAN, shadow: "rgba(94,234,212,0.7)" });
  text(ctx, "EXP", X + gw + 20, 330, { size: 48, weight: "800", color: "#fff" });

  if (isCrit) {
    panel(ctx, X, 352, 330, 46, 23, GOLD);
    text(ctx, "RESONANSI SEMPURNA  x2", X + 165, 384, { size: 22, weight: "800", color: "#2a1d00", align: "center" });
  }

  text(ctx, `Lv.${level}  •  ${cleanText(rankTitle, "")}`, X, 440, { size: 30, weight: "bold", color: "#c9fff4", maxW: 700 });
  text(ctx, `Total EXP ${fmtInt(totalExp)} XP`, X, 478, { size: 24, weight: "bold", color: "rgba(255,255,255,0.7)" });

  const pct = Math.min(100, Math.floor((expInLevel / Math.max(1, expNeeded)) * 100));
  progressBar(ctx, X, 505, 700, 24, pct, "#0f766e", CYAN);
  text(ctx, `EXP ${fmtInt(expInLevel)} / ${fmtInt(expNeeded)}  •  ${pct}%`, X, 566, {
    size: 24,
    weight: "bold",
    color: "rgba(255,255,255,0.8)",
  });
  text(ctx, cleanText(botName, ""), w - 70, 566, { size: 22, weight: "bold", color: "rgba(255,255,255,0.45)", align: "right" });

  return toBuffer(canvas);
}

// ───────── 3. TOP 10 (leaderboard & toplevel) ─────────
/**
 * rows: [{ name, avatar(Buffer), main, mainLabel, sub, isMe }]  (maks 10)
 * key : "leaderboard" | "toplevel"
 */
export async function renderTop10({
  key = "leaderboard",
  title,
  subtitle = "",
  rows = [],
  accent = GOLD,
  me = null,
  botName = "Elysia Assistant",
}) {
  const { canvas, ctx, w, h } = await baseCanvas(key);

  text(ctx, title, w / 2, 120, { size: 66, weight: "800", color: accent, align: "center", maxW: 940, shadow: true });
  if (subtitle) text(ctx, subtitle, w / 2, 172, { size: 28, weight: "bold", color: "rgba(255,255,255,0.75)", align: "center", maxW: 940 });

  const g = ctx.createLinearGradient(100, 0, w - 100, 0);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.5, accent);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(100, 205, w - 200, 3);

  const y0 = 245;
  const step = 118;
  const medal = [GOLD, SILVER, BRONZE];
  const images = await Promise.all(rows.slice(0, 10).map((r) => toImage(r.avatar)));

  for (let i = 0; i < 10; i++) {
    const y = y0 + i * step;
    const r = rows[i];
    const col = medal[i] || "rgba(255,255,255,0.18)";

    if (!r) {
      panel(ctx, 40, y, 1000, 106, 24, "rgba(255,255,255,0.03)", "rgba(255,255,255,0.08)", 2);
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.beginPath();
      ctx.arc(105, y + 53, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      text(ctx, String(i + 1), 105, y + 65, { size: 34, weight: "800", color: "rgba(255,255,255,0.35)", align: "center" });
      text(ctx, "Belum ada", 268, y + 64, { size: 30, weight: "bold", color: "rgba(255,255,255,0.3)" });
      continue;
    }

    panel(
      ctx,
      40,
      y,
      1000,
      106,
      24,
      i < 3 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
      r.isMe ? CYAN : i < 3 ? col : "rgba(255,255,255,0.1)",
      r.isMe ? 4 : 2,
    );

    ctx.save();
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(105, y + 53, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    text(ctx, String(i + 1), 105, y + 65, { size: 34, weight: "800", color: i < 3 ? "#1a1030" : "#fff", align: "center" });

    drawAvatar(ctx, images[i], 205, y + 53, 40, i < 3 ? col : "rgba(255,255,255,0.35)", 4);

    text(ctx, cleanText(r.name, "Petualang") + (r.isMe ? "  (Kamu)" : ""), 268, y + 48, { size: 36, weight: "bold", maxW: 425 });
    if (r.sub) text(ctx, cleanText(r.sub, ""), 268, y + 84, { size: 24, weight: "bold", color: "rgba(255,255,255,0.62)", maxW: 425 });

    text(ctx, r.main, 1005, y + 56, { size: 40, weight: "800", color: accent, align: "right", maxW: 300 });
    if (r.mainLabel) text(ctx, r.mainLabel, 1005, y + 88, { size: 22, weight: "bold", color: "rgba(255,255,255,0.62)", align: "right", maxW: 300 });
  }

  const fy = y0 + 10 * step + 20;
  if (me) {
    text(ctx, me.rank ? `Posisi kamu: #${fmtInt(me.rank)} dari ${fmtInt(me.total)} petualang` : `Kamu belum masuk peringkat  •  ${fmtInt(me.total)} petualang`, w / 2, fy + 32, {
      size: 32,
      weight: "800",
      color: "#fff",
      align: "center",
      maxW: 940,
    });
  }
  text(ctx, cleanText(botName, ""), w / 2, h - 40, { size: 22, weight: "bold", color: "rgba(255,255,255,0.4)", align: "center" });

  return toBuffer(canvas);
}

// ───────── 4. RANK LIST ─────────
/** ranks: urut dari pangkat terendah ke tertinggi: [{ title, min, bonusKoin, bonusEnergi }] */
export async function renderRankList({
  name,
  avatar,
  myLevel = 1,
  ranks = [],
  botName = "Elysia Assistant",
}) {
  const { canvas, ctx, w, h } = await baseCanvas("ranklist");

  drawAvatar(ctx, await toImage(avatar), 115, 112, 52, CYAN, 5);
  text(ctx, "KATALOG PANGKAT ASTRAL", 195, 108, { size: 52, weight: "800", color: CYAN, maxW: 960, shadow: true });

  let curIdx = -1;
  ranks.forEach((r, i) => {
    if (myLevel >= r.min) curIdx = i;
  });
  const curTitle = curIdx >= 0 ? cleanText(ranks[curIdx].title, "") : "-";
  text(ctx, `${cleanText(name)}  •  Lv.${myLevel}  •  ${curTitle}`, 195, 158, {
    size: 28,
    weight: "bold",
    color: "rgba(255,255,255,0.78)",
    maxW: 960,
  });

  const g = ctx.createLinearGradient(100, 0, w - 100, 0);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.5, CYAN);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(100, 205, w - 200, 3);

  const cols = 3;
  const cw = 360;
  const ch = 150;
  const gx = 20;
  const gy = 16;
  const x0 = 40;
  const y0 = 235;

  ranks.forEach((r, i) => {
    const x = x0 + (i % cols) * (cw + gx);
    const y = y0 + Math.floor(i / cols) * (ch + gy);
    const unlocked = myLevel >= r.min;
    const current = i === curIdx;

    panel(
      ctx,
      x,
      y,
      cw,
      ch,
      22,
      current ? "rgba(245,196,81,0.16)" : unlocked ? "rgba(94,234,212,0.12)" : "rgba(255,255,255,0.05)",
      current ? GOLD : unlocked ? "rgba(94,234,212,0.55)" : "rgba(255,255,255,0.12)",
      current ? 4 : 2,
    );

    const main = unlocked ? "#fff" : "rgba(255,255,255,0.5)";
    text(ctx, cleanText(r.title, "-"), x + 22, y + 52, { size: 28, weight: "800", color: main, maxW: 255 });
    text(ctx, `Min. Lv.${r.min}`, x + 22, y + 90, { size: 24, weight: "bold", color: unlocked ? CYAN : "rgba(255,255,255,0.4)" });
    text(ctx, `+Rp ${fmtCompact(r.bonusKoin)}  •  +${r.bonusEnergi} Energi`, x + 22, y + 124, {
      size: 21,
      weight: "bold",
      color: unlocked ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)",
      maxW: cw - 44,
    });

    if (current) {
      panel(ctx, x + cw - 98, y + 16, 82, 32, 16, GOLD);
      text(ctx, "KAMU", x + cw - 57, y + 39, { size: 18, weight: "800", color: "#2a1d00", align: "center" });
    } else if (unlocked) {
      checkIcon(ctx, x + cw - 34, y + 34, 16, CYAN);
    } else {
      lockIcon(ctx, x + cw - 34, y + 34, "rgba(255,255,255,0.4)");
    }
  });

  const rows = Math.ceil(ranks.length / cols);
  const fy = y0 + rows * (ch + gy) + 30;
  const open = ranks.filter((r) => myLevel >= r.min).length;
  text(ctx, `Terbuka ${open} dari ${ranks.length} pangkat  •  naikkan level lewat RPG & claimlevel`, w / 2, fy, {
    size: 28,
    weight: "bold",
    color: "#fff",
    align: "center",
    maxW: 1100,
  });
  text(ctx, cleanText(botName, ""), w / 2, h - 40, { size: 22, weight: "bold", color: "rgba(255,255,255,0.4)", align: "center" });

  return toBuffer(canvas);
}
