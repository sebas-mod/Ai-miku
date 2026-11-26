/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import { isBotParticipant } from "../../src/lib/core/lid.js"
import te from '../../src/lib/core/error.js'

const pluginConfig = {
    name: 'onlythisgrup',
    alias: ['onlythisgroup', 'lockgrup', 'lockgroup'],
    category: 'owner',
    description: 'Bot hanya aktif di grup ini saja',
    usage: '.onlythisgrup',
    example: '.onlythisgrup',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const db = getDatabase()
        const current = db.setting('onlyThisGroup') || null

        if (current && (current === m.chat || current.jid === m.chat)) {
            db.setting('onlyThisGroup', null)
            db.save()
            return m.reply(`🔓 *UNLOCKED*\n\nBot kembali aktif di semua grup secara publik.`)
        }

        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const groupMetadata = await sock.groupMetadata(m.chat).catch(() => null)

        if (!groupMetadata) {
            return m.reply(`❌ Gagal mendapatkan metadata grup.`)
        }

        const participants = groupMetadata.participants
        const isBotAdmin = Boolean(m.isBotAdmin) || participants.some(p => p.admin && isBotParticipant(p, [botNumber]))

        if (!isBotAdmin) {
            return m.reply(`❌ *AKSES DITOLAK*\n\nBot harus menjadi admin di grup ini terlebih dahulu agar bisa mengambil tautan undangan (link grup).`)
        }

        const inviteCode = await sock.groupInviteCode(m.chat).catch(() => null)

        if (!inviteCode) {
            return m.reply(`❌ Gagal mengambil tautan undangan grup. Pastikan bot adalah admin yang sah.`)
        }

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`
        const groupName = groupMetadata.subject

        db.setting('onlyThisGroup', {
            jid: m.chat,
            name: groupName,
            link: inviteLink
        })
        db.save()

        await m.reply(
            `🔒 *LOCKED BERHASIL*\n\n` +
            `Mulai sekarang, bot hanya bisa digunakan secara eksklusif di grup:\n` +
            `*${groupName}*\n\n` +
            `Pengguna di grup lain akan diarahkan untuk bergabung melalui tautan:\n` +
            `${inviteLink}\n\n` +
            `Ketik \`.onlythisgrup\` lagi untuk membuka kunci.`
        )
    } catch (error) {
        console.error(error)
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
