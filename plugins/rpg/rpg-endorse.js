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
    name: "endorse",
    alias: ["fyp", "verified"],
    category: "rpg",
    description: "Fitur RPG endorse",
    usage: ".endorse",
    example: ".endorse",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { conn, command }) {
  let user = global.db.data.users[m.sender]

  if (command == 'endorse') {
  let income = Math.floor(Math.random() * 500000) + 100000
  let exp = Math.floor(Math.random() * 300) + 50

  let brand = [
  'Nike',
  'Adidas',
  'Samsung',
  'Xiaomi',
  'Tokopedia',
  'Shopee',
  'Gojek',
  'Grab',
  'Indomie',
  'Teh Botol'
  ]

  let chosen = brand[Math.floor(Math.random() * brand.length)]

  user.money += income
  user.exp += exp

  conn.reply(m.chat, `❀ ENDORSEMENT DEAL ❀

📢 Kamu mendapat sponsor dari ${chosen}

💰 Bayaran : +${income}
Exp : +${exp}

Brand sangat puas dengan promosi kamu!`, m)
  }

  if (command == 'fyp') {
  let followers = Math.floor(Math.random() * 2000) + 500
  let money = Math.floor(Math.random() * 300000) + 100000
  let exp = Math.floor(Math.random() * 200) + 50

  user.money += money
  user.exp += exp

  conn.reply(m.chat, `❀ KONTEN MASUK FYP ❀

🔥 Konten kamu viral!

👥 Followers baru : +${followers}

💰 Money : +${money}
Exp : +${exp}`, m)
  }

  if (command == 'verified') {
  if (user.money < 500000) {
  return conn.reply(m.chat, `Untuk membeli centang biru kamu butuh 500000 money`, m)
  }

  user.money -= 500000
  user.verified = true

  conn.reply(m.chat, `❀ VERIFIED ACCOUNT ❀

Akun kamu sekarang memiliki centang biru ✔️

Sekarang kamu terlihat lebih profesional!`, m)
  }
  }

  handler.as = 'endorse'

export { pluginConfig as config, handler }
