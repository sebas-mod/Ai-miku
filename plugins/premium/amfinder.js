/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from 'axios'
import sharp from 'sharp'
import * as cheerio from 'cheerio'

const pluginConfig = {
    name: "amfinder",
    alias: [],
    category: "premium",
    description: "amfinder <url tiktok>",
    usage: ".amfinder <url tiktok>",
    example: ".amfinder <url tiktok>",
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const TIMEOUT = 20000
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

async function resolveTikTokUrl(url) {
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

function extractVideoId(url) {
  const match = String(url || '').match(/\/(?:video|photo)\/(\d+)/)
  return match ? match[1] : null
}

function extractAlightMotionLinks(text) {
  if (!text) return []
  const patterns = [
    /https?:\/\/alight\.link\/[A-Za-z0-9_-]+/gi,
    /https?:\/\/alightcreative\.com\/am\/share\/[A-Za-z0-9/_-]+/gi,
    /https?:\/\/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|s\.id\/|bit\.ly\/|tinyurl\.com\/)[A-Za-z0-9/_?=-]+/gi
  ]
  const found = new Set()
  for (const reg of patterns) {
    const matches = text.match(reg) || []
    for (const m of matches) found.add(m.trim())
  }
  return [...found]
}

async function searchEngineXrina(url) {
  const res = await axios.get('https://apiii-xrina.my.id/search/amfinder', {
    params: { url },
    timeout: TIMEOUT,
    headers: { 'User-Agent': UA }
  })
  const d = res.data
  if (!d || (!d.result && !d.data)) throw new Error('Engine 1 tidak menemukan data.')
  const r = d.result || d.data
  const links = []
  if (Array.isArray(r.presets)) links.push(...r.presets)
  if (Array.isArray(r.links)) links.push(...r.links)
  if (typeof r.preset === 'string') links.push(r.preset)
  if (typeof r.xml === 'string') links.push(r.xml)
  for (const l of extractAlightMotionLinks(JSON.stringify(r))) {
    if (!links.includes(l)) links.push(l)
  }
  if (!links.length) throw new Error('Preset tidak ditemukan di Engine 1.')
  return {
    source: 'Xrina Engine',
    title: r.title || r.desc || 'Preset Alight Motion',
    author: r.author || r.username || '-',
    thumbnail: r.thumbnail || r.cover || null,
    links
  }
}

async function searchEngineIzzcs(url) {
  const res = await axios.post(
    'https://preset-finder.izzcs.my.id/api/find',
    { url },
    {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': UA,
        'Content-Type': 'application/json',
        Origin: 'https://preset-finder.izzcs.my.id',
        Referer: 'https://preset-finder.izzcs.my.id/'
      }
    }
  )
  const d = res.data
  const links = []
  if (Array.isArray(d?.presets)) links.push(...d.presets)
  if (Array.isArray(d?.links)) links.push(...d.links)
  for (const l of extractAlightMotionLinks(JSON.stringify(d || {}))) {
    if (!links.includes(l)) links.push(l)
  }
  if (!links.length) throw new Error('Preset tidak ditemukan di Engine 2.')
  return {
    source: 'Izzcs Engine',
    title: d?.title || 'Preset Alight Motion',
    author: d?.author || '-',
    thumbnail: d?.thumbnail || d?.cover || null,
    links
  }
}

async function searchEngineComments(url) {
  const fullUrl = await resolveTikTokUrl(url)
  const videoId = extractVideoId(fullUrl)
  if (!videoId) throw new Error('ID Video TikTok tidak dapat dikenali.')

  const foundLinks = new Set()
  let title = 'TikTok Preset'
  let author = '-'
  let thumbnail = null

  try {
    const pageRes = await axios.get(fullUrl, { headers: { 'User-Agent': UA }, timeout: 15000 })
    const $ = cheerio.load(pageRes.data)
    const metaDesc = $('meta[property="og:description"]').attr('content') || $('title').text() || ''
    if (metaDesc) title = metaDesc.slice(0, 100)
    for (const l of extractAlightMotionLinks(pageRes.data)) foundLinks.add(l)
  } catch {}

  for (let cursor = 0; cursor <= 60; cursor += 20) {
    try {
      const apiUrl = `https://www.tiktok.com/api/comment/list/?aweme_id=${videoId}&count=20&cursor=${cursor}`
      const cRes = await axios.get(apiUrl, {
        headers: { 'User-Agent': UA, Referer: fullUrl },
        timeout: 12000
      })
      const comments = cRes.data?.comments || []
      if (!comments.length) break
      for (const c of comments) {
        for (const l of extractAlightMotionLinks(c.text || '')) foundLinks.add(l)
      }
      if (!cRes.data?.has_more) break
    } catch {
      break
    }
  }

  if (!foundLinks.size) throw new Error('Tidak ditemukan tautan preset pada deskripsi maupun komentar video ini.')
  return {
    source: 'TikTok Comment Scanner',
    title,
    author,
    thumbnail,
    links: [...foundLinks]
  }
}

async function handler(m, ctx = {}) {
  const { conn, sock } = ctx;
  const text = ctx.text ?? m.text ?? '';
  const args = ctx.args || m.args || [];
  const usedPrefix = ctx.usedPrefix || m.prefix || '.';
  const command = String(ctx.command || m.command || 'amfinder').toLowerCase();
  const client = conn || sock
  const inputUrl = (text || args[0] || m.quoted?.text || '').trim()

  if (!inputUrl || !/tiktok\.com/i.test(inputUrl)) {
    return m.reply(
      `🔍 *ALIGHT MOTION PRESET FINDER*\n\n` +
      `Cari tautan preset Alight Motion (5MB / XML / Drive) dari link video TikTok.\n\n` +
      `📌 *Cara Pakai:*\n` +
      `\`${usedPrefix + command} <url video TikTok>\`\n\n` +
      `_Powered by Elysia Assistant_`
    )
  }

  await m.react('🔎')

  let result = null
  const engines = [searchEngineXrina, searchEngineIzzcs, searchEngineComments]
  for (const engine of engines) {
    try {
      result = await engine(inputUrl)
      if (result && result.links?.length) break
    } catch {}
  }

  if (!result || !result.links?.length) {
    await m.react('❌')
    return m.reply('❌ *Preset tidak ditemukan* pada video TikTok tersebut.')
  }

  let caption = `✨ *PRESET ALIGHT MOTION DITEMUKAN* ✨\n\n`
  caption += `• *Judul* : ${result.title}\n`
  if (result.author && result.author !== '-') caption += `• *Kreator* : ${result.author}\n`
  caption += `• *Sumber* : ${result.source}\n`
  caption += `• *Total Link* : ${result.links.length}\n\n`
  caption += `🔗 *Daftar Link Preset:*\n`
  result.links.slice(0, 15).forEach((lnk, i) => {
    caption += `${i + 1}. ${lnk}\n`
  })
  caption += `\n_Elysia Assistant by Arthazy_`

  if (result.thumbnail) {
    try {
      const imgRes = await axios.get(result.thumbnail, { responseType: 'arraybuffer', timeout: 10000 })
      const jpg = await sharp(Buffer.from(imgRes.data)).jpeg({ quality: 88 }).toBuffer()
      await client.sendMessage(m.chat, { image: jpg, caption }, { quoted: m })
      await m.react('✅')
      return
    } catch {}
  }

  await m.react('✅')
  return m.reply(caption)
}

export { pluginConfig as config, handler }
