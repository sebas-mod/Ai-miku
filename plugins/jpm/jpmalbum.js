/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import crypto from 'crypto'
import { generateWAMessage, generateWAMessageFromContent, jidNormalizedUser } from '@rexxhayanasi/elaina-baileys'

const jpmGroups = MikuRuntime.jpmGroups;
const jpmCfg = MikuRuntime.jpmCfg;
const jpmLoop = MikuRuntime.jpmLoop;
const getMedia = MikuRuntime.getMedia;

const pluginConfig = {
    name: "jpmalbum",
    alias: ["jpmab", "jaseralbum"],
    category: "jpm",
    description: "Fitur jpm jpmalbum",
    usage: ".jpmalbum",
    example: ".jpmalbum",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const MAX = 10
  const buf = () => (global.__jpmAlbum ||= [])

  async function sendAlbum(sock, groupId, list, caption) {
      const userJid = jidNormalizedUser(sock.user.id)
      const opener = generateWAMessageFromContent(groupId, {
          messageContextInfo: { messageSecret: crypto.randomBytes(32) },
          albumMessage: {
              expectedImageCount: list.filter(v => v.kind === 'image').length,
              expectedVideoCount: list.filter(v => v.kind === 'video').length
          }
      }, { userJid, upload: sock.waUploadToServer })
      await sock.relayMessage(opener.key.remoteJid, opener.message, { messageId: opener.key.id })

      for (const [i, media] of list.entries()) {
          const msg = await generateWAMessage(groupId, {
              [media.kind]: media.buffer,
              caption: i === 0 ? caption : '',
              mimetype: media.mime || (media.kind === 'video' ? 'video/mp4' : 'image/jpeg')
          }, { upload: sock.waUploadToServer })
          msg.message.messageContextInfo = {
              messageSecret: crypto.randomBytes(32),
              messageAssociation: { associationType: 1, parentMessageKey: opener.key }
          }
          await sock.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
      }
  }

  async function handler(m, { sock, text, prefix, reply }) {
      const [first = '', ...rest] = String(text || '').trim().split(/\s+/)
      const act = first.toLowerCase()

      if (act === 'add') {
          const media = await getMedia(m)
          if (!media) return reply(`❌ Respondedor de foto/vídeo *${prefix}jpmalbum agregar*.`)
          if (buf().length >= MAX) return reply(`❌ Album penuh (maks ${MAX} medios de comunicación).`)
          buf().push(media)
          return reply(`✅ Medios agregados. Cola de álbumes: ${buf().length}/${MAX}\nEnviar con *${prefix}jpmalbum <título>*`)
      }
      if (act === 'reset') { global.__jpmAlbum = []; return reply('✅ Antrean album dikosongkan.') }
      if (act === 'list') return reply(`*▢ ANTREAN ALBUM*\n• MEDIOS: ${buf().length}/${MAX}`)

      const list = [...buf()]
      const quoted = await getMedia(m)
      if (quoted && !list.length) list.push(quoted)
      if (!list.length) return reply(`*▢ JPM ALBUM*\n\n1. Lo último en respuesta de foto/vídeo *${prefix}jpmalbum add* (repetir por medio)\n2. Enviar: *${prefix}jpmalbum <título>*\n\nO responder a un medio directamente con *${prefix}jpmalbum <título>*.`)
      if (global.__jpmRunning) return reply('❌ JPM se está ejecutando. Escriba *stopjpm* para detener.')

      const caption = [first, ...rest].join(' ').trim()
      const groups = await jpmGroups(sock)
      if (!groups.length) return reply('❌ No hay grupos a los que acudir.')
      const delay = jpmCfg().delayJpm
      await reply(`*▢ JPM ALBUM*\n• Medios: ${list.length}\n• Objetivos: ${groups.length} grupo\n• Demora: ${delay}EM\n\nPara con *stopjpm*`)

      const { ok, fail } = await jpmLoop(groups, delay, g => sendAlbum(sock, g.id, list, caption))
      global.__jpmAlbum = []
      return reply(`*▢ JPM ALBUM SELESAI*\n• Tener éxito: ${ok} grupo\n• Fallar: ${fail} grupo`)
  }

export { pluginConfig as config, handler }
