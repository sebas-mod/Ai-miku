/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
const pluginConfig = {
  name: "setwelcome",
  alias: ["customwelcome"],
  category: "group",
  description: "Set custom welcome message",
  usage: ".setwelcome <pesan>",
  example: ".setwelcome Halo {user}, selamat datang di {group}!",
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
  const db = getDatabase();
  const text = m.fullArgs?.trim() || m.args.join(" ");

  if (!text) {
    return m.reply(
      `📝 *ESTABLECER BIENVENIDA*\n\n` +
        `╭┈┈⬡「 📋 *MARCADORES* 」\n` +
        `┃ ◦ \`{user}\` - Nombre del miembro\n` +
        `┃ ◦ \`{number}\` - Número del miembro\n` +
        `┃ ◦ \`{group}\` - Nombre del grupo\n` +
        `┃ ◦ \`{desc}\` - Descripción del grupo\n` +
        `┃ ◦ \`{count}\` - Número de miembros\n` +
        `┃ ◦ \`{owner}\` - Nombre del propietario del grupo\n` +
        `┃ ◦ \`{date}\` - Tanggal (DD/MM/YYYY)\n` +
        `┃ ◦ \`{time}\` - Hora (HH:mm WIB)\n` +
        `┃ ◦ \`{day}\` - Día (lunes, martes, etc.)\n` +
        `┃ ◦ \`{bot}\` - Nombre del bot\n` +
        `┃ ◦ \`{prefix}\` - Prefix bot\n` +
        `╰┈┈⬡\n\n` +
        `\`Ejemplo:\`\n` +
        `\`${m.prefix}setwelcome ¡Hola {user}! 👋\`\n` +
        `\`Bienvenido a {group} el {day}, {date}\``,
    );
  }

  db.setGroup(m.chat, { welcomeMsg: text, welcome: true });
  db.save();

  m.react("✅");

  await m.reply(
    `✅ Mensaje de bienvenida actualizado a *${text}*\n¿Quieres restablecerlo? Escribe ${m.prefix}resetwelcome`,
  );
}

export { pluginConfig as config, handler };
