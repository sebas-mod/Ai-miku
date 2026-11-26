/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

  const FEATURE_CREDIT = "Función de: Elysia Assistant MD";

  async function UhdpaperSearch(query) {
    try {
      const response = await axios.get(`https://www.uhdpaper.com/search?q=${encodeURIComponent(query)}&by-date=true&i=0`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      })
      const html = response.data
      const $ = cheerio.load(html)
      const results = []

      $('article.post-outer-container').each((_, element) => {
        const title = $(element).find('.snippet-title h2').text().trim()
        const imageUrl = $(element).find('.snippet-title img').attr('src')
        const resolution = $(element).find('.wp_box b').text().trim()
        const link = $(element).find('a').attr('href')

        if (title && imageUrl && resolution && link) {
          results.push({ title, imageUrl, resolution, link })
        }
      })

      return results
    } catch (error) {
      console.error('Error scraping UHDPaper:', error.message)
      return []
    }
  }

  const pluginConfig = {
    name: "uhdpaper",
    alias: [],
    category: "maker",
    description: "Imported plugin",
    usage: "",
    example: "",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 1,
    isEnabled: true,
  };

  async function handler(m, { sock, text, prefix, command }) {
      const conn = sock;
      const usedPrefix = prefix || m.prefix || ".";
    if (!text) throw `Ejemplo:\n${usedPrefix + command} naruto`

    let results = await UhdpaperSearch(text)
    if (results.length === 0) throw '¡No se encontró el fondo de pantalla!'

    let list = results.map((v, i) => `*${i + 1}. ${v.title}*\n📏 *Resolusi:* ${v.resolution}\n🔗 ${v.link}`).join`\n\n`

    await conn.sendMessage(m.chat, { text: `*Resultados de UHDPaper: ${text}*\n\n${list}` }, { quoted: m })
  }

export { pluginConfig as config, handler }
