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
    name: "music",
    alias: ["soundcloud"],
    category: "download",
    description: "music",
    usage: ".music",
    example: ".music",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { conn, text }) {
    if (!text) throw '¡Envía el título de la canción o un enlace de SoundCloud!'

    await m.react('🕒')

    try {
      let res = await fetch(
        'https://kaizenapi.my.id/api/downloader/soundcloud?limit=1&query=' +
          encodeURIComponent(text)
      )

      let json = await res.json()

      if (!json.status || json.result.length === 0)
        throw 'Canción no encontrada.'

      let data = json.result[0]

      let caption = `SOUNDCLOUD DOWNLOADER

Título: ${data.title}
Artista: ${data.artist}
Reproducciones: ${data.plays}
Duración: ${data.duration_seconds}s
URL: ${data.url}`

      await conn.sendMessage(
        m.chat,
        {
          image: { url: data.artwork },
          caption
        },
        { quoted: m }
      )

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: data.stream_url },
          mimetype: 'audio/mpeg',
          fileName: `${data.title}.mp3`
        },
        { quoted: m }
      )
    } catch (e) {
      throw 'Uy, error.'
    }
  }

export { pluginConfig as config, handler }
