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
    name: "growtopia",
    alias: [],
    category: "search",
    description: "growtopia",
    usage: ".growtopia",
    example: ".growtopia",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const BASE_URL = 'https://www.growtopiagame.com'
  const WIKI_URL = 'https://growtopia.fandom.com/api.php'
  const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Referer: 'https://www.growtopiagame.com/'
  }

  async function getServerDetail() {
    const res = await axios.get(`${BASE_URL}/detail`, { headers: HEADERS, timeout: 10000 })
    const data = res.data || {}
    const imageUrl = data.world_day_images?.full_size || ''
    let worldName = ''
    if (imageUrl) {
      const m = imageUrl.match(/\/worlds\/([a-zA-Z0-9_\-]+)\.png/)
      if (m) worldName = m[1].toUpperCase()
    }
    let trailer = ''
    if (data.watch_trailer) {
      const m = String(data.watch_trailer).match(/href="([^"]+)"/)
      if (m) trailer = m[1]
    }
    return {
      online_user: data.online_user || 0,
      world_of_the_day: { name: worldName, image_url: imageUrl },
      trailer_url: trailer
    }
  }

  function getWorldRenderUrl(worldName) {
    const clean = worldName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    return `${BASE_URL}/worlds/${clean}.png`
  }

  async function getLeaderboard(limit = 20) {
    const res = await axios.get(`${BASE_URL}/leaderboard`, { headers: HEADERS, timeout: 10000 })
    const html = String(res.data)
    const entries = []
    const rowRegex = /<li class="gtlb-list-row"[^>]*>[\s\S]*?<span class="gtlb-rank">(\d+)<\/span>[\s\S]*?<span class="gtlb-name"[^>]*>([^<]+)<\/span>[\s\S]*?<span class="gtlb-score">([^<]+)<\/span>/g
    let match
    while ((match = rowRegex.exec(html)) !== null) {
      entries.push({ rank: match[1], player_name: match[2].trim(), score: match[3].trim() })
      if (entries.length >= limit) break
    }
    return entries
  }

  async function searchItem(keyword) {
    const res = await axios.get(WIKI_URL, {
      params: { action: 'query', list: 'search', srsearch: keyword, format: 'json' },
      headers: HEADERS,
      timeout: 10000
    })
    const list = res.data?.query?.search || []
    return list.slice(0, 5).map((item) => ({
      title: item.title,
      page_url: `https://growtopia.fandom.com/wiki/${encodeURIComponent(item.title.replace(/\s+/g, '_'))}`
    }))
  }

  async function getItemDetail(pageTitle) {
    const res = await axios.get(WIKI_URL, {
      params: { action: 'parse', page: pageTitle, prop: 'wikitext', format: 'json' },
      headers: HEADERS,
      timeout: 10000
    })
    const wikitext = res.data?.parse?.wikitext?.['*'] || ''
    return wikitext
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
      .replace(/\{\{[^}]+\}\}/g, '')
      .replace(/==+/g, '')
      .trim()
      .slice(0, 500)
  }

  const fmt = (n) => new Intl.NumberFormat('id-ID').format(n)

  async function handler(m, { conn, text, usedPrefix, command }) {
    const parts = (text || '').trim().split(/\s+/).filter(Boolean)
    const sub = (parts.shift() || '').toLowerCase()
    const param = parts.join(' ')

    if (!sub || !['status', 'wotd', 'world', 'leaderboard', 'lb', 'item'].includes(sub)) {
      const p = usedPrefix + command
      return m.reply(
        `*GROWTOPIA INFO*\n\n` +
        `• ${p} estado: jugadores en línea y estado del servidor\n` +
        `• ${p} wotd — World of the Day\n` +
        `• ${p} mundo <nombre> — renderizar imagen del mundo\n` +
        `• ${p} leaderboard — Dungeons leaderboard\n` +
        `• ${p} artículo <nombre> — información del artículo y receta (wiki)`
      )
    }

    await m.react('🕕')
    try {
      if (sub === 'status') {
        const d = await getServerDetail()
        await m.reply(
          `*— GROWTOPIA STATUS —*\n\n` +
          `❀ Jugadores en línea: ${fmt(d.online_user)}\n` +
          `❀ WOTD : ${d.world_of_the_day.name || '-'}\n` +
          `❀ Trailer : ${d.trailer_url || '-'}`
        )
      } else if (sub === 'wotd') {
        const d = await getServerDetail()
        const caption = `*World of the Day*\n\n❀ World : ${d.world_of_the_day.name || '-'}`
        if (d.world_of_the_day.image_url) {
          await conn.sendMessage(m.chat, { image: { url: d.world_of_the_day.image_url }, caption }, { quoted: m })
        } else {
          await m.reply(caption)
        }
      } else if (sub === 'world') {
        if (!param) return m.reply(`Ejemplo: ${usedPrefix + command} mundo START`)
        const url = getWorldRenderUrl(param)
        const caption = `*Render World*\n\n❀ World : ${param.toUpperCase()}\n❀ Link : ${url}`
        try {
          await conn.sendMessage(m.chat, { image: { url }, caption }, { quoted: m })
        } catch {
          await m.reply(`${caption}\n\n_Imagen aún no disponible (es posible que el mundo nunca haya sido renderizado)._`)
        }
      } else if (sub === 'leaderboard' || sub === 'lb') {
        const lb = await getLeaderboard(20)
        if (!lb.length) {
          await m.react('❌')
          return m.reply('La tabla de clasificación es actualmente inaccesible.')
        }
        const lines = lb.map((e) => `${e.rank.padStart(2)}. ${e.player_name} — ${e.score}`)
        await m.reply(`*— TOP 20 DUNGEONS LEADERBOARD —*\n\n${lines.join('\n')}`)
      } else if (sub === 'item') {
        if (!param) return m.reply(`Ejemplo: ${usedPrefix + command} Artículos de rejilla láser`)
        const items = await searchItem(param)
        if (!items.length) {
          await m.react('❌')
          return m.reply('Artículo no encontrado.')
        }
        let summary = ''
        try {
          summary = await getItemDetail(items[0].title)
        } catch {}
        const others = items.slice(1).map((it, i) => `${i + 2}. ${it.title}\n   ${it.page_url}`).join('\n')
        await m.reply(
          `*— GROWTOPIA ITEM —*\n\n` +
          `❀ ${items[0].title}\n${items[0].page_url}\n\n` +
          `${summary || '_Sin descripción adicional._'}` +
          (others ? `\n\n*Otros resultados:*\n${others}` : '')
        )
      }
      await m.react('✅')
    } catch (e) {
      await m.react('❌')
      throw String(e?.message || e)
    }
  }

export { pluginConfig as config, handler }
