/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'antitagsw',
    alias: ['antitag', 'antistatustag'],
    category: 'group',
    description: 'Mengaktifkan/menonaktifkan anti tag status di grup',
    usage: '.antitagsw <on/off>',
    example: '.antitagsw on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const groupId = m.chat
    const group = db.getGroup(groupId) || {}

    if (!action) {
        const status = group.antitagsw || 'off'

        await m.reply(
            `📢 *ᴀɴᴛɪᴛᴀɢsᴡ sᴇᴛᴛɪɴɢs*\n\n` +
            `> Status: *${status === 'on' ? '✅ Activo' : '❌ Inactivo'}*\n\n` +
            `> Esta función elimina los mensajes de etiqueta de estado\n` +
            `> (groupStatusMentionMessage)\n\n` +
            `\`\`\`━━━ ᴘɪʟɪʜᴀɴ ━━━\`\`\`\n` +
            `> \`${m.prefix}antitagsw on\` → Activar\n` +
            `> \`${m.prefix}antitagsw off\` → Desactivar`
        )
        return
    }

    if (action === 'on') {
        db.setGroup(groupId, { ...group, antitagsw: 'on' })
        await m.reply(
            `✅ *ANTITAGSW ACTIVADO*\n\n` +
            `> ¡La función contra etiquetas de estado se ha activado!\n` +
            `> Los mensajes de etiqueta de estado se eliminarán automáticamente.`
        )
        return
    }

    if (action === 'off') {
        db.setGroup(groupId, { ...group, antitagsw: 'off' })
        await m.reply(
            `❌ *ANTITAGSW DESACTIVADO*\n\n` +
            `> La función contra etiquetas de estado se ha desactivado.`
        )
        return
    }

    await m.reply(
        `❌ *OPCIÓN NO VÁLIDA*\n\n` +
        `> Usa: on u off`
    )
}

export { pluginConfig as config, handler }
