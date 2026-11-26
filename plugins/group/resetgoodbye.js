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
    name: 'resetgoodbye',
    alias: ['delgoodbye', 'cleargoodbye'],
    category: 'group',
    description: 'Reset goodbye message ke default',
    usage: '.resetgoodbye',
    example: '.resetgoodbye',
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

    if (!groupData?.goodbyeMsg) {
        return m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> El mensaje de despedida ya es el predeterminado`)
    }

    db.setGroup(m.chat, { goodbyeMsg: null })

    m.react('✅')

    await m.reply(`✅ *DESPEDIDA RESTABLECIDA*\nKembali ke pesan default`)
}

export { pluginConfig as config, handler }
