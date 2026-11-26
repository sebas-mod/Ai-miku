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
      name: 'fakekarcis',
      alias: ['karcisfake', 'tiketbioskop', 'faketiketfilm'],
      category: "maker",
      description: 'Bikin fake karcis bioskop (buat konten/gaguan doang)',
      usage: '.fakekarcis <nama> | <film> | <jam>',
      example: '.fakekarcis Elysia Assistant | DITF The Movie | 21:00',
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
      if (!text) return m.reply(`*Cara pakai:*\n${m.prefix}fakekarcis <nama> | <film> | <jam>\nContoh: .fakekarcis Elysia Assistant | DITF | 21:00`)

      const parts = text.split('|').map(p => p.trim())
      const nama = parts[0] || 'Darling'
      const film = parts[1] || 'DARLING in the FRANXX'
      const jam = parts[2] || '21:00'

      m.react('💕')
      await m.reply(`⏳ *Processing...*`)

      try {
          const imageBuffer = await generateFakeKarcis(nama, film, jam)
          await sock.sendMessage(m.chat, { image: imageBuffer, caption: `💕 *FAKE KARCIS BIOSKOP* 💕\n\n✅ Nama: ${nama}\n🎬 Film: ${film}\n⏰ Jam: ${jam}\n\n💗 *Elysia Assistant:* Selamat menonton darling~` }, { quoted: m })
          m.react('✅')
      } catch (err) {
          m.react('💔')
          m.reply(`Error: ${err.message}`)
      }
  }

export { pluginConfig as config, handler }
