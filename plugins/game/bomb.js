/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getActiveGame, setActiveGame, renderBombBoard } from "../../src/lib/features/elysia-game.js";

const pluginConfig = {
  name: "bomb",
  alias: ["tebakbom", "mines"],
  category: "game",
  description: "Buka kotak harta karun 3x3 tanpa terkena bom tersembunyi",
  usage: ".bomb",
  example: ".bomb",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  const active = getActiveGame(m.chat);
  if (active) return m.reply(`⏳ Masih ada game *${active.type}* yang aktif di chat ini! Ketik \`${m.prefix}stopgame\` untuk berhenti.`);

  const session = {
    type: "bomb",
    startedAt: Date.now(),
    player: m.sender,
    bombIndex: Math.floor(Math.random() * 9),
    opened: new Set(),
    pot: 0,
  };

  setActiveGame(m.chat, session, 120000, async () => {
    await sock.sendMessage(m.chat, { text: "⏰ Sesi *Tebak Bom* berakhir karena waktu habis." });
  });

  await m.reply(renderBombBoard(session));
}

export { pluginConfig as config, handler };
