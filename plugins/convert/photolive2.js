/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { prepareWAMessageMedia, generateWAMessageFromContent } from "@rexxhayanasi/elaina-baileys"

const pluginConfig = {
    name: "photolive2",
    alias: [],
    category: "convert",
    description: "photolive2 (foto lalu video)",
    usage: ".photolive2 (foto lalu video)",
    example: ".photolive2 (foto lalu video)",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

const sessions = new Map()
const SESSION_TTL = 5 * 60 * 1000

function cleanupSessions() {
  const now = Date.now()
  for (const [key, val] of sessions) {
    if (now - val.timestamp > SESSION_TTL) sessions.delete(key)
  }
}

function pickMedia(m) {
  const ok = ["imageMessage", "videoMessage"]
  const mType = m.type || m.mtype || ""
  if (ok.includes(mType) && typeof m.download === "function") return { type: mType, download: () => m.download() }
  const qType = m.quoted?.type || m.quoted?.mtype || ""
  if (m.quoted && ok.includes(qType) && typeof m.quoted.download === "function") {
    return { type: qType, download: () => m.quoted.download() }
  }
  return null
}

async function handler(m, { sock, conn, usedPrefix = ".", prefix, command = "photolive2" }) {
  const client = conn || sock
  cleanupSessions()

  const p = (prefix || usedPrefix || ".") + command
  const sender = m.sender
  const session = sessions.get(sender)
  const target = pickMedia(m)

  if (!target) {
    if (session) {
      const sisa = Math.ceil((SESSION_TTL - (Date.now() - session.timestamp)) / 60000)
      return m.reply(
        `✅ *Paso 1 completado* — La imagen de portada se ha guardado.\n\n` +
        `Ahora envía o responde un *video* con el comando *${p}*\n` +
        `_(La sesión termina en ${sisa} minuto)_`
      )
    }
    return m.reply(
      `📸 *CUSTOM LIVE PHOTO BUILDER*\n\n` +
      `Combina la foto de portada y el vídeo que hayas elegido en una *Live Photo* WhatsApp.\n\n` +
      `📌 *Langkah Penggunaan:*\n` +
      `1. Enviar/responder *foto* con el comando \`${p}\`\n` +
      `2. Enviar/responder *video* con el comando \`${p}\``
    )
  }

  if (target.type === "imageMessage") {
    await m.react("⏳")
    try {
      const image = await target.download()
      sessions.set(sender, { image, timestamp: Date.now() })
      await m.react("✅")
      return m.reply(
        `✅ *¡Foto de portada guardada exitosamente!*\n\n` +
        `A continuación, envía o responde un *video* con el comando *${p}*\n` +
        `_(Límite de tiempo de la sesión 5 minutos)_`
      )
    } catch (e) {
      await m.react("❌")
      return m.reply(`❌ *No se pudo descargar la imagen:* ${e.message}`)
    }
  }

  if (target.type === "videoMessage") {
    if (!session) {
      return m.reply(`⚠️ Aún no se ha guardado ninguna foto de portada.\nEnvía o responde a *foto* primero con el comando *${p}*.`)
    }

    await m.react("⏳")
    sessions.delete(sender)

    try {
      const videoBuffer = await target.download()

      const [imageMedia, videoMedia] = await Promise.all([
        prepareWAMessageMedia({ image: session.image }, { upload: client.waUploadToServer }),
        prepareWAMessageMedia({ video: videoBuffer }, { upload: client.waUploadToServer })
      ])

      const imgMsg = generateWAMessageFromContent(
        m.chat,
        {
          imageMessage: {
            ...imageMedia.imageMessage,
            contextInfo: {
              pairedMediaType: 5,
              statusSourceType: 0
            }
          }
        },
        { userJid: client.user.id }
      )

      await client.relayMessage(m.chat, imgMsg.message, { messageId: imgMsg.key.id })

      await client.relayMessage(
        m.chat,
        {
          videoMessage: {
            ...videoMedia.videoMessage,
            contextInfo: {
              pairedMediaType: 6,
              statusSourceType: 0
            }
          },
          messageContextInfo: {
            messageAssociation: {
              associationType: 12,
              parentMessageKey: imgMsg.key
            }
          }
        },
        {}
      )

      await m.react("✅")
    } catch (e) {
      await m.react("❌")
      return m.reply(`❌ *No se pudo crear Live Photo:* ${e.message}`)
    }
  }
}

export { pluginConfig as config, handler }
