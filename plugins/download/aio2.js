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
    name: "aio2",
    alias: [],
    category: "download",
    description: "aio2",
    usage: ".aio2",
    example: ".aio2",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { conn, text, usedPrefix, command }) {
    await m.react('✨')

    if (!text) {
      return conn.reply(
        m.chat,
        `Example : ${usedPrefix + command} https://vt.tiktok.com/xxxx`,
        m
      )
    }

    try {
      let api = `${global.APIs.faa}/faa/aio?url=${encodeURIComponent(text)}`
      let res = await fetch(api)
      let json = await res.json()

      if (!json.status) throw 'No se pudieron obtener los datos.'

      let data = json.result
      let videoUrl = data.download_url

      await conn.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: data.title || 'Video descargado'
      }, { quoted: m })
    } catch (e) {
      console.error(e)
      conn.reply(m.chat, '⚠️ No se pudo obtener el video.', m)
    }
  }

export { pluginConfig as config, handler }
