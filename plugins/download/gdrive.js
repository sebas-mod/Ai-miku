/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { createRequire } from 'node:module'
import axios from 'axios'

  const pluginConfig = {
      name: 'gdrive',
      alias: ["gd", "drivedl2"],
      category: "download",
      description: 'Download file dari Google Drive',
      usage: '.gdrive <url>',
      example: '.gdrive https://drive.google.com/file/d/xxx/view',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 15,
      energi: 1,
      isEnabled: true
  }

  function formatSize(bytes) {
      if (bytes === 0) return '0 B'
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i]
  }

  async function drive(url) {
      let id
      let res = { error: true }

      if (!url || !url.match(/drive\.google/i)) return res

      try {
          id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1]
          if (!id) throw new Error("ID Not Found")

          const response = await axios.post(
              `https://drive.google.com/uc?id=${id}&authuser=0&export=download`,
              {},
              {
                  headers: {
                      'accept-encoding': 'gzip, deflate, br',
                      'content-length': 0,
                      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                      'origin': 'https://drive.google.com',
                      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
                      'x-client-data': 'CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=',
                      'x-drive-first-party': 'DriveWebUi',
                      'x-json-requested': 'true'
                  }
              }
          )

          const data = JSON.parse(response.data.slice(4))
          const { fileName, sizeBytes, downloadUrl } = data

          if (!downloadUrl) throw new Error("¡Enlace con límite de descargas!")

          return {
              downloadUrl: downloadUrl,
              fileName: fileName,
              fileSize: formatSize(sizeBytes),
              mimetype: 'application/octet-stream'
          }
      } catch (e) {
          console.error('[Drive] Error:', e.message)
          return res
      }
  }

  async function handler(m, { sock }) {
      const url = m.text?.trim() || m.args[0]

      if (!url) {
          return m.reply(
              `*GOOGLE DRIVE*\n\n` +
              `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
              `┃ ✦ *Cómo usar*\n` +
              `┃\n` +
              `┃   ${m.prefix}gdrive <url>\n` +
              `┃\n` +
              `┃ ✦ *Ejemplo*\n` +
              `┃\n` +
              `┃   ${m.prefix}gdrive https://drive.google.com/file/d/xxx/view\n` +
              `┃\n` +
              `┃ *${global.namebot || 'Bot'}:* ¿Qué archivo de Google Drive quieres descargar, darling~?\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━⬣`
          )
      }

      if (!url.match(/drive\.google/i)) {
          return m.reply(
              `💔 *ERROR*\n\n` +
              `> URL no válida. Envía un enlace de Google Drive correcto, cariño~ 🥺`
          )
      }

      m.react('💕')
      await m.reply(`⏳ *PROCESANDO...*\n\n *${global.namebot || 'Bot'}:* Estoy obteniendo el archivo de Google Drive, cariño~ espera un momento 📁`)

      try {
          const data = await drive(url)

          if (data.error || !data.downloadUrl) {
              m.react('💔')
              return m.reply(
                  `💔 *ERROR*\n\n` +
                  `> No se puede acceder al archivo o el enlace alcanzó su límite, cariño~ 🥺`
              )
          }

          await sock.sendMessage(m.chat, {
              document: { url: data.downloadUrl },
              fileName: data.fileName,
              mimetype: data.mimetype,
              caption: `*GOOGLE DRIVE*\n\n` +
                      `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
                      `┃ 📄 *NOMBRE*: ${data.fileName}\n` +
                      `┃ 📦 *TAMAÑO*: ${data.fileSize}\n` +
                      `┃\n` +
                      `┃ *${global.namebot || 'Bot'}:* Aquí tienes el archivo, cariño~ 📂\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━━⬣`
          }, { quoted: m })

          m.react('✅')
      } catch (err) {
          console.error('[GDrive] Error:', err)
          m.react('💔')
          return m.reply(
              `💔 *ERROR*\n\n` +
              `> ${err.message}\n\n` +
              `> Inténtalo de nuevo, cariño~ 🥺`
          )
      }
  }

export { pluginConfig as config, handler }
