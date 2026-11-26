/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { need, pickTarget, explain } from './setch.js'

const pluginConfig = {
    name: "chunmute",
    alias: [],
    category: "channel",
    description: "chunmute <link>",
    usage: ".chunmute <link>",
    example: ".chunmute <link>",
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
          need(sock, 'newsletterUnmute')
          const t = await pickTarget(sock, text, prefix)
          await sock.newsletterUnmute(t.id)
          return reply(`✅ Bisu saluran dibuka: *${t.name}*`)
      } catch (err) {
          console.log('[CH] chunmute:', err.message)
          return reply(`❌ ${explain(err)}${/Belum ada saluran/.test(String(err.message)) ? '' : `\nContoh: ${prefix || '.'}chunmute <link saluran>`}`)
      }
  }

export { pluginConfig as config, handler }
