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
      name: 'fakeidcard',
      alias: ['idcardfake', 'faketanda', 'faketanda pengenal'],
      category: "maker",
      description: 'Crea un carnet de identidad falso (solo para contenido/bromas)',
      usage: '.fakeidcard <nombre> | <jabatan>',
      example: '.fakeidcard Ai Miku | CEO',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 5,
      energi: 1,
      isEnabled: true
  }

  const TEMPLATE_URL = 'https://i.imgur.com/idcard-template.png'

  async function downloadImage(url) {
      const response = await axios.get(url, { responseType: 'arraybuffer' })
      return Buffer.from(response.data)
  }

  async function generateFakeIDCard(nama, jabatan) {
      const templateBuffer = await downloadImage(TEMPLATE_URL)
      const template = await loadImage(templateBuffer)

      const canvas = createCanvas(template.width, template.height)
      const ctx = canvas.getContext('2d')

      ctx.drawImage(template, 0, 0)

      ctx.font = 'bold 14px "Arial"'
      ctx.fillStyle = '#000000'
      ctx.textAlign = 'center'

      ctx.fillText(nama.toUpperCase(), canvas.width / 2, 180)
      ctx.fillText(jabatan.toUpperCase(), canvas.width / 2, 220)

      const idNo = 'ID-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      ctx.font = '10px "Arial"'
      ctx.fillText(idNo, canvas.width / 2, 270)

      return canvas.toBuffer('image/png')
  }

  async function handler(m, { sock }) {
      const text = m.args.join(' ') || m.text?.trim() || ''
      if (!text) return m.reply(`*Cómo usar:*\n${m.prefix}fakeidcard <nombre> | <cargo>\nEjemplo: .fakeidcard Ai Miku | CEO`)

      const parts = text.split('|').map(p => p.trim())
      const nama = parts[0] || 'Darling'
      const jabatan = parts[1] || 'CEO'

      m.react('💕')
      await m.reply(`⏳ *Procesando...*`)

      try {
          const imageBuffer = await generateFakeIDCard(nama, jabatan)
          await sock.sendMessage(m.chat, { image: imageBuffer, caption: `💕 *TARJETA DE ID FALSA* 💕\n\n✅ Nombre: ${nama}\n📌 Cargo: ${jabatan}\n\n💗 *Ai Miku:* Aquí tienes tu tarjeta, darling~` }, { quoted: m })
          m.react('✅')
      } catch (err) {
          m.react('💔')
          m.reply(`Error: ${err.message}`)
      }
  }

export { pluginConfig as config, handler }
