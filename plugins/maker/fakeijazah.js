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

  const pluginConfig = {
      name: 'fakeijazah',
      alias: ['ijazahfake', 'fakediploma'],
      category: "maker",
      description: 'Bikin fake ijazah (buat konten/gaguan doang)',
      usage: '.fakeijazah <nama> | <gelar> | <universitas>',
      example: '.fakeijazah Ai Miku | S.Kom | Universitas Zero',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 8,
      energi: 1,
      isEnabled: true
  }

  const CANVAS_WIDTH = 1100
  const CANVAS_HEIGHT = 760

  function escapeXml(value) {
      return String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;')
  }

  async function generateFakeIjazah(nama, gelar, universitas) {
      const tahun = new Date().getFullYear()
      const ijazahNo = 'IZH-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}">
      <rect width="1100" height="760" fill="#f8f4e8"/>
      <rect x="28" y="28" width="1044" height="704" rx="10" fill="none" stroke="#333" stroke-width="4"/>
      <rect x="42" y="42" width="1016" height="676" rx="8" fill="none" stroke="#777" stroke-width="2"/>
      <text x="550" y="105" text-anchor="middle" font-family="Times New Roman, serif" font-size="34" font-weight="700">IJAZAH</text>
      <text x="550" y="145" text-anchor="middle" font-family="Times New Roman, serif" font-size="17">EJEMPLO / SOLO POR DIVERSIÓN</text>
      <line x1="220" y1="170" x2="880" y2="170" stroke="#333" stroke-width="2"/>
      <text x="550" y="235" text-anchor="middle" font-family="Times New Roman, serif" font-size="15">Otorgado a</text>
      <text x="550" y="290" text-anchor="middle" font-family="Times New Roman, serif" font-size="30" font-weight="700">${escapeXml(nama).toUpperCase()}</text>
      <text x="550" y="340" text-anchor="middle" font-family="Times New Roman, serif" font-size="20">${escapeXml(gelar).toUpperCase()}</text>
      <text x="550" y="390" text-anchor="middle" font-family="Times New Roman, serif" font-size="18">${escapeXml(universitas).toUpperCase()}</text>
      <line x1="220" y1="425" x2="880" y2="425" stroke="#888" stroke-width="1"/>
      <text x="550" y="485" text-anchor="middle" font-family="Times New Roman, serif" font-size="16">No. Ijazah: ${ijazahNo}</text>
      <text x="550" y="525" text-anchor="middle" font-family="Times New Roman, serif" font-size="16">Año de graduación: ${tahun}</text>
      <text x="550" y="630" text-anchor="middle" font-family="Times New Roman, serif" font-size="14" fill="#666">DOCUMENTO DE EJEMPLO — SIN VALIDEZ OFICIAL</text>
    </svg>`

      const template = await loadImage(Buffer.from(svg))
      const canvas = createCanvas(template.width, template.height)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(template, 0, 0)
      return canvas.toBuffer('image/png')
  }

  async function handler(m, { sock }) {
      const text = m.args.join(' ') || m.text?.trim() || ''

      if (!text) {
          return m.reply(
              `💕 *DIPLOMA FALSO* 💕\n\n` +
              `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
              `┃ ✦ *Cómo usar*\n` +
              `┃\n` +
              `┃   ${m.prefix}fakeijazah <nombre> | <título> | <universidad>\n` +
              `┃\n` +
              `┃ ✦ *Ejemplo*\n` +
              `┃\n` +
              `┃   ${m.prefix}fakeijazah Ai Miku | S.Kom | Universitas Zero\n` +
              `┃\n` +
              `┃ 💗 *Ai Miku:* ¿De qué universidad quieres ser, darling~?\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━⬣`
          )
      }

      const parts = text.split('|').map(p => p.trim())
      const nama = parts[0] || 'Darling'
      const gelar = parts[1] || 'S.Kom'
      const universitas = parts[2] || 'Universitas Zero'

      m.react('💕')
      await m.reply(`⏳ *PROCESANDO...*\n\n💗 *Ai Miku:* Creando un diploma falso, darling~`)

      try {
          const imageBuffer = await generateFakeIjazah(nama, gelar, universitas)

          await sock.sendMessage(m.chat, {
              image: imageBuffer,
              caption: `💕 *DIPLOMA FALSO* 💕\n\n` +
                      `╭━━━━━━━━━━━━━━━━━━━━━⬣\n` +
                      `┃ ✅ *ÉXITO*\n` +
                      `┃ 👨‍🎓 *NOMBRE*: ${nama}\n` +
                      `┃ 🎓 *TÍTULO*: ${gelar}\n` +
                      `┃ 🏛️ *UNIVERSIDAD*: ${universitas}\n` +
                      `┃\n` +
                      `┃ 💗 *Ai Miku:* ¡Felicidades, darling! 🗿\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━━⬣`
          }, { quoted: m })

          m.react('✅')

      } catch (err) {
          console.error('[FakeIjazah] Error:', err)
          m.react('💔')
          return m.reply(`💔 *ERROR*\n\n> ${err.message}`)
      }
  }

export { pluginConfig as config, handler }
