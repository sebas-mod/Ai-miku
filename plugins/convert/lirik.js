/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from 'axios'

const pluginConfig = {
    name: "lirik",
    alias: ["lyrics"],
    category: "convert",
    description: "lirik <judul lagu>",
    usage: ".lirik <judul lagu>",
    example: ".lirik <judul lagu>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { text, args, usedPrefix = '.', command = 'lirik' }) {
  const query = (text || (args || []).join(' ') || m.quoted?.text || '').trim()
  if (!query) {
    return m.reply(`🎵 *PENCARIAN LIRIK LAGU*\n\nEscribe el título de la canción o el cantante:\nEjemplo: \`${usedPrefix + command} Coldplay Amarillo\``)
  }

  await m.react('⏳')
  try {
    const { data } = await axios.get('https://lrclib.net/api/search', {
      params: { q: query },
      timeout: 15000,
      headers: { 'User-Agent': 'AiMiku/2.0 (https://github.com/arthazy)' }
    })

    if (!Array.isArray(data) || !data.length) {
      await m.react('❌')
      return m.reply(`❌ Letra de *"${query}"* extraviado.`)
    }

    const best = data.find((item) => item.plainLyrics) || data[0]
    const lyrics = (best.plainLyrics || best.syncedLyrics || '').trim()
    if (!lyrics) {
      await m.react('❌')
      return m.reply(`❌ Las letras de texto aún no están disponibles para las canciones *${best.trackName || query}*.`)
    }

    let out = `🎶 *${best.trackName || 'Judul Tidak Diketahui'}*\n`
    out += `👤 *Artis* : ${best.artistName || '-'}\n`
    if (best.albumName) out += `💿 *Album* : ${best.albumName}\n`
    out += `\n${lyrics}\n\n_Ai Miku_`

    await m.react('✅')
    return m.reply(out)
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ *No se pudo buscar la letra:* ${e.message}`)
  }
}

export { pluginConfig as config, handler }
