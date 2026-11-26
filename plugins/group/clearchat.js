/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: ['clearchat', 'cc', 'cleangc', 'deletechat', 'delchat'],
    alias: [],
    category: 'group',
    description: 'Membersihkan chat grup',
    usage: '.clearchat',
    example: '.clearchat',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    m.react('🗑️')

    try {
        const now = Math.floor(Date.now() / 1000)

        await sock.chatModify({
            delete: true,
            lastMessages: [{
                key: m.key,
                messageTimestamp: m.messageTimestamp || now
            }]
        }, m.chat)

        await m.reply(`✅ *ᴄʜᴀᴛ ʟɪᴍᴘɪᴀᴅᴏ*\n\n> El chat del grupo ha sido limpiado por @${m.sender.split('@')[0]}`, { mentions: [m.sender] })

    } catch (error) {
        try {
            await sock.chatModify({
                clear: {
                    messages: [{
                        id: m.key.id,
                        fromMe: m.key.fromMe,
                        timestamp: Math.floor(Date.now() / 1000)
                    }]
                }
            }, m.chat)

            await m.reply(`✅ *ᴄʜᴀᴛ ʟɪᴍᴘɪᴀᴅᴏ*\n\nEl chat del grupo en el WhatsApp del bot ha sido limpiado por @${m.sender.split('@')[0]}\nMíralo tú mismo en tu WhatsApp del bot`, { mentions: [m.sender] })
        } catch (e) {
            m.react('☢')
            m.reply(te(m.prefix, m.command, m.pushName))
        }
    }
}

export { pluginConfig as config, handler }
