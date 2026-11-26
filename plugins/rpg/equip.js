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
    name: "equip",
    alias: [],
    category: "rpg",
    description: "equip",
    usage: ".equip",
    example: ".equip",
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
                if (!text) return reply('Ketik nama item yang ingin kamu equip.')

                let user = rpgDb[sender]
                let index = user.inv.findIndex(item => String(item).toLowerCase() === text.toLowerCase())
                if (index === -1) return reply('Item tidak ditemukan di inventory kamu.')

                let item = String(user.inv[index])
                let tipe = /pedang|belati|busur|tombak|kapak|tongkat|sword|bow|dagger|axe|staff/i.test(item) ? 'weapon'
                  : /armor|baju|perisai|zirah|helm|jubah|shield/i.test(item) ? 'armor' : null
                if (!tipe) return reply('Item ini tidak bisa di-equip.')

                user.inv.splice(index, 1)
                if (user[tipe]) user.inv.push(user[tipe])
                user[tipe] = item
                saveRpg()
                reply(`✅ ${item} berhasil dipasang!`)
}

export { pluginConfig as config, handler }
