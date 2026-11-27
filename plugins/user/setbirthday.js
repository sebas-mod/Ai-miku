/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'setbirthday',
    alias: ['setbday', 'setultah', 'settgl'],
    category: 'user',
    description: 'Establece la fecha de cumpleaños',
    usage: '.setbirthday <DD-MM>',
    example: '.setbirthday 25-12',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const input = m.args?.[0]?.trim()
    const userJid = m.sender
    const cleanJid = userJid.replace(/@.+/g, '')

    if (!input) {
        const user = db.getUser(userJid)
        const currentBday = user?.birthday

        let text = `🎂 *sᴇᴛ ʙɪʀᴛʜᴅᴀʏ*\n\n`

        if (currentBday) {
            text += `> Tu cumpleaños: *${currentBday}*\n\n`
        }

        text += `╭┈┈⬡「 📋 *ғᴏʀᴍᴀᴛ* 」\n`
        text += `┃ ${m.prefix}setbirthday DD-MM\n`
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        text += `*Ejemplo:*\n`
        text += `> ${m.prefix}setbirthday 25-12\n`
        text += `> ${m.prefix}setbirthday 01-01`

        return m.reply(text)
    }

    const dateRegex = /^(\d{1,2})[-\/](\d{1,2})$/
    const match = input.match(dateRegex)

    if (!match) {
        return m.reply(`❌ ¡Formato incorrecto! Uso: DD-MM\n\n> Ejemplo: ${m.prefix}setbirthday 25-12`)
    }

    const day = parseInt(match[1])
    const month = parseInt(match[2])

    if (month < 1 || month > 12) {
        return m.reply(`❌ ¡Mes no válido! (1-12)`)
    }

    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (day < 1 || day > daysInMonth[month - 1]) {
        return m.reply(`❌ Fecha no válida para el mes ${month}!`)
    }

    const formattedDate = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}`

    db.setUser(m.sender, {
        birthday: formattedDate
    })

    await db.save()

    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

    await m.reply(
        `✅ *ʙɪʀᴛʜᴅᴀʏ ᴅɪsɪᴍᴘᴀɴ!*\n\n` +
        `╭┈┈⬡「 🎂 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 📅 Tanggal: *${day} ${months[month - 1]}*\n` +
        `┃ 👤 User: @${cleanJid}\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> Bot te felicitará\n` +
        `> cumpleaños en tu día especial! 🎉`,
        { mentions: [userJid] }
    )
}

export { pluginConfig as config, handler }
