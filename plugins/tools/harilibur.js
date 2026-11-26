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
const guard = ElysiaRuntime.guard;
const nowWib = ElysiaRuntime.nowWib;
const pad = ElysiaRuntime.pad;
const HARI = ElysiaRuntime.HARI;
const BULAN = ElysiaRuntime.BULAN;

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

  const line = (h) => `${label(h)}\n   ${h.name}${h.cuti && !/cuti/i.test(h.name) ? ' (cuti bersama)' : ''}`
  const FOOT = '\n\n_Sumber: data hari libur nasional & cuti bersama (SKB 3 Menteri)_'

  let handler = guard(async (m, { text, reply }) => {
      const arg = String(text || '').trim()
      const today = nowWib()
      const todayStr = `${today.y}-${pad(today.m)}-${pad(today.d)}`

      if (/^\d{4}$/.test(arg)) {
          const year = Number(arg)
          if (year < 2015 || year > today.y + 2) return reply('Tahun di luar jangkauan data. Coba tahun yang lebih dekat.')
          const list = await holidaysOf(year)
          if (!list.length) throw new FriendlyError(`Data hari libur tahun ${year} belum tersedia.`)
          return reply(`📅 *HARI LIBUR ${year}* (${list.length})\n\n${list.map(line).join('\n')}${FOOT}`)
      }

      if (/^\d{1,2}$/.test(arg)) {
          const month = Number(arg)
          if (month < 1 || month > 12) return reply('Bulan harus 1-12.')
          const list = (await holidaysOf(today.y)).filter(h => Number(h.date.slice(5, 7)) === month)
          if (!(await holidaysOf(today.y)).length) throw new FriendlyError(`Data hari libur tahun ${today.y} belum tersedia.`)
          if (!list.length) return reply(`Tidak ada hari libur nasional di bulan ${BULAN[month - 1]} ${today.y}.`)
          return reply(`📅 *HARI LIBUR ${BULAN[month - 1].toUpperCase()} ${today.y}*\n\n${list.map(line).join('\n')}${FOOT}`)
      }

      if (arg) return reply('Format tidak dikenal.\n\nGunakan:\n- harilibur (libur terdekat)\n- harilibur 10 (per bulan)\n- harilibur 2026 (per tahun)')

      const thisYear = await holidaysOf(today.y)
      if (!thisYear.length) throw new FriendlyError(`Data hari libur tahun ${today.y} belum tersedia.`)
      const nextYear = await holidaysOf(today.y + 1).catch(() => [])

      const all = [...thisYear, ...nextYear]
      const todayHit = all.filter(h => h.date === todayStr)
      const upcoming = all.filter(h => h.date > todayStr).slice(0, 5)

      const status = todayHit.length
          ? `Hari ini *libur*: ${todayHit.map(h => h.name).join(', ')} 🎉`
          : 'Hari ini bukan hari libur nasional.'

      return reply(
          `📅 *HARI LIBUR TERDEKAT*\n\n${status}` +
          (upcoming.length ? `\n\n*Selanjutnya*\n${upcoming.map(line).join('\n')}` : '\n\nBelum ada data libur berikutnya.') +
          FOOT
      )
  })

export { pluginConfig as config, handler }
