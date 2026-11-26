/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from '../../config.js'
import { getDatabase } from '../../src/lib/data/database.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'addpremall',
    alias: ['addpremiumall', 'setpremall'],
    category: 'owner',
    description: 'Menambahkan semua member grup ke premium',
    usage: '.addprem all',
    example: '.addprem all',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []

        if (participants.length === 0) {
            return m.reply(`❌ *ERROR*\n\n> No hay miembros en este grupo`)
        }

        await m.react('🕕')

        const db = getDatabase()
        if (!db.data.premium) db.data.premium = []

        let addedCount = 0
        let alreadyPremCount = 0

        for (const participant of participants) {
            const number = participant.jid?.replace(/[^0-9]/g, '') || ''

            if (!number) continue

            if (db.data.premium.includes(number)) {
                alreadyPremCount++
                continue
            }
            db.data.premium.push(number)

            const jid = number + '@s.whatsapp.net'
            const premLimit = config.limits?.premium || 100
            const user = db.getUser(jid) || db.setUser(jid)

            user.energi = premLimit
            user.isPremium = true

            db.setUser(jid, user)
            db.updateExp(jid, 200000)
            addedCount++
        }

        db.save()

        await m.react('💎')
        await m.reply(
            `💎 *AÑADIR PREMIUM A TODOS*\n\n` +
            `╭┈┈⬡「 📋 *RESULTADO* 」\n` +
            `┃ 👥 TOTAL DE MIEMBROS: \`${participants.length}\`\n` +
            `┃ ✅ AÑADIDOS: \`${addedCount}\`\n` +
            `┃ ⏭️ YA PREMIUM: \`${alreadyPremCount}\`\n` +
            `┃ 💎 TOTAL PREMIUM: \`${db.data.premium.length}\`\n` +
            `╰┈┈⬡\n\n` +
            `> Grupo: ${groupMeta.subject}`
        )

    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
