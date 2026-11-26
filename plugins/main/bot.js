/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import { runMenuLoading } from "../../src/lib/core/menu-loading.js";
import { getDailyFeatureStatus } from "../../src/lib/data/daily-limit.js";

const pluginConfig = {
  name: "bot",
  alias: ["statusbot"],
  category: "main",
  description: "Muestra el estado del bot y el límite diario de funciones",
  usage: ".bot",
  example: ".bot",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function currentDateText() {
  const parts = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    jam: `${values.hour}:${values.minute}:${values.second}`,
    hari: values.weekday,
    tanggal: values.day,
    tahun: values.year,
    bulan: values.month,
  };
}

async function handler(m, { sock }) {
  await runMenuLoading(sock, m.chat, "estado del bot");
  const db = getDatabase();
  const role = m.isOwner ? "Owner" : (m.isGroup && m.isAdmin ? "Admin" : "Member");
  const waktu = currentDateText();
  const status = getDailyFeatureStatus(db, m.sender, m.groupMetadata?.participants || []);
  const limitText = status.unlimited
    ? "ILIMITADO PERMANENTE"
    : `${status.used}/${status.limit} usados · ${status.remaining} restantes`;

  const text = `🤖 *HOLA, SOY EL BOT Elysia Assistant* 🔥\n\n` +
    `¿En qué te puedo ayudar?\n\n` +
    `╭─〔 *ESTADO DEL BOT* 〕\n` +
    `│ 🕒 Hora    : *${waktu.jam} WIB*\n` +
    `│ 📅 Día     : *${waktu.hari}*\n` +
    `│ 🗓️ Fecha   : *${waktu.tanggal} ${waktu.bulan} ${waktu.tahun}*\n` +
    `│ 👤 Usuario : @${String(m.sender || "").split("@")[0]}\n` +
    `│ 🛡️ Rol     : *${role}*\n` +
    `│ 📊 Límite  : *${limitText}*\n` +
    `╰───────────────\n\n` +
    `✅ El bot está listo. El límite diario se reinicia a las *00.00 WIB*.`;

  return sock.sendMessage(
    m.chat,
    { text, mentions: m.sender ? [m.sender] : [] },
    { quoted: m },
  );
}

export { pluginConfig as config, handler };
