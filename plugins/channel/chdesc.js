/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { need, pickTarget, assertCanPost, explain } from './setch.js'

const pluginConfig = {
    name: "chdesc",
    alias: [],
    category: "channel",
    description: "chdesc <teks>",
    usage: ".chdesc <teks>",
    example: ".chdesc <teks>",
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
      try {
          const t = await pickTarget(sock, String(text || ''), p)
          assertCanPost(t)
          need(sock, 'newsletterUpdateDescription')
          if (!t.rest) return reply(`Isi deskripsi baru.\nContoh: ${p}chdesc Pembaruan fitur bot`)
          if (t.rest.length > 500) return reply('Deskripsi maksimal 500 karakter.')
          await sock.newsletterUpdateDescription(t.id, t.rest)
          return reply(`✅ Deskripsi saluran *${t.name}* diperbarui.`)
      } catch (err) {
          console.log('[CH] chdesc:', err.message)
          return reply(`❌ ${explain(err)}`)
      }
  }

export { pluginConfig as config, handler }
