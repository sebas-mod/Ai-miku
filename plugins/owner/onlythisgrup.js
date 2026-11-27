/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import { isBotParticipant } from "../../src/lib/core/lid.js"
import te from '../../src/lib/core/error.js'

const pluginConfig = {
    name: 'onlythisgrup',
    alias: ['onlythisgroup', 'lockgrup', 'lockgroup'],
    category: 'owner',
    description: 'Bot hanya aktif di grup ini saja',
    usage: '.onlythisgrup',
    example: '.onlythisgrup',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const db = getDatabase()
        const current = db.setting('onlyThisGroup') || null

        if (current && (current === m.chat || current.jid === m.chat)) {
            db.setting('onlyThisGroup', null)
            db.save()
            return m.reply(`🔓 *UNLOCKED*\n\nEl bot vuelve a estar activo en todos los grupos públicamente.`)
        }

        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const groupMetadata = await sock.groupMetadata(m.chat).catch(() => null)

        if (!groupMetadata) {
            return m.reply(`❌ No se pudieron obtener los datos del grupo.`)
        }

        const participants = groupMetadata.participants
        const isBotAdmin = Boolean(m.isBotAdmin) || participants.some(p => p.admin && isBotParticipant(p, [botNumber]))

        if (!isBotAdmin) {
            return m.reply(`❌ *ACCESO DENEGADO*\n\nEl bot debe ser administrador de este grupo para poder obtener el enlace de invitación.`)
        }

        const inviteCode = await sock.groupInviteCode(m.chat).catch(() => null)

        if (!inviteCode) {
            return m.reply(`❌ No se pudo obtener el enlace de invitación. Asegúrate de que el bot sea administrador.`)
        }

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`
        const groupName = groupMetadata.subject

        db.setting('onlyThisGroup', {
            jid: m.chat,
            name: groupName,
            link: inviteLink
        })
        db.save()

        await m.reply(
            `🔒 *BLOQUEO APLICADO*\n\n` +
            `Desde ahora, el bot solo puede usarse exclusivamente en el grupo:\n` +
            `*${groupName}*\n\n` +
            `Los usuarios de otros grupos serán dirigidos a unirse mediante el enlace:\n` +
            `${inviteLink}\n\n` +
            `Escribe \`.onlythisgrup\` de nuevo para desbloquear.`
        )
    } catch (error) {
        console.error(error)
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
