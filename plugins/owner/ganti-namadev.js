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
    name: 'ganti-namadev',
    alias: ['setnamadev', 'setnamedev', 'gantideveloper'],
    category: 'owner',
    description: 'Cambia el nombre del developer en config.js',
    usage: '.ganti-namadev <nombre baru>',
    example: '.ganti-namadev Lucky Archz',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, config }) {
    const newName = m.args.join(' ')

    if (!newName) {
        return m.reply(`👨‍💻 *CAMBIAR NOMBRE DEL DESARROLLADOR*\n\n> Nombre actual: *${config.bot?.developer || '-'}*\n\n*Uso:*\n\`${m.prefix}ganti-namadev <nombre nuevo>\``)
    }

    try {
        const configPath = path.join(process.cwd(), 'config.js')
        let configContent = fs.readFileSync(configPath, 'utf8')

        configContent = configContent.replace(
            /developer:\s*['"]([^'"]*)['"]/,
            `developer: '${newName}'`
        )

        fs.writeFileSync(configPath, configContent)

        config.bot.developer = newName

        m.reply(`✅ *LISTO*\n\n> Nombre del desarrollador cambiado a: *${newName}*`)

    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
