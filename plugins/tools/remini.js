/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "remini",
    alias: ["hdvideo"],
    category: "tools",
    description: "hdvideo",
    usage: ".hdvideo",
    example: ".hdvideo",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

  const execFileAsync = promisify(execFile)

  const MAX_BYTES = 50 * 1024 * 1024
  const MAX_SECONDS = 60
  const MAX_LONG_SIDE = 1920
  const FFMPEG_TIMEOUT = 8 * 60 * 1000
  const DOC_THRESHOLD = 45 * 1024 * 1024

  let busy = false

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const formatDuration = (seconds) => {
    const s = Math.max(0, Math.round(seconds || 0))
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  const parseFps = (rate) => {
    const mt = String(rate || '').match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/)
    if (!mt || !Number(mt[2])) return null
    const v = Number(mt[1]) / Number(mt[2])
    return v > 0 ? Math.round(v * 100) / 100 : null
  }

  const probe = async (file) => {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'error',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      file
    ], { maxBuffer: 10 * 1024 * 1024, timeout: 60000 })

    const data = JSON.parse(stdout || '{}')
    const streams = data.streams || []
    const v = streams.find(s => s.codec_type === 'video')
    if (!v || !v.width || !v.height) throw new Error('No se puede leer el vídeo (no tiene pista de vídeo).')

    return {
      width: Number(v.width),
      height: Number(v.height),
      fps: parseFps(v.avg_frame_rate) || parseFps(v.r_frame_rate),
      duration: parseFloat(data.format?.duration || v.duration || 0) || 0,
      audio: streams.some(s => s.codec_type === 'audio')
    }
  }

  const targetSize = (w, h) => {
    const long = Math.max(w, h)
    const scale = Math.min(2, MAX_LONG_SIDE / long)
    if (scale <= 1) return { w, h, scaled: false }
    const even = n => Math.max(2, Math.round(n / 2) * 2)
    return { w: even(w * scale), h: even(h * scale), scaled: true }
  }

  const runFfmpeg = (input, output, filter, hasAudio) => execFileAsync('ffmpeg', [
    '-y', '-hide_banner', '-nostdin',
    '-loglevel', 'error',
    '-i', input,
    '-vf', filter,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p',
    ...(hasAudio ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']),
    '-movflags', '+faststart',
    output
  ], { maxBuffer: 10 * 1024 * 1024, timeout: FFMPEG_TIMEOUT })

  async function handler(m, { sock, conn, usedPrefix, command, reply }) {
    const client = sock || conn
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mtype || ''

    if (!/video|gif/.test(mime)) {
      return reply(
        `🎞️ *VÍDEO HD*\n\n` +
        `Responde o envía un vídeo con el texto:\n` +
        `• \`${usedPrefix + command}\`\n\n` +
        `El vídeo se amplía hasta 2x (máx. Full HD), se enfoca, se le reduce el ruido y los colores se ven más vivos.\n\n` +
        `_Límite: ${formatBytes(MAX_BYTES)}, duración máxima ${MAX_SECONDS} segundos. Es un filtro de ffmpeg, no IA, así que da mejores resultados en vídeos de poca resolución o algo borrosos._`
      )
    }

    if (busy) return reply('⏳ Todavía se está procesando otro vídeo. Inténtalo de nuevo en un momento.')
    busy = true

    const id = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
    const tmpIn = path.join(os.tmpdir(), `hdv_in_${id}.mp4`)
    const tmpOut = path.join(os.tmpdir(), `hdv_out_${id}.mp4`)
    const started = Date.now()

    try {
      let media
      if (typeof q.download === 'function') media = await q.download()
      else if (typeof client?.downloadMediaMessage === 'function') media = await client.downloadMediaMessage(q)

      if (!media || !Buffer.isBuffer(media)) {
        return reply('❌ No se pudo descargar el vídeo. Comprueba que se pueda reproducir.')
      }
      if (media.length > MAX_BYTES) {
        return reply(`❌ El vídeo es demasiado grande (${formatBytes(media.length)}). Máximo ${formatBytes(MAX_BYTES)}.`)
      }

      await fs.promises.writeFile(tmpIn, media)

      let meta
      try {
        meta = await probe(tmpIn)
      } catch (e) {
        if (e?.code === 'ENOENT') return reply('❌ ffmpeg/ffprobe no está instalado en el servidor del bot.')
        throw e
      }

      if (meta.duration > MAX_SECONDS) {
        return reply(`❌ El vídeo dura demasiado (${formatDuration(meta.duration)}). Máximo ${MAX_SECONDS} segundos.`)
      }

      await reply(global.mess?.wait || '⏳ Procesando el vídeo, un momento...')

      const t = targetSize(meta.width, meta.height)
      const scale = t.scaled ? `scale=${t.w}:${t.h}:flags=lanczos,` : ''
      const chains = [
        `${scale}hqdn3d=1:0.8:6:6,unsharp=5:5:0.8:5:5:0.4,eq=contrast=1.06:saturation=1.10:brightness=0.02`,
        `${scale}unsharp=5:5:0.8:5:5:0.4`,
        t.scaled ? `scale=${t.w}:${t.h}:flags=bicubic` : 'null'
      ]

      let lastErr = null
      for (const [i, chain] of chains.entries()) {
        try {
          await runFfmpeg(tmpIn, tmpOut, chain, meta.audio)
          if (fs.existsSync(tmpOut) && fs.statSync(tmpOut).size > 1024) { lastErr = null; break }
          throw new Error('El vídeo resultante está vacío.')
        } catch (e) {
          lastErr = e
          console.warn(`[HDVIDEO] filtro #${i + 1} fallar:`, String(e?.stderr || e?.message || e).slice(0, 200))
          await fs.promises.unlink(tmpOut).catch(() => null)
        }
      }
      if (lastErr) throw new Error('Fallaron todos los filtros de ffmpeg. Prueba con otro vídeo.')

      const out = await probe(tmpOut)
      const outBuffer = await fs.promises.readFile(tmpOut)
      const took = ((Date.now() - started) / 1000).toFixed(1)

      const caption =
        `🎞️ *VÍDEO HD*\n\n` +
        `• 📐 *Resolusi:* \`${meta.width}x${meta.height} ➔ ${out.width}x${out.height}\`\n` +
        `• ⏱️ *Duración:* \`${formatDuration(out.duration)}\`${out.fps ? `  • 🎬 *FPS:* \`${out.fps}\`` : ''}\n` +
        `• 📦 *Tamaño:* \`${formatBytes(media.length)} ➔ ${formatBytes(outBuffer.length)}\`\n` +
        `• ⚙️ *Proceso:* \`${took}s\`` +
        (t.scaled ? '' : `\n\n_El vídeo ya es Full HD o más, así que solo se enfoca sin ampliarlo._`)

      if (outBuffer.length > DOC_THRESHOLD) {
        return await client.sendMessage(m.chat, {
          document: outBuffer,
          mimetype: 'video/mp4',
          fileName: `hd_${Date.now()}.mp4`,
          caption
        }, { quoted: m })
      }

      return await client.sendMessage(m.chat, { video: outBuffer, mimetype: 'video/mp4', caption }, { quoted: m })
    } catch (err) {
      console.error('[HDVIDEO ERROR]', err)
      return reply(`❌ No se pudo procesar el vídeo: ${err?.message || err}`)
    } finally {
      busy = false
      await fs.promises.unlink(tmpIn).catch(() => null)
      await fs.promises.unlink(tmpOut).catch(() => null)
    }
  }

export { pluginConfig as config, handler }
