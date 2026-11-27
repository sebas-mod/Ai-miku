/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const jpmBlacklist = MikuRuntime.jpmBlacklist;
const jpmSetBlacklist = MikuRuntime.jpmSetBlacklist;

const pluginConfig = {
    name: "blacklistjpm",
    alias: ["bljpm", "jpmbl", "jpmblacklist", "listblacklistjpm"],
    category: "jpm",
    description: "Fitur jpm blacklistjpm",
    usage: ".blacklistjpm",
    example: ".blacklistjpm",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, text, prefix, command, reply }) {
      const [act = '', ...rest] = String(text || '').trim().split(/\s+/)
      const action = act.toLowerCase()
      let list = jpmBlacklist(false)
      const jids = rest.join('').split(',').map(v => v.trim()).filter(v => v.endsWith('@g.us'))
      const targets = jids.length ? jids : (m.isGroup ? [m.chat] : [])

      if (action === 'add') {
          if (!targets.length) return reply('❌ Escribe JID grupo (que termina en @g.us), o usa este comando dentro de un grupo.')
          const baru = targets.filter(j => !list.includes(j))
          jpmSetBlacklist(false, [...list, ...baru])
          return reply(`*▢ BLACKLIST JPM*\n• Agregado: ${baru.length} grupo\n• Ya disponible: ${targets.length - baru.length} grupo\n• Totales: ${list.length + baru.length} grupo`)
      }
      if (['del', 'remove', 'hapus'].includes(action)) {
          if (!targets.length) return reply('❌ Escribe JID grupo (que termina en @g.us), o usa este comando dentro de un grupo.')
          const sisa = list.filter(j => !targets.includes(j))
          jpmSetBlacklist(false, sisa)
          return reply(`*▢ BLACKLIST JPM*\n• Eliminado: ${list.length - sisa.length} grupo\n• Resto: ${sisa.length} grupo`)
      }
      if (action === 'list' || command.includes('list')) {
          if (!list.length) return reply('*▢ BLACKLIST JPM*\n• Aún no hay grupos en la lista negra')
          const rows = []
          for (const [i, id] of list.entries()) {
              const meta = await sock.groupMetadata(id).catch(() => null)
              rows.push(`${i + 1}. ${meta?.subject || 'Grup tidak dikenal'}\n   ${id}`)
          }
          return reply(`*▢ BLACKLIST JPM*\n• Totales: ${list.length} grupo\n\n${rows.join('\n')}`)
      }
      return reply(`*▢ BLACKLIST JPM*\n\nLos grupos incluidos en la lista negra no aceptan JPM.\n\n• ${prefix}${command} liza\n• ${prefix}${command} añadir <jid1>,<jid2>\n• ${prefix}${command} del <jid1>,<jid2>\n\nSin jid, el comando se aplica al grupo en el que se utiliza.\n• Total actual: ${list.length} grupo`)
  }

export { pluginConfig as config, handler }
