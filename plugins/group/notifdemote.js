/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'notifdemote',
    alias: [],
    category: 'group',
    description: 'Toggle notifikasi saat ada yang dicopot dari admin',
    usage: '.notifdemote on/off',
    example: '.notifdemote on',
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
        const status = group.notifDemote === true ? '✅ Activo' : '❌ Inactivo'
        return m.reply(`👤 *ɴᴏᴛɪꜰ ᴅᴇᴍᴏᴛᴇ*\n\n> Status: ${status}\n\n*Uso:*\n\`${m.prefix}notifdemote on\` - Activar\n\`${m.prefix}notifdemote off\` - Desactivar`)
    }

    if (args === 'on') {
        group.notifDemote = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *NOTIF DEGRADACIÓN ACTIVADO*`)
    }

    if (args === 'off') {
        group.notifDemote = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *NOTIF DEGRADACIÓN DESACTIVADO*`)
    }
}

export { pluginConfig as config, handler }
