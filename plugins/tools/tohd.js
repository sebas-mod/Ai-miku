/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const pluginConfig = {
    name: "tohd",
    alias: [],
    category: "tools",
    description: "tohd <reply video / dokumen foto/video>",
    usage: ".tohd <reply video / dokumen foto/video>",
    example: ".tohd <reply video / dokumen foto/video>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const execFileAsync = promisify(execFile)

  const react = (sock, m, text) => sock.sendMessage(m.chat, { react: { text, key: m.key } }).catch(() => null)

  async function handler(m, { sock, reply, example }) {
      if (!m.quoted) return example('responder a un vídeo o documento (foto/vídeo)')

      const q = m.quoted
      const isVideo = q.mtype === 'videoMessage'

      if (q.mtype !== 'documentMessage' && !isVideo) {
          return reply(' ¡Responde un vídeo, o envía una foto/vídeo como *Documento*!')
      }

      const mime = (q.msg || q).mimetype || (isVideo ? 'video/mp4' : '')

      if (!mime.includes('image') && !mime.includes('video')) {
          return reply(' ¡El documento al que responde no es una foto ni un video!')
      }

      await react(sock, m, '⏳')
      reply(global.mess.wait)

      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const tempIn = path.join(os.tmpdir(), `swhd_in_${id}.mp4`)
      const tempOut = path.join(os.tmpdir(), `swhd_out_${id}.mp4`)

      try {
          const buffer = await q.download()
          if (!Buffer.isBuffer(buffer) || !buffer.length) throw new Error('No se pudo descargar el documento')

          if (mime.includes('image')) {
              await sock.sendMessage(m.chat, {
                  image: buffer,
                  caption: `乂  *SW HD*\n\nSiap di-forward ke status WhatsApp!`
              }, { quoted: m })
          } else {
              fs.writeFileSync(tempIn, buffer)

              await execFileAsync('ffmpeg', [
                  '-y', '-i', tempIn,
                  '-c:v', 'libx264', '-crf', '20', '-preset', 'slow',
                  '-c:a', 'aac', '-b:a', '128k',
                  '-vf', "scale='min(720,iw)':-2",
                  '-pix_fmt', 'yuv420p',
                  tempOut
              ])

              await sock.sendMessage(m.chat, {
                  video: fs.readFileSync(tempOut),
                  caption: `乂 *Proceso completado*`
              }, { quoted: m })
          }

          await react(sock, m, '')
      } catch (e) {
          console.error('[SWHD ERROR]', e)
          await react(sock, m, '')
          reply(' Ocurrió un error al procesar el documento.')
      } finally {
          for (const f of [tempIn, tempOut]) fs.promises.unlink(f).catch(() => null)
      }
  }

export { pluginConfig as config, handler }
