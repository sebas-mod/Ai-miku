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
    name: "revive",
    alias: [],
    category: "rpg",
    description: "revive",
    usage: ".revive",
    example: ".revive",
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
                if (user.hp > 0) return reply(`❤️ Kamu masih hidup.`)

                if (user.coin < 200) return reply(`💰 Butuh 200 koin untuk hidup kembali.`)

                user.coin -= 200
                user.hp = 100
                saveRpg()
                reply(`💉 Kamu bangkit kembali dengan 100 HP.`)
}

export { pluginConfig as config, handler }
