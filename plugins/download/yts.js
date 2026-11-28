import axios from 'axios'

const pluginConfig = {
  name: 'yts',
  alias: ['ytsearch', 'buscarvideo', 'buscaryt', 'ytbuscar', 'buscar'],
  category: 'download',
  description: 'Busca videos en YouTube con una vista previa bonita.',
  usage: '.yts <búsqueda>',
  example: '.yts miku',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true
}

const API_URL = 'https://api-yosoyyo-api-ofc.onrender.com/api/youtube'
const API_KEY = 'sebasapi2024'

function formatViews(n) {
  const num = Number(n || 0)
  if (!Number.isFinite(num) || num <= 0) return 'N/D'
  return new Intl.NumberFormat('es-ES').format(num)
}

function clean(text, max = 120) {
  const s = String(text || '').replace(/\s+/g, ' ').trim()
  if (!s) return 'Sin descripción'
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s
}

async function handler(m, { text, conn, usedPrefix, command }) {
  const query = String(text || m.quoted?.text || '').trim()
  if (!query) {
    return m.reply(
      `🔎 *BÚSQUEDA DE YOUTUBE*\n\n` +
      `> Escribe lo que quieres buscar.\n\n` +
      `*Uso:*\n` +
      `> \`${usedPrefix || '.'}${command} miku\`\n` +
      `> \`${usedPrefix || '.'}${command} gura songs\``
    )
  }

  await m.react('🔎').catch(() => {})
  await m.reply(`🔎 *Buscando en YouTube...*\n> Consulta: *${query}*`).catch(() => {})

  try {
    const { data } = await axios.get(API_URL, {
      params: { q: query, apiKey: API_KEY },
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const results = Array.isArray(data?.result) ? data.result.filter(v => v?.videoUrl) : []
    if (!results.length) {
      await m.react('❌').catch(() => {})
      return m.reply(`❌ No encontré resultados para: *${query}*`)
    }

    const top = results.slice(0, 10)
    const lines = [
      '╭━━━〔 *YOUTUBE SEARCH* 〕━━━╮',
      `┃ 🔎 *Búsqueda:* ${query}`,
      `┃ 📦 *Resultados:* ${top.length}`,
      '╰━━━━━━━━━━━━━━━━━━━━╯',
      ''
    ]

    top.forEach((v, i) => {
      lines.push(`*${i + 1}.* ${v.title || 'Sin título'}`)
      lines.push(`┌ ⏱ *Duración:* ${v.duration || 'N/D'}`)
      lines.push(`│ 👤 *Canal:* ${v.channelName || 'N/D'}`)
      lines.push(`│ 👁 *Vistas:* ${formatViews(v.views)}`)
      lines.push(`│ 📅 *Publicado:* ${v.publishedAgo || 'N/D'}`)
      lines.push(`│ 📝 *Descripción:* ${clean(v.description, 90)}`)
      lines.push(`└ 🔗 ${v.videoUrl}`)
      lines.push('')
    })

    lines.push('> Usa `.play <url>` o `.ytmp3 <url>` para descargar audio.')
    lines.push('> Usa `.playvid <url>` o `.ytmp4 <url>` para descargar video.')

    const caption = lines.join('\n')
    const thumb = top[0]?.thumbnailUrl

    if (thumb) {
      await conn.sendMessage(m.chat, {
        image: { url: thumb },
        caption,
        contextInfo: {
          externalAdReply: {
            title: top[0]?.title || 'YouTube Search',
            body: `${top[0]?.channelName || 'YouTube'} • ${top[0]?.duration || ''}`,
            thumbnailUrl: thumb,
            sourceUrl: top[0]?.videoUrl,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    }

    await m.react('✅').catch(() => {})
  } catch (e) {
    await m.react('❌').catch(() => {})
    const msg = e?.response?.data?.message || e?.message || String(e)
    return m.reply(`❌ Error al buscar en YouTube.\n> ${msg}`)
  }
}

export { pluginConfig as config, handler }
