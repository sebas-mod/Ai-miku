/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import {
  isToxic,
  handleToxicMessage,
  DEFAULT_TOXIC_WORDS,
} from "./antitoxic.js";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/data/database.js";
import te from "../../src/lib/core/error.js";
import { saluranCtx } from "../../src/lib/core/context.js";
const pluginConfig = {
  name: "notifgantitag",
  alias: ["notiflabel", "notiftag", "labeltag"],
  category: "group",
  description: "Mengatur notifikasi perubahan label/tag member",
  usage: ".notifgantitag <on/off>",
  example: ".notifgantitag on",
  isGroup: true,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const sub2 = args[1]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.notifLabelChange === true;
  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(`❌ ¡Solo el propietario puede usar esta función!`);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { notifLabelChange: true });
        count++;
      }
      m.react("✅");
      return m.reply(
        `✅ *NOTIF ETIQUETA GLOBAL ON*\n\n` +
          `> Notificaciones de cambio de etiqueta activadas en *${count}* grupos!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(`❌ ¡Solo el propietario puede usar esta función!`);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { notifLabelChange: false });
        count++;
      }
      m.react("✅");
      return m.reply(
        `❌ *NOTIF ETIQUETA GLOBAL OFF*\n\n` +
          `> Notificaciones de cambio de etiqueta desactivadas en *${count}* grupos!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "on") {
    if (currentStatus) {
      return m.reply(
        `⚠️ *NOTIF ETIQUETA YA ACTIVA*\n\n` +
          `> Estado: *✅ ON*\n` +
          `> Las notificaciones de cambio de etiqueta ya están activas en este grupo.\n\n` +
          `_Usa \`${m.prefix}notifgantitag off\` para desactivarlo._`,
      );
    }
    db.setGroup(m.chat, { notifLabelChange: true });
    return m.reply(
      `✅ *NOTIF ETIQUETA ACTIVADA*\n\n` +
        `> ¡Las notificaciones de cambio de etiqueta de los miembros se han activado!\n` +
        `> El bot avisará cuando se cambie la etiqueta de un miembro.\n\n` +
        `_Ejemplo: Un administrador añadió la etiqueta "VIP" a un miembro_`,
    );
  }
  if (sub === "off") {
    if (!currentStatus) {
      return m.reply(
        `⚠️ *NOTIF ETIQUETA YA INACTIVA*\n\n` +
          `> Estado: *❌ OFF*\n` +
          `> Las notificaciones de cambio de etiqueta ya están desactivadas en este grupo.\n\n` +
          `_Usa \`${m.prefix}notifgantitag on\` para activarlo._`,
      );
    }
    db.setGroup(m.chat, { notifLabelChange: false });
    return m.reply(
      `❌ *NOTIF ETIQUETA DESACTIVADA*\n\n` +
        `> Las notificaciones de cambio de etiqueta de los miembros se han desactivado.`,
    );
  }
  m.reply(
    `🏷️ *NOTIF CAMBIO DE ETIQUETA*\n\n` +
      `> Estado: *${currentStatus ? "✅ ON" : "❌ OFF"}*\n\n` +
      `\`\`\`━━━ OPCIONES ━━━\`\`\`\n` +
      `> \`${m.prefix}notifgantitag on\` → Activar\n` +
      `> \`${m.prefix}notifgantitag off\` → Desactivar\n` +
      `> \`${m.prefix}notifgantitag on all\` → Global ON (owner)\n` +
      `> \`${m.prefix}notifgantitag off all\` → Global OFF (owner)\n\n` +
      `> 📋 *Esta función avisará cuando:*\n` +
      `> • Un administrador añada una etiqueta a un miembro\n` +
      `> • Un administrador elimine una etiqueta a un miembro\n` +
      `> • Cambie la etiqueta de un miembro`,
  );
}
async function handleLabelChange(msg, sock) {
  try {
    const db = getDatabase();
    const protocolMessage = msg.message?.protocolMessage;
    if (!protocolMessage) return false;
    if (protocolMessage.type !== 30) return false;
    const memberLabel = protocolMessage.memberLabel;
    if (!memberLabel) return false;
    const groupJid = msg.key.remoteJid;
    if (!groupJid?.endsWith("@g.us")) return false;
    const groupData = db.getGroup(groupJid) || {};
    const participant = msg.key.participant || msg.participant || "Unknown";
    const label = memberLabel.label || "";
    if (groupData.antitoxic && label && label.trim()) {
      try {
        const toxicWords = groupData.toxicWords || DEFAULT_TOXIC_WORDS;
        const toxicCheck = isToxic(label, toxicWords);
        if (toxicCheck.toxic) {
          await sock.sendText(
            groupJid,
            `Hei @${participant.split("@")[0]}, ¡tu etiqueta contiene una palabra tóxica!`,
            null,
            {
              mentions: [participant],
              contextInfo: {
                ...saluranCtx(),
                mentionedJid: [participant],
              },
            },
          );
          return true;
        }
      } catch {}
    }
    if (groupData.notifLabelChange !== true) return false;
    let groupMeta = null;
    try {
      groupMeta = await sock.groupMetadata(groupJid);
    } catch {}
    let notifText = "";
    if (label && label.trim()) {
      notifText = `🎉 @${participant.split("@")[0]} ha cambiado la etiqueta a *${label}*`;
    } else {
      notifText = `🥗 @${participant.split("@")[0]} ha eliminado la etiqueta`;
    }
    console.log(notifText);
    await sock.sendText(groupJid, notifText, null, {
      mentions: [participant],
      contextInfo: {
        ...saluranCtx(),
        mentionedJid: [participant],
      },
    });
    return true;
  } catch (error) {
    console.error("[NotifLabelChange] Error:", error.message);
    return false;
  }
}
export { pluginConfig as config, handler, handleLabelChange };
