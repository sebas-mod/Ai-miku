/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "calc",
    alias: [],
    category: "tools",
    description: "calc <ekspresi>",
    usage: ".calc <ekspresi>",
    example: ".calc <ekspresi>",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { text }) {
    if (!text) {
      return m.reply(
        `🧮 *KALKULATOR PINTAR ${global.namebot}*\n\n` +
        `Contoh penggunaan:\n` +
        `• *.calc 50 * 20*\n` +
        `• *.calc 1000 / 4 + 150*\n` +
        `• *.kalkulator (25 + 75) * 5*`
      )
    }

    const clean = text.replace(/[^0-9+\-*/().\s]/g, '')
    if (!clean.trim()) return m.reply('❌ Format perhitungan matematika tidak valid!')

    try {
      const result = Function(`'use strict'; return (${clean})`)()
      await m.reply(
        `╭─── ୨୧ KALKULATOR ୨୧ ───╮\n` +
        `│ ૮₍˶ᵔ ᵕ ᵔ˶₎ა hasil hitung!\n` +
        `╰─────────────────────────╯\n\n` +
        `୨ৎ Soal  : *${clean.trim()}*\n` +
        `୨ৎ Hasil : *${result.toLocaleString('id-ID')}*`
      )
    } catch {
      await m.reply('❌ Gagal menghitung ekspresi matematika tersebut!')
    }
  }

export { pluginConfig as config, handler }
