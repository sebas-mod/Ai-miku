/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const sendAlbum = MikuRuntime.sendAlbum;

const pluginConfig = {
    name: "ttimg",
    alias: [],
    category: "download",
    description: "ttimg",
    usage: ".ttimg",
    example: ".ttimg",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function getSlide(url) {
    const res = await fetch(`https://www.tikwm.com/api/?url=${url}&hd=1`)
    const json = await res.json()
    return json?.data
  }

  async function handler(m, { text, usedPrefix, command, conn }) {
    if (!text) {
      return m.reply(`Ejemplo:\n${usedPrefix + command} https://vt.tiktok.com/xxxx`)
    }

    await m.react('✨')

    try {
      const regex = /(https:\/\/(vt|vm)\.tiktok\.com\/[^\s]+|https:\/\/www\.tiktok\.com\/@[\w.-]+\/video\/\d+)/
      const url = text.match(regex)?.[0]

      if (!url) return m.reply('❌ Enlace de TikTok no válido.')

      const data = await getSlide(url)
      if (!data) return m.reply('❌ No se pudieron obtener los datos.')

      const images = data.images || []
      if (!images.length) return m.reply('❌ Esta publicación no es un carrusel de fotos.')

      const link = `https://www.tiktok.com/@${data.author.unique_id || 'user'}/video/${data.video_id}`
      const caption =
  `*TIKTOK PHOTO*

Título: ${data.title || '-'}
Uploader: ${data.author.nickname}
Total: ${images.length}
Link: ${link}`

      const slides = images.slice(0, 6)
      await sendAlbum(conn, m.chat, slides.map((url, i) => ({ type: 'image', url, caption: i === 0 ? caption : '' })), { quoted: m })
    } catch (e) {
      console.error(e)
      m.reply('❌ Error al obtener el carrusel.')
    }
  }

export { pluginConfig as config, handler }
