/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { store, same, menfessCari, menfessLapor } from "../../src/lib/features/menfess.js";

const pluginConfig = {
  name: "lapormenfess",
  alias: ["reportmenfess"],
  category: "menfess",
  description: "Laporkan menfess yang melecehkan / spam ke owner",
  usage: ".lapormenfess [ID] alasan",
  example: ".lapormenfess AB12C isinya melecehkan",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, text, prefix }) {
  const k = store();
  let alasan = String(text || "").trim();
  let id = "";
  const mt = alasan.match(/^([A-Za-z0-9]{5})(?:\s+([\s\S]*))?$/);
  if (mt && k.menfess[mt[1].toUpperCase()]) {
    id = mt[1].toUpperCase();
    alasan = (mt[2] || "").trim();
  }
  const t = menfessCari(k, m.sender, { id, quotedId: m.quoted?.id });
  if (!t || !same(t.d.to, m.sender)) {
    return m.reply(`Pakai: *reply* pesan menfess lalu ketik *${prefix}lapormenfess alasan*, atau *${prefix}lapormenfess ID alasan*.`);
  }
  const r = await menfessLapor(sock, { jid: m.sender, id: t.id, d: t.d, alasan: alasan.slice(0, 200) });
  return m.reply((r.ok ? "🚨 " : "") + r.msg);
}

export { pluginConfig as config, handler };
