/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getPlugin } from "../../src/lib/core/plugins.js";
import { getDatabase } from "../../src/lib/data/database.js";

const config = {
  name: "capfree",
  alias: ["capgratis", "setfree"],
  category: "owner",
  description: "Mengecap banyak fitur sekaligus menjadi gratis",
  usage: ".capfree <nama_fitur1> <nama_fitur2> ...",
  example: ".capfree hd jpm warn",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (m.args.length === 0) {
    return m.reply(
      `🆓 *SISTEM CAP FREE*\n\n` +
      `Sistema para volver públicas y gratuitas varias funciones a la vez.\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}capfree <función1> <función2> ...* — Pueden ser varias a la vez\n\n` +
      `*EJEMPLO DE USO:*\n` +
      `- *${m.prefix}capfree hd jpm warn*\n\n` +
      `*PENJELASAN:*\n` +
      `Escribe uno o varios nombres de funciones para hacerlas gratuitas. Sepáralos con espacios.`
    );
  }

  await m.react("🕕");

  const db = getDatabase();
  const overrides = db.setting("capprem") || {};

  let successList = [];
  let failedList = [];

  for (const cmd of m.args) {
    const targetCommand = cmd.toLowerCase();
    const plugin = getPlugin(targetCommand);
    if (!plugin) {
      failedList.push(targetCommand);
    } else {
      overrides[plugin.config.name] = false;
      successList.push(plugin.config.name);
    }
  }

  db.setting("capprem", overrides);
  await db.save();

  await m.react("✅");

  let msg = `✅ *ESTADO ACTUALIZADO*\n\n`;
  if (successList.length > 0) {
    msg += `*Correctas (GRATIS 🆓):*\n${successList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  if (failedList.length > 0) {
    msg += `*Con error (no encontradas):*\n${failedList.map(f => `- ${f}`).join("\n")}\n\n`;
  }

  msg += `_Las funciones anteriores (las correctas) ya son accesibles para todos los miembros._`;

  return m.reply(msg.trim());
}

export { config, handler };
