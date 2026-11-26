/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../../config.js";

const EXP_PER_LEVEL = 10000;

export const ASTRAL_RANKS = [
  { min: 250, title: "🌌 Astral Sovereign", badge: "👑✦", bonusKoin: 250000, bonusEnergi: 50 },
  { min: 200, title: "🪐 Celestial Monarch", badge: "🪐✦", bonusKoin: 180000, bonusEnergi: 40 },
  { min: 175, title: "☄️ Starlight Emperor", badge: "☄️✦", bonusKoin: 150000, bonusEnergi: 35 },
  { min: 150, title: "🐉 Mythic Immortal", badge: "🐉✦", bonusKoin: 120000, bonusEnergi: 30 },
  { min: 125, title: "⚜️ Divine Archon", badge: "⚜️✦", bonusKoin: 100000, bonusEnergi: 25 },
  { min: 100, title: "👑 Mythical Glory", badge: "👑", bonusKoin: 80000, bonusEnergi: 20 },
  { min: 90, title: "🔮 Mythical Honor", badge: "🔮", bonusKoin: 65000, bonusEnergi: 18 },
  { min: 80, title: "🐉 Mythic Vanguard", badge: "🐉", bonusKoin: 55000, bonusEnergi: 15 },
  { min: 70, title: "⚔️ Supreme Legend", badge: "⚔️", bonusKoin: 45000, bonusEnergi: 14 },
  { min: 60, title: "🦅 Glorious Legend", badge: "🦅", bonusKoin: 38000, bonusEnergi: 12 },
  { min: 50, title: "💎 Eternal Epic", badge: "💎", bonusKoin: 30000, bonusEnergi: 10 },
  { min: 40, title: "💜 Astral Epic", badge: "💜", bonusKoin: 25000, bonusEnergi: 9 },
  { min: 30, title: "🔥 Grandmaster I", badge: "🔥", bonusKoin: 20000, bonusEnergi: 8 },
  { min: 25, title: "⚡ Grandmaster II", badge: "⚡", bonusKoin: 16000, bonusEnergi: 7 },
  { min: 20, title: "🎖️ Master Paladin", badge: "🎖️", bonusKoin: 12000, bonusEnergi: 6 },
  { min: 15, title: "🏅 Royal Knight", badge: "🏅", bonusKoin: 9000, bonusEnergi: 5 },
  { min: 10, title: "⭐ Elite Ranger", badge: "⭐", bonusKoin: 6500, bonusEnergi: 4 },
  { min: 7, title: "🗡️ Veteran Slayer", badge: "🗡️", bonusKoin: 4500, bonusEnergi: 3 },
  { min: 5, title: "🛡️ Iron Guardian", badge: "🛡️", bonusKoin: 3000, bonusEnergi: 3 },
  { min: 3, title: "🏹 Bronze Scout", badge: "🏹", bonusKoin: 1500, bonusEnergi: 2 },
  { min: 1, title: "🌱 Novice Adventurer", badge: "🌱", bonusKoin: 1000, bonusEnergi: 1 },
];

function calculateLevel(exp) {
  return Math.max(1, Math.floor((Number(exp) || 0) / EXP_PER_LEVEL) + 1);
}

function expForLevel(level) {
  return Math.max(0, (Math.max(1, level) - 1) * EXP_PER_LEVEL);
}

function expToNextLevel(exp) {
  const currentLevel = calculateLevel(exp);
  const nextLevelExp = expForLevel(currentLevel + 1);
  return Math.max(0, nextLevelExp - (Number(exp) || 0));
}

function getRankInfo(level) {
  const lv = Math.max(1, Number(level) || 1);
  for (let i = 0; i < ASTRAL_RANKS.length; i++) {
    if (lv >= ASTRAL_RANKS[i].min) {
      const current = ASTRAL_RANKS[i];
      const next = i > 0 ? ASTRAL_RANKS[i - 1] : null;
      const stars = Math.min(5, Math.max(1, Math.floor((lv - current.min) / Math.max(1, ((next?.min || current.min + 25) - current.min) / 5)) + 1));
      return {
        ...current,
        stars,
        starBar: "★".repeat(stars) + "☆".repeat(5 - stars),
        nextRank: next,
      };
    }
  }
  return { ...ASTRAL_RANKS[ASTRAL_RANKS.length - 1], stars: 1, starBar: "★☆☆☆☆", nextRank: ASTRAL_RANKS[ASTRAL_RANKS.length - 2] };
}

function getRole(level) {
  const info = getRankInfo(level);
  return `${info.title} (${info.starBar})`;
}

