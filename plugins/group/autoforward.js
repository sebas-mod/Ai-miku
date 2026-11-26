/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
const pluginConfig = {
    name: 'autoforward',
    alias: ['autofw', 'autofwd'],
    category: 'group',
    description: 'Auto forward pesan yang masuk ke grup ke grup ini',
    usage: '.autoforward <on/off>',
    example: '.autoforward on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const option = m.text?.toLowerCase()?.trim()
    const groupId = m.chat
    const group = db.getGroup(groupId) || {}

    if (!option) {
        const status = group.autoforward ? '✅ ON' : '❌ OFF'
        return m.reply(
            `🔄 *ᴀᴜᴛᴏ ꜰᴏʀᴡᴀʀᴅ*\n\n` +
            `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
            `┃ ◦ Status: *${status}*\n` +
            `╰┈┈⬡\n\n` +
            `> Usa: \`${m.prefix}autoforward on/off\`\n\n` +
            `_Esta función reenviará todos los mensajes a este grupo_`
        )
    }

    if (option === 'on') {
        db.setGroup(groupId, { ...group, autoforward: true })
        m.react('✅')
        return m.reply(
            `🔄 *ᴀᴜᴛᴏ ꜰᴏʀᴡᴀʀᴅ*\n\n` +
            `╭┈┈⬡「 ✅ *ACTIVO* 」\n` +
            `┃ ◦ Status: *ON*\n` +
            `╰┈┈⬡\n\n` +
            `> _Semua pesan akan di-forward_`
        )
    }

    if (option === 'off') {
        db.setGroup(groupId, { ...group, autoforward: false })
        m.react('❌')
        return m.reply(
            `🔄 *ᴀᴜᴛᴏ ꜰᴏʀᴡᴀʀᴅ*\n\n` +
            `╭┈┈⬡「 ❌ *INACTIVO* 」\n` +
            `┃ ◦ Status: *OFF*\n` +
            `╰┈┈⬡`
        )
    }

    return m.reply(`❌ Usa: on u off`)
}

export { pluginConfig as config, handler }
