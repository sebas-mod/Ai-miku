/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { parseRef, getCurrent, metadata, link, explain } from './setch.js'

const pluginConfig = {
    name: "chinfo",
    alias: ["infoch"],
    category: "channel",
    description: "chinfo <link saluran>",
    usage: ".chinfo <link canal>",
    example: ".chinfo <link canal>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, text, prefix, reply }) {
      const arg = String(text || '').trim().split(/\s+/)[0]
      try {
          let ref = parseRef(arg)
          if (!ref && !arg && getCurrent()) ref = { type: 'jid', jid: getCurrent().id }
          if (!ref) return reply(`Enviar enlace del canal.\nEjemplo: ${prefix || '.'}chiinfo https://whatsapp.com/channel/0029VaXXXXXXXXXX`)

          const md = await metadata(sock, ref)
          const date = md.created
              ? new Date(md.created * 1000).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric' })
              : '-'
          const desc = md.desc ? (md.desc.length > 300 ? `${md.desc.slice(0, 299)}…` : md.desc) : ''

          return reply(
              `ℹ️ *INFO SALURAN*\n\n` +
              `📢 *SALURAN*\n` +
              `Nombre: ${md.name}${md.verified ? ' ✅' : ''}\n` +
              `Pengikut : ${md.subs.toLocaleString('id-ID')}\n` +
              `Dibuat : ${date}\n` +
              (md.role ? `Peran bot : ${md.role.toLowerCase()}\n` : '') +
              (md.invite ? `Link : ${link(md.invite)}\n` : '') +
              `\n🆔 *ID (JID)*\n${md.id}` +
              (desc ? `\n\n📝 *DESKRIPSI*\n${desc}` : '')
          )
      } catch (err) {
          console.log('[CH] chinfo:', err.message)
          return reply(`❌ ${explain(err)}`)
      }
  }

export { pluginConfig as config, handler }
