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
    name: "blessnpc",
    alias: [],
    category: "rpg",
    description: "blessnpc",
    usage: ".blessnpc",
    example: ".blessnpc",
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

      const { initRpgUser, sender, pushname, reply } = A
      initRpgUser(sender, pushname)
                let bonus = ['+10 HP', '+5 DEF', '+100 EXP']
                let buff = bonus[Math.floor(Math.random() * bonus.length)]
                reply(`✨ NPC memberkati kamu!\nEfek: ${buff}`)
}

export { pluginConfig as config, handler }
