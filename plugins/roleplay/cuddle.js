/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { executeRpAction } from "../../src/lib/features/miku-roleplay.js";

const pluginConfig = {
  name: "cuddle",
  alias: ['manja'],
  category: "roleplay",
  description: "Aksi roleplay cuddle dengan animasi anime",
  usage: ".cuddle @user",
  example: ".cuddle @user",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 4, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  await executeRpAction(m, sock, {
    action: "cuddle",
    emoji: "🫶",
    label: "Cuddle",
    needTarget: true,
    affectionDelta: 9,
    templateTarget: '{sender} bersandar manja di samping {target}! 🫶',
    templateSelf: '{sender} bergelung nyaman sendirian.',
  });
}

export { pluginConfig as config, handler };
