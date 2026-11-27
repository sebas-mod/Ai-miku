/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import { getParticipantJid } from '../../src/lib/core/lid.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'warn',
    alias: ['warning', 'peringatan'],
    category: 'group',
    description: 'Da una advertencia a un miembro',
    usage: '.warn @user <alasan>',
    example: '.warn @user spam',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()

    let groupData = db.getGroup(m.chat) || {}
    let warnings = groupData.warnings || {}
    const maxWarns = groupData.maxWarnings || 3

    const args = m.args
    if (!args[0] && !m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
        return m.reply(
            `⚠️ *SISTEMA DE ADVERTENCIAS DEL GRUPO*\n\n` +
            `Sistema de gestión de infracciones para los miembros del grupo.\n` +
            `Límite de advertencias: *${maxWarns} veces* (expulsión automática)\n\n` +
            `*USO:*\n` +
            `• *${m.prefix}warn @usuario <motivo>* — Pone una advertencia\n` +
            `• *${m.prefix}warn max <número>* — Cambia el límite máximo de advertencias\n` +
            `• *${m.prefix}listwarn* — Ver la lista de miembros con advertencias\n` +
            `• *${m.prefix}resetwarn @usuario* — Borra todas las advertencias de un miembro\n\n` +
            `*CÓMO FUNCIONA:*\n` +
            `1. Cuando un miembro comete su primera infracción, dale un aviso 1: *${m.prefix}warn @usuario Spam de mensajes*\n` +
            `2. El bot guardará "Spam de mensajes" como su advertencia número 1.\n` +
            `3. Si vuelve a incumplir, dale un segundo aviso con otro motivo: *${m.prefix}warn @usuario Lenguaje ofensivo*\n` +
            `4. Si las advertencias llegan al límite máximo (ahora *${maxWarns}*), el bot EXPULSARÁ automáticamente a ese miembro.\n` +
            `5. El historial completo se puede ver escribiendo *${m.prefix}listwarn @usuario*.`
        )
    }
    if (args[0]?.toLowerCase() === 'max') {
        const newMax = parseInt(args[1])
        if (isNaN(newMax) || newMax < 1 || newMax > 20) {
            return m.reply(`❌ *FALLIDO*\n\nEl límite de advertencias debe ser un número del 1 al 20.\nEjemplo: *${m.prefix}warn max 5*`)
        }
        groupData.maxWarnings = newMax
        db.setGroup(m.chat, groupData)
        return m.reply(`✅ *LÍMITE DE ADVERTENCIAS CAMBIADO*\n\nEl máximo de advertencias de este grupo ahora es *${newMax}*.`)
    }

    let targetUser = null
    if (m.quoted) {
        targetUser = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0]
    }

    if (!targetUser) {
        await m.reply(
            `⚠️ *CÓMO SE USA*\n\n` +
            `> Responde al mensaje del usuario + \`${m.prefix}warn motivo\`\n` +
            `> O: \`${m.prefix}warn @usuario motivo\``
        )
        return
    }
    try {
        const groupMeta = m.groupMetadata
        const participant = groupMeta.participants.find(p => getParticipantJid(p) === targetUser)
        if (participant?.admin) {
            await m.reply(`❌ No se puede poner una advertencia a un administrador del grupo.`)
            return
        }
    } catch (e) {}

    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    if (targetUser === botJid) {
        await m.reply(`❌ No me pongas advertencias a mí, solo soy un bot.`)
        return
    }

    const reasonArg = m.quoted ? m.text?.trim() : m.text?.replace(/@\d+/g, '').replace(/^\s*warn\s*/i, '').trim()
    const reason = reasonArg || 'Sin motivo'

    let userWarnings = warnings[targetUser] || []
    userWarnings.push({
        reason: reason,
        by: m.sender,
        time: Date.now()
    })

    warnings[targetUser] = userWarnings
    db.setGroup(m.chat, { ...groupData, warnings: warnings })

    const warnCount = userWarnings.length
    const targetName = targetUser.split('@')[0]

    if (warnCount >= maxWarns) {
        try {
            await sock.groupParticipantsUpdate(m.chat, [targetUser], 'remove')
            await m.reply(
                `🚨 *LÍMITE DE ADVERTENCIAS ALCANZADO*\n\n` +
                `¡@${targetName} fue expulsado del grupo por llegar al límite de infracciones!\n\n` +
                `*Detalles:*\n` +
                `> Advertencias: *${warnCount}/${maxWarns}*\n` +
                `> Último motivo: *${reason}*`,
                { mentions: [targetUser] }
            )
            delete warnings[targetUser]
            db.setGroup(m.chat, { ...groupData, warnings: warnings })
        } catch (e) {
            m.reply(te(m.prefix, m.command, m.pushName))
        }
    } else {
        await m.reply(
            `⚠️ *ADVERTENCIA APLICADA*\n\n` +
            `¡@${targetName} ha recibido un aviso (SP${warnCount})!\n\n` +
            `*Detalles:*\n` +
            `> Advertencia n.º: *${warnCount}/${maxWarns}*\n` +
            `> Motivo: *${reason}*\n\n` +
            `_${maxWarns - warnCount} advertencias más = EXPULSIÓN AUTOMÁTICA_`,
            { mentions: [targetUser] }
        )
    }
}

export { pluginConfig as config, handler }
