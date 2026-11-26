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
    name: "crypto-watchdel",
    alias: ["cryptowatchdel"],
    category: "rpg",
    description: "crypto-watchdel",
    usage: ".crypto-watchdel",
    example: ".crypto-watchdel",
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
  return await cryptoRun(A, 'watchdel')
}

export { pluginConfig as config, handler }
