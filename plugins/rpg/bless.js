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
    name: "bless",
    alias: [],
    category: "rpg",
    description: "bless",
    usage: ".bless",
    example: ".bless",
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
      let buff = ['+10 ATK', '+20 DEF', '+15 HP']
                reply(`💠 Kamu diberkati hari ini!\nEfek: ${buff[Math.floor(Math.random() * buff.length)]}`)
}

export { pluginConfig as config, handler }
