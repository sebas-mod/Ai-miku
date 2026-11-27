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

const config = MikuRuntime.config;

const pluginConfig = {
    name: "emojimix",
    alias: ["emix"],
    category: "sticker",
    description: "emojimix 😀+😍",
    usage: ".emojimix 😀+😍",
    example: ".emojimix 😀+😍",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const TENOR_KEY = process.env.TENOR_KEY || 'AIzaSyACvEq5cnT7AGKTWIIMyIB1HjcBLwnlH8k'

  const findEmoji = (str) => {
    const seg = new Intl.Segmenter('en', { granularity: 'grapheme' })
    return [...seg.segment(String(str || ''))]
      .map(s => s.segment)
      .filter(g => /\p{Extended_Pictographic}/u.test(g))
  }

  const mix = async (a, b) => {
    const { data } = await axios.get('https://tenor.googleapis.com/v2/featured', {
      params: {
        key: TENOR_KEY,
        contentfilter: 'high',
        media_filter: 'png_transparent',
        component: 'proactive',
        collection: 'emoji_kitchen_v5',
        q: `${a}_${b}`
      },
      timeout: 15000
    })
    return data?.results?.[0]?.media_formats?.png_transparent?.url || null
  }

  async function handler(m, { sock, text, reply, prefix, usedPrefix }) {
    const p = usedPrefix ?? prefix ?? '.'
    const em = findEmoji(text)

    if (em.length < 2) {
      return reply(`😀 *EMOJI MIX*\n\nGabungkan dua emoji jadi stiker.\nContoh: ${p}emojimix 😀+😍`)
    }

    const [a, b] = em
    try {
      let url = await mix(a, b)
      if (!url) url = await mix(b, a)
      if (!url) return reply(`❌ Combinación ${a} + ${b} aún no está disponible. Prueba con otro emoji.`)

      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 })
      await sock.sendImageAsSticker(m.chat, Buffer.from(res.data), m, {
        packname: config.sticker.packname,
        author: config.sticker.author
      })
    } catch (e) {
      console.error('[emojimix]', e?.message || e)
      return reply('❌ No se pudo recuperar la mezcla de emoji. Es posible que los servidores de Google/Tenor estén teniendo problemas. Vuelva a intentarlo más tarde.')
    }
  }

export { pluginConfig as config, handler }
