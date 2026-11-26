/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import fs from 'fs'
import path from 'path'
import config from '../../config.js'
import { getDatabase } from '../../src/lib/data/database.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'resetdb',
    alias: ['cleardb', 'wipedb'],
    category: 'owner',
    description: 'Reset semua data database',
    usage: '.resetdb [confirm]',
    example: '.resetdb confirm',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

if (!global.resetDbPending) global.resetDbPending = {}

async function handler(m, { sock }) {
    if (!config.isOwner(m.sender)) {
        return m.reply('❌ *¡Solo el owner!*')
    }

    const confirm = m.args?.[0]?.toLowerCase()

    if (confirm !== 'confirm') {
        global.resetDbPending[m.sender] = Date.now()

        return m.reply(
            `⚠️ *¡ADVERTENCIA!*\n\n` +
            `> Esto eliminará TODOS los datos:\n` +
            `> • Data user\n` +
            `> • Data group\n` +
            `> • Data clan\n` +
            `> • Todas las estadísticas\n\n` +
            `╭┈┈⬡「 ⚠️ *CONFIRMACIÓN* 」\n` +
            `┃ Escribe: *.resetdb confirm*\n` +
            `┃ en 60 segundos\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> ❌ ¡Esta acción NO se puede deshacer!`
        )
    }

    const pending = global.resetDbPending[m.sender]
    if (!pending || (Date.now() - pending) > 60000) {
        delete global.resetDbPending[m.sender]
        return m.reply(`❌ ¡Tiempo agotado! Escribe *.resetdb* de nuevo para empezar.`)
    }

    delete global.resetDbPending[m.sender]

    try {
        const dbPath = path.join(process.cwd(), 'database', 'db.json')
        const backupPath = path.join(process.cwd(), 'database', `db_backup_${Date.now()}.json`)

        if (fs.existsSync(dbPath)) {
            fs.copyFileSync(dbPath, backupPath)
        }

        const db = getDatabase()

        let userCount = 0
        let groupCount = 0
        let clanCount = 0

        if (db.db?.data?.users) {
            userCount = Object.keys(db.db.data.users).length
            db.db.data.users = {}
        }

        if (db.db?.data?.groups) {
            groupCount = Object.keys(db.db.data.groups).length
            db.db.data.groups = {}
        }

        if (db.db?.data?.clans) {
            clanCount = Object.keys(db.db.data.clans).length
            db.db.data.clans = {}
        }

        await db.save()

        await m.reply(
            `✅ *¡BASE DE DATOS RESTABLECIDA!*\n\n` +
            `╭┈┈⬡「 📊 *DATOS ELIMINADOS* 」\n` +
            `┃ 👤 Users: ${userCount}\n` +
            `┃ 👥 Groups: ${groupCount}\n` +
            `┃ ⚔️ Clans: ${clanCount}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> Backup disimpan di:\n` +
            `> \`${path.basename(backupPath)}\``
        )

    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
