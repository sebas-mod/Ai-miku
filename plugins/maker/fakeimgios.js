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

const config = ElysiaRuntime.config;
const uploadToTmpFiles = ElysiaRuntime.uploadToTmpFiles;

  const pluginConfig = {
      name: 'fakeimgios',
      alias: ['imgios'],
      category: "maker",
      description: 'Membuat gambar ss ios',
      usage: '.fakeimgios',
      example: '.fakeimgios',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 10,
      energi: 1,
      isEnabled: true
  }

  async function handler(m, { sock }) {
       const isImage = m.isImage || (m.quoted && m.quoted.isImage)

          if (!isImage) {
              m.react('❌')
              return m.reply(
                  `📷 *FAKE IMG IOS*\n\n` +
                  `Responde a la imagen`
              )
          }

          let imageBuffer
          if (m.isImage && m.download) {
              imageBuffer = await m.download()
          } else if (m.quoted && m.quoted.isImage && m.quoted.download) {
              imageBuffer = await m.quoted.download()
          }

          if (!imageBuffer) {
              m.react('❌')
              return m.reply(`❌ *Gomen ne~* ✦\n\n> No se pudo descargar la imagen~ 🥺`)
          }

      m.react('🕕')

      try {
          const gmbr = await uploadToTmpFiles(imageBuffer, {
              filename: 'image.jpg',
              contentType: 'image/jpeg'
          })
          await sock.sendMedia(m.chat, `https://kazztzyy.my.id/api/maker/img2ios?image=${encodeURIComponent(gmbr.directUrl)}`, null, m, {
              type: 'image',
          })

          m.react('✅')

      } catch (error) {
          m.react('❌')
          m.reply(`❌ *Gomen ne~* ✦\n\n> ${error.message}\n\n_Lo intenté con todas mis fuerzas pero también falló... inténtalo de nuevo más tarde~ 🌸_`)
      }
  }

export { pluginConfig as config, handler }
