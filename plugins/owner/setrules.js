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
    name: 'setrules',
    alias: ['setbotrules', 'setaturanbot'],
    category: 'owner',
    description: 'Set rules/aturan bot custom',
    usage: '.setrules <text>',
    example: '.setrules 1. Jangan spam\n2. Hormati sesama',
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
    const text = m.text?.trim() || (m.quoted?.body || m.quoted?.text || '')

    if (!text) {
        return m.reply(
            `📝 *sᴇᴛ ʙᴏᴛ ʀᴜʟᴇs*\n\n` +
            `> Masukkan teks rules yang baru\n\n` +
            `\`Contoh:\`\n` +
            `\`${m.prefix}setrules 1. Jangan spam\\n2. Hormati sesama\``
        )
    }

    db.setting('botRules', text)

    m.reply(
        `✅ *ʙᴏᴛ ʀᴜʟᴇs ᴅɪᴜᴘᴅᴀᴛᴇ*\n\n` +
        `> Rules bot berhasil diubah!\n` +
        `> Ketik \`${m.prefix}rules\` untuk melihat.`
    )
}

export { pluginConfig as config, handler }
