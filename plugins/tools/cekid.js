/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

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
          return await sock.sendMessage(jid, { text: `${text}\n\n📋 ${label}: ${String(code)}\n\n_${global.namebot || 'Elysia Assistant MD'}_` }, { quoted: m })
      } catch (e) {
          console.error('[cekid] tombol gagal:', e?.message || e)
          return reply(text)
      }
  }

  async function groupInfo(sock, m, jid, reply, code) {
      try {
          const info = await sock.groupGetInviteInfo(code)
          const created = info.creation ? new Date(info.creation * 1000).toLocaleString('id-ID') : '-'
          const text = `
— INFO GRUP —

❀ Nama: ${info.subject}
❀ ID Grup: ${info.id}
❀ Member: ${info.size || 0}
❀ Dibuat: ${created}
`.trim()
          return sendWithCopy(sock, m, jid, reply, text, 'Salin ID Grup', info.id)
      } catch (e) {
          console.error(e)
          return reply('Gagal mengambil info grup. Pastikan link invite masih valid.')
      }
  }

  async function channelInfo(sock, m, jid, reply, code) {
      try {
          const result = await sock.newsletterMetadata('invite', code)
          const meta = result.thread_metadata || {}
          const created = meta.creation_time ? new Date(Number(meta.creation_time) * 1000).toLocaleString('id-ID') : '-'
          const text =
              `╭─▣「 *INFORMASI CHANNEL* 」▣─╮\n` +
              `┃ ✦ Nama       : ${meta.name?.text || '-'}\n` +
              `┃ ✦ ID Channel : ${result.id}\n` +
              `┃ ✦ Subscriber : ${Number(meta.subscribers_count || 0).toLocaleString('id-ID')}\n` +
              `┃ ✦ Verifikasi : ${meta.verification || '-'}\n` +
              `┃ ✦ Status     : ${result.state?.type || '-'}\n` +
              `┃ ✦ Dibuat     : ${created}\n` +
              `╰─────────────➤`
          return sendWithCopy(sock, m, jid, reply, text, 'Salin ID Channel', result.id)
      } catch (e) {
          console.error(e)
          return reply('Gagal mengambil data channel.')
      }
  }

  async function handler(m, { sock, text, reply, jid, prefix }) {
      const input = String(text || '').trim()
      const chat = jid || m.chat
      if (!input) {
          return reply(
              `Masukkan link grup atau channel WhatsApp.\n\n` +
              `Contoh:\n${prefix}cekid https://chat.whatsapp.com/xxxx\n${prefix}cekid https://whatsapp.com/channel/xxxx`
          )
      }

      const ch = input.match(CHANNEL_RE)
      if (ch) return channelInfo(sock, m, chat, reply, ch[1])

      const gc = input.match(GROUP_RE)
      if (gc) return groupInfo(sock, m, chat, reply, gc[1])

      return reply('Link tidak valid. Gunakan link grup (chat.whatsapp.com) atau channel (whatsapp.com/channel).')
  }

export { pluginConfig as config, handler }
