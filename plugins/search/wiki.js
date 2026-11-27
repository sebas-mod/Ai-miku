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

const pluginConfig = {
    name: "wiki",
    alias: [],
    category: "search",
    description: "wiki <palabra>",
    usage: ".wiki <palabra>",
    example: ".wiki <palabra>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const UA = { 'user-agent': 'Ai Miku/1.0 (WhatsApp bot; wikipedia summary)', 'accept': 'application/json' }

  async function cariJudul(lang, q) {
      const { data } = await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
          params: { action: 'opensearch', search: q, limit: 5, namespace: 0, format: 'json', redirects: 'resolve' },
          headers: UA, timeout: 15000
      })
      return Array.isArray(data?.[1]) ? data[1] : []
  }

  async function ringkasan(lang, judul) {
      const { data } = await axios.get(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(judul.replace(/ /g, '_'))}`, {
          headers: UA, timeout: 15000
      })
      return data
  }

  async function handler(m, { conn, args, text, usedPrefix, command }) {
      let lang = 'id'
      let q = String(text || '').trim()
      if (!q && m.quoted?.text) q = String(m.quoted.text).trim().slice(0, 100)
      if (args.length > 1 && /^[a-z]{2,3}$/i.test(args[0])) {
          lang = args[0].toLowerCase()
          q = args.slice(1).join(' ').trim()
      }
      if (!q) return m.reply(`*WIKIPEDIA*\n\nBusque cualquier resumen!\n\n Ejemplo:\n${usedPrefix}${command} templo de borobudur\n${usedPrefix}${command} es Agujeros negros`)

      await m.reply('Buscando en Wikipedia...')
      try {
          const hasil = await cariJudul(lang, q)
          if (!hasil.length) return m.reply(`No hay resultados para *${q}*.\n Pruebe con otras palabras clave u otros idiomas, por ejemplo: ${usedPrefix}${command} es ${q}`)

          const data = await ringkasan(lang, hasil[0])
          if (!data?.extract) return m.reply('Artículo encontrado pero el resumen está vacío.')

          let isi = data.extract.trim()
          if (isi.length > 900) isi = isi.slice(0, 900).replace(/\s+\S*$/, '') + '…'

          const lain = data.type === 'disambiguation' || hasil.length > 1
              ? `\n\n *Otros resultados:*\n${hasil.slice(1).map((h) => `• ${h}`).join('\n')}`
              : ''
          const caption = `*${data.title}*${data.description ? `\n_${data.description}_` : ''}\n\n${isi}\n\n ${data.content_urls?.desktop?.page || ''}${lain}`.trim()

          const gambar = data.thumbnail?.source
          if (gambar) {
              return await conn.sendMessage(m.chat, { image: { url: gambar }, caption }, { quoted: m }).catch(() => m.reply(caption))
          }
          return m.reply(caption)
      } catch (e) {
          if (e?.response?.status === 404) return m.reply(`🍅 Artículo *${q}* extraviado.`)
          throw `No se pudieron recuperar los datos de Wikipedia: ${e?.message || e}`
      }
  }

  handler.exp = 0

export { pluginConfig as config, handler }
