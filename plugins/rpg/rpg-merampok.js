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
    name: "merampok",
    alias: ["rampok2"],
    category: "rpg",
    description: "Fitur RPG merampok",
    usage: ".merampok",
    example: ".merampok",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { conn, args }) {
  let user = global.db.data.users[m.sender]
  let target = m.mentionedJid[0]

  if (!target) return conn.reply(m.chat, `Tag target yang ingin dirampok

Contoh:
.merampok @user`, m)

  if (target == m.sender) return conn.reply(m.chat, `Tidak bisa merampok diri sendiri`, m)

  let targetUser = global.db.data.users[target]
  if (!targetUser) return conn.reply(m.chat, `Target belum pernah memakai bot, suruh dia kirim command apa saja dulu`, m)

  let __timers = (new Date - user.lastrampok)
  let _timers = (3600000 - __timers)
  let timers = clockString(_timers)

  if (new Date - user.lastrampok < 3600000) {
  return conn.reply(m.chat, `${(global.namebot || 'BOT').toUpperCase()} RAMPOK ❀

Kamu sudah merampok sebelumnya

Coba lagi dalam
${timers}`, m)
  }

  if (targetUser.money < 1000) {
  return conn.reply(m.chat, `Target terlalu miskin untuk dirampok`, m)
  }

  let berhasil = Math.random() > 0.4

  if (!berhasil) {
  let denda = Math.floor(Math.random() * 5000) + 1000

  user.money -= denda
  user.lastrampok = new Date * 1

  return conn.reply(m.chat, `❀ RAMPOK GAGAL ❀

🚓 Kamu tertangkap polisi!

💸 Denda : ${denda} Money`, m)
  }

  let hasil = Math.floor(Math.random() * targetUser.money / 2) + 1000

  user.money += hasil
  targetUser.money -= hasil
  user.lastrampok = new Date * 1

  let teks = `❀ RAMPOK BERHASIL ❀

🕵️ @${m.sender.split('@')[0]} berhasil merampok

💰 @${target.split('@')[0]}

🎁 Hasil Rampok : ${hasil} Money
`

  conn.reply(m.chat, teks, m, {
  mentions: [m.sender, target]
  })
  }

export { pluginConfig as config, handler }
