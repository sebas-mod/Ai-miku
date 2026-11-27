/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'setnamegc',
    alias: ['setnamegrup', 'setgcname', 'setnamegroup', 'setnamagrup'],
    category: 'group',
    description: 'Cambia el nombre del grupo',
    usage: '.setnamegc <nombre baru>',
    example: '.setnamegc Grupo Genial',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const newName = m.text?.trim()

    if (!newName) {
        await m.reply(
            `⚠️ *CÓMO USAR*\n\n` +
            `> \`${m.prefix}setnamegc Nuevo nombre del grupo\``
        )
        return
    }

    if (newName.length < 1 || newName.length > 100) {
        await m.reply(
            `⚠️ *VALIDACIÓN*\n\n` +
            `> El nombre del grupo debe tener entre 1 y 100 caracteres.`
        )
        return
    }

    try {
        await sock.groupUpdateSubject(m.chat, newName)

        await m.reply(
            `✅ Nombre del grupo cambiado a *${newName}*`
        )
    } catch (error) {
        await m.reply(
            `❌ *FALLIDO*\n\n` +
            `> No se puede cambiar el nombre del grupo.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
