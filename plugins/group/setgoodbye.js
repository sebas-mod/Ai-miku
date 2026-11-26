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
  name: "setgoodbye",
  alias: ["customgoodbye"],
  category: "group",
  description: "Set custom goodbye message",
  usage: ".setgoodbye <pesan>",
  example: ".setgoodbye Bye {user}, sampai jumpa lagi!",
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
  const text = m.text || m.args.join(" ");

  if (!text) {
    return m.reply(
      `📝 *sᴇᴛ ɢᴏᴏᴅʙʏᴇ*\n\n` +
        `╭┈┈⬡「 📋 *ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀ* 」\n` +
        `┃ ◦ \`{user}\` - Nombre del miembro\n` +
        `┃ ◦ \`{number}\` - Número del miembro\n` +
        `┃ ◦ \`{group}\` - Nombre del grupo\n` +
        `┃ ◦ \`{desc}\` - Descripción del grupo\n` +
        `┃ ◦ \`{count}\` - Miembros restantes\n` +
        `┃ ◦ \`{owner}\` - Nombre del propietario del grupo\n` +
        `┃ ◦ \`{date}\` - Tanggal (DD/MM/YYYY)\n` +
        `┃ ◦ \`{time}\` - Waktu (HH:mm WIB)\n` +
        `┃ ◦ \`{day}\` - Hari (Senin, Selasa, dll)\n` +
        `┃ ◦ \`{bot}\` - Nombre del bot\n` +
        `┃ ◦ \`{prefix}\` - Prefix bot\n` +
        `╰┈┈⬡\n\n` +
        `\`Ejemplo:\`\n` +
        `\`${m.prefix}setgoodbye Bye {user}! 👋\`\n` +
        `\`Hasta la próxima el {day}, {date}\``,
    );
  }

  db.setGroup(m.chat, { goodbyeMsg: text, goodbye: true, leave: true });
  db.save();

  m.react("✅");

  await m.reply(
    `✅ Mensaje de despedida actualizado a *${text}*\n¿Quieres restablecerlo? Escribe ${m.prefix}resetgoodbye`,
  );
}

export { pluginConfig as config, handler };
