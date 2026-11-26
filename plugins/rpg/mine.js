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
    name: "mine",
    alias: [],
    category: "rpg",
    description: "mine",
    usage: ".mine",
    example: ".mine",
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
                let item = Math.random() < 0.5 ? 'batu' : 'emas'
                rpgDb[sender].inv.push(item)
                saveRpg()
                reply(`⛏️ Kamu menambang dan mendapatkan *${item}*!`)
}

export { pluginConfig as config, handler }
