/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import * as baileys from "@rexxhayanasi/elaina-baileys";
import { randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";
import config from "../../config.js";

const {
  prepareWAMessageMedia,
  proto,
  downloadMediaMessage,
  downloadContentFromMessage,
} = baileys;

const pluginConfig = {
  name: "audiosticker",
  alias: ["stikeraudio", "stickeraudio", "figurinhasom", "saudio"],
  category: "convert",
  description:
    "Crea stickers de imagen/GIF con sonido (Audio Sticker) de hasta 25 segundos usando un sistema de sesión",
  usage: ".audiosticker [pack|autor]",
  example: ".saudio",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

const execFileAsync = promisify(execFile);

// Igual que el resto del bot: usa el ffmpeg que trae el paquete y, si no está, el del sistema.
let FFMPEG = "ffmpeg";
try {
  FFMPEG = createRequire(import.meta.url)("@ffmpeg-installer/ffmpeg").path || "ffmpeg";
} catch {}

const MAX_DURATION = 25;
const SESSION_SECONDS = 60;

if (!globalThis.__audioStickerSessions) {
  globalThis.__audioStickerSessions = new Map();
}
const sessions = globalThis.__audioStickerSessions;

function patchProtoInstance(p) {
  const M = p?.Message;
  if (!M || M.__audioStickerPatchedV3) return;

  if (M.StickerMessage) {
    const prevStickerEncode = M.StickerMessage.encode;
    M.StickerMessage.encode = function (message, writer) {
      const audio = message?.audioMessage;
      if (
        audio &&
        Object.prototype.hasOwnProperty.call(message, "audioMessage")
      ) {
        delete message.audioMessage;
      }
      const w = prevStickerEncode.call(this, message, writer);
      if (audio && M.AudioMessage) {
        message.audioMessage = audio;
        M.AudioMessage.encode(audio, w.uint32(210).fork()).ldelim();
      }
      return w;
    };

    if (typeof M.StickerMessage.fromObject === "function") {
      const prevStickerFromObj = M.StickerMessage.fromObject;
      M.StickerMessage.fromObject = function (object) {
        const msg = prevStickerFromObj.call(this, object);
        if (object?.audioMessage) {
          msg.audioMessage = M.AudioMessage?.fromObject
            ? M.AudioMessage.fromObject(object.audioMessage)
            : object.audioMessage;
        }
        return msg;
      };
    }
  }

  const prevMsgEncode = M.encode;
  M.encode = function (message, writer) {
    const asm = message?.audioStickerMessage;
    if (asm) {
      if (Object.prototype.hasOwnProperty.call(message, "stickerMessage")) {
        delete message.stickerMessage;
      }
      if (
        Object.prototype.hasOwnProperty.call(message, "audioStickerMessage")
      ) {
        delete message.audioStickerMessage;
      }
    }
    const w = prevMsgEncode.call(this, message, writer);
    if (asm && M.FutureProofMessage) {
      message.audioStickerMessage = asm;
      M.FutureProofMessage.encode(asm, w.uint32(1074).fork()).ldelim();
    }
    return w;
  };

  if (typeof M.fromObject === "function") {
    const prevMsgFromObj = M.fromObject;
    M.fromObject = function (object) {
      const msg = prevMsgFromObj.call(this, object);
      if (object?.audioStickerMessage) {
        const inner =
          object.audioStickerMessage.message || object.audioStickerMessage;
        if (
          inner?.stickerMessage &&
          object.audioStickerMessage.message?.stickerMessage?.audioMessage
        ) {
          inner.stickerMessage.audioMessage =
            object.audioStickerMessage.message.stickerMessage.audioMessage;
        }
        msg.audioStickerMessage = { message: inner };
        delete msg.stickerMessage;
        if (inner) {
          Object.setPrototypeOf(msg, inner);
        }
      }
      return msg;
    };
  }

  M.__audioStickerPatchedV3 = true;
}

async function ensurePatched() {
  patchProtoInstance(proto);
  for (const pkg of [
    "@rexxhayanasi/elaina-baileys",
    "baileys",
    "@whiskeysockets/baileys",
  ]) {
    try {
      const mod = await import(pkg);
      if (mod?.proto) patchProtoInstance(mod.proto);
      if (mod?.default?.proto) patchProtoInstance(mod.default.proto);
    } catch {}
  }
}

function getSessionKey(m) {
  return `${m.chat}:${m.sender}`;
}

function clearUserSession(key) {
  const existing = sessions.get(key);
  if (existing?.timer) clearTimeout(existing.timer);
  sessions.delete(key);
}

function unwrapMessageContainer(raw) {
  let cur = raw;
  for (let i = 0; i < 6 && cur; i++) {
    const next =
      cur.ephemeralMessage?.message ||
      cur.viewOnceMessageV2?.message ||
      cur.viewOnceMessageV2Extension?.message ||
      cur.viewOnceMessage?.message ||
      cur.documentWithCaptionMessage?.message ||
      cur.editedMessage?.message;
    if (!next) break;
    cur = next;
  }
  return cur || {};
}

function detectMediaInfo(node) {
  if (!node)
    return { kind: null, mime: "", seconds: 0, mediaObj: null, dlType: null };

  const container = unwrapMessageContainer(
    node.message || node.fakeObj?.message || node.raw?.message || {}
  );
  const mtype =
    node.mtype ||
    node.type ||
    Object.keys(container).find((k) =>
      /imageMessage|videoMessage|stickerMessage|audioMessage|documentMessage/i.test(
        k
      )
    ) ||
    "";

  const directMsg =
    node.msg &&
    typeof node.msg === "object" &&
    (node.msg.mediaKey ||
      node.msg.url ||
      node.msg.directPath ||
      node.msg.mimetype)
      ? node.msg
      : null;

  const mediaObj =
    directMsg ||
    container[mtype] ||
    container.videoMessage ||
    container.imageMessage ||
    container.stickerMessage ||
    container.audioMessage ||
    container.documentMessage ||
    (node.mediaKey || node.url || node.directPath ? node : null);

  const mime = String(node.mimetype || mediaObj?.mimetype || "").toLowerCase();
  const seconds = Number(
    mediaObj?.seconds || node.seconds || node.msg?.seconds || 0
  );

  if (/video/i.test(mime) || /videoMessage/i.test(mtype)) {
    const dlType = /documentMessage/i.test(mtype) ? "document" : "video";
    return { kind: "video", mime: mime || "video/mp4", seconds, mediaObj, dlType };
  }
  if (/webp/i.test(mime) || /stickerMessage/i.test(mtype)) {
    const isAnim = Boolean(mediaObj?.isAnimated);
    return {
      kind: "webp",
      mime: "image/webp",
      seconds,
      isAnimated: isAnim,
      mediaObj,
      dlType: "sticker",
    };
  }
  if (/image/i.test(mime) || /imageMessage/i.test(mtype)) {
    const dlType = /documentMessage/i.test(mtype) ? "document" : "image";
    return { kind: "image", mime: mime || "image/jpeg", seconds: 0, mediaObj, dlType };
  }
  if (
    /audio|ogg|opus|mpeg|mp3|wav|m4a|aac/i.test(mime) ||
    /audioMessage/i.test(mtype)
  ) {
    const dlType = /documentMessage/i.test(mtype) ? "document" : "audio";
    return { kind: "audio", mime: mime || "audio/mpeg", seconds, mediaObj, dlType };
  }
  return { kind: null, mime: "", seconds: 0, mediaObj: null, dlType: null };
}

async function downloadBuffer(node, info, client) {
  if (!node) return null;

  if (
    info?.mediaObj &&
    info?.dlType &&
    (info.mediaObj.mediaKey || info.mediaObj.directPath || info.mediaObj.url)
  ) {
    try {
      const stream = await downloadContentFromMessage(info.mediaObj, info.dlType);
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buf = Buffer.concat(chunks);
      if (buf.length) return buf;
    } catch {}
  }

  if (node.fakeObj?.message || node.raw?.message || node.message) {
    try {
      const msgObj = node.fakeObj?.message
        ? node.fakeObj
        : node.raw?.message
          ? node.raw
          : node;
      const buf = await downloadMediaMessage(
        msgObj,
        "buffer",
        {},
        {
          logger: { info: () => {}, error: () => {}, warn: () => {} },
          reuploadRequest: client?.updateMediaMessage,
        }
      );
      if (buf?.length) return buf;
    } catch {}
  }

  if (info?.mediaObj && info?.dlType) {
    try {
      const synthetic = {
        key: node.key || { remoteJid: node.chat || "status@broadcast", id: "0" },
        message: { [`${info.dlType}Message`]: info.mediaObj },
      };
      const buf = await downloadMediaMessage(
        synthetic,
        "buffer",
        {},
        {
          logger: { info: () => {}, error: () => {}, warn: () => {} },
          reuploadRequest: client?.updateMediaMessage,
        }
      );
      if (buf?.length) return buf;
    } catch {}
  }

  if (typeof node.download === "function") {
    try {
      const buf = await node.download();
      if (buf?.length) return buf;
    } catch {}
  }

  return null;
}

function buildExifPayload(packname, author) {
  const json = {
    "sticker-pack-id": "com.aimiku.assistant.audiosticker",
    "sticker-pack-name": String(packname ?? ""),
    "sticker-pack-publisher": String(author ?? ""),
    emojis: ["🔊"],
  };
  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
  ]);
  const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
  const exif = Buffer.concat([exifAttr, jsonBuff]);
  exif.writeUIntLE(jsonBuff.length, 14, 4);
  return exif;
}

