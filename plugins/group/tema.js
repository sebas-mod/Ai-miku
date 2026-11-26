/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import pb from "protobufjs/minimal.js";
import * as baileys from "@rexxhayanasi/elaina-baileys";
import config from "../../config.js";

const Writer = pb.Writer || pb.default?.Writer;
const proto = baileys.proto || baileys.WAProto || baileys.default?.proto;

const pluginConfig = {
  name: "tema",
  alias: ["settema", "theme", "temagc"],
  category: "group",
  description:
    "Cambia el tema de color o el fondo del chat del grupo (hex, preajuste, foto, documento, URL)",
  usage: ".tema <#hex|color|reset> o responde a una foto",
  example: ".tema pink | .tema #ff69b4 | .tema reset",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

const COLOR_PRESETS = {
  pink: "ff69b4",
  biru: "1e90ff",
  ungu: "9b59b6",
  hitam: "121212",
  hijau: "2ecc71",
  merah: "e74c3c",
  kuning: "f1c40f",
  oren: "e67e22",
  putih: "f5f6fa",
};

const normId = (jid) => String(jid || "").split("@")[0].split(":")[0];

const findImageMedia = (obj, depth = 0, hintType = "") => {
  if (!obj || typeof obj !== "object" || depth > 7) return null;

  if (obj.imageMessage)
    return findImageMedia(obj.imageMessage, depth + 1, "image");
  if (
    obj.documentMessage &&
    /^image\//i.test(obj.documentMessage.mimetype || "")
  ) {
    return findImageMedia(obj.documentMessage, depth + 1, "document");
  }
  if (obj.viewOnceMessage?.message)
    return findImageMedia(obj.viewOnceMessage.message, depth + 1, hintType);
  if (obj.viewOnceMessageV2?.message)
    return findImageMedia(obj.viewOnceMessageV2.message, depth + 1, hintType);
  if (obj.viewOnceMessageV2Extension?.message) {
    return findImageMedia(
      obj.viewOnceMessageV2Extension.message,
      depth + 1,
      hintType
    );
  }
  if (obj.ephemeralMessage?.message)
    return findImageMedia(obj.ephemeralMessage.message, depth + 1, hintType);
  if (obj.documentWithCaptionMessage?.message) {
    return findImageMedia(
      obj.documentWithCaptionMessage.message,
      depth + 1,
      "document"
    );
  }
  if (obj.editedMessage?.message)
    return findImageMedia(obj.editedMessage.message, depth + 1, hintType);

  if (obj.msg && typeof obj.msg === "object") {
    const mtype = String(obj.mtype || "");
    const nextHint = /image/i.test(mtype)
      ? "image"
      : /document/i.test(mtype)
        ? "document"
        : hintType;
    const found = findImageMedia(obj.msg, depth + 1, nextHint);
    if (found) return found;
  }

  if (obj.message && typeof obj.message === "object") {
    const found = findImageMedia(obj.message, depth + 1, hintType);
    if (found) return found;
  }

  if (obj.fakeObj?.message && typeof obj.fakeObj.message === "object") {
    const found = findImageMedia(obj.fakeObj.message, depth + 1, hintType);
    if (found) return found;
  }

  if (obj.mediaKey && (obj.directPath || obj.url)) {
    const mime = String(obj.mimetype || "");
    if (hintType === "image" || /^image\//i.test(mime)) {
      const dlType =
        hintType ||
        (mime && !/^image\/(jpeg|jpg|png|webp)$/i.test(mime)
          ? "document"
          : "image");
      return { media: obj, dlType };
    }
  }

  return null;
};

const extractMediaTarget = (m) => {
  if (m.quoted) {
    const foundQuoted = findImageMedia(m.quoted);
    if (foundQuoted) return { holder: m.quoted, ...foundQuoted };
  }
  const foundSelf = findImageMedia(m);
  if (foundSelf) return { holder: m, ...foundSelf };
  return null;
};

const getMediaBuffer = async (sock, target) => {
  const { holder, media, dlType } = target;

  if (typeof holder?.download === "function") {
    const buf = await holder.download().catch(() => null);
    if (Buffer.isBuffer(buf) && buf.length) return buf;
  }
  if (typeof sock?.downloadM === "function" && holder) {
    const buf = await sock.downloadM(holder).catch(() => null);
    if (Buffer.isBuffer(buf) && buf.length) return buf;
  }

  const stream = await baileys.downloadContentFromMessage(media, dlType);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
};

const fetchUrlBuffer = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ctype = res.headers.get("content-type") || "";
  if (!/^image\//i.test(ctype)) throw new Error("La URL no es un archivo de imagen");
  return Buffer.from(await res.arrayBuffer());
};

const encryptChatWallpaper = (imgBuf) => {
  const mediaKey = crypto.randomBytes(32);
  const expanded = Buffer.from(
    crypto.hkdfSync(
      "sha256",
      mediaKey,
      Buffer.alloc(32),
      Buffer.from("WhatsApp Chat Wallpaper Keys"),
      112
    )
  );
  const iv = expanded.subarray(0, 16);
  const cipherKey = expanded.subarray(16, 48);
  const macKey = expanded.subarray(48, 80);

  const cipher = crypto.createCipheriv("aes-256-cbc", cipherKey, iv);
  const enc = Buffer.concat([cipher.update(imgBuf), cipher.final()]);
  const mac = crypto
    .createHmac("sha256", macKey)
    .update(Buffer.concat([iv, enc]))
    .digest()
    .subarray(0, 10);
  const encFile = Buffer.concat([enc, mac]);

  return {
    encFile,
    mediaKey,
    fileSha256: crypto.createHash("sha256").update(imgBuf).digest(),
    fileEncSha256: crypto.createHash("sha256").update(encFile).digest(),
  };
};

const uploadDirectWallpaperMms = async (sock, encFile, fileEncSha256) => {
  const mediaConn =
    (await sock.refreshMediaConn?.(false).catch(() => null)) ||
    (await sock.refreshMediaConn?.(true).catch(() => null));
  const auth = mediaConn?.auth;
  const hosts = mediaConn?.hosts?.length
    ? mediaConn.hosts
    : [{ hostname: "mmg.whatsapp.net" }];
  if (!auth) return null;

  const token = fileEncSha256.toString("base64url");

  for (const h of hosts) {
    const host = h.hostname || h;
    const url = `https://${host}/mms/chat-wallpaper-image/${encodeURIComponent(token)}?auth=${encodeURIComponent(auth)}&token=${encodeURIComponent(token)}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          Origin: "https://web.whatsapp.com",
        },
        body: encFile,
      });
      if (!res.ok) continue;
      const json = await res.json().catch(() => null);
      const directPath = json?.direct_path || json?.directPath;
      if (directPath) return directPath;
    } catch {}
  }

  return null;
};

const uploadWallpaper = async (sock, imgBuf) => {
  const { encFile, mediaKey, fileSha256, fileEncSha256 } =
    encryptChatWallpaper(imgBuf);

  const directMmsPath = await uploadDirectWallpaperMms(
    sock,
    encFile,
    fileEncSha256
  );
  if (directMmsPath) {
    return {
      directPath: directMmsPath,
      mediaKey,
      fileEncSha256,
      fileSha256,
    };
  }

  const tmpFile = path.join(
    os.tmpdir(),
    `wp_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.enc`
  );
  try {
    fs.writeFileSync(tmpFile, encFile);
    const up = await sock.waUploadToServer(tmpFile, {
      fileEncSha256B64: fileEncSha256.toString("base64"),
      mediaType: "image",
    });

    if (!up?.directPath) {
      throw new Error("El servidor CDN no devolvió directPath");
    }

    return {
      directPath: up.directPath,
      mediaKey,
      fileEncSha256,
      fileSha256,
    };
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
};

const encodeChatThemePayload = (themeObj) => {
  const ChatThemeSetting = proto?.Message?.ChatThemeSetting;
  if (ChatThemeSetting?.encode) {
    return ChatThemeSetting.encode(ChatThemeSetting.create(themeObj)).finish();
  }

  const w = Writer.create()
    .uint32(8)
    .int64(themeObj.settingTimestampMs || Date.now());
  if (themeObj.clearTheme) {
    w.uint32(16).bool(true);
  } else if (themeObj.solidColor) {
    const {
      backgroundLightArgb,
      backgroundDarkArgb,
      isDoodleEnabled = true,
    } = themeObj.solidColor;
    w.uint32(90)
      .fork()
      .uint32(13)
      .fixed32(backgroundLightArgb)
      .uint32(21)
      .fixed32(backgroundDarkArgb)
      .uint32(24)
      .bool(isDoodleEnabled)
      .ldelim();
  } else if (themeObj.customImage) {
    const {
      directPath,
      mediaKey,
      fileEncSha256,
      fileSha256,
      dimLevel = 0,
    } = themeObj.customImage;
    w.uint32(106)
      .fork()
      .uint32(10)
      .string(directPath)
      .uint32(18)
      .bytes(mediaKey)
      .uint32(26)
      .bytes(fileEncSha256)
      .uint32(34)
      .bytes(fileSha256)
      .uint32(45)
      .float(dimLevel)
      .ldelim();
  }
  return w.finish();
};

async function handler(m, extra = {}) {
  const sock = extra.sock;
  const text = extra.text ?? m.text ?? "";
  const reply = extra.reply || ((t) => m.reply(t));
  const usedPrefix = extra.usedPrefix || extra.prefix || m.prefix || ".";
  const command = extra.command || m.command || "tema";
  const isOwner = Boolean(extra.isOwner ?? m.isOwner);
  const botName = config.bot?.name || "Elysia Assistant";

  if (!m.chat.endsWith("@g.us")) {
    return reply("❌ Este comando solo se puede usar dentro de un grupo~");
  }

  const meta = await sock.groupMetadata(m.chat).catch(() => null);
  if (!meta) return reply("❌ No se pudieron obtener los datos del grupo~");

  const senderNum = normId(m.sender || m.key?.participant);
  const me = sock.authState?.creds?.me || sock.user || {};
  const botIds = new Set([normId(me.id), normId(me.lid)].filter(Boolean));

  const isSenderAdmin = meta.participants?.some(
    (p) =>
      (normId(p.id) === senderNum || normId(p.lid) === senderNum) &&
      (p.admin === "admin" || p.admin === "superadmin")
  );
  const isBotAdmin = meta.participants?.some(
    (p) =>
      (botIds.has(normId(p.id)) || botIds.has(normId(p.lid))) &&
      (p.admin === "admin" || p.admin === "superadmin")
  );

  if (!isSenderAdmin && !isOwner) {
    return reply(
      "❌ Solo los administradores del grupo o el dueño pueden cambiar el tema~"
    );
  }

  if (meta.restrict && !isBotAdmin) {
    return reply(
      "❌ Haz primero al bot administrador del grupo para que pueda cambiar el tema~"
    );
  }

  const q = String(text || "").trim();
  const mediaTarget = extractMediaTarget(m);
  const urlMatch = q.match(/^(https?:\/\/\S+)$/i);

  if (!q && !mediaTarget) {
    return reply(
      `🎨 *CAMBIAR TEMA Y FONDO DEL GRUPO*\n\n` +
        `• *Color hex:* ${usedPrefix}${command} #ff69b4\n` +
        `• *Color rápido:* ${usedPrefix}${command} pink\n` +
        `  _(pink, biru, ungu, hitam, hijau, merah, kuning, oren, putih)_\n` +
        `• *Fondo con foto:* responde o envía una foto, un documento de imagen o un enlace de foto + ${usedPrefix}${command}\n` +
        `• *Volver al tema original:* ${usedPrefix}${command} reset\n\n` +
        `✨ ${botName}`
    );
  }

  await sock
    .sendMessage(m.chat, { react: { text: "⏳", key: m.key } })
    .catch(() => {});

  try {
    const themePayload = { settingTimestampMs: Date.now() };
    const presetHex = COLOR_PRESETS[q.toLowerCase()];
    const hexInput =
      presetHex || (/^#?[0-9a-f]{6}$/i.test(q) ? q.replace("#", "") : null);
    let modeLabel = "";

    if (/^(reset|hapus|clear|limpar)$/i.test(q)) {
      themePayload.clearTheme = true;
      modeLabel = "Vuelto al tema original";
    } else if (hexInput) {
      const cor = (0xff000000 | parseInt(hexInput, 16)) >>> 0;
      themePayload.solidColor = {
        backgroundLightArgb: cor,
        backgroundDarkArgb: cor,
        isDoodleEnabled: true,
      };
      modeLabel = `Color #${hexInput.toUpperCase()}`;
    } else if (mediaTarget || urlMatch) {
      const imgBuf = mediaTarget
        ? await getMediaBuffer(sock, mediaTarget)
        : await fetchUrlBuffer(urlMatch[1]);

      if (!Buffer.isBuffer(imgBuf) || !imgBuf.length) {
        throw new Error("La imagen está vacía o no se pudo descargar");
      }

      const up = await uploadWallpaper(sock, imgBuf);
      themePayload.customImage = {
        directPath: up.directPath,
        mediaKey: up.mediaKey,
        fileEncSha256: up.fileEncSha256,
        fileSha256: up.fileSha256,
        dimLevel: 0,
      };
      modeLabel = mediaTarget
        ? `Fondo (${mediaTarget.dlType})`
        : "Fondo desde URL";
    } else {
      return reply(
        `Formato no reconocido~ Usa un código hex (\`#ff69b4\`), un nombre de color (\`pink\`), responde con una foto o documento de imagen, o escribe \`${usedPrefix}${command} reset\``
      );
    }

    const themeBytes = encodeChatThemePayload(themePayload);
    const msg = Writer.create()
      .uint32(98)
      .fork()
      .uint32(16)
      .int32(34)
      .uint32(242)
      .bytes(themeBytes)
      .ldelim()
      .finish();

    const modo = meta.addressingMode || "lid";
    const meId = modo === "lid" && me.lid ? me.lid : me.id;
    const { ciphertext } = await sock.signalRepository.encryptGroupMessage({
      group: m.chat,
      data: baileys.writeRandomPadMax16(msg),
      meId,
    });

    await sock.sendNode({
      tag: "message",
      attrs: {
        id: baileys.generateMessageIDV2(me.id),
        to: m.chat,
        type: "media",
        addressing_mode: modo,
      },
      content: [
        {
          tag: "enc",
          attrs: {
            v: "2",
            type: "skmsg",
            mediatype: "chat_theme",
          },
          content: ciphertext,
        },
      ],
    });

    await sock
      .sendMessage(m.chat, { react: { text: "✅", key: m.key } })
      .catch(() => {});
    return reply(
      `✅ ¡Tema del grupo cambiado!\n🎨 *Tema:* ${modeLabel}\n\n✨ ${botName}`
    );
  } catch (err) {
    await sock
      .sendMessage(m.chat, { react: { text: "❌", key: m.key } })
      .catch(() => {});
    return reply(`❌ No se pudo cambiar el tema del grupo:\n${err.message}`);
  }
}

export { pluginConfig as config, handler };
