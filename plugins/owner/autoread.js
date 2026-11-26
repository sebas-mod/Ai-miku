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
  name: "autoread",
  alias: ["readchat", "autobaca"],
  category: "owner",
  description: "Auto read pesan masuk",
  usage: ".autoread on/off",
  example: ".autoread on",
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
    const current = db.setting("autoRead") ?? config.features?.autoRead ?? false;
    return m.reply(
      `📖 *Auto Read*\n\n` +
        `> Estado: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}autoread on* — Activar\n` +
        `> *${m.prefix}autoread off* — Nonaktifkan\n\n` +
        `_El bot leerá automáticamente los mensajes entrantes_`
    );
  }

  if (option === "on") {
    db.setting("autoRead", true);
    const ctx = saluranCtx();
    return m.reply(
      `📖 *Lectura automática activa*\n\n` +
        `> El bot leerá automáticamente los mensajes entrantes`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("autoRead", false);
    return m.reply(
      `📖 *Lectura automática inactiva*\n\n` +
        `> El bot no leerá los mensajes automáticamente`
    );
  }

  return m.reply(
    `❌ *Opción no válida*\n\n> Usa *${m.prefix}autoread on* o *${m.prefix}autoread off*`
  );
}

export { pluginConfig as config, handler };
