/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import sharp from 'sharp'

const pluginConfig = {
    name: "compress",
    alias: [],
    category: "convert",
    description: "Fitur convert compress",
    usage: ".compress",
    example: ".compress",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

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

const fmtKB = (b) => b >= 1048576 ? `${(b / 1048576).toFixed(2)} MB` : `${(b / 1024).toFixed(1)} KB`

async function handler(m, { conn, sock, args, usedPrefix = '.', command = 'compress' }) {
  const client = conn || sock
  const media = await downloadFromMsg(m, client)
  if (!media || !/image\/(jpe?g|png|webp)/i.test(media.mime || '')) {
    return m.reply(`🗜️ Kirim atau reply gambar dengan perintah *${usedPrefix + command} [kualitas 20-90]*`)
  }

  const quality = Math.min(90, Math.max(20, Number(args[0]) || 60))
  await m.react('⏳')
  try {
    const meta = await sharp(media.buffer, { failOn: 'none' }).metadata()
    let pipeline = sharp(media.buffer, { failOn: 'none' }).rotate()
    if ((meta.width || 0) > 1280 || (meta.height || 0) > 1280) {
      pipeline = pipeline.resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
    }
    const out = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer()
    const saved = Math.max(0, Math.round((1 - out.length / media.buffer.length) * 100))

    await client.sendMessage(
      m.chat,
      {
        image: out,
        caption: `🗜️ *KOMPRES GAMBAR SELESAI*\n• Awal : ${fmtKB(media.buffer.length)}\n• Akhir : ${fmtKB(out.length)} (Hemat ${saved}%)`
      },
      { quoted: m }
    )
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ *Gagal mengompres gambar:* ${e.message}`)
  }
}

export { pluginConfig as config, handler }
