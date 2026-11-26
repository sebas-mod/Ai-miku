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
    name: "scout",
    alias: [],
    category: "rpg",
    description: "scout",
    usage: ".scout",
    example: ".scout",
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

      const { reply, initRpgUser, rpgDb } = A
      if (!m.quoted) return reply('reply target untuk diintai.')
                let target = m.quoted.sender
                initRpgUser(target)
                let loc = rpgDb[target].location || 'rahasia'
                reply(`🔍 Lokasi musuh: ${loc}`)
}

export { pluginConfig as config, handler }
