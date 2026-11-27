/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'setlimitdefault',
    alias: ['setdefaultlimit', 'limitdefault'],
    category: 'owner',
    description: 'Set default limit untuk user baru',
    usage: '.setlimitdefault <jumlah>',
    example: '.setlimitdefault 50',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const newLimit = parseInt(args[0])

    if (!args[0] || isNaN(newLimit)) {
        const db = getDatabase()
        const currentDefault = db.setting('defaultLimit') || config.limits?.default || 25

        return m.reply(
            `📊 *LÍMITE POR DEFECTO*\n\n` +
            `> Límite por defecto actual: \`${currentDefault}\`\n\n` +
            `*Cómo usar:*\n` +
            `> \`${m.prefix}setlimitdefault <cantidad>\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`${m.prefix}setlimitdefault 50\``
        )
    }

    if (newLimit < 1 || newLimit > 1000) {
        return m.reply(`❌ *ERROR*\n\n> El límite debe estar entre 1 y 1000`)
    }

    const db = getDatabase()
    db.setting('defaultLimit', newLimit)

    await m.reply(
        `✅ *LISTO*\n\n` +
        `> Límite predeterminado cambiado a: \`${newLimit}\`\n` +
        `> Los usuarios nuevos recibirán este límite`
    )
}

export { pluginConfig as config, handler }
