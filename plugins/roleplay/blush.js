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
  name: "blush",
  alias: ['malu'],
  category: "roleplay",
  description: "Aksi roleplay blush dengan animasi anime",
  usage: ".blush [@user]",
  example: ".blush @user",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 4, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  await executeRpAction(m, sock, {
    action: "blush",
    emoji: "😊",
    label: "Blush",
    needTarget: false,
    affectionDelta: 5,
    templateTarget: '{sender} tersipu malu gara-gara {target}! 😊🌸',
    templateSelf: '{sender} ¡se sonroja de vergüenza! 😊🌸',
  });
}

export { pluginConfig as config, handler };
