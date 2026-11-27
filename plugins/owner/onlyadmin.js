/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
const pluginConfig = {
    name: 'onlyadmin',
    alias: ['selfadmin', 'publicadmin', 'adminonly'],
    category: 'owner',
    description: 'Hanya admin grup yang bisa akses command bot',
    usage: '.onlyadmin on/off',
    example: '.onlyadmin on',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const args = m.args[0]?.toLowerCase()
    const cmd = m.command.toLowerCase()
    const current = db.setting('onlyAdmin') || false

    if (cmd === 'selfadmin') {
        if (current) {
            db.setting('onlyAdmin', false)
            await m.react('❌')
            return m.reply('❌ *ONLYADMIN DESACTIVADO*\n\n > El bot puede ser usado por cualquiera')
        }
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *ONLYADMIN ACTIVO*\n\n' +
            '╭┈┈⬡「 🔒 *ACCESO* 」\n' +
            '┃ ✅ Admin del grupo\n' +
            '┃ ✅ Owner bot\n' +
            '┃ ❌ Miembro normal\n' +
            '╰┈┈⬡\n\n' +
            '> Usa `.onlyadmin off` para desactivarlo'
        )
    }

    if (cmd === 'publicadmin') {
        if (current) {
            db.setting('onlyAdmin', false)
            await m.react('❌')
            return m.reply('❌ *ONLYADMIN DESACTIVADO*\n\n > El bot puede ser usado por cualquiera')
        }
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *ONLYADMIN ACTIVO*\n\n' +
            '╭┈┈⬡「 🔒 *ACCESO* 」\n' +
            '┃ ✅ Admin del grupo\n' +
            '┃ ✅ Owner bot\n' +
            '┃ ✅ Chat privado (todos)\n' +
            '┃ ❌ Miembro normal del grupo\n' +
            '╰┈┈⬡\n\n' +
            '> Usa `.onlyadmin off` para desactivarlo'
        )
    }

    if (!args || args === 'status') {
        return m.reply(
            `🔒 *ONLYADMIN*\n\n` +
            `> Estado: ${current ? '✅ Activo' : '❌ Inactivo'}\n\n` +
            `*Uso:*\n` +
            `> \`.onlyadmin on\` — Activar\n` +
            `> \`.onlyadmin off\` — Nonaktifkan\n\n` +
            `_Solo administradores de grupo, el owner y los chats privados pueden usar el bot_`
        )
    }

    if (args === 'on') {
        if (current) return m.reply('⚠️ OnlyAdmin ya está activo.')
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *ONLYADMIN ACTIVO*\n\n' +
            '╭┈┈⬡「 🔒 *ACCESO* 」\n' +
            '┃ ✅ Admin del grupo\n' +
            '┃ ✅ Owner bot\n' +
            '┃ ✅ Chat privado (todos)\n' +
            '┃ ❌ Miembro normal del grupo\n' +
            '╰┈┈⬡'
        )
    }

    if (args === 'off') {
        if (!current) return m.reply('⚠️ OnlyAdmin ya está desactivado.')
        db.setting('onlyAdmin', false)
        await m.react('❌')
        return m.reply('❌ *ONLYADMIN DESACTIVADO*\n\n > El bot puede ser usado por cualquiera')
    }

    return m.reply('❌ Argumento no válido. Usa: `on` o `off`')
}

export { pluginConfig as config, handler }
