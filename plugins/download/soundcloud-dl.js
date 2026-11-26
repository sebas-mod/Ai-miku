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

const reactTo = MikuRuntime.reactTo;

const pluginConfig = {
    name: "soundcloud-dl",
    alias: ["soundclouddl"],
    category: "download",
    description: "Fitur download soundcloud-dl",
    usage: ".soundcloud-dl",
    example: ".soundcloud-dl",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const API = 'https://api-v2.soundcloud.com'
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  const LINE = '─────────────────────'
  const MAX_BYTES = 60 * 1024 * 1024
  let cachedClientId = null

  async function fetchClientId(force = false) {
      if (cachedClientId && !force) return cachedClientId
      const html = await (await fetch('https://soundcloud.com/', { headers: { 'User-Agent': UA } })).text()
      const scripts = [...html.matchAll(/<script[^>]+src="(https:\/\/[^"]+\.js)"/g)].map(x => x[1]).reverse()
      for (const src of scripts) {
          try {
              const js = await (await fetch(src, { headers: { 'User-Agent': UA } })).text()
              const mm = js.match(/client_id\s*:\s*"([0-9a-zA-Z]{32})"/)
              if (mm) return (cachedClientId = mm[1])
          } catch {}
      }
      throw new Error('Error al obtener el client_id de SoundCloud')
  }

  async function api(path, params = {}, retry = true) {
      const client_id = await fetchClientId()
      const u = path.startsWith('http') ? new URL(path) : new URL(path, API)
      u.searchParams.set('client_id', client_id)
      for (const [k, v] of Object.entries(params)) if (v != null) u.searchParams.set(k, String(v))
      const res = await fetch(u, { headers: { 'User-Agent': UA, Accept: 'application/json' }, redirect: 'follow' })
      if ((res.status === 401 || res.status === 403) && retry) { await fetchClientId(true); return api(path, params, false) }
      if (!res.ok) throw new Error(`SoundCloud API ${res.status}`)
      return res.json()
  }

  function normalizeUrl(input) {
      let url = String(input || '').trim().replace(/^['"<]|['">]$/g, '').replace(/\s+/g, '')
      if (!url) throw new Error('URL vacía')
      url = url.replace(/^https?:\/\/m\.soundcloud\.com/i, 'https://soundcloud.com')
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url
      url = url.replace(/^http:/i, 'https:')
      let p
      try { p = new URL(url) } catch { throw new Error('Formato de URL no reconocido') }
      if (!/(^|\.)soundcloud\.com$|(^|\.)snd\.sc$/i.test(p.hostname)) throw new Error('La URL no es de SoundCloud')
      p.hash = ''; p.search = ''
      return (p.origin + p.pathname).replace(/\/+$/, '')
  }

  async function resolve(url) {
      let clean = normalizeUrl(url)
      if (/on\.soundcloud\.com|snd\.sc/i.test(clean)) {
          try {
              const r = await fetch(clean, { redirect: 'manual', headers: { 'User-Agent': UA } })
              const loc = r.headers.get('location')
              if (loc) clean = normalizeUrl(loc)
          } catch {}
      }
      let data = await api('/resolve', { url: clean }).catch(() => null)
      if (!data?.kind) data = await api('/resolve', { url: clean.replace('://soundcloud.com', '://www.soundcloud.com') }).catch(() => null)
      if (!data?.kind) throw new Error('Enlace no encontrado o no se pudo resolver.')
      return data
  }

  async function streamUrl(tr) {
      if (!tr?.url) return null
      try { return (await api(tr.url))?.url || null } catch { return null }
  }

  const meta = (t) => ({
      id: t.id, title: t.title, artist: t.user?.username || t.user?.full_name || '-', artistUrl: t.user?.permalink_url,
      durationSec: Math.round((t.duration || 0) / 1000), genre: t.genre, url: t.permalink_url,
      artwork: (t.artwork_url || t.user?.avatar_url || '').replace('-large', '-t500x500') || null,
      plays: t.playback_count, likes: t.likes_count, created: t.created_at, media: t.media
  })

  async function audioOf(t) {
      const trans = t.media?.transcodings || []
      const prog = trans.find(x => x.format?.protocol === 'progressive' && x.format?.mime_type?.includes('mpeg'))
      const hls = trans.find(x => x.format?.protocol === 'hls' && /mpeg|mp4/.test(x.format?.mime_type || ''))
      const progUrl = await streamUrl(prog)
      if (progUrl) return { url: progUrl, direct: true }
      const hlsUrl = await streamUrl(hls)
      return hlsUrl ? { url: hlsUrl, direct: false } : null
  }

  async function loadTrack(t) {
      if (!t.media) t = await api(`/tracks/${t.id}`)
      return t
  }

  const dur = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const nf = (n) => Number(n || 0).toLocaleString('id-ID')

  async function sendTrack(sock, m, reply, raw) {
      const t = meta(await loadTrack(raw))
      const cap = [`*🎧 ${t.title}*`, LINE, `Artista: ${t.artist}`, `Duración: ${dur(t.durationSec)}`, t.genre && `Genre  : ${t.genre}`,
          `Reproduc.: ${nf(t.plays)} • ❤️ ${nf(t.likes)}`, `Enlace : ${t.url}`].filter(Boolean).join('\n')
      if (t.artwork) { try { await sock.sendMessage(m.chat, { image: { url: t.artwork }, caption: cap }, { quoted: m }) } catch { await reply(cap) } }
      else await reply(cap)

      const a = await audioOf(t)
      if (!a) throw new Error('Stream de audio no disponible (la pista puede ser premium o estar bloqueada por región).')
      if (!a.direct) throw new Error(`La pista solo está disponible en formato HLS y no se puede enviar directamente.\nEscúchala: ${t.url}`)
      if (t.durationSec > 20 * 60) throw new Error(`La pista es demasiado larga (${dur(t.durationSec)}). Escúchala: ${t.url}`)
      const r = await axios.get(a.url, { responseType: 'arraybuffer', timeout: 120000, maxContentLength: MAX_BYTES, headers: { 'User-Agent': UA } })
      await sock.sendMessage(m.chat, { audio: Buffer.from(r.data), mimetype: 'audio/mpeg', fileName: `${t.artist} - ${t.title}.mp3` }, { quoted: m })
  }

  async function handler(m, { sock, text, prefix, command, reply }) {
      const parts = String(text || '').trim().split(/\s+/).filter(Boolean)
      if (!parts[0]) return reply(`*🎧 SOUNDCLOUD*\n${LINE}\n${prefix}${command} <enlace de pista>\n${prefix}${command} <enlace de lista>\n${prefix}${command} <enlace de lista> <número de canción>\n\nCompatible con soundcloud.com, m.soundcloud.com, on.soundcloud.com`)
      try {
          await reactTo(sock, m, '⏳')
          const data = await resolve(parts[0])

          if (data.kind === 'track') {
              await sendTrack(sock, m, reply, data)
          } else if (data.kind === 'playlist' || data.kind === 'system-playlist') {
              const list = data.tracks || []
              if (!list.length) throw new Error('Lista de reproducción vacía.')
              const n = parseInt(parts[1], 10)
              if (n) {
                  if (n < 1 || n > list.length) throw new Error(`El número debe estar entre 1 y ${list.length}.`)
                  await sendTrack(sock, m, reply, list[n - 1])
              } else {
                  const shown = list.slice(0, 25), ids = shown.map(x => x.id).filter(Boolean)
                  let full = []
                  try { const d = await api('/tracks', { ids: ids.join(','), limit: ids.length }); full = Array.isArray(d) ? d : d?.collection || [] } catch {}
                  const map = new Map(full.map(x => [x.id, x]))
                  const lines = shown.map((x, i) => { const t = map.get(x.id) || x; return `${i + 1}. *${t.title || '(sin cargar)'}*${t.user?.username ? ` — ${t.user.username}` : ''}${t.duration ? ` (${dur(Math.round(t.duration / 1000))})` : ''}` })
                  await reply(`*💿 ${data.title || data.short_title || 'Playlist'}*\n${LINE}\nPor: ${data.user?.username || 'SoundCloud'} • ${data.track_count || list.length} canciones\n\n${lines.join('\n')}${list.length > 25 ? `\n… y ${list.length - 25} canciones más` : ''}\n\nEnviar canción: *${prefix}${command} ${parts[0]} <número>*`)
              }
          } else {
              throw new Error(`Jenis link "${data.kind}" aún no está disponible. Envía un enlace de canción o de lista de reproducción.`)
          }
          await reactTo(sock, m, '✅')
      } catch (e) {
          await reactTo(sock, m, '❌')
          reply(`❌ ${e.response?.status ? `HTTP ${e.response.status}: ` : ''}${e.message || 'Error al procesar.'}`)
      }
  }

export { pluginConfig as config, handler }
