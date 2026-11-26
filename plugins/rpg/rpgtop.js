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
    name: "rpgtop",
    alias: [],
    category: "rpg",
    description: "rpgtop",
    usage: ".rpgtop",
    example: ".rpgtop",
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

      const { rpgDb, reply } = A
      let list = Object.entries(rpgDb)
                  .map(([id, u]) => ({ name: u.name, coin: u.coin }))
                  .sort((a, b) => b.coin - a.coin)
                  .slice(0, 10)
                  .map((u, i) => `${i + 1}. ${u.name} - 💰 ${u.coin}`)
                  .join('\n')

                reply(`🏆 *TOP 10 PEMAIN TERKAYA*\n\n${list}`)
}

export { pluginConfig as config, handler }
