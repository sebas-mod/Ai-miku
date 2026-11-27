/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { need, pickTarget, assertCanPost, setCurrent, getCurrent, explain } from './setch.js'

const pluginConfig = {
    name: "chname",
    alias: [],
    category: "channel",
    description: "chname <nama>",
    usage: ".chname <nama>",
    example: ".chname <nama>",
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
          need(sock, 'newsletterUpdateName')
          if (!t.rest) return reply(`Introduzca un nuevo nombre.\nEjemplo: ${p}chname Información Ai Miku`)
          if (t.rest.length > 100) return reply('El nombre máximo del canal es 100 caracteres.')
          await sock.newsletterUpdateName(t.id, t.rest)
          if (getCurrent()?.id === t.id) setCurrent({ ...getCurrent(), name: t.rest })
          return reply(`✅ El nombre del canal cambió a *${t.rest}*.`)
      } catch (err) {
          console.log('[CH] chname:', err.message)
          return reply(`❌ ${explain(err)}`)
      }
  }

export { pluginConfig as config, handler }
