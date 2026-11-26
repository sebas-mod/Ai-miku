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
    name: "element",
    alias: [],
    category: "rpg",
    description: "element",
    usage: ".element",
    example: ".element",
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

                if (user.element) {
                  reply(`🔮 Elemenmu sudah dipilih: *${user.element}*`)
                  return
                }

                const pilihan = ['api', 'air', 'tanah', 'angin']
                if (!text || !pilihan.includes(text.toLowerCase())) {
                  reply(`Pilih elemen: *api*, *air*, *tanah*, *angin*\nContoh: *element api*`)
                  return
                }

                user.element = text.toLowerCase()
                saveRpg()
                reply(`✅ Elemenmu kini: *${user.element}*`)
}

export { pluginConfig as config, handler }
