/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { need, normalize, setCurrent, link, ChannelError, explain } from './setch.js'

const pluginConfig = {
    name: "chcreate",
    alias: ["buatch", "createch"],
    category: "channel",
    description: "chcreate <nama> | <deskripsi>",
    usage: ".chcreate <nama> | <deskripsi>",
    example: ".chcreate <nama> | <deskripsi>",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, text, prefix, reply }) {
      const p = prefix || '.'
      const raw = String(text || '')
      try {
          need(sock, 'newsletterCreate')
          const [name, ...d] = raw.split('|')
          const desc = d.join('|').trim()
          if (!name.trim()) return reply(`Format: ${p}chcreate <nama saluran> | <deskripsi>\nContoh: ${p}chcreate Info Elysia Assistant | Pembaruan fitur bot`)
          if (name.trim().length > 100) return reply('Nama saluran maksimal 100 karakter.')
          const md = normalize(await sock.newsletterCreate(name.trim(), desc || undefined))
          if (!md.id) throw new ChannelError('Saluran dibuat, tetapi WhatsApp tidak mengembalikan datanya. Cek di aplikasi.')
          setCurrent({ id: md.id, name: md.name || name.trim(), role: md.role || 'OWNER' })
          return reply(`✅ Saluran dibuat: *${md.name || name.trim()}*\n🆔 ${md.id}${md.invite ? `\n🔗 ${link(md.invite)}` : ''}\nSudah dijadikan saluran bawaan (${p}swch, ${p}playch).`)
      } catch (err) {
          console.log('[CH] chcreate:', err.message)
          return reply(`❌ ${explain(err)}`)
      }
  }

export { pluginConfig as config, handler }
