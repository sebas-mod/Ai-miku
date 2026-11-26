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
    name: "qrcode",
    alias: ["buatqr"],
    category: "tools",
    description: "qrcode",
    usage: ".qrcode",
    example: ".qrcode",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, text, reply, example }) {
      if (!text) return example('<teks>')

      try {
          await sock.sendMessage(m.chat, {
              image: { url: `https://quickchart.io/qr?text=${encodeURIComponent(text)}` },
              caption: '¯\\_(ツ)_/¯'
          }, { quoted: m })
      } catch (e) {
          reply('Gagal membuat QR code.')
      }
  }

export { pluginConfig as config, handler }
