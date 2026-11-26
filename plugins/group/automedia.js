/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from '../../config.js'
import { getDatabase } from '../../src/lib/data/database.js'
const pluginConfig = {
    name: 'automedia',
    alias: ['automedi', 'am'],
    category: 'group',
    description: 'Toggle auto media - otomatis jadikan sticker jadi gambar/video',
    usage: '.automedia on/off',
    example: '.automedia on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const groupData = db.getGroup(m.chat) || {}
    const current = groupData.automedia ?? false
    const arg = args[0]?.toLowerCase()

    if (!arg) {
        const status = current ? '✅ Activado' : '❌ Desactivado'
        return m.reply(
            `🎬 *AUTOMEDIA*\n\n` +
            `> Estado: ${status}\n\n` +
            `> Uso:\n` +
            `> \`${m.prefix}automedia on\` - activar\n` +
            `> \`${m.prefix}automedia off\` - desactivar\n\n` +
            `> _Convierte stickers en imágenes automáticamente_\n` +
            `> El video no se envió`
        )
    }

    if (arg === 'on' || arg === '1' || arg === 'aktif') {
        if (current) {
            return m.reply(`🎬 *AUTOMEDIA*\n\n> ¡Ya estaba activado!`)
        }
        db.setGroup(m.chat, { automedia: true })
        await db.save()
        return m.reply(`🎬 *AUTOMEDIA*\n\n> ✅ ¡Activado correctamente!\n> Los stickers se convertirán solos en imagen/vídeo`)
    }

    if (arg === 'off' || arg === '0' || arg === 'nonaktif') {
        if (!current) {
            return m.reply(`🎬 *AUTOMEDIA*\n\n> ¡Ya estaba desactivado!`)
        }
        db.setGroup(m.chat, { automedia: false })
        await db.save()
        return m.reply(`🎬 *AUTOMEDIA*\n\n> ❌ ¡Desactivado correctamente!`)
    }

    return m.reply(`❌ Usa: \`${m.prefix}automedia on/off\``)
}

async function autoMediaHandler(m, sock) {
    try {
        if (!m) return false
        if (!m.isGroup) return false
        if (m.isCommand) return false
        if (m.fromMe === true) return false

        const db = getDatabase()
        const groupData = db.getGroup(m.chat) || {}

        if (!groupData.automedia) return false

        const msg = m.message
        if (!msg) return false

        const hasSticker = msg.stickerMessage
        if (!hasSticker) return false

        if (hasSticker.isAnimated) return false

        const buffer = await m.download()
        if (!buffer || buffer.length === 0) return false

        await sock.sendMedia(m.chat, buffer, null, m, {
            type: 'image',
        })

        return true
    } catch (err) {
        return false
    }
}

export { pluginConfig as config, handler, autoMediaHandler }
