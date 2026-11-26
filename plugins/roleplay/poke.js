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
  name: "poke",
  alias: ['colek'],
  category: "roleplay",
  description: "Aksi roleplay colek dengan animasi anime",
  usage: ".poke @user",
  example: ".poke @user",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 4, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  await executeRpAction(m, sock, {
    action: "poke",
    emoji: "👉",
    label: "Colek",
    needTarget: true,
    affectionDelta: 4,
    templateTarget: '¡{sender} le pellizca la mejilla a {target} con picardía! 👉✨',
    templateSelf: '{sender} mencolek angin.',
  });
}

export { pluginConfig as config, handler };
