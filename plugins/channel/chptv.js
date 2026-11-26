/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { parseRef, metadata, getCurrent, assertCanPost, explain } from './setch.js'

const pickMedia = ElysiaRuntime.pickMedia;
const reactTo = ElysiaRuntime.reactTo;

const pluginConfig = {
    name: "chptv",
    alias: [],
    category: "channel",
    description: "chptv <id/link saluran> (reply media)",
    usage: ".chptv <id/link saluran> (reply media)",
    example: ".chptv <id/link saluran> (reply media)",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const MAX_SIZE = 50 * 1024 * 1024

  async function handler(m, { sock, text, prefix, command, reply }) {
      const p = prefix || '.'
      const cmd = command || 'chptv'

      const media = pickMedia(m)
      if (!media || !/webp|image|video|gif|viewOnce/.test(media.mime)) {
          return reply(
              `⭕ *VIDEO BULAT (PTV) KE SALURAN*\n\n` +
              `Reply foto/video dengan:\n` +
              `${p}${cmd} → ke saluran bawaan (.setch)\n` +
              `${p}${cmd} <id@newsletter / link saluran>\n\n` +
              `Contoh:\n${p}${cmd} 120363xxxxxxxxxxxxxx@newsletter`
          )
      }

      let channelId, channelLabel
      try {
          const raw = String(text || '').trim().split(/\s+/)[0]
          if (raw) {
              const ref = parseRef(raw) || (/^\d{15,}$/.test(raw) ? parseRef(`${raw}@newsletter`) : null)
              if (!ref) return reply('ID/link saluran tidak valid!\nContoh: 120363xxxxxxxxxxxxxx@newsletter')
              if (ref.type === 'jid') { channelId = ref.jid; channelLabel = ref.jid }
              else { const md = await metadata(sock, ref); channelId = md.id; channelLabel = md.name; assertCanPost(md) }
          } else {
              const cur = getCurrent()
              if (!cur) return reply(`Belum ada saluran tujuan. Tulis id/link saluran, atau atur dulu: ${p}setch <link saluran>`)
              channelId = cur.id; channelLabel = cur.name
              assertCanPost(cur)
          }
      } catch (err) {
          return reply(`❌ ${explain(err)}`)
      }

      await reactTo(sock, m, '⏳')

      try {
          const buffer = await media.download()
          if (!Buffer.isBuffer(buffer) || buffer.length < 1000) throw new Error('Gagal mengunduh media.')
          if (buffer.length > MAX_SIZE) throw new Error('File terlalu besar! Maksimal 50MB.')

          const { prepareWAMessageMedia, generateMessageIDV2, proto } = await import('@rexxhayanasi/elaina-baileys')
          const prepared = await prepareWAMessageMedia(
              { video: buffer },
              { upload: sock.waUploadToServer, jid: channelId }
          )
          const payload = { ptvMessage: prepared.videoMessage }

          await sock.query({
              tag: 'message',
              attrs: { to: channelId, id: generateMessageIDV2(sock.user?.id), type: 'media' },
              content: [{ tag: 'plaintext', attrs: { mediatype: 'ptv' }, content: proto.Message.encode(payload).finish() }]
          })

          await reactTo(sock, m, '✅')
          return reply(`✅ Video bulat terkirim ke saluran *${channelLabel}*.`)
      } catch (err) {
          console.error('[CHPTV ERROR]', err)
          await reactTo(sock, m, '❌')
          return reply(`❌ Gagal kirim video bulat ke saluran.\n\n> ${err.message || err}`)
      }
  }

export { pluginConfig as config, handler }
