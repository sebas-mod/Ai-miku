/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getMentionJid as getParticipantJid } from '../../src/lib/core/lid.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'listadmin',
    alias: ['admins', 'adminlist'],
    category: 'group',
    description: 'Menampilkan daftar admin grup',
    usage: '.listadmin',
    example: '.listadmin',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: false,
    isBotAdmin: false
}

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        const admins = participants.filter(p => p.admin)

        if (admins.length === 0) {
            await m.reply(`❌ *FALLIDO*\n\n> No hay administradores en este grupo.`)
            return
        }

        const owner = admins.find(a => a.admin === 'superadmin')
        const regularAdmins = admins.filter(a => a.admin === 'admin')

        let adminList = `👑 *LISTA DE ADMINS*\n\n`

        if (owner) {
            adminList += `\`\`\`━━━ PROPIETARIO ━━━\`\`\`\n`
            adminList += `\`\`\`👑 @${getParticipantJid(owner).split('@')[0]}\`\`\`\n\n`
        }

        if (regularAdmins.length > 0) {
            adminList += `\`\`\`━━━ ADMIN ━━━\`\`\`\n`
            regularAdmins.forEach((admin, i) => {
                adminList += `\`\`\`${i + 1}. @${getParticipantJid(admin).split('@')[0]}\`\`\`\n`
            })
        }
        adminList += `\n\`Total de administradores: ${admins.length}\``

        const mentions = admins.map(a => getParticipantJid(a))

        await m.reply(adminList, { mentions })

    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
