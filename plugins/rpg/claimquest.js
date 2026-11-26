/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const questRun = ElysiaRuntime.questRun;

const pluginConfig = {
    name: "claimquest",
    alias: [],
    category: "rpg",
    description: "Klaim hadiah quest harian",
    usage: ".claimquest",
    example: ".claimquest",
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

      return questRun(A)
}

export { pluginConfig as config, handler }
