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
    name: "hunt",
    alias: [],
    category: "rpg",
    description: "Berburu, dapat drop + exp",
    usage: ".hunt",
    example: ".hunt",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, A) {

      const { initRpgUser, sender, pushname, rpgDb, reply, saveRpg, msToTime, giveExp } = A
      initRpgUser(sender, pushname)
      const u = rpgDb[sender]
      const now = Date.now()
      const cooldown = 1000 * 60 * 60
      const remaining = cooldown - (now - (u.huntCooldown || 0))
      if (remaining > 0) return reply(`🕒 Kamu butuh istirahat.\nTunggu *${msToTime(remaining)}* lagi.`)

      const drops = ['daging', 'kulit', 'tulang']
      const drop = drops[Math.floor(Math.random() * drops.length)]
      u.inv.push(drop)
      u.huntCooldown = now
      saveRpg()
      await giveExp(50)
      return reply(`🏹 Kamu berburu dan mendapat:\n+🎒 ${drop}\n+⭐ 50 exp`)
}

export { pluginConfig as config, handler }
