/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'banchat',
    alias: ['bangroup', 'bangrup', 'unbanchat', 'unbangroup'],
    category: 'group',
    description: 'Ban grup dari penggunaan bot (hanya owner yang bisa akses)',
    usage: '.banchat',
    example: '.banchat',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const cmd = m.command.toLowerCase()
    const isUnban = ['unbanchat', 'unbangroup'].includes(cmd)

    try {
        const groupMeta = m.groupMetadata
        const groupName = groupMeta.subject || 'Unknown'
        const groupData = db.getGroup(m.chat) || {}

        if (isUnban) {
            if (!groupData.isBanned) {
                return m.reply(
                    `⚠️ *EL GRUPO NO ESTÁ BANEADO*\n\n` +
                    `> Este grupo no está bloqueado.\n` +
                    `> Todos los usuarios pueden usar el bot.`
                )
            }

            db.setGroup(m.chat, { ...groupData, isBanned: false })

            return sock.sendMessage(m.chat, {
                text: `✅ *GRUPO DESBANEADO*\n\n` +
                    `╭┈┈⬡「 📋 *DETALLE* 」\n` +
                    `┃ 📛 ɢʀᴜᴘ: *${groupName}*\n` +
                    `┃ 📊 sᴛᴀᴛᴜs: *✅ ACTIVO*\n` +
                    `┃ 👤 ᴜɴʙᴀɴ ᴏʟᴇʜ: @${m.sender.split('@')[0]}\n` +
                    `╰┈┈⬡\n\n` +
                    `> Todos los miembros ya pueden volver a usar el bot.`,
                mentions: [m.sender]
            }, { quoted: m })
        }

        if (groupData.isBanned) {
            return m.reply(
                `⚠️ *GRUPO YA BANEADO*\n\n` +
                `> Este grupo ya está bloqueado.\n` +
                `> Usa \`.unbanchat\` para abrir el acceso.`
            )
        }

        db.setGroup(m.chat, { ...groupData, isBanned: true })

        await m.reply(`🚫 *GRUPO BANEADO*\n\n` +
                `╭┈┈⬡「 📋 *DETALLE* 」\n` +
                `┃ 📛 ɢʀᴜᴘ: *${groupName}*\n` +
                `┃ 📊 sᴛᴀᴛᴜs: *🔴 BANNED*\n` +
                `┃ 👤 ʙᴀɴ ᴏʟᴇʜ: @${m.sender.split('@')[0]}\n` +
                `╰┈┈⬡\n\n` +
                `> Los miembros normales no pueden usar el bot en este grupo.\n` +
                `> Solo el propietario puede usar el bot.`, {  mentions: [m.sender] })

    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
