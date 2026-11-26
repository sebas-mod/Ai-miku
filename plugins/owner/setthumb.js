/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import { getThumbUrl } from '../../src/lib/core/media.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'setthumb',
    alias: ['setmedia', 'cekmedia'],
    category: 'owner',
    description: 'Mengatur URL thumbnail bot',
    usage: '.setthumb <key> <url>',
    example: '.setthumb menu https://example.com/menu.jpg',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const isUrl = (v) => /^https?:\/\/\S+$/i.test(v || '')

async function handler(m, { args }) {
    const db = getDatabase()
    const thumbKeys = Object.keys(config.thumbUrl || {})
    const [key, value] = args

    if (!key) {
        const rows = thumbKeys.map((k) => `• ${k}: ${getThumbUrl(k) || '-'}`)
        return m.reply(
            `🖼️ *MEDIA BOT*\n\n${rows.join('\n')}\n\n` +
            `Cambiar: \`${m.prefix}setthumb <key> <url>\`\nEliminar override: \`${m.prefix}setthumb <key> reset\``
        )
    }

    const name = key === 'ppkosong' ? 'ppKosong' : key
    const valid = [...thumbKeys]
    if (!valid.includes(name)) {
        return m.reply(`❌ Clave no reconocida.\nOpciones: ${valid.join(', ')}`)
    }

    const current = { ...(db.setting('mediaUrl') || {}) }

    if (value === 'reset') {
        delete current[name]
        db.setting('mediaUrl', current)
        return m.reply(`♻️ Se eliminó la personalización de *${name}*; se vuelve a usar config.js`)
    }

    if (!isUrl(value)) {
        return m.reply(`❌ URL no válida.\nEjemplo: \`${m.prefix}setthumb ${name} https://example.com/file\``)
    }

    current[name] = value
    db.setting('mediaUrl', current)
    return m.reply(`✅ *${name}* diatur ke:\n${value}`)
}

export { pluginConfig as config, handler }
