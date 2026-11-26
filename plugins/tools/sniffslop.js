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

const reactTo = MikuRuntime.reactTo;

const pluginConfig = {
    name: "sniffslop",
    alias: [],
    category: "tools",
    description: "sniffslop",
    usage: ".sniffslop",
    example: ".sniffslop",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function scanWebsite(url) {
      const { data } = await axios.post('https://www.sniffslop.com/api/scan', { url }, {
          headers: {
              accept: '*/*',
              'content-type': 'application/json',
              origin: 'https://www.sniffslop.com',
              referer: 'https://www.sniffslop.com/',
              'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
          },
          timeout: 120000
      })
      return data
  }

  function flatten(value, label = '', depth = 0, out = []) {
      if (value === null || value === undefined || value === '') return out
      if (Array.isArray(value)) {
          if (!value.length) return out
          if (value.every(v => typeof v !== 'object')) out.push(`${label}: ${value.join(', ')}`)
          else value.slice(0, 8).forEach((v, i) => flatten(v, `${label} ${i + 1}`.trim(), depth + 1, out))
      } else if (typeof value === 'object') {
          if (depth >= 3) return out
          for (const [k, v] of Object.entries(value)) flatten(v, label ? `${label} › ${k}` : k, depth + 1, out)
      } else {
          out.push(`${label}: ${String(value)}`)
      }
      return out
  }

  async function handler(m, { sock, text, prefix, command, reply }) {
      let url = String(text || m.quoted?.text || '').trim().split(/\s+/)[0]
      if (!url) return reply(`Escribe el enlace de una web.\n\nEjemplo:\n${prefix}${command} https://ejemplo.com`)
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`
      try {
          new URL(url)
      } catch {
          return reply('❌ Enlace no válido.')
      }

      try {
          await reactTo(sock, m, '⏳')
          const data = await scanWebsite(url)
          const lines = flatten(data)
          if (!lines.length) throw new Error('Hasil scan kosong.')
          await reply(`*🕵️ SNIFFSLOP SCAN*\n${url}\n\n${lines.join('\n').slice(0, 3500)}`)
          await reactTo(sock, m, '✅')
      } catch (e) {
          await reactTo(sock, m, '❌')
          const d = e.response?.data
          reply(`❌ No se pudo escanear la web: ${d?.message || (typeof d === 'string' ? d.slice(0, 200) : e.message)}`)
      }
  }

export { pluginConfig as config, handler }
