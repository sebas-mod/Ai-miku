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
    name: "akunyt",
    alias: [],
    category: "rpg",
    description: "akunyt",
    usage: ".akunyt",
    example: ".akunyt",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn, command, args, usedPrefix }) {
      let user = global.db.data.users[m.sender];
      const tag = '@' + m.sender.split`@`[0]
      let playButton = global.db.data.users[m.sender].playButton;
      const formattedSubscribers = new Intl.NumberFormat().format(user.subscribers)
      const formattedViewers = new Intl.NumberFormat().format(user.viewers)
      const formattedLike = new Intl.NumberFormat().format(user.like)

      try {
          if (command === 'akunyt') {
              if (!user.youtube_account) {
                  return conn.reply(m.chat, `Hey Kamu Iya Kamu ${tag} Buat akun terlebih dahulu\nKetik: .createakun`, m);
              } else {
                  return conn.reply(m.chat, `📈 Akun YouTube Anda 📉\n
🧑🏻‍💻 *Streamer:* ${user.registered ? tag : conn.getName(m.sender)}
🌐 *Channel:*   ${user.youtube_account}
👥 *Subscribers:*   ${formattedSubscribers}
🪬 *Viewers:*   ${formattedViewers}
👍🏻 *Like:*   ${formattedLike}

⬜ *Silver PlayButton:*   ${playButton < 1 ? '❎' : '' || playButton >= 1 ? '✅' : ''}
🟧 *Gold PlayButton:*   ${playButton < 2 ? '❎' : '' || playButton >= 2 ? '✅' : ''}
💎 *Diamond PlayButton:*   ${playButton < 3 ? '❎' : '' || playButton >= 3 ? '✅' : ''}`, m)
              }
          } else if (/live/i.test(command) && args[0] === 'youtuber') {
              if (!user.youtube_account) {
                  return conn.reply(m.chat, `Hey Kamu Iya Kamu ${tag} Buat akun terlebih dahulu\nKetik: .createakun`, m);
              }

          } else {
              return await m.reply("Perintah tidak dikenali.\n*.akunyt*\n> ᴜɴᴛᴜᴋ ᴍᴇɴɢᴇᴄᴇᴋ ᴀᴋᴜɴ ʏᴏᴜᴛᴜʙᴇ ᴀɴᴅᴀ\n*.live [judul live]*\n> ᴜɴᴛᴜᴋ ᴍᴇᴍᴜʟᴀɪ ᴀᴋᴛɪᴠɪᴛᴀs ʟɪᴠᴇ sᴛʀᴇᴀᴍɪɴɢ.");
          }
      } catch (err) {
          m.reply("Error\n\n\n" + err.stack);
      }
  };

export { pluginConfig as config, handler }
