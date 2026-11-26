/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "getsw",
    alias: [],
    category: "tools",
    description: "getsw",
    usage: ".getsw",
    example: ".getsw",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  function detectMime(buf) {
      if (!buf || buf.length < 12) return 'application/octet-stream'
      const hex = buf.slice(0, 12).toString('hex')

      if (buf.slice(4, 8).toString() === 'ftyp') {
          const brand = buf.slice(8, 12).toString()
          if (/^(qt)/.test(brand)) return 'video/quicktime'
          if (/^3g/.test(buf.slice(8, 10).toString())) return 'video/3gpp'
          return 'video/mp4'
      }
      if (hex.startsWith('1a45dfa3')) return 'video/webm'

      if (hex.startsWith('ffd8ff')) return 'image/jpeg'
      if (hex.startsWith('89504e47')) return 'image/png'
      if (buf.slice(0, 4).toString() === 'GIF8') return 'image/gif'
      if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'image/webp'

      if (buf.slice(0, 3).toString() === 'ID3' || hex.startsWith('fffb')) return 'audio/mpeg'
      if (buf.slice(0, 4).toString() === 'OggS') return 'audio/ogg'
      if (buf.slice(4, 8).toString() === 'ftyp' && /^M4A/.test(buf.slice(8, 11).toString())) return 'audio/mp4'

      return 'application/octet-stream'
  }

  function extFromMime(mime) {
      const map = {
          'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov', 'video/3gpp': '3gp',
          'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
          'audio/mpeg': 'mp3', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a'
      }
      return map[mime] || 'bin'
  }

  async function handler(m, { sock, jid, reply }) {
      const q = m.quoted

      if (!q) {
          return reply('Reply status grup / status WhatsApp yang mau diambil ya kak~ 📥')
      }

      const msgObj = q.message || q.msg || q
      const contentType = q.content || q.type || q.mtype || (msgObj && Object.keys(msgObj)[0])

      const isStatus = /status/i.test(String(contentType))
      const isMedia = q.isMedia || q.mediaKey || msgObj?.videoMessage || msgObj?.imageMessage

      if (!isStatus && !isMedia) {
          return reply(
              '❌ Pesan yang di-reply bukan status!\n\n' +
              '> Pastikan kamu me-reply (swipe) pesan **Status / Status Grup** yang berisi media (Video/Gambar).'
          )
      }

      let buffer
      try {
          if (typeof q.download === 'function') {
              buffer = await q.download('buffer')
          } else if (typeof sock.downloadMediaMessage === 'function') {
              buffer = await sock.downloadMediaMessage(q)
          } else {
              throw new Error('Fungsi download tidak ditemukan di framework.')
          }
      } catch (err) {
          console.error('[getsw] download error:', err.message)
          return reply('❌ Gagal download media status.\n> Kemungkinan ini *Status Pribadi* (Story) yang dibatasi WhatsApp, bukan Status Grup. Coba reply Status Grup ya~')
      }

      if (!buffer || !buffer.length) {
          return reply('❌ Media status kosong atau gagal diunduh.')
      }

      const mimetype = detectMime(buffer)

      try {
          if (mimetype.startsWith('video/')) {
              await sock.sendMessage(jid, {
                  video: buffer,
                  mimetype,
                  caption: '📥 *Status berhasil diambil*'
              }, { quoted: m })
          } else if (mimetype.startsWith('image/')) {
              await sock.sendMessage(jid, {
                  image: buffer,
                  mimetype,
                  caption: '📥 *Status berhasil diambil*'
              }, { quoted: m })
          } else if (mimetype.startsWith('audio/')) {
              await sock.sendMessage(jid, {
                  audio: buffer,
                  mimetype,
                  ptt: false
              }, { quoted: m })
          } else {
              await sock.sendMessage(jid, {
                  document: buffer,
                  mimetype: mimetype || 'application/octet-stream',
                  fileName: `status-${Date.now()}.${extFromMime(mimetype)}`
              }, { quoted: m })
          }
      } catch (err) {
          console.error('[getsw] send error:', err.message)
          await reply('❌ Gagal mengirim media status.')
      }
  }

export { pluginConfig as config, handler }
