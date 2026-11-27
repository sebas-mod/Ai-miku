/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from '../../config.js'

const pluginConfig = {
    name: "removebg",
    alias: ["nobg", "hapusbg"],
    category: "convert",
    description: "Fitur convert removebg",
    usage: ".removebg",
    example: ".removebg",
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

async function removeBgViaApiKey(buffer, apiKey) {
  const fd = new FormData()
  fd.append('image_file', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg')
  fd.append('size', 'auto')
  const res = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey },
    body: fd
  })
  if (!res.ok) throw new Error(`remove.bg HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function removeBgFallback(buffer, mime) {
  const url = await uploadTempBuffer(buffer, 'input.jpg', mime || 'image/jpeg')
  const endpoints = [
    `https://api.nexray.eu.cc/tools/removebg?url=${encodeURIComponent(url)}`,
    `https://apiii-xrina.vercel.app/ai-image/removebg?url=${encodeURIComponent(url)}`
  ]
  for (const ep of endpoints) {
    try {
      const r = await fetch(ep)
      if (!r.ok) continue
      const ct = r.headers.get('content-type') || ''
      if (ct.includes('image/')) return Buffer.from(await r.arrayBuffer())
      const j = await r.json().catch(() => null)
      const imgUrl = j?.result?.url || j?.result || j?.data?.url || j?.url
      if (typeof imgUrl === 'string' && /^https?:\/\//i.test(imgUrl)) {
        const ir = await fetch(imgUrl)
        if (ir.ok) return Buffer.from(await ir.arrayBuffer())
      }
    } catch {}
  }
  throw new Error('El servidor de eliminación en segundo plano está ocupado.')
}

async function handler(m, { conn, sock, args, usedPrefix = '.', command = 'removebg' }) {
  const client = conn || sock
  const media = await downloadFromMsg(m, client)
  if (!media || !/image\//i.test(media.mime || '')) {
    return m.reply(`✂️ Enviar o responder imágenes con comandos *${usedPrefix + command}* para eliminar el fondo.`)
  }

  const asDoc = (args[0] || '').toLowerCase() === 'doc'
  await m.react('⏳')
  try {
    let pngBuffer = null
    const apiKey = config?.APIKeys?.removeBg || process.env.REMOVEBG_API_KEY
    if (apiKey) {
      try { pngBuffer = await removeBgViaApiKey(media.buffer, apiKey) } catch {}
    }
    if (!pngBuffer) {
      pngBuffer = await removeBgFallback(media.buffer, media.mime)
    }

    if (asDoc) {
      await client.sendMessage(
        m.chat,
        { document: pngBuffer, fileName: `miku-nobg-${Date.now()}.png`, mimetype: 'image/png', caption: '✂️ *Fondo eliminado exitosamente (PNG Transparente)*' },
        { quoted: m }
      )
    } else {
      await client.sendMessage(
        m.chat,
        { image: pngBuffer, caption: `✂️ *Fondo eliminado exitosamente*\n💡 Escribe \`${usedPrefix + command} doc\` si desea que el archivo resultante PNG sea transparente.` },
        { quoted: m }
      )
    }
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ *No se pudo eliminar el fondo:* ${e.message}`)
  }
}

export { pluginConfig as config, handler }
