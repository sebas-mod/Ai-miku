/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: ['mutechat', 'mute'],
    alias: [],
    category: 'owner',
    description: 'Mute/unmute chat',
    usage: '.mutechat <nomor/reply> atau .mutechat buka <nomor>',
    example: '.mutechat 628xxx',
    isOwner: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const action = m.args[0]?.toLowerCase()
    let targetJid = null
    let mute = true

    if (action === 'buka' || action === 'unmute') {
        mute = false
        const num = (m.args[1] || '').replace(/[^0-9]/g, '')
        if (num) targetJid = num + '@s.whatsapp.net'
        else if (m.quoted) targetJid = m.quoted.sender || m.quoted.participant
        else if (!m.isGroup) targetJid = m.chat
    } else {
        if (m.mentionedJid?.length > 0) {
            targetJid = m.mentionedJid[0]
        } else if (m.quoted) {
            targetJid = m.quoted.sender || m.quoted.participant
        } else if (m.args[0]) {
            const num = m.args[0].replace(/[^0-9]/g, '')
            if (num) targetJid = num + '@s.whatsapp.net'
        } else if (!m.isGroup) {
            targetJid = m.chat
        }
    }

    if (!targetJid) {
        return m.reply(
            '🔇 *SILENCIAR CHAT*\n\n' +
            '> `.mutechat 628xxx` — Mute chat\n' +
            '> `.mutechat` (en chat privado) — Silencia este chat\n' +
            '> `.mutechat buka 628xxx` — Activa el sonido del chat'
        )
    }

    try {
        await sock.chatModify({ mute: mute ? 1 : null }, targetJid)
        await m.react('✅')
        const target = targetJid.split('@')[0]
        return m.reply(
            mute
                ? `🔇 *CHAT SILENCIADO*\n\n> Target: ${target}`
                : `🔊 *CHAT CON SONIDO*\n\n> Target: ${target}`
        )
    } catch (err) {
        return m.reply(`❌ Error: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
