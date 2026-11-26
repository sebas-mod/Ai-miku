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
    name: "akuntt",
    alias: [],
    category: "rpg",
    description: "akuntt",
    usage: ".akuntt",
    example: ".akuntt",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m) {
      let who = m.sender;
      const user = global.db.data.users[who];

      if (!user.tiktok || !user.tiktok.username) {
          return m.reply('❌ Anda belum memiliki akun TikTok! Gunakan perintah *.creatett <username>* untuk membuat akun.');
      }

      const { username, followers = 0, likes = 0, views = 0 } = user.tiktok;

      m.reply(`
📱 **Profil TikTok Anda** 📱

🔹 **Username**: ${username}
⭐ **Followers**: ${followers}
❤️ **Likes**: ${likes}
👁️ **Views**: ${views}

Gunakan perintah *.livett <judul>* untuk memulai siaran langsung.
    `.trim());
  };

export { pluginConfig as config, handler }