function getLevelBar(current, target, length = 12) {
  const filled = Math.min(length, Math.max(0, Math.round((current / Math.max(1, target)) * length)));
  return "▰".repeat(filled) + "▱".repeat(length - filled);
}

async function checkAndNotifyLevelUp(sock, m, db, user, oldExp, newExp) {
  const oldLevel = calculateLevel(oldExp);
  const newLevel = calculateLevel(newExp);

  if (newLevel > oldLevel) {
    if (!user.rpg) user.rpg = {};
    const diff = newLevel - oldLevel;
    const rankInfo = getRankInfo(newLevel);
    const koinBonus = diff * (rankInfo.bonusKoin || 2500);
    const energiBonus = diff * (rankInfo.bonusEnergi || 2);

    user.level = newLevel;
    user.rpg.level = newLevel;
    user.rpg.maxHealth = 100 + (newLevel - 1) * 15;
    user.rpg.maxMana = 100 + (newLevel - 1) * 10;
    user.rpg.maxStamina = 100 + (newLevel - 1) * 10;
    user.rpg.health = user.rpg.maxHealth;
    user.rpg.mana = user.rpg.maxMana;
    user.rpg.stamina = user.rpg.maxStamina;
    user.koin = (Number(user.koin) || 0) + koinBonus;
    if (user.energi !== -1) {
      user.energi = (Number(user.energi) || 0) + energiBonus;
    }

    db.save();

    if (user.settings?.levelupNotif === false) {
      return { leveledUp: true, notified: false, oldLevel, newLevel, koinBonus, energiBonus };
    }

    const botName = config.bot?.name || "Elysia Assistant";
    const txt =
      `╭─── ❖ 『 🎊 *¡SUBIÓ DE NIVEL!* 』 ❖\n` +
      `│ ✦ *Aventurero:* @${m.sender.split("@")[0]}\n` +
      `│ ✦ *Progreso:* Nv.${oldLevel} ➜ *Nv.${newLevel}* (+${diff})\n` +
      `│ ✦ *Rango:* *${rankInfo.title}*\n` +
      `│ ✦ *Estrellas:* ${rankInfo.starBar}\n` +
      `├─── ❖ 『 🎁 *PREMIO POR SUBIR DE NIVEL* 』 ❖\n` +
      `│ 💰 *Monedas extra:* +Rp ${koinBonus.toLocaleString("es-ES")}\n` +
      `│ ⚡ *Energía extra:* +${energiBonus} de energía\n` +
      `│ ❤️ *HP/MP/STA máx.:* ¡Restaurados al completo!\n` +
      `╰──────────────────────────❖\n` +
      `_💡 Escribe *${m.prefix || "."}claimlevel* cada 5 niveles para reclamar un cofre extra._`;

    try {
      const rc = await import("../core/rank-canvas.js");
      const avatar = await rc.getUserAvatar(sock, m.sender);
      const img = await rc.renderLevelUp({
        name: user.regName || user.name || m.pushName || "Aventurero",
        avatar,
        oldLevel,
        newLevel,
        rankTitle: rankInfo.title,
        stars: rankInfo.stars,
        koinBonus,
        energiBonus,
        expInLevel: Math.max(0, (Number(newExp) || 0) - expForLevel(newLevel)),
        expNeeded: EXP_PER_LEVEL,
        botName,
      });
      await sock.sendMessage(
        m.chat,
        { image: img, caption: txt, mentions: [m.sender] },
        { quoted: m }
      );
    } catch {
      await m.reply(txt, { mentions: [m.sender] });
    }

    return { leveledUp: true, notified: true, oldLevel, newLevel, koinBonus, energiBonus };
  }

  return { leveledUp: false, notified: false, oldLevel, newLevel: oldLevel };
}

async function addExpWithLevelCheck(sock, m, db, user, expAmount) {
  if (!user) return { leveledUp: false, notified: false, oldLevel: 1, newLevel: 1 };
  if (!user.rpg) user.rpg = {};

  const oldExp = user.exp || 0;
  const newExp = db.updateExp(m.sender, expAmount);
  user.exp = newExp;

  const result = await checkAndNotifyLevelUp(sock, m, db, user, oldExp, newExp);
  db.setUser(m.sender, { rpg: user.rpg, level: calculateLevel(newExp) });
  return result;
}

export {
  EXP_PER_LEVEL,
  calculateLevel,
  expForLevel,
  expToNextLevel,
  getRankInfo,
  getRole,
  getLevelBar,
  checkAndNotifyLevelUp,
  addExpWithLevelCheck,
};
