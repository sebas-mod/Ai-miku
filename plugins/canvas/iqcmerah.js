/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '../..');
const TEMPLATE_PATH = join(ROOT_DIR, 'assets', 'image', 'iqcmerah-template.png');
const TEMP_DIR = join(process.cwd(), 'temp');

// WEmoji/Apple-style emoji source used by VOSV2 in this bot.
const EMOJI_JSON_URL = 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json';
let emojiMap = null;
let emojiMapPromise = null;
const emojiImageCache = new Map();

const pluginConfig = {
    name: 'iqcmerah',
    alias: ['iqc-red', 'rediqc'],
    category: 'canvas',
    description: 'Membuat Fake Quote iOS style tema merah, teks panjang + WEmoji.',
    usage: '.iqcmerah [teks/reply]',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true,
};

let fontsLoaded = false;
let templateBuffer = null;

function registerFonts() {
    if (fontsLoaded) return;

    const candidates = [
        join(ROOT_DIR, 'assets', 'fonts', 'kalender', 'Inter-Regular.woff2'),
        join(ROOT_DIR, 'assets', 'fonts', 'kalender', 'Inter-Medium.woff2'),
        join(ROOT_DIR, 'assets', 'fonts', 'kalender', 'Inter-SemiBold.woff2'),
        join(ROOT_DIR, 'data', 'Roboto_Medium.ttf'),
    ];

    for (const fontPath of candidates) {
        if (existsSync(fontPath)) {
            try {
                const family = fontPath.toLowerCase().includes('roboto') ? 'Roboto' : 'Inter';
                GlobalFonts.registerFromPath(fontPath, family);
            } catch (e) {
                console.warn('[iqcmerah] gagal register font:', fontPath, e?.message || e);
            }
        }
    }

    fontsLoaded = true;
}

function getMessageTime(m) {
    let ts = m?.messageTimestamp;
    if (ts && typeof ts === 'object' && ts.low !== undefined) ts = ts.low;
    ts = Number(ts) * 1000;
    const date = Number.isFinite(ts) && ts > 0 ? new Date(ts) : new Date();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}.${minutes}`;
}

function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function graphemes(text) {
    const value = String(text ?? '');
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        return [...new Intl.Segmenter('id', { granularity: 'grapheme' }).segment(value)]
            .map(x => x.segment);
    }
    return [...value];
}

function isEmojiSegment(segment) {
    return /\p{Extended_Pictographic}|\p{Emoji_Presentation}/u.test(segment);
}

function emojiToUnicode(emoji) {
    return graphemes(emoji)
        .map(c => c.codePointAt(0).toString(16))
        .join('-');
}

async function loadEmojiMap() {
    if (emojiMap) return emojiMap;
    if (emojiMapPromise) return emojiMapPromise;

    emojiMapPromise = (async () => {
        try {
            const axios = (await import('axios')).default;
            const response = await axios.get(EMOJI_JSON_URL, {
                responseType: 'arraybuffer',
                headers: { 'User-Agent': 'Mozilla/5.0' },
                maxRedirects: 5,
                timeout: 15000,
            });
            emojiMap = JSON.parse(Buffer.from(response.data).toString('utf8'));
        } catch (error) {
            console.warn('[iqcmerah] WEmoji map gagal dimuat:', error?.message || error);
            emojiMap = null;
        }
        return emojiMap;
    })();

    try {
        return await emojiMapPromise;
    } finally {
        emojiMapPromise = null;
    }
}

async function getEmojiImage(emoji) {
    if (emojiImageCache.has(emoji)) return emojiImageCache.get(emoji);

    const promise = (async () => {
        const key = emojiToUnicode(emoji);
        const map = await loadEmojiMap();
        const variants = [
            key,
            key.replace(/-fe0f/g, ''),
            key.toUpperCase(),
            key.replace(/-fe0f/g, '').toUpperCase(),
        ];

        for (const variant of variants) {
            const value = map?.[variant];
            if (!value) continue;
            try {
                if (typeof value === 'string' && value.startsWith('data:image/')) {
                    return await loadImage(Buffer.from(value.split(',')[1], 'base64'));
                }
                if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
                    const axios = (await import('axios')).default;
                    const r = await axios.get(value, { responseType: 'arraybuffer', timeout: 10000 });
                    return await loadImage(Buffer.from(r.data));
                }
                if (typeof value === 'string') {
                    return await loadImage(Buffer.from(value, 'base64'));
                }
            } catch {}
        }

        // Fallback: Twemoji PNG, so common WhatsApp emoji don't become squares.
        try {
            const axios = (await import('axios')).default;
            const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${key.replace(/-fe0f/g, '')}.png`;
            const r = await axios.get(url, {
                responseType: 'arraybuffer',
                headers: { 'User-Agent': 'Mozilla/5.0' },
                timeout: 10000,
            });
            return await loadImage(Buffer.from(r.data));
        } catch {
            return null;
        }
    })();

    emojiImageCache.set(emoji, promise);
    return promise;
}

