/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "jasdor",
    alias: [],
    category: "search",
    description: "jasdor",
    usage: ".jasdor",
    example: ".jasdor",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  const BASE = 'https://mouliishop.my.id'
  const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', Accept: 'application/json, text/plain, */*', Referer: `${BASE}/` }
  const BRANDS = ['kopken', 'tomoro', 'fore', 'starbucks', 'janjijiwa']
  const rp = (n) => (n || n === 0 ? 'Rp ' + Number(n).toLocaleString('id-ID') : '-')

  async function initialData() {
      const res = await fetch(BASE, { headers: { ...HEADERS, Accept: 'text/html' }, signal: AbortSignal.timeout(20000) })
      if (!res.ok) throw new Error(`No se puede acceder a Jasdor Moulii (HTTP ${res.status})`)
      const html = await res.text()
      const raw = html.match(/window\.__JASDOR_DATA__\s*=\s*(\{[\s\S]*?\});\s*<\/script>/)?.[1]
      if (!raw) throw new Error('No se encontraron datos iniciales de la página.')
      try { return JSON.parse(raw) } catch { throw new Error('El formato de datos de la página cambió (no JSON), necesita ajuste.') }
  }

  async function getJson(path) {
      const res = await fetch(`${BASE}${path}`, { headers: HEADERS, signal: AbortSignal.timeout(20000) })
      if (!res.ok) throw new Error(`Solicitud fallida (HTTP ${res.status})`)
      return res.json()
  }

  const brandOf = (b) => String(b || 'kopken').toLowerCase().replace(/\s+/g, '')
  const arr = (x) => (Array.isArray(x) ? x : Array.isArray(x?.data) ? x.data : Array.isArray(x?.outlets) ? x.outlets : Array.isArray(x?.menu) ? x.menu : Array.isArray(x?.products) ? x.products : [])

  async function handler(m, { text, reply, prefix, command }) {
      const [act = '', ...rest] = String(text || '').trim().split(/\s+/).filter(Boolean)
      const a = act.toLowerCase()
      const p = prefix + command
      try {
          if (!a || ['info', 'toko', 'store'].includes(a)) {
              const d = await initialData()
              const brands = (d.brands || []).map(b => `• ${b.name || b.id || b}${b.id ? ` (${b.id})` : ''}`).join('\n') || BRANDS.map(b => `• ${b}`).join('\n')
              const banners = (d.banners || []).slice(0, 5).map(b => `• ${b.title || b.name || b.text || ''}`).filter(x => x.length > 2).join('\n')
              return reply(`☕ *JASDOR MOULII*\n_Servicio de pedidos de café contemporáneo_\n\n*Marca*\n${brands}\n${banners ? `\n*Promo*\n${banners}\n` : ''}\n*Orden*\n${p} outlet <marca> <ciudad>\n${p} menú <marca> <código salida>\n${p} opciones <marca> <Código de salida> <ID de producto>\n${p} buscar <palabra>\n${p} paquetes`)
          }
          if (['bundle', 'bundles', 'paket'].includes(a)) {
              const list = (await initialData()).bundlePackages || []
              if (!list.length) return reply('Aún no hay ningún paquete de paquete.')
              return reply(`🎁 *PAKET BUNDLING* (${list.length})\n\n` + list.slice(0, 15).map(b => `• *${b.name || b.title}*${b.price ? ` — ${rp(b.price)}` : ''}${b.description ? `\n  ${String(b.description).slice(0, 100)}` : ''}`).join('\n'))
          }
          if (['outlet', 'cabang'].includes(a)) {
              const brand = brandOf(rest[0]); const q = rest.slice(1).join(' ')
              const list = arr(await getJson(`/api/brand/${encodeURIComponent(brand)}/outlets?search=${encodeURIComponent(q)}&lat=&lng=`))
              if (!list.length) return reply(`Puntos de venta ${brand}${q ? ` di "${q}"` : ''} extraviado.`)
              return reply(`📍 *OUTLET ${brand.toUpperCase()}* (${list.length})\n\n` + list.slice(0, 20).map(o => `• *${o.store_code || o.code || o.id}* — ${o.name || o.store_name}${o.address ? `\n  ${String(o.address).slice(0, 90)}` : ''}`).join('\n') + `\n\nMenu: ${p} menu ${brand} <código>`)
          }
          if (a === 'menu') {
              const brand = brandOf(rest[0]); const code = rest[1]
              if (!code) return reply(`Formato: ${p} menú <marca> <código salida>\nBuscar código a través de: ${p} outlet <marca> <ciudad>`)
              const list = arr(await getJson(`/api/brand/${encodeURIComponent(brand)}/menu?store_code=${encodeURIComponent(code)}`))
              if (!list.length) return reply('El menú está vacío o no se encuentra el outlet.')
              return reply(`☕ *MENU ${brand.toUpperCase()} — ${code}* (${list.length})\n\n` + list.slice(0, 30).map(x => {
                  const price = x.price ?? x.promo_price, orig = x.original_price ?? x.normal_price
                  return `• ${x.name}${x.sold_out || x.is_sold_out ? ' _(habis)_' : ''}\n  ${rp(price)}${orig && orig !== price ? ` ~${rp(orig)}~` : ''} • id ${x.id ?? x.product_id ?? '-'}`
              }).join('\n') + (list.length > 30 ? `\n… dan ${list.length - 30} otro` : ''))
          }
          if (['opsi', 'option', 'options'].includes(a)) {
              const [b, code, id] = rest
              if (!code || !id) return reply(`Formato: ${p} opsi <brand> <kodeOutlet> <idProduk>`)
              const j = await getJson(`/api/brand/${encodeURIComponent(brandOf(b))}/options?store_code=${encodeURIComponent(code)}&product_id=${encodeURIComponent(id)}`)
              const groups = arr(j?.options ? j.options : j)
              if (!groups.length) return reply('```' + JSON.stringify(j, null, 1).slice(0, 1500) + '```')
              return reply(`⚙️ *OPSI PRODUK ${id}*\n\n` + groups.map(g => `*${g.name || g.title}*\n` + arr(g.options || g.items || g.values).map(o => `  • ${o.name || o.label}${o.price ? ` (+${rp(o.price)})` : ''}`).join('\n')).join('\n\n'))
          }
          if (['cari', 'search'].includes(a)) {
              const q = rest[0] ? rest.join(' ').toLowerCase() : ''
              if (!q) return reply(`Formato: ${p} buscar <palabra>`)
              let list = (await initialData()).products || []
              list = list.filter(x => [x.name, x.category, x.description].some(v => String(v || '').toLowerCase().includes(q)))
              if (!list.length) return reply(`Ningún producto"${q}".`)
              return reply(`🔎 *RESULTADO"${q}"* (${list.length})\n\n` + list.slice(0, 20).map(x => `• ${x.name}${x.brand_id ? ` [${x.brand_id}]` : ''}${x.price ? ` — ${rp(x.price)}` : ''}`).join('\n'))
          }
          return reply(`Comando desconocido. Tipo *${p}* para ayudar.`)
      } catch (e) {
          return reply(`❌ ${e.message || 'No se pudieron obtener los datos'}`)
      }
  }

export { pluginConfig as config, handler }
