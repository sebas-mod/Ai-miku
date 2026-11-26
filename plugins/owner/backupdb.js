/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { sendStoreBackup, SCHEMA_VERSION } from '../../src/lib/data/store-backup.js'
const pluginConfig = {
    name: 'backupdb',
    alias: ['dbbackup', 'backupstore', 'storebackup'],
    category: 'owner',
    description: 'Backup database/store dan kirim ke owner',
    usage: '.backupdb',
    isOwner: true,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const backupContents = [
        '📁 database/*.json (todos los archivos JSON)',
        '📄 storage/database.json (main database)',
        '📄 db.json (root database)',
        '📄 database/main/*.json (main database)',
        '📋 backup_metadata.json (info schema)'
    ]

    await m.reply(
        `🕕 *Membuat backup database...*\n\n` +
        `╭┈┈⬡「 📦 *QUÉ SE RESPALDA* 」\n` +
        backupContents.map(c => `┃ ${c}`).join('\n') +
        `\n╰┈┈┈┈┈┈┈┈⬡`
    )

    const result = await sendStoreBackup(sock)

    if (result.success) {
        await m.reply(
            `✅ *¡Copia de seguridad completada!*\n\n` +
            `📦 Size: ${result.size}\n` +
            `📁 Files: ${result.files}\n` +
            `🔖 Schema: v${SCHEMA_VERSION}\n\n` +
            `> Copia segura, compatible con futuras actualizaciones.\n` +
            `> Backup telah dikirim ke owner utama.`
        )
    } else {
        await m.reply(`❌ Error en la copia: ${result.error}`)
    }
}

export { pluginConfig as config, handler }
