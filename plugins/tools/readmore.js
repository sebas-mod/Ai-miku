/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "readmore",
    alias: [],
    category: "tools",
    description: "readmore <texto|texto>",
    usage: ".readmore <texto|texto>",
    example: ".readmore <texto|texto>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { text, usedPrefix, command, reply }) {
    if (!text) return reply(`*ᴇᴊᴇᴍᴘʟᴏ:* ${usedPrefix}${command} texto inicial|texto completo`)

    let [left, ...right] = text.split('|')
    if (!right.length) return reply(`❌ Usa el separador *|*\n*ᴇᴊᴇᴍᴘʟᴏ:* ${usedPrefix}${command} Hola|Este texto está oculto`)

    const readmore = '\u200e'.repeat(4001)
    reply(`${left.trim()}${readmore}\n${right.join('|').trim()}`)
  }

export { pluginConfig as config, handler }