function injectExifRiffFallback(webpBuffer, exifData) {
  if (
    !Buffer.isBuffer(webpBuffer) ||
    webpBuffer.length < 16 ||
    webpBuffer.toString("ascii", 0, 4) !== "RIFF" ||
    webpBuffer.toString("ascii", 8, 12) !== "WEBP"
  ) {
    return webpBuffer;
  }

  const chunks = [];
  let offset = 12;
  let hasVp8x = false;
  let isAnim = false;

  while (offset + 8 <= webpBuffer.length) {
    const id = webpBuffer.toString("ascii", offset, offset + 4);
    const size = webpBuffer.readUInt32LE(offset + 4);
    const padded = size + (size % 2);
    const end = Math.min(webpBuffer.length, offset + 8 + padded);
    const rawChunk = Buffer.from(webpBuffer.subarray(offset, end));

    if (id === "VP8X") hasVp8x = true;
    if (id === "ANIM" || id === "ANMF") isAnim = true;
    if (id !== "EXIF") chunks.push({ id, rawChunk });

    offset = end;
  }

  if (!hasVp8x) {
    const vp8x = Buffer.alloc(18);
    vp8x.write("VP8X", 0, 4, "ascii");
    vp8x.writeUInt32LE(10, 4);
    vp8x[8] = 0x18;
    vp8x.writeUIntLE(511, 12, 3);
    vp8x.writeUIntLE(511, 15, 3);
    chunks.unshift({ id: "VP8X", rawChunk: vp8x });
  } else {
    const vp8xEntry = chunks.find((c) => c.id === "VP8X");
    if (vp8xEntry && vp8xEntry.rawChunk.length >= 18) {
      vp8xEntry.rawChunk[8] |= 0x08;
      if (isAnim) vp8xEntry.rawChunk[8] |= 0x02;
    }
  }

  const padByte =
    exifData.length % 2 === 1 ? Buffer.from([0x00]) : Buffer.alloc(0);
  const exifHeader = Buffer.alloc(8);
  exifHeader.write("EXIF", 0, 4, "ascii");
  exifHeader.writeUInt32LE(exifData.length, 4);
  chunks.push({
    id: "EXIF",
    rawChunk: Buffer.concat([exifHeader, exifData, padByte]),
  });

  const body = Buffer.concat(chunks.map((c) => c.rawChunk));
  const header = Buffer.alloc(12);
  header.write("RIFF", 0, 4, "ascii");
  header.writeUInt32LE(body.length + 4, 4);
  header.write("WEBP", 8, 4, "ascii");

  return Buffer.concat([header, body]);
}

