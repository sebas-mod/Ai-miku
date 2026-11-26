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
const pluginConfig = {
    name: 'sampah',
    alias: ['clearsampah', 'cleartemp', 'deltemp'],
    category: 'owner',
    description: 'Menghapus semua sampah di temp',
    usage: '.sampah',
    example: '.sampah',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const tempPath = path.join(process.cwd(), 'temp')

    if (!fs.existsSync(tempPath)) {
        return m.reply('❌ ¡No se encontró la carpeta temporal!')
    }

    await m.react('🗑️')

    try {
        const files = fs.readdirSync(tempPath)

        if (!files.length) {
            return m.reply('📁 ¡La carpeta temporal ya está vacía!')
        }

        let deleted = 0

        for (const file of files) {
            const filePath = path.join(tempPath, file)

            fs.rmSync(filePath, { recursive: true, force: true })
            deleted++
        }

        await m.react('✅')
        await m.reply(
            `🗑️ *TEMP CLEANED!*\n\n` +
            `> Total de archivos/carpetas eliminados: *${deleted}*`
        )

    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
