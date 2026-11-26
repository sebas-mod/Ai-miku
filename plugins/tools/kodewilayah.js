/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const FriendlyError = ElysiaRuntime.FriendlyError;
const guard = ElysiaRuntime.guard;
const titleCase = ElysiaRuntime.titleCase;
const bestMatches = ElysiaRuntime.bestMatches;
const getProvinces = ElysiaRuntime.getProvinces;
const getAllRegencies = ElysiaRuntime.getAllRegencies;
const getDistricts = ElysiaRuntime.getDistricts;
const getVillages = ElysiaRuntime.getVillages;

const pluginConfig = {
    name: "kodewilayah",
    alias: [],
    category: "tools",
    description: "kodewilayah",
    usage: ".kodewilayah",
    example: ".kodewilayah",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const MAX_LIST = 40

  const fmt = (x) => `${x.code}  ${titleCase(x.name)}`

  function more(total) {
      return total > MAX_LIST ? `\n...y ${total - MAX_LIST} más` : ''
  }

  let handler = guard(async (m, { text, reply, example }) => {
      const input = String(text || '').trim()
      if (!input) return example('bogor  (o: kota bogor|bogor barat)')

      const parts = input.split('|').map(s => s.trim()).filter(Boolean)
      const regencies = await getAllRegencies()

      if (parts.length >= 2) {
          const regs = bestMatches(regencies, parts[0])
          if (!regs.length) return reply(`No se encontró la ciudad de *${parts[0]}*.`)
          if (regs.length > 1) {
              return reply(`Hay varias ciudades llamadas *${parts[0]}*, escribe algo más concreto:\n\n${regs.slice(0, 10).map(fmt).join('\n')}`)
          }

          const reg = regs[0]
          const districts = await getDistricts(reg.code)
          const dis = bestMatches(districts, parts[1])
          if (!dis.length) return reply(`No se encontró el distrito *${parts[1]}* en ${titleCase(reg.name)}.`)

          const dist = dis[0]
          const villages = await getVillages(dist.code)
          if (!villages.length) throw new FriendlyError('Todavía no hay datos de barrios para este distrito.')

          return reply(
              `📍 *BARRIOS / PUEBLOS*\n` +
              `${titleCase(dist.name)}, ${titleCase(reg.name)}\n` +
              `Código del distrito: ${dist.code}\n\n` +
              villages.slice(0, MAX_LIST).map(fmt).join('\n') + more(villages.length) +
              `\n\n_Fuente: datos territoriales del Ministerio del Interior_`
          )
      }

      const provinces = await getProvinces()
      const provHit = bestMatches(provinces, input).slice(0, 5)
      const regHit = bestMatches(regencies, input)

      if (!provHit.length && !regHit.length) {
          return reply(`No se encontró la zona *${input}*.\n\nEjemplo: kodewilayah jawa barat, kodewilayah kota bandung`)
      }

      const out = []
      if (provHit.length) out.push(`*Provincias*\n${provHit.map(fmt).join('\n')}`)
      if (regHit.length) {
          out.push(`*Ciudades*\n${regHit.slice(0, MAX_LIST).map(fmt).join('\n')}${more(regHit.length)}`)
      }

      if (regHit.length === 1) {
          const districts = await getDistricts(regHit[0].code).catch(() => [])
          if (districts.length) {
              out.push(`*Distritos de ${titleCase(regHit[0].name)}*\n${districts.slice(0, MAX_LIST).map(fmt).join('\n')}${more(districts.length)}`)
              out.push(`_Para ver los barrios: kodewilayah ${input}|nombre del distrito_`)
          }
      }

      return reply(`📍 *CÓDIGOS TERRITORIALES*\n\n${out.join('\n\n')}\n\n_Fuente: datos territoriales del Ministerio del Interior_`)
  })

export { pluginConfig as config, handler }
