/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const DEFAULT_PP = 'https://i.ibb.co.com/QFzm9pSF/1546d15ce5dd2946573b3506df109d00.jpg'

const cache = new Map()
const inflight = new Map()
const CACHE_TTL = 900000
const FETCH_TIMEOUT = 2000

function cleanExpired() {
    const now = Date.now()
    for (const [key, entry] of cache) {
        if (now - entry.ts > CACHE_TTL * 4) cache.delete(key)
    }
}

setInterval(cleanExpired, 300000).unref?.()

function withTimeout(promise, ms) {
    let t
    return Promise.race([
        promise,
        new Promise((_, reject) => { t = setTimeout(() => reject(new Error('timeout')), ms) })
    ]).finally(() => clearTimeout(t))
}

async function getProfilePicture(sock, jid) {
    const cached = cache.get(jid)
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.url
    if (inflight.has(jid)) return inflight.get(jid)

    const job = (async () => {
        let url
        try {
            url = await withTimeout(sock.profilePictureUrl(jid, 'image'), FETCH_TIMEOUT)
            cache.set(jid, { url, ts: Date.now() })
        } catch {
            // Gagal/timeout: pakai foto lama jika ada, jika tidak pakai gambar default
            // (dicatat singkat agar percobaan berikutnya tidak menunggu lagi)
            url = cached?.url || DEFAULT_PP
            cache.set(jid, { url, ts: Date.now() - CACHE_TTL + 60000 })
        }
        return url
    })().finally(() => inflight.delete(jid))

    inflight.set(jid, job)
    return job
}

async function getProfileBuffer(sock, jid) {
    const url = await getProfilePicture(sock, jid)
    try {
        const { f } = await import('./http.js')
        const res = await f(url, 'buffer')
        return res ? Buffer.from(res) : null
    } catch {
        return null
    }
}

function clearCache(jid) {
    if (jid) return cache.delete(jid)
    cache.clear()
}

export { getProfilePicture, getProfileBuffer, clearCache, DEFAULT_PP }
