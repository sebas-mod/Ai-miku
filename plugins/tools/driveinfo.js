/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "driveinfo",
    alias: [],
    category: "tools",
    description: "driveinfo <link drive>",
    usage: ".driveinfo <link drive>",
    example: ".driveinfo <link drive>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const API_URL = 'https://bff.listnr.tech/backend/user/getInfoYT'

  const fmtBytes = (b) => {
      b = Number(b)
      if (!b || isNaN(b)) return null
      const u = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.min(u.length - 1, Math.floor(Math.log(b) / Math.log(1024)))
      return `${parseFloat((b / 1024 ** i).toFixed(2))} ${u[i]}`
  }

  const pick = (obj, keys) => {
      const stack = [obj]
      while (stack.length) {
          const o = stack.shift()
          if (!o || typeof o !== 'object') continue
          for (const k of keys) if (o[k] !== undefined && o[k] !== null && o[k] !== '' && typeof o[k] !== 'object') return o[k]
          stack.push(...Object.values(o))
      }
      return null
  }

  async function handler(m, { text, reply, prefix, command }) {
      const url = (String(text || '') + ' ' + (m.quoted?.text || '')).match(/https?:\/\/drive\.google\.com\/[^\s]+/i)?.[0]
      if (!url) return reply(`📁 *INFO DE DRIVE*\n\nUso: *${prefix + command} <enlace de Google Drive>*\nEjemplo: ${prefix + command} https://drive.google.com/file/d/xxxx/view\n\n_Para descargar el archivo usa .drivedl_`)

      try {
          const res = await fetch(API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/plain, */*', Origin: 'https://listnr.ai', Referer: 'https://listnr.ai/' },
              body: JSON.stringify({ url, platform: 'googledrive', type: 'file' }),
              signal: AbortSignal.timeout(20000)
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`)

          const name = pick(data, ['name', 'title', 'fileName', 'filename'])
          const size = pick(data, ['size', 'fileSize', 'filesize', 'bytes'])
          const mime = pick(data, ['mimeType', 'mimetype', 'type', 'contentType'])
          const duration = pick(data, ['duration', 'length'])
          const thumb = pick(data, ['thumbnail', 'thumb', 'image', 'cover'])

          if (!name && !size && !mime) return reply('```' + JSON.stringify(data, null, 1).slice(0, 1500) + '```')
          return reply(
              `📁 *INFO FILE DRIVE*\n\n` +
              `• Nama : ${name || '-'}\n• Ukuran : ${fmtBytes(size) || size || '-'}\n• Tipe : ${mime || '-'}\n` +
              (duration ? `• Durasi : ${duration}\n` : '') + (thumb ? `• Thumbnail : ${thumb}\n` : '') + `\n🔗 ${url}`
          )
      } catch (e) {
          return reply(`❌ ${e.message || 'No se pudo obtener la información del archivo'}`)
      }
  }

export { pluginConfig as config, handler }
