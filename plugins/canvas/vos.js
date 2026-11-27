/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { getProfileBuffer } from '../../src/lib/core/profile-picture.js';
import { join } from 'node:path';

const EMOJI_FONT = join(process.cwd(), 'assets', 'fonts', 'NotoColorEmoji.ttf');
try { GlobalFonts.registerFromPath(EMOJI_FONT, 'Noto Color Emoji'); } catch (_) {}

// Render emoji separately so normal text never disappears when the color emoji font is used.
const EMOJI_JSON_URL = 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json';
let emojiMap = null;
let emojiLoadPromise = null;

function emojiToUnicode(emoji) {
  return [...emoji].map(c => c.codePointAt(0).toString(16)).join('-');
}

async function loadEmojiMap() {
  if (emojiMap) return emojiMap;
  if (emojiLoadPromise) return emojiLoadPromise;
  emojiLoadPromise = (async () => {
    const axios = (await import('axios')).default;
    const res = await axios.get(EMOJI_JSON_URL, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' }, maxRedirects: 5, timeout: 15000 });
    emojiMap = JSON.parse(Buffer.from(res.data).toString('utf-8'));
    return emojiMap;
  })();
  try { return await emojiLoadPromise; } catch (e) { emojiLoadPromise = null; return null; }
}

function isEmojiSegment(segment) {
  return /\p{Extended_Pictographic}|\p{Emoji_Presentation}/u.test(segment);
}

function graphemes(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(String(text))].map(x => x.segment);
  }
  return [...String(text)];
}

async function getEmojiImage(emoji) {
  const map = await loadEmojiMap();
  const base = emojiToUnicode(emoji);
  const variants = [base, base.replace(/-fe0f/g, ''), base.toUpperCase(), base.replace(/-fe0f/g, '').toUpperCase()];
  for (const v of variants) {
    if (map[v]) return loadImage(Buffer.from(map[v], 'base64'));
  }
  return null;
}

async function measureMixed(ctx, text, fontSize) {
  let width = 0;
  for (const part of graphemes(text)) {
    width += isEmojiSegment(part) ? fontSize * 1.05 : ctx.measureText(part).width;
  }
  return width;
}

async function drawMixedText(ctx, text, centerX, y, fontSize, maxWidth) {
  const parts = graphemes(text);
  const totalWidth = await measureMixed(ctx, text, fontSize);
  let x = centerX - totalWidth / 2;
  const scale = totalWidth > maxWidth ? maxWidth / totalWidth : 1;
  ctx.save();
  if (scale < 1) {
    ctx.translate(centerX, y);
    ctx.scale(scale, scale);
    x = -totalWidth / 2;
    y = 0;
  }
  for (const part of parts) {
    if (isEmojiSegment(part)) {
      const size = fontSize * 1.05;
      const img = await getEmojiImage(part);
      if (img) ctx.drawImage(img, x, y - size / 2, size, size);
      else { ctx.font = `700 ${fontSize}px Arial, 'Noto Color Emoji', sans-serif`; ctx.fillText(part, x, y); ctx.font = `700 ${fontSize}px Arial, sans-serif`; }
      x += size;
    } else {
      ctx.fillText(part, x, y);
      x += ctx.measureText(part).width;
    }
  }
  ctx.restore();
}

const pluginConfig = {
  name: 'vos',
  alias: ['quotevos'],
  category: 'canvas',
  description: 'Membuat kartu kata-kata HD dengan foto profil WhatsApp pengirim.',
  usage: '.vos nama,kata kata',
  example: '.vos Aulia,Jangan menyerah hari ini',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

const W = 1080;
const H = 1920;
const CARD = { x: 50, y: 315, w: 980, h: 1290, r: 52 };
const HEADER_H = 150;
const FOOTER_H = 150;
const CONTENT_Y = CARD.y + HEADER_H;
const CONTENT_H = CARD.h - HEADER_H - FOOTER_H;
const AVATAR = 112;

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function clipRoundRect(ctx, x, y, w, h, r) {
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  const paragraphs = String(text || '').split(/\n/);

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push('');
      continue;
    }

    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) {
        line = test;
        continue;
      }

      if (line) lines.push(line);
      line = '';

      // Break a single word that is wider than the text area.
      for (const ch of word) {
        const testPart = line + ch;
        if (ctx.measureText(testPart).width <= maxWidth || !line) {
          line = testPart;
        } else {
          lines.push(line);
          line = ch;
        }
      }
    }
    if (line) lines.push(line);
  }

  return lines.length ? lines : [''];
}

