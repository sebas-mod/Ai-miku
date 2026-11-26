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
    name: "rumor",
    alias: [],
    category: "rpg",
    description: "rumor",
    usage: ".rumor",
    example: ".rumor",
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

      const { reply } = A
      let r = ['💀 Penjaga Kuil telah bangkit!', '🎁 Event harta akan muncul besok!', '🌪️ Badai di Gunung Utara!']
                reply(`💬 *RUMOR TERSEBAR:*\n${r[Math.floor(Math.random() * r.length)]}`)
}

export { pluginConfig as config, handler }
