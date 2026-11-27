/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { cocofun } from 'btch-downloader'

const te = MikuRuntime.te;

  const pluginConfig = {
      name: 'cocofundl',
      alias: [],
      category: "download",
      description: 'Descarga videos de CocoFun',
      usage: '.cocofundl <url>',
      example: '.cocofundl https://www.cocofun.com/share/post/xxx',
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
              `> \`${m.prefix}cocofundl <url>\`\n\n` +
              `> Ejemplo:\n` +
              `> \`${m.prefix}cocofundl https://www.cocofun.com/share/post/xxx\``
          )
      }

      if (!url.match(/cocofun\.com/i)) {
          return m.reply(`❌ URL no válida. Usa un enlace de CocoFun.`)
      }

      await m.react('🕕')

      try {
          const data = await cocofun(url)

          if (!data?.status || !data?.result) {
              return m.reply(`❌ No se pudo obtener el vídeo. Prueba con otro enlace.`)
          }

          const result = data.result
          const videoUrl = result.no_watermark || result.watermark

          if (!videoUrl) {
              return m.reply(`❌ Vídeo no encontrado.`)
          }

          await sock.sendMedia(m.chat, videoUrl, null, m, {
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
