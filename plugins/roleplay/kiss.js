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
  name: "kiss",
  alias: ['cium'],
  category: "roleplay",
  description: "Acción de rol de beso con animación anime",
  usage: ".kiss @user",
  example: ".kiss @user",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 4, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  await executeRpAction(m, sock, {
    action: "kiss",
    emoji: "💋",
    label: "Cium",
    needTarget: true,
    affectionDelta: 10,
    templateTarget: '¡{sender} le da un besito dulce a {target}! 💋',
    templateSelf: '¡{sender} lanza un beso volador al aire!',
  });
}

export { pluginConfig as config, handler };
