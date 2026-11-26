/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'

const pluginConfig = {
    name: "ttmusic",
    alias: [],
    category: "download",
    description: "ttmusic",
    usage: ".ttmusic",
    example: ".ttmusic",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function searchTikTok(query) {
    const { data } = await axios.get(
      'https://tikwm.com/api/feed/search',
      {
        params: {
          keywords: query,
          count: 1
        },
        timeout: 20000
      }
    )

    if (!data || data.code !== 0 || !data.data?.videos?.length) {
      throw 'Resultado no encontrado'
    }

    const v = data.data.videos[0]
    return `https://www.tiktok.com/@${v.author.unique_id}/video/${v.video_id}`
  }

  async function getTikTok(url) {
    const { data } = await axios.get(
      'https://tikwm.com/api/',
      {
        params: { url, hd: 1 },
        timeout: 20000
      }
    )

    if (!data || data.code !== 0) {
      throw 'Error al obtener los datos de TikTok'
    }

    return data.data
  }

  async function handler(m, { conn, text, usedPrefix, command }) {
    await m.react('🎵')

    const input = m.quoted ? m.quoted.text : text

    if (!input) {
      return m.reply(
        `Ejemplo:\n` +
        `${usedPrefix + command} https://vt.tiktok.com/xxxx\n` +
        `${usedPrefix + command} kurumi edit`
      )
    }

    try {
      let url = input

      if (!/^https?:\/\//i.test(input)) {
        url = await searchTikTok(input)
      }

      const res = await getTikTok(url)

      if (!res.music) {
        throw 'Audio de TikTok no encontrado'
      }

      const title = (res.title || '-').replace(/\s+/g, ' ').trim()
      const uploader = res.author?.nickname || res.author?.unique_id || '-'
      const duration = formatDuration(res.duration)

      const caption = `
— TIKTOK MUSIC —

❀ Título : ${title.length > 80 ? title.slice(0, 80) + '...' : title}
❀ Uploader : ${uploader}
❀ Duración : ${duration}
`.trim()

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: res.music },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`
        },
        { quoted: m }
      )

      await m.reply(caption)
      await m.react('✅')
    } catch (e) {
      await m.react('❌')
      throw String(e)
    }
  }

export { pluginConfig as config, handler }
