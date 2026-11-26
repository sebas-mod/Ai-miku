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
    name: "stat",
    alias: [],
    category: "rpg",
    description: "stat",
    usage: ".stat",
    example: ".stat",
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
                let u = rpgDb[sender]
                reply(`📊 *STAT KARAKTER*
            💪 ATK: ${u.weapon ? 30 : 10}
            🛡️ DEF: ${u.armor ? 25 : 10}
            ⚡ SPD: ${u.class === 'archer' ? 20 : 10}
            `)
}

export { pluginConfig as config, handler }
