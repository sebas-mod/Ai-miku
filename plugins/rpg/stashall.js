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
    name: "stashall",
    alias: [],
    category: "rpg",
    description: "stashall",
    usage: ".stashall",
    example: ".stashall",
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

      const { initRpgUser, sender, pushname, rpgDb, saveRpg, reply } = A
      initRpgUser(sender, pushname)
                rpgDb[sender].storage = rpgDb[sender].storage || []
                rpgDb[sender].storage.push(...rpgDb[sender].inv)
                rpgDb[sender].inv = []
                saveRpg()
                reply(`📦 Semua item dipindah ke storage.`)
}

export { pluginConfig as config, handler }
