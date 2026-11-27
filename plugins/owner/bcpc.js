/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import { decodeAndNormalize } from "../../src/lib/core/lid.js";
import config from "../../config.js";

const pluginConfig = {
  name: "bcpc",
  alias: ["broadcastpc", "bcprivate"],
  category: "owner",
  description: "Difunde un mensaje a todos los contactos del chat privado",
  usage: ".bcpc <mensaje>",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function getBcContextInfo() {
  const saluranId = config.saluran?.id || "";
  const saluranName = config.saluran?.name || config.bot?.name || "";
  const ctx = {
    forwardingScore: 1,
    isForwarded: true,
  };
  if (saluranId && saluranId !== "-@newsletter") {
    ctx.forwardedNewsletterMessageInfo = {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: Math.floor(Math.random() * 1000) + 1,
    };
  }
  return ctx;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const input = m.fullArgs?.trim() || m.text?.trim() || "";

  if (!input) {
    const jeda = db.setting("jedaBcpc") || 5000;
    return m.reply(
      `📱 *BROADCAST PRIVATE CHAT*\n\n` +
        `Jeda: ${jeda}ms (${(jeda / 1000).toFixed(1)}s)\n\n` +
        `*USO:*\n` +
        `• \`${m.prefix}bcpc <mensaje>\` — Envía a todos los contactos\n` +
        `• \`${m.prefix}bcpc (reply media)\` — Envía con multimedia\n\n` +
        `⚠️ *Advertencia:* ¡El bot enviará el mensaje a todos los contactos guardados!\n\n` +
        `ℹ️ *Nota:* los contactos solo se detectan si alguna vez escribieron al bot. Los contactos guardados que nunca han chateado no aparecerán.`,
    );
  }

  if (global.statusBcpc) {
    return m.reply(
      `❌ Hay una difusión privada en curso.\nEscribe \`${m.prefix}stopbcpc\` para detenerla.`,
    );
  }

  m.react("📱");

  try {
    let mediaBuffer = null;
    let mediaType = null;
    const qmsg = m.quoted || m;

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
    }

    const privateJids = new Set();
    const botNum = sock.user?.id?.split(":")[0] || "";

    const chatsMap = sock.store?.chats;
    if (chatsMap) {
      for (const [jid] of chatsMap.entries()) {
        const decoded = decodeAndNormalize(jid);
        if (decoded && decoded.endsWith("@s.whatsapp.net")) {
          const num = decoded.split("@")[0];
          if (num !== botNum) privateJids.add(decoded);
        }
      }
    }

    const messagesMap = sock.store?.messages;
    if (messagesMap) {
      for (const [jid] of messagesMap.entries()) {
        const decoded = decodeAndNormalize(jid);
        if (decoded && decoded.endsWith("@s.whatsapp.net")) {
          const num = decoded.split("@")[0];
          if (num !== botNum) privateJids.add(decoded);
        }
      }
    }

    const contactsObj = sock.store?.contacts;
    if (contactsObj) {
      for (const jid of Object.keys(contactsObj)) {
        const decoded = decodeAndNormalize(jid);
        if (decoded && decoded.endsWith("@s.whatsapp.net")) {
          const num = decoded.split("@")[0];
          if (num !== botNum) privateJids.add(decoded);
        }
      }
    }

    if (privateJids.size === 0) {
      m.react("❌");
      return m.reply(
        "❌ No se encontraron contactos.\n\nAsegúrate de que el bot haya recibido algún mensaje de esos contactos.",
      );
    }

    const filtered = [...privateJids];

    const jeda = db.setting("jedaBcpc") || 5000;
    const ctx = getBcContextInfo();

    await sock.sendMessage(
      m.chat,
      {
        text:
          `📱 *DIFUSIÓN PRIVADA*\n\n` +
          `╭┈┈⬡「 📋 *DETALLE* 」\n` +
          `┃ 📝 MENSAJE: \`${input.substring(0, 50)}${input.length > 50 ? "..." : ""}\`\n` +
          `┃ 📷 MULTIMEDIA: \`${mediaBuffer ? mediaType : "Ninguna"}\`\n` +
          `┃ 👥 OBJETIVO: \`${filtered.length}\` contacto\n` +
          `┃ ⏱️ INTERVALO: \`${jeda}ms\`\n` +
          `┃ 📊 ESTIMACIÓN: \`${Math.ceil((filtered.length * jeda) / 60000)} minutos\`\n` +
          `╰┈┈⬡\n\n` +
          `> Memulai broadcast...`,
        contextInfo: ctx,
      },
      { quoted: m },
    );

    global.statusBcpc = true;
    let success = 0;
    let failed = 0;

    for (const jid of filtered) {
      if (global.stopBcpc) {
        delete global.stopBcpc;
        break;
      }
      try {
        if (mediaBuffer) {
          await sock.sendMedia(jid, mediaBuffer, input, null, {
            type: mediaType,
            contextInfo: ctx,
          });
        } else {
          await sock.sendText(jid, input, null, { contextInfo: ctx });
        }
        success++;
      } catch {
        failed++;
      }
      await new Promise((r) => setTimeout(r, jeda));
    }

    delete global.statusBcpc;
    m.react("✅");

    await sock.sendMessage(
      m.chat,
      {
        text:
          `✅ *DIFUSIÓN PRIVADA TERMINADA*\n\n` +
          `╭┈┈⬡「 📊 *RESULTADO* 」\n` +
          `┃ ✅ EXITOSO: \`${success}\`\n` +
          `┃ ❌ FALLIDO: \`${failed}\`\n` +
          `┃ 📊 TOTAL: \`${filtered.length}\`\n` +
          `╰┈┈⬡`,
        contextInfo: ctx,
      },
      { quoted: m },
    );
  } catch (e) {
    delete global.statusBcpc;
    m.react("❌");
    m.reply("Error: " + e.message);
  }
}

export { pluginConfig as config, handler };
