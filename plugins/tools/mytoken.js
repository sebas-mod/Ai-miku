/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const allOwn = ElysiaRuntime.allOwn;
const delOwn = ElysiaRuntime.delOwn;
const SERVICES = ElysiaRuntime.SERVICES;
const mask = ElysiaRuntime.mask;

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
  const when = (t) => (t ? new Date(t).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' }) : '-')

  async function handler(m, { text, prefix, reply, sender }) {
      const [sub, which] = String(text || '').trim().toLowerCase().split(/\s+/)

      if (/^(reset|hapus|delete|del)$/.test(sub || '')) {
          if (!which || which === 'all' || which === 'semua') {
              return reply(delOwn(sender) ? '🗑️ Semua token milikmu dihapus. Set lagi kapan saja kalau mau memakainya.' : 'Kamu belum menyimpan token apa pun.')
          }
          const svc = ALIAS[which]
          if (!svc) return reply(`Layanan tidak dikenal. Pilih: github, vercel, do, panel`)
          return reply(delOwn(sender, svc) ? `🗑️ Token ${SERVICES[svc].label} milikmu dihapus.` : `Kamu belum menyimpan token ${SERVICES[svc].label}.`)
      }

      const mine = allOwn(sender)
      const rows = Object.keys(SERVICES).map(svc => {
          const v = mine[svc]
          if (!v) return `• ${SERVICES[svc].label}: belum diset  (${prefix}${CMD[svc]})`
          const main = svc === 'panel' ? `${v.domain} • ${mask(v.plta)}` : mask(v.token)
          return `• ${SERVICES[svc].label}: \`${main}\`\n   diperbarui ${when(v.updatedAt)}`
      })
      return reply(
          `🔑 *TOKEN KAMU*\n\n${rows.join('\n')}\n\n` +
          `Ganti: set lagi dengan token baru (otomatis menimpa).\n` +
          `Reset satu: *${prefix}mytoken reset github*\nReset semua: *${prefix}mytoken reset*\n` +
          `_Token tersimpan permanen, tidak perlu set ulang setelah bot restart._`
      )
  }

export { pluginConfig as config, handler }
