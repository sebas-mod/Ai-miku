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
  name: "tebakbendera",
  alias: ['tbendera'],
  category: "tebak",
  description: "Main kuis Tebak Bendera berhadiah Koin & EXP",
  usage: ".tebakbendera",
  example: ".tebakbendera",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 3, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  const item = pickRandom(TEBAK_BANKS.tebakbendera);
  await startTebakSession(sock, m, {
    gameId: "tebakbendera",
    title: "Tebak Bendera",
    emoji: "🏳️",
    question: item.q,
    clueText: item.clue || "",
    answer: item.a,
    explanation: item.exp || "",
    durationSec: 50,
    rewardKoin: 1500,
    rewardExp: 300,
  });
}

export { pluginConfig as config, handler };
