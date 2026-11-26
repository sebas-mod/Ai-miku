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
    name: "fish",
    alias: [],
    category: "rpg",
    description: "fish",
    usage: ".fish",
    example: ".fish",
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
                let hasil = ['ikan biasa', 'ikan langka', 'ikan emas']
                let tangkapan = hasil[Math.floor(Math.random() * hasil.length)]
                rpgDb[sender].inv.push(tangkapan)
                saveRpg()
                reply(`🎣 Kamu memancing dan mendapatkan *${tangkapan}*!`)
}

export { pluginConfig as config, handler }
