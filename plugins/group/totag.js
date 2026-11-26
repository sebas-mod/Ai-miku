/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from '../../config.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'totag',
    alias: ['tagall2', 'mentionall'],
    category: 'group',
    description: 'Tag semua member dengan reply pesan',
    usage: '.totag (reply pesan)',
    example: '.totag',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply(
            `📢 *TOTAG*\n\n` +
            `> Responde al mensaje que quieres reenviar a todos los miembros\n\n` +
            `> Ejemplo: Responde a un mensaje y escribe \`${m.prefix}totag\``
        )
    }

    m.react('📢')

    try {
        const participants = m.groupMembers || []

        if (!participants || participants.length === 0) {
            return m.reply(`❌ No se pudieron obtener los datos de los miembros del grupo`)
        }

        const users = participants
            .map(u => u.id || u.jid || u)
            .filter(v => v && v !== sock.user?.jid && v !== sock.user?.id)

        await sock.sendMessage(m.chat, {
            forward: m.quoted.fakeObj || m.quoted,
            mentions: users
        })

        m.react('✅')

    } catch (err) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
