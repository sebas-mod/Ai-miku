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
    name: "defend",
    alias: [],
    category: "rpg",
    description: "defend",
    usage: ".defend",
    example: ".defend",
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
                if (!rpgDb[sender].build) return reply(`🧱 Kamu belum punya markas.`)
                let bonus = 50
                rpgDb[sender].def += bonus
                saveRpg()
                reply(`🛡️ Kamu memperkuat markas. DEF bertambah ${bonus}`)
}

export { pluginConfig as config, handler }
