/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const fetchJSON = MikuRuntime.fetchJSON;
const FriendlyError = MikuRuntime.FriendlyError;
const cached = MikuRuntime.cached;
const guard = MikuRuntime.guard;
const nowWib = MikuRuntime.nowWib;
const pad = MikuRuntime.pad;
const HARI = MikuRuntime.HARI;
const BULAN = MikuRuntime.BULAN;

const pluginConfig = {
    name: "harilibur",
    alias: [],
    category: "tools",
    description: "harilibur",
    usage: ".harilibur",
    example: ".harilibur",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const SOURCES = [
      (y) => `https://api-harilibur.vercel.app/api?year=${y}`,
      (y) => `https://api-hari-libur.vercel.app/api?year=${y}`,
      (y) => `https://dayoffapi.vercel.app/api?year=${y}`,
      (y) => `https://date.nager.at/api/v3/PublicHolidays/${y}/ID`
  ]
  const DAY = 24 * 3600 * 1000

  function normalize(json) {
      const list = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : [])
      const out = []
      for (const x of list) {
          const raw = String(x?.holiday_date ?? x?.tanggal ?? x?.date ?? '').trim()
          const mt = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
          const name = String(x?.holiday_name ?? x?.keterangan ?? x?.localName ?? x?.name ?? '').trim()
          if (!mt || !name) continue
          const cuti = x?.is_cuti === true || /cuti/i.test(name) || x?.is_national_holiday === false
          out.push({ date: `${mt[1]}-${pad(mt[2])}-${pad(mt[3])}`, name, cuti })
      }
      return out
  }

  async function holidaysOf(year) {
      return cached(`libur:${year}`, DAY, async () => {
          for (const src of SOURCES) {
              try {
                  const list = normalize(await fetchJSON(src(year)))
                  if (list.length) {
                      const seen = new Set()
                      return list
                          .sort((a, b) => a.date.localeCompare(b.date))
                          .filter(h => { const k = h.date + h.name; if (seen.has(k)) return false; seen.add(k); return true })
                  }
              } catch {
              }
          }
          return []
      })
  }

  function label(h) {
      const [y, m, d] = h.date.split('-').map(Number)
      const day = HARI[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
      return `${day}, ${d} ${BULAN[m - 1].slice(0, 3)} ${y}`
  }

  const line = (h) => `${label(h)}\n   ${h.name}${h.cuti && !/cuti/i.test(h.name) ? ' (puente)' : ''}`
  const FOOT = '\n\n_Fuente: datos oficiales de días festivos nacionales (decreto conjunto de 3 ministerios)_'

  let handler = guard(async (m, { text, reply }) => {
      const arg = String(text || '').trim()
      const today = nowWib()
      const todayStr = `${today.y}-${pad(today.m)}-${pad(today.d)}`

      if (/^\d{4}$/.test(arg)) {
          const year = Number(arg)
          if (year < 2015 || year > today.y + 2) return reply('Año fuera del rango de datos. Prueba con uno más cercano.')
          const list = await holidaysOf(year)
          if (!list.length) throw new FriendlyError(`Todavía no hay datos de festivos de ${year}.`)
          return reply(`📅 *FESTIVOS ${year}* (${list.length})\n\n${list.map(line).join('\n')}${FOOT}`)
      }

      if (/^\d{1,2}$/.test(arg)) {
          const month = Number(arg)
          if (month < 1 || month > 12) return reply('El mes debe ser del 1 al 12.')
          const list = (await holidaysOf(today.y)).filter(h => Number(h.date.slice(5, 7)) === month)
          if (!(await holidaysOf(today.y)).length) throw new FriendlyError(`Todavía no hay datos de festivos de ${today.y}.`)
          if (!list.length) return reply(`No hay festivos nacionales en ${BULAN[month - 1]} de ${today.y}.`)
          return reply(`📅 *FESTIVOS DE ${BULAN[month - 1].toUpperCase()} ${today.y}*\n\n${list.map(line).join('\n')}${FOOT}`)
      }

      if (arg) return reply('Formato no reconocido.\n\nUsa:\n- harilibur (próximos festivos)\n- harilibur 10 (por mes)\n- harilibur 2026 (por año)')

      const thisYear = await holidaysOf(today.y)
      if (!thisYear.length) throw new FriendlyError(`Todavía no hay datos de festivos de ${today.y}.`)
      const nextYear = await holidaysOf(today.y + 1).catch(() => [])

      const all = [...thisYear, ...nextYear]
      const todayHit = all.filter(h => h.date === todayStr)
      const upcoming = all.filter(h => h.date > todayStr).slice(0, 5)

      const status = todayHit.length
          ? `Hoy es *festivo*: ${todayHit.map(h => h.name).join(', ')} 🎉`
          : 'Hoy no es un festivo nacional.'

      return reply(
          `📅 *PRÓXIMOS FESTIVOS*\n\n${status}` +
          (upcoming.length ? `\n\n*A continuación*\n${upcoming.map(line).join('\n')}` : '\n\nTodavía no hay datos de los próximos festivos.') +
          FOOT
      )
  })

export { pluginConfig as config, handler }
