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
    name: 'resetrulesgrup',
    alias: ['resetgrouprules'],
    category: 'group',
    description: 'Reset rules grup ke default (admin only)',
    usage: '.resetrulesgrup',
    example: '.resetrulesgrup',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()

    db.setGroup(m.chat, { groupRules: null })

    m.reply(
        `✅ *REGLAS DEL GRUPO RESTABLECIDAS*\n` +
        `¡Las reglas del grupo se han restablecido!\n` +
        `Escribe \`${m.prefix}rulesgrup\` para verlas.`
    )
}

export { pluginConfig as config, handler }
