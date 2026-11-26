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
    name: "huntwild",
    alias: [],
    category: "rpg",
    description: "huntwild",
    usage: ".huntwild",
    example: ".huntwild",
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

      const { initRpgUser, sender, pushname, rpgDb, saveRpg, reply } = A
      initRpgUser(sender, pushname)
                let hewan = ['rusa', 'kelinci', 'beruang']
                let target = hewan[Math.floor(Math.random() * hewan.length)]
                rpgDb[sender].inv.push(`daging ${target}`)
                saveRpg()
                reply(`🏹 Kamu berburu dan mendapatkan *daging ${target}*`)
}

export { pluginConfig as config, handler }
