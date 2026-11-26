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
  name: "family100",
  alias: ["f100"],
  category: "tebak",
  description: "Main kuis Family 100 dengan papan jawaban interaktif",
  usage: ".family100",
  example: ".family100",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 5, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  const item = pickRandom(TEBAK_BANKS.family100);
  await startTebakSession(sock, m, {
    gameId: "family100",
    title: "Family 100",
    emoji: "👨‍👩‍👧‍👦",
    question: item.q,
    answers: item.answers,
    durationSec: 120,
    rewardKoin: 1000,
    rewardExp: 200,
  });
}

export { pluginConfig as config, handler };
