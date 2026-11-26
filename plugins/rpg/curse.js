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
    name: "curse",
    alias: [],
    category: "rpg",
    description: "curse",
    usage: ".curse",
    example: ".curse",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(_m, A) {

      const { initRpgUser, sender, pushname, m, reply, rpgDb, saveRpg } = A
      initRpgUser(sender, pushname)
                if (!m.quoted) return reply(`reply target untuk dikutuk.`)
                let target = m.quoted.sender
                initRpgUser(target)
                rpgDb[target].curse = true
                saveRpg()
                reply(`👻 Target telah dikutuk. Efek negatif akan aktif!`)
}

export { pluginConfig as config, handler }
