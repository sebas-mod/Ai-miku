/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import { DEFAULT_INTRO } from './intro.js'
const pluginConfig = {
    name: 'resetintro',
    alias: ['introdel', 'delintro', 'deleteintro'],
    category: 'group',
    description: 'Reset intro grup ke default (admin only)',
    usage: '.resetintro',
    example: '.resetintro',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

async function handler(m) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)

    if (!groupData.intro) {
        return m.reply(`❌ ¡Este grupo ya usa la presentación predeterminada!`)
    }

    delete groupData.intro
    db.setGroup(m.chat, groupData)
    db.save()

    await m.reply(
        `✅ *¡PRESENTACIÓN RESTABLECIDA!*\n` +
        `La presentación del grupo se ha restablecido.\n\n` +
        `Escribe *${m.prefix}intro* para ver el resultado.`
    )
}

export { pluginConfig as config, handler }