async function fitQuote(ctx, quote, maxWidth, maxHeight) {
  for (let size = 76; size >= 28; size -= 2) {
    ctx.font = `700 ${size}px Arial, sans-serif`;
    const lines = [];
    for (const paragraph of String(quote || '').split(/\n/)) {
      const words = paragraph.trim().split(/\s+/).filter(Boolean);
      if (!words.length) { lines.push(''); continue; }
      let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (await measureMixed(ctx, test, size) <= maxWidth) { line = test; continue; }
        if (line) lines.push(line);
        line = '';
        for (const ch of graphemes(word)) {
          const part = line + ch;
          if (!line || await measureMixed(ctx, part, size) <= maxWidth) line = part;
          else { lines.push(line); line = ch; }
        }
      }
      if (line) lines.push(line);
    }
    const lineHeight = Math.round(size * 1.22);
    if (lines.length * lineHeight <= maxHeight) return { size, lines, lineHeight };
  }
  ctx.font = '700 28px Arial, sans-serif';
  return { size: 28, lines: [String(quote || '')], lineHeight: 34 };
}

function drawHeart(ctx, cx, cy, size) {
  ctx.save();
  ctx.beginPath();
  const s = size;
  ctx.moveTo(cx, cy + s * 0.36);
  ctx.bezierCurveTo(cx - s * 0.55, cy - s * 0.05, cx - s * 0.52, cy - s * 0.48, cx - s * 0.20, cy - s * 0.48);
  ctx.bezierCurveTo(cx - s * 0.02, cy - s * 0.48, cx, cy - s * 0.31, cx, cy - s * 0.21);
  ctx.bezierCurveTo(cx, cy - s * 0.31, cx + s * 0.02, cy - s * 0.48, cx + s * 0.20, cy - s * 0.48);
  ctx.bezierCurveTo(cx + s * 0.52, cy - s * 0.48, cx + s * 0.55, cy - s * 0.05, cx, cy + s * 0.36);
  ctx.stroke();
  ctx.restore();
}

function drawComment(ctx, cx, cy, size) {
  ctx.save();
  const s = size;
  ctx.beginPath();
  ctx.arc(cx - 3, cy - 3, s * 0.42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.18, cy + s * 0.28);
  ctx.lineTo(cx + s * 0.40, cy + s * 0.48);
  ctx.lineTo(cx + s * 0.33, cy + s * 0.18);
  ctx.stroke();
  ctx.restore();
}

function drawSend(ctx, cx, cy, size) {
  ctx.save();
  const s = size;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.52, cy - s * 0.34);
  ctx.lineTo(cx + s * 0.55, cy);
  ctx.lineTo(cx - s * 0.42, cy + s * 0.48);
  ctx.lineTo(cx - s * 0.12, cy + s * 0.06);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.42, cy + s * 0.48);
  ctx.lineTo(cx - s * 0.28, cy - s * 0.06);
  ctx.lineTo(cx + s * 0.55, cy);
  ctx.stroke();
  ctx.restore();
}

