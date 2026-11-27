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
import fetch from 'node-fetch'

const safeJson = MikuRuntime.safeJson;

const pluginConfig = {
    name: "playvid",
    alias: [],
    category: "download",
    description: "playvid",
    usage: ".playvid",
    example: ".playvid",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { conn, text }) {
     if (!text) throw `Ejemplo:\n.playvid dj remix|360\n.ytmp4 dj remix|720`

     await m.reply(global.wait)

     let [query, resolusi] = text.split('|')
     resolusi = resolusi || '360'

     let url = query

     if (!/^https?:\/\//.test(query)) {
        let search = await yts(query)
        let vid = search.videos[0]
        if (!vid) throw 'Video no encontrado'
        url = vid.url
     }

     let api = `https://api.nexray.web.id/downloader/ytmp4?url=${encodeURIComponent(url)}&resolusi=${resolusi}`

     let res = await fetch(api)
     let json = await safeJson(res, { status: false })

     if (!json.status) throw 'No se pudo obtener el video'

     let data = json.result

     let caption = `*${data.title}*
Duración: ${data.duration}s
Resolución: ${data.resolusi}p
🍹 Aquí tienes el video~`

     await conn.sendMessage(m.chat, {
        video: { url: data.url },
        caption
     }, { quoted: m })
  }

export { pluginConfig as config, handler }
