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
    name: "storage",
    alias: [],
    category: "rpg",
    description: "storage",
    usage: ".storage",
    example: ".storage",
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

      const { initRpgUser, sender, pushname, rpgDb, text, reply, saveRpg } = A
      initRpgUser(sender, pushname)
                let user = rpgDb[sender]
                user.storage ||= []

                if (!text) {
                  reply(`Ketik nama item yang ingin disimpan. Contoh: *storage ramuan*`)
                  return
                }

                let idx = user.inv.indexOf(text)
                if (idx === -1) {
                  reply(`Item *${text}* tidak ada di inventory.`)
                  return
                }

                user.inv.splice(idx, 1)
                user.storage.push(text)
                saveRpg()

                reply(`📦 Kamu menyimpan *${text}* ke dalam gudang.`)
}

export { pluginConfig as config, handler }
