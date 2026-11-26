/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import {
  calculateLevel,
  expToNextLevel,
  getRankInfo,
  getLevelBar,
  expForLevel,
} from "../../src/lib/data/level.js";

const pluginConfig = {
  name: "levelup",
  alias: ["lvlup", "naiklevel", "levelnotif"],
  category: "user",
  description: "Cek kenaikan level manual & atur notifikasi level up",
  usage: ".levelup [on/off]",
  example: ".levelup",
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
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const p = m.prefix || ".";

  if (!user.settings) user.settings = {};

  if (sub === "on" || sub === "enable") {
    user.settings.levelupNotif = true;
    await db.save();
    return m.reply(
      `╭─── ❖ 『 🔔 *NOTIFIKASI LEVEL UP* 』 ❖\n` +
      `│ ✦ *Status:* *AKTIF (ON)* ✅\n` +
      `│ ✦ Bot akan mengirim kartu perayaan setiap kali kamu naik level!\n` +
      `╰──────────────────────────❖`
    );
  }

  if (sub === "off" || sub === "disable") {
    user.settings.levelupNotif = false;
    await db.save();
    return m.reply(
      `╭─── ❖ 『 🔕 *NOTIFIKASI LEVEL UP* 』 ❖\n` +
      `│ ✦ *Status:* *NONAKTIF (OFF)* ❌\n` +
      `│ ✦ Kamu tetap menerima bonus koin & energi saat naik level tanpa pesan pop-up.\n` +
      `╰──────────────────────────❖`
    );
  }

  const rpgGlobal = global.db?.data?.users?.[m.sender] || {};
  const totalExp = Math.max(Number(user.exp) || 0, Number(rpgGlobal.exp) || 0);
  const recordedLevel = Number(user.level) || 1;
  const actualLevel = calculateLevel(totalExp);
  const rank = getRankInfo(actualLevel);

  if (actualLevel > recordedLevel) {
    const diff = actualLevel - recordedLevel;
    const koinReward = diff * rank.bonusKoin;
    const energiReward = diff * rank.bonusEnergi;

    user.level = actualLevel;
    user.exp = totalExp;
    user.koin = (Number(user.koin) || 0) + koinReward;
    if (user.energi !== -1) user.energi = (Number(user.energi) || 0) + energiReward;
    await db.save();

    await m.react("🎊");
    return m.reply(
      `╭─── ❖ 『 🎊 *SELAMAT NAIK LEVEL!* 』 ❖\n` +
      `│ ✦ *Petualang:* *${user.regName || user.name || m.pushName}*\n` +
      `│ 📈 *Level:* Lv.${recordedLevel} ➜ *Lv.${actualLevel}* (+${diff} Level!)\n` +
      `│ 🎖️ *Pangkat Baru:* *${rank.title}* (${rank.starBar})\n` +
      `├─── ❖ 『 🎁 *HADIAH DITERIMA* 』 ❖\n` +
      `│ 💰 *Bonus Koin:* +Rp ${koinReward.toLocaleString("id-ID")}\n` +
      `│ ⚡ *Bonus Energi:* +${energiReward} Energi\n` +
      `╰──────────────────────────❖\n` +
      `_💡 Ketik *${p}claimlevel* untuk membuka peti hadiah milestone level!_`
    );
  }

  const curExp = totalExp - expForLevel(actualLevel);
  const needExp = expForLevel(actualLevel + 1) - expForLevel(actualLevel);
  const bar = getLevelBar(curExp, needExp, 12);
  const notifState = user.settings.levelupNotif !== false ? "ON ✅" : "OFF ❌";

  return m.reply(
    `╭─── ❖ 『 ⚡ *CEK KENAIKAN LEVEL* 』 ❖\n` +
    `│ ✦ EXP kamu saat ini berada di *Lv.${actualLevel}* (*${rank.title}*).\n` +
    `│ 🔋 *Progres:* [${bar}]\n` +
    `│ ✨ *Kurang:* *${expToNextLevel(totalExp).toLocaleString("id-ID")} EXP* lagi ke *Lv.${actualLevel + 1}*!\n` +
    `│ 🔔 *Notif Otomatis:* ${notifState} (\`${p}levelup on/off\`)\n` +
    `├─── ❖ 『 💡 *TIPS CEPAT NAIK LEVEL* 』 ❖\n` +
    `│ ◦ Gunakan \`${p}boostexp\` setiap 30 menit\n` +
    `│ ◦ Mainkan misi di \`${p}adventure\`, \`${p}dungeon\`, & \`${p}daily\`\n` +
    `╰──────────────────────────❖`
  );
}

export { pluginConfig as config, handler };
