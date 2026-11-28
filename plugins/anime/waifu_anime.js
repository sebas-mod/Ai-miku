/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
const mikuWrapPlugin = MikuRuntime.mikuWrapPlugin;
import axios from 'axios';

  const pluginConfig = {
      name: 'waifu',
      alias: [],
      category: "anime",
      description: 'Imagen de waifu aleatoria de varias fuentes',
      usage: '.waifu',
      example: '.waifu',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 5,
      energi: 1,
      isEnabled: true
  }

  async function getRandomWaifu() {
      const cats = ['waifu', 'neko', 'husbando', 'kitsune']
      for (let i = 0; i < 3; i++) {
          const cat = cats[Math.floor(Math.random() * cats.length)]
          try {
              const res = await axios.get(`https://nekos.best/api/v2/${cat}`, { timeout: 8000 })
              const url = res.data?.results?.[0]?.url
              if (url) return { url, source: 'nekos.best' }
          } catch (e) {}
      }
      try {
          const res = await axios.get('https://nekos.life/api/v2/img/waifu', { timeout: 8000 })
          if (res.data?.url) return { url: res.data.url, source: 'nekos.life' }
      } catch (e) {}

      const backupImages = [
          'https://i.pinimg.com/originals/e3/30/66/e33066f3cdbddd7ba3e37d2d576e8b66.jpg',
          'https://i.pinimg.com/originals/9b/2d/65/9b2d652e8f9742d6e6767a5eb3424df6.png',
          'https://i.pinimg.com/originals/ee/c1/d8/eec1d883e44ef0a61d11fc6fe3c6d827.jpg',
          'https://i.pinimg.com/originals/7d/cd/4e/7dcd4eedebe7da3d4e9567ede11439e8.jpg',
          'https://i.pinimg.com/originals/42/ca/20/42ca20ce567b97ac89eec4e7ed79f1e1.png'
      ]
      return { url: backupImages[Math.floor(Math.random() * backupImages.length)], source: 'fallback' }
  }

  async function run(m, { sock }) {
      m.react('💕')
      await m.reply(`⏳ *PROCESANDO...*\n\n💗 *Ai Miku:* Buscando fotos de waifu cariño~ espera un minuto, vale 🦋`)

      try {
          const result = await getRandomWaifu()

          if (!result || !result.url) {
              throw new Error('No se pudo tomar la foto de waifu')
          }

          await sock.sendMessage(m.chat, {
              image: { url: result.url },
              caption: `💕 *ᴡᴀɪꜰᴜ ʀᴀɴᴅᴏᴍ* 💕\n\n` +
                      `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
                      `┃ 🖼️ *ꜱᴏᴜʀᴄᴇ*: ${result.source}\n` +
                      `┃ 💗 *WAIFU*: Para mi amada querida~\n` +
                      `┃\n` +
                      `┃ 💗 *Ai Miku:* Esta es su waifu querida~ ¡no mires a los demás, está bien! 😘\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━━⬣`
          }, { quoted: m })

          m.react('✅')

      } catch (err) {
          console.error('[Waifu] Error:', err)
          m.react('💔')
          return m.reply(
              `💔 *ᴇʀʀᴏʀ*\n\n` +
              `> ${err.message}\n\n` +
              `> Inténtalo de nuevo, cariño ~ 🥺`
          )
      }
  }

  const handler = mikuWrapPlugin(pluginConfig, (m, ctx) => run(m, { ...ctx, conn: ctx.sock, usedPrefix: ctx.prefix, args: m.args || [] }))

export { pluginConfig as config, handler }
