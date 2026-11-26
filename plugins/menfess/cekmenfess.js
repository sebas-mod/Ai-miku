/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { store, numOf } from "../../src/lib/features/menfess.js";

const pluginConfig = {
  name: "cekmenfess",
  alias: [],
  category: "menfess",
  description: "(Owner) lihat pengirim & isi percakapan menfess",
  usage: ".cekmenfess ID",
  example: ".cekmenfess AB12C",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { text }) {
  const k = store();
  const id = String(text || "").trim().toUpperCase();
  const d = k.menfess[id];
  if (!d) return m.reply("ID menfess tidak ditemukan.");
  const w = (t) => new Date(t).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  const log = (d.log || [{ by: "a", t: d.t, pesan: d.pesan }])
    .map((x) => `[${w(x.t)}] ${x.by === "a" ? "Pengirim" : "Penerima"}: ${x.pesan}`)
    .join("\n");
  return m.reply(
    `🍰 *MENFESS ${id}*\n\nDari : ${numOf(d.from)}\nKe   : ${numOf(d.to)}\nWaktu: ${w(d.t)}\nStatus: ${d.tutup ? "ditarik" : "aktif"}${d.dilapor ? " · dilaporkan" : ""}${d.terungkap ? " · identitas diungkap" : ""}\n\n${log}`,
  );
}

export { pluginConfig as config, handler };
