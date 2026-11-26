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
    name: "map",
    alias: [],
    category: "rpg",
    description: "map",
    usage: ".map",
    example: ".map",
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
      let mapText = `
            🗺️ *DUNIA RPG WHATSAPP*
            • 🌲 Hutan Kabut
            • ⛩️ Desa Hilang
            • 🏰 Kastil Tua
            • 🌋 Gunung Merapi
            Gunakan: *travel lokasi*
            `
                reply(mapText)
}

export { pluginConfig as config, handler }
