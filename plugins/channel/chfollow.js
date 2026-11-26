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
    name: "chfollow",
    alias: [],
    category: "channel",
    description: "chfollow <link>",
    usage: ".chfollow <link>",
    example: ".chfollow <link>",
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
          need(sock, 'newsletterFollow')
          const t = await pickTarget(sock, text, prefix)
          await sock.newsletterFollow(t.id)
          return reply(`✅ Sekarang mengikuti saluran: *${t.name}*`)
      } catch (err) {
          console.log('[CH] chfollow:', err.message)
          return reply(`❌ ${explain(err)}${/Belum ada saluran/.test(String(err.message)) ? '' : `\nContoh: ${prefix || '.'}chfollow <link saluran>`}`)
      }
  }

export { pluginConfig as config, handler }
