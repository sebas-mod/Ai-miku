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
    name: "imgbb",
    alias: [],
    category: "convert",
    description: "imgbb (reply gambar)",
    usage: ".imgbb (reply gambar)",
    example: ".imgbb (reply gambar)",
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

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

async function fetchAuthToken() {
  const res = await fetch('https://id.imgbb.com/', { headers: { 'User-Agent': UA } })
  const html = await res.text()
  const m = html.match(/PF\.obj\.config\.auth_token\s*=\s*"([a-f0-9]+)"/i)
  const cookie = res.headers.get('set-cookie') || ''
  if (!m) throw new Error('Gagal mendapatkan token otentikasi ImgBB.')
  return { token: m[1], cookie }
}

function formatBytes(b) {
  if (!b) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(b) / Math.log(1024))
  return `${(b / Math.pow(1024, i)).toFixed(2)} ${u[i]}`
}

async function handler(m, { conn, sock, usedPrefix = '.', command = 'imgbb' }) {
  const client = conn || sock
  const media = await downloadFromMsg(m, client)
  if (!media || !/image\//i.test(media.mime || '')) {
    return m.reply(`🖼️ Kirim atau reply gambar dengan perintah *${usedPrefix + command}* untuk mengunggah ke ImgBB.`)
  }

  await m.react('⏳')
  try {
    const { token, cookie } = await fetchAuthToken()
    const ext = (media.mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg')
    const filename = `miku_${crypto.randomBytes(4).toString('hex')}.${ext}`

    const fd = new FormData()
    fd.append('source', new Blob([media.buffer], { type: media.mime }), filename)
    fd.append('type', 'file')
    fd.append('action', 'upload')
    fd.append('timestamp', String(Date.now()))
    fd.append('auth_token', token)

    const upRes = await fetch('https://id.imgbb.com/json', {
      method: 'POST',
      headers: {
        'User-Agent': UA,
        Origin: 'https://id.imgbb.com',
        Referer: 'https://id.imgbb.com/',
        ...(cookie ? { Cookie: cookie } : {})
      },
      body: fd
    })
    const json = await upRes.json()
    if (!json?.image?.url) throw new Error(json?.error?.message || 'Gagal mengunggah gambar ke ImgBB.')

    const img = json.image
    let txt = `☁️ *IMGBB IMAGE UPLOADER* ☁️\n\n`
    txt += `• *Nama File* : ${img.filename || filename}\n`
    txt += `• *Resolusi* : ${img.width || '-'} × ${img.height || '-'} px\n`
    txt += `• *Ukuran* : ${formatBytes(img.size || media.buffer.length)}\n`
    txt += `• *Direct URL* : ${img.url}\n`
    if (img.display_url && img.display_url !== img.url) txt += `• *Display URL* : ${img.display_url}\n`
    if (img.url_viewer) txt += `• *Viewer* : ${img.url_viewer}\n`

    await m.react('✅')
    return m.reply(txt.trim())
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ *Gagal Upload ImgBB:* ${e.message}`)
  }
}

export { pluginConfig as config, handler }
