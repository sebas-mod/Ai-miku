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
    name: "stash",
    alias: [],
    category: "rpg",
    description: "stash",
    usage: ".stash",
    example: ".stash",
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
                  let list = user.storage.length ? user.storage.map(i => `- ${i}`).join('\n') : '📭 Kosong'
                  reply(`📦 *STORAGE*\n${list}\n\nKetik *stash itemmu* untuk mengambil.`)
                  return
                }

                let idx = user.storage.indexOf(text)
                if (idx === -1) {
                  reply(`Item *${text}* tidak ada di storage.`)
                  return
                }

                user.storage.splice(idx, 1)
                user.inv.push(text)
                saveRpg()

                reply(`📤 Kamu mengambil *${text}* dari storage.`)
}

export { pluginConfig as config, handler }
