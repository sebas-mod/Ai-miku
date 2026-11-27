/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from '../../config.js'
import { getDatabase } from '../../src/lib/data/database.js'
import { isLid, lidToJid } from '../../src/lib/core/lid.js'

const pluginConfig = {
    name: 'unban',
    alias: ['delban', 'unblock'],
    category: 'owner',
    description: 'Quita a un usuario de la lista de baneados',
    usage: '.unban <número/@tag>',
    example: '.unban 6281234567890',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function resolveTarget(m) {
    let raw = ''

    if (m.quoted) {
        raw = m.quoted.sender || ''
    } else if (m.mentionedJid?.length) {
        raw = m.mentionedJid[0] || ''
    } else if (m.args[0]) {
        raw = m.args[0]
    }

    if (!raw) return ''

    if (isLid(raw)) raw = lidToJid(raw)
    let num = raw.replace(/[^0-9]/g, '')
    if (num.startsWith('08')) num = '62' + num.slice(1)
    if (num.startsWith('0')) num = '62' + num.slice(1)

    return num
}

async function handler(m, { sock }) {
    const targetNumber = resolveTarget(m)

    if (!targetNumber || targetNumber.length < 10 || targetNumber.length > 15) {
        return m.reply(
            `✅ *DESBANEAR USUARIO*\n\n` +
            `> Escribe el número o menciona al usuario\n\n` +
            `\`Ejemplo: ${m.prefix}unban 6281234567890\``
        )
    }

    const db = getDatabase()
    const bannedList = db.setting('bannedUsers') || []

    const index = bannedList.findIndex(b => {
        const c = String(b).replace(/[^0-9]/g, '')
        return c === targetNumber || c.endsWith(targetNumber) || targetNumber.endsWith(c)
    })

    if (index === -1) {
        return m.reply(`❌ *ERROR*\n\n> El número \`${targetNumber}\` no está en la lista de baneados`)
    }

    bannedList.splice(index, 1)
    db.setting('bannedUsers', bannedList)
    config.bannedUsers = bannedList

    await m.react('✅')

    await m.reply(
        `✅ *USUARIO DESBANEADO*\n\n` +
        `╭┈┈⬡「 📋 *DETALLE* 」\n` +
        `┃ 📱 NÚMERO: \`${targetNumber}\`\n` +
        `┃ ✅ ESTADO: \`Unbanned\`\n` +
        `┃ 📊 TOTAL: \`${bannedList.length}\` USUARIO\n` +
        `╰┈┈⬡`
    )
}

export { pluginConfig as config, handler }
