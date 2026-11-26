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
    name: "codex",
    alias: [],
    category: "rpg",
    description: "codex",
    usage: ".codex",
    example: ".codex",
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
      reply(`📜 *KODEX ITEM RPG*

            - 🗡️ pedang → +atk
            - 🛡️ armor → +def
            - 🧪 ramuan → pulih HP
            - 💀 tulang + kulit → ramuan (via *alchemy*)`)
}

export { pluginConfig as config, handler }
