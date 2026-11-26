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
    name: "livetiktok",
    alias: [],
    category: "rpg",
    description: "Fitur RPG livetiktok",
    usage: ".livetiktok",
    example: ".livetiktok",
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
  return conn.reply(m.chat, `${(global.namebot || 'BOT').toUpperCase()} TIKTOK RPG ❀

Gunakan perintah berikut

${usedPrefix}livetiktok buat <username>
Membuat akun TikTok

${usedPrefix}livetiktok cek
Melihat akun TikTok kamu

${usedPrefix}livetiktok live
Memulai live TikTok

${usedPrefix}livetiktok delete
Menghapus akun TikTok`, m)
  }

  let type = args[0].toLowerCase()

  if (type == 'buat') {
  if (user.tiktok) return conn.reply(m.chat, `Kamu sudah memiliki akun TikTok.`, m)

  if (!args[1]) return conn.reply(m.chat, `Contoh penggunaan

${usedPrefix}livetiktok buat Arthazy_chan`, m)

  let username = args[1]

  user.tiktok = {
  username: username,
  followers: 0,
  like: 0,
  verified: false,
  lastlive: 0
  }

  return conn.reply(m.chat, `❀ AKUN TIKTOK BERHASIL DIBUAT ❀

👤 Username : ${username}
👥 Followers : 0
❤️ Like : 0

Sekarang kamu bisa live TikTok`, m)
  }

  if (type == 'cek') {
  if (!user.tiktok) return conn.reply(m.chat, `Kamu belum memiliki akun TikTok

Gunakan
${usedPrefix}livetiktok buat <username>`, m)

  let acc = user.tiktok

  let teks = `❀ TIKTOK ACCOUNT ❀

👤 Username : ${acc.username}
👥 Followers : ${acc.followers}
❤️ Like : ${acc.like}
${acc.verified ? '✔️ Verified' : '❌ Not Verified'}
`

  return conn.reply(m.chat, teks, m)
  }

  if (type == 'delete') {
  if (!user.tiktok) return conn.reply(m.chat, `Kamu belum memiliki akun TikTok`, m)

  let username = user.tiktok.username

  delete user.tiktok

  return conn.reply(m.chat, `❀ AKUN TIKTOK DIHAPUS ❀

Akun @${username} telah dihapus dari sistem.`, m)
  }

  if (type == 'live') {
  if (!user.tiktok) return conn.reply(m.chat, `Kamu belum memiliki akun TikTok

Gunakan
${usedPrefix}livetiktok buat <username>`, m)

  let acc = user.tiktok

  let __timers = (new Date - acc.lastlive)
  let _timers = (1800000 - __timers)
  let timers = clockString(_timers)

  if (new Date - acc.lastlive < 1800000) {
  return conn.reply(m.chat, `${(global.namebot || 'BOT').toUpperCase()} TIKTOK LIVE ❀

Kamu sudah live sebelumnya

Coba lagi dalam
${timers}`, m)
  }

  let viewers = Math.floor(Math.random() * 1000) + 50
  let followers = Math.floor(Math.random() * 200) + 10
  let like = Math.floor(Math.random() * 500) + 50
  let gift = Math.floor(Math.random() * 300000) + 50000
  let exp = Math.floor(Math.random() * 200) + 50

  acc.followers += followers
  acc.like += like
  acc.lastlive = new Date * 1

  user.money += gift
  user.exp += exp

  let hasil = `${(global.namebot || 'BOT').toUpperCase()} TIKTOK LIVE ❀

📱 @${acc.username} sedang live

👥 Penonton : ${viewers}
➕ Followers : +${followers}
❤️ Like : +${like}

🎁 Gift : ${gift} Money
Exp : +${exp}
`

  conn.reply(m.chat, hasil, m)
  }
  }

export { pluginConfig as config, handler }
