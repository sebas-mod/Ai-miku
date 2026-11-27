/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import { calculateLevel, getRole } from "../user/level.js";

const EXP_PER_LEVEL = 10000;

const pluginConfig = {
  name: "dellevel",
  alias: ["kuranglevel", "removelevel", "dellvl"],
  category: "owner",
  description: "Baja el nivel de un usuario (con EXP)",
  usage: ".dellevel <cantidad> @user",
  example: ".dellevel 5 @user",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function extractTarget(m) {
  if (m.quoted) return m.quoted.sender;
  if (m.mentionedJid?.length) return m.mentionedJid[0];
  return null;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args;

  const numArg = args.find((a) => !isNaN(a) && !a.startsWith("@"));
  let levels = parseInt(numArg) || 0;

  let targetJid = await extractTarget(m);

  if (!targetJid && levels > 0) {
    targetJid = m.sender;
  }

  if (!targetJid || levels <= 0) {
    return m.reply(
      `📊 *QUITAR NIVEL*\n\n` +
        `╭┈┈⬡「 📋 *USO* 」\n` +
        `┃ > \`.dellevel <cantidad>\` - a ti mismo\n` +
        `┃ > \`.dellevel <cantidad> @user\` - a otra persona\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> Ejemplo: \`${m.prefix}dellevel 5\``,
    );
  }

  const user = db.getUser(targetJid) || db.setUser(targetJid);

  const oldLevel = calculateLevel(user.exp || 0);
  const expToRemove = levels * EXP_PER_LEVEL;
  user.exp = Math.max(0, (user.exp || 0) - expToRemove);
  const newLevel = calculateLevel(user.exp);

  db.save();
  await m.react("✅");

  await m.reply(
    `✅ *NIVEL REDUCIDO*\n\n` +
      `╭┈┈⬡「 📋 *DETALLE* 」\n` +
      `┃ 👤 User: @${targetJid.split("@")[0]}\n` +
      `┃ ➖ Restado: *-${levels} Level*\n` +
      `┃ 🚄 Exp Removed: *-${expToRemove.toLocaleString("id-ID")}*\n` +
      `┃ 📊 Level: *${oldLevel} → ${newLevel}*\n` +
      `┃ ${getRole(newLevel)}\n` +
      `╰┈┈┈┈┈┈┈┈⬡`,
    { mentions: [targetJid] },
  );
}

export { pluginConfig as config, handler };
