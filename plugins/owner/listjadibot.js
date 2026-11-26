/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getAllJadibotSessions, getActiveJadibots } from '../../src/lib/features/jadibot-manager.js'
const pluginConfig = {
    name: 'listjadibot',
    alias: ['jadibotlist', 'alljadibot'],
    category: 'owner',
    description: 'Lihat semua session jadibot yang tersimpan',
    usage: '.listjadibot',
    example: '.listjadibot',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const sessions = getAllJadibotSessions()
    const active = getActiveJadibots()

    if (sessions.length === 0) {
        return m.reply(`❌ No hay sesiones de jadibot guardadas`)
    }

    let txt = `🤖 *LISTA DE JADIBOTS*\n\n`
    txt += `> 📊 Total: *${sessions.length}* session\n`
    txt += `> 🟢 Activos: *${active.length}*\n`
    txt += `> ⚫ Offline: *${sessions.length - active.length}*\n\n`

    sessions.forEach((s, i) => {
        const status = s.isActive ? '🟢' : '⚫'
        const label = s.isActive ? 'Online' : 'Offline'
        txt += `${status} *${i + 1}.* @${s.id} — _${label}_\n`
    })

    txt += `\n> \`${m.prefix}listjadibotaktif\` — Detalle de activos\n`
    txt += `> \`${m.prefix}stopalljadibot\` — Detén todas\n`
    txt += `> \`${m.prefix}stopdandeletejadibot @user\` — Elimina la sesión`

    const mentions = sessions.map(s => s.jid)

    await sock.sendMessage(m.chat, {
        text: txt,
        mentions,
        interactiveButtons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🟢 Ver activos',
                    id: `${m.prefix}listjadibotaktif`
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🛑 Detener todo',
                    id: `${m.prefix}stopalljadibot`
                })
            }
        ]
    }, { quoted: m })
}

export { pluginConfig as config, handler }
