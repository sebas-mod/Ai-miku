/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { cfg, store, userData, numOf, same, wibDay, menfessAktif } from "../../src/lib/features/menfess.js";

const waktu = (t) => new Date(t).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const potong = (s, n = 35) => (String(s).length > n ? String(s).slice(0, n) + "…" : String(s));

const pluginConfig = {
  name: "menfessku",
  alias: ["inboxmenfess", "outboxmenfess"],
  category: "menfess",
  description: "Ringkasan menfess, kuota, kotak masuk & terkirim",
  usage: ".menfessku",
  example: ".menfessku",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { command, prefix }) {
  const c = cfg();
  const k = store();
  const user = userData(m.sender) || {};
  const status = (d) => (d.tutup ? "🗑 ditarik" : menfessAktif(d, c) ? "🟢 aktif" : "⏳ kedaluwarsa");
  const urut = (a, b) => (b[1].last || b[1].t) - (a[1].last || a[1].t);
  const masuk = Object.entries(k.menfess).filter(([, d]) => same(d.to, m.sender)).sort(urut);
  const keluar = Object.entries(k.menfess).filter(([, d]) => same(d.from, m.sender)).sort(urut);

  if (command === "inboxmenfess" || command === "outboxmenfess") {
    const inbox = command === "inboxmenfess";
    const list = (inbox ? masuk : keluar).slice(0, 10);
    if (!list.length) return m.reply(inbox ? "Belum ada menfess masuk." : "Kamu belum pernah mengirim menfess.");
    const baris = list.map(
      ([id, d]) => `• *#${id}* · ${waktu(d.last || d.t)} · ${(d.log || [1]).length} pesan · ${status(d)}\n  “${potong(d.pesan)}”`,
    );
    return m.reply(
      `💌 *${inbox ? "MENFESS MASUK" : "MENFESS TERKIRIM"}* (${list.length} terbaru)\n\n${baris.join("\n")}\n\n` +
        (inbox
          ? `Balas: reply pesan menfess-nya\nBlok: ${prefix}blokmenfess ID · Lapor: ${prefix}lapormenfess ID alasan`
          : `Tarik: ${prefix}tarikmenfess ID · Ungkap diri: ${prefix}ungkapmenfess ID`),
    );
  }

  const l = user.menfessLog?.day === wibDay() ? user.menfessLog : { n: 0, nb: 0 };
  const me = numOf(m.sender);
  const diblok = Object.keys(k.menfessPair).filter((x) => x.startsWith(me + "|")).length;
  return m.reply(
    `💌 *MENFESSKU*\n\n` +
      `👤 Samaran : ${user.menfessNama || "Seseorang"}\n` +
      `📨 Kirim hari ini : ${l.n || 0}/${c.maxPerHari}\n` +
      `💬 Balasan hari ini : ${l.nb || 0}/${c.maxBalasPerHari}\n` +
      `📥 Menerima menfess : ${k.menfessBlock[me] ? "ditolak ⛔" : "terbuka ✅"}\n` +
      `🚫 Pengirim diblok : ${diblok}\n` +
      `🗂 Masuk ${masuk.length} · Terkirim ${keluar.length}` +
      (k.menfessBan[me] ? "\n⛔ Kamu sedang dilarang memakai menfess" : "") +
      `\n\n*Perintah*\n` +
      `• ${prefix}menfess nomor|pesan\n` +
      `• Balas: reply pesan menfess lalu tulis balasanmu\n` +
      `• ${prefix}inboxmenfess · ${prefix}outboxmenfess\n` +
      `• ${prefix}samaranmenfess nama\n` +
      `• ${prefix}tarikmenfess ID · ${prefix}ungkapmenfess ID\n` +
      `• ${prefix}blokmenfess · ${prefix}lapormenfess · ${prefix}tolakmenfess`,
  );
}

export { pluginConfig as config, handler };
