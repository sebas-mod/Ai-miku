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
  name: "dance",
  alias: ['joget'],
  category: "roleplay",
  description: "Aksi roleplay dance dengan animasi anime",
  usage: ".dance [@user]",
  example: ".dance @user",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 4, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  await executeRpAction(m, sock, {
    action: "dance",
    emoji: "💃",
    label: "Dance",
    needTarget: false,
    affectionDelta: 5,
    templateTarget: '{sender} mengajak {target} berdansa ria bersama! 💃✨',
    templateSelf: '{sender} sedang asyik berjoget dengan penuh semangat! 💃✨',
  });
}

export { pluginConfig as config, handler };
