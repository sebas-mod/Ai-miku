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
    name: "weather",
    alias: [],
    category: "rpg",
    description: "weather",
    usage: ".weather",
    example: ".weather",
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
      const cuaca = ['cerah', 'hujan', 'badai', 'berkabut']
                const now = cuaca[Math.floor(Math.random() * cuaca.length)]
                global.rpgWeather = now
                reply(`🌦️ Cuaca hari ini: *${now.toUpperCase()}*`)
}

export { pluginConfig as config, handler }
