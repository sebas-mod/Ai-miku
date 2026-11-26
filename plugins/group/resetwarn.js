/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
const pluginConfig = {
    name: 'resetwarn',
    alias: ['clearwarn', 'hapuswarn', 'delwarn'],
    category: 'group',
    description: 'Reset warning member',
    usage: '.resetwarn @user',
    example: '.resetwarn @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()

    let targetUser = null
    if (m.quoted) {
        targetUser = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0]
    }

    if (!targetUser) {
        await m.reply(
            `⚠️ *CÓMO USAR*\n\n` +
            `> Responde al mensaje del usuario + \`${m.prefix}resetwarn\`\n` +
            `> O: \`${m.prefix}resetwarn @user\``
        )
        return
    }

    let groupData = db.getGroup(m.chat) || {}
    let warnings = groupData.warnings || {}
    const maxWarns = groupData.maxWarnings || 3

    const targetName = targetUser.split('@')[0]

    if (!warnings[targetUser] || warnings[targetUser].length === 0) {
        await m.reply(`✅ @${targetName} no tiene advertencias.`, { mentions: [targetUser] })
        return
    }

    const prevCount = warnings[targetUser].length
    delete warnings[targetUser]
    db.setGroup(m.chat, { ...groupData, warnings: warnings })

    await m.reply(
        `✅ *ADVERTENCIAS REINICIADAS*\n` +
        `¡Las advertencias de @${targetName} se han reiniciado!\n` +
        `Sebelumnya: *${prevCount}/${maxWarns}*\n` +
        `Ahora: *0/${maxWarns}*`,
        { mentions: [targetUser] }
    )
}

export { pluginConfig as config, handler }
