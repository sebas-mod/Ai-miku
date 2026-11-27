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
    name: 'addantilink',
    alias: ['addalink', 'addblocklink'],
    category: 'group',
    description: 'Menambah link ke daftar antilink',
    usage: '.addantilink <domain/pattern>',
    example: '.addantilink tiktok.com',
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
    const link = m.text?.toLowerCase()

    if (!link) {
        return m.reply(
            `🔗 *AÑADIR ANTILINK*\n\n` +
            `> Envía el dominio o patrón de enlace que quieres bloquear\n\n` +
            `\`Ejemplo:\`\n` +
            `\`${m.prefix}addantilink tiktok.com\`\n` +
            `\`${m.prefix}addantilink chat.whatsapp.com\`\n` +
            `\`${m.prefix}addantilink instagram.com\``
        )
    }

    const groupData = db.getGroup(m.chat) || {}
    const antilinkList = groupData.antilinkList || []

    if (antilinkList.includes(link)) {
        return m.reply(`⚠️ Link \`${link}\` ¡ya está en la lista de antienlaces!`)
    }

    antilinkList.push(link)
    db.setGroup(m.chat, { antilinkList })

    m.reply(
        `✅ *ANTILINK AÑADIDO*\n\n` +
        `> Link: \`${link}\`\n` +
        `> Total: *${antilinkList.length}* link\n\n` +
        `> Usa \`${m.prefix}listantilink\` para ver la lista`
    )
}

export { pluginConfig as config, handler }
