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
    name: "elementatk",
    alias: [],
    category: "rpg",
    description: "elementatk",
    usage: ".elementatk",
    example: ".elementatk",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(_m, A) {

      const { initRpgUser, sender, pushname, text, m, reply, rpgDb, saveRpg } = A
      initRpgUser(sender, pushname)
                if (!text || !m.quoted) return reply(`Gunakan: *elementatk [serangan]* (reply target)`)

                let user = rpgDb[sender]
                let elemen = user.element || 'tanpa elemen'
                let damage = 30 + (user.element === 'api' ? 20 : 0)

                let target = m.quoted.sender
                initRpgUser(target)
                rpgDb[target].hp -= damage
                saveRpg()
                reply(`🌪️ Kamu menyerang dengan elemen *${elemen}*!\nTarget kehilangan ${damage} HP.`)
}

export { pluginConfig as config, handler }
