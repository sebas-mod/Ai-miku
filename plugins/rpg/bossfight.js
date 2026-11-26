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
    name: "bossfight",
    alias: [],
    category: "rpg",
    description: "bossfight",
    usage: ".bossfight",
    example: ".bossfight",
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

      const { reply, rpgDb, saveRpg } = A
      global.bossHp = global.bossHp || 500
                let dmg = 100 + Math.floor(Math.random() * 100)
                global.bossHp -= dmg
                if (global.bossHp <= 0) {
                  global.bossHp = 0
                  reply(`👑 Boss dikalahkan! Semua player +500 EXP`)
                  for (let id in rpgDb) rpgDb[id].exp += 500
                  saveRpg()
                } else {
                  reply(`⚔️ Kamu menyerang boss dan memberi ${dmg} DMG.\nSisa HP Boss: ${global.bossHp}`)
                }
}

export { pluginConfig as config, handler }
