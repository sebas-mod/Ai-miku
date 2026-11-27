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
      name: 'fakekarcis',
      alias: ['karcisfake', 'tiketbioskop', 'faketiketfilm'],
      category: "maker",
      description: 'Crea una entrada de cine falsa (solo para contenido/bromas)',
      usage: '.fakekarcis <nombre> | <película> | <hora>',
      example: '.fakekarcis Ai Miku | DITF The Movie | 21:00',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 5,
      energi: 1,
      isEnabled: true
  }

  const TEMPLATE_URL = 'https://i.imgur.com/karcis-template.png'

  async function downloadImage(url) {
      const response = await axios.get(url, { responseType: 'arraybuffer' })
      return Buffer.from(response.data)
  }

  async function generateFakeKarcis(nama, film, jam) {
      const templateBuffer = await downloadImage(TEMPLATE_URL)
      const template = await loadImage(templateBuffer)

      const canvas = createCanvas(template.width, template.height)
      const ctx = canvas.getContext('2d')

      ctx.drawImage(template, 0, 0)

      ctx.font = 'bold 14px "Arial"'
      ctx.fillStyle = '#000000'
      ctx.textAlign = 'center'

      ctx.fillText(nama.toUpperCase(), canvas.width / 2, 150)
      ctx.fillText(film.toUpperCase(), canvas.width / 2, 200)
      ctx.fillText(jam, canvas.width / 2, 250)

      const now = new Date()
      ctx.font = '12px "Arial"'
      ctx.fillText(now.toLocaleDateString('id-ID'), canvas.width / 2, 300)

      const seat = String.fromCharCode(65 + Math.floor(Math.random() * 10)) + Math.floor(Math.random() * 20 + 1)
      ctx.fillText(`Seat: ${seat}`, canvas.width / 2, 350)

      return canvas.toBuffer('image/png')
  }

  async function handler(m, { sock }) {
      const text = m.args.join(' ') || m.text?.trim() || ''
      if (!text) return m.reply(`*Cómo usar:*\n${m.prefix}fakekarcis <nombre> | <película> | <hora>\nEjemplo: .fakekarcis Ai Miku | DITF | 21:00`)

      const parts = text.split('|').map(p => p.trim())
      const nama = parts[0] || 'Darling'
      const film = parts[1] || 'DARLING in the FRANXX'
      const jam = parts[2] || '21:00'

      m.react('💕')
      await m.reply(`⏳ *Procesando...*`)

      try {
          const imageBuffer = await generateFakeKarcis(nama, film, jam)
          await sock.sendMessage(m.chat, { image: imageBuffer, caption: `💕 *ENTRADA DE CINE FALSA* 💕\n\n✅ Nombre: ${nama}\n🎬 Film: ${film}\n⏰ Hora: ${jam}\n\n💗 *Ai Miku:* Disfruta la película, darling~` }, { quoted: m })
          m.react('✅')
      } catch (err) {
          m.react('💔')
          m.reply(`Error: ${err.message}`)
      }
  }

export { pluginConfig as config, handler }
