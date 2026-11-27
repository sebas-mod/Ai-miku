/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
const mikuWrapPlugin = MikuRuntime.mikuWrapPlugin;
import fs from 'fs'
import os from 'os'
import path from 'path'
import * as cheerio from 'cheerio'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

  const execFileAsync = promisify(execFile)

  const BASE_URL = 'https://nekopoi.care'
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

  const HEADERS = {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json, text/html, */*'
  }

  const BLOCKED = /\b(loli|lolicon|shota|shotacon|toddlercon|child|children|underage|minor|kid|preteen)\b/i
  const isBlocked = (...parts) => BLOCKED.test(parts.filter(Boolean).join(' '))

  function cleanText(str = '') {
      return String(str || '')
          .replace(/&#8211;/g, '-')
          .replace(/&#8216;|&#8217;/g, "'")
          .replace(/&#8220;|&#8221;/g, '"')
          .replace(/&#038;/g, '&')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim()
  }

  function extractSlug(input = '') {
      const raw = String(input || '').trim()
      const match = raw.match(/nekopoi\.care\/([a-zA-Z0-9_\-]+)/i)
      if (match?.[1]) return match[1].replace(/^\/+|\/+$/g, '')
      return raw.replace(/^\/+|\/+$/g, '')
  }

  const mapPost = p => ({
      id: p.id,
      slug: p.slug,
      title: cleanText(p.title?.rendered),
      date: p.date ? p.date.split('T')[0] : '-',
      url: p.link || `${BASE_URL}/${p.slug}/`
  })

  async function getPosts(endpoint, errMsg) {
      const res = await fetch(endpoint, { headers: HEADERS, signal: AbortSignal.timeout(15000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${errMsg}`)
      const posts = await res.json().catch(() => [])
      return Array.isArray(posts) ? posts.map(mapPost) : []
  }

  async function search(keyword, limit = 10) {
      const q = String(keyword || '').trim()
      if (!q) throw new TypeError('Las palabras clave de búsqueda no pueden estar vacías')
      return getPosts(
          `${BASE_URL}/wp-json/wp/v2/posts?search=${encodeURIComponent(q)}&per_page=${Math.min(limit, 20)}`,
          'No se pudo contactar con el servidor NekoPoi'
      )
  }

  async function getLatest(page = 1, limit = 10, categoryId = null) {
      let endpoint = `${BASE_URL}/wp-json/wp/v2/posts?page=${page}&per_page=${Math.min(limit, 20)}`
      if (categoryId) endpoint += `&categories=${categoryId}`
      return getPosts(endpoint, 'No se pudo obtener el último lanzamiento de NekoPoi')
  }

  async function getDetail(slugOrUrl) {
      const slug = extractSlug(slugOrUrl)
      if (!slug) throw new TypeError('Slug o URL NekoPoi no pueden estar vacíos')

      const pageUrl = String(slugOrUrl).startsWith('http') ? slugOrUrl : `${BASE_URL}/${slug}/`

      const res = await fetch(pageUrl, {
          headers: {
              'User-Agent': USER_AGENT,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          signal: AbortSignal.timeout(20000)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: Contenido de NekoPoi no encontrado`)

      const $ = cheerio.load(await res.text())

      const title = cleanText($("meta[property='og:title']").attr('content') || $('h1.entry-title').text() || $('title').text())
      const thumbnail = $("meta[property='og:image']").attr('content') || null
      const series = $('.nk-player-series-title').text().trim() || null

      const info = {}
      $('p').each((_, p) => {
          const text = $(p).text().trim()
          const val = text.split(':').slice(1).join(':').trim()
          if (text.includes('Original Title')) info.originalTitle = val
          if (text.includes('Producers')) info.producers = val
          if (text.includes('Duration')) info.duration = val
          if (text.includes('Genre')) info.genre = val
          if (text.includes('Actress')) info.actress = val
      })

      const streams = []
      $('.nk-player-frame iframe').each((_, el) => {
          const src = $(el).attr('src')
          if (src && !streams.includes(src)) streams.push(src)
      })

      const downloads = []
      $('.nk-download-row').each((_, row) => {
          const name = $(row).find('.nk-download-name').text().trim()
          const links = []
          $(row).find('.nk-download-links a').each((_, a) => {
              const linkUrl = $(a).attr('href')
              if (linkUrl) links.push({ name: $(a).text().trim(), url: linkUrl })
          })
          if (name && links.length) downloads.push({ resolution: name, links })
      })

      return {
          title, slug, url: pageUrl, thumbnail, series,
          originalTitle: info.originalTitle || null,
          producers: info.producers || null,
          duration: info.duration || null,
          genre: info.genre || null,
          actress: info.actress || null,
          streams, downloads
      }
  }

  const EMBED_HOST = /stream(poi|ruby)\./i

  async function getStreampoiM3u8(embedUrl) {
      if (!embedUrl || !EMBED_HOST.test(embedUrl)) return null

      const res = await fetch(embedUrl, {
          headers: { 'User-Agent': USER_AGENT, 'Referer': `${BASE_URL}/` },
          signal: AbortSignal.timeout(15000),
          redirect: 'follow'
      })
      if (!res.ok) return null

      const html = await res.text()
      const match = html.match(/file\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/) ||
          html.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/)
      if (!match?.[1]) return null

      const embedOrigin = new URL(res.url || embedUrl).origin
      const ctx = { referer: `${embedOrigin}/`, origin: embedOrigin }
      const hdr = { 'User-Agent': USER_AGENT, 'Referer': ctx.referer, 'Origin': ctx.origin }

      let best = match[1]

      try {
          const mRes = await fetch(best, { headers: hdr, signal: AbortSignal.timeout(15000) })
          if (mRes.ok) {
              const lines = (await mRes.text()).split('\n').map(l => l.trim()).filter(Boolean)
              const variants = []

              for (let i = 0; i < lines.length; i++) {
                  if (!lines[i].startsWith('#EXT-X-STREAM-INF')) continue
                  const bw = Number(lines[i].match(/BANDWIDTH=(\d+)/)?.[1] || 0)
                  const uri = lines.slice(i + 1).find(l => !l.startsWith('#'))
                  if (uri) variants.push({ bw, url: new URL(uri, best).href })
              }

              if (variants.length) best = variants.sort((x, y) => y.bw - x.bw)[0].url
          }
      } catch (e) {
          console.warn('[nekopoi] No se pudo analizar el maestro m3u8, recurrir al maestro:', e.message)
      }

      return { url: best, ...ctx }
  }

  async function downloadViaFetch(m3u8Url, ctx, outputPath) {
      const hdr = { 'User-Agent': USER_AGENT, 'Referer': ctx.referer, 'Origin': ctx.origin }

      const pl = await fetch(m3u8Url, { headers: hdr, signal: AbortSignal.timeout(20000) })
      if (!pl.ok) throw new Error(`playlist HTTP ${pl.status}`)

      const text = await pl.text()
      if (/#EXT-X-KEY:METHOD=(?!NONE)/i.test(text)) throw new Error('stream terenkripsi')

      const segs = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
          .map(l => new URL(l, m3u8Url).href)
      if (!segs.length) throw new Error('lista vacía')

      const tsPath = outputPath.replace(/\.mp4$/, '.ts')
      const ws = fs.createWriteStream(tsPath)

      try {
          for (const u of segs) {
              const r = await fetch(u, { headers: hdr, signal: AbortSignal.timeout(30000) })
              if (!r.ok) throw new Error(`segmen HTTP ${r.status}`)
              if (!ws.write(Buffer.from(await r.arrayBuffer()))) await new Promise(res => ws.once('drain', res))
          }
          await new Promise((res, rej) => { ws.end(res); ws.on('error', rej) })

          await execFileAsync('ffmpeg', ['-y', '-i', tsPath, '-c', 'copy', '-bsf:a', 'aac_adtstoasc', outputPath], { timeout: 180000 })
      } finally {
          fs.rm(tsPath, { force: true }, () => {})
      }

      return outputPath
  }

  async function downloadNekopoiStream(stream, outputPath) {
      const headers = `Referer: ${stream.referer}\r\nOrigin: ${stream.origin}\r\n`

      try {
          await execFileAsync('ffmpeg', [
              '-y',
              '-user_agent', USER_AGENT,
              '-headers', headers,
              '-i', stream.url,
              '-c', 'copy',
              '-bsf:a', 'aac_adtstoasc',
              outputPath
          ], { timeout: 180000, maxBuffer: 1024 * 1024 * 8 })
      } catch (e) {
          console.warn('[nekopoi] ffmpeg falló, intente recuperar la copia de seguridad:', String(e.message).split('\n').pop())
          await downloadViaFetch(stream.url, stream, outputPath)
      }

      return outputPath
  }

  const MAX_SEND = 200 * 1024 * 1024
  const clip = (s, n = 90) => String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s)
  const isNeko = s => /nekopoi\.care\//i.test(s)

  const pluginConfig = {
      name: 'nekopoi',
      alias: [],
      category: "anime",
      usage: '<palabra clave | latest | url | dl url>',
      example: '.nekopoi latest',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 10,
      energi: 2,
      isEnabled: true
  }

  const usage = p =>
      `*NEKOPOI*\n━━━━━━━━━━━━━━━━\n` +
      `• ${p}nekopoi <palabra clave>\n` +
      `• ${p}nekopoi latest [hal]\n` +
      `• ${p}nekopoi <url / slug> : detail\n` +
      `• ${p}nekopoi dl <url / slug>: enviar vídeo`

  const listText = (title, posts) =>
      `*${title}*\n━━━━━━━━━━━━━━━━\n` +
      posts.map((v, i) => `${i + 1}. ${clip(v.title)}\n   📅 ${v.date}\n   ${v.url}`).join('\n\n') +
      `\n\nEnvíe el enlace con.nekopoi <url> para obtener más detalles.`

  async function run(m, { sock, text, prefix }) {
      const p = prefix || '.'
      let input = String(text || '').trim()
      if (!input) return m.reply(usage(p))

      if (isBlocked(input)) return m.reply('❌ Esa palabra clave está bloqueada.')

      try {
          const mLatest = input.match(/^(latest|terbaru)(?:\s+(\d+))?$/i)
          if (mLatest) {
              await m.reply('⏳ Obtenga los últimos lanzamientos...')
              const posts = (await getLatest(Number(mLatest[2]) || 1, 10)).filter(v => !isBlocked(v.title, v.slug))
              if (!posts.length) return m.reply('Sin datos.')
              return m.reply(listText('RILISAN TERBARU', posts))
          }

          const mDl = input.match(/^(?:dl|download)\s+(\S+)$/i)
          if (mDl) {
              await m.reply('⏳ Tomando un vídeo, esto puede tardar unos minutos...')

              const d = await getDetail(mDl[1])
              if (isBlocked(d.title, d.genre, d.series)) return m.reply('❌ Este contenido está bloqueado.')

              const embed = d.streams.find(s => EMBED_HOST.test(s))
              if (!embed) {
                  return m.reply('La transmisión de streampoi no está disponible para este video. Pruebe el enlace de descarga en:\n' + `${p}nekopoi ${d.url}`)
              }

              const stream = await getStreampoiM3u8(embed)
              if (!stream) return m.reply('No se pudo recuperar la lista de reproducción de videos.')

              const out = path.join(os.tmpdir(), `nekopoi-${Date.now()}.mp4`)

              try {
                  await downloadNekopoiStream(stream, out)

                  const size = fs.statSync(out).size
                  if (size > MAX_SEND) {
                      return m.reply(`El archivo es demasiado grande para enviarlo (${(size / 1048576).toFixed(0)} MB). Utilice el enlace de descarga de ${p}nekopoi ${d.url}`)
                  }

                  return await sock.sendMessage(m.chat, {
                      document: { url: out },
                      mimetype: 'video/mp4',
                      fileName: `${clip(d.title, 60).replace(/[\\/:*?"<>|]/g, '')}.mp4`,
                      caption: `*${clip(d.title, 120)}*`
                  }, { quoted: m })
              } finally {
                  fs.rm(out, { force: true }, () => {})
              }
          }

          if (isNeko(input) || (/^[a-z0-9_-]+$/i.test(input) && input.includes('-') && !input.includes(' '))) {
              await m.reply('⏳ Recuperando detalles...')

              const d = await getDetail(input)
              if (isBlocked(d.title, d.genre, d.series)) return m.reply('❌ Este contenido está bloqueado.')

              const info = [
                  d.series && `📺 Series : ${d.series}`,
                  d.originalTitle && `🈶 Título original: ${d.originalTitle}`,
                  d.producers && `🏢 Producer : ${d.producers}`,
                  d.duration && `⏱️ Duración : ${d.duration}`,
                  d.genre && `🏷️ Genre : ${clip(d.genre, 200)}`,
                  d.actress && `👤 Pemeran : ${d.actress}`
              ].filter(Boolean).join('\n')

              const streams = d.streams.length
                  ? `\n\n*Stream*\n${d.streams.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
                  : ''

              const dls = d.downloads.length
                  ? `\n\n*Download*\n` + d.downloads.map(x =>
                      `▫️ ${x.resolution}\n` + x.links.map(l => `   • ${l.name}: ${l.url}`).join('\n')
                  ).join('\n')
                  : ''

              const caption = `*${clip(d.title, 150)}*\n${info}${streams}${dls}\n\nEnviar vídeo: ${p}nekopoi dl ${d.url}`

              if (d.thumbnail) {
                  try {
                      return await sock.sendMessage(m.chat, { image: { url: d.thumbnail }, caption: caption.slice(0, 3000) }, { quoted: m })
                  } catch {}
              }
              return m.reply(caption)
          }

          await m.reply('⏳ Buscando...')
          const posts = (await search(input, 10)).filter(v => !isBlocked(v.title, v.slug))
          if (!posts.length) return m.reply('Extraviado.')
          return m.reply(listText(`RESULTADOS: ${input}`, posts))
      } catch (e) {
          console.log(e)
          return m.reply(`❌ Fallido: ${String(e.message).split('\n').filter(Boolean).slice(-2).join(' ').slice(0, 200)}`)
      }
  }

  const handler = mikuWrapPlugin(pluginConfig, (m, ctx) => run(m, { ...ctx, text: ctx.text ?? (m.args || []).join(' ') }))

export { pluginConfig as config, handler }
