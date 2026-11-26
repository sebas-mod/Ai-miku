/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getActiveGame, setActiveGame, renderTTTBoard } from "../../src/lib/features/elysia-game.js";

const pluginConfig = {
  name: "tictactoe",
  alias: ["ttt"],
  category: "game",
  description: "Main Tic-Tac-Toe lawan Elysia AI atau PvP (@tag)",
  usage: ".ttt [@lawan]",
  example: ".ttt | .ttt @user",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  const active = getActiveGame(m.chat);
  if (active) return m.reply(`⏳ Masih ada game *${active.type}* yang berjalan di chat ini! Ketik \`${m.prefix}stopgame\` untuk menghentikan.`);

  const opponent = (Array.isArray(m.mentionedJid) && m.mentionedJid[0]) || m.quoted?.sender || null;
  const isAI = !opponent || opponent === m.sender;

  const session = {
    type: "tictactoe",
    startedAt: Date.now(),
    board: Array(9).fill(null),
    playerX: m.sender,
    playerO: isAI ? "ELYSIA_AI" : opponent,
    isAI,
    turn: "X",
  };

  setActiveGame(m.chat, session, 120000, async () => {
    await sock.sendMessage(m.chat, { text: "⏰ Sesi *Tic-Tac-Toe* berakhir karena tidak ada langkah selama 2 menit." });
  });

  const mentions = isAI ? [m.sender] : [m.sender, opponent];
  await sock.sendMessage(
    m.chat,
    {
      text:
        `╭─❖「 ❌⭕ *TIC-TAC-TOE — ELYSIA* 」\n` +
        `${renderTTTBoard(session.board)}\n` +
        `├───〔 *PEMAIN* 〕\n` +
        `│ ❌ : @${m.sender.split("@")[0]}\n` +
        `│ ⭕ : ${isAI ? "🤖 Elysia AI" : `@${opponent.split("@")[0]}`}\n` +
        `╰─────────────────────❖\n` +
        `_Balas angka *1-9* untuk menaruh bidak! Ketik \`.stopgame\` untuk berhenti._`,
      mentions,
    },
    { quoted: m }
  );
}

export { pluginConfig as config, handler };
