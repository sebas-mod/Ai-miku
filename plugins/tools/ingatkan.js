/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const addReminder = MikuRuntime.addReminder;
const listReminders = MikuRuntime.listReminders;
const userOf = MikuRuntime.userOf;
const formatRemaining = MikuRuntime.formatRemaining;
const formatWib = MikuRuntime.formatWib;

const pluginConfig = {
    name: "ingatkan",
    alias: [],
    category: "tools",
    description: "ingatkan <waktu> <teks>",
    usage: ".ingatkan <waktu> <teks>",
    example: ".ingatkan <waktu> <teks>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const WIB = 7 * 36e5
  const MIN_MS = 10_000
  const MAX_MS = 365 * 864e5
  const MAX_PER_USER = 20
  const UNIT = { s: 1e3, detik: 1e3, m: 6e4, menit: 6e4, h: 36e5, jam: 36e5, d: 864e5, hari: 864e5, w: 6048e5, minggu: 6048e5 }

  function parseSpan(tok) {
      const s = String(tok || '').toLowerCase()
      const re = /(\d+)\s*(detik|menit|minggu|jam|hari|s|m|h|d|w)/g
      if (s.replace(re, '').trim()) return null
      let total = 0
      let hit = false
      for (const [, n, u] of s.matchAll(re)) { total += Number(n) * UNIT[u]; hit = true }
      return hit ? total : null
  }

  function parseClock(tok, dayOffset, now) {
      const mm = String(tok || '').match(/^(?:jam)?(\d{1,2})[:.](\d{2})$/i)
      if (!mm) return null
      const h = Number(mm[1])
      const min = Number(mm[2])
      if (h > 23 || min > 59) return null
      const wib = new Date(now + WIB)
      let t = Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate() + dayOffset, h, min) - WIB
      if (dayOffset === 0 && t <= now) t += 864e5
      return t
  }

  const mine = (r, sender) => userOf(r.sender) === userOf(sender)

  async function handler(m, { text, command, prefix, sender, jid, reply, example }) {
      const input = String(text || '').trim()

      const tokens = input.split(/\s+/).filter(Boolean)
      const now = Date.now()
      let dayOffset = 0
      if (/^besok$/i.test(tokens[0])) { dayOffset = 1; tokens.shift() }
      else if (/^lusa$/i.test(tokens[0])) { dayOffset = 2; tokens.shift() }
      if (/^jam$/i.test(tokens[0])) tokens.shift()

      let due = parseClock(tokens[0], dayOffset, now)
      if (due !== null) tokens.shift()
      else if (dayOffset === 0) {
          const span = parseSpan(tokens[0])
          if (span !== null) { due = now + span; tokens.shift() }
      }

      if (due === null) {
          return example('30m tomar medicina   |   14:30 reunion   |   besok 08:00 deporte   |   1h30m reunion')
      }
      if (due - now < MIN_MS) return reply('Falta muy poco tiempo (mínimo 10 segundos).')
      if (due - now > MAX_MS) return reply('El tiempo es demasiado lejano (máximo 1 año).')

      const body = tokens.join(' ').trim() || String(m.quoted?.text || '').trim()
      if (!body) return reply(`¿Qué quieres que te recuerde?\nEjemplo: ${prefix}${command} 30m tomar medicina\no responde a un mensaje y escribe ${prefix}${command} 30m`)
      if (listReminders().filter(r => mine(r, sender)).length >= MAX_PER_USER) {
          return reply(`Ya tienes ${MAX_PER_USER} recordatorios activos (el máximo). Elimina alguno con ${prefix}delingat`)
      }

      addReminder({ chat: jid, sender, text: body.slice(0, 500), due })
      return reply(`⏰ ¡Listo! Te avisaré:\n"${body.slice(0, 200)}"\n\nEl *${formatWib(due)}* (en ${formatRemaining(due)})`)
  }

export { pluginConfig as config, handler }
