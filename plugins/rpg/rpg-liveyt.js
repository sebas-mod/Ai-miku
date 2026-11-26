/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const clockString = ElysiaRuntime.clockString;

const pluginConfig = {
    name: "liveyt",
    alias: [],
    category: "rpg",
    description: "Fitur RPG liveyt",
    usage: ".liveyt",
    example: ".liveyt",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { conn, args, usedPrefix }) {
  let user = global.db.data.users[m.sender]

  if (!args[0]) {
  return conn.reply(m.chat, `${(global.namebot || 'BOT').toUpperCase()} YOUTUBE RPG ❀

Gunakan perintah berikut

${usedPrefix}liveyt buat <channel>
Membuat channel YouTube

${usedPrefix}liveyt cek
Melihat channel YouTube kamu

${usedPrefix}liveyt upload
Upload video YouTube

${usedPrefix}liveyt delete
Menghapus channel`, m)
  }

  let type = args[0].toLowerCase()

  if (type == 'buat') {
  if (user.youtube) return conn.reply(m.chat, `Kamu sudah memiliki channel YouTube.`, m)

  if (!args[1]) return conn.reply(m.chat, `Contoh penggunaan

${usedPrefix}liveyt buat Arthazy_channel`, m)

  let name = args.slice(1).join(" ")

  user.youtube = {
  channel: name,
  subscriber: 0,
  like: 0,
  video: 0,
  verified: false,
  lastupload: 0
  }

  return conn.reply(m.chat, `❀ CHANNEL YOUTUBE BERHASIL DIBUAT ❀

📺 Channel : ${name}
👥 Subscriber : 0
👍 Like : 0
🎬 Video : 0

Sekarang kamu bisa upload video`, m)
  }

  if (type == 'cek') {
  if (!user.youtube) return conn.reply(m.chat, `Kamu belum memiliki channel YouTube

Gunakan
${usedPrefix}liveyt buat <channel>`, m)

  let yt = user.youtube

  let teks = `❀ YOUTUBE CHANNEL ❀

📺 Channel : ${yt.channel}
👥 Subscriber : ${yt.subscriber}
👍 Like : ${yt.like}
🎬 Video : ${yt.video}
${yt.verified ? '✔️ Verified Channel' : '❌ Not Verified'}
`

  return conn.reply(m.chat, teks, m)
  }

  if (type == 'delete') {
  if (!user.youtube) return conn.reply(m.chat, `Kamu belum memiliki channel YouTube`, m)

  let name = user.youtube.channel

  delete user.youtube

  return conn.reply(m.chat, `❀ CHANNEL YOUTUBE DIHAPUS ❀

Channel ${name} telah dihapus dari sistem.`, m)
  }

  if (type == 'upload') {
  if (!user.youtube) return conn.reply(m.chat, `Kamu belum memiliki channel YouTube

Gunakan
${usedPrefix}liveyt buat <channel>`, m)

  let yt = user.youtube

  let __timers = (new Date - yt.lastupload)
  let _timers = (3600000 - __timers)
  let timers = clockString(_timers)

  if (new Date - yt.lastupload < 3600000) {
  return conn.reply(m.chat, `❀ YOUTUBE UPLOAD ❀

Kamu sudah upload video sebelumnya

Coba lagi dalam
${timers}`, m)
  }

  let views = Math.floor(Math.random() * 50000) + 1000
  let subs = Math.floor(Math.random() * 500) + 50
  let like = Math.floor(Math.random() * 1000) + 100
  let money = Math.floor(Math.random() * 400000) + 100000
  let exp = Math.floor(Math.random() * 300) + 50

  yt.subscriber += subs
  yt.like += like
  yt.video += 1
  yt.lastupload = new Date * 1

  user.money += money
  user.exp += exp

  let hasil = `❀ YOUTUBE VIDEO UPLOADED ❀

📺 Channel : ${yt.channel}

👁️ Views : ${views}
➕ Subscriber : +${subs}
👍 Like : +${like}

🎬 Total Video : ${yt.video}

💰 Money : +${money}
Exp : +${exp}
`

  conn.reply(m.chat, hasil, m)
  }
  }

export { pluginConfig as config, handler }
