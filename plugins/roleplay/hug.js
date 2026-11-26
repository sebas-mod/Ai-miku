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
  name: "hug",
  alias: ['peluk'],
  category: "roleplay",
  description: "Aksi roleplay peluk dengan animasi anime",
  usage: ".hug @user",
  example: ".hug @user",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 4, energi: 0, isEnabled: true,
};

async function handler(m, { sock }) {
  await executeRpAction(m, sock, {
    action: "hug",
    emoji: "🤗",
    label: "Peluk",
    needTarget: true,
    affectionDelta: 8,
    templateTarget: '{sender} memeluk erat {target} dengan penuh kehangatan! 🤗',
    templateSelf: '{sender} memeluk dirinya sendiri sambil tersenyum.',
  });
}

export { pluginConfig as config, handler };
