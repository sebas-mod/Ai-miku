/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getActiveGame, setActiveGame } from "../../src/lib/features/elysia-game.js";

const pluginConfig = {
  name: "mathquiz",
  alias: ["hitungcepat", "math"],
  category: "game",
  description: "Duel hitung cepat matematika (easy / medium / hard)",
  usage: ".mathquiz [easy|medium|hard]",
  example: ".mathquiz medium",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 4, energi: 0, isEnabled: true,
};

function genQuestion(level) {
  const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  if (level === "hard") {
    const a = r(12, 45), b = r(6, 19), c = r(10, 80);
    return { expr: `${a} × ${b} + ${c}`, answer: a * b + c, koin: 3000 };
  }
  if (level === "medium") {
    const a = r(15, 60), b = r(10, 40), op = Math.random() < 0.5 ? "+" : "-";
    return { expr: `${a} ${op} ${b}`, answer: op === "+" ? a + b : a - b, koin: 1800 };
  }
  const a = r(5, 25), b = r(3, 15);
  return { expr: `${a} + ${b}`, answer: a + b, koin: 1200 };
}

async function handler(m, { sock }) {
  const active = getActiveGame(m.chat);
  if (active) return m.reply(`⏳ Masih ada game *${active.type}* yang aktif di chat ini! Ketik \`${m.prefix}stopgame\` untuk berhenti.`);

  const level = /^(easy|medium|hard)$/i.test(String(m.text || "").trim())
    ? String(m.text).trim().toLowerCase()
    : "medium";
  const q = genQuestion(level);

  const session = {
    type: "mathquiz",
    startedAt: Date.now(),
    answer: q.answer,
    rewardKoin: q.koin,
  };

  setActiveGame(m.chat, session, 30000, async (cur) => {
    await sock.sendMessage(m.chat, { text: `⏰ Waktu *Hitung Cepat* habis! Jawabannya adalah *${cur.answer}*.` });
  });

  await m.reply(
    `╭─❖「 ⚡ *HITUNG CEPAT — ${level.toUpperCase()}* 」\n` +
      `│ 🧮 Soal   : *${q.expr} = ?*\n` +
      `│ ⏱️ Waktu  : *30 detik*\n` +
      `│ 💰 Hadiah : *+${q.koin.toLocaleString("id-ID")} Koin* (+Bonus Cepat!)\n` +
      `╰─────────────────────❖\n` +
      `_Ketik hasil angkanya langsung di chat!_`
  );
}

export { pluginConfig as config, handler };
