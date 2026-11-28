import { MikuRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'

const sendAlbum = MikuRuntime.sendAlbum;

const pluginConfig = {
    name: "pinterest",
    alias: ["caripin", "pinsearch", "buscarpin", "pin"],
    category: "search",
    description: "Busca imágenes en Pinterest o descarga desde un enlace.",
    usage: ".pinterest <búsqueda>",
    example: ".pinterest zhao lusi",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
const baseHeaders = {
    'user-agent': UA,
    'accept-language': 'en-US,en;q=0.9',
    referer: 'https://www.pinterest.com/'
}
const PIN_URL = /^https?:\/\/(?:[a-z0-9-]+\.)?(?:pinterest\.[a-z.]+|pin\.it)\/\S+/i
const YO_API = 'https://api-yosoyyo-api-ofc.onrender.com/api/pinterest'
const YO_KEY = 'sebasapi2024'

function cleanMediaUrl(u) {
    try {
        let cl = String(u).trim()
        const em = cl.match(/^(.+?\.(?:jpg|jpeg|png|webp|mp4|m3u8))/i)
        if (em) cl = em[1]
        cl = cl.replace(/\\u002F/g, '/').replace(/\\u0026/g, '&').replace(/\\\//g, '/')
        const ur = new URL(cl)
        ur.search = ''
        return ur.toString()
    } catch {
        const em = String(u).match(/https:\/\/[a-z0-9.-]*pinimg\.com\/.+?\.(?:jpg|jpeg|png|webp|mp4|m3u8)/i)
        return em ? em[0] : u
    }
}
const hlsToMp4 = (u) => u.endsWith('.m3u8') ? u.replace('/hls/', '/720p/').replace('.m3u8', '.mp4') : u

async function searchPinterestYosoyyo(query, limit) {
    const { data } = await axios.get(YO_API, {
        params: { q: query, limite: limit, apiKey: YO_KEY },
        timeout: 30000,
        headers: { 'User-Agent': UA }
    })
    const items = Array.isArray(data?.result) ? data.result : []
    const mapped = items.map(it => ({
        title: it?.titulo || 'Pinterest',
        author: it?.autor || 'Desconocido',
        likes: it?.likes || '0',
        type: String(it?.tipo || 'imagen').toLowerCase(),
        url: it?.url || '',
        image: it?.descarga || it?.download || it?.image || ''
    })).filter(it => it.image)
    if (!mapped.length) throw new Error('Sin resultados de la API')
    return mapped.slice(0, limit)
}

async function searchPinterestFallback(query, limit) {
    const data = encodeURIComponent(JSON.stringify({ options: { query } }))
    const res = await axios.head(`https://www.pinterest.com/resource/BaseSearchResource/get/?data=${data}`, {
        headers: { ...baseHeaders, 'screen-dpr': '4', 'x-pinterest-pws-handler': 'www/search/[scope].js' },
        validateStatus: () => true,
        timeout: 20000
    })
    const link = res.headers.link || ''
    const re = /<\s*(https:\/\/i\.pinimg\.com\/[^>]+)\s*>\s*;\s*rel=preload;\s*as=image/gi
    const images = [...new Set([...String(link).matchAll(re)].map(v => v[1]))].slice(0, limit)
    if (!images.length) throw new Error('Imagen no encontrada, prueba con otra palabra clave.')
    return images.map(u => ({ title: query, author: 'Pinterest', likes: '-', type: 'imagen', url: '', image: u }))
}

async function downloadPinterest(inputUrl) {
    const initial = await axios.get(inputUrl, { headers: baseHeaders, maxRedirects: 5, validateStatus: () => true, timeout: 30000 })
    const finalUrl = initial.request?.res?.responseUrl || initial.config?.url || inputUrl
    const pinId = (inputUrl.match(/\/pin\/(\d+)/i) || finalUrl.match(/\/pin\/(\d+)/i) || [])[1]

    if (pinId) {
        const cleanUrl = `https://www.pinterest.com/pin/${pinId}/`
        const api = `https://www.pinterest.com/resource/PinResource/get/?data=${encodeURIComponent(JSON.stringify({
          options: { id: pinId, field_set_key: 'detailed' }
      }))}`
        const apiRes = await axios.get(api, {
            headers: { ...baseHeaders, 'x-pinterest-pws-handler': 'www/pin/[id].js', accept: 'application/json, text/javascript, */*, q=0.01', referer: cleanUrl },
            validateStatus: () => true,
            timeout: 30000
        })
        const pin = apiRes.data?.resource_response?.data
        if (pin) {
            const title = String(pin.title || pin.grid_title || pin.closeup_unified_description || 'Medios de Pinterest').trim()
            const videoList = pin.videos?.video_list || pin.story_pin_data?.pages?.[0]?.blocks?.[0]?.video?.video_list
            if (videoList) {
                const order = ['V_1080P', 'V_720P', 'V_EXP4', 'V_EXP3', 'V_EXP7', 'V_480P', 'V_HLSV4']
                let key = order.find(q => videoList[q]?.url) || Object.keys(videoList).find(k => videoList[k]?.url)
                if (key) {
                    const u = videoList[key].url
                    return { type: 'video', title, quality: u.endsWith('.m3u8') ? '720p' : key.replace(/^V_/, '').toLowerCase(), url: hlsToMp4(u), source: cleanUrl }
                }
            }
            const img = pin.images || {}
            const best = img.orig?.url || img['736x']?.url || img['564x']?.url || img['474x']?.url
            if (best) return { type: 'image', title, url: best, source: cleanUrl }
        }
    }

    const html = typeof initial.data === 'string' ? initial.data : JSON.stringify(initial.data || '')
    const find = (re) => [...html.matchAll(re)].map(v => cleanMediaUrl(v[0]))
    const videos = [...new Set([...find(/https:\/\/[a-z0-9.-]*pinimg\.com\/videos\/[^"'\\\s<>]+\.mp4/gi), ...find(/https:\/\/[a-z0-9.-]*pinimg\.com\/videos\/[^"'\\\s<>]+\.m3u8/gi)])]
    if (videos.length) return { type: 'video', title: 'Video de Pinterest', quality: '720p', url: hlsToMp4(videos[0]), source: finalUrl }
    const images = [...new Set([...find(/https:\/\/i\.pinimg\.com\/originals\/[^"'\\\s<>()]+?\.(?:jpg|jpeg|png|webp)/gi), ...find(/https:\/\/i\.pinimg\.com\/736x\/[^"'\\\s<>()]+?\.(?:jpg|jpeg|png|webp)/gi)])].filter(u => !/logo|favicon|default|75x75|60x60/i.test(u))
    if (images.length) return { type: 'image', title: 'Imagen de Pinterest', url: images[0], source: finalUrl }
    throw new Error('No se encontraron medios en ese enlace.')
}

const react = (sock, m, text) => sock.sendMessage(m.chat, { react: { text, key: m.key } }).catch(() => null)

async function handler(m, { sock, text, prefix, reply, command }) {
    const input = String(text || '').trim()
    if (!input) {
        return reply(
            `📌 *PINTEREST SEARCH*\n\n` +
            `> Busca imágenes o descarga desde un enlace.\n\n` +
            `*Uso:*\n` +
            `> \`${prefix}${command} zhao lusi\`\n` +
            `> \`${prefix}${command} zhao lusi | 8\`\n` +
            `> \`${prefix}${command} https://pin.it/xxx\``
        )
    }

    await react(sock, m, '🔎')
    await reply(`🔎 *Buscando en Pinterest...*\n> ${input}`).catch(() => {})

    try {
        if (PIN_URL.test(input.split(/\s+/)[0])) {
            const r = await downloadPinterest(input.split(/\s+/)[0])
            const caption =
                `╭━━━〔 *PINTEREST* 〕━━━╮\n` +
                `┃ 📌 *Título:* ${r.title}\n` +
                `┃ 🗂 *Tipo:* ${r.type === 'video' ? `Video (${r.quality})` : 'Imagen'}\n` +
                `┃ 🔗 *Fuente:* ${r.source}\n` +
                `╰━━━━━━━━━━━━━━━━━━━━╯`
            if (r.type === 'video') {
                await sock.sendMessage(m.chat, { video: { url: r.url }, mimetype: 'video/mp4', caption }, { quoted: m })
            } else {
                await sock.sendMessage(m.chat, { image: { url: r.url }, caption }, { quoted: m })
            }
            return react(sock, m, '✅')
        }

        const [qRaw, nRaw] = input.split('|').map(s => s.trim())
        const query = qRaw
        const limit = Math.min(10, Math.max(1, parseInt(nRaw, 10) || 10))

        let items
        try {
            items = await searchPinterestYosoyyo(query, limit)
        } catch {
            items = await searchPinterestFallback(query, limit)
        }

        const captionHead =
            `╭━━━〔 *PINTEREST SEARCH* 〕━━━╮\n` +
            `┃ 🔎 *Búsqueda:* ${query}\n` +
            `┃ 📦 *Resultados:* ${items.length}\n` +
            `╰━━━━━━━━━━━━━━━━━━━━╯`

        const sent = await sendAlbum(sock, m.chat, items.map((it, i) => ({
            type: 'image',
            url: it.image,
            headers: baseHeaders,
            caption: i === 0 ? captionHead : ''
        })), { quoted: m, headers: baseHeaders })

        if (!sent) {
            // fallback: send first image with details
            const first = items[0]
            const detail = captionHead + `\n\n*1.* ${first.title}\n👤 ${first.author} • ❤ ${first.likes}\n${first.url || ''}`
            await sock.sendMessage(m.chat, { image: { url: first.image }, caption: detail }, { quoted: m })
        }
        return react(sock, m, '✅')
    } catch (e) {
        await react(sock, m, '❌')
        return reply(`❌ ${e.response?.data?.message || e.message}`)
    }
}

export { pluginConfig as config, handler }
