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
    name: "barcode",
    alias: ["bc", "buatbarcode"],
    category: "tools",
    description: "barcode <teks>",
    usage: ".barcode <teks>",
    example: ".barcode <teks>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, text, reply, example }) {
      if (!text) return example('8991234567890')

      try {
          await sock.sendMessage(m.chat, {
              image: { url: `https://barcodeapi.org/api/128/${encodeURIComponent(text)}` },
              caption: `📦 Barcode:\n${text}`
          }, { quoted: m })
      } catch (e) {
          reply('Gagal membuat barcode.')
      }
  }

export { pluginConfig as config, handler }
