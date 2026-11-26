/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'notifclosegroup',
    alias: ['notifclose'],
    category: 'group',
    description: 'Toggle notifikasi saat grup ditutup',
    usage: '.notifclosegroup on/off',
    example: '.notifclosegroup on',
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
        const status = group.notifCloseGroup === true ? '✅ Activo' : '❌ Inactivo'
        return m.reply(`🔒 *ɴᴏᴛɪꜰ ᴄʟᴏsᴇ ɢʀᴏᴜᴘ*\n\n> Status: ${status}\n\n*Uso:*\n\`${m.prefix}notifclosegroup on\` - Activar\n\`${m.prefix}notifclosegroup off\` - Desactivar`)
    }

    if (args === 'on') {
        group.notifCloseGroup = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *NOTIF CIERRE DE GRUPO ACTIVADO*`)
    }

    if (args === 'off') {
        group.notifCloseGroup = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *NOTIF CIERRE DE GRUPO DESACTIVADO*`)
    }
}

export { pluginConfig as config, handler }
