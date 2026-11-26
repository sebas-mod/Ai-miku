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
    name: "bagiuang",
    alias: ["bagikoin"],
    category: "rpg",
    description: "Fitur RPG bagiuang",
    usage: ".bagiuang",
    example: ".bagiuang",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn, args }) {
  let user = global.db.data.users[m.sender]
  let target = m.mentionedJid[0]

  if (!target) return conn.reply(m.chat, `Tag orang yang ingin kamu beri uang

Contoh:
.bagiuang @user 5000`, m)

  if (!args[1]) return conn.reply(m.chat, `Masukkan jumlah uang yang ingin diberikan`, m)

  let jumlah = parseInt(args[1])

  if (!Number.isFinite(jumlah) || jumlah < 1) return conn.reply(m.chat, `Jumlah tidak valid`, m)

  if (user.money < jumlah) return conn.reply(m.chat, `Uang kamu tidak cukup`, m)

  if (target === m.sender) return conn.reply(m.chat, `Tidak bisa memberi uang ke diri sendiri`, m)

  let targetUser = global.db.data.users[target]
  if (!targetUser) return conn.reply(m.chat, `Target belum pernah memakai bot, suruh dia kirim command apa saja dulu`, m)

  user.money -= jumlah
  targetUser.money += jumlah

  let teks = `${(global.namebot || 'BOT').toUpperCase()} BERBAGI ❀

💸 @${m.sender.split('@')[0]} memberikan uang kepada
🎁 @${target.split('@')[0]}

💰 Jumlah : ${jumlah} Money

Baik sekali kamu hari ini`

  conn.reply(m.chat, teks, m, {
  mentions: [m.sender, target]
  })
  }

export { pluginConfig as config, handler }
