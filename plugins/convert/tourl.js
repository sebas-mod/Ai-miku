/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: "tourl",
    alias: ["upload", "tolink", "upurl"],
    category: "convert",
    description: "tourl (reply media)",
    usage: ".tourl (reply media)",
    example: ".tourl (reply media)",
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

async function uploadTempBuffer(buffer, filename = 'image.jpg', mime = 'image/jpeg') {
  try {
    const fd = new FormData()
    fd.append('file', new Blob([buffer], { type: mime }), filename)
    const r = await fetch('https://cdn.zass.in/upload', { method: 'POST', body: fd })
    const j = await r.json().catch(() => null)
    if (j?.url) return j.url
  } catch {}
  try {
    const fd = new FormData()
    fd.append('reqtype', 'fileupload')
    fd.append('fileToUpload', new Blob([buffer], { type: mime }), filename)
    const r = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: fd })
    const t = (await r.text()).trim()
    if (/^https?:\/\//i.test(t)) return t
  } catch {}
  throw new Error('No se pudo cargar el medio en el servidor temporal.')
}

const fmtBytes = (b) => b >= 1048576 ? `${(b / 1048576).toFixed(2)} MB` : `${(b / 1024).toFixed(1)} KB`

async function handler(m, { conn, sock, usedPrefix = '.', command = 'tourl' }) {
  const client = conn || sock
  const media = await downloadFromMsg(m, client)
  if (!media) {
    return m.reply(`🔗 Envía o responde imágenes/videos/audios/documentos con el comando *${usedPrefix + command}* para convertirlo al enlace URL.`)
  }

  await m.react('⏳')
  try {
    const ext = ((media.mime || '').split('/')[1] || 'bin').split(';')[0]
    const url = await uploadTempBuffer(media.buffer, `miku_${Date.now()}.${ext}`, media.mime || 'application/octet-stream')

    let txt = `🔗 *MEDIA A LA URL DEL CARGADOR*\n\n`
    txt += `• *Tipe MIME* : ${media.mime || 'application/octet-stream'}\n`
    txt += `• *Tamaño*: ${fmtBytes(media.buffer.length)}\n`
    txt += `• *URL* : ${url}\n\n`
    txt += `_Ai Miku_`

    await m.react('✅')
    return m.reply(txt)
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ *No se pudo cargar el medio:* ${e.message}`)
  }
}

export { pluginConfig as config, handler }
