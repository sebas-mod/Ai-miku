/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from '../../config.js'
import { getDatabase } from '../../src/lib/data/database.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'addenergiall',
    alias: ['addenergianall', 'bonusenergiall'],
    category: 'owner',
    description: 'Menambahkan limit/energi ke semua member grup',
    usage: '.addenergiall <jumlah>',
    example: '.addenergiall 50',
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
        const amount = parseInt(m.args[0])

        if (isNaN(amount) || amount <= 0) {
            return m.reply(`⚠️ *CÓMO USAR*\n\n> Escribe la cantidad de límites que quieres añadir.\n\n\`Ejemplo: ${m.prefix}addlimitall 50\``)
        }

        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []

        if (participants.length === 0) {
            return m.reply(`❌ *ERROR*\n\n> No hay miembros en este grupo`)
        }

        await m.react('🕕')
        const db = getDatabase()
        let successCount = 0

        for (const participant of participants) {
            const number = participant.jid?.replace(/[^0-9]/g, '') || ''
            if (!number) continue
            const jid = number + '@s.whatsapp.net'
            db.updateEnergi(jid, amount)
            successCount++
        }

        const gb = m?.groupMetadata

        await db.save()
        await m.react('⚡')
        await m.reply(
           `✅ Se añadieron límites a todos los miembros (total *${successCount}* miembros) en el grupo *${gb?.subject}*`,
            )

    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
