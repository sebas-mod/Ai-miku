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
    name: "itemuse",
    alias: [],
    category: "rpg",
    description: "itemuse",
    usage: ".itemuse",
    example: ".itemuse",
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

      const { initRpgUser, sender, pushname, text, reply, rpgDb, saveRpg } = A
      initRpgUser(sender, pushname)
                if (!text) return reply(`Gunakan: *itemuse ramuan*`)

                let user = rpgDb[sender]
                let i = user.inv.indexOf(text)
                if (i === -1) return reply(`Item tidak ditemukan.`)

                if (text === 'ramuan') {
                  user.hp = Math.min(user.hp + 50, 100)
                  user.inv.splice(i, 1)
                  saveRpg()
                  reply(`🧪 Kamu meminum ramuan. HP-mu pulih jadi ${user.hp}`)
                  return
                }

                reply(`Item *${text}* tidak bisa digunakan.`)
}

export { pluginConfig as config, handler }
