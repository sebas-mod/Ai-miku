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
    name: "skilltree",
    alias: [],
    category: "rpg",
    description: "skilltree",
    usage: ".skilltree",
    example: ".skilltree",
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
                reply(`🌳 *Skill Tree*\n- Fireball → Firestorm\n- Heal → Heal All\n- Slash → Blade Tornado`)
}

export { pluginConfig as config, handler }
