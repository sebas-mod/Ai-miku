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
    name: "chmute",
    alias: [],
    category: "channel",
    description: "chmute <link>",
    usage: ".chmute <link>",
    example: ".chmute <link>",
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
          need(sock, 'newsletterMute')
          const t = await pickTarget(sock, text, prefix)
          await sock.newsletterMute(t.id)
          return reply(`✅ Saluran dibisukan: *${t.name}*`)
      } catch (err) {
          console.log('[CH] chmute:', err.message)
          return reply(`❌ ${explain(err)}${/Belum ada saluran/.test(String(err.message)) ? '' : `\nContoh: ${prefix || '.'}chmute <link saluran>`}`)
      }
  }

export { pluginConfig as config, handler }
