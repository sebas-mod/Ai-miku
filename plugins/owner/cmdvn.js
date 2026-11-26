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
    name: 'cmdvn',
    alias: ['voicecommand', 'vncmd'],
    category: 'owner',
    description: 'Aktifkan command via voice note',
    usage: '.cmdvn <on/off>',
    example: '.cmdvn on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const args = m.args || []
    const subCmd = args[0]?.toLowerCase()

    const current = db.setting('cmdVn') || false

    if (!subCmd || subCmd === 'status') {
        const status = current ? '✅ ON' : '❌ OFF'
        return m.reply(
            `🎤 *COMANDO POR NOTA DE VOZ*\n\n` +
            `> Estado: *${status}*\n\n` +
            `> \`${m.prefix}cmdvn on\` — Command via VN\n` +
            `> \`${m.prefix}cmdvn off\` — Command via text (default)\n\n` +
            `> Con ON, envía una nota de voz con el nombre del comando\n` +
            `> Ejemplo: VN "menu" → activa .menu`
        )
    }

    if (subCmd === 'on') {
        db.setting('cmdVn', true)
        return m.reply(
            `✅ *COMANDO POR NOTA DE VOZ ACTIVO*\n\n` +
            `> Envía una nota de voz con el nombre del comando\n` +
            `> El bot la transcribirá y ejecutará el comando automáticamente\n` +
            `> Ejemplo: VN "menu" → activa .menu`
        )
    }

    if (subCmd === 'off') {
        db.setting('cmdVn', false)
        return m.reply(`❌ CMD VN *dinonaktifkan*. Command via text normal.`)
    }

    return m.reply(`❌ Usa \`${m.prefix}cmdvn on\` o \`${m.prefix}cmdvn off\``)
}

export { pluginConfig as config, handler }
