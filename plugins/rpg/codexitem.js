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
    name: "codexitem",
    alias: [],
    category: "rpg",
    description: "codexitem",
    usage: ".codexitem",
    example: ".codexitem",
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
      reply(`📚 *KODEX ITEM:*\n- Ramuan: +50 HP\n- Kunci: Buka peti\n- Tulang: Bahan alchemy`)
}

export { pluginConfig as config, handler }
