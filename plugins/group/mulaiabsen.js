/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js";
const pluginConfig = {
  name: "mulaiabsen",
  alias: ["startabsen", "bukaabsen", "openabsen"],
  category: "group",
  description: "Mulai sesi absen di grup (admin only)",
  usage: ".mulaiabsen [keterangan]",
  example: ".mulaiabsen Rapat Mingguan",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
  isAdmin: true,
};

if (!global.absensi) global.absensi = {};

async function handler(m, { sock }) {
  const chatId = m.chat;

  if (global.absensi[chatId]) {
    return m.reply(
      `❌ *TODAVÍA HAY UNA ASISTENCIA ABIERTA*\n\n` +
        `> ¡Todavía hay una sesión de asistencia en este grupo!\n\n` +
        `> Escribe *.hapusabsen* para eliminarla\n` +
        `> o *.cekabsen* para ver la lista`,
    );
  }

  const keterangan = m.text?.trim() || "Asistencia diaria";

  global.absensi[chatId] = {
    keterangan: keterangan,
    createdBy: m.sender,
    createdAt: new Date().toISOString(),
    peserta: [],
  };

  const saluranId = config.saluran?.id || "120363393471527483@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Elysia Assistant";

  await m.reply(
    `📋 *ABSEN UDAH JALAN NIHH*\n\n` +
      `「 📋 *ɪɴғᴏ* 」\n` +
      `📝 ${keterangan}\n` +
      `👑 Creado por: @${m.sender.split("@")[0]}\n` +
      `👥 Participantes: 0\n\n` +
      `Si quieres participar en la asistencia, escribe *${m.prefix}absen*` +
      `Si eres administrador y quieres revisar la asistencia, escribe *${m.prefix}cekabsen*` +
      `Si eres administrador y quieres borrar la asistencia, escribe *${m.prefix}hapusabsen*`,
    { mentions: [m.sender] },
  );
}

export { pluginConfig as config, handler };
