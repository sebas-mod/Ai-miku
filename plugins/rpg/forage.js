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
    name: "forage",
    alias: [],
    category: "rpg",
    description: "forage",
    usage: ".forage",
    example: ".forage",
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
                let tanaman = ['herba', 'akar ajaib', 'jamur emas']
                let item = tanaman[Math.floor(Math.random() * tanaman.length)]
                rpgDb[sender].inv.push(item)
                saveRpg()
                reply(`🌿 Kamu menemukan *${item}*!`)
}

export { pluginConfig as config, handler }
