/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: "toptv",
    alias: [],
    category: "convert",
    description: "toptv (responde a un video)",
    usage: ".toptv (responde a un video)",
    example: ".toptv (responde a un video)",
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

async function handler(m, { conn, sock, usedPrefix = '.', command = 'toptv' }) {
  const client = conn || sock
  const media = await downloadFromMsg(m, client)
  if (!media || !/^video\//i.test(media.mime || '')) {
    return m.reply(`⭕ Enviar o responder videos cortos con comandos *${usedPrefix + command}* para cambiarlo a PTV (Video Esférico).`)
  }

  await m.react('⏳')
  try {
    await client.sendMessage(
      m.chat,
      { video: media.buffer, ptv: true, mimetype: 'video/mp4' },
      { quoted: m }
    )
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ *No se pudo enviar PTV:* ${e.message}`)
  }
}

export { pluginConfig as config, handler }
