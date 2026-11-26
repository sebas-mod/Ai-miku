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
    name: "class",
    alias: [],
    category: "rpg",
    description: "class",
    usage: ".class",
    example: ".class",
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

      const { initRpgUser, sender, pushname, rpgDb, reply, text, saveRpg } = A
      initRpgUser(sender, pushname)
                let user = rpgDb[sender]
                if (user.class) return reply(`🧝‍♂️ Kamu sudah memilih kelas: *${user.class}*`)
                if (!text) return reply(`Kelas tersedia: *knight*, *mage*, *archer*`)

                let pilihan = ['knight', 'mage', 'archer']
                if (!pilihan.includes(text.toLowerCase())) return reply(`Kelas tidak valid.`)

                user.class = text.toLowerCase()
                saveRpg()
                reply(`✅ Kamu kini seorang *${user.class}*!`)
}

export { pluginConfig as config, handler }
