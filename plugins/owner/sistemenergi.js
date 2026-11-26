/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";

const config = {
  name: "sistemenergi",
  alias: ["sistemlimit", "energimode", "limitmode"],
  category: "owner",
  description: "Mengecek, menghidupkan, atau mematikan sistem energi secara global",
  usage: ".sistemenergi [on / off]",
  example: ".sistemenergi on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const mode = m.args[0]?.toLowerCase();
  const db = getDatabase();

  const currentStatus = db.setting("energi") !== undefined ? db.setting("energi") : true;

  if (!mode || (mode !== "on" && mode !== "off")) {
    return m.reply(
      `🎛️ *KONTROL SISTEM ENERGI*\n\n` +
      `Función principal para activar o desactivar globalmente todo el sistema de consumo de energía del bot.\n\n` +
      `*ESTADO ACTUAL:*\n` +
      `- Modo: *${currentStatus ? "ACTIVO 🔋" : "INACTIVO (ILIMITADO) ♾️"}*\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}sistemenergi on* — Menghidupkan potongan energi\n` +
      `- *${m.prefix}sistemenergi off* — Desactiva el consumo de energía (modo ilimitado)\n\n` +
      `*EJEMPLO DE USO:*\n` +
      `- *${m.prefix}sistemenergi on*`
    );
  }

  await m.react("🕕");

  const isEnabled = mode === "on";

  db.setting("energi", isEnabled);
  await db.save();

  await m.react("✅");
  return m.reply(
    `✅ *ESTADO DEL SISTEMA DE ENERGÍA ACTUALIZADO*\n\n` +
    `El sistema de energía se ha *${isEnabled ? "ACTIVADO" : "DESACTIVADO"}*.\n\n` +
    `*Status Terkini:*\n` +
    `- Modo: *${isEnabled ? "ACTIVO 🔋" : "INACTIVO (ILIMITADO) ♾️"}*\n\n` +
    `_Todos los cambios se guardaron y se aplicarán en breve al sistema del bot._`
  );
}

export { config, handler };
