/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { store, saveStore, same, toJid, menfessCari } from "../../src/lib/features/menfess.js";

const pluginConfig = {
  name: "ungkapmenfess",
  alias: ["reveal"],
  category: "menfess",
  description: "Pengirim membuka identitasnya ke penerima (pilihan sendiri)",
  usage: ".ungkapmenfess ID ya",
  example: ".ungkapmenfess AB12C ya",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, text, prefix }) {
  if (m.isGroup) return m.reply("Pakai di chat pribadi bot ya.");
  const k = store();
  const [a, b] = String(text || "").trim().split(/\s+/);
  const id = /^[A-Za-z0-9]{5}$/.test(a || "") ? a.toUpperCase() : "";
  const t = menfessCari(k, m.sender, { id, quotedId: m.quoted?.id });
  if (!t || !same(t.d.from, m.sender)) return m.reply(`Format: *${prefix}ungkapmenfess ID ya*`);
  if (t.d.tutup) return m.reply("Menfess itu sudah ditarik.");
  if (t.d.terungkap) return m.reply("Identitasmu sudah pernah kamu ungkap di menfess itu.");
  if (!/^(ya|y|yes|ok)$/i.test(id ? b || "" : a || "")) {
    return m.reply(
      `⚠️ Identitasmu (nomor WhatsApp) akan dikirim ke penerima menfess #${t.id} dan tidak bisa dibatalkan.\n\nLanjut: *${prefix}ungkapmenfess ${t.id} ya*`,
    );
  }
  try {
    await sock.sendMessage(toJid(t.d.to), {
      text: `🔓 *PENGUNGKAPAN* · #${t.id}\n\nPengirim menfess ini membuka identitasnya:\nwa.me/${m.sender.split("@")[0]}`,
    });
  } catch {
    return m.reply("Gagal mengirim, penerima tidak bisa dihubungi.");
  }
  t.d.terungkap = true;
  saveStore();
  return m.reply("✅ Identitasmu sudah diberikan ke penerima.");
}

export { pluginConfig as config, handler };
