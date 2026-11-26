/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import { calculateLevel, getRankInfo } from "../../src/lib/data/level.js";

const pluginConfig = {
  name: "claimlevel",
  alias: ["rewardlevel", "hadiahlevel", "petilevel"],
  category: "user",
  description: "Klaim peti hadiah milestone setiap kenaikan 5 level",
  usage: ".claimlevel",
  example: ".claimlevel",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isRegistered: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const db = getDatabase();
  const user = db.getUser(m.sender) || db.setUser(m.sender);
  const rpgGlobal = global.db?.data?.users?.[m.sender] || {};
  const exp = Math.max(Number(user.exp) || 0, Number(rpgGlobal.exp) || 0);
  const level = calculateLevel(exp);

  if (!Array.isArray(user.claimedLevelMilestones)) {
    user.claimedLevelMilestones = [];
  }

  const unlockedMilestones = [];
  for (let lv = 5; lv <= level; lv += 5) {
    if (!user.claimedLevelMilestones.includes(lv)) {
      unlockedMilestones.push(lv);
    }
  }

  if (!unlockedMilestones.length) {
    const nextMilestone = (Math.floor(level / 5) + 1) * 5;
    return m.reply(
      `╭─── ❖ 『 📦 *PETI MILESTONE LEVEL* 』 ❖\n` +
      `│ ✦ Level Kamu: *Lv.${level}*\n` +
      `│ ✦ Semua peti milestone yang tersedia sudah kamu klaim!\n` +
      `│ 🎯 *Target Peti Berikutnya:* *Lv.${nextMilestone}* (Kurang ${nextMilestone - level} level lagi)\n` +
      `╰──────────────────────────❖`
    );
  }

  let totalKoin = 0;
  let totalEnergi = 0;
  let totalCrate = 0;

  for (const ms of unlockedMilestones) {
    totalKoin += ms * 3500;
    totalEnergi += Math.max(3, Math.floor(ms / 5) * 2);
    totalCrate += 1;
    user.claimedLevelMilestones.push(ms);
  }

  user.koin = (Number(user.koin) || 0) + totalKoin;
  if (user.energi !== -1) user.energi = (Number(user.energi) || 0) + totalEnergi;
  if (!user.inventory) user.inventory = {};
  user.inventory.mythic = (Number(user.inventory.mythic) || 0) + totalCrate;

  if (global.db?.data?.users?.[m.sender]) {
    global.db.data.users[m.sender].money = (Number(global.db.data.users[m.sender].money) || 0) + totalKoin;
    global.db.data.users[m.sender].mythic = (Number(global.db.data.users[m.sender].mythic) || 0) + totalCrate;
  }

  await db.save();
  const rank = getRankInfo(level);

  await m.react("🎁");
  return m.reply(
    `╭─── ❖ 『 🎁 *KLAIM MILESTONE BERHASIL!* 』 ❖\n` +
    `│ 👤 *Petualang:* *${user.regName || user.name || m.pushName}*\n` +
    `│ 🎖️ *Pangkat:* ${rank.title} (Lv.${level})\n` +
    `│ 🔓 *Milestone Diklaim:* Lv.${unlockedMilestones.join(", Lv.")}\n` +
    `├─── ❖ 『 💎 *ISI PETI ASTRAL* 』 ❖\n` +
    `│ 💰 *Koin:* +Rp ${totalKoin.toLocaleString("id-ID")}\n` +
    `│ ⚡ *Energi:* +${totalEnergi} Energi\n` +
    `│ 📦 *Mythic Crate:* +${totalCrate} Peti\n` +
    `╰──────────────────────────❖\n` +
    `_✦ Terus tingkatkan levelmu untuk membuka peti Lv.${(Math.floor(level / 5) + 1) * 5}!_`
  );
}

export { pluginConfig as config, handler };
