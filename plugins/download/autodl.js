/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const saveDB = ElysiaRuntime.saveDB;

const pluginConfig = {
    name: "autodl",
    alias: [],
    category: "download",
    description: "autodl on/off",
    usage: ".autodl on/off",
    example: ".autodl on/off",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const ON = /^(on|1|true|aktif|nyala)$/i
  const OFF = /^(off|0|false|mati|nonaktif)$/i

  async function handler(m, { text, jid, prefix, isAdmin, isOwner, reply }) {
      const cfg = (global.db.groups ||= {})
      const chat = (cfg[jid] ||= {})
      const arg = String(text || '').trim().split(/\s+/)[0]

      if (!ON.test(arg) && !OFF.test(arg)) {
          return reply(
              `*▢ AUTO DOWNLOAD*\nEstado de este chat: ${chat.autodl ? '✅ ON' : '❌ OFF'}\n\n` +
              `${prefix}autodl on  → los enlaces se descargan automáticamente\n${prefix}autodl off\n\n` +
              `Mendukung: TikTok, Instagram, YouTube, Facebook, Twitter/X.`
          )
      }
      if (m.isGroup && !isAdmin && !isOwner) return reply(global.mess.admin)

      const on = ON.test(arg)
      chat.autodl = on
      saveDB(global.db)
      return reply(on
          ? '✅ Auto-descarga *activa*. Envía un enlace de TikTok / IG / YouTube / FB / X y el bot lo descargará.'
          : '❌ Auto-download *desactivada* en este chat.')
  }

export { pluginConfig as config, handler }
