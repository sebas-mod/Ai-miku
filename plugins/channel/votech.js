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
    name: "votech",
    alias: ["votesaluran"],
    category: "channel",
    description: "votech",
    usage: ".votech",
    example: ".votech",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const CREATOR = 'Arthazy'
  const SALURAN = 'https://whatsapp.com/channel/0029VabymHd4CrfnqPLPzk3n'
  const BASE_URL = 'https://pollchbyjiyyad-21.vercel.app'
  const POST_RE = /^https?:\/\/(?:www\.)?whatsapp\.com\/channel\/[\w-]+\/\d+/i

  let proxyPool = []
  let proxyIndex = 0
  let lastProxyFetch = 0
  let agents = null

  async function loadAgents() {
      if (agents !== null) return agents
      try {
          const [{ HttpsProxyAgent }, { SocksProxyAgent }] = await Promise.all([
              import('https-proxy-agent'),
              import('socks-proxy-agent')
          ])
          agents = { HttpsProxyAgent, SocksProxyAgent }
      } catch {
          agents = false
      }
      return agents
  }

  async function fetchProxies() {
      const now = Date.now()
      if (proxyPool.length && now - lastProxyFetch < 300_000) return proxyPool
      const pool = []

      try {
          const res = await axios.get('https://api.ikyyxd.my.id/v2l/proxy-free/ikyy-xsample', { timeout: 8000 })
          if (Array.isArray(res.data)) {
              for (const p of res.data) {
                  if (typeof p !== 'string' || !p.includes(':')) continue
                  const parts = p.trim().split(':')
                  if (parts.length >= 4) pool.push({ type: 'http', url: `http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}` })
              }
          }
      } catch {}

      if (pool.length < 5) {
          try {
              const res = await axios.get('https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&proxy_format=protocolipport&format=text&protocol=socks5&timeout=5000', { timeout: 8000 })
              if (typeof res.data === 'string') {
                  for (const line of res.data.split('\n')) {
                      const clean = line.trim()
                      if (clean.startsWith('socks5://')) pool.push({ type: 'socks5', url: clean })
                  }
              }
          } catch {}
      }

      if (pool.length) {
          proxyPool = pool
          lastProxyFetch = now
      }
      return proxyPool
  }

  async function nextAgent() {
      const lib = await loadAgents()
      if (!lib) return null
      await fetchProxies()
      if (!proxyPool.length) return null
      const item = proxyPool[proxyIndex++ % proxyPool.length]
      return item.type === 'socks5' ? new lib.SocksProxyAgent(item.url) : new lib.HttpsProxyAgent(item.url)
  }

  async function apiRequest(endpoint, { method = 'GET', data, timeout = 25_000, forceProxy = false } = {}) {
      const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          Origin: BASE_URL,
          Referer: `${BASE_URL}/`
      }
      const maxAttempts = forceProxy ? 4 : 3
      let lastError = null

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          const agent = forceProxy || attempt > 1 ? await nextAgent() : null
          try {
              const res = await axios({
                  method,
                  url: `${BASE_URL}${endpoint}`,
                  headers,
                  data,
                  timeout,
                  ...(agent ? { httpAgent: agent, httpsAgent: agent, proxy: false } : {})
              })
              return res.data
          } catch (err) {
              lastError = err
              const status = err.response?.status || 0
              const retryable = status === 429 || status === 403 || ['ECONNRESET', 'ETIMEDOUT'].includes(err.code)
              if (!retryable && attempt === 1 && !forceProxy) break
          }
      }
      throw lastError
  }

  function toText(v) {
      if (v == null) return ''
      if (typeof v === 'string') return v.trim()
      if (typeof v === 'number' || typeof v === 'boolean') return String(v)
      if (v instanceof Error) return v.message || String(v)
      if (typeof v === 'object') {
          for (const k of ['message', 'error', 'msg', 'detail', 'reason', 'result']) {
              const t = toText(v[k])
              if (t) return t
          }
          try { return JSON.stringify(v).slice(0, 300) } catch { return 'Error no reconocido' }
      }
      return String(v)
  }

  function errMessage(err) {
      const status = err?.response?.status
      const d = err?.response?.data
      let msg = ''
      if (typeof d === 'string' && d) {
          msg = /<html|<!doctype/i.test(d) ? `Server API mengembalikan halaman error${status ? ` (HTTP ${status})` : ''}` : d.slice(0, 200)
      } else if (d) {
          msg = toText(d)
      }
      if (!msg) msg = toText(err?.message) || toText(err) || 'Error no reconocido'
      if (status && !msg.includes(`${status}`)) msg += ` (HTTP ${status})`
      return msg
  }

  async function vote(url, pesan) {
      const res = await apiRequest('/api/vote', { method: 'POST', data: { url, pesan: String(pesan).trim() } })
      if (res?.status === true && res.result) return res.result
      throw new Error(toText(res?.error) || toText(res?.message) || toText(res) || 'La respuesta API no se reconoce')
  }

  async function checkStatus() {
      const res = await apiRequest('/')
      return typeof res === 'string' && res.includes('JIYYAD TOOLS')
  }

  async function handler(m, { text, prefix, reply }) {
      const p = prefix || '.'
      const args = String(text || '').trim().split(/\s+/).filter(Boolean)
      const started = Date.now()

      if (!args.length) {
          return reply(`Formato:\n${p}votech <enlace de publicación del canal> <mensaje>\n${p}votech status\n\nEjemplo:\n${p}votech https://whatsapp.com/channel/0029VbDyL6d9RZAh3JjEM325/100 vote`)
      }

      if (args[0].toLowerCase() === 'status') {
          try {
              const up = await checkStatus()
              return reply(`📡 *Estado de votación API*\n\n• Servidores: ${BASE_URL}\n• Estado: ${up ? 'Online ✅' : 'Tidak merespon ❌'}\n• Tiempo: ${Date.now() - started}EM`)
          } catch (e) {
              return reply(`❌ No se pudo verificar el estado: ${errMessage(e)}`)
          }
      }

      const [url, ...rest] = args
      const pesan = rest.join(' ').trim()
      if (!POST_RE.test(url)) {
          return reply(`El enlace debe ser un enlace de canal *publicación* (hay un número de publicación en la parte posterior).\nEjemplo: https://whatsapp.com/channel/0029VbDyL6d9RZAh3JjEM325/100`)
      }
      if (!pesan) return reply(`Se requiere mensaje de voto.\nEjemplo: ${p}votech ${url} vote`)

      try {
          const r = await vote(url, pesan)
          return reply(
              `✅ *Vote Terkirim*\n\n` +
              `• Saluran : ${r.channel ?? '-'}\n` +
              `• Post    : ${r.post ?? '-'}\n` +
              `• Total   : ${r.total ?? '-'}\n` +
              `• Tener éxito: ${r.success ?? '-'}\n` +
              `• Fallar: ${r.failed ?? '-'}\n` +
              `• Tiempo: ${Date.now() - started}EM\n\n` +
              `${r.message || 'Vote berhasil dikirim'}\n\n` +
              `_Creator: ${CREATOR} • ${SALURAN}_`
          )
      } catch (e) {
          console.error('[VOTECH]', errMessage(e))
          return reply(`❌ No pudo votar: ${errMessage(e)}`)
      }
  }

export { pluginConfig as config, handler }
