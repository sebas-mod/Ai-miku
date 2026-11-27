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
import axios from 'axios'

const ytdl = MikuRuntime.ytdl;
const fallbackToMp3Buffer = MikuRuntime.fallbackToMp3Buffer;

const pluginConfig = {
    name: "playmiku",
    alias: ["yp", "playelysia"],
    category: "download",
    description: "playmiku",
    usage: ".playmiku",
    example: ".playmiku",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const MAX_BYTES = 100 * 1024 * 1024

  const isYtUrl = s => /(?:youtube\.com|youtu\.be)/i.test(s)

  const ytId = url => {
      const m = String(url).match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/)([\w-]{11})/)
      return m ? m[1] : null
  }

  const fmtNum = n => new Intl.NumberFormat('es-ES').format(Number(n) || 0)

  async function findVideo(query) {
      if (isYtUrl(query)) {
          const id = ytId(query)
          if (!id) throw new Error('Enlace de YouTube no válido')
          const v = await yts({ videoId: id })
          if (!v) throw new Error('Video no encontrado')
          return {
              videoId: id,
              url: `https://youtu.be/${id}`,
              title: v.title,
              author: v.author?.name || '-',
              timestamp: v.timestamp || '-',
              views: v.views,
              thumbnail: v.thumbnail
          }
      }

      const res = await yts(query)
      const v = res?.videos?.[0]
      if (!v) throw new Error('Canción no encontrada')
      return {
          videoId: v.videoId,
          url: v.url,
          title: v.title,
          author: v.author?.name || '-',
          timestamp: v.timestamp || '-',
          views: v.views,
          thumbnail: v.thumbnail
      }
  }

  function sniffAudio(buf) {
      if (!Buffer.isBuffer(buf) || buf.length < 12) return null
      if (buf.toString('latin1', 0, 3) === 'ID3') return 'mp3'
      if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) return 'mp3'
      if (buf.toString('latin1', 4, 8) === 'ftyp') return 'mp4'
      if (buf.toString('latin1', 0, 4) === 'OggS') return 'ogg'
      if (buf.toString('latin1', 0, 4) === 'RIFF') return 'wav'
      if (buf.toString('latin1', 0, 4) === 'fLaC') return 'flac'
      if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return 'webm'
      return null
  }

  async function* audioSources(url) {
      try {
          const { data } = await axios.get(
              `https://my.izuka-api.xyz/api/downloader/ytmp3?url=${encodeURIComponent(url)}`,
              { timeout: 60000 }
          )
          const dl = data?.result?.download_url || data?.result?.download
          if (dl) yield { name: 'izuka', dl }
      } catch (e) {
          console.error('[PLAYAi Miku] izuka:', e.message)
      }

      try {
          const r = await ytdl(url, 'mp3')
          if (r?.status && r?.dl) yield { name: 'ytdl', dl: r.dl }
          else console.error('[PLAYAi Miku] ytdl:', r?.mess || 'tidak ada link')
      } catch (e) {
          console.error('[PLAYAi Miku] ytdl:', e.message)
      }
  }

  async function fetchBuffer(dl) {
      const res = await axios.get(dl, {
          responseType: 'arraybuffer',
          timeout: 120000,
          maxContentLength: MAX_BYTES,
          maxBodyLength: MAX_BYTES,
          headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/124.0 Mobile Safari/537.36' }
      })
      const type = String(res.headers['content-type'] || '').toLowerCase()
      if (type.includes('text/html') || type.includes('application/json')) {
          throw new Error('la URL de descarga no es un archivo de audio')
      }
      return Buffer.from(res.data)
  }

  async function getAudioBuffer(url) {
      const errors = []

      for await (const src of audioSources(url)) {
          try {
              const buf = await fetchBuffer(src.dl)
              if (buf.length < 10 * 1024) throw new Error('archivo demasiado pequeño')

              const kind = sniffAudio(buf)
              if (kind === 'mp3') return buf

              if (kind) {
                  const mp3 = await fallbackToMp3Buffer(src.dl)
                  if (mp3?.length > 10 * 1024) return Buffer.from(mp3)
              }
              throw new Error('el archivo no es audio')
          } catch (e) {
              console.error(`[PLAYAi Miku] ${src.name} gagal:`, e.message)
              errors.push(`${src.name}: ${String(e.message).slice(0, 60)}`)
          }
      }

      throw new Error('Todas las fuentes de descarga fallaron' + (errors.length ? ` (${errors.join('; ')})` : ''))
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

  async function handler(m, { conn, text, usedPrefix, command }) {
      const query = (text || '').trim()
      const p = usedPrefix || '.'

      if (!query) {
          return m.reply(
              `🎵 *PLAY Ai Miku*\n\n` +
              `> Ejemplo: ${p}${command} multo\n` +
              `> Ejemplo: ${p}${command} https://youtube.com/watch?v=xxxxx`
          )
      }

      await m.react('🎧')

      try {
          await m.reply('🎵 *Ai Miku MD:* Darling~ estoy buscando la canción... espera un momento 🦋')

          const video = await findVideo(query)

          await m.reply(
              `📥 *Downloading:* ${video.title}\n` +
              `⏱️ *Duración:* ${video.timestamp}\n\n` +
              `Espera un momentito, darling~`
          )

          const [audio, thumb] = await Promise.all([
              getAudioBuffer(video.url),
              getThumb(video)
          ])

          const caption =
              `🎵 *${video.title}*\n\n` +
              `👤 *Artist:* ${video.author}\n` +
              `⏱️ *Duration:* ${video.timestamp}\n` +
              `👁️ *Views:* ${fmtNum(video.views)}\n\n` +
              `🦋 *Ai Miku MD:* Disfruta, querido~ ¡no olvides volver a escucharla si te gusta! 💕`

          if (thumb) {
              await conn.sendMessage(m.chat, { image: thumb, caption }, { quoted: m })
          } else {
              await m.reply(caption)
          }

          await conn.sendMessage(
              m.chat,
              {
                  audio,
                  mimetype: 'audio/mpeg',
                  ptt: false,
                  fileName: `${video.title}.mp3`
              },
              { quoted: m }
          )

          await m.react('✅')
      } catch (err) {
          console.error('[PlayAi Miku]', err)
          await m.react('❌')

          const msg = String(err?.message || err)

          if (msg.includes('getaddrinfo') || msg.includes('ENOTFOUND')) {
              return m.reply('❌ *Error:* Problema de conexión a internet, inténtalo de nuevo, darling~ 🗿')
          }
          if (msg.toLowerCase().includes('signature')) {
              return m.reply('❌ *Error:* YouTube se está actualizando, inténtalo más tarde, darling~ 🦋')
          }
          if (/Command failed|ffmpeg/i.test(msg)) {
              return m.reply('❌ *Error:* no se pudo procesar el audio (la fuente de descarga está fallando), inténtalo más tarde, cariño~ 🦋')
          }
          return m.reply(`❌ *Error:* ${msg.substring(0, 150)}\n\n> Inténtalo más tarde, darling~`)
      }
  }

export { pluginConfig as config, handler }
