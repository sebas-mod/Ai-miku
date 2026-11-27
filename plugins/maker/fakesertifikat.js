/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { createCanvas, loadImage } from '@napi-rs/canvas';
import axios from 'axios';

const config = MikuRuntime.config;

  const pluginConfig = {
      name: 'fakesertifikat',
      alias: ['sertifikatfake', 'fakecert'],
      category: "maker",
      description: 'Crea un certificado de premio falso (solo para contenido/bromas)',
      usage: '.fakesertifikat <nombre> | <penghargaan>',
      example: '.fakesertifikat Ai Miku | Best Darling Award',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 8,
      energi: 1,
      isEnabled: true
  }

  const TEMPLATE_URL = 'https://i.imgur.com/sertifikat-template.png'

  async function downloadImage(url) {
      const response = await axios.get(url, { responseType: 'arraybuffer' })
      return Buffer.from(response.data)
  }

  const AWARDS = [
      'Mejor pareja del año', 'Most Lovable Person', 'Outstanding Achievement',
      'Mejor esposa/marido de todos', 'Most Handsome/Beautiful', 'Kindest Heart Award',
      'Premio a la mejor sonrisa', 'Most Loyal Friend', 'Cutest Couple Award'
  ]

  async function generateFakeSertifikat(nama, penghargaan) {
      const templateBuffer = await downloadImage(TEMPLATE_URL)
      const template = await loadImage(templateBuffer)

      const canvas = createCanvas(template.width, template.height)
      const ctx = canvas.getContext('2d')

      ctx.drawImage(template, 0, 0)

      ctx.font = 'bold 22px "Times New Roman"'
      ctx.fillStyle = '#000000'
      ctx.textAlign = 'center'

      ctx.fillText(nama.toUpperCase(), canvas.width / 2, 280)

      ctx.font = 'bold 18px "Times New Roman"'
      ctx.fillText(penghargaan.toUpperCase(), canvas.width / 2, 360)

      const now = new Date()
      ctx.font = '14px "Times New Roman"'
      ctx.fillText(now.toLocaleDateString('id-ID'), canvas.width / 2, 460)

      const certNo = 'CERT-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      ctx.fillText(`No: ${certNo}`, canvas.width / 2, 510)

      return canvas.toBuffer('image/png')
  }

  async function handler(m, { sock }) {
      const text = m.args.join(' ') || m.text?.trim() || ''

      if (!text) {
          return m.reply(
              `💕 *CERTIFICADO FALSO* 💕\n\n` +
              `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
              `┃ ✦ *Cómo usar*\n` +
              `┃\n` +
              `┃   ${m.prefix}fakesertifikat <nombre> | <premio>\n` +
              `┃\n` +
              `┃ ✦ *Ejemplo*\n` +
              `┃\n` +
              `┃   ${m.prefix}fakesertifikat Ai Miku | Premio a la mejor pareja\n` +
              `┃\n` +
              `┃ 💗 *Ai Miku:* ¿Qué premio quieres, darling~?\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━⬣`
          )
      }

      const parts = text.split('|').map(p => p.trim())
      const nama = parts[0] || 'Darling'
      let penghargaan = parts[1] || AWARDS[Math.floor(Math.random() * AWARDS.length)]

      m.react('💕')
      await m.reply(`⏳ *PROCESANDO...*\n\n💗 *Ai Miku:* Creando el certificado, darling~`)

      try {
          const imageBuffer = await generateFakeSertifikat(nama, penghargaan)

          await sock.sendMessage(m.chat, {
              image: imageBuffer,
              caption: `💕 *CERTIFICADO FALSO* 💕\n\n` +
                      `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
                      `┃ ✅ *ÉXITO*\n` +
                      `┃ 👤 *NOMBRE*: ${nama}\n` +
                      `┃ 🏆 *HOMENAJE*: ${penghargaan}\n` +
                      `┃\n` +
                      `┃ 💗 *Ai Miku:* ¡Felicidades, darling! 🗿\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━━⬣`
          }, { quoted: m })

          m.react('✅')

      } catch (err) {
          console.error('[FakeSertifikat] Error:', err)
          m.react('💔')
          return m.reply(`💔 *ERROR*\n\n> ${err.message}`)
      }
  }

export { pluginConfig as config, handler }
