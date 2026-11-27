/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";
import { saluranCtx } from "../../src/lib/core/context.js";
const pluginConfig = {
  name: "tolak",
  alias: ["reject", "no", "gaktau"],
  category: "fun",
  description: "Rechaza la declaración de alguien",
  usage: ".tolak @tag",
  example: ".tolak @628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
    isRegistered: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const rejectionQuotes = [
  "¡Ten paciencia, seguro que llega alguien mejor! 🌟",
  "No ser el destino de alguien no significa que no tengas destino 💪",
  "¡Supera! ¡Hay muchos peces en el mar! 🐟",
  "Ten paciencia, el amor verdadero llegará 💕",
  "¡No pierdas el ánimo, sigue adelante! 🔥",
  "Un rechazo es el principio del éxito 💪",
  "¡Todavía hay muchas oportunidades ahí fuera! ✨",
  "¡Seguro que hay alguien más compatible contigo! 🌈",
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
        `> Responde al mensaje de la declaración + \`${m.prefix}tolak\`\n` +
        `> O \`${m.prefix}tolak @tag\``,
    );
  }

  if (shooterJid === m.sender) {
    return m.reply(`❌ *FALLIDO*\n\n> ¡No puedes rechazarte a ti mismo!`);
  }

  if (shooterJid.split("@")[0] === String(m.botNumber).replace(/@.*/, "")) {
    return m.reply(`❌ *FALLIDO*\n\n> ¡El bot no tiene corazón que rechazar!`);
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

  delete shooterData.fun.pasangan;
  delete shooterData.fun.tembakTarget;
  delete myData.fun.pasangan;

  if (!shooterData.fun.ditolakCount) shooterData.fun.ditolakCount = 0;
  shooterData.fun.ditolakCount++;

  db.setUser(shooterJid, shooterData);
  db.setUser(m.sender, myData);

  const sessionKey = `${m.chat}_${m.sender}`;
  if (global.tembakSessions?.[sessionKey]) {
    delete global.tembakSessions[sessionKey];
  }

  const quote =
    rejectionQuotes[Math.floor(Math.random() * rejectionQuotes.length)];

  await m.react("💔");
  const ctx = saluranCtx();
  ctx.mentionedJid = [m.sender, shooterJid];

  await m.reply(
    `💔 *VAYA, TEN PACIENCIA* @${shooterJid.split("@")[0]}\n\n` +
      `@${m.sender.split("@")[0]} rechaza a @${shooterJid.split("@")[0]} como su pareja\n\n` +
      `¡Ten paciencia, habrá más! 😢`,
    { contextInfo: ctx },
  );
}

export { pluginConfig as config, handler };
