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
    name: "kingdom",
    alias: [],
    category: "rpg",
    description: "kingdom",
    usage: ".kingdom",
    example: ".kingdom",
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

      const { initRpgUser, sender, pushname, rpgDb, reply, text, saveRpg } = A
      initRpgUser(sender, pushname)
                let user = rpgDb[sender]
                if (user.kingdom) return reply(`👑 Kerajaanmu: *${user.kingdom}*`)

                if (!text) return reply(`Ketik: *kingdom nama_kerajaanmu*`)
                user.kingdom = text
                saveRpg()
                reply(`🏯 Kamu mendirikan kerajaan *${text}*!`)
}

export { pluginConfig as config, handler }
