/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
/**
 * Putus - End relationship
 */

import { getDatabase } from '../../src/lib/data/database.js'
const pluginConfig = {
    name: 'putus',
    alias: ['breakup', 'cerai'],
    category: 'fun',
    description: 'Termina la relación con tu pareja',
    usage: '.putus',
    example: '.putus',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    let senderData = db.getUser(m.sender) || {}
    if (!senderData.fun) senderData.fun = {}
    if (!senderData.fun.pasangan) {
        await m.react('❌')
        return m.reply(
            `❌ *¡No tienes pareja!*\n\n` +
            `Búscala primero con \`${m.prefix}tembak @tag\``
        )
    }
    const exPartner = senderData.fun.pasangan
    let exData = db.getUser(exPartner) || {}
    delete senderData.fun.pasangan
    if (exData.fun?.pasangan === m.sender) {
        delete exData.fun.pasangan
        db.setUser(exPartner, exData)
    }
    db.setUser(m.sender, senderData)
    await m.react('💔')
    await m.reply(
        `💔 *PUTUS!*\n\n` +
        `@${m.sender.split('@')[0]} y @${exPartner.split('@')[0]} ¡oficialmente terminaron!\n\n` +
        `¡Ojalá encuentres algo mejor! 🙏`,
        { mentions: [m.sender, exPartner] }
    )
}

export { pluginConfig as config, handler }
