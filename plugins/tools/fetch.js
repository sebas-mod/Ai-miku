/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import dns from 'dns/promises'
import net from 'net'

const pluginConfig = {
    name: "get",
    alias: ["fetch"],
    category: "tools",
    description: "Fitur tools get",
    usage: ".get",
    example: ".get",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const MAX_BYTES = 20 * 1024 * 1024
  const MAX_TEXT = 3500
  const MAX_REDIRECT = 5

  function privateV4(ip) {
      const [a, b] = ip.split('.').map(Number)
      return a === 0 || a === 10 || a === 127 ||
          (a === 100 && b >= 64 && b <= 127) ||
          (a === 169 && b === 254) ||
          (a === 172 && b >= 16 && b <= 31) ||
          (a === 192 && b === 168) ||
          a >= 224
  }

  function privateIp(ip) {
      if (net.isIPv4(ip)) return privateV4(ip)
      const v = ip.toLowerCase()
      if (v === '::1' || v === '::') return true
      if (v.startsWith('::ffff:')) return net.isIPv4(v.slice(7)) ? privateV4(v.slice(7)) : true
      return /^f[cd]/.test(v) || /^fe[89ab]/.test(v)
  }

  async function assertPublic(url) {
      if (!/^https?:$/.test(url.protocol)) throw new Error('Solo se admiten URL http / https.')
      const host = url.hostname.replace(/^\[|\]$/g, '')
      const ips = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true })).map(r => r.address)
      if (!ips.length || ips.some(privateIp)) throw new Error('Esa dirección no está permitida (red interna).')
  }

  async function fetchSafe(start) {
      let url = start
      for (let i = 0; i <= MAX_REDIRECT; i++) {
          await assertPublic(url)
          const res = await fetch(url, {
              redirect: 'manual',
              signal: AbortSignal.timeout(20_000),
              headers: { 'user-agent': 'Mozilla/5.0 (compatible; BaseBot)', accept: '*/*' }
          })
          const loc = res.headers.get('location')
          if (res.status >= 300 && res.status < 400 && loc) {
              url = new URL(loc, url)
              continue
          }
          return { res, url }
      }
      throw new Error('Terlalu banyak redirect.')
  }

  async function readBody(res) {
      const declared = Number(res.headers.get('content-length') || 0)
      if (declared > MAX_BYTES) throw new Error('El archivo supera los 20 MB.')
      const chunks = []
      let size = 0
      for await (const c of res.body) {
          size += c.length
          if (size > MAX_BYTES) throw new Error('El archivo supera los 20 MB.')
          chunks.push(c)
      }
      return Buffer.concat(chunks)
  }

  function fileNameOf(res, url, fallbackExt) {
      const cd = res.headers.get('content-disposition') || ''
      const fromHeader = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)?.[1]
      const fromUrl = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '')
      const name = (fromHeader || fromUrl || 'file').replace(/[\\/:*?"<>|]/g, '_')
      return /\.[a-z0-9]{1,5}$/i.test(name) ? name : `${name}.${fallbackExt}`
  }

  const TEXT_EXT = /\.(txt|md|json|js|mjs|cjs|ts|jsx|tsx|html?|css|csv|xml|ya?ml|log|sh|py|php|java|c|cpp|h|go|rs|sql|ini|env|conf|toml)$/i

  async function deliver(m, sock, jid, { buffer, mime, filename }) {
      const isText = /^text\/|json|xml|javascript|yaml|csv/.test(mime) || TEXT_EXT.test(filename)

      if (isText) {
          let out = buffer.toString('utf8')
          if (/json/.test(mime) || /\.json$/i.test(filename)) { try { out = JSON.stringify(JSON.parse(out), null, 2) } catch {} }
          await m.reply(out.slice(0, 65536) || '(kosong)')
          return sock.sendMessage(jid, {
              document: Buffer.from(out, 'utf8'),
              fileName: filename,
              mimetype: mime && mime !== 'application/octet-stream' ? mime : 'text/plain'
          }, { quoted: m })
      }

      const caption = [
          '乂 *FETCH URL*',
          '',
          `📦 *Name:* ${filename}`,
          `📄 *Type:* ${mime}`,
          `📏 *Size:* ${(buffer.length / 1024 / 1024).toFixed(2)} MB`
      ].join('\n')

      if (mime === 'image/webp') return sock.sendMessage(jid, { sticker: buffer }, { quoted: m })
      if (/^image\//.test(mime)) return sock.sendMessage(jid, { image: buffer, mimetype: mime, caption }, { quoted: m })
      if (/^video\//.test(mime)) return sock.sendMessage(jid, { video: buffer, mimetype: mime, caption, fileName: filename }, { quoted: m })
      if (/^audio\//.test(mime)) return sock.sendMessage(jid, { audio: buffer, mimetype: mime, fileName: filename, ptt: false }, { quoted: m })
      return sock.sendMessage(jid, { document: buffer, mimetype: mime, fileName: filename, caption }, { quoted: m })
  }

  const EXT_OF = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'video/mp4': 'mp4', 'audio/mpeg': 'mp3', 'audio/ogg': 'ogg', 'application/pdf': 'pdf', 'application/zip': 'zip' }

  async function handler(m, { sock, jid, text, prefix, command }) {
      const urlInText = (text || '').match(/https?:\/\/\S+/i)?.[0]
      const file = !urlInText ? (m.isMedia ? m : (m.quoted?.isMedia ? m.quoted : null)) : null

      if (file) {
          const declared = Number(String(file.fileLength?.toString?.() ?? file.fileLength ?? 0))
          if (declared > MAX_BYTES) return m.reply('El archivo supera los 20 MB.')

          let buffer
          try {
              buffer = await file.download()
          } catch (e) {
              return m.reply(`No se pudo descargar el archivo: ${e?.message || e}`)
          }
          if (buffer.length > MAX_BYTES) return m.reply('El archivo supera los 20 MB.')

          const mime = String(file.mimetype || 'application/octet-stream').split(';')[0].trim().toLowerCase()
          const filename = file.fileName || `file.${EXT_OF[mime] || 'bin'}`
          return deliver(m, sock, jid, { buffer, mime, filename })
      }

      const input = urlInText || (m.quoted?.text || '').match(/https?:\/\/\S+/i)?.[0]
      if (!input) {
          return m.reply(`Ejemplo:\n${prefix || '.'}${command} https://example.com/file.pdf\n\nO responde / envía un archivo (pdf, js, zip, etc.) con el texto *${prefix || '.'}${command}*`)
      }

      let target
      try { target = new URL(input) } catch { return m.reply('URL tidak valid.') }

      let res, url
      try {
          ({ res, url } = await fetchSafe(target))
      } catch (e) {
          return m.reply(`Gagal mengambil URL: ${e?.message || e}`)
      }

      const mime = (res.headers.get('content-type') || 'application/octet-stream').split(';')[0].trim().toLowerCase()
      let buffer
      try {
          buffer = await readBody(res)
      } catch (e) {
          return m.reply(`Gagal membaca isi URL: ${e?.message || e}`)
      }

      const isText = /^text\/|json|xml|javascript|yaml|csv/.test(mime)
      const ext = /json/.test(mime) ? 'json' : /html/.test(mime) ? 'html' : isText ? 'txt' : (EXT_OF[mime] || 'bin')
      await deliver(m, sock, jid, { buffer, mime, filename: fileNameOf(res, url, ext) })
  }

export { pluginConfig as config, handler }
