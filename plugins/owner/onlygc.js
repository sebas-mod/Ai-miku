/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";

const pluginConfig = {
  name: "onlygc",
  alias: ["onlygroup", "grouponly"],
  category: "owner",
  description: "Activa o desactiva el modo solo grupos",
  usage: ".onlygc on/off",
  example: ".onlygc on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const current = db.setting("onlyGc") || false;
    return m.reply(
      `🏘️ *Solo grupos*\n\n` +
        `> Estado: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}onlygc on* — El bot solo puede usarse en grupos\n` +
        `> *${m.prefix}onlygc off* — El bot puede usarse en cualquier lugar\n\n` +
        `_Si está activo, el modo Solo Privado se desactiva automáticamente_`
    );
  }

  if (option === "on") {
    db.setting("onlyGc", true);
    db.setting("onlyPc", false);
    await m.react("✅");
    return m.reply(
      `🏘️ *Solo grupos activado*\n\n` +
        `> El bot solo puede usarse en grupos\n` +
        `> Modo Solo privados desactivado`
    );
  }

  if (option === "off") {
    db.setting("onlyGc", false);
    await m.react("❌");
    return m.reply(
      `🏘️ *Solo grupos desactivado*\n\n` +
        `> El bot puede usarse en cualquier lugar`
    );
  }

  return m.reply(
    `❌ *Opción no válida*\n\n> Usa *${m.prefix}onlygc on* o *${m.prefix}onlygc off*`
  );
}

export { pluginConfig as config, handler };
