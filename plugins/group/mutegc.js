/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import { saluranCtx } from "../../src/lib/core/context.js";

const pluginConfig = {
  name: "mutegc",
  alias: ["mutegrup", "mutebot", "blockbot", "lockbot"],
  category: "group",
  description: "Bloquea los comandos del bot para miembros; solo admin/dueño pueden usarlos",
  usage: ".mutegc",
  example: ".mutegc",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const groupData = db.getGroup(m.chat) || {};

  if (groupData.mutegc) {
    return m.reply(
      `🔇 *Mute del grupo ya activo*\n\n` +
        `> Los miembros no pueden usar los comandos del bot en este grupo\n` +
        `> Solo los administradores del grupo y el propietario del bot tienen acceso\n\n` +
        `_Escribe *${m.prefix}unmutegc* para abrir_`
    );
  }

  db.setGroup(m.chat, { mutegc: true });
  const ctx = saluranCtx();
  const groupName = m.groupMetadata?.subject || "este grupo";

  return m.reply(
    `🔇 *Mute del grupo activo*\n\n` +
      `> Grupo: *${groupName}*\n` +
      `> Los miembros no pueden usar los comandos del bot\n` +
      `> Los administradores del grupo y el propietario del bot siguen teniendo acceso\n\n` +
      `_Escribe *${m.prefix}unmutegc* para abrir_`,
    { contextInfo: ctx }
  );
}

function isMutegc(groupJid, db) {
  const group = db.getGroup(groupJid) || {};
  return !!group.mutegc;
}

export { pluginConfig as config, handler, isMutegc };
