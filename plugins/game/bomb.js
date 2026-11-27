/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getActiveGame, setActiveGame, renderBombBoard } from "../../src/lib/features/miku-game.js";

const pluginConfig = {
  name: "bomb",
  alias: ["tebakbom", "mines"],
  category: "game",
  description: "Abre un cofre 3x3 sin pisar las bombas escondidas",
  usage: ".bomb",
  example: ".bomb",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  const active = getActiveGame(m.chat);
  if (active) return m.reply(`⏳ ¡Todavía hay un juego *${active.type}* activo en este chat! Escribe \`${m.prefix}stopgame\` para pararlo.`);

  const session = {
    type: "bomb",
    startedAt: Date.now(),
    player: m.sender,
    bombIndex: Math.floor(Math.random() * 9),
    opened: new Set(),
    pot: 0,
  };

  setActiveGame(m.chat, session, 120000, async () => {
    await sock.sendMessage(m.chat, { text: "⏰ La sesión de *Adivina la Bomba* terminó por tiempo." });
  });

  await m.reply(renderBombBoard(session));
}

export { pluginConfig as config, handler };
