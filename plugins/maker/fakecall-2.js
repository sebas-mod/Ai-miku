/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'
import FormData from 'form-data'

const te = ElysiaRuntime.te;

  const pluginConfig = {
      name: ['fakecall', 'fakecall-android', 'fakecall-ios'],
      alias: ['fakecallwa'],
      category: "maker",
      description: 'Membuat gambar fake call WhatsApp (Tersedia versi Android dan iOS)',
      usage: '.fakecall nama | durasi',
      example: '.fakecall Elysia Assistant | 19:00',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 10,
      energi: 1,
      isEnabled: true
  }

  async function handler(m, { sock }) {
      const cmd = m.command.toLowerCase()
      const text = m.text

      if (!text || !text.includes('|')) {
          let helpText = `¡Hola! Parece que el formato que enviaste no es correcto.\n\n`
          helpText += `Esta función crea una imagen de llamada falsa, como si alguien te estuviera llamando.\n\n`
          helpText += `*Comandos disponibles:*\n`
          helpText += `- *${m.prefix}fakecall* (Para la vista de llamada de Android)\n`
          helpText += `- *${m.prefix}fakecall-ios* (Para la vista de llamada de iPhone o iOS)\n\n`
          helpText += `*Cómo usar:*\n`
          helpText += `Escribe el comando seguido de *Nombre* y *Duración* separados por una barra vertical (|).\n\n`
          helpText += `*Ejemplo de uso:*\n`
          helpText += `- *${m.prefix}fakecall Elysia Assistant | 03:33:33*\n`
          helpText += `- *${m.prefix}fakecall-ios Sayangku | 12:00:00*\n\n`
          helpText += `*Tips Tambahan:*\n`
          helpText += `¡Puedes responder a una imagen para usarla como foto de perfil de quien llama!`

          return m.reply(helpText)
      }

      const [nama, durasi] = text.split('|').map(s => s.trim())

      if (!nama) {
          return m.reply(`El nombre de quien llama no puede estar vacío. ¡Escribe un nombre primero!`)
      }

      if (!durasi) {
          return m.reply(`La duración de la llamada no puede estar vacía. ¡Escribe una duración primero!`)
      }

      await m.react('🕕')

      try {
          let bufferBase

          if (m.isImage) {
              try {
                  bufferBase = await m.download()
              } catch (err) {}
          } else if (m.quoted?.isImage) {
              try {
                  bufferBase = await m.quoted.download()
              } catch (err) {}
          }

          if (!bufferBase) {
              try {
                  const ppUrl = await sock.profilePictureUrl(m.sender, 'image')
                  const res = await axios.get(ppUrl, { responseType: 'arraybuffer' })
                  bufferBase = Buffer.from(res.data)
              } catch (err) {
                  const res = await axios.get('https://files.catbox.moe/nwvkbt.png', { responseType: 'arraybuffer' })
                  bufferBase = Buffer.from(res.data)
              }
          }

          const form = new FormData()
          form.append('avatarUrl', bufferBase, { filename: 'avatar.jpg', contentType: 'image/jpeg' })
          form.append('name', nama)
          form.append('duration', durasi)

          let endpoint = 'fakecall-android'
          if (cmd === 'fakecall-ios') {
              endpoint = 'fakecall-ios'
          }

          const apiUrl = `https://my.izuka-api.xyz/api/canvas/${endpoint}`

          const response = await axios.post(apiUrl, form, {
              headers: form.getHeaders(),
              responseType: 'arraybuffer'
          })

          await sock.sendMessage(m.chat, { image: Buffer.from(response.data) }, { quoted: m })

          await m.react('📞')

      } catch (err) {
          await m.react('☢')
          return m.reply(te(m.prefix, m.command, m.pushName))
      }
  }

export { pluginConfig as config, handler }
