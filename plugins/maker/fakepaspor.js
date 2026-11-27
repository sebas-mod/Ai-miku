/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const config = MikuRuntime.config;

  const pluginConfig = {
      name: 'fakepaspor',
      alias: ['pasporfake', 'fakepassport'],
      category: "maker",
      description: 'Bikin fake paspor (buat konten/gaguan doang)',
      usage: '.fakepaspor <nama> | <umur> | <negara>',
      example: '.fakepaspor Ai Miku | 20 | Jepang',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 8,
      energi: 1,
      isEnabled: true
  }

  const TEMPLATE_URL = 'https://i.imgur.com/JZqRkYp.png'

  async function downloadImage(url) {
      const response = await axios.get(url, { responseType: 'arraybuffer' })
      return Buffer.from(response.data)
  }

  function formatTanggal() {
      const now = new Date()
      return `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`
  }

  function formatExpired() {
      const now = new Date()
      now.setFullYear(now.getFullYear() + 5)
      return `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`
  }

  async function generateFakePaspor(nama, umur, negara) {
      const templateBuffer = await downloadImage(TEMPLATE_URL)
      const template = await loadImage(templateBuffer)

      const canvas = createCanvas(template.width, template.height)
      const ctx = canvas.getContext('2d')

      ctx.drawImage(template, 0, 0)

      ctx.font = 'bold 20px "Arial"'
      ctx.fillStyle = '#000000'
      ctx.textAlign = 'left'

      ctx.fillText(nama.toUpperCase(), 180, 210)

      ctx.fillText(negara.toUpperCase(), 180, 250)

      ctx.fillText(umur.toString(), 180, 290)

      ctx.font = '16px "Arial"'
      ctx.fillText(formatTanggal(), 180, 340)
      ctx.fillText(formatExpired(), 180, 380)

      const passportNo = 'X' + Math.random().toString(36).substring(2, 10).toUpperCase()
      ctx.font = 'bold 18px "Arial"'
      ctx.fillText(passportNo, 500, 450)

      return canvas.toBuffer('image/png')
  }

  async function handler(m, { sock }) {
      const text = m.args.join(' ') || m.text?.trim() || ''

      if (!text) {
          return m.reply(
              `💕 *PASAPORTE FALSO* 💕\n\n` +
              `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
              `┃ ✦ *Cómo usar*\n` +
              `┃\n` +
              `┃   ${m.prefix}fakepaspor <nombre> | <edad> | <país>\n` +
              `┃\n` +
              `┃ ✦ *Ejemplo*\n` +
              `┃\n` +
              `┃   ${m.prefix}fakepaspor Ai Miku | 20 | Jepang\n` +
              `┃   ${m.prefix}fakepaspor Darling | 18 | Indonesia\n` +
              `┃\n` +
              `┃ ⚠️ *¡Advertencia!*\n` +
              `┃   Esta función es solo para contenido/bromas\n` +
              `┃   ¡NO lo uses para nada ilegal!\n` +
              `┃\n` +
              `┃ 💗 *Ai Miku:* ¿A nombre de quién hago el pasaporte falso, darling~?\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━⬣`
          )
      }

      const parts = text.split('|').map(p => p.trim())
      const nama = parts[0] || 'Darling'
      const umur = parts[1] || '20'
      const negara = parts[2] || 'Indonesia'

      if (nama.length > 30) {
          return m.reply(`💔 *ERROR*\n\n> El nombre es demasiado largo, darling~ máximo 30 caracteres 🥺`)
      }

      m.react('💕')
      await m.reply(`⏳ *PROCESANDO...*\n\n💗 *Ai Miku:* Creando el pasaporte falso, darling~ espera un momento 🎨`)

      try {
          const imageBuffer = await generateFakePaspor(nama, umur, negara)

          await sock.sendMessage(m.chat, {
              image: imageBuffer,
              caption: `💕 *PASAPORTE FALSO* 💕\n\n` +
                      `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
                      `┃ ✅ *ÉXITO*\n` +
                      `┃\n` +
                      `┃ 👤 *NOMBRE*: ${nama}\n` +
                      `┃ 🎂 *EDAD*: ${umur} años\n` +
                      `┃ 🏳️ *PAÍS*: ${negara}\n` +
                      `┃\n` +
                      `┃ ⚠️ *¡Solo para contenido!*\n` +
                      `┃ 💗 *Ai Miku:* Aquí está tu pasaporte, darling~ ¡no lo uses de verdad! 🗿\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━━⬣`
          }, { quoted: m })

          m.react('✅')

      } catch (err) {
          console.error('[FakePaspor] Error:', err)
          m.react('💔')
          return m.reply(
              `💔 *ERROR*\n\n` +
              `> ${err.message}\n\n` +
              `> Vuelve a intentarlo, darling~ 🥺`
          )
      }
  }

export { pluginConfig as config, handler }
