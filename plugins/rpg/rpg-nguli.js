/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "nguli",
    alias: ["kuli", "kerja-kuli"],
    category: "rpg",
    description: "Fitur RPG nguli",
    usage: ".nguli",
    example: ".nguli",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m) {
      if (new Date() - global.db.data.users[m.sender].lastnguli > 86400000) {
          global.db.data.users[m.sender].limit += 10;
          m.reply('_Selamat Kamu Mendapatkan +10 Limit_');
          global.db.data.users[m.sender].lastnguli = Date.now();
      } else m.reply('Kamu Sudah Mengklaim Upah Nguli Hari Ini');
  };

export { pluginConfig as config, handler }
