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
    name: "riddle",
    alias: [],
    category: "rpg",
    description: "riddle",
    usage: ".riddle",
    example: ".riddle",
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
      let soal = `❓ Aku punya kaki tapi tak bisa jalan. Siapa aku?`
                reply(soal)
}

export { pluginConfig as config, handler }
