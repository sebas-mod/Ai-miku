/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
const pluginConfig = {
    name: 'resetrules',
    alias: ['resetbotrules'],
    category: 'owner',
    description: 'Reset rules bot ke default',
    usage: '.resetrules',
    example: '.resetrules',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()

    db.setting('botRules', null)

    m.reply(
        `✅ *REGLAS DEL BOT RESTABLECIDAS*\n\n` +
        `> ¡Las reglas del bot se restablecieron por defecto!\n` +
        `> Escribe \`${m.prefix}rules\` para verlas.`
    )
}

export { pluginConfig as config, handler }
