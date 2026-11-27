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
    name: 'resetwelcome',
    alias: ['delwelcome', 'clearwelcome'],
    category: 'group',
    description: 'Restablece el mensaje de bienvenida al valor predeterminado',
    usage: '.resetwelcome',
    example: '.resetwelcome',
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
    const groupData = db.getGroup(m.chat)

    if (!groupData?.welcomeMsg) {
        return m.reply(`❌ *FALLIDO*\n\n> El mensaje de bienvenida ya es el predeterminado`)
    }

    db.setGroup(m.chat, { welcomeMsg: null })

    m.react('✅')

    await m.reply(`✅ *BIENVENIDA RESTABLECIDA*\n\n> Vuelve al mensaje predeterminado`)
}

export { pluginConfig as config, handler }
