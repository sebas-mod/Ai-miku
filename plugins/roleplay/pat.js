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
  name: "pat",
  alias: ['elus'],
  category: "roleplay",
  description: "Aksi roleplay elus kepala dengan animasi anime",
  usage: ".pat @user",
  example: ".pat @user",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 4, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  await executeRpAction(m, sock, {
    action: "pat",
    emoji: "🥰",
    label: "Elus Kepala",
    needTarget: true,
    affectionDelta: 6,
    templateTarget: '{sender} mengelus lembut kepala {target}. Good job! 🥰',
    templateSelf: '{sender} menepuk kepalanya sendiri.',
  });
}

export { pluginConfig as config, handler };
