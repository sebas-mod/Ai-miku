/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { store, saveStore, wibDay, menfessNomor } from "../../src/lib/features/menfess.js";

const pluginConfig = {
  name: "banmenfess",
  alias: ["unbanmenfess", "listbanmenfess", "statmenfess"],
  category: "menfess",
  description: "(Dueño) banea o desbanea usuarios de menfess, lista de baneados y estadísticas",
  usage: ".banmenfess número alasan",
  example: ".banmenfess 6281234567890 melecehkan",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { text, command, prefix }) {
  const k = store();

  if (command === "statmenfess") {
    const semua = Object.values(k.menfess);
    const hari = wibDay();
    const laporan = Object.values(k.menfessLapor).reduce((a, v) => a + (v.n || 0), 0);
    return m.reply(
      `📊 *ESTADÍSTICAS DE MENFESS*\n\nGuardado: ${semua.length}\nHoy: ${semua.filter((d) => wibDay(d.t) === hari).length}\nRetirado: ${semua.filter((d) => d.tutup).length}\nReportado: ${semua.filter((d) => d.dilapor).length} (informe total ${laporan})\nDibán: ${Object.keys(k.menfessBan).length}\nRechazar todo: ${Object.keys(k.menfessBlock).length} usuario`,
    );
  }

  if (command === "listbanmenfess") {
    const list = Object.entries(k.menfessBan);
    if (!list.length) return m.reply("Ningún usuario está baneado de menfess.");
    return m.reply(
      `⛔ *BAN MENFESS* (${list.length})\n\n` + list.map(([j, v]) => `• ${j} — ${v.alasan || "-"} (${v.oleh || "owner"})`).join("\n"),
    );
  }

  const [no, ...sisa] = String(text || "").trim().split(/\s+/);
  const n = menfessNomor(no);
  if (!n || n.length < 9) return m.reply(`Formato: *${prefix}${command} número${command === "banmenfess" ? " alasan" : ""}*`);

  if (command === "banmenfess") {
    k.menfessBan[n] = { t: Date.now(), alasan: sisa.join(" ").trim(), oleh: "owner" };
    saveStore();
    return m.reply(`⛔ ${n} dilarang memakai menfess.`);
  }

  // unbanmenfess
  if (!k.menfessBan[n]) return m.reply("Ese número no está prohibido.");
  delete k.menfessBan[n];
  delete k.menfessLapor[n];
  saveStore();
  return m.reply(`✅ Ban menfess ${n} dicabut (hitungan laporannya direset).`);
}

export { pluginConfig as config, handler };
