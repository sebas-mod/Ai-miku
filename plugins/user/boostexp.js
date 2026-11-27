/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import config from "../../config.js";
import { addExpWithLevelCheck, calculateLevel, expForLevel, getRankInfo, EXP_PER_LEVEL } from "../../src/lib/data/level.js";
import { renderBoostExp, getUserAvatar } from "../../src/lib/core/rank-canvas.js";

const pluginConfig = {
  name: "boostexp",
  alias: ["meditasiexp", "latihanlevel", "trainexp"],
  category: "user",
  description: "Latihan fokus Astral setiap 30 menit untuk memperoleh bonus EXP instan",
  usage: ".boostexp",
  example: ".boostexp",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isRegistered: true,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const COOLDOWN_MS = 30 * 60 * 1000;

const SCENARIOS = [
  "Medita bajo el cristal Astral de Miku y absorbe energía cósmica.",
  "Berlatih kombo pedang bayangan bersama instruktur Guild",
  "Memecahkan gulungan rune kuno di Perpustakaan Bintang",
  "Canaliza maná puro hacia el núcleo del alma del aventurero.",
  "Has completado una simulación de batalla de alto nivel en la Torre Miku.",
];

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender) || db.setUser(m.sender);
  const now = Date.now();
  const last = Number(user.lastBoostExp) || 0;

  if (now - last < COOLDOWN_MS) {
    const rem = Math.ceil((COOLDOWN_MS - (now - last)) / 60000);
    return m.reply(
      `╭─── ❖ 『 ⏳ *ISTIRAHAT LATIHAN* 』 ❖\n` +
      `│ ✦ Tu energía espiritual aún se está recuperando.\n` +
      `│ ⏱️ *Espera:* *${rem} ¡Quedan minutos* para el siguiente ejercicio!\n` +
      `╰──────────────────────────❖`
    );
  }

  const lv = calculateLevel(user.exp || 0);
  const baseGain = Math.floor(2500 + Math.random() * 4500) + lv * 120;
  const isCrit = Math.random() < 0.25;
  const finalExp = isCrit ? baseGain * 2 : baseGain;
  const story = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];

  user.lastBoostExp = now;
  const res = await addExpWithLevelCheck(sock, m, db, user, finalExp);
  if (global.db?.data?.users?.[m.sender]) {
    global.db.data.users[m.sender].exp = user.exp;
  }
  await db.save();

  const newLv = calculateLevel(user.exp || 0);
  const rank = getRankInfo(newLv);

  await m.react(isCrit ? "🌟" : "✨");
  const caption =
    `╭─── ❖ 『 ✨ *ASTRAL EXP TRAINING* 』 ❖\n` +
    `│ 🧘 *Aktivitas:* _${story}_\n` +
    (isCrit ? `│ 🌟 *RESONANSI SEMPURNA!* (Bonus EXP 2x Lipat!)\n` : "") +
    `│ 📈 *EXP Diperoleh:* *+${finalExp.toLocaleString("id-ID")} EXP*\n` +
    `│ 🏆 *Total EXP:* ${(user.exp || 0).toLocaleString("id-ID")} XP\n` +
    `│ 🎖️ *Level & Rank:* *Lv.${newLv}* (${rank.title})\n` +
    (res.leveledUp ? `│ 🎊 *LEVEL UP!* Subiste a *Lv.${res.newLevel}*!\n` : "") +
    `╰──────────────────────────❖`;

  try {
    const totalExp = Number(user.exp) || 0;
    const image = await renderBoostExp({
      name: user.regName || user.name || m.pushName || "Petualang",
      avatar: await getUserAvatar(sock, m.sender),
      expGain: finalExp,
      isCrit,
      totalExp,
      level: newLv,
      rankTitle: rank.title,
      expInLevel: Math.max(0, totalExp - expForLevel(newLv)),
      expNeeded: EXP_PER_LEVEL,
      leveledUp: Boolean(res.leveledUp),
      newLevel: res.newLevel || newLv,
      botName: config.bot?.name || "Ai Miku",
    });
    return await sock.sendMessage(m.chat, { image, caption }, { quoted: m });
  } catch {
    return m.reply(caption);
  }
}

export { pluginConfig as config, handler };
