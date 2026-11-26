/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'

const pluginConfig = {
    name: "tovn",
    alias: [],
    category: "convert",
    description: "tovn (reply audio/video)",
    usage: ".tovn (reply audio/video)",
    example: ".tovn (reply audio/video)",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const FFMPEG_BIN = ffmpegInstaller?.path || 'ffmpeg'

async function downloadFromMsg(m, sock) {
  const q = m.quoted || m
  const mime = q.mimetype || q.msg?.mimetype || q.message?.[q.type]?.mimetype || ''
  if (typeof q.download === 'function') {
    const buf = await q.download().catch(() => null)
    if (buf && buf.length) return { buffer: buf, mime, quoted: q }
  }
  if (typeof m.download === 'function' && q === m) {
    const buf = await m.download().catch(() => null)
    if (buf && buf.length) return { buffer: buf, mime, quoted: m }
  }
  if (sock?.downloadMediaMessage) {
    const buf = await sock.downloadMediaMessage(q).catch(() => null)
    if (buf && buf.length) return { buffer: buf, mime, quoted: q }
  }
  return null
}

function convertToOpusVn(inputBuffer) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'elysia-vn-'))
  const inPath = path.join(dir, 'in.media')
  const outPath = path.join(dir, 'out.ogg')
  fs.writeFileSync(inPath, inputBuffer)

  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG_BIN, [
      '-y', '-i', inPath,
      '-vn', '-c:a', 'libopus',
      '-b:a', '64k', '-vbr', 'on',
      '-compression_level', '10',
      outPath
    ])
    let err = ''
    p.stderr.on('data', (d) => { err += d.toString() })
    p.on('error', (e) => { fs.rmSync(dir, { recursive: true, force: true }); reject(e) })
    p.on('close', (code) => {
      try {
        if (code !== 0 || !fs.existsSync(outPath)) throw new Error(err.split('\n').slice(-2).join(' ') || 'FFmpeg gagal membuat Voice Note.')
        const buf = fs.readFileSync(outPath)
        fs.rmSync(dir, { recursive: true, force: true })
        resolve(buf)
      } catch (e) {
        fs.rmSync(dir, { recursive: true, force: true })
        reject(e)
      }
    })
  })
}

async function handler(m, { conn, sock, usedPrefix = '.', command = 'tovn' }) {
  const client = conn || sock
  const media = await downloadFromMsg(m, client)
  if (!media || !/(audio|video)\//i.test(media.mime || '')) {
    return m.reply(`🎙️ Kirim atau reply audio/video dengan perintah *${usedPrefix + command}* untuk mengubahnya menjadi Voice Note (VN).`)
  }

  await m.react('⏳')
  try {
    const opus = await convertToOpusVn(media.buffer)
    await client.sendMessage(
      m.chat,
      { audio: opus, mimetype: 'audio/ogg; codecs=opus', ptt: true },
      { quoted: m }
    )
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ *Gagal mengubah ke Voice Note:* ${e.message}`)
  }
}

export { pluginConfig as config, handler }
