/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import * as timeHelper from '../../src/lib/core/time.js'
const pluginConfig = {
    name: 'checksewa',
    alias: ['ceksewa', 'sisasewa'],
    category: 'group',
    description: 'Consulta cuánto queda de alquiler del bot en este grupo',
    usage: '.checksewa',
    example: '.checksewa',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function formatCountdown(expiredAt) {
    const diff = expiredAt - Date.now()
    if (diff <= 0) return { text: 'EXPIRED', expired: true }
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    let text = ''
    if (days > 0) text += `${days} días `
    if (hours > 0) text += `${hours} horas `
    if (minutes > 0 && days === 0) text += `${minutes} minutos`
    return { text: text.trim(), expired: false }
}

function handler(m) {
    const db = getDatabase()
    if (!db.db.data.sewa) {
        db.db.data.sewa = { enabled: false, groups: {} }
        db.db.write()
    }

    if (!db.db.data.sewa.enabled) {
        return m.reply(`ℹ️ El sistema de alquiler no está activo\n\nEste bot se puede usar en cualquier grupo.`)
    }

    const sewaData = db.db.data.sewa.groups[m.chat]

    if (!sewaData) {
        return m.reply(`❌ Este grupo no está registrado en el sistema de alquiler\n\nContacta al dueño del bot para más información.`)
    }

    const groupName = sewaData.name || m.chat.split('@')[0]
    const addedDate = sewaData.addedAt ? timeHelper.fromTimestamp(sewaData.addedAt, 'D MMMM YYYY') : '-'

    if (sewaData.isLifetime) {
        m.react('♾️')
        return m.reply(
            `♾️ *ESTADO DEL ALQUILER*\n\n` +
            `Grupo: *${groupName}*\n` +
            `Estado: *Permanent* ♾️\n` +
            `Terdaftar sejak: *${addedDate}*\n\n` +
            `El bot quedará activo para siempre en este grupo.`
        )
    }

    const countdown = formatCountdown(sewaData.expiredAt)
    const expiredStr = timeHelper.fromTimestamp(sewaData.expiredAt, 'D MMMM YYYY HH:mm')

    if (countdown.expired) {
        return m.reply(
            `❌ *ALQUILER CADUCADO*\n\n` +
            `Grupo: *${groupName}*\n` +
            `Berakhir: *${expiredStr}*\n\n` +
            `Contacta al dueño del bot para renovar el alquiler.`
        )
    }

    const diff = sewaData.expiredAt - Date.now()
    const isAlmostExpired = diff <= 259200000

    m.react(isAlmostExpired ? '⚠️' : '⏱️')
    let text = `⏱️ *ESTADO DEL ALQUILER*\n\n`
    text += `Grupo: *${groupName}*\n`
    text += `Tiempo restante: *${countdown.text}*\n`
    text += `Berakhir: *${expiredStr}*\n`
    text += `Terdaftar sejak: *${addedDate}*`

    if (isAlmostExpired) {
        text += `\n\n⚠️ ¡El alquiler está a punto de terminar! Contacta al dueño del bot para renovarlo.`
    }

    return m.reply(text)
}

export { pluginConfig as config, handler }
