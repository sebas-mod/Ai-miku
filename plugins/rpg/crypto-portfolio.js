/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const cryptoRun = ElysiaRuntime.cryptoRun;

const pluginConfig = {
    name: "crypto-portfolio",
    alias: ["cryptoportfolio"],
    category: "rpg",
    description: "crypto-portfolio",
    usage: ".crypto-portfolio",
    example: ".crypto-portfolio",
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
  return await cryptoRun(A, 'portfolio')
}

export { pluginConfig as config, handler }
