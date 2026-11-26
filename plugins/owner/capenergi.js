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
  name: "capenergi",
  alias: ["setenergi"],
  category: "owner",
  description: "Mengubah potongan energi banyak fitur sekaligus",
  usage: ".capenergi <nama_fitur1> <nama_fitur2> ... <jumlah>",
  example: ".capenergi hd fakedev 5",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (m.args.length < 2) {
    return m.reply(
      `⚙️ *SISTEM CAP ENERGI*\n\n` +
      `Sistema para cambiar dinámicamente cuánta energía consumen varias funciones a la vez.\n\n` +
      `*USO:*\n` +
      `- *${m.prefix}capenergi <nama_fitur1> <nama_fitur2> ... <jumlah>*\n\n` +
      `*EJEMPLO DE USO:*\n` +
      `- *${m.prefix}capenergi hd jpm 5* (las funciones HD y JPM consumen 5 de energía)\n` +
      `- *${m.prefix}capenergi hd 0* (la función HD pasa a ser gratis en energía)\n\n` +
      `*PENJELASAN:*\n` +
      `1. Indica uno o varios nombres de funciones que quieres cambiar.\n` +
      `2. Al final (última palabra) debe ir un NÚMERO (la energía a descontar).`
    );
  }

  const rawCost = m.args[m.args.length - 1];
  const cost = parseInt(rawCost);

  if (isNaN(cost) || cost < 0) {
    return m.reply(`❌ *ERROR*\n\nLa energía (en el último argumento) debe ser un número igual o mayor que 0.`);
  }

  const commands = m.args.slice(0, -1);

  await m.react("🕕");

  const db = getDatabase();
  const overrides = db.setting("capenergi") || {};

  let successList = [];
  let failedList = [];

  for (const cmd of commands) {
    const targetCommand = cmd.toLowerCase();
    const plugin = getPlugin(targetCommand);
    if (!plugin) {
      failedList.push(targetCommand);
    } else {
      overrides[plugin.config.name] = cost;
      successList.push(plugin.config.name);
    }
  }

  db.setting("capenergi", overrides);
  await db.save();

  await m.react("✅");

  let msg = `✅ *COSTO DE ENERGÍA ACTUALIZADO*\n\n`;
  if (successList.length > 0) {
    msg += `*Cambiadas a ${cost} de energía:*\n${successList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  if (failedList.length > 0) {
    msg += `*Con error (no encontradas):*\n${failedList.map(f => `- ${f}`).join("\n")}\n\n`;
  }

  msg += `_Los ajustes se guardaron en la base de datos y ya están activos._`;
  return m.reply(msg.trim());
}

export { config, handler };
