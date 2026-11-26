/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { GlobalFonts } from '@napi-rs/canvas';

const EMOJI_FONT = join(process.cwd(), 'assets', 'fonts', 'NotoColorEmoji.ttf');
try { GlobalFonts.registerFromPath(EMOJI_FONT, 'Noto Color Emoji'); } catch (_) {}

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
    const res = await axios.get(EMOJI_JSON_URL, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      maxRedirects: 5,
      timeout: 15000,
    });
    emojiMap = JSON.parse(Buffer.from(res.data).toString('utf-8'));
    return emojiMap;
  })();
  try { return await emojiLoadPromise; } catch (e) { emojiLoadPromise = null; throw e; }
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
  const parts = graphemes(text);
  let width = 0;
  for (const part of parts) {
    if (isEmojiSegment(part)) width += fontSize * 1.05;
    else width += ctx.measureText(part).width;
  }
  return width;
}

async function drawMixedText(ctx, text, x, y, fontSize) {
  const parts = graphemes(text);
  let currentX = x;
  ctx.textBaseline = 'middle';
  for (const part of parts) {
    if (isEmojiSegment(part)) {
      const size = fontSize * 1.05;
      const img = await getEmojiImage(part);
      if (img) {
        ctx.drawImage(img, currentX, y - size / 2, size, size);
      } else {
        ctx.fillText(part, currentX, y);
      }
      currentX += size;
    } else {
      ctx.fillText(part, currentX, y);
      currentX += ctx.measureText(part).width;
    }
  }
  return currentX;
}

const pluginConfig = {
  name: 'vosv2',
  alias: ['vos2'],
  category: "maker",
  description: 'Membuat gambar kata-kata tema Windows Media Player HD tanpa nama dan foto profil.',
  usage: '.vosv2 isi kata kata',
  example: '.vosv2 Jangan menyerah, terus melangkah!',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

const TEMPLATE = join(process.cwd(), 'assets', 'vosv2-template.jpg');
const W = 886;
const H = 1536;

let templateCache = null;

async function getTemplate() {
  if (!templateCache) templateCache = await readFile(TEMPLATE);
  return templateCache;
}

async function wrapText(ctx, text, maxWidth, fontSize) {
  const paragraphs = String(text || '').split(/\n/);
  const lines = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push('');
      continue;
    }

    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (await measureMixed(ctx, test, fontSize) <= maxWidth) {
        line = test;
        continue;
      }

      if (line) lines.push(line);
      line = '';

      for (const ch of graphemes(word)) {
        const part = line + ch;
        if (!line || await measureMixed(ctx, part, fontSize) <= maxWidth) {
          line = part;
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

async function fitQuote(ctx, quote) {
  const maxWidth = 390;
  const maxHeight = 370;

  for (let size = 78; size >= 34; size -= 2) {
    ctx.font = `700 ${size}px Arial, sans-serif`;
    const lines = await wrapText(ctx, quote, maxWidth, size);
    const lineHeight = Math.round(size * 1.18);
    if (lines.length * lineHeight <= maxHeight) {
      return { size, lines, lineHeight };
    }
  }

  ctx.font = '700 34px Arial, sans-serif';
  return {
    size: 34,
    lines: await wrapText(ctx, quote, maxWidth, 34),
    lineHeight: 40,
  };
}

async function drawVosv2(quote) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const template = await loadImage(await getTemplate());

  ctx.drawImage(template, 0, 0, W, H);

  const fitted = await fitQuote(ctx, quote);
  ctx.fillStyle = '#050505';
  ctx.font = `700 ${fitted.size}px Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const x = 120;
  const areaY = 655;
  const areaH = 275;
  const total = fitted.lines.length * fitted.lineHeight;
  let y = areaY + areaH / 2 - total / 2 + fitted.lineHeight / 2;

  for (const line of fitted.lines) {
    await drawMixedText(ctx, line, x, y, fitted.size);
    y += fitted.lineHeight;
  }

  return canvas.encode('png');
}

async function handler(m, { sock, text }) {
  const quote = String(text || '').trim();
  if (!quote) {
    return m.reply(
      `🖼️ *VOSV2 HD*\n\n` +
      `Crea una imagen de texto con el tema de Windows Media Player.\n\n` +
      `*Format:*\n> ${m.prefix}vosv2 tu texto\n\n` +
      `*Ejemplo:*\n> ${m.prefix}vosv2 ¡No te rindas, sigue adelante!\n\n` +
      `_No usa nombre ni foto de perfil._`
    );
  }

  if (quote.length > 500) {
    return m.reply('❌ El texto es demasiado largo. Máximo 500 caracteres para que se vea claro en la imagen.');
  }

  await m.react('🕕');
  try {
    const result = await drawVosv2(quote);
    await sock.sendMedia(m.chat, result, null, m, { type: 'image' });
    await m.react('✅');
  } catch (error) {
    console.error('[VOSV2] Error:', error?.stack || error);
    await m.react('❌');
    await m.reply('❌ No se pudo crear la imagen VOSV2. Inténtalo de nuevo en un momento.');
  }
}

export { pluginConfig as config, handler }
