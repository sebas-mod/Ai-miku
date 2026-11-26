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
import axios from 'axios'

const ytdl = ElysiaRuntime.ytdl;
const fallbackToMp3Buffer = ElysiaRuntime.fallbackToMp3Buffer;

const pluginConfig = {
    name: "playelysia",
    alias: ["yp"],
    category: "download",
    description: "playelysia",
    usage: ".playelysia",
    example: ".playelysia",
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

  const fmtNum = n => new Intl.NumberFormat('id-ID').format(Number(n) || 0)

  async function findVideo(query) {
      if (isYtUrl(query)) {
          const id = ytId(query)
          if (!id) throw new Error('Link YouTube tidak valid')
          const v = await yts({ videoId: id })
          if (!v) throw new Error('Video tidak ditemukan')
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
      if (!v) throw new Error('Lagu tidak ditemukan')
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
          console.error('[PLAYElysia Assistant] izuka:', e.message)
      }

      try {
          const r = await ytdl(url, 'mp3')
          if (r?.status && r?.dl) yield { name: 'ytdl', dl: r.dl }
          else console.error('[PLAYElysia Assistant] ytdl:', r?.mess || 'tidak ada link')
      } catch (e) {
          console.error('[PLAYElysia Assistant] ytdl:', e.message)
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
          throw new Error('link download bukan file audio')
      }
      return Buffer.from(res.data)
  }

  async function getAudioBuffer(url) {
      const errors = []

      for await (const src of audioSources(url)) {
          try {
              const buf = await fetchBuffer(src.dl)
              if (buf.length < 10 * 1024) throw new Error('file terlalu kecil')

              const kind = sniffAudio(buf)
              if (kind === 'mp3') return buf

              if (kind) {
                  const mp3 = await fallbackToMp3Buffer(src.dl)
                  if (mp3?.length > 10 * 1024) return Buffer.from(mp3)
              }
              throw new Error('isi file bukan audio')
          } catch (e) {
              console.error(`[PLAYElysia Assistant] ${src.name} gagal:`, e.message)
              errors.push(`${src.name}: ${String(e.message).slice(0, 60)}`)
          }
      }

      throw new Error('Semua sumber download gagal' + (errors.length ? ` (${errors.join('; ')})` : ''))
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
              `🎵 *PLAY Elysia Assistant*\n\n` +
              `> Contoh: ${p}${command} multo\n` +
              `> Contoh: ${p}${command} https://youtube.com/watch?v=xxxxx`
          )
      }

      await m.react('🎧')

      try {
          await m.reply('🎵 *Elysia Assistant MD:* Darling~ lagi nyari lagunya ya... tunggu sebentar 🦋')

          const video = await findVideo(query)

          await m.reply(
              `📥 *Downloading:* ${video.title}\n` +
              `⏱️ *Durasi:* ${video.timestamp}\n\n` +
              `Tunggu bentar lagi ya darling~`
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
              `🦋 *Elysia Assistant MD:* Selamat menikmati darling~ jangan lupa putar ulang kalo suka! 💕`

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
          console.error('[PlayElysia Assistant]', err)
          await m.react('❌')

          const msg = String(err?.message || err)

          if (msg.includes('getaddrinfo') || msg.includes('ENOTFOUND')) {
              return m.reply('❌ *Error:* Koneksi internet bermasalah, coba lagi ya darling~ 🗿')
          }
          if (msg.toLowerCase().includes('signature')) {
              return m.reply('❌ *Error:* YouTube lagi update, coba lagi nanti ya darling~ 🦋')
          }
          if (/Command failed|ffmpeg/i.test(msg)) {
              return m.reply('❌ *Error:* Gagal memproses audio (sumber download lagi bermasalah), coba lagi nanti ya darling~ 🦋')
          }
          return m.reply(`❌ *Error:* ${msg.substring(0, 150)}\n\n> Coba lagi nanti ya darling~`)
      }
  }

export { pluginConfig as config, handler }
