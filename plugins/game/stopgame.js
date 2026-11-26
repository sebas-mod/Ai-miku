/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getActiveGame, clearActiveGame } from "../../src/lib/features/elysia-game.js";

const pluginConfig = {
  name: "stopgame",
  alias: ["gamenyerah", "endgame"],
  category: "game",
  description: "Menghentikan sesi game yang sedang berjalan di chat ini",
  usage: ".stopgame",
  example: ".stopgame",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 3, energi: 0, isEnabled: true,
};

async function handler(m) {
  const active = getActiveGame(m.chat);
  if (!active) return m.reply("❌ Tidak ada game aktif di chat ini.");
  clearActiveGame(m.chat);
  await m.reply(`🏳️ Sesi game *${active.type}* berhasil dihentikan.`);
}

export { pluginConfig as config, handler };
