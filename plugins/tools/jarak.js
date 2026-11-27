/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "jarak",
    alias: [],
    category: "tools",
    description: "jarak <asal | tujuan>",
    usage: ".jarak <asal | tujuan>",
    example: ".jarak <asal | tujuan>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const axios = (__m => __m.default ?? __m)((await import('axios')))

  async function handler(m, { text }) {
    if (!text || !text.includes('|')) {
      return m.reply(
        `📍 *DISTANCIA ENTRE CIUDADES*\n\n` +
        `Modo de uso:\n` +
        `• *.jarak origen | destino*\n\n` +
        `Ejemplo:\n` +
        `• *.jarak Jakarta | Bandung*\n` +
        `• *.jarak Surabaya | Yogyakarta*`
      )
    }

    const [from, to] = text.split('|').map(s => s.trim())
    if (!from || !to) return m.reply('❌ ¡Escribe bien la ciudad de origen y la de destino!')

    await m.reply(`⏳ Calculando la ruta de *${from}* a *${to}*...`)

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(from)}`
      const urlTo = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(to)}`

      const [res1, res2] = await Promise.all([
        axios.get(url, { headers: { 'User-Agent': `${global.namebot}Bot/1.0` }, timeout: 10000 }),
        axios.get(urlTo, { headers: { 'User-Agent': `${global.namebot}Bot/1.0` }, timeout: 10000 })
      ])

      if (!res1.data?.[0] || !res2.data?.[0]) {
        return m.reply('❌ ¡No se encontró una de las dos ciudades en el mapa!')
      }

      const lat1 = parseFloat(res1.data[0].lat)
      const lon1 = parseFloat(res1.data[0].lon)
      const lat2 = parseFloat(res2.data[0].lat)
      const lon2 = parseFloat(res2.data[0].lon)

      const R = 6371
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const d = Math.round(R * c)
      const estHours = (d / 60).toFixed(1)

      await m.reply(
        `╭─── ୨୧ ESTIMASI JARAK ୨୧ ───╮\n` +
        `│ ૮₍˶ᵔ ᵕ ᵔ˶₎ა ruta de viaje!\n` +
        `╰────────────────────────────╯\n\n` +
        `🚩 Asal     : *${res1.data[0].display_name.split(',')[0]}*\n` +
        `🏁 Tujuan   : *${res2.data[0].display_name.split(',')[0]}*\n` +
        `📏 Jarak    : *± ${d.toLocaleString('id-ID')} km* (garis lurus)\n` +
        `🚗 Estimación: *± ${estHours} horas de viaje por carretera*\n\n` +
        `꒰ა ♡ ໒꒱ ¡feliz viaje seguro!`
      )
    } catch (e) {
      await m.reply(`❌ Hubo un problema al recuperar datos de distancia: ${e.message}`)
    }
  }

export { pluginConfig as config, handler }
