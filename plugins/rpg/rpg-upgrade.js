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
    name: "upgrade-utama",
    alias: ["upgradeutama", "rpgupgrade"],
    category: "rpg",
    description: "Fitur RPG upgrade-utama",
    usage: ".upgrade-utama",
    example: ".upgrade-utama",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn }) {
    let user = global.db.data.users[m.sender]

    if (!user.atm) {
      return conn.reply(
        m.chat,
        '💳 Kamu belum memiliki ATM.',
        m
      )
    }

    const levels = [
      { cap: 1000, price: 100000 },
      { cap: 5000, price: 250000 },
      { cap: 10000, price: 500000 },
      { cap: 25000, price: 1000000 },
      { cap: 50000, price: 0 }
    ]

    let current = levels.findIndex(v => v.cap === user.fullatm)

    if (current === -1) current = 0

    if (current >= levels.length - 1) {
      return conn.reply(
        m.chat,
        'ATM kamu sudah mencapai level maksimal.',
        m
      )
    }

    let next = levels[current + 1]

    if (user.money < next.price) {
      return conn.reply(
        m.chat,
        `💸 Uang kurang.\n\nHarga Upgrade: ${next.price}`,
        m
      )
    }

    user.money -= next.price
    user.fullatm = next.cap

    conn.reply(
      m.chat,
      `
*${(global.namebot || 'BOT').toUpperCase()} ATM UPGRADE* ❀

╭──〔 UPGRADE BERHASIL 〕──╮
│ 🏦 Kapasitas Baru
│ ${next.cap}
│
│ 💰 Biaya
│ ${next.price}
╰──────────────────╯
`.trim(),
      m
    )
  }

export { pluginConfig as config, handler }
