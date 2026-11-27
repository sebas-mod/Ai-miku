/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import * as timeHelper from "../../src/lib/core/time.js";
import { saluranCtx } from "../../src/lib/core/context.js";
const pluginConfig = {
  name: "terima",
  alias: ["accept", "yes"],
  category: "fun",
  description: "Acepta la declaración de alguien",
  usage: ".terima @tag",
  example: ".terima @628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
    isRegistered: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const celebrationQuotes = [
  "¡Que dure hasta el altar! 💍",
  "¡De amigos a amantes, qué bonito! 💕",
  "Love is in the air! 💖",
  "Couple goals detected! 💑",
  "¡No olvides invitarnos a la boda! 💒",
  "¡Felicidades por vuestra vida juntos! 🥰",
  "¡La química es muy fuerte! 🔥",
  "Match made in heaven! ✨",
];

async function handler(m, { sock }) {
  const db = getDatabase();

  let shooterJid = null;

  if (m.quoted) {
    shooterJid = m.quoted.sender;
  } else if (m.mentionedJid?.[0]) {
    shooterJid = m.mentionedJid[0];
  }

  if (!shooterJid) {
    const sessions = global.tembakSessions || {};
    const mySession = Object.entries(sessions).find(
      ([key, val]) => val.target === m.sender && val.chat === m.chat,
    );

    if (mySession) {
      shooterJid = mySession[1].shooter;
    }
  }

  if (!shooterJid) {
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `> Responde al mensaje de la declaración + \`${m.prefix}terima\`\n` +
        `> O \`${m.prefix}terima @tag\``,
    );
  }

  if (shooterJid === m.sender) {
    return m.reply(`❌ *FALLIDO*\n\n> ¡No puedes aceptarte a ti mismo!`);
  }

  if (shooterJid.split("@")[0] === String(m.botNumber).replace(/@.*/, "")) {
    return m.reply(`❌ *FALLIDO*\n\n> ¡El bot no puede tener pareja!`);
  }

  let shooterData = db.getUser(shooterJid) || {};
  let myData = db.getUser(m.sender) || {};

  if (!shooterData.fun) shooterData.fun = {};
  if (!myData.fun) myData.fun = {};

  if (
    shooterData.fun.pasangan !== m.sender &&
    shooterData.fun.tembakTarget !== m.sender
  ) {
    return m.reply(
      `❌ *NO TE HA DECLARADO AMOR*\n\n` +
        `> @${shooterJid.split("@")[0]} no te está declarando su amor`,
      { mentions: [shooterJid] },
    );
  }

  shooterData.fun.pasangan = m.sender;
  shooterData.fun.jadiPacar = Date.now();
  delete shooterData.fun.tembakTarget;
  myData.fun.pasangan = shooterJid;
  myData.fun.jadiPacar = Date.now();

  if (!shooterData.fun.terimaCount) shooterData.fun.terimaCount = 0;
  shooterData.fun.terimaCount++;

  db.setUser(shooterJid, shooterData);
  db.setUser(m.sender, myData);

  const sessionKey = `${m.chat}_${m.sender}`;
  if (global.tembakSessions?.[sessionKey]) {
    delete global.tembakSessions[sessionKey];
  }

  const quote =
    celebrationQuotes[Math.floor(Math.random() * celebrationQuotes.length)];
  const dateStr = timeHelper.formatFull("dddd, DD MMMM YYYY");

  await m.react("💕");
  const ctx = saluranCtx();
  ctx.mentionedJid = [m.sender, shooterJid];

  await m.reply(
    `💕 *WIDIHHHH, CIE CIE DITERIMA* @${shooterJid.split("@")[0]}\n\n` +
      `@${m.sender.split("@")[0]} dan @${shooterJid.split("@")[0]} ¡oficialmente son novios!\n\n` +
      `Que duren y sean muy felices 💍`,
    { contextInfo: ctx },
  );
}

export { pluginConfig as config, handler };
