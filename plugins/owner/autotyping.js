/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import { saluranCtx } from "../../src/lib/core/context.js";
import config from "../../config.js";

const pluginConfig = {
  name: "autotyping",
  alias: ["typing", "autoketik"],
  category: "owner",
  description: "Auto typing indicator saat menerima pesan",
  usage: ".autotyping on/off",
  example: ".autotyping on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const current = db.setting("autoTyping") ?? config.features?.autoTyping ?? true;
    return m.reply(
      `⌨️ *Auto Typing*\n\n` +
        `> Estado: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}autotyping on* — Activar\n` +
        `> *${m.prefix}autotyping off* — Nonaktifkan\n\n` +
        `_El bot mostrará el indicador de escritura al recibir mensajes_`
    );
  }

  if (option === "on") {
    db.setting("autoTyping", true);
    const ctx = saluranCtx();
    return m.reply(
      `⌨️ *Escritura automática activa*\n\n` +
        `> El bot mostrará el indicador de escritura`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("autoTyping", false);
    return m.reply(
      `⌨️ *Escritura automática inactiva*\n\n` +
        `> El bot no mostrará el indicador de escritura`
    );
  }

  return m.reply(
    `❌ *Opción no válida*\n\n> Usa *${m.prefix}autotyping on* o *${m.prefix}autotyping off*`
  );
}

export { pluginConfig as config, handler };
