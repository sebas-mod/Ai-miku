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
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const {
  proto,
  prepareWAMessageMedia,
  downloadContentFromMessage,
} = baileys;

const pluginConfig = {
  name: "audiosticker",
  alias: ["asticker"],
  category: "convert",
  description: "Buat stiker bersuara (Audio Sticker) — Step 1 reply audio/VN, Step 2 reply gambar/stiker",
  usage: ".audiosticker (reply audio/VN, lalu reply gambar/stiker)",
  example: ".asticker",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

const MAX_DURATION = 10;
const audioSession = new Map();

function patchMessageProto(M) {
  if (!M || M.__audioStickerPatchedV4) return;

  if (M.StickerMessage && typeof M.StickerMessage.encode === "function") {
    const prevStickerEncode = M.StickerMessage.encode;
    M.StickerMessage.encode = function (message, writer) {
      const audio = message?.audioMessage;
      if (audio && Object.prototype.hasOwnProperty.call(message, "audioMessage")) {
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
      if (Object.prototype.hasOwnProperty.call(message, "audioStickerMessage")) {
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
        const rawInner =
          object.audioStickerMessage.message || object.audioStickerMessage;
        const inner = M.fromObject(rawInner);
        if (
          inner?.stickerMessage &&
          rawInner?.stickerMessage?.audioMessage &&
          !inner.stickerMessage.audioMessage
        ) {
          inner.stickerMessage.audioMessage = M.AudioMessage?.fromObject
            ? M.AudioMessage.fromObject(rawInner.stickerMessage.audioMessage)
            : rawInner.stickerMessage.audioMessage;
        }
        msg.audioStickerMessage = M.FutureProofMessage?.fromObject
          ? M.FutureProofMessage.fromObject({ message: inner })
          : { message: inner };
        delete msg.stickerMessage;
      }
      return msg;
    };
  }

  M.__audioStickerPatchedV4 = true;
}

function ensureAllProtosPatched(extraCtor = null) {
  if (proto?.Message) patchMessageProto(proto.Message);
  if (baileys?.default?.proto?.Message) {
    patchMessageProto(baileys.default.proto.Message);
  }
  if (extraCtor) patchMessageProto(extraCtor);
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

function parseFfmpegDuration(stderrText) {
  const matches = [
    ...String(stderrText || "").matchAll(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/g),
  ];
  if (!matches.length) return 0;
  const last = matches[matches.length - 1];
  const sec = Number(last[1]) * 3600 + Number(last[2]) * 60 + Number(last[3]);
  return Number.isFinite(sec) ? sec : 0;
}

async function convertAudioToOggOpus(buffer) {
  const tmpId = randomBytes(6).toString("hex");
  const inPath = path.join(os.tmpdir(), `as_in_${tmpId}.bin`);
  const outPath = path.join(os.tmpdir(), `as_out_${tmpId}.ogg`);
  try {
    await fs.writeFile(inPath, buffer);
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
    const seconds = Math.max(
      1,
      Math.min(MAX_DURATION, Math.round(parseFfmpegDuration(stderr) || 3))
    );
    return { oggBuffer, seconds };
  } finally {
    await fs.unlink(inPath).catch(() => {});
    await fs.unlink(outPath).catch(() => {});
  }
}

function isWebpAnimated(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 22) return false;
  if (buf.toString("ascii", 12, 16) === "VP8X" && (buf[20] & 0x02) !== 0)
    return true;
  return buf.includes(Buffer.from("ANIM"));
}

async function downloadQuotedMedia(q, fallbackType) {
  if (typeof q.download === "function") {
    try {
      const buf = await q.download();
      if (Buffer.isBuffer(buf) && buf.length > 0) return buf;
    } catch {}
  }

  const rawMsg = q.message || q.raw?.message || {};
  const mediaObj =
    rawMsg.audioMessage ||
    rawMsg.stickerMessage ||
    rawMsg.imageMessage ||
    rawMsg.documentMessage ||
    q.msg;

  if (mediaObj) {
    const dlType = rawMsg.audioMessage
      ? "audio"
      : rawMsg.stickerMessage
        ? "sticker"
        : rawMsg.imageMessage
          ? "image"
          : rawMsg.documentMessage
            ? "document"
            : fallbackType;
    const stream = await downloadContentFromMessage(mediaObj, dlType);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buf = Buffer.concat(chunks);
    if (buf.length > 0) return buf;
  }

  return null;
}

async function handler(m, { sock }) {
  const p = m.prefix || ".";
  const cmd = m.command || "asticker";

  try {
    const q = m.quoted;
    if (!q) {
      return m.reply(
        `✗ ¡Formato incorrecto!\n\n` +
          `*Paso 1:* Responder nota de voz/archivo de audio con \`${p}${cmd}\`\n` +
          `*Paso 2:* Responder pegatina/imagen con \`${p}${cmd}\``
      );
    }

    const qMsg = q.message || {};
    const mime = String(
      q.mime ||
        q.mimetype ||
        qMsg.audioMessage?.mimetype ||
        qMsg.stickerMessage?.mimetype ||
        qMsg.imageMessage?.mimetype ||
        qMsg.documentMessage?.mimetype ||
        ""
    );

    // STEP 1: Simpan Audio / Voice Note
    if (
      /audio/i.test(mime) ||
      qMsg.audioMessage ||
      qMsg.documentMessage?.mimetype?.includes("audio")
    ) {
      await sock
        .sendMessage(m.chat, { react: { text: "🎵", key: m.key } })
        .catch(() => {});

      const buf = await downloadQuotedMedia(q, "audio");
      if (!buf) throw new Error("No se pudo descargar el audio");

      audioSession.set(m.sender, {
        buffer: buf,
        seconds: Number(qMsg.audioMessage?.seconds || 0),
      });
      return m.reply(
        `✅ *¡Audio guardado exitosamente!*\n\n` +
          `Ahora (Paso 2), responda a la *Etiqueta* o *Imagen* que desea usar como fondo con el comando \`${p}${cmd}\` nuevamente.`
      );
    }

    // STEP 2: Gabungkan dengan Stiker / Gambar lalu kirim Audio Sticker (dengan ikon speaker)
    if (
      /image|sticker|webp/i.test(mime) ||
      qMsg.stickerMessage ||
      qMsg.imageMessage
    ) {
      if (!audioSession.has(m.sender)) {
        return m.reply(
          `❌ ¡No has guardado el audio!\n\n` +
            `*Paso 1:* Responder nota de voz/archivo de audio con \`${p}${cmd}\` primero.`
        );
      }

      await sock
        .sendMessage(m.chat, { react: { text: "⏳", key: m.key } })
        .catch(() => {});

      const savedAudio = audioSession.get(m.sender);
      const rawImg = await downloadQuotedMedia(
        q,
        qMsg.stickerMessage ? "sticker" : "image"
      );
      if (!rawImg) throw new Error("No se pudieron descargar imágenes/pegatinas");

      let stickerBuf = rawImg;
      if (!/webp/i.test(mime) && !qMsg.stickerMessage) {
        stickerBuf = await sharp(rawImg)
          .rotate()
          .resize(512, 512, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .webp({ quality: 82 })
          .toBuffer();
      }

      // Konversi audio ke OGG Opus 48kHz mono agar WhatsApp mengenali Audio Sticker (muncul ikon speaker)
      let oggBuf = savedAudio.buffer;
      let duration = savedAudio.seconds || 3;
      try {
        const conv = await convertAudioToOggOpus(savedAudio.buffer);
        oggBuf = conv.oggBuffer;
        duration = conv.seconds;
      } catch (convErr) {
        console.warn("[AUDIOSTICKER] ffmpeg convert fallback:", convErr.message);
      }

      const uploadOpts = {
        upload: sock.waUploadToServer,
        logger: sock.logger,
      };

      const [audioMedia, stickerMedia] = await Promise.all([
        prepareWAMessageMedia(
          {
            audio: oggBuf,
            mimetype: "audio/ogg; códecs=opus",
            ptt: true,
          },
          uploadOpts
        ),
        prepareWAMessageMedia({ sticker: stickerBuf }, uploadOpts),
      ]);

      if (!stickerMedia?.stickerMessage) {
        throw new Error("No se pudieron preparar los medios adhesivos de la biblioteca.");
      }

      // Patch BOTH encode & fromObject di semua instance proto.Message agar audioStickerMessage tidak terbuang oleh relayMessage
      ensureAllProtosPatched(stickerMedia.constructor);

      const animated = isWebpAnimated(stickerBuf);
      const innerStickerMsg = {
        ...stickerMedia.stickerMessage,
        isAnimated: animated,
        audioMessage: {
          ...audioMedia.audioMessage,
          mimetype: "audio/ogg; códecs=opus",
          seconds: duration,
          ptt: true,
          waveform: generateWaveform(oggBuf),
        },
      };

      await sock.relayMessage(
        m.chat,
        {
          audioStickerMessage: {
            message: {
              stickerMessage: innerStickerMsg,
            },
          },
          messageContextInfo: {
            messageSecret: randomBytes(32),
          },
        },
        {}
      );

      audioSession.delete(m.sender);
      await sock
        .sendMessage(m.chat, { react: { text: "✅", key: m.key } })
        .catch(() => {});
      return;
    }

    return m.reply(
      `✗ No se reconocen los medios. Responder nota de voz/audio (paso 1) o imagen/pegatina (paso 2).`
    );
  } catch (e) {
    console.error("[AUDIOSTICKER ERROR]", e);
    await sock
      .sendMessage(m.chat, { react: { text: "❌", key: m.key } })
      .catch(() => {});
    await m.reply(`✗ Error: ${e.message}`);
  }
}

export { pluginConfig as config, handler };
