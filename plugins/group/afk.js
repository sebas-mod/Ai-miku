/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const afkStorage = global.afkStorage || (global.afkStorage = new Map())

const pluginConfig = {
    name: 'afk',
    alias: ['away', 'brb'],
    category: 'group',
    description: 'Activa el estado AFK con un motivo',
    usage: '.afk <alasan>',
    example: '.afk lagi makan',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function getAfkUser(jid) {
    return afkStorage.get(jid) || null
}

function setAfkUser(jid, reason) {
    afkStorage.set(jid, {
        reason: reason || 'Sin motivo',
        time: Date.now()
    })
}

function removeAfkUser(jid) {
    afkStorage.delete(jid)
}

function isUserAfk(jid) {
    return afkStorage.has(jid)
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
        return `${hours} horas ${minutes % 60} minutos`
    } else if (minutes > 0) {
        return `${minutes} minutos ${seconds % 60} segundos`
    } else {
        return `${seconds} segundos`
    }
}

async function handler(m, { sock }) {
    const reason = m.text || 'Sin motivo'
    setAfkUser(m.sender, reason)
    await m.reply(
        `💤 *AFK ACTIVO*\n\n` +
        `\`\`\`@${m.sender.split('@')[0]} ahora está AFK\`\`\`\n` +
        `🍀 \`Alasan:\` *${reason}*\n\n` +
        `_Escribe cualquier cosa para desactivar el AFK._`,
        { mentions: [m.sender] }
    )
}

async function checkAfk(m, sock) {
    const afkData = getAfkUser(m.sender)
    if (afkData) {
        if (m.isCommand && m.command?.toLowerCase() === 'afk') return
        removeAfkUser(m.sender)
        const duration = formatDuration(Date.now() - afkData.time)
        await m.reply(`👋 *AFK TERMINADO*\n\n` +
                `\`\`\`¡@${m.sender.split('@')[0]} ya ha vuelto!\`\`\`\n` +
                `🍀 \`Duración AFK:\` *${duration}*`, { mentions: [m.sender] })
    }
    if (m.isGroup && m.mentionedJid && m.mentionedJid.length > 0) {
        for (const mentioned of m.mentionedJid) {
            const mentionedAfk = getAfkUser(mentioned)
            if (mentionedAfk) {
                const duration = formatDuration(Date.now() - mentionedAfk.time)
                await m.reply(`💤 *USUARIO AFK*\n\n` +
                        `\`\`\`¡Shhh, no molestar!\`\`\` \`@${mentioned.split('@')[0]}\` está AFK\n` +
                        `🍀 \`Alasan:\` *${mentionedAfk.reason}*\n` +
                        `🍀 \`Desde:\` *${duration} atrás*`, { mentions: [mentioned] })
            }
        }
    }
}

export { pluginConfig as config, handler, checkAfk, getAfkUser, setAfkUser, removeAfkUser, isUserAfk }
