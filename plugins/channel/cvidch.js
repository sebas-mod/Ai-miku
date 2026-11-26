/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "cvidch",
    alias: [],
    category: "channel",
    description: "cvidch <id@newsletter>",
    usage: ".cvidch <id@newsletter>",
    example: ".cvidch <id@newsletter>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { sock, text, prefix, command, reply }) {
      let idch = ''
      if (text) {
          idch = text.match(/\d+@newsletter/)?.[0] || ''
      } else if (m.quoted) {
          const q = m.quoted.text || m.quoted.caption || ''
          idch = q.match(/\d+@newsletter/)?.[0] || ''
      }

      if (!idch) return reply(`Contoh: ${prefix || '.'}${command} xxxx@newsletter\natau reply pesan yang mengandung newsletter id`)

      try {
          const meta = await sock.newsletterMetadata('jid', idch)
          const tm = meta.thread_metadata || {}
          const name = tm.name?.text || 'Unknown'
          const subs = Number(tm.subscribers_count || 0).toLocaleString('id-ID')
          const url = tm.invite ? `https://whatsapp.com/channel/${tm.invite}` : '-'
          return reply(`*INFO SALURAN*\n\n- Nama: ${name}\n- Pengikut: ${subs}\n- ID: ${idch}\n- Link: ${url}`)
      } catch (e) {
          return reply(`*ERROR!*\n\n${e.message}`)
      }
  }

export { pluginConfig as config, handler }
