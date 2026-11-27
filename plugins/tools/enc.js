/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const obfuscateJs = MikuRuntime.obfuscateJs;

const pluginConfig = {
    name: "enc",
    alias: [],
    category: "tools",
    description: "enc <code>",
    usage: ".enc <code>",
    example: ".enc <code>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, text, reply }) {
      if (!text) return reply('Escribe el código JavaScript que quieres ofuscar')

      try {
          const code = await obfuscateJs(text)

          await sock.sendMessage(m.chat, {
              document: Buffer.from(code),
              fileName: `obfuscated-${Date.now()}.js`,
              mimetype: 'application/javascript'
          }, { quoted: m })
      } catch (e) {
          console.error(e)
          reply(e.friendly ? e.message : 'No se pudo ofuscar el código')
      }
  }

export { pluginConfig as config, handler }
