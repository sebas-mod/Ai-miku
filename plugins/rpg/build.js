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
    name: "build",
    alias: [],
    category: "rpg",
    description: "build",
    usage: ".build",
    example: ".build",
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
                let user = rpgDb[sender]
                if (user.build) return reply(`🏠 Kamu sudah punya markas: *${user.build}*`)

                user.coin -= 500
                user.build = 'markas kayu'
                saveRpg()
                reply(`🧱 Kamu membangun *markas kayu*. (+rest, +safezone)`)
}

export { pluginConfig as config, handler }
