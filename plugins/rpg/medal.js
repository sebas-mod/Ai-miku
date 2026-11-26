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
    name: "medal",
    alias: [],
    category: "rpg",
    description: "medal",
    usage: ".medal",
    example: ".medal",
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
                let user = rpgDb[sender]
                user.medal ||= []

                if (!user.medal.length) return reply(`🎖️ Kamu belum punya medali.`)

                reply(`🎖️ *MEDALI-MU:*\n${user.medal.map(m => `🏅 ${m}`).join('\n')}`)
}

export { pluginConfig as config, handler }
