/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: ['hapussaluran', 'deletesaluran', 'deletenewsletter'],
    alias: [],
    category: 'owner',
    description: 'Hapus saluran/newsletter',
    usage: '.hapussaluran <id_saluran>',
    example: '.hapussaluran 120363xxx@newsletter',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text?.trim() || ''
    let targetJid = text

    if (!targetJid) {
        return m.reply(
            '🗑️ *ʜᴀᴘᴜs sᴀʟᴜʀᴀɴ*\n\n' +
            '> `.hapussaluran <id_saluran>` — Hapus saluran\n\n' +
            '📝 Contoh:\n' +
            '> `.hapussaluran 120363xxx@newsletter`\n\n' +
            '⚠️ Saluran akan dihapus secara permanen'
        )
    }

    if (!targetJid.endsWith('@newsletter')) {
        targetJid += '@newsletter'
    }

    try {
        await sock.newsletterDelete(targetJid)
        await m.react('✅')
        return m.reply(`🗑️ *Saluran dihapus*\n\n> ID: ${targetJid}`)
    } catch (err) {
        return m.reply(`❌ Gagal menghapus saluran: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
