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
    name: "death",
    alias: [],
    category: "rpg",
    description: "death",
    usage: ".death",
    example: ".death",
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

      const { initRpgUser, sender, pushname, rpgDb, reply, saveRpg } = A
      initRpgUser(sender, pushname)
                let user = rpgDb[sender]
                if (user.hp && user.hp <= 0) {
                  reply(`☠️ Kamu sudah mati! Gunakan *revive* untuk bangkit.`)
                  return
                }

                user.hp = 0
                user.coin = Math.floor(user.coin * 0.5)
                reply(`☠️ Kamu tewas...\nKoinmu berkurang jadi ${user.coin}. Gunakan *revive* untuk hidup kembali.`)
                saveRpg()
}

export { pluginConfig as config, handler }
