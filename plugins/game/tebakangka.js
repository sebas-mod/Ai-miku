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
  description: "Adivina el número secreto del 1 al 100 con radar frío/caliente",
  usage: ".tebakangka",
  example: ".tebakangka",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  const active = getActiveGame(m.chat);
  if (active) return m.reply(`⏳ ¡Todavía hay un juego *${active.type}* activo en este chat! Escribe \`${m.prefix}stopgame\` para pararlo.`);

  const secret = Math.floor(Math.random() * 100) + 1;
  const session = {
    type: "tebakangka",
    startedAt: Date.now(),
    secret,
    attempts: 0,
    maxAttempts: 8,
  };

  setActiveGame(m.chat, session, 90000, async (cur) => {
    await sock.sendMessage(m.chat, { text: `⏰ ¡Se acabó el tiempo de *Adivina el Número*! El número secreto era *${cur.secret}*.` });
  });

  await m.reply(
    `╭─❖「 🎯 *ADIVINA EL NÚMERO — MIKU* 」\n` +
      `│ 🔢 Rango    : *1 a 100*\n` +
      `│ 🎲 Oportunidad : *8 percobaan*\n` +
      `│ 💰 Premio   : Hasta *+5.000 monedas*\n` +
      `╰─────────────────────❖\n` +
      `_¡Escribe tu número directamente en este chat!_`
  );
}

export { pluginConfig as config, handler };
