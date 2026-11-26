/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { need, pickTarget, explain } from './setch.js'

const pluginConfig = {
    name: "chunfollow",
    alias: [],
    category: "channel",
    description: "chunfollow <link>",
    usage: ".chunfollow <link>",
    example: ".chunfollow <link>",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { sock, text, prefix, reply }) {
      try {
          need(sock, 'newsletterUnfollow')
          const t = await pickTarget(sock, text, prefix)
          await sock.newsletterUnfollow(t.id)
          return reply(`✅ Berhenti mengikuti saluran: *${t.name}*`)
      } catch (err) {
          console.log('[CH] chunfollow:', err.message)
          return reply(`❌ ${explain(err)}${/Belum ada saluran/.test(String(err.message)) ? '' : `\nContoh: ${prefix || '.'}chunfollow <link saluran>`}`)
      }
  }

export { pluginConfig as config, handler }
