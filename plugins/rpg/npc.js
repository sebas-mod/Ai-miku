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
    name: "npc",
    alias: [],
    category: "rpg",
    description: "Bicara dengan NPC",
    usage: ".npc",
    example: ".npc",
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

      const { text, reply, prefix } = A
      const npcList = {
          penjaga: '⚔️ Penjaga: Dunia ini berbahaya... simpan koinmu di bank!',
          penjual: `🛒 Penjual: Aku punya ramuan langka, coba *${prefix}shop*!`,
          tetua: `🧙 Tetua: Dengarkan kisah dunia ini lewat *${prefix}lore* dan kabar terbaru lewat *${prefix}rumor*.`,
          pandai: `🔨 Pandai Besi: Bawa tulang dan kulit, aku ajari kamu *${prefix}craft*.`,
          nelayan: `🎣 Nelayan: Ikan hari ini melimpah, coba *${prefix}fish* lalu *${prefix}cook supikan*.`
      }
      const key = String(text || '').trim().toLowerCase()
      if (!key || !npcList[key]) return reply(`NPC tidak ditemukan. Coba: ${Object.keys(npcList).join(', ')}`)
      return reply(npcList[key])
}

export { pluginConfig as config, handler }
