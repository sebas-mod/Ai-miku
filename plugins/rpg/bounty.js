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
    name: "bounty",
    alias: [],
    category: "rpg",
    description: "bounty",
    usage: ".bounty",
    example: ".bounty",
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
                if (!text) return reply('Gunakan: bounty @user jumlah')
                let [mention, jumlah] = text.split(' ')
                if (!mention || isNaN(jumlah)) return reply('Format salah. Contoh: bounty @target 1000')
                rpgDb.bounty ||= {}
                rpgDb.bounty[mention] = parseInt(jumlah)
                saveRpg()
                reply(`💰 Kamu pasang buronan ${mention} sebesar ${jumlah} coin!`)
}

export { pluginConfig as config, handler }
