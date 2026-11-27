/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getActiveGame, clearActiveGame } from "../../src/lib/features/miku-game.js";

const pluginConfig = {
  name: "stopgame",
  alias: ["gamenyerah", "endgame"],
  category: "game",
  description: "Detiene la partida que está en curso en este chat",
  usage: ".stopgame",
  example: ".stopgame",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 3, energi: 0, isEnabled: true,
};

async function handler(m) {
  const active = getActiveGame(m.chat);
  if (!active) return m.reply("❌ No hay ningún juego activo en este chat.");
  clearActiveGame(m.chat);
  await m.reply(`🏳️ La sesión del juego *${active.type}* se detuvo.`);
}

export { pluginConfig as config, handler };
