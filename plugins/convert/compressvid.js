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
import sharp from 'sharp'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'

const pluginConfig = {
    name: "compressvid",
    alias: [],
    category: "convert",
    description: "Fitur convert compressvid",
    usage: ".compressvid",
    example: ".compressvid",
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

const fmtSize = (b) => b >= 1048576 ? `${(b / 1048576).toFixed(2)} MB` : `${(b / 1024).toFixed(1)} KB`

function compressVideoBuffer(buffer, mode = 'auto') {
  const presets = {
    hd: { scale: 1080, crf: '24', ab: '128k' },
    auto: { scale: 720, crf: '28', ab: '96k' },
    ultra: { scale: 480, crf: '33', ab: '64k' }
  }
  const cfg = presets[mode] || presets.auto
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'elysia-cvid-'))
  const inFile = path.join(tmpDir, 'in.mp4')
  const outFile = path.join(tmpDir, 'out.mp4')
  fs.writeFileSync(inFile, buffer)

  return new Promise((resolve, reject) => {
    const vf = `scale='min(${cfg.scale},iw)':-2`
    const proc = spawn(FFMPEG_BIN, [
      '-y', '-i', inFile,
      '-vf', vf,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', cfg.crf,
      '-c:a', 'aac', '-b:a', cfg.ab,
      '-movflags', '+faststart',
      outFile
    ])
    let errLog = ''
    proc.stderr.on('data', (d) => { errLog += d.toString() })
    proc.on('error', (err) => {
      fs.rmSync(tmpDir, { recursive: true, force: true })
      reject(err)
    })
    proc.on('close', (code) => {
      try {
        if (code !== 0 || !fs.existsSync(outFile)) {
          throw new Error(errLog.split('\n').slice(-3).join(' ') || 'FFmpeg gagal mengompres video.')
        }
        const out = fs.readFileSync(outFile)
        fs.rmSync(tmpDir, { recursive: true, force: true })
        resolve(out)
      } catch (e) {
        fs.rmSync(tmpDir, { recursive: true, force: true })
        reject(e)
      }
    })
  })
}

async function handler(m, { conn, sock, args, usedPrefix = '.', command = 'compressvid' }) {
  const client = conn || sock
  const media = await downloadFromMsg(m, client)
  if (!media || !/(video|image)\//i.test(media.mime || '')) {
    return m.reply(
      `🎬 *KOMPRES VIDEO & MEDIA*\n\n` +
      `Kirim atau reply video/gambar dengan perintah:\n` +
      `• \`${usedPrefix + command}\` — Mode seimbang (720p)\n` +
      `• \`${usedPrefix + command} hd\` — Mode jernih (1080p)\n` +
      `• \`${usedPrefix + command} ultra\` — Ukuran super hemat (480p)`
    )
  }

  const mode = ['hd', 'ultra', 'auto'].includes((args[0] || '').toLowerCase())
    ? args[0].toLowerCase()
    : 'auto'

  await m.react('⏳')
  try {
    if (/^image\//i.test(media.mime)) {
      const q = mode === 'hd' ? 78 : mode === 'ultra' ? 42 : 60
      const out = await sharp(media.buffer, { failOn: 'none' }).rotate().jpeg({ quality: q, mozjpeg: true }).toBuffer()
      const saved = Math.max(0, Math.round((1 - out.length / media.buffer.length) * 100))
      await client.sendMessage(
        m.chat,
        { image: out, caption: `🗜️ *Kompres Gambar (${mode.toUpperCase()})*\n• ${fmtSize(media.buffer.length)} ➔ ${fmtSize(out.length)} (Hemat ${saved}%)` },
        { quoted: m }
      )
    } else {
      const out = await compressVideoBuffer(media.buffer, mode)
      const saved = Math.max(0, Math.round((1 - out.length / media.buffer.length) * 100))
      await client.sendMessage(
        m.chat,
        { video: out, mimetype: 'video/mp4', caption: `🎬 *Kompres Video (${mode.toUpperCase()})*\n• ${fmtSize(media.buffer.length)} ➔ ${fmtSize(out.length)} (Hemat ${saved}%)` },
        { quoted: m }
      )
    }
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ *Gagal mengompres media:* ${e.message}`)
  }
}

export { pluginConfig as config, handler }
