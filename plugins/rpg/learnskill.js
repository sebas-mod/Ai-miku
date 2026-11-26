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
    name: "learnskill",
    alias: [],
    category: "rpg",
    description: "learnskill",
    usage: ".learnskill",
    example: ".learnskill",
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
                const skillList = ['fireball', 'heal', 'iceblast']
                if (!text || !skillList.includes(text)) return reply(`Skill tersedia: ${skillList.join(', ')}`)
                rpgDb[sender].skill = text
                saveRpg()
                reply(`🎓 Kamu mempelajari skill *${text}*`)
}

export { pluginConfig as config, handler }
