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
    name: 'delenergi',
    alias: ['kurangenergi', 'removeenergi', 'hapusenergi', 'delenergy'],
    category: 'owner',
    description: 'Reduce la energía de un usuario',
    usage: '.delenergi <cantidad> @user',
    example: '.delenergi 50 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatNumber(num) {
    if (num === -1) return '∞ Unlimited'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function extractTarget(m) {
    if (m.quoted) return m.quoted.sender
    if (m.mentionedJid?.length) return m.mentionedJid[0]
    return null
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args

    const numArg = args.find(a => !isNaN(a) && !a.startsWith('@'))
    const amount = parseInt(numArg) || 0

    let targetJid = await extractTarget(m)

    if (!targetJid && amount > 0) {
        targetJid = m.sender
    }

    if (!targetJid || amount <= 0) {
        return m.reply(
            `⚡ *QUITAR ENERGÍA*\n\n` +
            `> \`.delenergi <cantidad>\` - de ti mismo\n` +
            `> \`.delenergi <cantidad> @user\` - del usuario\n\n` +
            `\`Ejemplo: ${m.prefix}delenergi 50\``
        )
    }

    if (amount <= 0) {
        return m.reply(`❌ *ERROR*\n\n> La cantidad debe ser mayor que 0`)
    }

    const user = db.getUser(targetJid)

    if (!user) {
        return m.reply(`❌ *ERROR*\n\n> Usuario no encontrado en la base de datos`)
    }

    if (user.energi === -1) {
        db.setUser(targetJid, { energi: 25 })
    }

    const newEnergi = db.updateEnergi(targetJid, -amount)

    await m.react('✅')

    await m.reply(
        `✅ *ENERGÍA REDUCIDA*\n\n` +
        `╭┈┈⬡「 📋 *DETALLE* 」\n` +
        `┃ 👤 USUARIO: @${targetJid.split('@')[0]}\n` +
        `┃ ➖ RESTADO: *-${formatNumber(amount)}*\n` +
        `┃ ⚡ RESTANTE: *${formatNumber(newEnergi)}*\n` +
        `╰┈┈⬡`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }
