/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { snackvideo } from 'btch-downloader'

const te = ElysiaRuntime.te;

  const pluginConfig = {
      name: 'snackvideodl',
      alias: [],
      category: "download",
      description: 'Download video SnackVideo',
      usage: '.snackvideodl <url>',
      example: '.snackvideodl https://www.snackvideo.com/@xxx/video/xxx',
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
              `> \`${m.prefix}snackvideodl <url>\`\n\n` +
              `> Contoh:\n` +
              `> \`${m.prefix}snackvideodl https://www.snackvideo.com/@xxx/video/xxx\``
          )
      }

      if (!url.match(/snackvideo\.com/i)) {
          return m.reply(`❌ URL tidak valid. Gunakan link SnackVideo.`)
      }

      await m.react('🕕')

      try {
          const data = await snackvideo(url)

          if (!data?.status || !data?.result?.videoUrl) {
              return m.reply(`❌ Gagal mengambil video. Coba link lain.`)
          }

          const result = data.result

          await sock.sendMedia(m.chat, result.videoUrl, null, m, {
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