function drawMore(ctx, cx, cy, size) {
  ctx.save();
  const gap = size * 0.34;
  for (const dy of [-gap, 0, gap]) {
    ctx.beginPath();
    ctx.arc(cx, cy + dy, size * 0.075, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

async function drawVos(name, quote, ppBuffer) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background: the sender's PP enlarged and softened, matching the reference style.
  const bg = await loadImage(ppBuffer);
  ctx.save();
  try { ctx.filter = 'blur(28px)'; } catch (_) {}
  const scale = Math.max(W / bg.width, H / bg.height) * 1.12;
  const bw = bg.width * scale;
  const bh = bg.height * scale;
  ctx.drawImage(bg, (W - bw) / 2, (H - bh) / 2, bw, bh);
  ctx.restore();

  ctx.fillStyle = 'rgba(8, 8, 12, 0.55)';
  ctx.fillRect(0, 0, W, H);

  // Card shadow.
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 38;
  ctx.shadowOffsetY = 18;
  roundRect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, CARD.r);
  ctx.fillStyle = '#2d2a30';
  ctx.fill();
  ctx.restore();

  // Header.
  ctx.save();
  clipRoundRect(ctx, CARD.x, CARD.y, CARD.w, HEADER_H + CARD.r, CARD.r);
  ctx.fillStyle = '#2d2a30';
  ctx.fillRect(CARD.x, CARD.y, CARD.w, HEADER_H + CARD.r);
  ctx.restore();

  // White quote area.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(CARD.x, CONTENT_Y, CARD.w, CONTENT_H);

  // Footer.
  ctx.save();
  clipRoundRect(ctx, CARD.x, CARD.y + CARD.h - FOOTER_H - CARD.r, CARD.w, FOOTER_H + CARD.r, CARD.r);
  ctx.fillStyle = '#2d2a30';
  ctx.fillRect(CARD.x, CARD.y + CARD.h - FOOTER_H, CARD.w, FOOTER_H + CARD.r);
  ctx.restore();

  // Avatar.
  const avatarX = CARD.x + 84;
  const avatarY = CARD.y + HEADER_H / 2;
  const avatar = await loadImage(ppBuffer);
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, AVATAR / 2, 0, Math.PI * 2);
  ctx.clip();
  const avatarScale = Math.max(AVATAR / avatar.width, AVATAR / avatar.height);
  const aw = avatar.width * avatarScale;
  const ah = avatar.height * avatarScale;
  ctx.drawImage(avatar, avatarX - aw / 2, avatarY - ah / 2, aw, ah);
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,255,255,0.30)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, AVATAR / 2 + 2, 0, Math.PI * 2);
  ctx.stroke();

  // Name.
  const nameX = avatarX + AVATAR / 2 + 35;
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 52px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  let displayName = String(name).trim();
  while (ctx.measureText(displayName).width > CARD.w - (nameX - CARD.x) - 60 && displayName.length > 3) {
    displayName = displayName.slice(0, -2).trim() + '…';
  }
  const nameMaxWidth = CARD.w - (nameX - CARD.x) - 60;
  const nameWidth = Math.min(await measureMixed(ctx, displayName, 52), nameMaxWidth);
  // Keep the name left-aligned beside the avatar, matching the reference layout.
  await drawMixedText(ctx, displayName, nameX + nameWidth / 2, avatarY + 2, 52, nameMaxWidth);

  // Quote.
  const quoteArea = { x: CARD.x + 90, y: CONTENT_Y + 65, w: CARD.w - 180, h: CONTENT_H - 130 };
  const fitted = await fitQuote(ctx, quote, quoteArea.w, quoteArea.h);
  ctx.fillStyle = '#090909';
  ctx.font = `700 ${fitted.size}px Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const total = fitted.lines.length * fitted.lineHeight;
  let y = quoteArea.y + quoteArea.h / 2 - total / 2 + fitted.lineHeight / 2;
  for (const line of fitted.lines) {
    await drawMixedText(ctx, line, quoteArea.x + quoteArea.w / 2, y, fitted.size, quoteArea.w);
    y += fitted.lineHeight;
  }

  // Instagram-like footer icons.
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const iconY = CARD.y + CARD.h - FOOTER_H / 2;
  drawHeart(ctx, CARD.x + 120, iconY, 58);
  drawComment(ctx, CARD.x + 350, iconY, 58);
  drawSend(ctx, CARD.x + 590, iconY, 58);
  drawMore(ctx, CARD.x + 875, iconY, 58);

  return canvas.encode('png');
}

async function handler(m, { sock, text }) {
  const input = String(text || '').trim();
  if (!input || !input.includes(',')) {
    return m.reply(
      `❌ *¡Formato VOS incorrecto!*\n\n` +
      `VOS debe usar el formato:*\n` +
      `> ${m.prefix}vos nombres, palabras\n\n` +
      `*Ejemplo correcto:*\n` +
      `> ${m.prefix}vos Jack, simplemente me haces sentir inferior 🔥\n\n` +
      `_Si no utiliza una coma (,) después del nombre, VOS no se procesará._`
    );
  }

  const comma = input.indexOf(',');
  const name = input.slice(0, comma).trim();
  const quote = input.slice(comma + 1).trim();

  if (!name || !quote) {
    return m.reply(`❌ *¡Formato VOS incorrecto!*\n\nUsar:\n> ${m.prefix}vos nombres, palabras\n\nEjemplo:\n> ${m.prefix}vos Jack, simplemente me haces sentir inferior 🔥`);
  }

  if (quote.length > 420) {
    return m.reply('❌ Las palabras son demasiado largas. Máximo 420 caracteres para mantener la imagen clara.');
  }

  await m.react('🕕');
  try {
    let ppBuffer = await getProfileBuffer(sock, m.sender);

    // Jika PP gagal diambil, gunakan gambar default agar VOS tetap bisa dibuat.
    if (!ppBuffer) {
      const fallback = 'https://i.ibb.co.com/QFzm9pSF/1546d15ce5dd2946573b3506df109d00.jpg';
      const { f } = await import('../../src/lib/core/http.js');
      const res = await f(fallback, 'buffer');
      ppBuffer = res ? Buffer.from(res) : null;
    }

    const result = await drawVos(name, quote, ppBuffer);
    await sock.sendMedia(m.chat, result, null, m, { type: 'image' });
    await m.react('✅');
  } catch (error) {
    console.error('[VOS] Error:', error?.stack || error);
    await m.react('❌');
    await m.reply('❌ No se pudo crear la imagen VOS. Inténtalo de nuevo en un momento.');
  }
}

export { pluginConfig as config, handler };
