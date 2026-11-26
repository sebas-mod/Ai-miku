/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const allOwn = MikuRuntime.allOwn;
const delOwn = MikuRuntime.delOwn;
const SERVICES = MikuRuntime.SERVICES;
const mask = MikuRuntime.mask;

const pluginConfig = {
    name: "mytoken",
    alias: [],
    category: "tools",
    description: "mytoken",
    usage: ".mytoken",
    example: ".mytoken",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const ALIAS = { github: 'github', gh: 'github', vercel: 'vercel', do: 'digitalocean', digitalocean: 'digitalocean', vps: 'digitalocean', panel: 'panel' }
  const CMD = { github: 'settoken', vercel: 'setvercel', digitalocean: 'setdo', panel: 'setpanel' }
  const when = (t) => (t ? new Date(t).toLocaleString('es-ES', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' }) : '-')

  async function handler(m, { text, prefix, reply, sender }) {
      const [sub, which] = String(text || '').trim().toLowerCase().split(/\s+/)

      if (/^(reset|hapus|delete|del)$/.test(sub || '')) {
          if (!which || which === 'all' || which === 'semua') {
              return reply(delOwn(sender) ? '🗑️ Se eliminaron todos tus tokens. Puedes volver a configurarlos cuando quieras.' : 'No tienes ningún token guardado.')
          }
          const svc = ALIAS[which]
          if (!svc) return reply(`Servicio no reconocido. Elige: github, vercel, do, panel`)
          return reply(delOwn(sender, svc) ? `🗑️ Se eliminó tu token de ${SERVICES[svc].label}.` : `No tienes guardado ningún token de ${SERVICES[svc].label}.`)
      }

      const mine = allOwn(sender)
      const rows = Object.keys(SERVICES).map(svc => {
          const v = mine[svc]
          if (!v) return `• ${SERVICES[svc].label}: sin configurar  (${prefix}${CMD[svc]})`
          const main = svc === 'panel' ? `${v.domain} • ${mask(v.plta)}` : mask(v.token)
          return `• ${SERVICES[svc].label}: \`${main}\`\n   actualizado ${when(v.updatedAt)}`
      })
      return reply(
          `🔑 *TUS TOKENS*\n\n${rows.join('\n')}\n\n` +
          `Cambiar: vuelve a configurarlo con un token nuevo (reemplaza el anterior).\n` +
          `Restablecer uno: *${prefix}mytoken reset github*\nRestablecer todos: *${prefix}mytoken reset*\n` +
          `_Los tokens se guardan de forma permanente, no hace falta volver a configurarlos cuando el bot se reinicia._`
      )
  }

export { pluginConfig as config, handler }
