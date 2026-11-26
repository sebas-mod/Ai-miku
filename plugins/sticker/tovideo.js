/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const webp2mp4 = MikuRuntime.webp2mp4;
const ffmpeg = MikuRuntime.ffmpeg;

const pluginConfig = {
    name: "tovideo",
    alias: ["tovid", "s2vid"],
    category: "sticker",
    description: "tovideo",
    usage: ".tovideo",
    example: ".tovideo",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn, usedPrefix, command }) {
      if (!m.quoted) throw `Balas stiker/audio yang ingin diubah menjadi video dengan perintah ${usedPrefix + command}`
      let mime = m.quoted.mimetype || ''
      if (!/webp|audio/.test(mime)) throw `Balas stiker/audio yang ingin diubah menjadi video dengan perintah ${usedPrefix + command}`
      let media = await m.quoted.download()
      let out = Buffer.alloc(0)
      if (/webp/.test(mime)) {
          out = await webp2mp4(media)
      } else if (/audio/.test(mime)) {
          out = await ffmpeg(media, [
              '-filter_complex', 'color',
              '-pix_fmt', 'yuv420p',
              '-crf', '51',
              '-c:a', 'copy',
              '-shortest'
          ], 'mp3', 'mp4')
      }
      await conn.sendFile(m.chat, out, 'out.mp4', '*DONE*', m, 0, { thumbnail: out })
  }

export { pluginConfig as config, handler }
