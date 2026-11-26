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
    name: "worldevent",
    alias: [],
    category: "rpg",
    description: "worldevent",
    usage: ".worldevent",
    example: ".worldevent",
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

      const { rpgDb, saveRpg, reply } = A
      let events = [
                  '🌠 Hujan Meteor! Semua player +100 EXP!',
                  '🌧️ Banjir besar! Semua bank player -20%',
                  '🎁 Harta Karun Muncul! Gunakan *hunt* sekarang untuk dapat item langka!'
                ]
                let event = events[Math.floor(Math.random() * events.length)]

                for (let id in rpgDb) {
                  if (event.includes('+100 EXP')) rpgDb[id].exp += 100
                  if (event.includes('-20%')) rpgDb[id].bank = Math.floor(rpgDb[id].bank * 0.8)
                }

                saveRpg()
                reply(`🌍 *WORLD EVENT TERJADI!*\n\n${event}`)
}

export { pluginConfig as config, handler }
