/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { stopJadibot, isJadibotActive, getJadibotStatus } from '../../src/lib/features/jadibot-manager.js'

const pluginConfig = {
    name: 'stopjadibot',
    alias: ['berhentijadibot', 'stopbot', 'unjadibot'],
    category: 'main',
    description: 'Detiene tu sesión de jadibot',
    usage: '.stopjadibot',
    example: '.stopjadibot',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
}

async function handler(m, { sock }) {
    const sender = m.sender
    if (!sender) return m.reply('❌ No se pudo identificar tu número')

    if (!isJadibotActive(sender)) {
        return m.reply(
            `❌ *ɴᴏ ᴇʀᴇs ᴜɴ ᴊᴀᴅɪʙᴏᴛ*\n\n` +
            `> Escribe \`${m.prefix}jadibot\` para convertirte en bot`
        )
    }

    const status = getJadibotStatus(sender)
    const uptime = status ? formatUptime(Date.now() - status.startedAt) : '-'

    await m.react('🕕')

    try {
        await stopJadibot(sender, false)
        await m.react('✅')

        await m.reply(
            `🛑 *ᴊᴀᴅɪʙᴏᴛ ᴅᴇᴛᴇɴɪᴅᴏ*\n\n` +
            `> 📱 Número: *@${sender.split('@')[0]}*\n` +
            `> ⏱️ Uptime: *${uptime}*\n` +
            `> 💾 Sesión: *Guardada*\n\n` +
            `Escribe \`${m.prefix}jadibot\` para volver a activarlo.`,
            { mentions: [sender] }
        )
    } catch (e) {
        await m.react('☢')
        await m.reply(`❌ No se pudo detener jadibot: ${e.message}`)
    }
}

export { pluginConfig as config, handler }
