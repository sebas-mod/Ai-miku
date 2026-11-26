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
    name: "huntboss",
    alias: [],
    category: "rpg",
    description: "huntboss",
    usage: ".huntboss",
    example: ".huntboss",
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

      const { initRpgUser, sender, pushname, reply, rpgDb, saveRpg } = A
      initRpgUser(sender, pushname)
                let dmg = Math.floor(Math.random() * 80) + 70
                global.bossHuntHp = global.bossHuntHp || 1000
                global.bossHuntHp -= dmg

                if (global.bossHuntHp <= 0) {
                  global.bossHuntHp = 0
                  reply(`🏆 Boss dikalahkan! Semua pemburu +1000 EXP`)
                  for (let id in rpgDb) rpgDb[id].exp += 1000
                  saveRpg()
                } else {
                  reply(`🎯 Kamu serang boss, DMG: ${dmg}. Sisa HP: ${global.bossHuntHp}`)
                }
}

export { pluginConfig as config, handler }
