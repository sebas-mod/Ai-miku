/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
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
  description: "Comprueba la subida de nivel manualmente y ajusta el aviso de subida",
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
      `╭─── ❖ 『 🔔 *NOTIFICACIÓN DE SUBIDA DE NIVEL* 』 ❖\n` +
      `│ ✦ *Estado:* *ACTIVO (ON)* ✅\n` +
      `│ ✦ Bot te enviará una tarjeta de celebración cada vez que subas de nivel.\n` +
      `╰──────────────────────────❖`
    );
  }

  if (sub === "off" || sub === "disable") {
    user.settings.levelupNotif = false;
    await db.save();
    return m.reply(
      `╭─── ❖ 『 🔕 *NOTIFICACIÓN DE SUBIDA DE NIVEL* 』 ❖\n` +
      `│ ✦ *ESTADO:* *DESACTIVADO (APAGADO)* ❌\n` +
      `│ ✦ Aún recibirás monedas y energía adicionales cuando subas de nivel sin mensajes emergentes.\n` +
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
      `╭─── ❖ 『 🎊 *¡FELICIDADES, SUBISTE DE NIVEL!* 』 ❖\n` +
      `│ ✦ *Aventurero:* *${user.regName || user.name || m.pushName}*\n` +
      `│ 📈 *Level:* Lv.${recordedLevel} ➜ *Lv.${actualLevel}* (+${diff} Level!)\n` +
      `│ 🎖️ *Nuevo rango:* *${rank.title}* (${rank.starBar})\n` +
      `├─── ❖ 『 🎁 *REGALO RECIBIDO* 』 ❖\n` +
      `│ 💰 *Bono de monedas:* +Rp ${koinReward.toLocaleString("id-ID")}\n` +
      `│ ⚡ *Bonus Energi:* +${energiReward} Energi\n` +
      `╰──────────────────────────❖\n` +
      `_💡 Tipo *${p}Claimlevel* para abrir cofres de premios de nivel de hito!_`
    );
  }

  const curExp = totalExp - expForLevel(actualLevel);
  const needExp = expForLevel(actualLevel + 1) - expForLevel(actualLevel);
  const bar = getLevelBar(curExp, needExp, 12);
  const notifState = user.settings.levelupNotif !== false ? "ON ✅" : "OFF ❌";

  return m.reply(
    `╭─── ❖ 『 ⚡ *COMPROBAR SUBIDA DE NIVEL* 』 ❖\n` +
    `│ ✦ EXP Actualmente estás en *Lv.${actualLevel}* (*${rank.title}*).\n` +
    `│ 🔋 *Progres:* [${bar}]\n` +
    `│ ✨ *Menos:* *${expToNextLevel(totalExp).toLocaleString("id-ID")} EXP* volver a *Lv.${actualLevel + 1}*!\n` +
    `│ 🔔 *Notificación automática:* ${notifState} (\`${p}levelup on/off\`)\n` +
    `├─── ❖ 『 💡 *CONSEJOS PARA SUBIR DE NIVEL RÁPIDO* 』 ❖\n` +
    `│ ◦ Utilice \`${p}boostexp\` cada 30 minutos\n` +
    `│ ◦ Mainkan misi di \`${p}adventure\`, \`${p}dungeon\`, & \`${p}daily\`\n` +
    `╰──────────────────────────❖`
  );
}

export { pluginConfig as config, handler };
