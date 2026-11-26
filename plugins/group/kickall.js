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
    if (!m.isGroup) return m.reply('❌ Fitur ini hanya bisa digunakan di grup.')

    // Hanya nomor bot yang sedang aktif yang boleh memakai perintah ini.
    const botNumber = (sock.user?.id || '').split(':')[0].replace(/[^0-9]/g, '')
    const senderNumber = (m.sender || '').replace(/[^0-9]/g, '')
    if (!botNumber || senderNumber !== botNumber) {
        return m.reply('❌ Akses ditolak. `.shindaratensei` hanya untuk nomor bot.')
    }

    if (!m.isBotAdmin) {
        return m.reply('❌ Bot harus menjadi admin grup.')
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
            return m.reply('ℹ️ Tidak ada member biasa yang bisa dikeluarkan.')
        }

        let removed = 0
        for (const jid of targets) {
            try {
                await sock.groupParticipantsUpdate(m.chat, [jid], 'remove')
                removed++
            } catch (e) {}
        }

        return m.reply(`✅ ShindaraTensei selesai.\n\n👤 Member biasa diproses: ${removed}\n🛡️ Admin & bot tetap aman.`)
    } catch (e) {
        return m.reply('❌ Terjadi kesalahan saat menjalankan shindaratensei.')
    }
}

export { config, handler }
