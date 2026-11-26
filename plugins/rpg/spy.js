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
    name: "spy",
    alias: [],
    category: "rpg",
    description: "spy",
    usage: ".spy",
    example: ".spy",
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
      if (!m.quoted) return reply('reply target yang ingin diintai.')
                let target = m.quoted.sender
                initRpgUser(target)
                let lokasi = rpgDb[target].location || 'tidak diketahui'
                reply(`🕵️ Target berada di: *${lokasi}*`)
}

export { pluginConfig as config, handler }
