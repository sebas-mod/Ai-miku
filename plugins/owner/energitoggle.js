/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import config from '../../config.js'
const pluginConfig = {
    name: ['disableenergi', 'enableenergi'],
    alias: ['offenergi', 'onenergi'],
    category: 'owner',
    description: 'Enable/disable sistem energi',
    usage: '.disableenergi atau .enableenergi',
    example: '.disableenergi',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const cmd = m.command.toLowerCase()
    const isEnable = ['enableenergi', 'onenergi'].includes(cmd)

    db.setting('energi', isEnable)
    db.save()

    await m.react(isEnable ? '⚡' : '🔌')
    return m.reply(
        isEnable
            ? '⚡ *SISTEMA DE ENERGÍA ACTIVADO*\n\n> Ahora cada comando requiere energía.'
            : '🔌 *SISTEMA DE ENERGÍA DESACTIVADO*\n\n > Los comandos ya no consumen energía.'
    )
}

export { pluginConfig as config, handler }
