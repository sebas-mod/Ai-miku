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
    name: "tes",
    alias: [],
    category: "tools",
    description: "Fitur tools tes",
    usage: ".tes",
    example: ".tes",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, usedPrefix, command }) {
    await m.reply(`¡${global.namebot} está activo! [${usedPrefix}${command}]`)
  }

  handler.botadmin = false

export { pluginConfig as config, handler }
