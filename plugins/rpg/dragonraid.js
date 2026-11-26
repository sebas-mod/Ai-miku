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
    name: "dragonraid",
    alias: [],
    category: "rpg",
    description: "dragonraid",
    usage: ".dragonraid",
    example: ".dragonraid",
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
      global.dragonHp = global.dragonHp || 3000
                let dmg = 150 + Math.floor(Math.random() * 100)
                global.dragonHp -= dmg

                if (global.dragonHp <= 0) {
                  global.dragonHp = 0
                  for (let id in rpgDb) rpgDb[id].exp += 2000
                  saveRpg()
                  reply(`🐉 RAID BERHASIL! Semua player +2000 EXP!`)
                } else {
                  reply(`🐉 Kamu serang naga! DMG: ${dmg}, Sisa HP: ${global.dragonHp}`)
                }
}

export { pluginConfig as config, handler }
