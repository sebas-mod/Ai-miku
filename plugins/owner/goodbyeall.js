/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'goodbyeall',
    alias: ['gball', 'globalgoodbye', 'leaveall'],
    category: 'owner',
    description: 'Aktifkan/nonaktifkan goodbye di semua grup',
    usage: '.goodbyeall <on/off>',
    example: '.goodbyeall on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const action = args[0]?.toLowerCase()

    if (!action || !['on', 'off'].includes(action)) {
        return m.reply(
            `👋 *DESPEDIDA GLOBAL*\n\n` +
            `> Activa/desactiva la despedida en TODOS los grupos a la vez\n\n` +
            `╭┈┈⬡「 📋 *CÓMO USAR* 」\n` +
            `┃ ${m.prefix}goodbyeall on\n` +
            `┃ ${m.prefix}goodbyeall off\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }

    await m.react('🕕')

    try {
        const groups = await sock.groupFetchAllParticipating()
        const groupIds = Object.keys(groups)
        const status = action === 'on'
        let count = 0

        for (const groupId of groupIds) {
            db.setGroup(groupId, { leave: status })
            count++
        }

        await m.react('✅')

        if (status) {
            return m.reply(
                `✅ *DESPEDIDA GLOBAL ON*\n\n` +
                `╭┈┈⬡「 📊 *RESULTADO* 」\n` +
                `┃ 🌐 Total Grup: *${count}*\n` +
                `┃ ✅ Goodbye: *AKTIF*\n` +
                `╰┈┈┈┈┈┈┈┈⬡\n\n` +
                `> ¡Los miembros que salgan recibirán un mensaje de despedida!`
            )
        } else {
            return m.reply(
                `❌ *DESPEDIDA GLOBAL OFF*\n\n` +
                `╭┈┈⬡「 📊 *RESULTADO* 」\n` +
                `┃ 🌐 Total Grup: *${count}*\n` +
                `┃ ❌ Goodbye: *NONAKTIF*\n` +
                `╰┈┈┈┈┈┈┈┈⬡\n\n` +
                `> La despedida se desactivó en todos los grupos.`
            )
        }
    } catch (error) {
        console.error('[GoodbyeAll] Error:', error.message)
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
