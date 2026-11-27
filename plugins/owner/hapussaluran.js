/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
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
            '🗑️ *ELIMINAR CANAL*\n\n' +
            '> `.hapussaluran <id_saluran>` — Elimina el canal\n\n' +
            '📝 Ejemplo:\n' +
            '> `.hapussaluran 120363xxx@newsletter`\n\n' +
            '⚠️ El canal se eliminará permanentemente'
        )
    }

    if (!targetJid.endsWith('@newsletter')) {
        targetJid += '@newsletter'
    }

    try {
        await sock.newsletterDelete(targetJid)
        await m.react('✅')
        return m.reply(`🗑️ *Canal eliminado*\n\n> ID: ${targetJid}`)
    } catch (err) {
        return m.reply(`❌ Error al eliminar el canal: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
