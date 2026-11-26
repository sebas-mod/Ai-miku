/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const tempMailRead = ElysiaRuntime.tempMailRead;

const pluginConfig = {
    name: "pesanmail",
    alias: [],
    category: "tools",
    description: "pesanmail <id>",
    usage: ".pesanmail <id>",
    example: ".pesanmail <id>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const fail = (reply, e) => reply(e.friendly ? e.message : `❌ ${e.message}`)

  async function read(reply, prefix, id) {
      if (!id) return reply(`Contoh: ${prefix}pesanmail <message_id>`)

      const msg = await tempMailRead(id)
      const rawContent = msg.content || ''

      const links = [...new Set(rawContent.match(/(https?:\/\/[^\s"'<>]+)/g) || [])]
      const linkSection = links.length
          ? '\n\n🔗 *Link yang Ditemukan:*\n' + links.map((link, i) => `${i + 1}. ${link}`).join('\n')
          : ''

      const cleanContent = rawContent.replace(/<[^>]*>/g, '').trim()

      return reply(`📨 *Isi Pesan*
📌 Subjek: ${msg.subject}
👤 Dari: ${msg.from} <${msg.fromEmail}>
🕐 Diterima: ${msg.receivedAt}
🆔 ID: ${msg.id}

📬 Pesan:
${cleanContent || '(Tidak ada isi)'}${linkSection}`)
  }

  async function handler(m, { text, reply, prefix }) {
      try {
          return await read(reply, prefix, String(text || '').trim())
      } catch (e) {
          fail(reply, e)
      }
  }

export { pluginConfig as config, handler }
