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
    name: 'unmute',
    alias: ['unbisukan'],
    category: 'group',
    description: 'Membuka mute grup',
    usage: '.unmute',
    example: '.unmute',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const group = db.getGroup(m.chat) || {}
    const groupName = m.groupMetadata.subject

    if (!group.mute) return m.reply('❌ El grupo no está silenciado.')

    db.setGroup(m.chat, { ...group, mute: false })
    m.reply(`✅ El grupo *${groupName}* ha sido reactivado por @${m.sender.split('@')[0]}\n\nTodos los miembros ya pueden enviar mensajes.`, { mentions: [m.sender] })
}

export { pluginConfig as config, handler }
