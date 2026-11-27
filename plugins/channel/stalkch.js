/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

const pluginConfig = {
    name: "stalkch",
    alias: [],
    category: "channel",
    description: "stalkch <link saluran>",
    usage: ".stalkch <link saluran>",
    example: ".stalkch <link saluran>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  const CODE = /^[A-Za-z0-9_-]{10,60}$/
  const IMG_HOST = /(^|\.)(whatsapp\.net|whatsapp\.com|fbcdn\.net|facebook\.com)$/i

  function normalize(input) {
      const s = String(input || '').trim().replace(/^<|>$/g, '')
      const m = s.match(/whatsapp\.com\/channel\/([A-Za-z0-9_-]{10,60})/i)
      if (m) return m[1]
      return CODE.test(s) ? s : ''
  }

  function parse(html) {
      const $ = cheerio.load(html)
      const og = (p) => $(`meta[property="og:${p}"]`).attr('content') || ''
      let name = og('title') || $('title').text().trim()
      const raw = og('description') || $('meta[name="description"]').attr('content') || ''
      let type = '', followers = '', desc = ''
      const head = raw.match(/^(Channel|Community|Group)\s*[•·]\s*([\d.,]+\s?[KMB]?)\s*(followers?|pengikut)/i)
      if (head) {
          type = head[1]
          followers = head[2]
          desc = raw.slice(head[0].length).replace(/^[\s•·\-–—]+/, '')
      } else {
          const f = raw.match(/([\d.,]+\s?[KMB]?)\s*(followers?|pengikut)/i)
          if (f) followers = f[1]
          desc = raw.replace(/^(Channel|Community|Group)\s*[•·][^•·]*[•·]?\s*/i, '')
      }
      desc = desc.replace(/\s+/g, ' ').trim()
      if (/^whatsapp\b/i.test(name) && desc) name = $('h1').first().text().trim() || name
      const verified = /verified_badge|"is_verified":true|"verified":true/.test(html) || $('[aria-label*="erified" i]').length > 0
      return { name: name.trim(), desc, followers, type, verified, image: og('image') }
  }

  async function handler(m, { sock, args, prefix, reply }) {
      const code = normalize(args[0])
      if (!code) return reply(`Formato: ${prefix || '.'}stalkch <link saluran>\nEjemplo: ${prefix || '.'}stalkch https://whatsapp.com/channel/0029VbDT59vC1Fu4nO1w6t2d`)
      const url = `https://whatsapp.com/channel/${code}`

      let info
      try {
          const { data } = await axios.get(url, { headers: { 'User-Agent': UA }, timeout: 20000, maxContentLength: 3 * 1024 * 1024, responseType: 'text' })
          info = parse(String(data))
      } catch (err) {
          console.log('[STALKCH]', err.message)
          return reply('❌ No se pudo leer la página del canal. Asegúrese de que el enlace sea correcto y que el canal aún exista.')
      }
      if (!info.name) return reply('❌ No se encontró el canal o la página no carga datos.')

      let photo = null
      try {
          const u = new URL(info.image)
          if (u.protocol === 'https:' && IMG_HOST.test(u.hostname)) {
              const r = await axios.get(info.image, { responseType: 'arraybuffer', timeout: 20000, maxContentLength: 5 * 1024 * 1024, headers: { 'User-Agent': UA } })
              if (/^image\//i.test(r.headers['content-type'] || '')) photo = Buffer.from(r.data)
          }
      } catch {}

      const caption =
          `📡 *INFO SALURAN*\n\n` +
          `Nombre: ${info.name}\n` +
          `Pengikut: ${info.followers || '-'}\n` +
          `Tipe: ${info.type || 'Channel'}\n` +
          `Estado: ${info.verified ? '✅ Verificado' : 'Sin verificar'}\n` +
          `Link: ${url}` +
          (info.desc ? `\n\nDeskripsi: ${info.desc.slice(0, 600)}` : '')

      try {
          const teks = `${caption}\n\n📋 Copiar enlace: ${url}\n📋 Copiar nombre: ${info.name}\n\n_${global.namebot || 'Ai Miku MD'}_`
          return await sock.sendMessage(m.chat, photo ? { image: photo, caption: teks } : { text: teks }, { quoted: m })
      } catch {
          if (photo) return sock.sendMessage(m.chat, { image: photo, caption }, { quoted: m })
          return reply(caption)
      }
  }

export { pluginConfig as config, handler }
