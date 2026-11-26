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
    name: "prestige",
    alias: [],
    category: "rpg",
    description: "prestige",
    usage: ".prestige",
    example: ".prestige",
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

      const { initRpgUser, sender, pushname, rpgDb, reply, saveRpg } = A
      initRpgUser(sender, pushname)
                let user = rpgDb[sender]
                if (user.level < 50) return reply(`📈 Minimal level 50 untuk prestige.`)

                user.level = 1
                user.exp = 0
                user.coin += 1000
                user.statBoost = (user.statBoost || 0) + 1
                saveRpg()
                reply(`🏅 Kamu melakukan *Prestige*! Stat boost permanen +1.`)
}

export { pluginConfig as config, handler }
