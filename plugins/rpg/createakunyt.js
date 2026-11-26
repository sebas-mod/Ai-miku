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
    name: "createakunyt",
    alias: ["createakun"],
    category: "rpg",
    description: "createakunyt createakun",
    usage: ".createakunyt createakun",
    example: ".createakunyt createakun",
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

      try {
          if (command === 'createakun') {
              if (args.length === 0) {
                  return m.reply("Silakan masukkan nama akun YouTube Anda.\nContoh: .createakun Ponta Yete");
              }

              let youtubeAccountName = args.join(' ');

              user.youtube_account = youtubeAccountName;
              m.reply(`Akun YouTube Anda telah berhasil dibuat/diedit\nchannel: ${youtubeAccountName}`);
          } else if (/live/i.test(command) && args[0] === 'youtuber') {
              if (!user.youtube_account) {
                  return m.reply("Buat akun terlebih dahulu\nKetik: .createakun");
              }

          } else {
              return await m.reply("Perintah tidak dikenali.\n*.akunyt*\n> ᴜɴᴛᴜᴋ ᴍᴇɴɢᴇᴄᴇᴋ ᴀᴋᴜɴ ʏᴏᴜᴛᴜʙᴇ ᴀɴᴅᴀ\n*.live [judul live]*\n> ᴜɴᴛᴜᴋ ᴍᴇᴍᴜʟᴀɪ ᴀᴋᴛɪᴠɪᴛᴀs ʟɪᴠᴇ sᴛʀᴇᴀᴍɪɴɢ.");
          }
      } catch (err) {
          m.reply("Error\n\n\n" + err.stack);
      }
  };

  handler.as = 'createakun'

export { pluginConfig as config, handler }
