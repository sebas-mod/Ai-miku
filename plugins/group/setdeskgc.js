/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'setdeskgc',
    alias: ['setdesc', 'setdescgc', 'setdeskripsi', 'setdesk'],
    category: 'group',
    description: 'Mengubah deskripsi grup',
    usage: '.setdeskgc <deskripsi baru>',
    example: '.setdeskgc Grup untuk diskusi',
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
    const newDesc = m.text?.trim() || ''
    if (!m.text && m.args?.length === 0) {
        await m.reply(
            `⚠️ *CÓMO USAR*\n\n` +
            `> \`${m.prefix}setdeskgc Descripción nueva\`\n` +
            `> \`${m.prefix}setdeskgc clear\` - Eliminar descripción`
        )
        return
    }
    const descToSet = newDesc.toLowerCase() === 'clear' ? '' : newDesc

    if (descToSet.length > 2048) {
        await m.reply(
            `⚠️ *VALIDACIÓN*\n\n` +
            `> La descripción admite un máximo de 2048 caracteres.`
        )
        return
    }

    try {
        await sock.groupUpdateDescription(m.chat, descToSet)

        if (descToSet) {
            await m.reply(
                `✅ ¡La descripción del grupo se ha actualizado!`
            )
        } else {
            await m.reply(
                `✅ ¡La descripción del grupo se ha eliminado!`
            )
        }
    } catch (error) {
        await m.reply(
            `❌ *FALLIDO*\n\n` +
            `> No se puede cambiar la descripción del grupo.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
