/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const te = ElysiaRuntime.te;
const likee = ElysiaRuntime.likee;

  const pluginConfig = {
      name: 'likeedl',
      alias: [],
      category: "download",
      description: 'Download video Likee',
      usage: '.likeedl <url>',
      example: '.likeedl https://likee.video/@xxx',
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
              `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
              `> \`${m.prefix}likeedl <url>\`\n\n` +
              `> Ejemplo:\n` +
              `> \`${m.prefix}likeedl https://likee.video/@xxx\``
          )
      }

      if (!url.match(/likee\.(video|com)/i)) {
          return m.reply(`❌ URL no válida. Usa un enlace de Likee.`)
      }

      await m.react('🕕')

      try {
          const data = await likee(url)

          if (!data) {
              return m.reply(`❌ No se pudo obtener el video. Prueba con otro enlace.`)
          }

          const videoUrl = data.without_watermark || data.with_watermark

          if (!videoUrl) {
              return m.reply(`❌ Video no encontrado.`)
          }

          await sock.sendMedia(m.chat, videoUrl, null, m, {
              type: 'video',
              contextInfo: {
                  forwardingScore: 99,
                  isForwarded: true
              }
          })

          await m.react('✅')
      } catch (err) {
          return m.reply(te(m.prefix, m.command, m.pushName))
      }
  }

export { pluginConfig as config, handler }
