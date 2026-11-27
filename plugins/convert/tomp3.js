/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
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
    name: "tomp3",
    alias: [],
    category: "convert",
    description: "Fitur convert tomp3",
    usage: ".tomp3",
    example: ".tomp3",
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

function convertToMp3Buffer(inputBuffer) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'miku-mp3-'))
  const inPath = path.join(dir, 'in.media')
  const outPath = path.join(dir, 'out.mp3')
  fs.writeFileSync(inPath, inputBuffer)

  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG_BIN, ['-y', '-i', inPath, '-vn', '-acodec', 'libmp3lame', '-ab', '192k', '-ar', '44100', outPath])
    let err = ''
    p.stderr.on('data', (d) => { err += d.toString() })
    p.on('error', (e) => { fs.rmSync(dir, { recursive: true, force: true }); reject(e) })
    p.on('close', (code) => {
      try {
        if (code !== 0 || !fs.existsSync(outPath)) throw new Error(err.split('\n').slice(-2).join(' ') || 'FFmpeg no pudo convertir MP3.')
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

async function handler(m, { conn, sock, args, usedPrefix = '.', command = 'tomp3' }) {
  const client = conn || sock
  const media = await downloadFromMsg(m, client)
  if (!media || !/(video|audio)\//i.test(media.mime || '')) {
    return m.reply(`🎵 Envíe o responda videos/notas de voz con el comando *${usedPrefix + command}*`)
  }

  const asDoc = (args[0] || '').toLowerCase() === 'doc'
  await m.react('⏳')
  try {
    const mp3 = await convertToMp3Buffer(media.buffer)
    if (asDoc) {
      await client.sendMessage(
        m.chat,
        { document: mp3, fileName: `audio_${Date.now()}.mp3`, mimetype: 'audio/mpeg', caption: '🎵 *Konversi MP3 Selesai*' },
        { quoted: m }
      )
    } else {
      await client.sendMessage(
        m.chat,
        { audio: mp3, mimetype: 'audio/mpeg', ptt: false },
        { quoted: m }
      )
    }
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ *No se pudo convertir a MP3:* ${e.message}`)
  }
}

export { pluginConfig as config, handler }
