/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getActiveGame, setActiveGame } from "../../src/lib/features/miku-game.js";

const pluginConfig = {
  name: "tebakangka",
  alias: ["guessnum", "tangka"],
  category: "game",
  description: "Tebak angka rahasia 1–100 dengan radar panas/dingin",
  usage: ".tebakangka",
  example: ".tebakangka",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  const active = getActiveGame(m.chat);
  if (active) return m.reply(`⏳ Masih ada game *${active.type}* yang aktif di chat ini! Ketik \`${m.prefix}stopgame\` untuk berhenti.`);

  const secret = Math.floor(Math.random() * 100) + 1;
  const session = {
    type: "tebakangka",
    startedAt: Date.now(),
    secret,
    attempts: 0,
    maxAttempts: 8,
  };

  setActiveGame(m.chat, session, 90000, async (cur) => {
    await sock.sendMessage(m.chat, { text: `⏰ Waktu *Tebak Angka* habis! Angka rahasianya adalah *${cur.secret}*.` });
  });

  await m.reply(
    `╭─❖「 🎯 *TEBAK ANGKA — MIKU* 」\n` +
      `│ 🔢 Rentang    : *1 sampai 100*\n` +
      `│ 🎲 Kesempatan : *8 percobaan*\n` +
      `│ 💰 Hadiah     : Hingga *+5.000 Koin*\n` +
      `╰─────────────────────❖\n` +
      `_Ketik angka tebakanmu langsung di chat ini!_`
  );
}

export { pluginConfig as config, handler };
