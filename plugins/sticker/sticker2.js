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
import config from "../../config.js";

const {
  prepareWAMessageMedia,
  proto,
  downloadMediaMessage,
  downloadContentFromMessage,
} = baileys;

const pluginConfig = {
  name: "sticker2",
  alias: ["s2", "stiker2"],
  category: "sticker",
  description:
    "Crea un sticker de video cuadrado 1:1 con sonido (solo videos de máximo 25 segundos)",
  usage: ".s2 [pack|author]",
  example: ".s2\n.sticker2\n.s2 Miku|Arthazy",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

const execFileAsync = promisify(execFile);
const MAX_DURATION = 25;

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

function ensurePatched() {
  patchProtoInstance(proto);
  if (baileys?.default?.proto) patchProtoInstance(baileys.default.proto);
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

function detectVideoNode(node) {
  if (!node) return null;

  const container = unwrapMessageContainer(
    node.message || node.fakeObj?.message || node.raw?.message || {}
  );
  const mtype =
    node.mtype ||
    node.type ||
    Object.keys(container).find((k) =>
      /videoMessage|documentMessage|imageMessage|stickerMessage|audioMessage/i.test(
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
    container.documentMessage ||
    (node.mediaKey || node.url || node.directPath ? node : null);

  const mime = String(node.mimetype || mediaObj?.mimetype || "").toLowerCase();
  const isVideo =
    Boolean(node.isVideo) ||
    /videoMessage/i.test(mtype) ||
    /video\//i.test(mime);

  if (!isVideo) return null;

  const dlType = /documentMessage/i.test(mtype) ? "document" : "video";
  const seconds = Number(
    mediaObj?.seconds || node.seconds || node.msg?.seconds || 0
  );

  return { node, mediaObj, dlType, mime: mime || "video/mp4", seconds };
}

async function downloadVideoBuffer(videoInfo, client) {
  const { node, mediaObj, dlType } = videoInfo;

  if (mediaObj && dlType && (mediaObj.mediaKey || mediaObj.directPath || mediaObj.url)) {
    try {
      const stream = await downloadContentFromMessage(mediaObj, dlType);
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
    "sticker-pack-id": "com.aimiku.assistant.sticker2",
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

async function probeVideoMeta(inPath, fallbackSeconds = 0) {
  let duration = fallbackSeconds || 0;
  let hasAudio = true;

  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "error",
      "-show_entries", "formato=duración:transmisión=tipo_códec",
      "-of", "json",
      inPath,
    ]);
    const parsed = JSON.parse(stdout || "{}");
    const durVal = parseFloat(parsed?.format?.duration);
    if (Number.isFinite(durVal) && durVal > 0) {
      duration = durVal;
    }
    if (Array.isArray(parsed?.streams)) {
      hasAudio = parsed.streams.some((s) => s.codec_type === "audio");
    }
  } catch {}

  return { duration, hasAudio };
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

async function convertVideoToSquareWebp(inPath, outPath) {
  const encodeAttempt = async (fps, qv) => {
    await execFileAsync("ffmpeg", [
      "-y",
      "-i", inPath,
      "-t", String(MAX_DURATION),
      "-vf", `fps=${fps},scale=512:512:force_original_aspect_ratio=increase,crop=512:512,setsar=1`,
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

  const profiles = [
    [12, 55],
    [10, 44],
    [8, 34],
    [6, 24],
    [5, 16],
  ];

  let webp = null;
  for (const [fps, qv] of profiles) {
    webp = await encodeAttempt(fps, qv);
    if (webp.length <= 880 * 1024) break;
  }
  return webp;
}

async function extractOggOpusFromVideo(inPath, outPath) {
  const { stderr } = await execFileAsync("ffmpeg", [
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
    throw new Error("El vídeo no tiene sonido válido.");
  }

  const realSeconds = parseFfmpegDuration(stderr);
  return { oggBuffer, realSeconds };
}

function parsePackAuthor(text, botConfig) {
  const defaultPack =
    botConfig?.sticker?.packname ||
    config?.sticker?.packname ||
    botConfig?.bot?.name ||
    "Ai Miku";
  const defaultAuthor =
    botConfig?.sticker?.author ||
    config?.sticker?.author ||
    botConfig?.owner?.name ||
    "Arthazy";

  const raw = String(text || "").trim();
  if (!raw) return { packname: defaultPack, author: defaultAuthor };

  if (raw.includes("|")) {
    const [p, a] = raw.split("|");
    return {
      packname: (p || "").trim() || defaultPack,
      author: (a || "").trim() || defaultAuthor,
    };
  }

  return { packname: raw, author: defaultAuthor };
}

async function handler(m, { sock, config: botConfig }) {
  const videoInfo = detectVideoNode(m.quoted) || detectVideoNode(m);

  if (!videoInfo) {
    return m.reply(
      `🎬 *STICKER VÍDEO AUDIO*\n\n` +
        `Características \`${m.prefix}${m.command}\` especialmente para *videos* ¡eh! Graba automáticamente el cuadro 1:1 e incluye inmediatamente el audio del vídeo.\n\n` +
        `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n` +
        `> Enviar o responder *video* (máx. ${MAX_DURATION} segundos) con \`${m.prefix}s2\` o \`${m.prefix}sticker2\`\n` +
        `> Custom watermark: \`${m.prefix}s2 PackName|Author\`\n\n` +
        `_Si quieres pegatinas con imágenes o sonidos, utiliza \`${m.prefix}s\`._`
    );
  }

  if (videoInfo.seconds && videoInfo.seconds > MAX_DURATION + 0.5) {
    return m.reply(
      `❌ *EL VÍDEO ES DEMASIADO LARGO*\n\n` +
        `> Duración del vídeo: *${Math.round(videoInfo.seconds)} segundo*\n` +
        `> Máximo: *${MAX_DURATION} segundos* (vídeo y audio)`
    );
  }

  await m.react("🕕");

  const tmpId = randomBytes(6).toString("hex");
  const inPath = path.join(os.tmpdir(), `s2_in_${tmpId}.mp4`);
  const webpPath = path.join(os.tmpdir(), `s2_out_${tmpId}.webp`);
  const oggPath = path.join(os.tmpdir(), `s2_aud_${tmpId}.ogg`);

  try {
    const buffer = await downloadVideoBuffer(videoInfo, sock);
    if (!buffer || !buffer.length) {
      await m.react("❌");
      return m.reply("❌ No se pudo descargar el video. Intenta enviar o responder el vídeo nuevamente.");
    }

    await fs.writeFile(inPath, buffer);

    const { duration, hasAudio } = await probeVideoMeta(inPath, videoInfo.seconds);

    if (duration > MAX_DURATION + 0.5) {
      await m.react("❌");
      return m.reply(
        `❌ *EL VÍDEO ES DEMASIADO LARGO*\n\n` +
          `> Duración del vídeo: *${duration.toFixed(1)} segundo*\n` +
          `> Máximo: *${MAX_DURATION} segundos* (vídeo y audio)`
      );
    }

    if (!hasAudio) {
      await m.react("❌");
      return m.reply(
        `❌ ¡Este vídeo no tiene sonido/audio!\n> Si quieres hacer un stickers de video sin sonido, usa \`${m.prefix}s\`.`
      );
    }

    const { packname, author } = parsePackAuthor(m.text, botConfig);

    const [rawWebp, audioResult] = await Promise.all([
      convertVideoToSquareWebp(inPath, webpPath),
      extractOggOpusFromVideo(inPath, oggPath),
    ]);

    const stickerBuffer = await addStickerExif(rawWebp, packname, author);

    ensurePatched();

    const [{ audioMessage }, prepared] = await Promise.all([
      prepareWAMessageMedia(
        {
          audio: audioResult.oggBuffer,
          mimetype: "audio/ogg; códecs=opus",
          ptt: true,
        },
        { upload: sock.waUploadToServer }
      ),
      prepareWAMessageMedia(
        { sticker: stickerBuffer, isAnimated: true },
        { upload: sock.waUploadToServer }
      ),
    ]);

    const chosenSec =
      audioResult.realSeconds > 0
        ? audioResult.realSeconds
        : duration > 0
          ? duration
          : 5;
    audioMessage.seconds = Math.max(
      1,
      Math.min(MAX_DURATION, Math.round(chosenSec))
    );
    audioMessage.ptt = true;
    audioMessage.mimetype = "audio/ogg; códecs=opus";
    if (!audioMessage.waveform || !audioMessage.waveform.length) {
      audioMessage.waveform = generateWaveform(audioResult.oggBuffer);
    }

    prepared.stickerMessage.isAnimated = true;
    prepared.stickerMessage.audioMessage = audioMessage;

    if (m.key?.id && m.message) {
      prepared.stickerMessage.contextInfo = {
        stanzaId: m.key.id,
        participant: m.key.participant || m.sender,
        quotedMessage: m.message,
      };
    }

    const payload = {
      __proto__: prepared,
      audioStickerMessage: { message: prepared },
      messageContextInfo: { messageSecret: randomBytes(32) },
    };

    await sock.relayMessage(m.chat, payload, {});
    await m.react("✅");
  } catch (err) {
    console.error("[sticker2]", err);
    await m.react("❌");
    const msg = String(err?.message || "");
    if (/stream specifier|does not contain any stream|tidak memiliki suara/i.test(msg)) {
      return m.reply(
        `❌ Este vídeo no tiene pista de audio.\n> Utilice \`${m.prefix}s\` para pegatinas de vídeo sin sonido.`
      );
    }
    return m.reply(
      `❌ No se pudo crear pegatinas de video con sonido.\n> _${msg || "Ocurrió un error al procesar el vídeo."}_`
    );
  } finally {
    await fs.unlink(inPath).catch(() => {});
    await fs.unlink(webpPath).catch(() => {});
    await fs.unlink(oggPath).catch(() => {});
  }
}

export { pluginConfig as config, handler };
