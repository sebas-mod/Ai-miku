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
    name: "blur",
    alias: [],
    category: "convert",
    description: "Fitur convert blur",
    usage: ".blur",
    example: ".blur",
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

async function handler(m, { conn, sock, args, usedPrefix = '.', command = 'blur' }) {
  const client = conn || sock
  const media = await downloadFromMsg(m, client)
  if (!media || !/image\/(jpe?g|png|webp)/i.test(media.mime || '')) {
    return m.reply(`🖼️ Enviar o responder imágenes con comandos *${usedPrefix + command} [intensidad 1-50]*\nEjemplo: \`${usedPrefix + command} 15\``)
  }

  const level = Math.min(50, Math.max(1, Number(args[0]) || 12))
  await m.react('⏳')
  try {
    const out = await sharp(media.buffer, { failOn: 'none' })
      .rotate()
      .blur(level)
      .jpeg({ quality: 90 })
      .toBuffer()

    await client.sendMessage(
      m.chat,
      { image: out, caption: `🌫️ *Efek Blur Selesai* (Intensitas: ${level})` },
      { quoted: m }
    )
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ *No se pudo procesar la imagen:* ${e.message}`)
  }
}

export { pluginConfig as config, handler }
