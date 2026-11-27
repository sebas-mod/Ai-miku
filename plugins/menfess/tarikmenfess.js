/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { store, saveStore, same, menfessCari } from "../../src/lib/features/menfess.js";

const pluginConfig = {
  name: "tarikmenfess",
  alias: ["hapusmenfess"],
  category: "menfess",
  description: "Retira (borra) un menfess ya enviado",
  usage: ".tarikmenfess ID",
  example: ".tarikmenfess AB12C",
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
  const k = store();
  const id = String(text || "").trim().toUpperCase().slice(0, 5);
  if (!/^[A-Z0-9]{5}$/.test(id)) {
    return m.reply(`Formato: *${prefix}tarikmenfess ID*\nID está en el mensaje de confirmación /*${prefix}outboxmenfess*.`);
  }
  const d = k.menfess[id];
  const t = m.isOwner ? (d ? { id, d } : null) : menfessCari(k, m.sender, { id });
  if (!t || (!m.isOwner && !same(t.d.from, m.sender))) return m.reply("🍅 Menfess No se encontró o no era tu publicación.");
  if (t.d.tutup) return m.reply("Menfess ha sido retirado.");

  let terhapus = 0;
  for (const msgId of t.d.kirim || []) {
    const ok = await sock
      .sendMessage(t.d.to, { delete: { remoteJid: t.d.to, fromMe: true, id: msgId } })
      .then(() => true)
      .catch(() => false);
    if (ok) terhapus++;
  }
  t.d.tutup = true;
  saveStore();
  return m.reply(
    `✅ Menfess #${t.id} retirado. ${terhapus} el mensaje se elimina del chat del destinatario (si ha pasado demasiado tiempo, WhatsApp puede negarse a eliminarlo, pero menfess no puede responder nuevamente).`,
  );
}

export { pluginConfig as config, handler };
