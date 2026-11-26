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
    name: "heal",
    alias: ["obati", "pulih"],
    category: "rpg",
    description: "Fitur RPG heal",
    usage: ".heal",
    example: ".heal",
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
      let e = global.rpg.emoticon

      let count = parseInt(args[0])
      if (isNaN(count)) count = 1

      if (user.potion < count)
          return m.reply(`${e('potion')} Potion kamu tidak cukup`)

      if (user.health >= 100)
          return m.reply(`${e('health')} Health kamu sudah penuh`)

      user.potion -= count
      user.health += 20 * count

      if (user.health > 100) user.health = 100

      m.reply(`
${e('health')} *HEAL BERHASIL*

${e('potion')} Potion dipakai : ${count}
${e('health')} Health sekarang : ${user.health}
`.trim())
  }

export { pluginConfig as config, handler }
