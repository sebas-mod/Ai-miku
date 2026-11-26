/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const fetchJSON = ElysiaRuntime.fetchJSON;
const FriendlyError = ElysiaRuntime.FriendlyError;
const cached = ElysiaRuntime.cached;
const peekCache = ElysiaRuntime.peekCache;
const guard = ElysiaRuntime.guard;

const pluginConfig = {
    name: "kurs",
    alias: ["cekkurs", "valas"],
    category: "tools",
    description: "kurs",
    usage: ".kurs",
    example: ".kurs",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const API = 'https://open.er-api.com/v6/latest/USD'
  const KEY = 'kurs:usd'
  const TTL = 60 * 60 * 1000

  const DEFAULT_LIST = ['USD', 'EUR', 'SGD', 'MYR', 'JPY', 'GBP', 'AUD', 'SAR', 'CNY']

  async function getRates() {
      try {
          return await cached(KEY, TTL, async () => {
              const json = await fetchJSON(API)
              if (json?.result !== 'success' || !json?.rates || typeof json.rates !== 'object') {
                  throw new FriendlyError('Todavía no hay datos del tipo de cambio, inténtalo más tarde.')
              }
              return { rates: json.rates, updated: json.time_last_update_utc || '' }
          })
      } catch (e) {
          const old = peekCache(KEY)
          if (old) return { ...old, stale: true }
          throw e
      }
  }

  function parseAmount(token) {
      let s = String(token).replace(/\s/g, '')
      if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.')
      else s = s.replace(',', '.')
      const n = Number(s)
      return /^\d+(\.\d+)?$/.test(s) && Number.isFinite(n) ? n : NaN
  }

  function fmt(n, code) {
      const digits = code === 'IDR' || Math.abs(n) >= 1000 ? 0 : Math.abs(n) >= 1 ? 2 : 6
      return new Intl.NumberFormat('es-ES', { maximumFractionDigits: digits }).format(n)
  }

  const convert = (rates, amount, from, to) => (amount / rates[from]) * rates[to]

  let handler = guard(async (m, { text, reply }) => {
      const tokens = String(text || '').trim().split(/\s+/).filter(Boolean)

      let amount = 1
      if (tokens.length && !Number.isNaN(parseAmount(tokens[0]))) {
          amount = parseAmount(tokens.shift())
      }
      if (!(amount > 0) || amount > 1e15) return reply('Cantidad no válida.')

      const { rates, updated, stale } = await getRates()
      const footer = `\n\n_Fuente: ExchangeRate-API${updated ? ` | ${updated.replace(/ \+0000$/, ' UTC')}` : ''}${stale ? ' (datos antiguos, el servidor está fallando)' : ''}_`

      const codes = tokens.map(t => t.toUpperCase())
      for (const c of codes) {
          if (!/^[A-Z]{3}$/.test(c) || !rates[c]) {
              return reply(`La moneda *${c}* no se reconoce.\n\nUsa el código de 3 letras, por ejemplo: USD, EUR, SGD, JPY, IDR.`)
          }
      }

      if (!codes.length) {
          const lines = DEFAULT_LIST.map(c => `${fmt(amount, c)} ${c} = Rp ${fmt(convert(rates, amount, c, 'IDR'), 'IDR')}`)
          return reply(`💱 *TIPO DE CAMBIO A RUPIAS*\n\n${lines.join('\n')}${footer}`)
      }

      const from = codes[0]
      const to = codes[1] || (from === 'IDR' ? 'USD' : 'IDR')
      const result = convert(rates, amount, from, to)

      return reply(
          `💱 *KURS*\n\n` +
          `${fmt(amount, from)} ${from} = *${to === 'IDR' ? 'Rp ' : ''}${fmt(result, to)}${to === 'IDR' ? '' : ` ${to}`}*` +
          (amount === 1 ? '' : '\n\n') +
          (amount === 1 ? '' : `1 ${from} = ${to === 'IDR' ? 'Rp ' : ''}${fmt(convert(rates, 1, from, to), to)}${to === 'IDR' ? '' : ` ${to}`}`) +
          footer
      )
  })

export { pluginConfig as config, handler }
