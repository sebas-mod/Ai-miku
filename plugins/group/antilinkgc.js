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
    name: 'antilinkgc',
    alias: ['algc', 'antilinkgrup'],
    category: 'group',
    description: 'Anti enlaces de WhatsApp (grupos, canales, wa.me)',
    usage: '.antilinkgc <on/off/metode> [kick/remove]',
    example: '.antilinkgc on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const option = m.text?.toLowerCase()?.trim()

    if (!option) {
        const groupData = db.getGroup(m.chat) || {}
        const status = groupData.antilinkgc || 'off'
        const mode = groupData.antilinkgcMode || 'remove'

        return m.reply(
            `🔗 *ANTILINK WA*\n\n` +
            `╭┈┈⬡「 📋 *ESTADO* 」\n` +
            `┃ ◦ Estado: *${status.toUpperCase()}*\n` +
            `┃ ◦ Modo: *${mode.toUpperCase()}*\n` +
            `╰┈┈⬡\n\n` +
            `*DETECCIÓN:*\n` +
            `> • chat.whatsapp.com (grupos)\n` +
            `> • wa.me (contacto)\n` +
            `> • whatsapp.com/channel (saluran)\n\n` +
            `*CÓMO USAR:*\n` +
            `> \`${m.prefix}antilinkgc on\` - Activar\n` +
            `> \`${m.prefix}antilinkgc off\` - Desactivar\n` +
            `> \`${m.prefix}antilinkgc metode kick\` - Modo expulsar usuario\n` +
            `> \`${m.prefix}antilinkgc metode remove\` - Modo borrar mensaje`
        )
    }

    if (option === 'on') {
        db.setGroup(m.chat, { antilinkgc: 'on' })
        return m.reply(`✅ ¡*ANTILINK WA* activado!\n\n> Los enlaces de WA se eliminarán automáticamente.`)
    }

    if (option === 'off') {
        db.setGroup(m.chat, { antilinkgc: 'off' })
        return m.reply(`❌ ¡*ANTILINK WA* desactivado!`)
    }

    if (option.startsWith('metode')) {
        const method = m.args?.[1]?.toLowerCase()
        if (method === 'kick') {
            db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'kick' })
            return m.reply(`✅ ¡*ANTILINK WA* modo EXPULSAR activado!\n\n> Quien envíe un enlace de WA será expulsado.`)
        } else if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'remove' })
            return m.reply(`✅ ¡*ANTILINK WA* modo BORRAR activado!\n\n> Los mensajes con enlaces de WA se eliminarán.`)
        } else {
            return m.reply(`❌ ¡Método no válido! Usa: \`kick\` o \`remove\`\n\n> Ejemplo: \`${m.prefix}antilinkgc metode kick\``)
        }
    }

    if (option === 'kick') {
        db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'kick' })
        return m.reply(`✅ ¡*ANTILINK WA* modo EXPULSAR activado!\n\n> Quien envíe un enlace de WA será expulsado.`)
    }

    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'remove' })
        return m.reply(`✅ ¡*ANTILINK WA* modo BORRAR activado!\n\n> Los mensajes con enlaces de WA se eliminarán.`)
    }

    return m.reply(`❌ ¡Opción no válida! Usa: \`on\`, \`off\`, \`metode kick\`, \`metode remove\``)
}

export { pluginConfig as config, handler }