async function addStickerExif(webpBuffer, packname, author) {
  const exifData = buildExifPayload(packname, author);
  try {
    const webpMod = await import("node-webpmux");
    const WebpImage = webpMod.default?.Image || webpMod.Image || webpMod.default;
    if (WebpImage) {
      const img = new WebpImage();
      await img.load(webpBuffer);
      img.exif = exifData;
      return await img.save(null);
    }
  } catch {}
  return injectExifRiffFallback(webpBuffer, exifData);
}

function isWebpAnimated(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 22) return false;
  if (buf.toString("ascii", 12, 16) === "VP8X" && (buf[20] & 0x02) !== 0)
    return true;
  return buf.includes(Buffer.from("ANIM"));
}

async function videoBufferToAnimatedWebp(buffer) {
  const tmpId = randomBytes(6).toString("hex");
  const inPath = path.join(os.tmpdir(), `as_vid_${tmpId}.mp4`);
  const outPath = path.join(os.tmpdir(), `as_out_${tmpId}.webp`);

  const encodeAttempt = async (fps, qv) => {
    await execFileAsync(FFMPEG, [
      "-y",
      "-i", inPath,
      "-t", String(MAX_DURATION),
      "-vf", `fps=${fps},scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1`,
      "-c:v", "libwebp",
      "-lossless", "0",
      "-compression_level", "6",
      "-q:v", String(qv),
      "-loop", "0",
      "-preset", "picture",
      "-an",
      "-vsync", "0",
      outPath,
    ]);
    return await fs.readFile(outPath);
  };

  try {
    await fs.writeFile(inPath, buffer);
    const profiles = [
      [10, 50],
      [8, 36],
      [6, 24],
      [5, 16],
    ];
    let webp = null;
    for (const [fps, qv] of profiles) {
      webp = await encodeAttempt(fps, qv);
      if (webp.length <= 880 * 1024) break;
    }
    return webp;
  } finally {
    await fs.unlink(inPath).catch(() => {});
    await fs.unlink(outPath).catch(() => {});
  }
}

