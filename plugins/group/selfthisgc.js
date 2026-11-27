/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import te from "../../src/lib/core/error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "selfthisgc",
  alias: ["selfgc", "selfgroup", "selfthisgroup"],
  category: "group",
  description: "Activa el modo self solo en este grupo",
  usage: ".selfthisgc",
  example: ".selfthisgc",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const selfGroups = db.setting("selfGroups") || [];
  const publicGroups = db.setting("publicGroups") || [];

  const isSelfGroup = selfGroups.includes(m.chat);

  if (isSelfGroup) {
    return m.reply(
      `ℹ️ *ESTE GRUPO YA ESTÁ EN MODO SELF*\n\n` +
        `> El bot solo responde al propietario y a sí mismo\n\n` +
        `_Usa ${m.prefix}publicthisgc para abrir el acceso_`,
    );
  }

  if (!selfGroups.includes(m.chat)) {
    db.setting("selfGroups", [...selfGroups, m.chat]);
  }

  const updatedPublic = publicGroups.filter((id) => id !== m.chat);
  db.setting("publicGroups", updatedPublic);

  m.react("🔒");
  return m.reply(
    `🔒 *MODO SELF ACTIVO*\n\n` +
      `> Ahora el bot en este grupo solo responde a:\n` +
      `> • Propietario del bot\n` +
      `> • El propio bot (fromMe)\n\n` +
      `📋 *Los demás grupos no se ven afectados*\n\n` +
      `_Usa ${m.prefix}publicthisgc para abrir el acceso_`,
  );
}

export { pluginConfig as config, handler };
