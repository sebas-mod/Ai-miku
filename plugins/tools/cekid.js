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
    name: "cekid",
    alias: ["id"],
    category: "tools",
    description: "cekid <link>",
    usage: ".cekid <link>",
    example: ".cekid <link>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const GROUP_RE = /(?:https?:\/\/)?chat\.whatsapp\.com\/([0-9A-Za-z]+)/i
  const CHANNEL_RE = /whatsapp\.com\/channel\/([0-9A-Za-z_-]+)/i

  async function sendWithCopy(sock, m, jid, reply, text, label, code) {
      try {
          return await sock.sendMessage(jid, { text: `${text}\n\n📋 ${label}: ${String(code)}\n\n_${global.namebot || 'Ai Miku MD'}_` }, { quoted: m })
      } catch (e) {
          console.error('[cekid] tombol gagal:', e?.message || e)
          return reply(text)
      }
  }

  async function groupInfo(sock, m, jid, reply, code) {
      try {
          const info = await sock.groupGetInviteInfo(code)
          const created = info.creation ? new Date(info.creation * 1000).toLocaleString('es-ES') : '-'
          const text = `
— INFO DEL GRUPO —

❀ Nombre: ${info.subject}
❀ ID del grupo: ${info.id}
❀ Miembros: ${info.size || 0}
❀ Creado: ${created}
`.trim()
          return sendWithCopy(sock, m, jid, reply, text, 'Copiar ID del grupo', info.id)
      } catch (e) {
          console.error(e)
          return reply('No se pudo obtener la información del grupo. Comprueba que el enlace de invitación siga siendo válido.')
      }
  }

  async function channelInfo(sock, m, jid, reply, code) {
      try {
          const result = await sock.newsletterMetadata('invite', code)
          const meta = result.thread_metadata || {}
          const created = meta.creation_time ? new Date(Number(meta.creation_time) * 1000).toLocaleString('es-ES') : '-'
          const text =
              `╭─▣「 *INFORMACIÓN DEL CANAL* 」▣─╮\n` +
              `┃ ✦ Nombre      : ${meta.name?.text || '-'}\n` +
              `┃ ✦ ID del canal : ${result.id}\n` +
              `┃ ✦ Suscriptores : ${Number(meta.subscribers_count || 0).toLocaleString('es-ES')}\n` +
              `┃ ✦ Verificación : ${meta.verification || '-'}\n` +
              `┃ ✦ Estado       : ${result.state?.type || '-'}\n` +
              `┃ ✦ Creado       : ${created}\n` +
              `╰─────────────➤`
          return sendWithCopy(sock, m, jid, reply, text, 'Copiar ID del canal', result.id)
      } catch (e) {
          console.error(e)
          return reply('No se pudieron obtener los datos del canal.')
      }
  }

  async function handler(m, { sock, text, reply, jid, prefix }) {
      const input = String(text || '').trim()
      const chat = jid || m.chat
      if (!input) {
          return reply(
              `Escribe el enlace de un grupo o canal de WhatsApp.\n\n` +
              `Ejemplo:\n${prefix}cekid https://chat.whatsapp.com/xxxx\n${prefix}cekid https://whatsapp.com/channel/xxxx`
          )
      }

      const ch = input.match(CHANNEL_RE)
      if (ch) return channelInfo(sock, m, chat, reply, ch[1])

      const gc = input.match(GROUP_RE)
      if (gc) return groupInfo(sock, m, chat, reply, gc[1])

      return reply('Enlace no válido. Usa un enlace de grupo (chat.whatsapp.com) o de canal (whatsapp.com/channel).')
  }

export { pluginConfig as config, handler }
