/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import { fetchGroupsSafe } from "../../src/lib/features/jpm-helper.js";
import { saluranCtx } from "../../src/lib/core/context.js";
import config from "../../config.js";
import te from "../../src/lib/core/error.js";

const pluginConfig = {
  name: "bcgc",
  alias: [
    "broadcastgc",
    "bcgroup",
    "jedabcgc",
    "delaybcgc",
    "setjedabcgc",
    "stopbcgc",
    "stopbroadcastgc",
  ],
  category: "owner",
  description:
    "Envía un mensaje a todos los grupos, con todo tipo de multimedia",
  usage: ".bcgc",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function parseDelay(input) {
  if (!input) return null;
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const val = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case "s":
      return val * 1000;
    case "m":
      return val * 60 * 1000;
    case "h":
      return val * 60 * 60 * 1000;
    case "d":
      return val * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

function formatDelay(ms) {
  if (ms >= 86400000) return `${(ms / 86400000).toFixed(0)} días`;
  if (ms >= 3600000) return `${(ms / 3600000).toFixed(0)} horas`;
  if (ms >= 60000) return `${(ms / 60000).toFixed(0)} minutos`;
  return `${(ms / 1000).toFixed(0)} segundos`;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const command = m.command?.toLowerCase() || "";
  const input = m.fullArgs?.trim() || m.text?.trim() || "";

  if (command === "stopbcgc" || command === "stopbroadcastgc") {
    if (!global.statusBcgc) {
      return m.reply(`❌ No hay ninguna difusión a grupos en curso.`);
    }
    global.stopBcgc = true;
    m.react("⏹️");
    return m.reply(
      `⏹️ *Difusión a grupos detenida*\n\n> Deteniendo la difusión...`,
    );
  }

  if (
    command === "jedabcgc" ||
    command === "delaybcgc" ||
    command === "setjedabcgc"
  ) {
    return handleSetDelay(m, db, input);
  }

  if (input.toLowerCase() === "on") {
    db.setting("bcgcEnabled", true);
    return m.reply(
      `✅ *Difusión a grupos activada*\n\n> Ya puedes enviar difusiones a todos los grupos.`,
    );
  }

  if (input.toLowerCase() === "off") {
    db.setting("bcgcEnabled", false);
    return m.reply(
      `✅ *Difusión a grupos desactivada*\n\n> La difusión a grupos se ha desactivado.`,
    );
  }

  if (!input && !m.quoted) {
    const enabled = db.setting("bcgcEnabled");
    const jeda = db.setting("jedaBcgc") || 5000;
    return m.reply(
      `📢 *Difusión a grupos*\n\n` +
        `Envía un mensaje a todos los grupos a la vez con un solo comando.\n\n` +
        `*Estado actual:*\n` +
        `> Broadcast: *${enabled ? "✅ Activo" : "❌ Inactivo"}*\n` +
        `> Jeda: *${formatDelay(jeda)}* (*${jeda}ms*)\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}bcgc on* — Activar difusión\n` +
        `> *${m.prefix}bcgc off* — Nonaktifkan broadcast\n` +
        `> *${m.prefix}bcgc <mensaje>* — Envía una difusión de texto\n` +
        `> *${m.prefix}bcgc* (responde a foto/vídeo/audio/documento) — Envía con multimedia\n` +
        `> *${m.prefix}bcgc* (responde a un mensaje de texto) — Envía el contenido del mensaje respondido\n\n` +
        `*JEDA:*\n` +
        `> *${m.prefix}jedabcgc 5s* — Establece el intervalo en 5 segundos\n` +
        `> *${m.prefix}jedabcgc 2m* — Establece el intervalo en 2 minutos\n\n` +
        `*STOP:*\n` +
        `> *${m.prefix}stopbcgc* — Detén la difusión en curso`,
    );
  }

  if (global.statusBcgc) {
    return m.reply(
      `❌ *Difusión en curso*\n\n> Escribe *${m.prefix}stopbcgc* para detenerla primero.`,
    );
  }

  const enabled = db.setting("bcgcEnabled");
  if (!enabled) {
    return m.reply(
      `❌ *Difusión no activada*\n\n> Escribe primero *${m.prefix}bcgc on* para activarla.`,
    );
  }

  m.react("📢");

  try {
    let mediaBuffer = null;
    let mediaType = null;
    let text = input || "";
    const qmsg = m.quoted || m;

    if (!text && m.quoted) {
      text = m.quoted.body || m.quoted.text || m.quoted.contentText || "";
    }

    if (qmsg.isImage) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "image";
      } catch {}
    } else if (qmsg.isVideo) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "video";
      } catch {}
    } else if (qmsg.isAudio || qmsg.mimetype?.startsWith("audio")) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "audio";
      } catch {}
    } else if (qmsg.isSticker) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "sticker";
      } catch {}
    } else if (
      qmsg.isDocument ||
      (qmsg.mimetype && !qmsg.mimetype.startsWith("text/plain"))
    ) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "document";
      } catch {}
    }

    if (!text && !mediaBuffer) {
      m.react("❌");
      return m.reply(
        `❌ *No hay contenido*\n\n` +
          `Envía primero un mensaje, foto, audio, vídeo o documento.\n\n` +
          `*Forma correcta:*\n` +
          `1. Envía texto/foto/vídeo/audio/documento\n` +
          `2. Responde a ese mensaje con *${m.prefix}bcgc*\n` +
          `3. El bot lo enviará a todos los grupos`,
      );
    }

    const allGroups = await fetchGroupsSafe(sock);
    let groupIds = Object.keys(allGroups);

    const blacklist = db.setting("jpmBlacklist") || [];
    const blCount = groupIds.filter((id) => blacklist.includes(id)).length;
    groupIds = groupIds.filter((id) => !blacklist.includes(id));

    if (groupIds.length === 0) {
      m.react("❌");
      return m.reply(
        `❌ *No hay grupos*\n\n> El bot no encontró grupos de destino${blCount > 0 ? ` (${blCount} grupos en la lista negra)` : ""}`,
      );
    }

    const jeda = db.setting("jedaBcgc") || 5000;
    const ctx = saluranCtx();

    await m.reply(
      `📢 *Difusión a grupos iniciada*\n\n` +
        ` > 📝 Mensaje: *${text.substring(0, 50)}${text.length > 50 ? "..." : ""}*\n` +
        ` > 📷 Multimedia: *${mediaBuffer ? mediaType : "Ninguno"}*\n` +
        `> 👥 Target: *${groupIds.length}* grupos\n` +
        `> ⏱️ Jeda: *${formatDelay(jeda)}*\n` +
        `> 📊 Estimasi: *${Math.ceil((groupIds.length * jeda) / 60000)} minutos*\n\n` +
        `_Enviando a todos los grupos..._`,
    );

    global.statusBcgc = true;
    let success = 0;
    let failed = 0;

    for (const gid of groupIds) {
      if (global.stopBcgc) {
        delete global.stopBcgc;
        delete global.statusBcgc;
        await m.reply(
          `⏹️ *Difusión a grupos detenida*\n\n` +
            `> ✅ Correctos: *${success}*\n` +
            `> ❌ Fallidos: *${failed}*\n` +
            `> ⏸️ Sisa: *${groupIds.length - success - failed}*`,
        );
        return;
      }

      try {
        if (mediaType === "sticker") {
          await sock.sendMessage(
            gid,
            { sticker: mediaBuffer, contextInfo: ctx },
            { quoted: m },
          );
        } else if (mediaType === "audio") {
          await sock.sendMessage(
            gid,
            {
              audio: mediaBuffer,
              mimetype: qmsg.mimetype || "audio/mpeg",
              ptt: qmsg.ptt || false,
              contextInfo: ctx,
            },
            { quoted: m },
          );
        } else if (mediaType === "document") {
          await sock.sendMessage(
            gid,
            {
              document: mediaBuffer,
              mimetype: qmsg.mimetype || "application/octet-stream",
              fileName: qmsg.fileName || "file",
              caption: text || undefined,
              contextInfo: ctx,
            },
            { quoted: m },
          );
        } else if (mediaBuffer) {
          await sock.sendMessage(
            gid,
            {
              [mediaType]: mediaBuffer,
              caption: text,
              contextInfo: ctx,
            },
            { quoted: m },
          );
        } else {
          await sock.sendMessage(
            gid,
            { text, contextInfo: ctx },
            { quoted: m },
          );
        }
        success++;
      } catch {
        failed++;
      }

      await new Promise((r) => setTimeout(r, jeda));
    }

    delete global.statusBcgc;
    m.react("✅");
    await m.reply(
      `✅ *¡Difusión a grupos completada!*\n\n` +
        `> ✅ Correctos: *${success}*\n` +
        `> ❌ Fallidos: *${failed}*\n` +
        `> 📊 Total: *${groupIds.length}*`,
    );
  } catch (e) {
    delete global.statusBcgc;
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function handleSetDelay(m, db, input) {
  const current = db.setting("jedaBcgc") || 5000;

  if (!input) {
    return m.reply(
      `⏱️ *Intervalo de difusión a grupos*\n\n` +
        `Ajusta la pausa entre envíos a cada grupo.\n` +
        `Cuanto mayor sea la pausa, más seguro frente a la detección de spam.\n\n` +
        `> Pausa actual: *${formatDelay(current)}* (*${current}ms*)\n\n` +
        `*CÓMO USAR:*\n` +
        `> *${m.prefix}jedabcgc <angka><satuan>*\n\n` +
        `*SATUAN:*\n` +
        `> *s* — segundos • *m* — minutos • *h* — horas • *d* — días\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}jedabcgc 5s* → 5 segundos\n` +
        `> *${m.prefix}jedabcgc 2m* → 2 minutos\n` +
        `> *${m.prefix}jedabcgc 1h* → 1 hora`,
    );
  }

  const ms = parseDelay(input);
  if (!ms || ms < 1000) {
    return m.reply(`❌ Formato incorrecto. Ejemplo: *5s*, *2m*, *1h*, *1d*`);
  }

  db.setting("jedaBcgc", ms);
  return m.reply(
    `✅ *Intervalo de difusión cambiado*\n\n` +
      `> Sebelumnya: *${formatDelay(current)}* (*${current}ms*)\n` +
      `> Ahora: *${formatDelay(ms)}* (*${ms}ms*)\n\n` +
      `> Estimación para 100 grupos: *${Math.ceil((100 * ms) / 60000)} minutos*`,
  );
}

export { pluginConfig as config, handler };
