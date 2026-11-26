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
    name: "freelimit",
    alias: [],
    category: "rpg",
    description: "freelimit",
    usage: ".freelimit",
    example: ".freelimit",
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

      if (!user.freelimit) user.freelimit = 0

      const cooldown = 79200000
      const elapsed = Date.now() - user.freelimit
      const remaining = cooldown - elapsed

      if (elapsed > cooldown) {
          user.limit += 20
          user.freelimit = Date.now()

          m.reply(`Berhasil!\n+20 Limit ditambahkan`)
      } else {
          m.reply(`🎌 Silahkan tunggu *${clockString(remaining)}* untuk mengambil limit kembali`)
      }
  }

  function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
      }

export { pluginConfig as config, handler }
