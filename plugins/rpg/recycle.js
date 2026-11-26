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
    name: "recycle",
    alias: [],
    category: "rpg",
    description: "recycle",
    usage: ".recycle",
    example: ".recycle",
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
                if (!text || !rpgDb[sender].inv.includes(text)) return reply(`Item *${text}* tidak ada.`)
                rpgDb[sender].inv = rpgDb[sender].inv.filter(i => i !== text)
                rpgDb[sender].inv.push('fragmen')
                saveRpg()
                reply(`♻️ Item *${text}* dihancurkan jadi *fragmen*!`)
}

export { pluginConfig as config, handler }
