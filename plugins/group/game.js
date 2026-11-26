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
  name: "game",
  alias: ["togglegame"],
  category: "group",
  description: "Mengaktifkan atau menonaktifkan fitur game di grup",
  usage: ".game <on/off>",
  example: ".game on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const args = m.text?.trim()?.toLowerCase();

  if (args !== "on" && args !== "off") {
    return m.reply(
      `🎮 *FUNCIONES DE JUEGO DEL GRUPO*\n\n` +
        `Usa este comando para controlar el acceso de los miembros a los juegos.\n\n` +
        `• *${m.prefix}game on* - Los miembros pueden jugar\n` +
        `• *${m.prefix}game off* - Los miembros no pueden jugar\n\n` +
        `*Nota:* Los administradores pueden acceder a los juegos aunque estén desactivados.`,
    );
  }

  const db = getDatabase();
  const group = db.getGroup(m.chat) || db.setGroup(m.chat);

  const isEnable = args === "on";

  if (group.game === isEnable) {
    return m.reply(`🎮 La función de juegos ya está *${isEnable ? "ACTIVA" : "INACTIVA"}* en este grupo.`);
  }

  group.game = isEnable;
  db.setGroup(m.chat, group);

  await m.react("✅");
  return m.reply(
    `✅ La función de juegos se ha *${isEnable ? "ACTIVADO" : "DESACTIVADO"}* en este grupo!\n\n` +
    (isEnable
      ? `Ahora los miembros pueden usar todos los comandos del menú de juegos.`
      : `Los miembros ya no podrán usar los comandos de juegos.`),
  );
}

export { pluginConfig as config, handler };
