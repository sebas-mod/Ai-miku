/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { capcut } from 'btch-downloader'
import fetch from 'node-fetch'

const pluginConfig = {
    name: "capcut",
    alias: [],
    category: "download",
    description: "capcut",
    usage: ".capcut",
    example: ".capcut",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function getCapcutVideo(url) {
    const res = await fetch(
      "https://capdownloader.com/wp-json/aio-dl/video-data/",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "origin": "https://capdownloader.com",
          "referer": "https://capdownloader.com/",
          "user-agent": "Mozilla/5.0"
        },
        body: JSON.stringify({ url })
      }
    )

    if (!res.ok) throw "El servidor no responde"

    const data = await res.json().catch(() => ({}))
    const video = data?.medias?.[0]?.url

    if (!video) throw "Contenido no disponible"

    return video
  }

  async function handler(m, { text, conn }) {
    if (!text) throw "Envía el enlace de CapCut"
    if (!/capcut\.com/.test(text)) throw "Enlace no válido"

    await m.react("✨")

    try {
      const videoUrl = await getCapcutVideo(text)

      await conn.sendMessage(
        m.chat,
        { video: { url: videoUrl } },
        { quoted: m }
      )

      await m.react("✅")
    } catch (e) {
      console.log(e)
      await m.react("❌")
      m.reply("No se pudo obtener el video")
    }
  }

export { pluginConfig as config, handler }
