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
import * as cheerio from 'cheerio'

const pluginConfig = {
    name: "dlit",
    alias: [],
    category: "download",
    description: "dlit",
    usage: ".dlit",
    example: ".dlit",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { conn, args, usedPrefix, command }) {
    if (args.length < 2) return m.reply(`Ejemplo:\n${usedPrefix + command} tiktok https://vt.tiktok.com/ZSBKKk4HS/`)

    const platform = args[0].toLowerCase()
    const inputUrl = args[1]

    if (!['instagram', 'tiktok', 'facebook'].includes(platform))
      return m.reply('¡Plataforma no válida! Usa: instagram, tiktok o facebook')

    const SITE_URL = 'https://instatiktok.com/'
    const form = new URLSearchParams()
    form.append('url', inputUrl)
    form.append('platform', platform)
    form.append('siteurl', SITE_URL)

    try {
      const res = await axios.post(`${SITE_URL}api`, form.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin': SITE_URL,
          'Referer': SITE_URL,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      const html = res?.data?.html
      if (!html || res?.data?.status !== 'success') throw 'No se pudieron obtener los datos'

      const $ = cheerio.load(html)
      const links = []

      $('a.btn[href^="http"]').each((_, el) => {
        const link = $(el).attr('href')
        if (link && !links.includes(link)) links.push(link)
      })

      if (links.length === 0) throw 'Enlace de descarga no encontrado'

      let download
      if (platform === 'instagram') {
        download = links
      } else if (platform === 'tiktok') {
        download = links.find(link => /hdplay/.test(link)) || links[0]
      } else if (platform === 'facebook') {
        download = links.at(-1)
      }

      if (Array.isArray(download)) {
        for (let link of download) {
          await conn.sendFile(m.chat, link, 'media.mp4', `✅ Descarga de ${platform}`, m)
        }
      } else {
        await conn.sendFile(m.chat, download, 'media.mp4', `✅ Descarga completada de ${platform}`, m)
      }
    } catch (e) {
      m.reply(`❌ Error: ${e.message || e}`)
    }
  }

export { pluginConfig as config, handler }
