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
  name: "slap",
  alias: ['tampar'],
  category: "roleplay",
  description: "Acción de rol de bofetada con animación anime",
  usage: ".slap @user",
  example: ".slap @user",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 4, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  await executeRpAction(m, sock, {
    action: "slap",
    emoji: "👋",
    label: "Tampar",
    needTarget: true,
    affectionDelta: -2,
    templateTarget: '{sender} ¡le da una bofetada a {target} con todo el drama! 👋💥',
    templateSelf: '{sender} menepuk pipinya sendiri biar sadar!',
  });
}

export { pluginConfig as config, handler };
