/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import axios from 'axios'

const fallbackToMp3Buffer = ElysiaRuntime.fallbackToMp3Buffer;
const ytdl = ElysiaRuntime.ytdl;

const formatNumber = (n) => Number(n || 0).toLocaleString('id-ID');

const pluginConfig = {
    name: "play",
    alias: ["putar", "lagu"],
    category: "download",
    description: "play",
    usage: ".play",
    example: ".play",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const CACHE_DIR = path.join(process.cwd(), 'database', 'cache', 'audio')
  const CACHE_MAX_FILES = 300
  const CACHE_MAX_BYTES = 800 * 1024 * 1024
  const CACHE_MAX_ITEM = 40 * 1024 * 1024
  const CACHE_MIN_ITEM = 10 * 1024
  const CACHE_ALIAS_TTL = 30 * 24 * 3600 * 1000
  fs.mkdirSync(CACHE_DIR, { recursive: true })

  const audioCache = (() => {
    const P = (...a) => path.join(CACHE_DIR, ...a)
    const safe = k => String(k || '').replace(/[^\w-]/g, '')
    const norm = q => String(q).toLowerCase().replace(/\s+/g, ' ').trim()
    const aliasPath = (ns, q) => P(`q-${crypto.createHash('sha1').update(`${ns}|${norm(q)}`).digest('hex').slice(0, 24)}.json`)
    const readJson = async f => { try { return JSON.parse(await fs.promises.readFile(f, 'utf8')) } catch { return null } }
    const rm = (...files) => Promise.all(files.map(f => fs.promises.unlink(f).catch(() => null)))
    const rmKey = key => rm(P(`${key}.mp3`), P(`${key}.json`), P(`${key}.jpg`))

    async function get(key) {
      key = safe(key)
      if (!key) return null
      const meta = await readJson(P(`${key}.json`))
      if (!meta) return null
      try {
        const audio = await fs.promises.readFile(P(`${key}.mp3`))
        if (audio.length < CACHE_MIN_ITEM) throw new Error('caché dañada')
        const now = new Date()
        fs.promises.utimes(P(`${key}.mp3`), now, now).catch(() => null)
        const thumb = await fs.promises.readFile(P(`${key}.jpg`)).catch(() => null)
        return { key, meta, audio, thumb }
      } catch {
        await rmKey(key)
        return null
      }
    }

    async function alias(ns, q, key) {
      key = safe(key)
      if (!key || !norm(q)) return
      await fs.promises.writeFile(aliasPath(ns, q), JSON.stringify({ key }))
    }

    async function findByQuery(ns, q) {
      if (!norm(q)) return null
      const a = await readJson(aliasPath(ns, q))
      if (!a?.key) return null
      const hit = await get(a.key)
      if (!hit) await rm(aliasPath(ns, q))
      return hit
    }

    async function prune() {
      const names = await fs.promises.readdir(CACHE_DIR).catch(() => [])
      const now = Date.now()
      const items = []
      for (const f of names) {
        const st = await fs.promises.stat(P(f)).catch(() => null)
        if (!st) continue
        if (f.startsWith('q-')) { if (now - st.mtimeMs > CACHE_ALIAS_TTL) await rm(P(f)); continue }
        if (f.endsWith('.mp3')) items.push({ key: f.slice(0, -4), size: st.size, t: st.mtimeMs })
      }
      items.sort((a, b) => a.t - b.t)
      let total = items.reduce((n, i) => n + i.size, 0)
      let count = items.length
      for (const it of items) {
        if (count <= CACHE_MAX_FILES && total <= CACHE_MAX_BYTES) break
        await rmKey(it.key)
        total -= it.size
        count--
      }
    }

    async function save({ ns, key, meta, audio, thumb, queries = [] }) {
      key = safe(key)
      if (!key || !Buffer.isBuffer(audio) || audio.length < CACHE_MIN_ITEM || audio.length > CACHE_MAX_ITEM) return false
      const tmp = P(`${key}.mp3.tmp-${process.pid}-${Date.now()}`)
      await fs.promises.writeFile(tmp, audio)
      await fs.promises.rename(tmp, P(`${key}.mp3`))
      if (Buffer.isBuffer(thumb) && thumb.length > 1000) await fs.promises.writeFile(P(`${key}.jpg`), thumb)
      await fs.promises.writeFile(P(`${key}.json`), JSON.stringify(meta || {}))
      for (const q of queries) await alias(ns, q, key)
      await prune()
      return true
    }

    return { get, alias, findByQuery, save }
  })()

  const ytKey = id => (id ? `yt-${id}` : null)

  async function getAudio(url) {
    try {
      const { data } = await axios.get(
        `https://my.izuka-api.xyz/api/downloader/ytmp3?url=${encodeURIComponent(url)}`,
        { timeout: 60000 }
      )

      const download = data?.result?.download_url || data?.result?.download
      if (download) return { download, title: data?.result?.title }
    } catch (e) {
      console.error('[PLAY API]', e.message)
    }

    const fallback = await ytdl(url, 'mp3')
    if (fallback?.status && fallback?.dl) {
      return { download: fallback.dl, title: fallback.title, fallback: true }
    }

    throw new Error(fallback?.mess || 'Error al obtener el audio')
  }

  async function downloadAudio(url, fallback = false) {
    if (fallback) return fallbackToMp3Buffer(url)

    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 120000,
      maxContentLength: 100 * 1024 * 1024,
      maxBodyLength: 100 * 1024 * 1024,
    })

    const type = String(res.headers['content-type'] || '').toLowerCase()
    if (type.includes('text/html') || type.includes('application/json')) {
      throw new Error('La URL de descarga no devolvió audio')
    }

    return Buffer.from(res.data)
  }

  async function getThumb(video) {
    const urls = [
      video.videoId ? `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg` : null,
      video.thumbnail
    ].filter(Boolean)

    for (const u of urls) {
      try {
        const res = await axios.get(u, { responseType: 'arraybuffer', timeout: 15000 })
        const buf = Buffer.from(res.data)
        if (buf.length > 1000) return buf
      } catch {}
    }
    return null
  }

  async function handler(m, { conn, usedPrefix, command, text }) {
    const query = (text || '').trim()

    if (!query) {
      return m.reply(`🎵 *PLAY*\n\nEjemplo:\n${usedPrefix + command} komang`)
    }

    await m.react('🕐')

    try {
      let info, audio, thumb

      let hit = await audioCache.findByQuery('yt', query)

      if (!hit) {
        const search = await yts(query)
        if (!search.videos?.length) throw new Error('Canción/video no encontrado')

        const video = search.videos[0]
        info = {
          videoId: video.videoId,
          title: video.title,
          author: video.author?.name || '-',
          timestamp: video.timestamp || '-',
          views: video.views || 0,
          ago: video.ago || '-',
          url: video.url,
          thumbnail: video.thumbnail
        }

        const key = ytKey(info.videoId)
        hit = key ? await audioCache.get(key) : null
        if (hit) audioCache.alias('yt', query, key).catch(() => null)

        if (!hit) {
          const result = await getAudio(video.url)
          ;[audio, thumb] = await Promise.all([
            downloadAudio(result.download, result.fallback),
            getThumb(video)
          ])
          if (key) {
            audioCache.save({ ns: 'yt', key, meta: info, audio, thumb, queries: [query] })
              .catch(e => console.error('[PLAY CACHE]', e.message))
          }
        }
      }

      if (hit) {
        info = hit.meta
        audio = hit.audio
        thumb = hit.thumb
      }

      const caption =
        `🎵 *NOW PLAYING*\n\n` +
        `📌 *Título:* ${info.title}\n` +
        `👤 *Channel:* ${info.author || '-'}\n` +
        `⏱️ *Duración:* ${info.timestamp || '-'}\n` +
        `👀 *Views:* ${formatNumber(info.views)}\n` +
        `📅 *Upload:* ${info.ago || '-'}\n\n` +
        `🔗 *YouTube:* ${info.url}`

      await conn.sendMessage(m.chat, {
        image: thumb || { url: info.thumbnail },
        caption
      }, { quoted: m })

      await conn.sendMessage(m.chat, {
        audio,
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: `${String(info.title).replace(/[\\/:*?"<>|]/g, '_')}.mp3`
      }, { quoted: m })

      await m.react('✅')
    } catch (e) {
      console.error('[PLAY]', e)
      await m.react('❌')
      return m.reply(`❌ *PLAY FALLÓ*\n\n${e?.message || 'Error al obtener el audio.'}`)
    }
  }

export { pluginConfig as config, handler }
