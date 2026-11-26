/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { executeRpAction } from "../../src/lib/features/elysia-roleplay.js";

const pluginConfig = {
  name: "bonk",
  alias: ['getok'],
  category: "roleplay",
  description: "Aksi roleplay bonk dengan animasi anime",
  usage: ".bonk @user",
  example: ".bonk @user",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 4, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  await executeRpAction(m, sock, {
    action: "bonk",
    emoji: "🔨",
    label: "Bonk",
    needTarget: true,
    affectionDelta: 2,
    templateTarget: '{sender} menggetok kepala {target}! *BONK!* 🔨',
    templateSelf: '{sender} menggetok kepalanya sendiri!',
  });
}

export { pluginConfig as config, handler };
