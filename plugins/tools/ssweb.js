/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const webScreenshot = ElysiaRuntime.webScreenshot;
const webRecord = ElysiaRuntime.webRecord;

const pluginConfig = {
    name: "ssweb",
    alias: ["ss", "screenshotweb"],
    category: "tools",
    description: "ssweb",
    usage: ".ssweb",
    example: ".ssweb",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { sock, text, reply, prefix, command }) {
      if (!text) {
          return reply(`乂 *SSWEB / GRABAR WEB*

📌 Captura de pantalla:
${prefix}${command} https://github.com

🎥 Grabar vídeo:
${prefix}${command} video https://github.com

⚙️ Opciones:
desktop_fhd / desktop / tablet / mobile

Ejemplo:
${prefix}${command} video https://github.com desktop_fhd 8000`)
      }

      try {
          const args = text.trim().split(/\s+/)
          const mode = args[0]?.toLowerCase() === 'video' ? 'video' : 'image'
          if (mode === 'video') args.shift()

          let url = args[0]
          const device = args[1] || 'desktop_fhd'
          const duration = Number(args[2]) || 8000

          if (!url) return reply('Escribe la URL de la web.')
          if (!/^https?:\/\//i.test(url)) url = 'https://' + url

          await reply(mode === 'video' ? '⏳ Grabando la web en vídeo...' : '⏳ Haciendo la captura de la web...')

          if (mode === 'video') {
              const videoUrl = await webRecord(url, device, duration)
              return sock.sendMessage(m.chat, {
                  video: { url: videoUrl },
                  mimetype: 'video/mp4',
                  caption: `乂 *GRABACIÓN WEB*\n\n🌐 URL: ${url}\n📱 Dispositivo: ${device}\n⏱️ Duración: ${duration} ms`
              }, { quoted: m })
          }

          const imageUrl = await webScreenshot(url, device)
          return sock.sendMessage(m.chat, {
              image: { url: imageUrl },
              caption: `乂 *CAPTURA WEB*\n\n🌐 URL: ${url}\n📱 Dispositivo: ${device}`
          }, { quoted: m })
      } catch (e) {
          reply(e.friendly ? e.message : `Error: ${e.message}`)
      }
  }

export { pluginConfig as config, handler }
