/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import axios from 'axios'

const pluginConfig = {
    name: "yta",
    alias: [],
    category: "download",
    description: "yta",
    usage: ".yta",
    example: ".yta",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

  async function handler(m, { conn, usedPrefix, command, args }) {
      const url = args[0]
      if (!url) {
          return m.reply(`
• ${usedPrefix}ytmp3 <url>
• ${usedPrefix}ytmp4 <url>`)
      }

      const isAudio = command.includes('mp3') || command === 'yta'
      const type = isAudio ? 'audio' : 'merge'
      const apikey = 'nbteam'
      const apiBase = 'https://youtubedl.siputzx.my.id'

          const { data: initialResponse } = await axios.get(`${apiBase}/download`, {
              params: { url, type, apikey }
          })

          await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

          let finalData = initialResponse
          let attempts = 0
          const maxAttempts = 20
          while (finalData.status !== 'completed' && attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 3000))
              const { data: checkData } = await axios.get(`${apiBase}/download`, {
                  params: { url, type, apikey }
              })
              finalData = checkData
              attempts++

              if (finalData.status === 'error') throw new Error(finalData.error || 'API Error')
          }

          if (finalData.status !== 'completed') {
              throw new Error('Se agotó el tiempo de espera. Inténtalo de nuevo más tarde.')
          }

          const downloadUrl = `${apiBase}${finalData.fileUrl}`
          if (isAudio) {
              await conn.sendMessage(m.chat, {
                  audio: { url: downloadUrl },
                  mimetype: 'audio/mpeg'
              }, { quoted: m })
          } else {
              await conn.sendMessage(m.chat, {
                  video: { url: downloadUrl },
                  mimetype: 'video/mp4'
              }, { quoted: m })
          }

          await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  }

export { pluginConfig as config, handler }
