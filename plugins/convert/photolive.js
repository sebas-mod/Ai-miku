/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import fs from "fs"
import path from "path"
import { execFile } from "child_process"
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
import { prepareWAMessageMedia, generateWAMessageFromContent } from "@rexxhayanasi/elaina-baileys"

const pluginConfig = {
    name: "photolive",
    alias: [],
    category: "convert",
    description: "photolive (reply video)",
    usage: ".photolive (reply video)",
    example: ".photolive (reply video)",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

const ffmpegBin = ffmpegInstaller?.path || "ffmpeg"

function pickVideo(m) {
  const mType = m.type || m.mtype || ""
  if (mType === "videoMessage" && typeof m.download === "function") return { download: () => m.download() }
  const qType = m.quoted?.type || m.quoted?.mtype || ""
  if (qType === "videoMessage" && typeof m.quoted?.download === "function") return { download: () => m.quoted.download() }
  return null
}

function firstFrame(videoBuffer) {
  return new Promise((resolve, reject) => {
    const tmpDir = path.join(process.cwd(), "database", "tmp")
    fs.mkdirSync(tmpDir, { recursive: true })
    const id = `${Date.now()}_${Math.floor(Math.random() * 100000)}`
    const input = path.join(tmpDir, `photolive_${id}.mp4`)
    const output = path.join(tmpDir, `photolive_${id}.jpg`)
    const cleanup = () => {
      for (const f of [input, output]) {
        try { fs.unlinkSync(f) } catch {}
      }
    }

    fs.writeFileSync(input, videoBuffer)
    execFile(ffmpegBin, ["-y", "-i", input, "-frames:v", "1", "-q:v", "2", output], { timeout: 60000 }, (err) => {
      try {
        if (err || !fs.existsSync(output)) throw err || new Error("No se pudo capturar el cuadro inicial del vídeo.")
        const img = fs.readFileSync(output)
        cleanup()
        resolve(img)
      } catch (e) {
        cleanup()
        reject(e)
      }
    })
  })
}

async function handler(m, { sock, conn, usedPrefix = ".", prefix, command = "photolive" }) {
  const client = conn || sock
  const p = (prefix || usedPrefix || ".") + command
  const target = pickVideo(m)

  if (!target) {
    return m.reply(
      `📸 *LIVE PHOTO CONVERTER*\n\n` +
      `Cambie el vídeo corto a *Live Photo* WhatsApp (foto tomada automáticamente desde el primer fotograma).\n\n` +
      `📌 *Cara Pakai:*\n` +
      `Envía o responde al vídeo con el título \`${p}\``
    )
  }

  await m.react("⏳")
  try {
    const videoBuffer = await target.download()
    if (!videoBuffer?.length) throw new Error("No se pudo descargar el video.")

    const image = await firstFrame(videoBuffer)

    const [imageMedia, videoMedia] = await Promise.all([
      prepareWAMessageMedia({ image }, { upload: client.waUploadToServer }),
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

export { pluginConfig as config, handler }
