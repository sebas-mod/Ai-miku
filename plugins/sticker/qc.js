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

const config = MikuRuntime.config;
const te = MikuRuntime.te;
const getAssetBuffer = MikuRuntime.getAssetBuffer;
const isIosId = MikuRuntime.isIosId;
const chatIsIos = MikuRuntime.chatIsIos;

  const pluginConfig = {
      name: 'qc',
      alias: ["quotely", "quotechat"],
      category: "sticker",
      description: 'Crea un sticker de cita: escribe el texto y elige el color con los botones',
      usage: '.qc <texto> (y luego elige el color con los botones) | .qc <color> <texto>',
      example: '.qc ¡Hola a todos!',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 10,
      energi: 1,
      isEnabled: true
  }

  const COLORS = {
      pink: '#f68ac9',
      blue: '#6cace4',
      red: '#f44336',
      green: '#4caf50',
      yellow: '#ffeb3b',
      purple: '#9c27b0',
      darkblue: '#0d47a1',
      lightblue: '#03a9f4',
      ash: '#9e9e9e',
      orange: '#ff9800',
      black: '#000000',
      white: '#ffffff',
      teal: '#008080',
      lightpink: '#FFC0CB',
      chocolate: '#A52A2A',
      salmon: '#FFA07A',
      magenta: '#FF00FF',
      tan: '#D2B48C',
      wheat: '#F5DEB3',
      deeppink: '#FF1493',
      fire: '#B22222',
      skyblue: '#00BFFF',
      brightskyblue: '#1E90FF',
      hotpink: '#FF69B4',
      lightskyblue: '#87CEEB',
      seagreen: '#20B2AA',
      darkred: '#8B0000',
      orangered: '#FF4500',
      cyan: '#48D1CC',
      violet: '#BA55D3',
      mossgreen: '#00FF7F',
      darkgreen: '#008000',
      navyblue: '#191970',
      darkorange: '#FF8C00',
      darkpurple: '#9400D3',
      fuchsia: '#FF00FF',
      darkmagenta: '#8B008B',
      darkgray: '#2F4F4F',
      peachpuff: '#FFDAB9',
      darkishgreen: '#BDB76B',
      darkishred: '#DC143C',
      goldenrod: '#DAA520',
      darkishgray: '#696969',
      darkishpurple: '#483D8B',
      gold: '#FFD700',
      silver: '#C0C0C0'
  }

  const DEFAULT_PP = 'https://files.catbox.moe/nwvkbt.png'

  async function getProfilePicture(sock, jid) {
      try {
          return await sock.profilePictureUrl(jid, 'image')
      } catch {
          return DEFAULT_PP
      }
  }

  const COLOR_SECTIONS = [
      { title: 'Populer', names: ['pink', 'blue', 'red', 'green', 'yellow', 'purple', 'orange', 'black', 'white'] },
      { title: 'Pastel y Claros', names: ['lightpink', 'hotpink', 'deeppink', 'salmon', 'peachpuff', 'wheat', 'tan', 'lightblue', 'lightskyblue', 'skyblue', 'cyan', 'seagreen', 'mossgreen', 'violet', 'gold', 'silver'] },
      { title: 'Oscuros y Fuertes', names: ['darkblue', 'brightskyblue', 'navyblue', 'darkgreen', 'darkishgreen', 'darkred', 'darkishred', 'fire', 'orangered', 'darkorange', 'goldenrod', 'chocolate', 'darkpurple', 'darkishpurple', 'darkmagenta', 'magenta', 'fuchsia', 'teal', 'ash', 'darkgray', 'darkishgray'] }
  ]

  const titleCase = (name) => name.replace(/^./, c => c.toUpperCase())
  const isIosMessage = (m) => isIosId(m.key?.id) || (!m.isGroup && chatIsIos(m.chat))
  const isColor = (name) => Object.prototype.hasOwnProperty.call(COLORS, String(name || '').toLowerCase())

  // Teks cadangan (dipakai di iPhone dan kalau tombol gagal dikirim)
  function qcMenuText(m, text) {
      const list = COLOR_SECTIONS.map(sec => `*${sec.title}*\n${sec.names.join(', ')}`).join('\n\n')
      return (
          `💬 *Cita Sticker*\n\nTu texto: _${text}_\n\n` +
          `Seleccione un color escribiendo:\n*${m.prefix}qc <color> ${text}*\n\n${list}`
      )
  }

  // Kirim tombol pilih warna; id tombol = ".qc <warna> <teks>"
  // Android/Desktop: tombol list. iPhone: 3 tombol reply + daftar teks lengkap di badan pesan.
  async function sendColorMenu(m, sock, text) {
      const p = m.prefix
      const logo = getAssetBuffer('qc')
      const footer = global.namebot || 'Quote Maker'
      const pick = (name) => ({ type: 'reply', text: titleCase(name), id: `${p}qc ${name} ${text}` })

      try {
          if (isIosMessage(m)) {
              return await sock.sendButtons(m.chat, {
                  ...(logo ? { image: logo } : {}),
                  text: qcMenuText(m, text),
                  footer,
                  thumbKey: 'qc',
                  mentions: [m.sender],
                  iosKeepReply: true,
                  buttons: ['pink', 'blue', 'black'].map(pick)
              }, { quoted: m })
          }

          return await sock.sendButtons(m.chat, {
              ...(logo ? { image: logo } : {}),
              text: `💬 *¿Qué color quieres para la cotización?*\n\nTu texto: _${text}_\n\nElija un color a través del botón de abajo 👇`,
              footer,
                  thumbKey: 'qc',
              mentions: [m.sender],
              buttons: [{
                  type: 'list',
                  text: 'Seleccionar color',
                  sections: COLOR_SECTIONS.map(sec => ({
                      title: sec.title,
                      rows: sec.names.map(name => ({
                          title: titleCase(name),
                          description: COLORS[name],
                          id: `${p}qc ${name} ${text}`
                      }))
                  }))
              }]
          }, { quoted: m })
      } catch (err) {
          console.error('El botón [qc] falló, envíe texto sin formato:', err.stack || err)
          const caption = qcMenuText(m, text)
          if (logo) return sock.sendMessage(m.chat, { image: logo, caption, mentions: [m.sender] }, { quoted: m })
          return m.reply(caption)
      }
  }

  async function handler(m, { sock }) {
      const args = m.args || []
      const quotedText = m.quoted ? (m.quoted.text || m.quoted.body || '') : ''

      const hasColor = args.length > 0 && isColor(args[0])
      const color = hasColor ? args[0].toLowerCase() : ''
      const message = (hasColor ? args.slice(1).join(' ') : args.join(' ')).trim() || quotedText.trim()

      if (!message) {
          return m.reply(
              `💬 *ǫᴜᴏᴛᴇ sᴛɪᴄᴋᴇʀ*\n\n` +
              `╭┈┈⬡「 📋 *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ* 」\n` +
              `┃ ◦ \`${m.prefix}qc <texto>\` luego seleccione el color mediante el botón\n` +
              `┃ ◦ Responder mensaje + \`${m.prefix}qc\`\n` +
              `┃ ◦ Langsung: \`${m.prefix}qc <color> <texto>\`\n` +
              `╰┈┈⬡\n\n` +
              `> Ejemplo: \`${m.prefix}qc ¡Hola a todos!\``
          )
      }

      if (message.length > 80) {
          return m.reply(`❌ *ERROR*\n\n> ¡Máximo 80 caracteres! (En este momento: ${message.length})`)
      }

      if (!hasColor) return sendColorMenu(m, sock, message)

      const backgroundColor = COLORS[color]
      m.react('🕕')

      try {
          const username = m.pushName || 'User'
          const avatar = await getProfilePicture(sock, m.sender)

          const json = {
          "messages": [
              {
              "from": {
                  "id": Math.floor(Math.random() * 10),
                  "first_name": username,
                  "last_name": "",
                  "name": "",
                  "photo": {
                  "url": avatar
                  }
              },
              "text": message,
              "entities": [],
              "avatar": true,
              "media": {
                  "url": ""
              },
              "mediaType": "",
              "replyMessage": {
                  "name": "",
                  "text": "",
                  "entities": [],
                  "chatId": Math.floor(Math.random() * 10)
              }
              }
          ],
          "backgroundColor": backgroundColor,
          "width": 512,
          "height": 512,
          "scale": 2,
          "type": "quote",
          "format": "png",
          "emojiStyle": "apple"
          }

          const response = await axios.post('https://brat.siputzx.my.id/quoted', json, {
              timeout: 60000,
              responseType: 'arraybuffer'
          })

          const buffer = Buffer.from(response.data, 'base64')

          await sock.sendImageAsSticker(m.chat, buffer, m, {
              packname: config.sticker?.packname || 'Bot',
              author: config.sticker?.author || 'Bot'
          })

          m.react('✅')
      } catch (error) {
          m.react('☢')
          m.reply(te(m.prefix, m.command, m.pushName))
      }
  }

export { pluginConfig as config, handler }
