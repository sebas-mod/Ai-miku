/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const config = {
    name: 'shindaratensei',
    alias: ['shindaratensei'],
    category: 'group',
    description: 'Keluarkan semua member biasa; admin dan bot tetap aman',
    usage: '.shindaratensei',
    isGroup: true,
    isBotAdmin: true,
    isOwner: false
}

async function handler(m, { sock }) {
    if (!m.isGroup) return m.reply('❌ Esta función solo se puede usar en grupos.')

    // Hanya nomor bot yang sedang aktif yang boleh memakai perintah ini.
    const botNumber = (sock.user?.id || '').split(':')[0].replace(/[^0-9]/g, '')
    const senderNumber = (m.sender || '').replace(/[^0-9]/g, '')
    if (!botNumber || senderNumber !== botNumber) {
        return m.reply('❌ Acceso denegado. `.shindaratensei` es solo para el número del bot.')
    }

    if (!m.isBotAdmin) {
        return m.reply('❌ El bot debe ser administrador del grupo.')
    }

    try {
        const participants = m.groupMetadata?.participants || []
        const targets = participants
            .filter(p => p && p.id)
            .filter(p => {
                const jid = p.id.replace(/[^0-9]/g, '')
                const role = p.admin
                // Admin dan superadmin tetap aman.
                return !role && jid !== botNumber
            })
            .map(p => p.id)

        if (!targets.length) {
            return m.reply('ℹ️ No hay miembros normales que puedan ser expulsados.')
        }

        let removed = 0
        for (const jid of targets) {
            try {
                await sock.groupParticipantsUpdate(m.chat, [jid], 'remove')
                removed++
            } catch (e) {}
        }

        return m.reply(`✅ ShindaraTensei terminado.\n\n👤 Miembros normales procesados: ${removed}\n🛡️ Administradores y bot quedan a salvo.`)
    } catch (e) {
        return m.reply('❌ Ocurrió un error al ejecutar shindaratensei.')
    }
}

export { config, handler }
