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
    name: 'birthday',
    alias: ['bday', 'ultah', 'ulangtahun'],
    category: 'user',
    description: 'Lihat ulang tahun member',
    usage: '.birthday [@user]',
    example: '.birthday @user',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
    const cleanJid = target.replace(/@.+/g, '')
    const db = getDatabase()
    const user = db.getUser(target)

    if (!user?.birthday) {
        if (target === m.sender) {
            return m.reply(
                `❌ Kamu belum set birthday!\n\n` +
                `> Gunakan: ${m.prefix}setbirthday DD-MM\n` +
                `> Contoh: ${m.prefix}setbirthday 25-12`
            )
        }
        return m.reply(`❌ User belum set birthday!`)
    }

    const [day, month] = user.birthday.split('-').map(Number)
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

    const now = new Date()
    const currentYear = now.getFullYear()
    let nextBday = new Date(currentYear, month - 1, day)

    if (nextBday < now) {
        nextBday = new Date(currentYear + 1, month - 1, day)
    }

    const diffTime = nextBday.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const isToday = now.getDate() === day && now.getMonth() === month - 1

    let text = `🎂 *ʙɪʀᴛʜᴅᴀʏ ɪɴғᴏ*\n\n`
    text += `╭┈┈⬡「 👤 *ᴜsᴇʀ* 」\n`
    text += `┃ 🏷️ @${cleanJid}\n`
    text += `┃ 📅 ${day} ${months[month - 1]}\n`

    if (isToday) {
        text += `┃ 🎉 *HARI INI ULTAH!*\n`
    } else {
        text += `┃ 🕕 ${diffDays} hari lagi\n`
    }

    text += `╰┈┈┈┈┈┈┈┈⬡`

    if (isToday) {
        text += `\n\n🎊 *HAPPY BIRTHDAY!* 🎊\n`
        text += `> Semoga panjang umur dan\n`
        text += `> sukses selalu! 🎉🎂`
    }

    await m.reply(text, { mentions: [target] })
}

export { pluginConfig as config, handler }
