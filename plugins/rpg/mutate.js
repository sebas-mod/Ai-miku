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
    name: "mutate",
    alias: [],
    category: "rpg",
    description: "mutate",
    usage: ".mutate",
    example: ".mutate",
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
                let skill = ['firewave', 'windblast', 'darkspike']
                let acak = skill[Math.floor(Math.random() * skill.length)]
                rpgDb[sender].skill = acak
                saveRpg()
                reply(`🧬 Skillmu berubah menjadi *${acak}*`)
}

export { pluginConfig as config, handler }
