/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { MikuRuntime } from '../../src/lib/system/bridge.js'

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
        `🧮 *CALCULADORA INTELIGENTE ${global.namebot}*\n\n` +
        `Ejemplos de uso:\n` +
        `• *.calc 50 * 20*\n` +
        `• *.calc 1000 / 4 + 150*\n` +
        `• *.kalkulator (25 + 75) * 5*`
      )
    }

    const clean = text.replace(/[^0-9+\-*/().\s]/g, '')
    if (!clean.trim()) return m.reply('❌ ¡Formato de operación matemática no válido!')

    try {
      const result = Function(`'use strict'; return (${clean})`)()
      await m.reply(
        `╭─── ୨୧ CALCULADORA ୨୧ ───╮\n` +
        `│ ૮₍˶ᵔ ᵕ ᵔ˶₎ა ¡resultado listo!\n` +
        `╰─────────────────────────╯\n\n` +
        `୨ৎ Operación : *${clean.trim()}*\n` +
        `୨ৎ Resultado : *${result.toLocaleString('es-ES')}*`
      )
    } catch {
      await m.reply('❌ ¡No se pudo calcular esa expresión matemática!')
    }
  }

export { pluginConfig as config, handler }
