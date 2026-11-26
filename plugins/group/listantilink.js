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
    name: 'listantilink',
    alias: ['antilinklist', 'cekantilink'],
    category: 'group',
    description: 'Melihat daftar link yang diblokir',
    usage: '.listantilink',
    example: '.listantilink',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const DEFAULT_BLOCKED_LINKS = [
    'chat.whatsapp.com',
    'wa.me',
    'bit.ly',
    't.me',
    'telegram.me',
    'discord.gg',
    'discord.com/invite'
]

function handler(m) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const customList = groupData.antilinkList || []

    let txt = `🔗 *ᴅᴀꜰᴛᴀʀ ᴀɴᴛɪʟɪɴᴋ*\n\n`

    txt += `╭┈┈⬡「 📌 *ᴅᴇꜰᴀᴜʟᴛ* 」\n`
    DEFAULT_BLOCKED_LINKS.forEach((l, i) => {
        txt += `┃ ${i + 1}. \`${l}\`\n`
    })
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`

    if (customList.length > 0) {
        txt += `╭┈┈⬡「 ➕ *ᴄᴜsᴛᴏᴍ* 」\n`
        customList.forEach((l, i) => {
            txt += `┃ ${i + 1}. \`${l}\`\n`
        })
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    }

    txt += `> Default: *${DEFAULT_BLOCKED_LINKS.length}* link\n`
    txt += `> Custom: *${customList.length}* link\n\n`
    txt += `\`${m.prefix}addantilink <link>\` untuk tambah\n`
    txt += `\`${m.prefix}delantilink <link>\` untuk hapus`

    m.reply(txt)
}

export { pluginConfig as config, handler, DEFAULT_BLOCKED_LINKS }
