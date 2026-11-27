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
      name: 'fakeijin',
      alias: ['ijinfake', 'suratijin', 'fakeizin'],
      category: "maker",
      description: 'Crea un permiso falso (solo para contenido/bromas)',
      usage: '.fakeijin <nombre> | <alasan>',
      example: '.fakeijin Ai Miku | Enfermo',
      isOwner: false,
      isPremium: false,
      isGroup: false,
      isPrivate: false,
      cooldown: 5,
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

  async function generateFakeIjin(nama, alasan) {
      const now = new Date()
      const tanggal = now.toLocaleDateString('id-ID')
      const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}">
      <rect width="1100" height="760" fill="#ffffff"/>
      <rect x="35" y="35" width="1030" height="690" rx="8" fill="none" stroke="#222" stroke-width="4"/>
      <text x="550" y="120" text-anchor="middle" font-family="Times New Roman, serif" font-size="32" font-weight="700">SURAT IJIN</text>
      <text x="550" y="160" text-anchor="middle" font-family="Times New Roman, serif" font-size="17">EJEMPLO / SOLO POR DIVERSIÓN</text>
      <line x1="180" y1="190" x2="920" y2="190" stroke="#222" stroke-width="2"/>
      <text x="550" y="255" text-anchor="middle" font-family="Times New Roman, serif" font-size="18">Por la presente se certifica que</text>
      <text x="550" y="315" text-anchor="middle" font-family="Times New Roman, serif" font-size="30" font-weight="700">${escapeXml(nama).toUpperCase()}</text>
      <text x="550" y="380" text-anchor="middle" font-family="Times New Roman, serif" font-size="19">se le concede permiso por el siguiente motivo:</text>
      <text x="550" y="430" text-anchor="middle" font-family="Times New Roman, serif" font-size="24" font-weight="700">${escapeXml(alasan).toUpperCase()}</text>
      <text x="550" y="500" text-anchor="middle" font-family="Times New Roman, serif" font-size="16">Tanggal: ${escapeXml(tanggal)}</text>
      <text x="790" y="580" text-anchor="middle" font-family="Times New Roman, serif" font-size="15">Director</text>
      <text x="790" y="625" text-anchor="middle" font-family="Times New Roman, serif" font-size="16">Dr. Ai Miku, M.Pd</text>
      <text x="550" y="690" text-anchor="middle" font-family="Times New Roman, serif" font-size="14" fill="#666">DOCUMENTO DE EJEMPLO — SIN VALIDEZ OFICIAL</text>
    </svg>`

      const template = await loadImage(Buffer.from(svg))
      const canvas = createCanvas(template.width, template.height)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(template, 0, 0)
      return canvas.toBuffer('image/png')
  }

  async function handler(m, { sock }) {
      const text = m.args.join(' ') || m.text?.trim() || ''
      if (!text) return m.reply(`*Cómo usar:*\n${m.prefix}fakeijin <nombre> | <motivo>\nEjemplo: .fakeijin Ai Miku | Enfermo`)

      const parts = text.split('|').map(p => p.trim())
      const nama = parts[0] || 'Darling'
      const alasan = parts[1] || 'Enfermedad'

      m.react('💕')
      await m.reply(`⏳ *Processing...*`)

      try {
          const imageBuffer = await generateFakeIjin(nama, alasan)
          await sock.sendMessage(m.chat, { image: imageBuffer, caption: `💕 *PERMISO FALSO* 💕\n\n✅ Nombre: ${nama}\n📌 Motivo: ${alasan}\n\n💗 *Ai Miku:* Tu permiso está listo, darling~` }, { quoted: m })
          m.react('✅')
      } catch (err) {
          m.react('💔')
          m.reply(`Error: ${err.message}`)
      }
  }

export { pluginConfig as config, handler }
