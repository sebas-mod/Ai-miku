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
    name: "travel",
    alias: [],
    category: "rpg",
    description: "travel",
    usage: ".travel",
    example: ".travel",
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

      const { initRpgUser, sender, pushname, text, reply, rpgDb, saveRpg } = A
      initRpgUser(sender, pushname)
                const lokasi = ['hutan', 'desa', 'gunung', 'kuil']
                if (!text || !lokasi.includes(text.toLowerCase())) {
                  return reply(`🌍 Lokasi tersedia: ${lokasi.join(', ')}`)
                }
                rpgDb[sender].location = text.toLowerCase()
                saveRpg()
                reply(`🧭 Kamu berpindah ke *${text}*.`)
}

export { pluginConfig as config, handler }
