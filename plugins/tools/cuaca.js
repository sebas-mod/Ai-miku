/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const FriendlyError = MikuRuntime.FriendlyError;
const fetchJSON = MikuRuntime.fetchJSON;
const guard = MikuRuntime.guard;
const titleCase = MikuRuntime.titleCase;
const bestMatches = MikuRuntime.bestMatches;
const getAllRegencies = MikuRuntime.getAllRegencies;
const getDistricts = MikuRuntime.getDistricts;
const getVillages = MikuRuntime.getVillages;

const pluginConfig = {
    name: "cuaca",
    alias: ["infocuaca", "cekcuaca"],
    category: "tools",
    description: "cuaca",
    usage: ".cuaca",
    example: ".cuaca",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const BMKG = 'https://api.bmkg.go.id/publik/prakiraan-cuaca'
  const ADM4 = /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/
  const STEPS = 4

  const num = (v) => (v === undefined || v === null || v === '' ? '-' : v)

  async function resolve(input) {
      const raw = input.trim()
      if (ADM4.test(raw)) return { code: raw, guessed: false }

      const [kota, kec, kel] = raw.split('|').map(s => s.trim())
      const regs = bestMatches(await getAllRegencies(), kota)
      if (!regs.length) throw new FriendlyError(`No se encontró la ciudad de *${kota}*.\n\nEjemplo: tiempo en Bandung, tiempo en la ciudad de Bogor | Bogor occidental`)
      if (regs.length > 1) {
          throw new FriendlyError(`Hay varias regiones nombradas *${kota}*, escriba más específicamente:\n\n${regs.slice(0, 8).map(r => `- ${titleCase(r.name)}`).join('\n')}`)
      }

      const districts = await getDistricts(regs[0].code)
      if (!districts.length) throw new FriendlyError('Todavía no hay datos de distritos para esta zona.')
      let dist = districts[0]
      if (kec) {
          dist = bestMatches(districts, kec)[0]
          if (!dist) throw new FriendlyError(`No se encontró el distrito *${kec}* en ${titleCase(regs[0].name)}.`)
      }

      const villages = await getVillages(dist.code)
      if (!villages.length) throw new FriendlyError('Todavía no hay datos de barrios para este distrito.')
      let vil = villages[0]
      if (kel) {
          vil = bestMatches(villages, kel)[0]
          if (!vil) throw new FriendlyError(`No se encontró el barrio *${kel}* en el distrito ${titleCase(dist.name)}.`)
      }

      return { code: vil.code, guessed: !kec || !kel }
  }

  const toTime = (entry) => {
      const t = Date.parse(String(entry?.utc_datetime || '').replace(' ', 'T') + 'Z')
      return Number.isFinite(t) ? t : NaN
  }

  let handler = guard(async (m, { text, reply, example }) => {
      if (!String(text || '').trim()) return example('Bandung (o: ciudad de Bogor|Bogor occidental|Menteng)')

      const { code, guessed } = await resolve(text)

      let json
      try {
          json = await fetchJSON(`${BMKG}?adm4=${encodeURIComponent(code)}`)
      } catch (e) {
          if (e.status === 404 || e.status === 400) {
              throw new FriendlyError('BMKG aún no tiene pronóstico para este lugar. Prueba con otro barrio o distrito:\ncuaca ciudad|distrito|barrio')
          }
          throw e
      }

      const item = Array.isArray(json?.data) ? json.data[0] : json
      const lokasi = item?.lokasi || json?.lokasi || {}
      const entries = (Array.isArray(item?.cuaca) ? item.cuaca : []).flat(2).filter(e => e && typeof e === 'object')
      if (!entries.length) throw new FriendlyError('BMKG todavía no tiene el pronóstico de este lugar.')

      const now = Date.now()
      let start = 0
      let best = Infinity
      entries.forEach((e, i) => {
          const t = toTime(e)
          if (Number.isFinite(t) && Math.abs(t - now) < best) { best = Math.abs(t - now); start = i }
      })
      const slice = entries.slice(start, start + STEPS)
      const first = slice[0]

      const place = [lokasi.desa, lokasi.kecamatan, lokasi.kotkab, lokasi.provinsi].filter(Boolean).join(', ')
      const lines = slice.map(e => {
          const dt = String(e.local_datetime || '')
          const jam = dt.length >= 16 ? `${dt.slice(8, 10)}/${dt.slice(5, 7)} ${dt.slice(11, 16)}` : '-'
          return `${jam}  ${num(e.weather_desc)}, ${num(e.t)}°C, humedad ${num(e.hu)}%, viento ${num(e.ws)} kilómetros por hora`
      })

      return reply(
          `🌤️ *TIEMPO*\n${place || code}\n\n` +
          `*Ahora (aproximado)*\n` +
          `${num(first.weather_desc)}\n` +
          `Temperatura ${num(first.t)}°C | Humedad ${num(first.hu)}% | Viento ${num(first.ws)} km/h${first.wd ? ` desde ${first.wd}` : ''}\n\n` +
          `*Pronóstico (cada 3 horas, hora local)*\n${lines.join('\n')}` +
          (guessed ? `\n\n_La ubicación se eligió automáticamente. Para más precisión: cuaca ciudad|distrito|barrio_` : '') +
          `\n\n_Fuente: BMKG_`
      )
  })

export { pluginConfig as config, handler }
