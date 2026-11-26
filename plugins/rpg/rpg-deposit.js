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
    name: "deposit-utama",
    alias: ["depositutama", "rpgdeposit"],
    category: "rpg",
    description: "Fitur RPG deposit-utama",
    usage: ".deposit-utama",
    example: ".deposit-utama",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn, args }) {
    let user = global.db.data.users[m.sender]

    if (!user.atm) {
      return conn.reply(m.chat, '💳 Kamu belum memiliki ATM.', m)
    }

    let count = Math.floor(Number(args[0]))

    if (!count || count < 1) {
      return conn.reply(
        m.chat,
        'Contoh:\n.deposit 5000',
        m
      )
    }

    if (user.money < count) {
      return conn.reply(
        m.chat,
        '💸 Uang kamu tidak cukup.',
        m
      )
    }

    if ((user.bank + count) > user.fullatm) {
      return conn.reply(
        m.chat,
        `🏦 Bank penuh!\n\nLimit ATM: ${user.fullatm}`,
        m
      )
    }

    user.money -= count
    user.bank += count

    conn.reply(
      m.chat,
      `
*${(global.namebot || 'BOT').toUpperCase()} DEPOSIT* ❀

╭──〔 DEPOSIT BERHASIL 〕──╮
│ 💰 Deposit : ${count}
│ 🏦 Saldo : ${user.bank}
╰──────────────────╯
`.trim(),
      m
    )
  }

export { pluginConfig as config, handler }
