import axios from 'axios'

const pluginConfig = {
  name: 'yta',
  alias: ['ytmp3', 'ytaudio', 'audioyt', 'descargaraudio'],
  category: 'download',
  description: 'Descarga audio de YouTube.',
  usage: '.yta <url>',
  example: '.yta https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true
}

const YOSOYYO_API = 'https://api-yosoyyo-api-ofc.onrender.com/api/youtube/v2'
const YOSOYYO_KEY = 'sebasapi2024'
const SIPUTZX_API = 'https://youtubedl.siputzx.my.id'

function pickAudio(results = []) {
  const list = Array.isArray(results) ? results.filter(r => r?.download) : []
  if (!list.length) return null
  const score = (r) => {
    const ext = String(r.extension || '').toLowerCase()
    const q = parseInt(String(r.quality || '0'), 10) || 0
    let s = q
    if (ext === 'm4a' || ext === 'mp3') s += 50
    if (String(r.type || '').toLowerCase() === 'audio') s += 20
    return s
  }
  return list.sort((a, b) => score(b) - score(a))[0]
}

async function fetchBuffer(url) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 120000,
    maxContentLength: 100 * 1024 * 1024,
    maxBodyLength: 100 * 1024 * 1024,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept': '*/*'
    }
  })
  const type = String(res.headers['content-type'] || '').toLowerCase()
  if (type.includes('text/html') || type.includes('application/json')) {
    throw new Error('La URL de descarga no devolvió audio')
  }
  return Buffer.from(res.data)
}

async function downloadWithYosoyyo(url) {
  const { data } = await axios.get(YOSOYYO_API, {
    params: { url, format: 'mp3', apiKey: YOSOYYO_KEY },
    timeout: 60000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  if (!data?.status) throw new Error(data?.message || 'La API no devolvió resultado')
  const result = data.result || {}
  const picked = pickAudio(result.results)
  if (!picked?.download) throw new Error('No se encontró enlace de audio')
  const buffer = await fetchBuffer(picked.download)
  return {
    buffer,
    title: result.title || picked.title || 'YouTube Audio',
    thumbnail: result.thumbnail || picked.thumbnail,
    duration: result.duration || '',
    quality: picked.quality || '',
    ext: picked.extension || 'm4a',
    source: picked.source || 'yosoyyo'
  }
}

async function downloadWithSiputzx(url) {
  const { data: initialResponse } = await axios.get(`${SIPUTZX_API}/download`, {
    params: { url, type: 'audio', apikey: 'nbteam' },
    timeout: 30000
  })
  let finalData = initialResponse
  let attempts = 0
  while (finalData.status !== 'completed' && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 3000))
    const { data: checkData } = await axios.get(`${SIPUTZX_API}/download`, {
      params: { url, type: 'audio', apikey: 'nbteam' },
      timeout: 30000
    })
    finalData = checkData
    attempts++
    if (finalData.status === 'error') throw new Error(finalData.error || 'API Error')
  }
  if (finalData.status !== 'completed' || !finalData.fileUrl) {
    throw new Error('Se agotó el tiempo de espera en Siputzx')
  }
  const downloadUrl = `${SIPUTZX_API}${finalData.fileUrl}`
  const buffer = await fetchBuffer(downloadUrl)
  return { buffer, title: finalData.title || 'YouTube Audio', thumbnail: finalData.thumbnail, duration: '', quality: '', ext: 'mp3', source: 'siputzx' }
}

async function handler(m, { conn, usedPrefix, command, args }) {
  const url = String(args[0] || m.quoted?.text || '').trim()
  if (!url || !/^https?:\/\//i.test(url)) {
    return m.reply(
      `🎵 *DESCARGAR AUDIO DE YOUTUBE*\n\n` +
      `> Envía el enlace del video.\n\n` +
      `*Uso:*\n` +
      `> \`${usedPrefix || '.'}${command} https://youtube.com/watch?v=...\``
    )
  }

  await m.react('⏳').catch(() => {})
  await m.reply('🎵 *Procesando audio...*\n> Espera un momento, estoy descargando tu audio.').catch(() => {})

  let lastErr
  for (const fn of [downloadWithYosoyyo, downloadWithSiputzx]) {
    try {
      const r = await fn(url)
      const safeName = String(r.title).replace(/[\\/:*?"<>|]/g, '_').slice(0, 80) || 'audio'
      const mimetype = r.ext === 'webm' ? 'audio/webm' : r.ext === 'mp3' ? 'audio/mpeg' : 'audio/mp4'

      const caption =
        `╭━━━〔 *YOUTUBE AUDIO* 〕━━━╮\n` +
        `┃ 🎵 *Título:* ${r.title}\n` +
        (r.duration ? `┃ ⏱ *Duración:* ${r.duration}\n` : '') +
        (r.quality ? `┃ 🎚 *Calidad:* ${r.quality}\n` : '') +
        `┃ 📦 *Fuente:* ${r.source}\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`

      if (r.thumbnail) {
        await conn.sendMessage(m.chat, { image: { url: r.thumbnail }, caption }, { quoted: m }).catch(() => {})
      }

      await conn.sendMessage(m.chat, {
        audio: r.buffer,
        mimetype,
        fileName: `${safeName}.${r.ext || 'm4a'}`
      }, { quoted: m })

      await m.react('✅').catch(() => {})
      return
    } catch (e) {
      lastErr = e
    }
  }

  await m.react('❌').catch(() => {})
  return m.reply(`❌ No pude descargar el audio.\n> ${lastErr?.message || lastErr}`)
}

export { pluginConfig as config, handler }
