/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";

const pluginConfig = {
  name: "antilinkall",
  alias: ["alall", "antialllink"],
  category: "group",
  description: "Anti todo tipo de enlaces (detecta extensiones de dominio)",
  usage: ".antilinkall <on/off/metode> [kick/remove]",
  example: ".antilinkall on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
  isAdmin: true,
  isBotAdmin: true,
};

function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const groupData = db.getGroup(m.chat) || {};
    const status = groupData.antilinkall || "off";
    const mode = groupData.antilinkallMode || "remove";

    return m.reply(
      `🔗 *Antilink All*\n\n` +
        `> Estado: *${status === "on" ? "Activado ✅" : "Desactivado ❌"}*\n` +
        `> Mode: *${mode.toUpperCase()}*\n\n` +
        `*DETEKSI:*\n` +
        `> • https:// / http:// (con protocolo)\n` +
        `> • www. (subdomain)\n` +
        `> • Domain extension (.com, .id, .io, .net, dll)\n` +
        `> • Shortlink (bit.ly, t.me, tinyurl, dll)\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}antilinkall on* — Activar\n` +
        `> *${m.prefix}antilinkall off* — Desactivar\n` +
        `> *${m.prefix}antilinkall metode kick* — Mode kick user\n` +
        `> *${m.prefix}antilinkall metode remove* — Modo borrar mensaje`
    );
  }

  if (option === "on") {
    db.setGroup(m.chat, { antilinkall: "on" });
    return m.reply(
      `✅ *Antilink All activado*\n\n` +
        `> Todos los enlaces se detectan automáticamente\n> Detecta extensiones de dominio, no solo http/https`
    );
  }

  if (option === "off") {
    db.setGroup(m.chat, { antilinkall: "off" });
    return m.reply(`❌ *Antilink All desactivado*\n\n> Los enlaces ya no se filtrarán`);
  }

  if (option.startsWith("metode")) {
    const method = m.args?.[1]?.toLowerCase();
    if (method === "kick") {
      db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "kick" });
      return m.reply(
        `✅ *Antilink All — Modo expulsar*\n\n> Quien envíe un enlace será expulsado`
      );
    } else if (method === "remove" || method === "delete") {
      db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "remove" });
      return m.reply(
        `✅ *Antilink All — Modo borrar*\n\n> Los mensajes con enlaces se eliminarán`
      );
    } else {
      return m.reply(
        `❌ *Método no válido*\n\n> Usa *kick* o *remove*\n> Ejemplo: *${m.prefix}antilinkall metode kick*`
      );
    }
  }

  if (option === "kick") {
    db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "kick" });
    return m.reply(
      `✅ *Antilink All — Mode Kick*\n\n> User yang kirim link akan di-kick`
    );
  }

  if (option === "remove" || option === "delete") {
    db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "remove" });
    return m.reply(
      `✅ *Antilink All — Modo borrar*\n\n> Los mensajes con enlaces se eliminarán`
    );
  }

  return m.reply(
    `❌ *Opción no válida*\n\n> Usa *on*, *off*, *metode kick* o *metode remove*`
  );
}

export { pluginConfig as config, handler };
