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
    name: "puzzle",
    alias: [],
    category: "rpg",
    description: "puzzle",
    usage: ".puzzle",
    example: ".puzzle",
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
      const teka = `❓ *TEKA-TEKI RPG*
            Aku punya wajah tapi tak bisa melihat.
            Aku punya tangan tapi tak bisa meraih.
            Siapakah aku?`

                reply(teka)
}

export { pluginConfig as config, handler }
