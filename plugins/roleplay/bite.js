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
  name: "bite",
  alias: ['gigit'],
  category: "roleplay",
  description: "Acción de rol de morder con animación anime",
  usage: ".bite @user",
  example: ".bite @user",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 4, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  await executeRpAction(m, sock, {
    action: "bite",
    emoji: "🦷",
    label: "Gigit",
    needTarget: true,
    affectionDelta: 3,
    templateTarget: '{sender} menggigit gemas lengan {target}! *Chomp!* 🦷',
    templateSelf: '{sender} menggigit jarinya sendiri.',
  });
}

export { pluginConfig as config, handler };
