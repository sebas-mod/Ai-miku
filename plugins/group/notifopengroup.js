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
        return m.reply(`❌ Hanya admin grup yang bisa menggunakan fitur ini`)
    }

    const args = m.args[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}

    if (!['on', 'off'].includes(args)) {
        const status = group.notifOpenGroup === true ? '✅ Aktif' : '❌ Nonaktif'
        return m.reply(`🔓 *ɴᴏᴛɪꜰ ᴏᴘᴇɴ ɢʀᴏᴜᴘ*\n\n> Status: ${status}\n\n*Penggunaan:*\n\`${m.prefix}notifopengroup on\` - Aktifkan\n\`${m.prefix}notifopengroup off\` - Nonaktifkan`)
    }

    if (args === 'on') {
        group.notifOpenGroup = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *ɴᴏᴛɪꜰ ᴏᴘᴇɴ ɢʀᴏᴜᴘ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ*`)
    }

    if (args === 'off') {
        group.notifOpenGroup = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *ɴᴏᴛɪꜰ ᴏᴘᴇɴ ɢʀᴏᴜᴘ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ*`)
    }
}

export { pluginConfig as config, handler }
