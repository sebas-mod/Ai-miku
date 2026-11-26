/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const xpRange = ElysiaRuntime.xpRange;

const pluginConfig = {
    name: "ceklevel",
    alias: [],
    category: "rpg",
    description: "ceklevel",
    usage: ".ceklevel",
    example: ".ceklevel",
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
    let { min, max } = xpRange(user.level)
    let next = max - user.exp

    m.reply(`
📊 Level Info
🆙 Level: *${user.level}*
XP: *${user.exp} / ${max}*
➡️ Menuju level ${user.level + 1}: *${next} XP lagi*
`.trim())
  }

export { pluginConfig as config, handler }
