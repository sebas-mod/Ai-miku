/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
const pluginConfig = {
    name: 'setintro',
    alias: ['setperkenalan', 'introset'],
    category: 'group',
    description: 'Set pesan intro grup (admin only)',
    usage: '.setintro <pesan>',
    example: '.setintro Selamat datang @user di @group!',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

async function handler(m) {
    const db = getDatabase()
    const introText = m.fullArgs?.trim() || m.text?.trim()

    if (!introText) {
        return m.reply(
            `📝 *ESTABLECER INTRO*\n\n` +
            `> ¡Envía el mensaje de presentación!\n\n` +
            `*Marcadores disponibles:*\n` +
            `> @user - Nombre del usuario\n` +
            `> @group - Nombre del grupo\n` +
            `> @count - Número de miembros\n` +
            `> @date - Fecha de hoy\n` +
            `> @time - Hora actual\n` +
            `> @desc - Descripción del grupo\n` +
            `> @botname - Nombre del bot\n\n` +
            `*Ejemplo:*\n` +
            `> .setintro ¡Bienvenido @user al grupo @group! 👋`
        )
    }

    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    groupData.intro = introText
    db.setGroup(m.chat, groupData)
    db.save()

    await m.reply(
        `✅ *¡INTRO DESACTIVADA!*\n` +
        `El mensaje de presentación del grupo se ha actualizado.\n` +
        `Escribe *${m.prefix}intro* para ver el resultado.`
    )
}

export { pluginConfig as config, handler }
