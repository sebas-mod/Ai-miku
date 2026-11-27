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
  description: "El remitente revela su identidad al destinatario (por decisión propia)",
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
  if (m.isGroup) return m.reply("Úsalo en el chat privado del bot.");
  const k = store();
  const [a, b] = String(text || "").trim().split(/\s+/);
  const id = /^[A-Za-z0-9]{5}$/.test(a || "") ? a.toUpperCase() : "";
  const t = menfessCari(k, m.sender, { id, quotedId: m.quoted?.id });
  if (!t || !same(t.d.from, m.sender)) return m.reply(`Formato: *${prefix}ungkapmenfess ID ya*`);
  if (t.d.tutup) return m.reply("Menfess ha sido retirado.");
  if (t.d.terungkap) return m.reply("Ya has revelado tu identidad el menfess.");
  if (!/^(ya|y|yes|ok)$/i.test(id ? b || "" : a || "")) {
    return m.reply(
      `⚠️ Tu DNI (número WhatsApp) se enviará al destinatario menfess #${t.id} y no se puede cancelar.\n\nContinuar: *${prefix}ungkapmenfess ${t.id} Sí*`,
    );
  }
  try {
    await sock.sendMessage(toJid(t.d.to), {
      text: `🔓 *PENGUNGKAPAN* · #${t.id}\n\nEl remitente de este menfess revela su identidad:\nwa.me/${m.sender.split("@")[0]}`,
    });
  } catch {
    return m.reply("No se pudo enviar, no se puede contactar al destinatario.");
  }
  t.d.terungkap = true;
  saveStore();
  return m.reply("✅ Tu identidad ha sido entregada al destinatario.");
}

export { pluginConfig as config, handler };
