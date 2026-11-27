/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

import yts from 'yt-search'
const pluginConfig = {
    name: "yts",
    alias: [],
    category: "download",
    description: "yts",
    usage: ".yts",
    example: ".yts",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { text, conn, usedPrefix, command }) {
    if (!text) throw `¡Envía un título!

Ejemplo:
${usedPrefix + command} dj 30 segundos`

    let search = await yts(text)
    let videos = search.videos.slice(0, 10)

    if (!videos.length) throw 'Video no encontrado.'

    let caption = `*YouTube Search*\n`
    caption += `Query: ${text}\n\n`

    for (let i = 0; i < videos.length; i++) {
      let v = videos[i]
      caption += `*${i + 1}. ${v.title}*\n`
      caption += `⏱ ${v.timestamp} | ${v.views.toLocaleString()}\n`
      caption += `📎 ${v.url}\n\n`
    }

    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReplyOffOffOff: {
          title: "YouTube Search",
          body: text,
          thumbnailUrl: videos[0].thumbnail,
          sourceUrl: videos[0].url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })
  }

export { pluginConfig as config, handler }
