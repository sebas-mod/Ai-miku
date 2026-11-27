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
      name: 'wuwa',
      alias: [],
      category: "anime",
      description: 'Menampilkan sheet material karakter Wuthering Waves',
      usage: '.wuwa <nama karakter>',
      example: '.wuwa sanhua',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 5,
      energi: 1,
      isEnabled: true
  }

  const characters = {
      sanhua: "1102",
      baizhi: "1103",
      lingyang: "1104",
      chixia: "1202",
      encore: "1203",
      mortefi: "1204",
      calcharo: "1301",
      yinlin: "1302",
      yuanwu: "1303",
      yangyang: "1402",
      aalto: "1403",
      jiyan: "1404",
      jianxin: "1405",
      "rover-spectro": "1502",
      verina: "1503",
      taoqi: "1601",
      danjin: "1602",
      "rover-havoc": "1604"
  }

  async function run(m, { sock }) {
      const args = m.args || []
      const query = args[0]?.toLowerCase()

      if (!query) {
          return m.reply(
              `💕 *ᴡᴜᴛʜᴇʀɪɴɢ ᴡᴀᴠᴇꜱ* 💕\n\n` +
              `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
              `┃ ✦ *Cara Pakai*\n` +
              `┃\n` +
              `┃   ${m.prefix}wuwa <nombre del personaje>\n` +
              `┃\n` +
              `┃ ✦ *Ejemplo*\n` +
              `┃\n` +
              `┃   ${m.prefix}wuwa sanhua\n` +
              `┃   ${m.prefix}wuwa jiyan\n` +
              `┃\n` +
              `┃ ✦ *List Karakter*\n` +
              `┃\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━⬣\n` +
              `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
              `┃ ${Object.keys(characters).join('\n┃ ')}\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━⬣`
          )
      }

      m.react('💕')
      await m.reply(`⏳ *PROCESSING...*\n\n💗 *Ai Miku:* Buscando sábanas ${query} cariño ~ espera un momento, estás bien 🎮`)

      try {
          const charId = characters[query]

          if (!charId) {
              return m.reply(
                  `💔 *NO ENCONTRADO*\n\n` +
                  `> Personaje *${query}*no encontrado cariño~\n\n` +
                  `> *List Karakter:*\n${Object.keys(characters).join('\n• ')}`
              )
          }

          const url = `https://raw.githubusercontent.com/DEViantUA/wuthering-waves-elevation-materials/main/character/${charId}.png`
          const response = await axios.get(url, { responseType: 'arraybuffer' })

          if (response.status !== 200) {
              throw new Error('No se pudo tomar la foto')
          }

          const imageBuffer = Buffer.from(response.data)

          await sock.sendMessage(m.chat, {
              image: imageBuffer,
              caption: `💕 *ᴡᴜᴛʜᴇʀɪɴɢ ᴡᴀᴠᴇꜱ* 💕\n\n` +
                      `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
                      `┃ ✦ *ᴋᴀʀᴀᴋᴛᴇʀ*: ${query.toUpperCase()}\n` +
                      `┃ ✦ *ɪᴅ*: ${charId}\n` +
                      `┃\n` +
                      `┃ 💗 *Ai Miku:* Esta es la hoja de materiales cariño~ 🎮\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━━⬣`
          }, { quoted: m })

          m.react('✅')

      } catch (err) {
          console.error('[WuWa] Error:', err)
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
