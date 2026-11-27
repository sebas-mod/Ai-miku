/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { unlinkSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { exec } from 'child_process'

const pluginConfig = {
    name: "echo",
    alias: [],
    category: "audio",
    description: "echo",
    usage: ".echo",
    example: ".echo",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

const { join } = (await import('path'))
async function handler(m, { conn, sock, usedPrefix, command, reply }) {
    const client = conn || sock
    try {
      let q = m.quoted ? m.quoted : m
      let mime = (q.msg || q).mimetype || q.mimetype || q.mediaType || (q.msg || q).mtype || q.mtype || ""
      if (q.mtype === "audioMessage" || q.msg?.audioMessage || q.message?.audioMessage) {
        mime = mime || "audio/mp4"
      }

      if (!/audio/.test(mime)) {
        return (reply || m.reply)(`*[INFO] Responde a un audio o nota de voz con el comando ${usedPrefix + command}*`)
      }

      let tmpDir = join(process.cwd(), 'database', 'tmp')
      if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true })

      let getRandom = (ext) => `${Math.floor(Math.random() * 100000)}_${Date.now()}${ext}`
      let inputPath = join(tmpDir, getRandom(".mp3"))
      let outputPath = join(tmpDir, getRandom(".mp3"))

      let media = null
      if (typeof q.download === "function") {
        media = await q.download().catch(() => null)
      }
      if (!media && typeof m.quoted?.download === "function") {
        media = await m.quoted.download().catch(() => null)
      }

      if (typeof media === "string") {
        inputPath = media
      } else if (Buffer.isBuffer(media)) {
        writeFileSync(inputPath, media)
      } else {
        return (reply || m.reply)("❌ No se pudo descargar el audio. ¡Responde a un mensaje de audio o nota de voz!")
      }

      const ffmpegFilter = "-af aecho=0.8:0.9:1000:0.3"
      exec(`ffmpeg -hide_banner -loglevel error -y -i "${inputPath}" ${ffmpegFilter} "${outputPath}"`, async (err) => {
        try {
          try { unlinkSync(inputPath) } catch {}
          if (err) return (reply || m.reply)("❌ ¡No se pudo procesar el efecto de audio!")

          let buff = readFileSync(outputPath)
          await client.sendMessage(m.chat, {
            audio: buff,
            mimetype: "audio/mpeg",
            ptt: false
          }, { quoted: m })

          try { unlinkSync(outputPath) } catch {}
        } catch {
          (reply || m.reply)("Error processing audio file")
        }
      })
    } catch (e) {
      console.error(e);
      (reply || m.reply)("❌ Ocurrió un error en la función de efectos de audio.")
    }
  }

export { pluginConfig as config, handler }
