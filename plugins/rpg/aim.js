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
    name: "aim",
    alias: [],
    category: "rpg",
    description: "aim",
    usage: ".aim",
    example: ".aim",
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

      const { reply, initRpgUser, rpgDb, saveRpg } = A
      if (!m.quoted) return reply('reply target musuh.')
                let target = m.quoted.sender
                initRpgUser(target)
                rpgDb[target].hp -= 50
                saveRpg()
                reply(`🎯 Kamu membidik dan menyerang ${target}, -50 HP!`)
}

export { pluginConfig as config, handler }
