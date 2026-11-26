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
    name: "dailybox",
    alias: [],
    category: "rpg",
    description: "dailybox",
    usage: ".dailybox",
    example: ".dailybox",
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
                let u = rpgDb[sender]
                let now = Date.now()
                if (u.lastBox && now - u.lastBox < 86400000) return reply(`📦 Kamu sudah ambil hari ini.`)

                u.lastBox = now
                let hadiah = ['ramuan', 'kunci', 'fragmen'][Math.floor(Math.random() * 3)]
                u.inv.push(hadiah)
                saveRpg()
                reply(`🎁 Kamu mendapat *${hadiah}* dari kotak harian!`)
}

export { pluginConfig as config, handler }
