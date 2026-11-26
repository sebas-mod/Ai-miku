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
    name: "debuff",
    alias: [],
    category: "rpg",
    description: "debuff",
    usage: ".debuff",
    example: ".debuff",
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
      if (!m.quoted) return reply('reply target untuk diberi debuff.')
                let target = m.quoted.sender
                initRpgUser(target)
                rpgDb[target].debuff = 'burn'
                saveRpg()
                reply(`🔥 Musuh terkena efek *burn*!`)
}

export { pluginConfig as config, handler }
