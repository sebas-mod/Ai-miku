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
import { load } from 'cheerio'

  const BASE = 'https://snaptik.kim/tiktok-story-viewer/?sdl=1'
  const UA = 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36'

  function parseUsername(input) {
    input = input.trim()
    try {
      const url = new URL(input.startsWith('http') ? input : 'https://' + input)
      if (url.hostname.includes('tiktok.com')) {
        const match = url.pathname.match(/\/@?([^/]+)/)
        if (match) return match[1].replace(/^@/, '')
      }
    } catch {}
    return input.replace(/^@/, '')
  }

  function parseStats($, spans) {
    const nums = []
    spans.each((_, el) => {
      const text = $(el).text().trim().replace(/,/g, '')
      nums.push(isNaN(text) || text === '' ? text : Number(text))
    })
    return { likes: nums[0] ?? 0, views: nums[1] ?? 0, comments: nums[2] ?? 0 }
  }

  async function fetchStories(input) {
    const username = parseUsername(input)

    const { data: html } = await axios.post(
      BASE,
      new URLSearchParams({ page: username, ftype: 'all', gres: '', ajax: '1' }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Accept: '*/*',
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': UA,
          Referer: 'https://snaptik.kim/tiktok-story-viewer/'
        },
        timeout: 30000
      }
    )

    const $ = load(html)
    const stories = []

    $('.icard').each((i, card) => {
      const $card = $(card)
      const dl = $card.find('a.btn-dl')
      stories.push({
        index: i + 1,
        thumbnail: $card.find('img.list_media').attr('src') || null,
        download_url: dl.attr('href') || null,
        size_label: dl.text().trim().replace(/\s+/g, ' ').replace('Download', '').trim(),
        ...parseStats($, $card.find('.meta span'))
      })
    })

    return { username, count: stories.length, stories }
  }

  async function fetchBuffer(url) {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60000,
      headers: { 'User-Agent': UA, Referer: 'https://snaptik.kim/' }
    })
    return { buffer: Buffer.from(res.data), mime: String(res.headers['content-type'] || '') }
  }

  const pluginConfig = {
    name: 'ttstory',
    alias: [],
    category: "download",
    description: 'Descarga historias de TikTok desde el usuario',
    usage: '.ttstory <usuario|enlace del perfil> [número|all]',
    example: '.ttstory @username',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
  }

  const MAX_ALL = 8

  async function handler(m, { sock }) {
    const args = String(m.text || '').trim().split(/\s+/).filter(Boolean)
    const input = args[0]
    const pick = (args[1] || '').toLowerCase()

    if (!input) {
      m.react('❌')
      return m.reply(
        `📌 Ejemplo:\n*${m.prefix + m.command} @username*\n` +
        `*${m.prefix + m.command} @username 2* (obtén la historia n.º 2)\n` +
        `*${m.prefix + m.command} @username all* (máx. ${MAX_ALL} historias)`
      )
    }

    m.react('🕕')
    try {
      const result = await fetchStories(input)
      if (!result.count) {
        m.react('❌')
        return m.reply(`❌ La historia de *@${result.username}* no se encontró, la cuenta es privada o no hay historias.`)
      }

      let targets
      if (pick === 'all') targets = result.stories.slice(0, MAX_ALL)
      else if (/^\d+$/.test(pick)) targets = result.stories.filter(s => s.index === Number(pick))
      else targets = result.stories.slice(0, 1)

      if (!targets.length) return m.reply(`❌ La historia número ${pick} no existe. Total de historias: ${result.count}`)

      for (const s of targets) {
        if (!s.download_url) continue
        try {
          const { buffer, mime } = await fetchBuffer(s.download_url)
          const caption =
            `📖 *TIKTOK STORY*\n\n` +
            `- User: @${result.username}\n` +
            `- Story: ${s.index}/${result.count}\n` +
            `- ❤️ ${s.likes} | 👁️ ${s.views} | 💬 ${s.comments}`
          if (/^image\//i.test(mime)) {
            await sock.sendMessage(m.chat, { image: buffer, caption }, { quoted: m })
          } else {
            await sock.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', caption }, { quoted: m })
          }
        } catch (e) {
          console.error(`[TTStory] Story ${s.index} gagal:`, e.message)
          await m.reply(`⚠️ No se pudo descargar la historia ${s.index}.`)
        }
      }

      if (result.count > 1 && !pick) {
        await m.reply(`💡 @${result.username} tiene ${result.count} historias.\nUsa *${m.prefix + m.command} ${input} <número>* o *all*.`)
      }
      m.react('✅')
    } catch (e) {
      console.error('[TTStory] Error:', e)
      m.react('❌')
      m.reply(`❌ *Error al obtener las historias*\n\n> ${e.message}`)
    }
  }

export { pluginConfig as config, handler }