async function measureMixedText(ctx, text, fontSize) {
    let width = 0;
    for (const part of graphemes(text)) {
        if (isEmojiSegment(part)) {
            width += fontSize * 1.06;
        } else {
            width += ctx.measureText(part).width;
        }
    }
    return width;
}

async function drawMixedText(ctx, text, x, baselineY, fontSize) {
    let currentX = x;
    ctx.textBaseline = 'alphabetic';

    for (const part of graphemes(text)) {
        if (isEmojiSegment(part)) {
            const size = Math.round(fontSize * 1.06);
            const image = await getEmojiImage(part);
            if (image) {
                ctx.drawImage(image, currentX, baselineY - size + 4, size, size);
            } else {
                ctx.fillText(part, currentX, baselineY);
            }
            currentX += size;
        } else {
            ctx.fillText(part, currentX, baselineY);
            currentX += ctx.measureText(part).width;
        }
    }

    return currentX;
}

async function wrapMixedText(ctx, text, maxWidth, fontSize) {
    const lines = [];
    const paragraphs = String(text || '').replace(/\r/g, '').split('\n');

    for (const paragraph of paragraphs) {
        const words = paragraph.split(/\s+/).filter(Boolean);
        if (!words.length) {
            lines.push('');
            continue;
        }

        let line = '';
        for (const word of words) {
            const candidate = line ? `${line} ${word}` : word;
            if (await measureMixedText(ctx, candidate, fontSize) <= maxWidth) {
                line = candidate;
                continue;
            }

            if (line) lines.push(line);

            // Break very long words too, while keeping emoji as one grapheme.
            line = '';
            for (const part of graphemes(word)) {
                const piece = line + part;
                if (!line || await measureMixedText(ctx, piece, fontSize) <= maxWidth) {
                    line = piece;
                } else {
                    lines.push(line);
                    line = part;
                }
            }
        }

        if (line) lines.push(line);
    }

    return lines.length ? lines : [''];
}

async function loadTemplate() {
    if (!templateBuffer) templateBuffer = await readFile(TEMPLATE_PATH);
    return templateBuffer;
}

function drawExpandedBubbleBase(ctx, bubble) {
    // Dark message bubble with a red/fire-like glow that matches the template.
    ctx.save();
    ctx.shadowColor = 'rgba(255, 25, 25, 0.95)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    roundRect(ctx, bubble.x, bubble.y, bubble.w, bubble.h, bubble.radius);
    ctx.fillStyle = '#050505';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ff1f2d';
    ctx.stroke();
    ctx.restore();

    // Small highlight around the border to make longer bubbles visually blend.
    ctx.save();
    roundRect(ctx, bubble.x + 2, bubble.y + 2, bubble.w - 4, bubble.h - 4, Math.max(2, bubble.radius - 2));
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(255, 60, 60, 0.75)';
    ctx.stroke();
    ctx.restore();
}

