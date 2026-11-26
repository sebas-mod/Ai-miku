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
    name: "farm",
    alias: [],
    category: "rpg",
    description: "Bertani, panen gandum/apel",
    usage: ".farm",
    example: ".farm",
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

      const { initRpgUser, sender, pushname, rpgDb, reply, saveRpg, msToTime } = A
      initRpgUser(sender, pushname)
      const u = rpgDb[sender]
      const now = Date.now()
      const remaining = 60000 - (now - (u.lastFarm || 0))
      if (remaining > 0) return reply(`🌱 Tanaman belum siap panen. Tunggu *${msToTime(remaining)}* lagi.`)
      const hasil = ['gandum', 'apel'][Math.floor(Math.random() * 2)]
      u.inv.push(hasil)
      u.lastFarm = now
      saveRpg()
      return reply(`🌾 Kamu memanen *${hasil}*!`)
}

export { pluginConfig as config, handler }
