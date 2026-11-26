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
  name: "tebakemoji",
  alias: ['temoji'],
  category: "tebak",
  description: "Main kuis Tebak Emoji berhadiah Koin & EXP",
  usage: ".tebakemoji",
  example: ".tebakemoji",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 3, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  const item = pickRandom(TEBAK_BANKS.tebakemoji);
  await startTebakSession(sock, m, {
    gameId: "tebakemoji",
    title: "Tebak Emoji",
    emoji: "😎",
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
