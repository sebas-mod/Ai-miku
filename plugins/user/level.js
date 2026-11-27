/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js";
import { getDatabase } from "../../src/lib/data/database.js";
import {
  EXP_PER_LEVEL,
  calculateLevel,
  expForLevel,
  expToNextLevel,
  getRankInfo,
  getRole,
  getLevelBar,
} from "../../src/lib/data/level.js";

const pluginConfig = {
  name: "level",
  alias: ["lvl", "ceklevel", "rank", "pangkat"],
  category: "user",
  description: "Cek detail level, pangkat Astral, bintang, dan progres EXP",
  usage: ".level [@user]",
  example: ".level",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isRegistered: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const p = m.prefix || ".";

  let targetJid = m.sender;
  let targetName = m.pushName || "Petualang";

  if (m.quoted) {
    targetJid = m.quoted.sender;
    targetName = m.quoted.pushName || targetJid.split("@")[0];
  } else if (m.mentionedJid?.length) {
    targetJid = m.mentionedJid[0];
    targetName = targetJid.split("@")[0];
  }

  const user = db.getUser(targetJid) || db.setUser(targetJid);
  const rpgGlobal = global.db?.data?.users?.[targetJid] || {};
  const exp = Math.max(Number(user.exp) || 0, Number(rpgGlobal.exp) || 0);
  const level = calculateLevel(exp);
  const rank = getRankInfo(level);
  const currentLevelExp = expForLevel(level);
  const nextLevelExp = expForLevel(level + 1);
  const expInLevel = Math.max(0, exp - currentLevelExp);
  const expNeeded = Math.max(1, nextLevelExp - currentLevelExp);
  const pct = Math.min(100, Math.floor((expInLevel / expNeeded) * 100));
  const bar = getLevelBar(expInLevel, expNeeded, 12);

  const claimedMilestones = Array.isArray(user.claimedLevelMilestones) ? user.claimedLevelMilestones.length : 0;
  const availableMilestones = Math.floor(level / 5) - claimedMilestones;

  const txt =
    `╭─── ❖ 『 📊 *ASTRAL LEVEL & RANK* 』 ❖\n` +
    `│ 👤 *Petualang:* *${user.regName || user.name || targetName}*\n` +
    `│ 🏷️ *Tag:* @${targetJid.split("@")[0]}\n` +
    `├─── ❖ 『 🎖️ *STATUS PANGKAT* 』 ❖\n` +
    `│ 🏆 *Pangkat:* *${rank.title}*\n` +
    `│ ⭐ *Tier Star:* ${rank.starBar} (${rank.stars}/5)\n` +
    `│ 📈 *Nivel actual:* *Lv.${level}*\n` +
    `│ ✨ *Total EXP:* ${exp.toLocaleString("id-ID")} XP\n` +
    `│ 🔋 *Progres Level ${level + 1}:*\n` +
    `│ [${bar}] *${pct}%*\n` +
    `│ ◦ _${expInLevel.toLocaleString("id-ID")} / ${expNeeded.toLocaleString("id-ID")} XP (Menos ${expToNextLevel(exp).toLocaleString("id-ID")} XP)_\n` +
    `├─── ❖ 『 🎁 *PRIVILEGE & REWARD* 』 ❖\n` +
    `│ 💰 *Bonus Naik Level:* +Rp ${rank.bonusKoin.toLocaleString("id-ID")} / level\n` +
    `│ ⚡ *Bonus Energi:* +${rank.bonusEnergi} Energi / level\n` +
    (rank.nextRank
      ? `│ 🚀 *Rank Berikutnya:* ${rank.nextRank.title} (Lv.${rank.nextRank.min})\n`
      : `│ 🌌 *Status Tier:* Pangkat Tertinggi Tercapai!\n`) +
    (availableMilestones > 0
      ? `│ 🎉 *Peti Milestone:* *${availableMilestones} Peti Siap Diklaim!* (\`${p}claimlevel\`)\n`
      : `│ 📦 *Cofre de hitos:* Abre cada nivel múltiplo de 5\n`) +
    `├─── ❖ 『 🧭 *MENÚ DE MÁS NIVELES* 』 ❖\n` +
    `│ ◦ \`${p}Claimlevel\` — Reclama recompensas de nivel de hito\n` +
    `│ ◦ \`${p}boostexp\` — Latihan astral (+EXP gratis)\n` +
    `│ ◦ \`${p}ranklist\` — Lista de todos los 21 rangos astrales\n` +
    `│ ◦ \`${p}toplevel\` — La calificación de nivel más alto\n` +
    `╰──────────────────────────❖\n` +
    `_✦ Ai Miku • by Arthazy_`;

  await m.reply(txt, { mentions: [targetJid] });
}

export {
  pluginConfig as config,
  handler,
  calculateLevel,
  expForLevel,
  expToNextLevel,
  getRole,
};
