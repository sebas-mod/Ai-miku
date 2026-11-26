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
    name: "buyatm",
    alias: ["beliatm"],
    category: "rpg",
    description: "Fitur RPG buyatm",
    usage: ".buyatm",
    example: ".buyatm",
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

    if (user.atm) {
      return conn.reply(
        m.chat,
        'Kamu sudah memiliki ATM.',
        m
      )
    }

    const harga = 50000

    if (user.money < harga) {
      return conn.reply(
        m.chat,
        `Uang kamu kurang.\n\n💰 Harga ATM: ${harga}`,
        m
      )
    }

    user.money -= harga
    user.atm = true
    user.bank = 0
    user.fullatm = 1000

    conn.reply(
      m.chat,
      `
*${(global.namebot || 'BOT').toUpperCase()} ATM PURCHASE* ❀

╭──〔 ATM BERHASIL DIBELI 〕──╮
│ 💳 ATM : Aktif
│ 💰 Harga : ${harga}
│ 🏦 Kapasitas : 1000
╰────────────────────╯
`.trim(),
      m
    )
  }

export { pluginConfig as config, handler }
