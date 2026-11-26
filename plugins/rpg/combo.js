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
    name: "combo",
    alias: [],
    category: "rpg",
    description: "combo",
    usage: ".combo",
    example: ".combo",
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

      const { initRpgUser, sender, pushname, rpgDb, reply } = A
      initRpgUser(sender, pushname)
                let u = rpgDb[sender]
                let comboDmg = u.class === 'knight' ? 100 : u.class === 'mage' ? 90 : 80
                reply(`🗡️ Kamu gunakan COMBO! DMG: ${comboDmg}`)
}

export { pluginConfig as config, handler }
