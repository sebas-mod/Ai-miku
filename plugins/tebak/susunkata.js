/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { TEBAK_BANKS, pickRandom, startTebakSession } from "../../src/lib/features/elysia-tebak.js";

const pluginConfig = {
  name: "susunkata",
  alias: ['skata'],
  category: "tebak",
  description: "Main kuis Susun Kata berhadiah Koin & EXP",
  usage: ".susunkata",
  example: ".susunkata",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 3, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  const item = pickRandom(TEBAK_BANKS.susunkata);
  await startTebakSession(sock, m, {
    gameId: "susunkata",
    title: "Susun Kata",
    emoji: "🔀",
    question: item.q,
    clueText: item.clue || "",
    answer: item.a,
    explanation: item.exp || "",
    durationSec: 60,
    rewardKoin: 1700,
    rewardExp: 340,
  });
}

export { pluginConfig as config, handler };
