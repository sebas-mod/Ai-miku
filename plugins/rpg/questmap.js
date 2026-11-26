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
    name: "questmap",
    alias: [],
    category: "rpg",
    description: "questmap",
    usage: ".questmap",
    example: ".questmap",
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
      reply(`🗺️ *PETA QUEST DUNIA RPG*

            1. 🌲 Hutan Gelap — Kalahkan 3 serigala
            2. 🏰 Kastil Retak — Temukan Pedang Warisan
            3. 🌋 Gunung Lava — Bertahan dari Boss Api

            Ketik *quest [nama]* untuk memulai (belum aktif sistem interaksinya)`)
}

export { pluginConfig as config, handler }
