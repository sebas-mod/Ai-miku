/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { cfg, store, userData, menfessCari, menfessBalas } from "../../src/lib/features/menfess.js";

const pluginConfig = {
  name: "balas",
  alias: ["balasmenfess", "bm"],
  category: "menfess",
  description: "Balas menfess secara anonim",
  usage: ".balas pesan",
  example: ".balas makasih ya!",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, text, prefix }) {
  const c = cfg();
  const k = store();
  if (!c.on) return m.reply("Fitur menfess sedang dimatikan.");
  if (m.isGroup) return m.reply("Balas menfess lewat chat pribadi bot ya, supaya aman.");

  let pesan = String(text || "").trim();
  let id = "";
  // format "ID|pesan" atau "ID pesan" (ID 5 karakter) tetap didukung
  const mt = pesan.match(/^([A-Za-z0-9]{5})\s*[|\s]\s*([\s\S]+)$/);
  if (mt && k.menfess[mt[1].toUpperCase()]) {
    id = mt[1].toUpperCase();
    pesan = mt[2].trim();
  }
  if (!pesan) {
    return m.reply(
      `Format: *${prefix}balas pesanmu*\n\nCara termudah: *reply* pesan menfess, lalu ketik pesan balasanmu (tanpa perintah juga bisa).\nTanpa reply, balasan dikirim ke menfess terbaru.`,
    );
  }

  const t = menfessCari(k, m.sender, { id, quotedId: m.quoted?.id });
  if (!t) return m.reply("🍅 Tidak ada menfess aktif untuk dibalas.");
  const r = await menfessBalas(sock, { jid: m.sender, user: userData(m.sender), id: t.id, d: t.d, pesan, prefix });
  return m.reply(r.msg);
}

export { pluginConfig as config, handler };
