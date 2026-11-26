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
    name: ['autodl', 'autodownload'],
    alias: [],
    category: 'group',
    description: 'Toggle auto download link sosmed',
    usage: '.autodl on/off',
    example: '.autodl on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args[0]?.toLowerCase()

    const groupData = db.getGroup(m.chat)
    const current = groupData?.autodl || false

    if (!args || args === 'status') {
        return m.reply(
            `🔗 *ᴀᴜᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
            `> Status: ${current ? '✅ Aktif' : '❌ Nonaktif'}\n\n` +
            `*Platform Support:*\n` +
            `> TikTok, Instagram, Facebook\n` +
            `> YouTube, Twitter/X\n` +
            `> Telegram, Discord\n\n` +
            `*Penggunaan:*\n` +
            `> \`${m.prefix}autodl on\` - Aktifkan\n` +
            `> \`${m.prefix}autodl off\` - Nonaktifkan`
        )
    }

    if (args === 'on') {
        db.setGroup(m.chat, { ...groupData, autodl: true })
        m.react('✅')
        return m.reply(
            `✅ *ᴀᴜᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴀᴋᴛɪꜰ*\n\n` +
            `> Kirim link sosmed dan bot akan auto download!\n` +
            `> Support: TikTok, IG, FB, YouTube, Twitter/X`
        )
    }

    if (args === 'off') {
        db.setGroup(m.chat, { ...groupData, autodl: false })
        m.react('❌')
        return m.reply(`❌ *ᴀᴜᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ɴᴏɴᴀᴋᴛɪꜰ*`)
    }

    return m.reply(`❌ *ᴀʀɢᴜᴍᴇɴ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n> Gunakan: \`on\` atau \`off\``)
}

export { pluginConfig as config, handler }
