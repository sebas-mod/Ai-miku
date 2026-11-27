/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import fetch from 'node-fetch'

const pluginConfig = {
    name: "douyin2",
    alias: [],
    category: "download",
    description: "douyin2",
    usage: ".douyin2",
    example: ".douyin2",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { conn, args }) {
    if (!args[0]) {
      return m.reply('¡Envía el enlace de Douyin!\n\nEjemplo:\n.douyin https://v.douyin.com/xxxxx')
    }

    try {
      let url = encodeURIComponent(args[0])
      let api = `https://api-faa.my.id/faa/douyin-down?url=${url}`

      let res = await fetch(api)
      let json = await res.json()

      if (!json.status || !json.result) {
        throw 'No se pudieron obtener los datos de Douyin'
      }

      let data = json.result
      let title = data.title || '-'
      let thumbnail = data.thumbnail
      let medias = data.medias || []

      let video = medias.find(v => v.type === 'video')

      if (!video?.url) {
        return m.reply('Vídeo no encontrado')
      }

      let caption = `
*DOUYIN DOWNLOADER*

📌 *Título:* ${title}
`.trim()

      let thumbBuffer = null
      if (thumbnail) {
        let t = await fetch(thumbnail)
        thumbBuffer = await t.buffer()
      }

      await conn.sendMessage(m.chat, {
        video: { url: video.url },
        caption,
        jpegThumbnail: thumbBuffer
      }, { quoted: m })
    } catch (e) {
      console.error(e)
      m.reply('Ocurrió un error al obtener el vídeo.')
    }
  }

export { pluginConfig as config, handler }
