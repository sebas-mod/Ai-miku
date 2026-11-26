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
    name: 'setintro',
    alias: ['setperkenalan', 'introset'],
    category: 'group',
    description: 'Set pesan intro grup (admin only)',
    usage: '.setintro <pesan>',
    example: '.setintro Selamat datang @user di @group!',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

async function handler(m) {
    const db = getDatabase()
    const introText = m.fullArgs?.trim() || m.text?.trim()

    if (!introText) {
        return m.reply(
            `📝 *sᴇᴛ ɪɴᴛʀᴏ*\n\n` +
            `> Masukkan pesan intro!\n\n` +
            `*Placeholder yang tersedia:*\n` +
            `> @user - Nama pengguna\n` +
            `> @group - Nama grup\n` +
            `> @count - Jumlah member\n` +
            `> @date - Tanggal hari ini\n` +
            `> @time - Waktu sekarang\n` +
            `> @desc - Deskripsi grup\n` +
            `> @botname - Nama bot\n\n` +
            `*Contoh:*\n` +
            `> .setintro Selamat datang @user di grup @group! 👋`
        )
    }

    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    groupData.intro = introText
    db.setGroup(m.chat, groupData)
    db.save()

    await m.reply(
        `✅ *ɪɴᴛʀᴏ ᴅɪsᴀᴠᴇ!*\n` +
        `Pesan intro grup berhasil diubah.\n` +
        `Ketik *${m.prefix}intro* untuk melihat hasilnya.`
    )
}

export { pluginConfig as config, handler }
