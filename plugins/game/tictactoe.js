/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getActiveGame, setActiveGame, renderTTTBoard } from "../../src/lib/features/miku-game.js";

const pluginConfig = {
  name: "tictactoe",
  alias: ["ttt"],
  category: "game",
  description: "Main Tic-Tac-Toe lawan Miku AI atau PvP (@tag)",
  usage: ".ttt [@lawan]",
  example: ".ttt | .ttt @user",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  const active = getActiveGame(m.chat);
  if (active) return m.reply(`⏳ ¡Todavía hay un juego *${active.type}* en marcha en este chat! Escribe \`${m.prefix}stopgame\` para detenerlo.`);

  const opponent = (Array.isArray(m.mentionedJid) && m.mentionedJid[0]) || m.quoted?.sender || null;
  const isAI = !opponent || opponent === m.sender;

  const session = {
    type: "tictactoe",
    startedAt: Date.now(),
    board: Array(9).fill(null),
    playerX: m.sender,
    playerO: isAI ? "MIKU_AI" : opponent,
    isAI,
    turn: "X",
  };

  setActiveGame(m.chat, session, 120000, async () => {
    await sock.sendMessage(m.chat, { text: "⏰ La sesión de *Tres en Línea* terminó porque no hubo movimientos en 2 minutos." });
  });

  const mentions = isAI ? [m.sender] : [m.sender, opponent];
  await sock.sendMessage(
    m.chat,
    {
      text:
        `╭─❖「 ❌⭕ *TIC-TAC-TOE — MIKU* 」\n` +
        `${renderTTTBoard(session.board)}\n` +
        `├───〔 *PEMAIN* 〕\n` +
        `│ ❌ : @${m.sender.split("@")[0]}\n` +
        `│ ⭕ : ${isAI ? "🤖 Miku AI" : `@${opponent.split("@")[0]}`}\n` +
        `╰─────────────────────❖\n` +
        `_¡Responde con un número del *1 al 9* para colocar ficha! Escribe \`.stopgame\` para parar._`,
      mentions,
    },
    { quoted: m }
  );
}

export { pluginConfig as config, handler };
