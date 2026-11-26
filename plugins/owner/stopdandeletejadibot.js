/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { stopJadibot, getAllJadibotSessions } from '../../src/lib/features/jadibot-manager.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'stopdandeletejadibot',
    alias: ['deletejadibot', 'removejadibot', 'hapusjadibot'],
    category: 'owner',
    description: 'Stop dan hapus session jadibot user secara permanen',
    usage: '.stopdandeletejadibot @user',
    example: '.stopdandeletejadibot @628xxx',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let target = null

    if (m.quoted) {
        target = m.quoted.sender
    } else if (m.mentionedJid?.[0]) {
        target = m.mentionedJid[0]
    } else if (m.text?.trim()) {
        const num = m.text.trim().replace(/[^0-9]/g, '')
        if (num) target = num + '@s.whatsapp.net'
    }

    if (!target) {
        const sessions = getAllJadibotSessions()

        if (sessions.length === 0) {
            return m.reply(`❌ No hay sesiones de jadibot guardadas`)
        }

        let txt = `🗑️ *DETENER Y ELIMINAR JADIBOT*\n\n`
        txt += `Elige el objetivo mencionándolo o respondiendo:\n\n`

        sessions.forEach((s, i) => {
            const status = s.isActive ? '🟢' : '⚫'
            txt += `${status} *${i + 1}.* @${s.id}\n`
        })

        txt += `\n> Ejemplo: \`${m.prefix}stopdandeletejadibot @628xxx\``

        return sock.sendMessage(m.chat, {
            text: txt,
            mentions: sessions.map(s => s.jid)
        }, { quoted: m })
    }

    const id = target.replace(/@.+/g, '')
    const sessions = getAllJadibotSessions()
    const session = sessions.find(s => s.id === id)

    if (!session) {
        return m.reply(`❌ No se encontró la sesión de jadibot para *@${id}*`, { mentions: [target] })
    }

    await m.react('🕕')

    try {
        await stopJadibot(target, true)

        await m.react('✅')

        await sock.sendMessage(m.chat, {
            text: `🗑️ *JADIBOT ELIMINADO*\n\n` +
                `> 📱 Nomor: *@${id}*\n` +
                `> 🗑️ Status: *Deleted*\n\n` +
                `Session telah dihapus secara permanen.\n` +
                `El usuario necesita \`.jadibot\` de nuevo para crear una sesión nueva.`,
            mentions: [target]
        }, { quoted: m })
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
