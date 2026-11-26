/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const tempMailCreate = MikuRuntime.tempMailCreate;
const tempMailInbox = MikuRuntime.tempMailInbox;
const tempMailRead = MikuRuntime.tempMailRead;

const pluginConfig = {
    name: "tempmail",
    alias: ["emailsementara", "tmail"],
    category: "tools",
    description: "Fitur tools tempmail",
    usage: ".tempmail",
    example: ".tempmail",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const fail = (reply, e) => reply(e.friendly ? e.message : `❌ ${e.message}`)

  async function create(reply, prefix) {
      const { email, deletedIn } = await tempMailCreate()
      return reply(`📫 *¡Correo temporal creado!*
📧 Correo: ${email}
🕐 Caduca: ${deletedIn}

Ver la bandeja:
*${prefix}tempmail cek ${email}*`)
  }

  async function inbox(reply, prefix, email) {
      if (!email) return reply(`Ejemplo: ${prefix}tempmail cek <correo>`)

      const { mailbox, messages } = await tempMailInbox(email)
      if (!messages.length) return reply('📭 Todavía no hay mensajes recibidos.')

      let out = `📥 *Mensajes recibidos*\n📫 Correo: ${mailbox}\n\n`
      out += messages.map((v, i) => `🔹 *${i + 1}*. ${v.subject || '(sin asunto)'}\n📩 ID: ${v.id}`).join('\n\n')
      return reply(out + `\n\nPara leer un mensaje: *${prefix}tempmail baca <id>*`)
  }

  async function read(reply, prefix, id) {
      if (!id) return reply(`Ejemplo: ${prefix}tempmail baca <id_del_mensaje>`)

      const msg = await tempMailRead(id)
      const rawContent = msg.content || ''

      const links = [...new Set(rawContent.match(/(https?:\/\/[^\s"'<>]+)/g) || [])]
      const linkSection = links.length
          ? '\n\n🔗 *Enlaces encontrados:*\n' + links.map((link, i) => `${i + 1}. ${link}`).join('\n')
          : ''

      const cleanContent = rawContent.replace(/<[^>]*>/g, '').trim()

      return reply(`📨 *Contenido del mensaje*
📌 Asunto: ${msg.subject}
👤 De: ${msg.from} <${msg.fromEmail}>
🕐 Recibido: ${msg.receivedAt}
🆔 ID: ${msg.id}

📬 Mensaje:
${cleanContent || '(sin contenido)'}${linkSection}`)
  }

  async function handler(m, { text, reply, prefix }) {
      try {
          const [first = '', ...rest] = String(text || '').trim().split(/\s+/)
          const arg = rest.join(' ').trim()
          const sub = first.toLowerCase()

          if (!sub) return await create(reply, prefix)
          if (['cek', 'inbox'].includes(sub)) return await inbox(reply, prefix, arg)
          if (['baca', 'read'].includes(sub)) return await read(reply, prefix, arg)

          if (first.includes('@')) return await inbox(reply, prefix, first)

          return reply(
              `*Correo temporal*\n` +
              `• ${prefix}tempmail  → crear un correo nuevo\n` +
              `• ${prefix}tempmail cek <correo>  → ver la bandeja\n` +
              `• ${prefix}tempmail baca <id>  → leer un mensaje`
          )
      } catch (e) {
          fail(reply, e)
      }
  }

export { pluginConfig as config, handler }
