/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { getCurrent } from './setch.js'

const pluginConfig = {
    name: "upch",
    alias: [],
    category: "channel",
    description: "upch <teks> / reply media",
    usage: ".upch <teks> / reply media",
    example: ".upch <teks> / reply media",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  function buildNode(to, id, contenttype, content) {
      return {
          tag: 'message',
          attrs: { to, id, type: 'media' },
          content: [
              { tag: 'meta', attrs: { contenttype } },
              { tag: 'plaintext', attrs: { mediatype: contenttype }, content }
          ]
      }
  }

  async function handler(m, { sock, text, prefix, reply }) {
      const target = global.idch || getCurrent()?.id
      if (!target) return reply(`Tujuan belum diatur. Isi global.idch di config.js atau pakai ${prefix || '.'}setch <link saluran>.`)

      const { prepareWAMessageMedia, generateMessageIDV2, proto } = await import('@rexxhayanasi/elaina-baileys')
      let node

      try {
          if (m.quoted) {
              const mime = m.quoted.mimetype || ''
              const caption = text || ''
              const isMedia = /^(image|video|audio)/.test(mime)
              const buffer = isMedia ? await m.quoted.download() : null

              if (mime.startsWith('image') || mime.startsWith('video')) {
                  const type = mime.startsWith('image') ? 'image' : 'video'
                  const obj = { [type]: buffer }
                  if (caption) obj.caption = caption
                  const msg = await prepareWAMessageMedia(obj, { upload: sock.waUploadToServer, jid: '@newsletter' })
                  node = buildNode(target, generateMessageIDV2(), type, proto.Message.encode(msg).finish())
              } else if (mime.startsWith('audio')) {
                  const waveform = Buffer.from(Array.from({ length: 100 }, () => Math.floor(Math.random() * 100)))
                  const msg = await prepareWAMessageMedia(
                      { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true, waveform },
                      { upload: sock.waUploadToServer, jid: '@newsletter' }
                  )
                  node = buildNode(target, generateMessageIDV2(), 'audio', proto.Message.encode(msg).finish())
              } else {
                  const txt = text || m.quoted.text || ''
                  if (!txt) return reply('Kirim teks, atau reply ke foto/video/audio (bisa dengan caption)')
                  node = buildNode(target, generateMessageIDV2(), 'text', proto.Message.encode({ extendedTextMessage: { text: txt } }).finish())
              }
          } else if (text) {
              node = buildNode(target, generateMessageIDV2(), 'text', proto.Message.encode({ extendedTextMessage: { text } }).finish())
          } else {
              return reply('Kirim teks, atau reply ke foto/video/audio (bisa dengan caption)')
          }

          await sock.query(node)

          let url = ''
          try {
              const meta = await sock.newsletterMetadata('jid', target)
              if (meta?.thread_metadata?.invite) url = `https://whatsapp.com/channel/${meta.thread_metadata.invite}`
          } catch {}
          return reply(`*UP CHANNEL SUKSES!*${url ? `\n\n> cek di: ${url}` : ''}`)
      } catch (e) {
          console.error('[UPCH]', e)
          return reply(`Gagal upload ke saluran: ${e.message || e}`)
      }
  }

export { pluginConfig as config, handler }
