/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
const elysiaLib = (name) => ElysiaRuntime.elysiaLib(name, typeof libs !== 'undefined' ? libs : null);
import fetch from 'node-fetch'

const libs = {
    "hok": async ({ elysiaLib }) => {
      const cheerio = (await import('cheerio'))

      const FANDOM_BASE = 'https://honor-of-kings.fandom.com'
      const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

      async function searchPageName(query) {
        const searchUrl = `${FANDOM_BASE}/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json`
        const res = await fetch(searchUrl, { headers: { 'User-Agent': UA } })
        if (!res.ok) return null
        const [, titles] = await res.json()
        return titles?.length ? titles[0] : null
      }

      async function fetchParsedPage(pageName) {
        const apiUrl = `${FANDOM_BASE}/api.php?action=parse&page=${encodeURIComponent(pageName)}&prop=text|images&format=json`
        const res = await fetch(apiUrl, { headers: { 'User-Agent': UA } })
        if (!res.ok) return { error: { info: 'Gagal mengambil data dari API' } }
        return res.json()
      }

      async function scrapeHokCharacter(name) {
        if (!name) throw new Error('Nama karakter kosong')

        let pageName = name
        let json = await fetchParsedPage(pageName)

        if (json.error) {
          const found = await searchPageName(name)
          if (found) {
            pageName = found
            json = await fetchParsedPage(pageName)
          }
          if (json.error) {
            throw new Error(`Karakter "${name}" tidak ditemukan`)
          }
        }

        const pageUrl = `${FANDOM_BASE}/wiki/${encodeURIComponent(pageName)}`

        const { title, text } = json.parse
        const html = text['*']
        const $ = cheerio.load(html)

        const clean = (str) => str?.replace(/\s+/g, ' ').trim()

        let image =
          $('.pi-image img').attr('src') ||
          $('.infobox img').first().attr('src') ||
          $('img').first().attr('src') ||
          null

        if (image && image.startsWith('//')) {
          image = 'https:' + image
        }
        if (image) {
          image = image.replace(/\/revision\/latest\/scale-to-width-down\/\d+/, '/revision/latest')
        }

        const profile = {}
        $('.pi-item.pi-data').each((_, el) => {
          const label = clean($(el).find('.pi-data-label').text())
          const value = clean($(el).find('.pi-data-value').text())
          if (label && value) profile[label] = value
        })

        const bio =
          clean($('.mw-parser-output > p').first().text()) ||
          clean($('p').first().text())

        let skills = []
        if (profile.Skills) {
          skills = profile.Skills
            .split(/[,•]/)
            .map((v) => clean(v))
            .filter(Boolean)
        }

        const loreParts = []
        $('#Background, #Lore, #Story').each((_, el) => {
          const heading = $(el).parent()
          let next = heading.next()
          while (next.length && !/^h[2-3]$/i.test(next[0]?.name)) {
            if (next[0]?.name === 'p') {
              const txt = clean(next.text())
              if (txt) loreParts.push(txt)
            }
            next = next.next()
          }
        })

        return {
          title,
          image,
          profile,
          bio,
          skills,
          lore: loreParts.length ? loreParts.join(' ') : null,
          url: pageUrl
        }
      }

      const __default = scrapeHokCharacter
      return { default: __default }
    }
}

const pluginConfig = {
    name: "hokchar",
    alias: [],
    category: "search",
    description: "hokchar <nama>",
    usage: ".hokchar <nama>",
    example: ".hokchar <nama>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const scrapeHokCharacter = (__m => __m.default ?? __m)((await elysiaLib('hok')))

  async function handler(m, { conn, sock, text, reply, usedPrefix, command }) {
    const client = conn || sock

    if (!text) {
      return reply(`⚔️ *HONOR OF KINGS CHARACTER*\n\nMencari informasi lengkap karakter Honor of Kings.\n\nContoh:\n${usedPrefix}${command} Luban No.7\n${usedPrefix}${command} Wukong\n${usedPrefix}${command} Angela`)
    }

    await m.react('⏳')

    try {
      const data = await scrapeHokCharacter(text.trim())

      let caption = `⚔️ *HONOR OF KINGS — ${data.title.toUpperCase()}*\n\n`

      if (data.profile && Object.keys(data.profile).length > 0) {
        caption += `📋 *PROFIL KARAKTER:*\n`
        for (const [key, val] of Object.entries(data.profile)) {
          caption += `• *${key}:* ${val}\n`
        }
        caption += `\n`
      }

      if (data.skills && data.skills.length > 0) {
        caption += `⚡ *SKILLS:*\n`
        data.skills.forEach((skill) => {
          caption += `• ${skill}\n`
        })
        caption += `\n`
      }

      if (data.bio) {
        caption += `📖 *BIO:*\n${data.bio}\n\n`
      }

      if (data.lore) {
        const loreText = data.lore.length > 600 ? data.lore.slice(0, 600) + '...' : data.lore
        caption += `📜 *LORE / BACKGROUND:*\n${loreText}\n\n`
      }

      caption += `🔗 *Wiki:* ${data.url}`

      await m.react('✅')

      if (data.image) {
        return await client.sendMessage(
          m.chat,
          {
            image: { url: data.image },
            caption: caption.trim()
          },
          { quoted: m }
        )
      }

      return reply(caption.trim())
    } catch (e) {
      await m.react('❌')
      return reply(`❌ ${e.message || 'Terjadi kesalahan saat mencari karakter.'}`)
    }
  }

export { pluginConfig as config, handler }
