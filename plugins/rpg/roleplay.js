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
    name: "roleplay",
    alias: [],
    category: "rpg",
    description: "roleplay",
    usage: ".roleplay",
    example: ".roleplay",
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

      const { initRpgUser, sender, pushname, text, reply } = A
      initRpgUser(sender, pushname)
                if (!text) {
                  reply(`Ketik teks RP-mu. Contoh: *roleplay aku memeluk naga yang terluka...*`)
                  return
                }

                reply(`🎭 *${pushname} beraksi:*\n_${text}_`)
}

export { pluginConfig as config, handler }