async function renderIQCMerah(text, timeStr, outputPath) {
    registerFonts();
    const template = await loadImage(await loadTemplate());

    const baseWidth = template.width;
    const baseHeight = template.height;

    const bubble = {
        x: 42,
        y: 802,
        // Do not keep the quote bubble at the old 168px width.
        // It now grows horizontally with the text, then wraps only after
        // reaching a safe maximum so long messages stay readable.
        w: 168,
        minW: 168,
        maxW: Math.min(560, baseWidth - 90),
        radius: 22,
        padX: 14,
        padTop: 11,
        padBottom: 7,
    };

    const cleanText = String(text || '').trim();
    if (cleanText.length > 1500) {
        throw new Error('Teks terlalu panjang. Maksimal 1500 karakter.');
    }

    const fontSize = 29;
    const lineHeight = 35;
    const fontFamily = 'Inter';
    const textColor = '#F2F2F7';
    const timeColor = '#E24B4B';

    const canvasProbe = createCanvas(baseWidth, baseHeight);
    const probe = canvasProbe.getContext('2d');
    probe.font = `500 ${fontSize}px ${fontFamily}`;

    // First wrap against the widest safe bubble. This prevents a long sentence
    // from being forced into a very narrow 168px column.
    const maxTextWidth = bubble.maxW - bubble.padX * 2;
    let lines = await wrapMixedText(probe, cleanText, maxTextWidth, fontSize);

    // Grow the bubble to the longest rendered line (up to maxW).
    // This gives short text a compact bubble while long text becomes wider
    // before it starts wrapping onto additional lines.
    const widestLine = Math.max(0, ...await Promise.all(
        lines.map(line => measureMixedText(probe, line, fontSize))
    ));
    bubble.w = Math.min(
        bubble.maxW,
        Math.max(bubble.minW, Math.ceil(widestLine + bubble.padX * 2))
    );

    // Re-wrap once more using the final width so the right edge is respected
    // after the dynamic sizing step.
    lines = await wrapMixedText(
        probe,
        cleanText,
        bubble.w - bubble.padX * 2,
        fontSize
    );

    // Keep every line visible. No automatic font shrinking and no truncation.
    const timestampLineHeight = 15;
    const textHeight = Math.max(lineHeight, lines.length * lineHeight);
    const bubbleHeight = Math.max(72, bubble.padTop + textHeight + timestampLineHeight + bubble.padBottom);
    const delta = Math.max(0, Math.ceil(bubbleHeight - 72));

    // Everything below the reaction bar is shifted downward by the same extra
    // height, so the menu remains intact while the message bubble grows.
    const shiftStartY = 792;
    const canvasHeight = baseHeight + delta;
    const canvas = createCanvas(baseWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(template, 0, 0, baseWidth, baseHeight);

    if (delta > 0) {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, shiftStartY, baseWidth, canvasHeight - shiftStartY);
        ctx.drawImage(
            template,
            0, shiftStartY, baseWidth, baseHeight - shiftStartY,
            0, shiftStartY + delta, baseWidth, baseHeight - shiftStartY
        );
    }

    const expandedBubble = { ...bubble, h: bubbleHeight };

    // Cover the old shifted bubble and draw the new dynamic bubble.
    ctx.save();
    roundRect(ctx, expandedBubble.x - 3, expandedBubble.y - 3, expandedBubble.w + 6, expandedBubble.h + 6, expandedBubble.radius + 3);
    ctx.fillStyle = '#050505';
    ctx.fill();
    ctx.restore();

    drawExpandedBubbleBase(ctx, expandedBubble);

    ctx.font = `500 ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    let y = expandedBubble.y + expandedBubble.padTop + fontSize;
    for (const line of lines) {
        await drawMixedText(ctx, line, expandedBubble.x + expandedBubble.padX, y, fontSize);
        y += lineHeight;
    }

    // Timestamp sits on its own bottom row for multi-line messages,
    // preventing it from ever covering the user's text.
    ctx.font = `600 16px ${fontFamily}`;
    ctx.fillStyle = timeColor;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(timeStr, expandedBubble.x + expandedBubble.w - 8, expandedBubble.y + expandedBubble.h - 9);

    const output = outputPath || join(TEMP_DIR, `iqcmerah_${Date.now()}.png`);
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, await canvas.encode('png'));
    return output;
}

async function handler(m, { sock, text }) {
    if (!existsSync(TEMPLATE_PATH)) {
        return m.reply('⚠️ Template belum ada.\n\nLetakkan gambar template di:\n`assets/image/iqcmerah-template.png`')
    }
    try {
        const targetText = String(text || (m.quoted && m.quoted.text ? m.quoted.text : '')).trim();

        if (!targetText) {
            return m.reply(
                `🔴 *FITUR FAKE QUOTE iOS MERAH*\n\n` +
                `Ketik: ${m.prefix}iqcmerah kata kata kamu\n` +
                `Atau reply pesan lalu ketik ${m.prefix}iqcmerah\n\n` +
                `✅ Teks panjang otomatis turun ke baris baru\n` +
                `✅ Ukuran font tetap jelas\n` +
                `✅ Support WEmoji / emoji WhatsApp`
            );
        }

        const timeStr = getMessageTime(m);
        await m.react('🕕');

        const resultPath = await renderIQCMerah(
            targetText,
            timeStr,
            join(TEMP_DIR, `iqcmerah_${Date.now()}.png`)
        );

        await sock.sendMessage(
            m.chat,
            { image: { url: resultPath }, mimetype: 'image/png' },
            { quoted: m.quoted || m }
        );

        if (existsSync(resultPath)) {
            try {
                await import('node:fs/promises').then(({ unlink }) => unlink(resultPath));
            } catch {}
        }

        await m.react('✅');
    } catch (error) {
        templateBuffer = null;
        fontsLoaded = false;
        console.error('[iqcmerah error]:', error);
        await m.react('❌');
        await m.reply(
            `❌ *GAGAL MEMPROSES QUOTE*\n\n` +
            `${error?.message === 'Teks terlalu panjang. Maksimal 1500 karakter.'
                ? error.message
                : 'Terjadi kesalahan saat membuat IQC merah. Coba lagi.'}`
        );
    }
}

export { pluginConfig as config, handler };
