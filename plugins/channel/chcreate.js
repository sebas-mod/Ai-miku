/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { need, normalize, setCurrent, link, ChannelError, explain } from './setch.js'

const pluginConfig = {
    name: "chcreate",
    alias: ["buatch", "createch"],
    category: "channel",
    description: "chcreate <nombre> | <descripción>",
    usage: ".chcreate <nombre> | <deskripsi>",
    example: ".chcreate <nombre> | <deskripsi>",
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
          if (!name.trim()) return reply(`Formato: ${p}chcreate <nombre del canal> | <descripción>\nEjemplo: ${p}chcreate Información Ai Miku | Actualización de funciones bot`)
          if (name.trim().length > 100) return reply('El nombre máximo del canal es 100 caracteres.')
          const md = normalize(await sock.newsletterCreate(name.trim(), desc || undefined))
          if (!md.id) throw new ChannelError('Se crea el canal, pero WhatsApp no devuelve los datos. Consulta la aplicación.')
          setCurrent({ id: md.id, name: md.name || name.trim(), role: md.role || 'OWNER' })
          return reply(`✅ Saluran dibuat: *${md.name || name.trim()}*\n🆔 ${md.id}${md.invite ? `\n🔗 ${link(md.invite)}` : ''}\nSudah dijadikan saluran bawaan (${p}swch, ${p}playch).`)
      } catch (err) {
          console.log('[CH] chcreate:', err.message)
          return reply(`❌ ${explain(err)}`)
      }
  }

export { pluginConfig as config, handler }
