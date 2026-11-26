/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { giveTebakHint } from "../../src/lib/features/elysia-tebak.js";

const pluginConfig = {
  name: "hint",
  alias: ["clue", "bantuan"],
  category: "tebak",
  description: "Minta petunjuk huruf untuk sesi tebak-tebakan yang aktif",
  usage: ".hint",
  example: ".hint",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 3, energi: 0, isEnabled: true,
};

async function handler(m) {
  await giveTebakHint(m);
}

export { pluginConfig as config, handler };
