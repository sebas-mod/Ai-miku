/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import fs from 'fs'
import path from 'path'
import te from '../../src/lib/core/error.js'
import { backupSessionNow, listBackups } from '../../src/lib/system/session-backup.js'

const pluginConfig = {
    name: 'backupsession',
    alias: ['backupsesi', 'bckpsession', 'sessionbackup'],
    category: 'owner',
    description: 'Respalda manualmente la carpeta session (no hay respaldo automático)',
    usage: '.backupsession',
    example: '.backupsession',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

const dirSize = (dir) => {
    let total = 0
    try {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, e.name)
            total += e.isDirectory() ? dirSize(p) : fs.statSync(p).size
        }
    } catch {}
    return total
}
const fmt = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(2)} MB` : `${(b / 1024).toFixed(1)} KB`)

async function handler(m) {
    await m.react('💾')
    try {
        const target = backupSessionNow()
        if (!target) {
            await m.react('❌')
            return m.reply('❌ Error en la copia. No se encontró la carpeta session ni creds.json.')
        }

        await m.react('✅')
        await m.reply(
            `╭┈┈⬡「 💾 *COPIA DE SESIÓN* 」\n` +
            `┃ 📁 Lokasi: *database/backup-session/${path.basename(target)}*\n` +
            `┃ 📦 Tamaño: *${fmt(dirSize(target))}*\n` +
            `┃ 🗂️ Copias guardadas: *${listBackups().length}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> Las copias solo se crean manualmente con este comando. Las copias antiguas fuera del límite se eliminan automáticamente.`
        )
    } catch (error) {
        await m.react('❌')
        await te(m, error)
    }
}

export { pluginConfig as config, handler }
