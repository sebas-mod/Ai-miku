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
  description: "Menampilkan status bot dan limit fitur harian",
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
  const parts = new Intl.DateTimeFormat("id-ID", {
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
  await runMenuLoading(sock, m.chat, "status bot");
  const db = getDatabase();
  const role = m.isOwner ? "Owner" : (m.isGroup && m.isAdmin ? "Admin" : "Member");
  const waktu = currentDateText();
  const status = getDailyFeatureStatus(db, m.sender, m.groupMetadata?.participants || []);
  const limitText = status.unlimited
    ? "UNLIMITED PERMANEN"
    : `${status.used}/${status.limit} terpakai · ${status.remaining} tersisa`;

  const text = `🤖 *HALLO SAYA BOT Elysia Assistant* 🔥\n\n` +
    `Ada yang bisa saya bantu?\n\n` +
    `╭─〔 *STATUS BOT* 〕\n` +
    `│ 🕒 Jam     : *${waktu.jam} WIB*\n` +
    `│ 📅 Hari    : *${waktu.hari}*\n` +
    `│ 🗓️ Tanggal : *${waktu.tanggal} ${waktu.bulan} ${waktu.tahun}*\n` +
    `│ 👤 User    : @${String(m.sender || "").split("@")[0]}\n` +
    `│ 🛡️ Jabatan : *${role}*\n` +
    `│ 📊 Limit   : *${limitText}*\n` +
    `╰───────────────\n\n` +
    `✅ Bot siap digunakan. Limit harian reset pukul *00.00 WIB*.`;

  return sock.sendMessage(
    m.chat,
    { text, mentions: m.sender ? [m.sender] : [] },
    { quoted: m },
  );
}

export { pluginConfig as config, handler };
