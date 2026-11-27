/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { parseRef, metadata, getCurrent, assertCanPost, explain } from './setch.js'

const pickMedia = MikuRuntime.pickMedia;
const reactTo = MikuRuntime.reactTo;

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
              `⭕ *REDONDO VIDEO (PTV) AL CANAL*\n\n` +
              `Concursantes de fotografía/vídeo:\n` +
              `${p}${cmd} → ke saluran bawaan (.setch)\n` +
              `${p}${cmd} <id@newsletter / link saluran>\n\n` +
              `Ejemplo:\n${p}${cmd} 120363xxxxxxxxxxxxxxx@newsletter`
          )
      }

      let channelId, channelLabel
      try {
          const raw = String(text || '').trim().split(/\s+/)[0]
          if (raw) {
              const ref = parseRef(raw) || (/^\d{15,}$/.test(raw) ? parseRef(`${raw}@newsletter`) : null)
              if (!ref) return reply('ID/enlace de canal no válido!\nEjemplo: 120363xxxxxxxxxxxxxx@newsletter')
              if (ref.type === 'jid') { channelId = ref.jid; channelLabel = ref.jid }
              else { const md = await metadata(sock, ref); channelId = md.id; channelLabel = md.name; assertCanPost(md) }
          } else {
              const cur = getCurrent()
              if (!cur) return reply(`Aún no hay ningún canal de destino. Escribe el ID/enlace del canal, o configúralo primero: ${p}establecer <enlace de canal>`)
              channelId = cur.id; channelLabel = cur.name
              assertCanPost(cur)
          }
      } catch (err) {
          return reply(`❌ ${explain(err)}`)
      }

      await reactTo(sock, m, '⏳')

      try {
          const buffer = await media.download()
          if (!Buffer.isBuffer(buffer) || buffer.length < 1000) throw new Error('No se pudo descargar el medio.')
          if (buffer.length > MAX_SIZE) throw new Error('¡El archivo es demasiado grande! Máximo 50 MB.')

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
          return reply(`✅Video redondo enviado al canal*${channelLabel}*.`)
      } catch (err) {
          console.error('[CHPTV ERROR]', err)
          await reactTo(sock, m, '❌')
          return reply(`❌ No se pudo enviar el video redondo al canal.\n\n> ${err.message || err}`)
      }
  }

export { pluginConfig as config, handler }
