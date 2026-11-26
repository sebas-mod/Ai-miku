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
  name: "asahotak",
  alias: ['aotak'],
  category: "tebak",
  description: "Main kuis Asah Otak berhadiah Koin & EXP",
  usage: ".asahotak",
  example: ".asahotak",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 3, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  const item = pickRandom(TEBAK_BANKS.asahotak);
  await startTebakSession(sock, m, {
    gameId: "asahotak",
    title: "Asah Otak",
    emoji: "🧠",
    question: item.q,
    clueText: item.clue || "",
    answer: item.a,
    explanation: item.exp || "",
    durationSec: 75,
    rewardKoin: 2200,
    rewardExp: 450,
  });
}

export { pluginConfig as config, handler };
