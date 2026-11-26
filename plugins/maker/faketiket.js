/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import { createCanvas, loadImage } from '@napi-rs/canvas';
import axios from 'axios';

const config = ElysiaRuntime.config;

  const pluginConfig = {
      name: 'faketiket',
      alias: ['tiketfake', 'faketicket', 'fakepesawat'],
      category: "maker",
      description: 'Bikin fake tiket pesawat (buat konten/gaguan doang)',
      usage: '.faketiket <dari> | <tujuan> | <nama>',
      example: '.faketiket Jakarta | Tokyo | Elysia Assistant',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 8,
      energi: 1,
      isEnabled: true
  }

  const TEMPLATE_URL = 'https://i.imgur.com/tiket-template.png'

  async function generateFakeTiket(dari, tujuan, nama) {
      const templateBuffer = await axios.get(TEMPLATE_URL, { responseType: 'arraybuffer' })
      const template = await loadImage(Buffer.from(templateBuffer.data))

      const canvas = createCanvas(template.width, template.height)
      const ctx = canvas.getContext('2d')

      ctx.drawImage(template, 0, 0)

      ctx.font = 'bold 18px "Arial"'
      ctx.fillStyle = '#000000'
      ctx.textAlign = 'center'

      ctx.fillText(dari.toUpperCase(), canvas.width / 4, 150)

      ctx.fillText(tujuan.toUpperCase(), canvas.width * 3 / 4, 150)

      ctx.font = 'bold 14px "Arial"'
      ctx.fillText(nama.toUpperCase(), canvas.width / 2, 220)

      const flightNo = 'ZT' + Math.floor(Math.random() * 900 + 100)
      ctx.fillText(flightNo, canvas.width / 2, 260)

      const gate = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Math.floor(Math.random() * 30 + 1)
      ctx.fillText(gate, canvas.width / 2, 300)

      const seat = String.fromCharCode(65 + Math.floor(Math.random() * 10)) + Math.floor(Math.random() * 30 + 1)
      ctx.fillText(seat, canvas.width / 2, 340)

      const now = new Date()
      now.setDate(now.getDate() + Math.floor(Math.random() * 30))
      ctx.fillText(now.toLocaleDateString('id-ID'), canvas.width / 2, 380)

      const waktu = `${Math.floor(Math.random() * 23)}:${Math.floor(Math.random() * 60)}`
      ctx.fillText(waktu, canvas.width / 2, 420)

      return canvas.toBuffer('image/png')
  }

  async function handler(m, { sock }) {
      const text = m.args.join(' ') || m.text?.trim() || ''

      if (!text) {
          return m.reply(
              `💕 *BILLETE DE AVIÓN FALSO* 💕\n\n` +
              `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
              `┃ ✦ *Cómo usar*\n` +
              `┃\n` +
              `┃   ${m.prefix}faketiket <origen> | <destino> | <nombre>\n` +
              `┃\n` +
              `┃ ✦ *Ejemplo*\n` +
              `┃\n` +
              `┃   ${m.prefix}faketiket Jakarta | Tokyo | Elysia Assistant\n` +
              `┃\n` +
              `┃ 💗 *Elysia Assistant:* ¿A dónde quieres ir, darling~?\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━⬣`
          )
      }

      const parts = text.split('|').map(p => p.trim())
      const dari = parts[0] || 'Jakarta'
      const tujuan = parts[1] || 'Tokyo'
      const nama = parts[2] || 'Darling'

      m.react('💕')
      await m.reply(`⏳ *PROCESANDO...*\n\n💗 *Elysia Assistant:* Creando el billete de avión, darling~`)

      try {
          const imageBuffer = await generateFakeTiket(dari, tujuan, nama)

          await sock.sendMessage(m.chat, {
              image: imageBuffer,
              caption: `💕 *ENTRADA FALSA* 💕\n\n` +
                      `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
                      `┃ ✅ *ÉXITO*\n` +
                      `┃ ✈️ *RUTA*: ${dari} → ${tujuan}\n` +
                      `┃ 👤 *NOMBRE*: ${nama}\n` +
                      `┃\n` +
                      `┃ 💗 *Elysia Assistant:* Aquí tienes tu billete, darling~ ¡buen viaje! 🗿\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━━⬣`
          }, { quoted: m })

          m.react('✅')

      } catch (err) {
          console.error('[FakeTiket] Error:', err)
          m.react('💔')
          return m.reply(`💔 *ERROR*\n\n> ${err.message}`)
      }
  }

export { pluginConfig as config, handler }
