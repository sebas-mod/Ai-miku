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
    name: "finaltrial",
    alias: [],
    category: "rpg",
    description: "finaltrial",
    usage: ".finaltrial",
    example: ".finaltrial",
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
                if (rpgDb[sender].level < 99) return reply('🚫 Butuh level 99 untuk ikut ujian akhir.')
                reply(`🔥 Ujian Dimulai!\nLawan 3 boss secara beruntun...`)
}

export { pluginConfig as config, handler }
