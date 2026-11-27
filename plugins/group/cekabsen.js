/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import moment from "moment-timezone";
import config from "../../config.js";
const pluginConfig = {
  name: "cekabsen",
  alias: ["listabsen", "daftarabsen", "lihathadir"],
  category: "group",
  description: "Muestra la lista de quienes ya marcaron asistencia",
  usage: ".cekabsen",
  example: ".cekabsen",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
if (!global.absensi) global.absensi = {};
async function handler(m, { sock }) {
  const chatId = m.chat;
  if (!global.absensi[chatId]) {
    return m.reply(
      `❌ *NO HAY NINGUNA ASISTENCIA*\n\n` +
        `> ¡No hay ninguna sesión de asistencia en este grupo!\n\n` +
        `> Un administrador puede iniciarla con\n` +
        `> *.mulaiabsen [descripción]*`,
    );
  }
  const absen = global.absensi[chatId];
  const now = moment().tz("Asia/Jakarta");
  const dateStr = now.format("D MMMM YYYY");
  const createdDate = moment(absen.createdAt).tz("Asia/Jakarta");
  const timeStr = createdDate.format("HH:mm");
  let list = "┃ _Nadie ha registrado asistencia todavía_";
  if (absen.peserta.length > 0) {
    list = absen.peserta
      .map((jid, i) => `┃ ${i + 1}. @${jid.split("@")[0]}`)
      .join("\n");
  }
  const saluranId = config.saluran?.id || "120363393471527483@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ai Miku";
  await m.reply(
    `📋 *LISTA DE ASISTENCIAS*\n\n` +
      `╭┈┈⬡「 📋 *INFO* 」\n` +
      `┃ 📝 ${absen.keterangan}\n` +
      `┃ 📅 ${dateStr}\n` +
      `┃ ⏰ Dimulai: ${timeStr}\n` +
      `┃ 👑 Creado: @${absen.createdBy.split("@")[0]}\n` +
      `├┈┈⬡「 👥 *PARTICIPANTES (${absen.peserta.length})* 」\n` +
      `${list}\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `Escribe *${m.prefix}absen* para asistir`,
    { mentions: [...absen.peserta, absen.createdBy] },
  );
}
export { pluginConfig as config, handler };
