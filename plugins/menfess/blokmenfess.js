/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { store, saveStore, numOf, same, menfessCari } from "../../src/lib/features/menfess.js";

const pluginConfig = {
  name: "blokmenfess",
  alias: [],
  category: "menfess",
  description: "Blok / buka blokir satu pengirim anonim",
  usage: ".blokmenfess [ID]",
  example: ".blokmenfess AB12C",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { text, prefix }) {
  const k = store();
  const id = String(text || "").trim().toUpperCase().slice(0, 5);
  const t = menfessCari(k, m.sender, { id: /^[A-Z0-9]{5}$/.test(id) ? id : "", quotedId: m.quoted?.id });
  if (!t || !same(t.d.to, m.sender)) {
    return m.reply(`Pakai: *reply* pesan menfess lalu ketik *${prefix}blokmenfess*, atau *${prefix}blokmenfess ID*.`);
  }
  const key = `${numOf(t.d.to)}|${numOf(t.d.from)}`;
  const baru = !k.menfessPair[key];
  if (baru) k.menfessPair[key] = true;
  else delete k.menfessPair[key];
  saveStore();
  return m.reply(
    baru
      ? `🚫 Pengirim menfess #${t.id} diblok. Dia tidak bisa mengirim menfess lagi padamu (dia tidak diberi tahu).\nKetik perintah yang sama untuk membuka blokirnya.`
      : `✅ Blokir pengirim menfess #${t.id} dibuka.`,
  );
}

export { pluginConfig as config, handler };
