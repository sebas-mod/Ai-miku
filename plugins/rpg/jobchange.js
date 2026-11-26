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
    name: "jobchange",
    alias: [],
    category: "rpg",
    description: "jobchange",
    usage: ".jobchange",
    example: ".jobchange",
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
                if (rpgDb[sender].level < 10) return reply(`🔒 Butuh level 10 untuk ganti class.`)
                rpgDb[sender].class = null
                saveRpg()
                reply(`🧠 Kamu dapat memilih class baru dengan perintah *class [nama]*`)
}

export { pluginConfig as config, handler }
