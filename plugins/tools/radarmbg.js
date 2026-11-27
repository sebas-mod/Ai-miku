/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import fs from 'fs'
import os from 'os'
import path from 'path'

const pluginConfig = {
    name: "radarmbg",
    alias: [],
    category: "tools",
    description: "radarmbg <prov|kabko|kec|kel|sekolah|menu>",
    usage: ".radarmbg <prov|kabko|kec|kel|sekolah|menu>",
    example: ".radarmbg <prov|kabko|kec|kel|sekolah|menu>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const BASE_URL = 'https://www.bgn.go.id/radar-mbg'
  const SESSION_FILE = path.join(os.tmpdir(), 'radar_mbg_session.json')
  const CACHE_TTL = 15 * 60 * 1000
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  const MAX_ROWS = 40

  const PORSI_MAP = {
      small: 'Porciones pequeñas (TK/PAUD y SD clases 1–3)',
      large: 'Porción grande (SD clases 4–6, SMP, SMA/SMK, profesores y personal educativo)',
      balita: 'Niños pequeños (entre 6 y 59 meses)',
      pregnant: 'Ibu Hamil',
      nursing: 'Ibu Menyusui',
      sample: 'Muestras de alimentos'
  }

  async function launchBrowser() {
      const { default: puppeteer } = await import('puppeteer')
      const candidates = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser']
      const executablePath = candidates.find(p => p && fs.existsSync(p))
      return puppeteer.launch({
          headless: 'new',
          ...(executablePath ? { executablePath } : {}),
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--window-size=1280,800']
      })
  }

  function readSession() {
      try {
          const d = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'))
          if (Date.now() - (d.timestamp || 0) < CACHE_TTL && d.cookies?.length) return d
      } catch {}
      return null
  }

  async function ensureSession() {
      const cached = readSession()
      if (cached) return cached
      const browser = await launchBrowser()
      try {
          const page = await browser.newPage()
          await page.setViewport({ width: 1280, height: 800 })
          await page.setUserAgent(UA)
          await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 35000 })
          const t0 = Date.now()
          while (Date.now() - t0 < 10000) {
              const ok = await page.evaluate(() => !document.querySelector('#mbg-turnstile') || (window.turnstile?.getResponse?.()?.length > 10)).catch(() => false)
              if (ok) break
              await new Promise(r => setTimeout(r, 600))
          }
          const cookies = await page.cookies()
          const data = { timestamp: Date.now(), cookies }
          try { fs.writeFileSync(SESSION_FILE, JSON.stringify(data)) } catch {}
          return data
      } finally {
          await browser.close().catch(() => {})
      }
  }

  async function api(endpoint) {
      const session = await ensureSession()
      const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
      const headers = {
          'User-Agent': UA,
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          Referer: `${BASE_URL}/`,
          Cookie: (session.cookies || []).map(c => `${c.name}=${c.value}`).join('; ')
      }
      try {
          const res = await fetch(url, { headers, signal: AbortSignal.timeout(12000) })
          if (res.status === 200) return await res.json()
      } catch {}

      const browser = await launchBrowser()
      try {
          const page = await browser.newPage()
          await page.setUserAgent(UA)
          if (session.cookies?.length) await page.setCookie(...session.cookies)
          await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => {})
          const r = await page.evaluate(async (u) => {
              try {
                  const x = await fetch(u, { headers: { Accept: 'application/json' } })
                  const t = await x.text()
                  try { return { ok: true, data: JSON.parse(t) } } catch { return { ok: false, error: t.slice(0, 150) } }
              } catch (e) { return { ok: false, error: e.message } }
          }, url)
          if (r?.ok) return r.data
          try { fs.unlinkSync(SESSION_FILE) } catch {}
          throw new Error('El portal BGN rechazó la solicitud (posiblemente verificación de Cloudflare). Vuelve a intentarlo más tarde.')
      } finally {
          await browser.close().catch(() => {})
      }
  }

  const list = (title, rows, fmt) => {
      const shown = rows.slice(0, MAX_ROWS).map(fmt).join('\n')
      return `${title}\n\n${shown}${rows.length > MAX_ROWS ? `\n… y ${rows.length - MAX_ROWS} más` : ''}`
  }

  const ACTIONS = {
      prov: {
          alias: ['prov', 'provinsi'],
          run: async () => {
              const rows = (await api('/api/region/v1/provinsi?page_size=50'))?.data || []
              if (!rows.length) return 'No hay datos de provincias.'
              return list(`🗺️ *PROVINCIAS* (${rows.length})`, rows, p => `• *${p.kode_prov_dagri}* — ${p.provinsi}`) + `\n\nContinuar: .radarmbg kabko <código>`
          }
      },
      kabko: {
          alias: ['kabko', 'kabupaten', 'kota'], need: 'código de provincia, ejemplo: 31',
          run: async (k) => {
              const rows = (await api(`/api/region/v1/kabupaten-kota/dagri/${encodeURIComponent(k)}`))?.data || []
              if (!rows.length) return `No hay ciudades para el código ${k}.`
              return list(`🏙️ *CIUDADES* (${rows.length})`, rows, x => `• *${x.kode_kabko_dagri}* — ${x.kabupaten_kota}`) + `\n\nContinuar: .radarmbg kec <código>`
          }
      },
      kec: {
          alias: ['kec', 'kecamatan'], need: 'código de ciudad, ejemplo: 31.71',
          run: async (k) => {
              const rows = (await api(`/api/region/v1/kecamatan/dagri/${encodeURIComponent(k)}`))?.data || []
              if (!rows.length) return `No hay distritos para el código ${k}.`
              return list(`🏘️ *DISTRITOS* (${rows.length})`, rows, x => `• *${x.kode_kec_dagri}* — ${x.kecamatan}`) + `\n\nContinuar: .radarmbg kel <código>`
          }
      },
      kel: {
          alias: ['kel', 'kelurahan'], need: 'código de distrito, ejemplo: 31.71.01',
          run: async (k) => {
              const rows = (await api(`/api/region/v1/kelurahan/dagri/${encodeURIComponent(k)}`))?.data || []
              if (!rows.length) return `No hay barrios para el código ${k}.`
              return list(`🏡 *BARRIOS* (${rows.length})`, rows, x => `• *${x.kode_kel_dagri}* — ${x.kelurahan}`) + `\n\nContinuar:.radarmbg colegio <código>`
          }
      },
      sekolah: {
          alias: ['sekolah', 'instansi'], need: 'código de barrio, ejemplo: 31.71.01.1001',
          run: async (k) => {
              const rows = (await api(`/api/public-portal/public/v1/institutions?kode_kel_dagri=${encodeURIComponent(k)}&per_page=100`))?.data || []
              if (!rows.length) return `No hay colegios/centros para el código ${k}.`
              return list(`🏫 *COLEGIOS / CENTROS* (${rows.length})`, rows, x => `• *${x.id}* — ${x.nama}${x.jenjang || x.tingkat ? ` (${x.jenjang || x.tingkat})` : ''}${x.sppg?.nama ? `\n   SPPG: ${x.sppg.nama}` : ''}`) + `\n\nVer menú: .radarmbg menu <id>`
          }
      },
      menu: {
          alias: ['menu'], need: 'ID del colegio, ejemplo: SD-10023',
          run: async (id) => {
              const json = await api(`/api/public-portal/public/v1/institutions/${encodeURIComponent(id)}/menus`)
              const d = json?.data || json
              if (!d || (typeof d === 'object' && !Object.keys(d).length)) return 'El menú aún no se ha publicado o no se encontró el centro.'
              const g = d.kandungan_gizi || d.gizi || {}
              const v = (x, u) => (x ? `${x} ${u}` : '-')
              const porsiRaw = d.porsi || d.target_porsi || []
              const porsi = Array.isArray(porsiRaw) && porsiRaw.length ? porsiRaw.map(p => PORSI_MAP[String(p).toLowerCase()] || p) : []
              return (
                  `🍱 *MENÚ MBG DE HOY*\n\n` +
                  `🏫 ${d.instansi?.nama || d.nama_sekolah || id}\n` +
                  `📅 ${d.tanggal || new Date().toISOString().split('T')[0]}\n` +
                  `🍽️ ${d.nama_menu || d.menu || 'Menú de comida nutritiva gratuita'}\n` +
                  (d.deskripsi ? `📝 ${d.deskripsi}\n` : '') +
                  `\n*Valores nutricionales*\n` +
                  `• Energía : ${v(g.energi ?? g.kalori, 'kcal')}\n• Proteínas : ${v(g.protein, 'g')}\n• Grasas : ${v(g.lemak, 'g')}\n• Carbohidratos : ${v(g.karbohidrat, 'g')}\n• Fibra : ${v(g.serat, 'g')}\n` +
                  (porsi.length ? `\n*Destinatarios*\n${porsi.map(p => `• ${p}`).join('\n')}\n` : '') +
                  `\n👨‍🍳 SPPG: ${d.sppg?.nama || d.nama_sppg || '-'}`
              )
          }
      }
  }

  async function handler(m, { sock, text, reply, prefix, command }) {
      const [act, ...rest] = String(text || '').trim().split(/\s+/)
      const arg = rest.join(' ').trim()
      const key = Object.keys(ACTIONS).find(k => ACTIONS[k].alias.includes((act || '').toLowerCase()))

      if (!key) {
          return reply(
              `🍱 *RADAR MBG — BGN*\n\n` +
              `${prefix + command} prov\n` +
              `${prefix + command} kabko <kodeProv>  (31)\n` +
              `${prefix + command} kec <kodeKabko>  (31.71)\n` +
              `${prefix + command} kel <kodeKec>  (31.71.01)\n` +
              `${prefix + command} escuela <Excode> (31.71.01.1001)\n` +
              `${prefix + command} menu <idSekolah>  (SD-10023)\n\n` +
              `_Navega de la provincia al colegio y consulta el menú y los valores nutricionales de hoy._`
          )
      }
      const a = ACTIONS[key]
      if (a.need && !arg) return reply(`Indica ${a.need}\nEjemplo: ${prefix + command} ${key} ${a.need.split('ejemplo: ')[1]}`)

      await reply('⏳ Obteniendo datos del portal del BGN…')
      try {
          return reply(await a.run(arg))
      } catch (e) {
          return reply(`❌ ${e.message || 'Gagal mengambil data'}`)
      }
  }

export { pluginConfig as config, handler }
