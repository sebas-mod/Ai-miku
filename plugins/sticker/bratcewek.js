/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const config = MikuRuntime.config;
const te = MikuRuntime.te;

  const pluginConfig = {
      name: 'bratcewek',
      alias: ["bcewek"],
      category: "sticker",
      description: 'Membuat sticker brat',
      usage: '.bratcewek <text>',
      example: '.bratcewek Hai semua',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 10,
      energi: 1,
      isEnabled: true
  }

  async function handler(m, { sock }) {
      const text = m.args.join(' ')
      if (!text) {
          return m.reply(`🖼️ *BRAT NIÑAS sTICKER*\n\n> Introducir texto\n\n\`Ejemplo: ${m.prefix}bratcewek Hola a todos\``)
      }

      m.react('🕕')

      try {
          const url = `https://api.deline.web.id/maker/cewekbrat?text=${encodeURIComponent(text)}`
          await sock.sendImageAsSticker(m.chat, url, m, {
              packname: config.sticker.packname,
              author: config.sticker.author
          })
          m.react('✅')
      } catch (error) {
          m.react('☢')
          m.reply(te(m.prefix, m.command, m.pushName))
      }
  }

export { pluginConfig as config, handler }
