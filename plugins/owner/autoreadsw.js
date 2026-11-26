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
    name: 'autoreadsw',
    alias: ['autoreadstory', 'readstory', 'bacasw'],
    category: 'owner',
    description: 'Auto read semua status/story WA',
    usage: '.autoreadsw on/off',
    example: '.autoreadsw on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const action = (m.args?.[0] || '').toLowerCase()
    const current = db.setting('autoReadSW') || { enabled: false }

    if (!action) {
        return m.reply(
            `👁️ *AUTO-LECTURA DE HISTORIAS*\n\n` +
            `> Estado: *${current.enabled ? '✅ ON' : '❌ OFF'}*\n\n` +
            `*CÓMO USAR:*\n` +
            `> \`${m.prefix}autoreadsw on\` — Activar\n` +
            `> \`${m.prefix}autoreadsw off\` — Desactivar`
        )
    }

    if (action === 'on') {
        db.setting('autoReadSW', { enabled: true })
        db.save()
        await m.react('✅')
        return m.reply(
            `✅ *AUTO-LECTURA DE HISTORIAS ACTIVA*\n\n` +
            `> El bot leerá automáticamente todas las historias de WA`
        )
    }

    if (action === 'off') {
        db.setting('autoReadSW', { enabled: false })
        db.save()
        await m.react('✅')
        return m.reply(`❌ *AUTO-LECTURA DE HISTORIAS DESACTIVADA*`)
    }

    return m.reply(`❌ Usa \`on\` o \`off\``)
}

export { pluginConfig as config, handler }
