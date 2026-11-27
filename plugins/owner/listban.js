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
const pluginConfig = {
    name: 'listban',
    alias: ['listbanned', 'banlist'],
    category: 'owner',
    description: 'Melihat daftar banned user',
    usage: '.listban',
    example: '.listban',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const bannedUsers = config.bannedUsers && config.bannedUsers.length > 0 ? config.bannedUsers : (db.setting('bannedUsers') || [])

    if (bannedUsers.length === 0) {
        return m.reply(`🚫 *LISTA DE BANEADOS*\n\n> No hay usuarios baneados\n\n\`Usa: ${m.prefix}ban <número>\``)
    }

    let caption = `🚫 *LISTA DE BANEADOS*\n\n`
    caption += `╭┈┈⬡「 ⛔ *USUARIOS* 」\n`

    for (let i = 0; i < bannedUsers.length; i++) {
        caption += `┃ ${i + 1}. \`${bannedUsers[i]}\`\n`
    }

    caption += `╰┈┈⬡\n\n`
    caption += `> TOTAL: \`${bannedUsers.length}\` BANEADO USUARIO`

    await m.reply(caption)
}

export { pluginConfig as config, handler }
