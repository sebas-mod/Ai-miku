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
    name: "trap",
    alias: [],
    category: "rpg",
    description: "trap",
    usage: ".trap",
    example: ".trap",
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
                rpgDb[sender].trap = true
                saveRpg()
                reply(`🕳️ Kamu memasang jebakan di lokasi saat ini.`)
}

export { pluginConfig as config, handler }
