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
    name: "resetbansos",
    alias: [],
    category: "rpg",
    description: "resetbansos <nomor>",
    usage: ".resetbansos <nomor>",
    example: ".resetbansos <nomor>",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn, args, isOwner, command }) {
      if (!isOwner) return m.reply('❌ Hanya owner yang bisa mereset bansos!');

      if (!args[0]) return m.reply(`Gunakan: *.${command} 628xxx*`);

      let jid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      let user = global.db.data.users[jid];

      if (!user) return m.reply(`⚠️ User dengan nomor ${args[0]} belum pernah menggunakan bot.`);

      user.lastBansos = 0;
      m.reply(`✅ Bansos untuk ${args[0]} telah di-reset. Mereka bisa klaim ulang sekarang.`);
  };

export { pluginConfig as config, handler }
