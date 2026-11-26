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
  name: "tebakkimia",
  alias: ['tkimia'],
  category: "tebak",
  description: "Main kuis Tebak Kimia berhadiah Koin & EXP",
  usage: ".tebakkimia",
  example: ".tebakkimia",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 3, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  const item = pickRandom(TEBAK_BANKS.tebakkimia);
  await startTebakSession(sock, m, {
    gameId: "tebakkimia",
    title: "Tebak Kimia",
    emoji: "⚗️",
    question: item.q,
    clueText: item.clue || "",
    answer: item.a,
    explanation: item.exp || "",
    durationSec: 60,
    rewardKoin: 1800,
    rewardExp: 350,
  });
}

export { pluginConfig as config, handler };
