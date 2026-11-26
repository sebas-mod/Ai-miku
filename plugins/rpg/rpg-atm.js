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
    name: "atm",
    alias: [],
    category: "rpg",
    description: "Fitur RPG atm",
    usage: ".atm",
    example: ".atm",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn }) {
    let user = global.db.data.users[m.sender]
    let e = global.rpg.emoticon

    let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
    let tag = '@' + who.split('@')[0]

    if (!user.atm) {
      return conn.reply(
        m.chat,
        `💳 Kamu belum memiliki ATM\nGunakan *.buyatm* untuk membeli ATM.`,
        m
      )
    }

    let text = `
*${(global.namebot || 'BOT').toUpperCase()} ATM INFO* ❀

╭──〔 ATM STATUS 〕──╮
│ 👤 Nama : ${tag}
│
│ 💳 ATM   : ✔️ Aktif
│ ${e('bank')} Bank Limit : ${user.fullatm || 1000}
│ ${e('money')} Money : ${user.money}
│ ${e('bank')} Bank  : ${user.bank}
╰────────────────╯
`.trim()

    conn.sendMessage(
      m.chat,
      {
        text,
        mentions: [who]
      },
      { quoted: m }
    )
  }

export { pluginConfig as config, handler }
