/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'notifopengroup',
    alias: ['notifopen'],
    category: 'group',
    description: 'Toggle notifikasi saat grup dibuka',
    usage: '.notifopengroup on/off',
    example: '.notifopengroup on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock, db }) {
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌ Solo los administradores del grupo pueden usar esta función`)
    }

    const args = m.args[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}

    if (!['on', 'off'].includes(args)) {
        const status = group.notifOpenGroup === true ? '✅ Activo' : '❌ Inactivo'
        return m.reply(`🔓 *ɴᴏᴛɪꜰ ᴏᴘᴇɴ ɢʀᴏᴜᴘ*\n\n> Status: ${status}\n\n*Uso:*\n\`${m.prefix}notifopengroup on\` - Activar\n\`${m.prefix}notifopengroup off\` - Desactivar`)
    }

    if (args === 'on') {
        group.notifOpenGroup = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *NOTIF APERTURA DE GRUPO ACTIVADO*`)
    }

    if (args === 'off') {
        group.notifOpenGroup = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *NOTIF APERTURA DE GRUPO DESACTIVADO*`)
    }
}

export { pluginConfig as config, handler }
