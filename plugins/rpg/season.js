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
    name: "season",
    alias: [],
    category: "rpg",
    description: "season",
    usage: ".season",
    example: ".season",
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
      const musim = ['semi', 'panas', 'gugur', 'salju']
                const active = musim[Math.floor(Math.random() * musim.length)]
                global.rpgSeason = active
                reply(`📆 Musim saat ini adalah *${active.toUpperCase()}*.`)
}

export { pluginConfig as config, handler }
