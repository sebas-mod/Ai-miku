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
    name: "hd",
    alias: ["hd2", "hdr"],
    category: "convert",
    description: "hd",
    usage: ".hd",
    example: ".hd",
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
  throw new Error('Gagal mengunggah media ke server sementara.')
}

async function upscaleExternal(imageUrl) {
  const endpoints = [
    `https://apiii-xrina.vercel.app/ai-image/hd2?url=${encodeURIComponent(imageUrl)}`,
    `https://api.nexray.eu.cc/tools/remini?url=${encodeURIComponent(imageUrl)}`
  ]
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep)
      if (!res.ok) continue
      const ct = res.headers.get('content-type') || ''
      if (ct.includes('image/')) {
        return Buffer.from(await res.arrayBuffer())
      }
      const j = await res.json().catch(() => null)
      const targetUrl = j?.result?.url || j?.result || j?.data?.url || j?.url
      if (typeof targetUrl === 'string' && /^https?:\/\//i.test(targetUrl)) {
        const imgRes = await fetch(targetUrl)
        if (imgRes.ok) return Buffer.from(await imgRes.arrayBuffer())
      }
    } catch {}
  }
  return null
}

async function upscaleLocalSharp(buffer, scale = 2) {
  const meta = await sharp(buffer, { failOn: 'none' }).metadata()
  const w = Math.min(4096, Math.round((meta.width || 800) * scale))
  return sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize({ width: w, kernel: 'lanczos3' })
    .modulate({ brightness: 1.02, saturation: 1.05 })
    .sharpen({ sigma: 1.2, m1: 1.0, m2: 2.0 })
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer()
}

async function handler(m, { conn, sock, usedPrefix = '.', command = 'hd' }) {
  const client = conn || sock
  const media = await downloadFromMsg(m, client)
  if (!media || !/image\/(jpe?g|png|webp)/i.test(media.mime || '')) {
    return m.reply(`✨ Kirim atau reply foto yang ingin dijernihkan dengan perintah *${usedPrefix + command}*`)
  }

  await m.react('⏳')
  try {
    let outBuffer = null
    try {
      const tempUrl = await uploadTempBuffer(media.buffer, 'input.jpg', media.mime || 'image/jpeg')
      outBuffer = await upscaleExternal(tempUrl)
    } catch {}

    let modeLabel = 'AI HD Enhancer'
    if (!outBuffer) {
      outBuffer = await upscaleLocalSharp(media.buffer, command === 'hdr' ? 3 : 2)
      modeLabel = 'Lanczos3 Super-Resolution'
    }

    await client.sendMessage(
      m.chat,
      { image: outBuffer, caption: `✨ *PENINGKATAN KUALITAS GAMBAR*\n• Mode : ${modeLabel}\n_Ai Miku_` },
      { quoted: m }
    )
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ *Gagal memproses HD:* ${e.message}`)
  }
}

export { pluginConfig as config, handler }
