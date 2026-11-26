/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getAssetBuffer, getJpegThumb } from "../../src/lib/core/media.js";
import { fileTypeFromBuffer } from "file-type";
import fs from "fs";
import path from "path";
import { config } from "../../config.js";
import te from "../../src/lib/core/error.js";
import { saluranCtx } from "../../src/lib/core/context.js";

const botConfig = config;

const pluginConfig = {
  name: "swgcall",
  alias: ["swgcsemua", "swgcbroadcast", "swgcbc", "groupstoryall"],
  category: "owner",
  description: "Post Group Status/Story ke SEMUA grup sekaligus (border hijau)",
  usage: ".swgcall <teks> atau reply media",
  example: ".swgcall Pengumuman penting!",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
};

async function sendGroupStatus(sock, jid, content) {
  return await sock.sendMessage(jid, { groupStatusMessage: content });
}

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const text = m.text || "";

  if (args[0] === "--yes") {
    const pending = global._swgcallPending?.get(m.sender);
    if (!pending) {
      return m.reply(
        `⚠️ *No hay datos pendientes. Vuelve a enviar el multimedia + .swgcall*`,
      );
    }

    const { rawContent, groups, tempFile } = pending;

    await m.react("🔄");

    let content = {};
    if (rawContent.image)
      content = { image: rawContent.image, caption: rawContent.caption || "" };
    else if (rawContent.video)
      content = { video: rawContent.video, caption: rawContent.caption || "" };
    else if (rawContent.audio)
      content = {
        audio: rawContent.audio,
        mimetype: rawContent.mimetype || "audio/mpeg",
        ptt: rawContent.ptt || false,
      };
    else if (rawContent.text) content = { text: rawContent.text };

    let success = 0;
    let failed = 0;
    const failedGroups = [];
    const total = groups.length;
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    for (let i = 0; i < groups.length; i++) {
      const [groupId, meta] = groups[i];
      try {
        await sendGroupStatus(sock, groupId, content);
        success++;
      } catch (e) {
        failed++;
        failedGroups.push(meta.subject || groupId);
      }

      if ((i + 1) % 5 === 0) {
        await delay(2000);
      } else {
        await delay(500);
      }
    }

    global._swgcallPending.delete(m.sender);
    if (tempFile && fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch {}
    }

    let report =
      `✅ *DIFUSIÓN SWGC TERMINADA*\n\n` +
      `> Total: *${total}* grup\n` +
      `> Correctos: *${success}* ✅\n` +
      `> Fallidos: *${failed}* ❌`;

    if (failedGroups.length > 0) {
      report +=
        `\n\n*Grupos con error:*\n` + failedGroups.map((g) => `> • ${g}`).join("\n");
    }

    await m.reply(report);
    await m.react("✅");
    return;
  }

  let rawContent = {};
  let buffer, ext, tempFile;
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const source =
    m.quoted &&
    (m.quoted.isImage ||
      m.quoted.isVideo ||
      m.quoted.isAudio ||
      m.quoted.mimetype?.startsWith("audio"))
      ? m.quoted
      : m.isImage || m.isVideo || m.isAudio || m.mimetype?.startsWith("audio")
        ? m
        : null;

  if (source) {
    try {
      buffer = await source.download();
      if (!buffer) return m.reply(`❌ No se pudo obtener el multimedia.`);

      const fileType = await fileTypeFromBuffer(buffer);
      ext = fileType?.ext || "bin";
      tempFile = path.join(tempDir, `swgcall_${Date.now()}.${ext}`);
      fs.writeFileSync(tempFile, buffer);

      const isImage = source.isImage || fileType?.mime?.startsWith("image");
      const isVideo = source.isVideo || fileType?.mime?.startsWith("video");
      const isAudio =
        source.isAudio ||
        fileType?.mime?.startsWith("audio") ||
        source.mimetype?.startsWith("audio");

      if (isImage) {
        rawContent.image = buffer;
        rawContent.caption = text || "";
      } else if (isVideo) {
        rawContent.video = buffer;
        rawContent.caption = text || "";
      } else if (isAudio) {
        rawContent.audio = buffer;
        rawContent.mimetype = fileType?.mime || source.mimetype || "audio/mpeg";
        rawContent.ptt = source.msg?.ptt || false;
      }
    } catch {
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  } else if (text && text.trim()) {
    rawContent.text = text;
    rawContent.font = 0;
    rawContent.backgroundColor = "#128C7E";
  } else {
    return m.reply(
      `⚠️ *CÓMO USAR*\n\n` +
        `> \`${m.prefix}swgcall teks\` - Historia de texto a todos los grupos\n` +
        `> Reply gambar/video/audio + \`${m.prefix}swgcall\`\n` +
        `> Envía una imagen/vídeo con el texto \`${m.prefix}swgcall\`\n\n` +
        `⚠️ _¡Esta función enviará la historia a TODOS los grupos!_`,
    );
  }

  try {
    global.isFetchingGroups = true;
    const groups = await sock.groupFetchAllParticipating();
    global.isFetchingGroups = false;
    const groupList = Object.entries(groups);

    if (groupList.length === 0) {
      return m.reply(`⚠️ *El bot no está en ningún grupo.*`);
    }

    if (!global._swgcallPending) global._swgcallPending = new Map();
    global._swgcallPending.set(m.sender, {
      rawContent,
      groups: groupList,
      tempFile,
      timestamp: Date.now(),
    });

    const mediaType = rawContent.text
      ? "Teks"
      : rawContent.image
        ? "Gambar"
        : rawContent.video
          ? "Video"
          : rawContent.audio
            ? rawContent.ptt
              ? "Voice Note"
              : "Audio"
            : "Unknown";

    let thumbnail = null;
    try {
      thumbnail = await getJpegThumb("swgc");
    } catch {}

    const estimatedTime = Math.ceil(groupList.length * 1.5);

    await sock.sendMessage(m.chat, {
      text:
        `📢 *CONFIRMACIÓN DE DIFUSIÓN SWGC*\n\n` +
        `> Media: *${mediaType}*\n` +
        `> Total Grup: *${groupList.length}*\n` +
        `> Estimasi: *~${estimatedTime} segundos*\n\n` +
        `⚠️ _¡La historia se publicará en TODOS los grupos!_\n` +
        `_Pulsa confirmar para continuar._`,
      contextInfo: {
        ...saluranCtx()
      },
      footer: "elysia MD",
      interactiveButtons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `✅ Enviar a ${groupList.length} grupos`,
            id: `${m.prefix}swgcall --yes`,
          }),
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "❌ Batal",
            id: `${m.prefix}cancelswgcall`,
          }),
        },
      ],
    });
  } catch (error) {
    await m.reply(
      `❌ *ERROR*\n\n> No se pudo obtener la lista de grupos.\n> _${error.message}_`,
    );
    if (tempFile && fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch {}
    }
    global._swgcallPending?.delete(m.sender);
  }
}

export { pluginConfig as config, handler };
