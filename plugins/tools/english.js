/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'

const pluginConfig = {
    name: "english",
    alias: [],
    category: "tools",
    description: "english <teks>",
    usage: ".english <teks>",
    example: ".english <teks>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const MAX_CHARS = 3000
  const NAMA = {
      id: 'Indonesia', en: 'Inggris', ja: 'Jepang', ko: 'Korea', zh: 'Mandarin', 'zh-cn': 'Mandarin', ar: 'Arab',
      ms: 'Melayu', jw: 'Jawa', su: 'Sunda', es: 'Spanyol', fr: 'Prancis', de: 'Jerman', pt: 'Portugis',
      ru: 'Rusia', hi: 'Hindi', th: 'Thailand', vi: 'Vietnam', tr: 'Turki', it: 'Italia', nl: 'Belanda'
  }
  const nama = (code) => NAMA[String(code).toLowerCase()] || String(code).toUpperCase()

  async function translate(text, to, from = 'auto') {
      const { data } = await axios.get('https://translate.googleapis.com/translate_a/single', {
          params: { client: 'gtx', sl: from, tl: to, dt: 't', q: text },
          headers: { 'user-agent': 'Mozilla/5.0' },
          timeout: 15000
      })
      const out = (data?.[0] || []).map(part => part?.[0] || '').join('').trim()
      if (!out) throw new Error('Hasil terjemahan kosong')
      return { text: out, from: data?.[2] || from, to }
  }

  async function handler(m, { text, command, prefix, reply }) {
      let input = String(text || '').trim()
      if (!input && m.quoted) input = String(m.quoted.text || '').trim()

      if (!input) {
          return reply(`*▢ TRANSLATE*\n\n${prefix}english <teks>  → ke Inggris\n\nBisa juga reply pesan lalu ketik ${prefix}${command}`)
      }
      if (input.length > MAX_CHARS) return reply(`Teks terlalu panjang (${input.length} karakter, maks ${MAX_CHARS}).`)

      try {
          const result = await translate(input, 'en')
          return reply(`🌐 *Terjemahan* (${nama(result.from)} → ${nama(result.to)})\n\n${result.text}`)
      } catch (e) {
          console.error('[TRANSLATE]', e?.message || e)
          return reply(`Gagal menerjemahkan: ${e?.response?.status ? `server menolak (HTTP ${e.response.status})` : e?.message || 'error'}.\nCoba lagi sebentar.`)
      }
  }

export { pluginConfig as config, handler }
