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
    name: "crypto-buy",
    alias: ["cryptobuy"],
    category: "rpg",
    description: "crypto-buy",
    usage: ".crypto-buy",
    example: ".crypto-buy",
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
  return await cryptoRun(A, 'buy')
}

export { pluginConfig as config, handler }
