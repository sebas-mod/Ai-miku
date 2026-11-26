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
    name: "zombieevent",
    alias: [],
    category: "rpg",
    description: "zombieevent",
    usage: ".zombieevent",
    example: ".zombieevent",
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

      const { rpgDb, saveRpg, reply } = A
      for (let id in rpgDb) {
                  rpgDb[id].hp = Math.max(1, rpgDb[id].hp - 20)
                }
                saveRpg()
                reply(`🧟 Wabah zombie! Semua pemain kehilangan 20 HP!`)
}

export { pluginConfig as config, handler }
