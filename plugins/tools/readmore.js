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
    name: "readmore",
    alias: [],
    category: "tools",
    description: "readmore <teks|teks>",
    usage: ".readmore <teks|teks>",
    example: ".readmore <teks|teks>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { text, usedPrefix, command, reply }) {
    if (!text) return reply(`*ᴄᴏɴᴛᴏʜ:* ${usedPrefix}${command} teks awal|teks selengkapnya`)

    let [left, ...right] = text.split('|')
    if (!right.length) return reply(`❌ Gunakan pemisah tanda *|*\n*ᴄᴏɴᴛᴏʜ:* ${usedPrefix}${command} Halo|Ini teks sembunyi`)

    const readmore = '\u200e'.repeat(4001)
    reply(`${left.trim()}${readmore}\n${right.join('|').trim()}`)
  }

export { pluginConfig as config, handler }
