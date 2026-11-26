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
    name: "liveig",
    alias: [],
    category: "rpg",
    description: "Fitur RPG liveig",
    usage: ".liveig",
    example: ".liveig",
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
  return conn.reply(m.chat, `${(global.namebot || 'BOT').toUpperCase()} INSTAGRAM RPG ❀

Gunakan perintah berikut

${usedPrefix}liveig buat <username>
Membuat akun Instagram

${usedPrefix}liveig cek
Melihat akun Instagram kamu

${usedPrefix}liveig post
Upload postingan

${usedPrefix}liveig delete
Menghapus akun`, m)
  }

  let type = args[0].toLowerCase()

  if (type == 'buat') {
  if (user.instagram) return conn.reply(m.chat, `Kamu sudah memiliki akun Instagram.`, m)

  if (!args[1]) return conn.reply(m.chat, `Contoh penggunaan

${usedPrefix}liveig buat Arthazy_chan`, m)

  let username = args[1]

  user.instagram = {
  username: username,
  followers: 0,
  like: 0,
  post: 0,
  verified: false,
  lastpost: 0
  }

  return conn.reply(m.chat, `❀ AKUN INSTAGRAM BERHASIL DIBUAT ❀

📷 Username : ${username}
👥 Followers : 0
❤️ Like : 0
📸 Post : 0

Sekarang kamu bisa upload postingan`, m)
  }

  if (type == 'cek') {
  if (!user.instagram) return conn.reply(m.chat, `Kamu belum memiliki akun Instagram

Gunakan
${usedPrefix}liveig buat <username>`, m)

  let ig = user.instagram

  let teks = `❀ INSTAGRAM ACCOUNT ❀

📷 Username : ${ig.username}
👥 Followers : ${ig.followers}
❤️ Like : ${ig.like}
📸 Post : ${ig.post}
${ig.verified ? '✔️ Verified' : '❌ Not Verified'}
`

  return conn.reply(m.chat, teks, m)
  }

  if (type == 'delete') {
  if (!user.instagram) return conn.reply(m.chat, `Kamu belum memiliki akun Instagram`, m)

  let username = user.instagram.username

  delete user.instagram

  return conn.reply(m.chat, `❀ AKUN INSTAGRAM DIHAPUS ❀

Akun @${username} telah dihapus dari sistem.`, m)
  }

  if (type == 'post') {
  if (!user.instagram) return conn.reply(m.chat, `Kamu belum memiliki akun Instagram

Gunakan
${usedPrefix}liveig buat <username>`, m)

  let ig = user.instagram

  let __timers = (new Date - ig.lastpost)
  let _timers = (1800000 - __timers)
  let timers = clockString(_timers)

  if (new Date - ig.lastpost < 1800000) {
  return conn.reply(m.chat, `❀ INSTAGRAM POST ❀

Kamu sudah posting sebelumnya

Coba lagi dalam
${timers}`, m)
  }

  let like = Math.floor(Math.random() * 2000) + 100
  let followers = Math.floor(Math.random() * 300) + 20
  let money = Math.floor(Math.random() * 200000) + 50000
  let exp = Math.floor(Math.random() * 200) + 50

  ig.like += like
  ig.followers += followers
  ig.post += 1
  ig.lastpost = new Date * 1

  user.money += money
  user.exp += exp

  let hasil = `❀ INSTAGRAM POSTING ❀

📷 @${ig.username} mengupload postingan baru

❤️ Like : +${like}
👥 Followers : +${followers}

📸 Total Post : ${ig.post}

💰 Money : +${money}
Exp : +${exp}
`

  conn.reply(m.chat, hasil, m)
  }
  }

export { pluginConfig as config, handler }
