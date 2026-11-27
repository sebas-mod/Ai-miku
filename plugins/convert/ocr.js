/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import crypto from 'crypto'

const pluginConfig = {
    name: "ocr",
    alias: [],
    category: "convert",
    description: "ocr (reply gambar)",
    usage: ".ocr (reply gambar)",
    example: ".ocr (reply gambar)",
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

async function ocrScanRead(buffer) {
  const b64 = `data:image/jpeg;base64,${buffer.toString('base64')}`
  const r = await fetch('https://akunlabs.my.id/api/scanread', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 14)'
    },
    body: JSON.stringify({ image: b64 })
  })
  const j = await r.json().catch(() => null)
  const text = j?.text || j?.result || j?.data?.text
  if (text && String(text).trim()) return String(text).trim()
  throw new Error('ScanRead vacío')
}

async function ocrUrlApi(buffer, mime) {
  const url = await uploadTempBuffer(buffer, `ocr_${crypto.randomBytes(3).toString('hex')}.jpg`, mime || 'image/jpeg')
  for (const ep of [
    `https://api.nexray.eu.cc/tools/ocr?url=${encodeURIComponent(url)}`,
    `https://apiii-xrina.vercel.app/tools/ocr?url=${encodeURIComponent(url)}`
  ]) {
    try {
      const r = await fetch(ep)
      const j = await r.json().catch(() => null)
      const txt = j?.result?.text || j?.result || j?.text || j?.data
      if (typeof txt === 'string' && txt.trim()) return txt.trim()
    } catch {}
  }
  throw new Error('No se puede leer el texto de la imagen.')
}

async function handler(m, { conn, sock, usedPrefix = '.', command = 'ocr' }) {
  const client = conn || sock
  const media = await downloadFromMsg(m, client)
  if (!media || !/image\//i.test(media.mime || '')) {
    return m.reply(`📝 Envía o responde una imagen que contenga texto con el comando *${usedPrefix + command}*`)
  }

  await m.react('⏳')
  try {
    let extracted = ''
    try {
      extracted = await ocrScanRead(media.buffer)
    } catch {
      extracted = await ocrUrlApi(media.buffer, media.mime)
    }

    await m.react('✅')
    return m.reply(`📝 *RESULTADOS DE LECTURA DE TEXTO (OCR)*\n\n${extracted}`)
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ *Error OCR:* ${e.message}`)
  }
}

export { pluginConfig as config, handler }
