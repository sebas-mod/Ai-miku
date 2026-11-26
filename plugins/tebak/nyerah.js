/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { surrenderTebak } from "../../src/lib/features/elysia-tebak.js";

const pluginConfig = {
  name: "nyerah",
  alias: ["surrender", "menyerah"],
  category: "tebak",
  description: "Menyerah dari sesi tebak-tebakan aktif dan lihat jawabannya",
  usage: ".nyerah",
  example: ".nyerah",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 3, energi: 0, isEnabled: true,
};

async function handler(m) {
  await surrenderTebak(m);
}

export { pluginConfig as config, handler };
