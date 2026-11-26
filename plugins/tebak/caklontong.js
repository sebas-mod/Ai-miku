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
  name: "caklontong",
  alias: ['clontong'],
  category: "tebak",
  description: "Main kuis Cak Lontong berhadiah Koin & EXP",
  usage: ".caklontong",
  example: ".caklontong",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 3, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  const item = pickRandom(TEBAK_BANKS.caklontong);
  await startTebakSession(sock, m, {
    gameId: "caklontong",
    title: "Cak Lontong",
    emoji: "🤣",
    question: item.q,
    clueText: item.clue || "",
    answer: item.a,
    explanation: item.exp || "",
    durationSec: 60,
    rewardKoin: 2000,
    rewardExp: 400,
  });
}

export { pluginConfig as config, handler };