async function imageBufferToWebp(buffer) {
  try {
    const sharp = (await import("sharp")).default;
    return await sharp(buffer, { animated: true })
      .rotate()
      .resize(512, 512, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    const tmpId = randomBytes(6).toString("hex");
    const inPath = path.join(os.tmpdir(), `as_img_${tmpId}.jpg`);
    const outPath = path.join(os.tmpdir(), `as_img_out_${tmpId}.webp`);
    try {
      await fs.writeFile(inPath, buffer);
      await execFileAsync(FFMPEG, [
        "-y",
        "-i", inPath,
        "-vf", "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1",
        "-c:v", "libwebp",
        "-lossless", "0",
        "-q:v", "80",
        "-an",
        outPath,
      ]);
      return await fs.readFile(outPath);
    } finally {
      await fs.unlink(inPath).catch(() => {});
      await fs.unlink(outPath).catch(() => {});
    }
  }
}

async function buildStickerWithExif(buffer, kind, packname, author) {
  let rawWebp = buffer;
  if (kind === "video") {
    rawWebp = await videoBufferToAnimatedWebp(buffer);
  } else if (kind === "image") {
    rawWebp = await imageBufferToWebp(buffer);
  }
  return await addStickerExif(rawWebp, packname, author);
}

function parseFfmpegDuration(stderrText) {
  const matches = [
    ...String(stderrText || "").matchAll(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/g),
  ];
  if (!matches.length) return 0;
  const last = matches[matches.length - 1];
  const sec = Number(last[1]) * 3600 + Number(last[2]) * 60 + Number(last[3]);
  return Number.isFinite(sec) ? sec : 0;
}

function generateWaveform(seedBuf, length = 64) {
  const wf = Buffer.alloc(length);
  for (let i = 0; i < length; i++) {
    const b =
      seedBuf && seedBuf.length ? seedBuf[(i * 19 + 7) % seedBuf.length] : i * 11;
    wf[i] = 18 + (b % 76);
  }
  return wf;
}

async function convertToOggOpus(buffer, ext = "mp3") {
  const tmpId = randomBytes(6).toString("hex");
  const inPath = path.join(os.tmpdir(), `ptt_in_${tmpId}.${ext}`);
  const outPath = path.join(os.tmpdir(), `ptt_out_${tmpId}.ogg`);
  try {
    await fs.writeFile(inPath, buffer);
    const { stderr } = await execFileAsync(FFMPEG, [
      "-y",
      "-i", inPath,
      "-vn",
      "-map", "0:a:0",
      "-t", String(MAX_DURATION),
      "-af", "aresample=48000:async=1:first_pts=0",
      "-c:a", "libopus",
      "-b:a", "48k",
      "-vbr", "on",
      "-compression_level", "10",
      "-ac", "1",
      "-ar", "48000",
      "-application", "audio",
      "-avoid_negative_ts", "make_zero",
      "-f", "ogg",
      outPath,
    ]);
    const oggBuffer = await fs.readFile(outPath);
    if (!oggBuffer || oggBuffer.length < 200) {
      throw new Error("La pista de audio está vacía o es demasiado corta.");
    }
    const realSeconds = parseFfmpegDuration(stderr);
    return { oggBuffer, realSeconds };
  } finally {
    await fs.unlink(inPath).catch(() => {});
    await fs.unlink(outPath).catch(() => {});
  }
}

async function buildAudioMessageFromBuffer(
  client,
  buffer,
  ext,
  fallbackSeconds = 0
) {
  const { oggBuffer, realSeconds } = await convertToOggOpus(buffer, ext);

  const { audioMessage } = await prepareWAMessageMedia(
    { audio: oggBuffer, mimetype: "audio/ogg; codecs=opus", ptt: true },
    { upload: client.waUploadToServer }
  );

  const chosenSec =
    realSeconds > 0 ? realSeconds : fallbackSeconds > 0 ? fallbackSeconds : 5;
  const finalSeconds = Math.max(1, Math.min(MAX_DURATION, Math.round(chosenSec)));

  audioMessage.seconds = finalSeconds;
  audioMessage.ptt = true;
  audioMessage.mimetype = "audio/ogg; codecs=opus";
  if (!audioMessage.waveform || !audioMessage.waveform.length) {
    audioMessage.waveform = generateWaveform(oggBuffer);
  }

  return audioMessage;
}

async function sendCombinedAudioSticker(
  client,
  chat,
  stickerBuffer,
  isAnimated,
  audioMsg
) {
  await ensurePatched();

  const prepared = await prepareWAMessageMedia(
    { sticker: stickerBuffer, isAnimated },
    { upload: client.waUploadToServer }
  );

  prepared.stickerMessage.isAnimated = Boolean(isAnimated);
  prepared.stickerMessage.audioMessage = audioMsg;

  const payload = {
    __proto__: prepared,
    audioStickerMessage: { message: prepared },
    messageContextInfo: { messageSecret: randomBytes(32) },
  };

  await client.relayMessage(chat, payload, {});
}

function startStickerSession({
  m,
  client,
  send,
  stickerBuffer,
  isAnimated,
  packname,
  author,
  prefix,
  command,
}) {
  const key = getSessionKey(m);
  clearUserSession(key);

  const timer = setTimeout(() => {
    if (sessions.has(key)) {
      sessions.delete(key);
      if (client?.sendMessage) {
        client
          .sendMessage(
            m.chat,
            {
              text: `⏰ *SESIÓN DE AUDIO STICKER FINALIZADA*\n> _Se agotaron los ${SESSION_SECONDS} segundos de espera. Si quieres crear tu Audio Sticker, envía otra vez la foto._`,
            },
            { quoted: m }
          )
          .catch(() => {});
      }
    }
  }, SESSION_SECONDS * 1000);
  timer.unref?.();

  sessions.set(key, {
    stickerBuffer,
    isAnimated,
    packname,
    author,
    expiresAt: Date.now() + SESSION_SECONDS * 1000,
    processing: false,
    timer,
  });

  return send(
    `✦ *SESIÓN DE AUDIO STICKER ACTIVA* ✦\n` +
      `> _El sticker quedó guardado en una sesión temporal._\n\n` +
      `╭─「 *DATOS DE LA SESIÓN* 」\n` +
      `│ ◦ *Pack* : *${packname}*\n` +
      `│ ◦ *Autor* : *${author}*\n` +
      `│ ◦ *Tipo* : \`${isAnimated ? "GIF animado" : "Imagen fija"}\`\n` +
      `│ ◦ *Duración máx. del audio* : \`${MAX_DURATION} segundos\`\n` +
      `│ ◦ *Tiempo de espera* : \`${SESSION_SECONDS} segundos\`\n` +
      `╰───────────────\n\n` +
      `╭─「 *QUÉ HACER AHORA* 」\n` +
      `│ 1. Envía *Audio MP3 / Nota de voz / Vídeo* directamente a este chat\n` +
      `│ 2. O responde a un *Audio / Nota de voz / Vídeo* con \`${prefix}${command}\`\n` +
      `│ 3. Escribe \`${prefix}${command} cancelar\` para dejar la sesión\n` +
      `╰───────────────`
  );
}

async function consumeSessionWithAudio(
  m,
  client,
  send,
  react,
  session,
  audioNode,
  audioInfo
) {
  const key = getSessionKey(m);
  session.processing = true;
  await react("⏳");

  try {
    const audioBuf = await downloadBuffer(audioNode, audioInfo, client);
    if (!audioBuf || !audioBuf.length)
      throw new Error("No se pudo descargar el archivo de audio o vídeo.");

    const ext =
      audioInfo.kind === "video"
        ? "mp4"
        : /ogg|opus/i.test(audioInfo.mime)
          ? "ogg"
          : /mp4|m4a|aac/i.test(audioInfo.mime)
            ? "m4a"
            : "mp3";

    const audioMsg = await buildAudioMessageFromBuffer(
      client,
      audioBuf,
      ext,
      audioInfo.seconds
    );

    await sendCombinedAudioSticker(
      client,
      m.chat,
      session.stickerBuffer,
      session.isAnimated,
      audioMsg
    );

    clearUserSession(key);
    await react("✅");
  } catch (err) {
    session.processing = false;
    console.error("[AUDIOSTICKER SESSION ERROR]", err);
    await react("❌");
    await send(
      `❌ No se pudo unir el sonido al sticker: ${err?.message || String(err)}`
    );
  }
}

async function handler(m, context = {}) {
  const client =
    context.sock || context.conn || m.conn || global.conn || global.sock;
  const prefix = context.prefix || context.usedPrefix || m.prefix || ".";
  const command = context.command || m.command || "audiosticker";
  const rawText = String(context.text ?? m.text ?? m.body ?? "").trim();
  const send = context.reply || ((t) => m.reply(t));
  const react = async (emoji) => {
    if (client?.sendMessage) {
      await client
        .sendMessage(m.chat, { react: { text: emoji, key: m.key } })
        .catch(() => {});
    }
  };

  const key = getSessionKey(m);
  const activeSession = sessions.get(key);

  if (/^(batal|cancelar|cancel|stop)$/i.test(rawText)) {
    if (!activeSession)
      return send("⚠️ No hay ninguna sesión de Audio Sticker activa.");
    clearUserSession(key);
    await react("✅");
    return send("✅ Sesión de Audio Sticker cancelada.");
  }

  const ownInfo = detectMediaInfo(m);
  const quoted = m.quoted;
  const quotedInfo = detectMediaInfo(quoted);

  const hasOwnVisual =
    ownInfo.kind === "video" ||
    ownInfo.kind === "image" ||
    ownInfo.kind === "webp";
  const hasQuotedVisual =
    quotedInfo.kind === "video" ||
    quotedInfo.kind === "image" ||
    quotedInfo.kind === "webp";
  const hasOwnAudio = ownInfo.kind === "audio";
  const hasQuotedAudio = quotedInfo.kind === "audio";

  if (
    activeSession &&
    !activeSession.processing &&
    (hasOwnAudio || hasQuotedAudio) &&
    !hasOwnVisual
  ) {
    const targetAudioNode = hasOwnAudio ? m : quoted;
    const targetAudioInfo = hasOwnAudio ? ownInfo : quotedInfo;
    return await consumeSessionWithAudio(
      m,
      client,
      send,
      react,
      activeSession,
      targetAudioNode,
      targetAudioInfo
    );
  }

  if (!hasOwnVisual && !hasQuotedVisual && !hasOwnAudio && !hasQuotedAudio) {
    if (activeSession) {
      const remSec = Math.max(
        1,
        Math.ceil((activeSession.expiresAt - Date.now()) / 1000)
      );
      return send(
        `⏳ *LA SESIÓN SIGUE ACTIVA (${remSec} SEGUNDOS)*\n\n` +
          `Envía un *Audio MP3 / Nota de voz* o responde a un audio con \`${prefix}${command}\`.\n` +
          `Escribe \`${prefix}${command} cancelar\` para dejar la sesión.`
      );
    }

    return send(
      `✦ *GENERADOR DE AUDIO STICKER* ✦\n` +
        `> _Crea stickers de foto o GIF en movimiento que suenan al tocarlos._\n\n` +
        `╭─「 *CÓMO USARLO (CON FOTO)* 」\n` +
        `│ 1. Envía o responde a una *Foto* con \`${prefix}${command}\`\n` +
        `│ 2. El bot abre una sesión de *${SESSION_SECONDS} segundos*\n` +
        `│ 3. ¡Envía o responde a un *Audio MP3 / Nota de voz* (máx. ${MAX_DURATION}s)!\n` +
        `╰───────────────\n\n` +
        `╭─「 *CÓMO USARLO (CON VÍDEO)* 」\n` +
        `│ ◦ Envía o responde a un *Vídeo (máx. ${MAX_DURATION} segundos)* con \`${prefix}${command}\`\n` +
        `│ _(Se convierte solo en sticker GIF animado + el audio del vídeo)_\n` +
        `│ ◦ Pack personalizado: \`${prefix}${command} NombrePack|Autor\`\n` +
        `╰───────────────`
    );
  }

  if (!hasOwnVisual && !hasQuotedVisual && (hasOwnAudio || hasQuotedAudio)) {
    return send(
      `⚠️ *FALTA ELEGIR LA FOTO O EL STICKER*\n\n` +
        `Primero envía o responde a una *Foto / Sticker* con el comando \`${prefix}${command}\`, y el bot te dará *${SESSION_SECONDS} segundos* para responder con el audio.`
    );
  }

  await react("⏳");

  try {
    await ensurePatched();

    const [customPack, customAuth] = rawText.includes("|")
      ? rawText.split("|").map((s) => s.trim())
      : [rawText, ""];

    const packname =
      customPack ||
      config.sticker?.packname ||
      global.packname ||
      global.stickpack ||
      global.namaBot ||
      "Ai Miku";

    const author =
      customAuth ||
      config.sticker?.author ||
      global.author ||
      global.stickauth ||
      global.namaOwner ||
      m.pushName ||
      "SebasMD";

    const visualNode = hasOwnVisual ? m : quoted;
    const visualInfo = hasOwnVisual ? ownInfo : quotedInfo;
    const isVideo = visualInfo.kind === "video";
    const videoSeconds = visualInfo.seconds || 0;

    if (isVideo && videoSeconds > MAX_DURATION) {
      await react("❌");
      return send(
        `⚠️ Para hacer un Audio Sticker el vídeo puede durar como máximo *${MAX_DURATION} segundos*.`
      );
    }

    const visualData = await downloadBuffer(visualNode, visualInfo, client);
    if (!visualData || !visualData.length) {
      throw new Error("No se pudo descargar la foto o el vídeo.");
    }

    const stickerBuffer = await buildStickerWithExif(
      visualData,
      visualInfo.kind,
      packname,
      author
    );
    const isAnimated = isVideo || isWebpAnimated(stickerBuffer);

    if (hasOwnVisual && hasQuotedAudio) {
      const audioBuf = await downloadBuffer(quoted, quotedInfo, client);
      if (!audioBuf || !audioBuf.length)
        throw new Error("No se pudo descargar el audio que respondiste.");
      const ext = /ogg|opus/i.test(quotedInfo.mime)
        ? "ogg"
        : /mp4|m4a|aac/i.test(quotedInfo.mime)
          ? "m4a"
          : "mp3";
      const audioMsg = await buildAudioMessageFromBuffer(
        client,
        audioBuf,
        ext,
        quotedInfo.seconds
      );
      await sendCombinedAudioSticker(
        client,
        m.chat,
        stickerBuffer,
        isAnimated,
        audioMsg
      );
      clearUserSession(key);
      await react("✅");
      return;
    }

    if (isVideo) {
      try {
        const audioMsg = await buildAudioMessageFromBuffer(
          client,
          visualData,
          "mp4",
          videoSeconds
        );
        await sendCombinedAudioSticker(
          client,
          m.chat,
          stickerBuffer,
          true,
          audioMsg
        );
        clearUserSession(key);
        await react("✅");
        return;
      } catch {
        await react("⏳");
        return await startStickerSession({
          m,
          client,
          send,
          stickerBuffer,
          isAnimated: true,
          packname,
          author,
          prefix,
          command,
        });
      }
    }

    return await startStickerSession({
      m,
      client,
      send,
      stickerBuffer,
      isAnimated,
      packname,
      author,
      prefix,
      command,
    });
  } catch (e) {
    console.error("[AUDIOSTICKER ERROR]", e);
    await react("❌");
    await send(`❌ No se pudo procesar el archivo: ${e?.message || String(e)}`);
  }
}

/**
 * Captura el audio o la nota de voz que llega mientras la sesión de
 * 60 segundos está abierta, sin necesidad de escribir el comando otra vez.
 */
async function handleAudioStickerBefore(m, sock) {
  if (!m || m.fromMe) return false;
  const key = getSessionKey(m);
  const session = sessions.get(key);
  if (!session || session.processing) return false;

  if (Date.now() > session.expiresAt) {
    clearUserSession(key);
    return false;
  }

  const bodyText = String(m.text || m.body || "").trim();
  if (
    /^[./!#]?(audiosticker|stikeraudio|stickeraudio|figurinhasom|saudio)\b/i.test(
      bodyText
    )
  ) {
    return false;
  }

  const ownInfo = detectMediaInfo(m);
  const quoted = m.quoted;
  const quotedInfo = detectMediaInfo(quoted);

  const isDirectAudio = ownInfo.kind === "audio";
  const isReplyToAudio = !bodyText && quotedInfo.kind === "audio";

  if (!isDirectAudio && !isReplyToAudio) return false;

  const send = (t) => m.reply(t);
  const react = async (emoji) => {
    if (sock?.sendMessage) {
      await sock
        .sendMessage(m.chat, { react: { text: emoji, key: m.key } })
        .catch(() => {});
    }
  };

  const targetNode = isDirectAudio ? m : quoted;
  const targetInfo = isDirectAudio ? ownInfo : quotedInfo;

  await consumeSessionWithAudio(
    m,
    sock,
    send,
    react,
    session,
    targetNode,
    targetInfo
  );
  return true;
}

export { pluginConfig as config, handler, handleAudioStickerBefore };
