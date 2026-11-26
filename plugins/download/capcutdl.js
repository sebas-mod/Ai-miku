/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { capcut } from 'btch-downloader'

const te = MikuRuntime.te;

  const pluginConfig = {
      name: 'capcutdl',
      alias: [],
      category: "download",
      description: 'Download video CapCut',
      usage: '.capcutdl <url>',
      example: '.capcutdl https://www.capcut.com/t/xxx',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 10,
      energi: 1,
      isEnabled: true
  }

  async function handler(m, { sock }) {
      const url = m.text?.trim()

      if (!url) {
          return m.reply(
              `⚠️ *CÓMO USAR*\n\n` +
              `> \`${m.prefix}capcutdl <url>\`\n\n` +
              `> Ejemplo:\n` +
              `> \`${m.prefix}capcutdl https://www.capcut.com/t/xxx\``
          )
      }

      if (!url.match(/capcut\.com/i)) {
          return m.reply(`❌ URL no válida. Usa un enlace de CapCut.`)
      }

      await m.react('🕕')

      try {
          const data = await capcut(url)

          if (!data?.status || !data?.originalVideoUrl) {
              return m.reply(`❌ No se pudo obtener el video. Prueba con otro enlace.`)
          }

          await sock.sendMedia(m.chat, data.originalVideoUrl, null, m, {
              type: 'video',
              contextInfo: {
                  forwardingScore: 99,
                  isForwarded: true
              }
          })
      } catch (err) {
          return m.reply(te(m.prefix, m.command, m.pushName))
      }
  }

export { pluginConfig as config, handler }
