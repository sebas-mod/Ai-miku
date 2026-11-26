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
    name: "reincarnate",
    alias: [],
    category: "rpg",
    description: "reincarnate",
    usage: ".reincarnate",
    example: ".reincarnate",
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

      const { initRpgUser, sender, rpgDb, reply, saveRpg } = A
      switch (0) {
          default:
              {
                initRpgUser(sender)
                let user = rpgDb[sender]
                if (user.level < 30) return reply(`🧘 Hanya yang sudah mencapai level 30 bisa bereinkarnasi.`)

                user.level = 1
                user.exp = 0
                user.gold = 0
                user.reincarnation = (user.reincarnation || 0) + 1
                user.passiveBonus = (user.passiveBonus || 0) + 5
                saveRpg()
                return reply(`🔁 Kamu telah bereinkarnasi!\nBonus permanen: +5% power setiap kali kamu bereinkarnasi.`)
              }
      }
}

export { pluginConfig as config, handler }
