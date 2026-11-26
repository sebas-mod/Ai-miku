/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

const igDownloadAuto = ElysiaRuntime.igDownloadAuto;

const pluginConfig = {
    name: "igaudio",
    alias: ["igmp3"],
    category: "download",
    description: "igaudio",
    usage: ".igaudio",
    example: ".igaudio",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const run = (cmd) => new Promise((resolve, reject) => exec(cmd, (err, _o, stderr) => err ? reject(new Error(stderr || err.message)) : resolve()))

  async function handler(m, { conn, text, usedPrefix, command }) {
    if (!text) throw `Ejemplo:\n${usedPrefix + command} https://www.instagram.com/reel/xxxxx/`

    const tmpDir = path.join(process.cwd(), 'database', 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
    const id = `${Date.now()}_${Math.floor(Math.random() * 100000)}`
    const inPath = path.join(tmpDir, `igaudio_${id}.mp4`)
    const outPath = path.join(tmpDir, `igaudio_${id}.mp3`)

    await m.react('🕒')

    try {
      const res = await igDownloadAuto(text.trim(), 'fastdl')
      const video = res.media.find(v => v.type === 'Video')
      if (!video) throw 'Audio no disponible, este enlace no contiene un video/reel.'

      const { data } = await axios.get(video.url, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } })
      fs.writeFileSync(inPath, Buffer.from(data))

      await run(`ffmpeg -hide_banner -loglevel error -y -i "${inPath}" -vn -ac 2 -ar 44100 -c:a libmp3lame -b:a 192k "${outPath}"`)

      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(outPath),
        mimetype: 'audio/mpeg'
      }, { quoted: m })
      await m.react('✅')
    } catch (e) {
      console.log(e)
      await m.react('❌')
      m.reply(typeof e === 'string' ? e : `❌ Error al obtener el audio de Instagram.\n> ${e?.message || ''}`)
    } finally {
      try { fs.unlinkSync(inPath) } catch {}
      try { fs.unlinkSync(outPath) } catch {}
    }
  }

export { pluginConfig as config, handler }
