/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'

const pluginConfig = {
    name: "loli",
    alias: [],
    category: "anime",
    description: "loli",
    usage: ".loli",
    example: ".loli",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { sock, reply }) {
      try {
          const { data } = await axios.get('https://raw.githubusercontent.com/ShirokamiRyzen/WAbot-DB/main/fitur_db/anime_loli.json', { timeout: 20000 })
          if (!Array.isArray(data) || !data.length) return reply('❌ Data gambar kosong.')
          const url = data[Math.floor(Math.random() * data.length)]
          return await sock.sendMessage(m.chat, { image: { url }, caption: 'Nih Kak' }, { quoted: m })
      } catch (e) {
          return reply(`❌ Gagal mengambil gambar: ${e.response?.status || e.message}`)
      }
  }

export { pluginConfig as config, handler }
