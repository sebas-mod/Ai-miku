/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getActiveGame, setActiveGame, renderHangman } from "../../src/lib/features/miku-game.js";

const pluginConfig = {
  name: "hangman",
  alias: ["gantung"],
  category: "game",
  description: "Tebak kata huruf demi huruf sebelum nyawa habis",
  usage: ".hangman",
  example: ".hangman",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

const WORDS = [
  { word: "indonesia", category: "Negara" },
  { word: "astronomi", category: "Sains" },
  { word: "algoritma", category: "Teknologi" },
  { word: "samudra", category: "Alam" },
  { word: "komputer", category: "Teknologi" },
  { word: "perpustakaan", category: "Tempat" },
  { word: "pelangi", category: "Alam" },
  { word: "fotografi", category: "Hobi" },
  { word: "nusantara", category: "Sejarah" },
  { word: "kristal", category: "Benda" },
  { word: "galaksi", category: "Antariksa" },
  { word: "harmoni", category: "Musik" },
];

async function handler(m, { sock }) {
  const active = getActiveGame(m.chat);
  if (active) return m.reply(`⏳ ¡Todavía hay un juego *${active.type}* activo en este chat! Escribe \`${m.prefix}stopgame\` para detenerlo.`);

  const item = WORDS[Math.floor(Math.random() * WORDS.length)];
  const session = {
    type: "hangman",
    startedAt: Date.now(),
    word: item.word,
    category: item.category,
    guessed: new Set(),
    wrong: 0,
  };

  setActiveGame(m.chat, session, 150000, async (cur) => {
    await sock.sendMessage(m.chat, { text: `⏰ ¡Se acabó el tiempo de *Ahorcado*! La respuesta era *${cur.word.toUpperCase()}*.` });
  });

  await m.reply(renderHangman(session));
}

export { pluginConfig as config, handler };
