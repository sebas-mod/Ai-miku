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
    name: "creatett",
    alias: [],
    category: "rpg",
    description: "creatett <username>",
    usage: ".creatett <username>",
    example: ".creatett <username>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { text, usedPrefix, command }) {
      let who = m.sender;
      const user = global.db.data.users[who];

      if (user.tiktok && user.tiktok.username) {
          return m.reply('❌ Anda sudah memiliki akun TikTok! Gunakan perintah *.akuntt* untuk melihat profil Anda.');
      }

      if (!text) {
          return m.reply(`❗ Nama pengguna tidak boleh kosong.\nGunakan contoh: *${usedPrefix + command} NamaTikTok*`);
      }

      user.tiktok = {
          username: text.trim(),
          followers: 0,
          following: 0,
          likes: 0,
          posts: 0,
          views: 0,
          live: false,
          lastLive: 0,
      };

      m.reply(`
🎉 **Akun TikTok Berhasil Dibuat!**

👤 Username: ${user.tiktok.username}
👥 Followers: 0
❤️ Likes: 0
🎥 Views: 0
📁 Posts: 0
`);
  };

export { pluginConfig as config, handler }
