/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from 'axios'
import * as cheerio from 'cheerio'

const pluginConfig = {
    name: "amfind2",
    alias: ["caripreset"],
    category: "premium",
    description: "amfind2 <url tiktok>",
    usage: ".amfind2 <url tiktok>",
    example: ".amfind2 <url tiktok>",
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

async function resolveShortUrl(url) {
  try {
    const res = await axios.get(url, {
      maxRedirects: 5,
      timeout: 15000,
      headers: { 'User-Agent': UA }
    })
    return res.request?.res?.responseUrl || url
  } catch {
    return url
  }
}

function getAwemeId(url) {
  const m = String(url || '').match(/\/(?:video|photo)\/(\d+)/)
  return m ? m[1] : null
}

function scanPresetUrls(str) {
  if (!str) return []
  const regexes = [
    /https?:\/\/alight\.link\/[A-Za-z0-9_-]+/gi,
    /https?:\/\/alightcreative\.com\/am\/share\/[A-Za-z0-9/_-]+/gi,
    /https?:\/\/drive\.google\.com\/(?:file\/d\/|drive\/folders\/|open\?id=)[A-Za-z0-9/_?=-]+/gi,
    /https?:\/\/(?:mediafire\.com\/file\/|s\.id\/|bit\.ly\/)[A-Za-z0-9/_?=-]+/gi
  ]
  const out = new Set()
  for (const rgx of regexes) {
    for (const match of str.match(rgx) || []) {
      out.add(match.trim())
    }
  }
  return [...out]
}

async function scanTikTokForPresets(rawUrl) {
  const resolved = await resolveShortUrl(rawUrl)
  const videoId = getAwemeId(resolved)
  if (!videoId) throw new Error('URL TikTok no válido o ID vídeo no encontrado.')

  const links = new Set()
  let captionText = ''
  let author = '-'

  try {
    const htmlRes = await axios.get(resolved, { headers: { 'User-Agent': UA }, timeout: 15000 })
    const $ = cheerio.load(htmlRes.data)
    captionText = $('meta[property="og:description"]').attr('content') || $('title').text() || ''
    for (const u of scanPresetUrls(htmlRes.data)) links.add(u)
  } catch {}

  let scannedComments = 0
  for (let cursor = 0; cursor <= 100; cursor += 20) {
    try {
      const { data } = await axios.get(
        `https://www.tiktok.com/api/comment/list/?aweme_id=${videoId}&count=20&cursor=${cursor}`,
        { headers: { 'User-Agent': UA, Referer: resolved }, timeout: 12000 }
      )
      const comments = data?.comments || []
      if (!comments.length) break
      scannedComments += comments.length
      for (const c of comments) {
        if (!author || author === '-') author = c.user?.nickname || '-'
        for (const u of scanPresetUrls(c.text || '')) links.add(u)
      }
      if (!data?.has_more) break
    } catch {
      break
    }
  }

  return {
    videoId,
    resolvedUrl: resolved,
    caption: captionText.slice(0, 120) || 'Vídeo TikTok',
    scannedComments,
    links: [...links]
  }
}

async function handler(m, ctx = {}) {
  const text = ctx.text ?? m.text ?? '';
  const args = ctx.args || m.args || [];
  const usedPrefix = ctx.usedPrefix || m.prefix || '.';
  const command = String(ctx.command || m.command || 'amfind2').toLowerCase();
  const url = (text || args[0] || m.quoted?.text || '').trim()

  if (!url || !/tiktok\.com/i.test(url)) {
    return m.reply(
      `🔎 *PENCARI PRESET KOMENTAR TIKTOK*\n\n` +
      `Escanee descripciones y comentarios de videos TikTok para encontrar enlaces preestablecidos de Alight Motion / Google Drive.\n\n` +
      `📌 *Cara Pakai:*\n` +
      `\`${usedPrefix + command} <url TikTok>\``
    )
  }

  await m.react('⏳')
  try {
    const info = await scanTikTokForPresets(url)
    if (!info.links.length) {
      await m.react('❌')
      return m.reply(
        `⚠️ No se encontró ningún enlace preestablecido después del escaneo *${info.scannedComments}*comentarios en el vídeo.`
      )
    }

    let msg = `🎬 *RESULTADO DE ESCANEO PREESTABLECIDO TIKTOK*\n\n`
    msg += `• *ID de vídeo*: ${info.videoId}\n`
    msg += `• *Komentar Dipindai* : ${info.scannedComments}\n`
    msg += `• *Enlace encontrado*: ${info.links.length}\n\n`
    msg += `🔗 *Lista de enlaces:*\n`
    info.links.forEach((l, i) => {
      msg += `${i + 1}. ${l}\n`
    })
    msg += `\n_Ai Miku by Arthazy_`

    await m.react('✅')
    return m.reply(msg)
  } catch (e) {
    await m.react('❌')
    return m.reply(`❌ *Error:* ${e.message}`)
  }
}

export { pluginConfig as config, handler }
