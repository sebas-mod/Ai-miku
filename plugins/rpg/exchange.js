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
    name: "exchange",
    alias: [],
    category: "rpg",
    description: "exchange",
    usage: ".exchange",
    example: ".exchange",
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

      const { initRpgUser, sender, pushname, text, rpgDb, reply, saveRpg } = A
      initRpgUser(sender, pushname)
                if (!text || !rpgDb[sender].inv.includes(text)) return reply(`Kamu tidak punya item *${text}*`)
                rpgDb[sender].inv = rpgDb[sender].inv.filter(i => i !== text)
                rpgDb[sender].coin += 200
                saveRpg()
                reply(`🪙 Kamu tukar *${text}* jadi 200 koin.`)
}

export { pluginConfig as config, handler }
