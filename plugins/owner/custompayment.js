/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'

const pluginConfig = {
  name: 'custompayment',
  alias: ['setpayment', 'setpaytext'],
  category: 'owner',
  description: 'Configura un texto personalizado para .payment con marcadores',
  usage: '.custompayment <texto> / .custompayment reset',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true
}

async function handler(m) {
  const db = getDatabase()
  const input = m.text?.trim()
  const current = db.setting('customPaymentText') || ''

  if (!input) {
    return m.reply(
      `📝 *CUSTOM PAYMENT TEXT*\n\n` +
      `Texto actual:\n${current || '_(sin configurar, se usa el valor por defecto)_'}\n\n` +
      `*PLACEHOLDERS DISPONIBLES:*\n` +
      `• \`{botname}\` — Nombre del bot\n` +
      `• \`{owner}\` — Nombre del owner\n` +
      `• \`{methods}\` — Lista de billeteras electrónicas\n` +
      `• \`{banks}\` — Lista de bancos\n` +
      `• \`{qris}\` — Status QRIS\n\n` +
      `*EJEMPLO:*\n` +
      `> \`${m.prefix}custompayment ¡Hola! Paga a {methods}\`\n\n` +
      `> \`${m.prefix}custompayment reset\` — Kembalikan ke default`
    )
  }

  if (input.toLowerCase() === 'reset') {
    db.setting('customPaymentText', '')
    return m.reply('✅ El texto de pago personalizado se restablece a los valores predeterminados.')
  }

  db.setting('customPaymentText', input)
  return m.reply(`✅ ¡Se guarda el texto de pago personalizado!\n\nPreview:\n${input}`)
}

export { pluginConfig as config, handler }
