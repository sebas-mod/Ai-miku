/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

const tempMailInbox = MikuRuntime.tempMailInbox;

const pluginConfig = {
    name: "cekmail",
    alias: ["mail"],
    category: "tools",
    description: "cekmail <email>",
    usage: ".cekmail <email>",
    example: ".cekmail <email>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const fail = (reply, e) => reply(e.friendly ? e.message : `❌ ${e.message}`)

  async function inbox(reply, prefix, email) {
      if (!email) return reply(`Ejemplo: ${prefix}cekmail <correo>`)
      

      const { mailbox, messages } = await tempMailInbox(email)
      if (!messages.length) return reply('📭 Todavía no hay mensajes recibidos.')

      let out = `📥 *Mensajes recibidos*\n📫 Correo: ${mailbox}\n\n`
      out += messages.map((v, i) => `🔹 *${i + 1}*. ${v.subject || '(Tanpa Subjek)'}\n📩 ID: ${v.id}`).join('\n\n')
      return reply(out + `\n\nPara leer un mensaje: *${prefix}pesanmail <id>*`)
  }

  async function handler(m, { text, reply, prefix }) {
      try {
          return await inbox(reply, prefix, String(text || '').trim())
      } catch (e) {
          fail(reply, e)
      }
  }

export { pluginConfig as config, handler }
