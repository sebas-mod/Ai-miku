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
    name: 'ganti-namabot',
    alias: ['setnamabot', 'setnamebot', 'gantibot'],
    category: 'owner',
    description: 'Ganti nama bot di config.js',
    usage: '.ganti-namabot <nama baru>',
    example: '.ganti-namabot miku MD',
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
        return m.reply(`🤖 *CAMBIAR NOMBRE DEL BOT*\n\n> Nombre actual: *${config.bot?.name || '-'}*\n\n*Uso:*\n\`${m.prefix}ganti-namabot <nombre nuevo>\``)
    }

    try {
        const configPath = path.join(process.cwd(), 'config.js')
        let configContent = fs.readFileSync(configPath, 'utf8')

        configContent = configContent.replace(
            /bot:\s*\{[\s\S]*?name:\s*['"]([^'"]*)['"]/,
            (match, oldName) => match.replace(`'${oldName}'`, `'${newName}'`).replace(`"${oldName}"`, `'${newName}'`)
        )

        fs.writeFileSync(configPath, configContent)

        config.bot.name = newName

        m.reply(`✅ *LISTO*\n\n> Nombre del bot cambiado a: *${newName}*`)

    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
