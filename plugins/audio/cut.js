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
import { spawn } from 'child_process'

const pluginConfig = {
    name: "cut",
    alias: [],
    category: "audio",
    description: "cutaudio",
    usage: ".cutaudio",
    example: ".cutaudio",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

const { join } = (await import('path'))
const TIME_REGEX = /^(\d{1,2}:)?[0-5]?\d:[0-5]\d(\.\d+)?$|^\d+(\.\d+)?$/

  async function handler(m, { conn, sock, args, usedPrefix, command, reply }) {
      const client = conn || sock
      try {
          let q = m.quoted ? m.quoted : m
          let mime = (q.msg || q).mimetype || q.mimetype || q.mediaType || (q.msg || q).mtype || q.mtype || ''
          if (q.mtype === 'audioMessage' || q.msg?.audioMessage || q.message?.audioMessage) {
              mime = mime || 'audio/mp4'
          }

          if (!/audio/.test(mime)) {
              return (reply || m.reply)(`Responde a la nota de voz/audio que quieres modificar con el texto *${usedPrefix + command}*`)
          }

          if (!args[0] || !args[1] || !TIME_REGEX.test(args[0].trim()) || !TIME_REGEX.test(args[1].trim())) {
              return (reply || m.reply)(`¡Formato de tiempo no válido!\nEjemplo: *${usedPrefix + command} 00:00:10 00:00:30*`)
          }

          const startPos = args[0].trim()
          const duration = args[1].trim()

          let tmpDir = join(process.cwd(), 'database', 'tmp')
          if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true })

          let getRandom = (ext) => `${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`
          let inputPath = join(tmpDir, getRandom('.mp3'))
          let outputPath = join(tmpDir, getRandom('.mp3'))

          let media = null
          if (typeof q.download === 'function') {
              media = await q.download().catch(() => null)
          }
          if (!media && typeof m.quoted?.download === 'function') {
              media = await m.quoted.download().catch(() => null)
          }
          if (!media && client?.downloadAndSaveMediaMessage) {
              media = await client.downloadAndSaveMediaMessage(q).catch(() => null)
          }
          if (!media && client?.downloadMediaMessage) {
              media = await client.downloadMediaMessage(q).catch(() => null)
          }

          if (typeof media === 'string') {
              inputPath = media
          } else if (Buffer.isBuffer(media)) {
              writeFileSync(inputPath, media)
          } else {
              return (reply || m.reply)('❌ No se pudo descargar el audio.')
          }

          const cleanup = () => {
              try { if (existsSync(inputPath)) unlinkSync(inputPath) } catch {}
              try { if (existsSync(outputPath)) unlinkSync(outputPath) } catch {}
          }

          const ff = spawn('ffmpeg', [
              '-hide_banner',
              '-loglevel', 'error',
              '-y',
              '-ss', startPos,
              '-i', inputPath,
              '-t', duration,
              '-c', 'copy',
              outputPath
          ])

          const timer = setTimeout(() => {
              try { ff.kill('SIGKILL') } catch {}
              cleanup();
              (reply || m.reply)('❌ El procesamiento del audio superó el tiempo límite.')
          }, 30000)

          ff.on('close', async (code) => {
              clearTimeout(timer)
              try {
                  if (code !== 0 || !existsSync(outputPath)) {
                      cleanup()
                      return (reply || m.reply)('❌ No se pudo recortar el audio.')
                  }

                  let buff = readFileSync(outputPath)
                  cleanup()

                  await client.sendMessage(m.chat, {
                      audio: buff,
                      mimetype: 'audio/mpeg',
                      ptt: false
                  }, { quoted: m })
              } catch {
                  cleanup();
                  (reply || m.reply)('Error processing file')
              }
          })

          ff.on('error', () => {
              clearTimeout(timer)
              cleanup();
              (reply || m.reply)('❌ No se pudo ejecutar FFmpeg.')
          })
      } catch (e) {
          console.error(e);
          (reply || m.reply)('❌ Ocurrió un error al cortar el audio.')
      }
  }

export { pluginConfig as config, handler }
