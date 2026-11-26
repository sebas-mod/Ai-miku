/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import config from '../../config.js'
import fs from 'fs'
import path from 'path'
const pluginConfig = {
    name: 'autoreply',
    alias: ['smarttrigger', 'smarttriggers', 'ar'],
    category: 'group',
    description: 'Configura las respuestas automáticas y los disparadores por grupo',
    usage: '.autoreply on/off/add/del/list/private',
    example: '.autoreply on',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: false,
    isBotAdmin: false
}

const AUTOREPLY_MEDIA_DIR = path.join(process.cwd(), 'database', 'autoreply_media')

if (!fs.existsSync(AUTOREPLY_MEDIA_DIR)) {
    fs.mkdirSync(AUTOREPLY_MEDIA_DIR, { recursive: true })
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const action = args[0]?.toLowerCase()

    const privateAutoreply = db.setting('autoreplyPrivate') ?? false

    if (action === 'private') {
        if (!m.isOwner) {
            return m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> ¡Solo el dueño puede configurar las respuestas automáticas en privado!`)
        }

        const subAction = args[1]?.toLowerCase()

        if (subAction === 'on') {
            db.setting('autoreplyPrivate', true)
            m.react('✅')
            return m.reply(`✅ *ᴀᴜᴛᴏʀᴇᴘʟʏ ᴘʀɪᴠᴀᴅᴏ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot responderá solo en los chats privados`)
        }

        if (subAction === 'off') {
            db.setting('autoreplyPrivate', false)
            m.react('❌')
            return m.reply(`❌ *ᴀᴜᴛᴏʀᴇᴘʟʏ ᴘʀɪᴠᴀᴅᴏ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot no responderá solo en los chats privados`)
        }

        const currentStatus = db.setting('autoreplyPrivate') ?? false
        return m.reply(
            `📱 *AUTOREPLY PRIVATE*\n\n` +
            `Status: *${currentStatus ? '✅ AKTIF' : '❌ NONAKTIF'}*\n\n` +
            `*PERINTAH TERSEDIA:*\n` +
            `• *${m.prefix}autoreply private on* — Aktifkan private\n` +
            `• *${m.prefix}autoreply private off* — Nonaktifkan private`
        )
    }

    if (action === 'global') {
        if (!m.isOwner) {
            return m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> ¡Solo el dueño puede configurar las respuestas automáticas globales!`)
        }

        const subAction = args[1]?.toLowerCase()
        const globalCustomReplies = db.setting('globalCustomReplies') || []

        if (subAction === 'add') {
            const fullBody = m.body || ''
            const pipeIdx = fullBody.indexOf('|')
            if (pipeIdx === -1) {
                return m.reply(
                    `❌ *ꜰᴏʀᴍᴀᴛ sᴀʟᴀʜ*\n\n` +
                    `> Gunakan format: \`trigger|reply\`\n\n` +
                    `> Contoh:\n` +
                    `> \`${m.prefix}autoreply global add halo|Hai {name}!\``
                )
            }

            const triggerStart = fullBody.toLowerCase().indexOf('global add ') + 'global add '.length
            const triggerEnd = pipeIdx
            const trigger = fullBody.substring(triggerStart, triggerEnd).trim()
            const reply = fullBody.substring(pipeIdx + 1)

            if (!trigger.trim() || !reply) {
                return m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> ¡El disparador y la respuesta no pueden estar vacíos!`)
            }

            const existingIndex = globalCustomReplies.findIndex(r => r.trigger.toLowerCase() === trigger.trim().toLowerCase())
            if (existingIndex !== -1) {
                globalCustomReplies[existingIndex].reply = reply
            } else {
                globalCustomReplies.push({ trigger: trigger.trim().toLowerCase(), reply: reply })
            }

            db.setting('globalCustomReplies', globalCustomReplies)
            await db.save()

            m.react('✅')
            return m.reply(
                `✅ *GLOBAL AUTOREPLY DITAMBAHKAN*\n\n` +
                `• Trigger: *${trigger.trim()}*\n` +
                `• Total: *${globalCustomReplies.length}* replies\n\n` +
                `_Activo en todos los grupos y chats privados_`
            )
        }

        if (subAction === 'del' || subAction === 'rm') {
            const trigger = args.slice(2).join(' ').toLowerCase().trim()
            if (!trigger) {
                return m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> ¡Indica el disparador que quieres borrar!`)
            }

            const index = globalCustomReplies.findIndex(r => r.trigger === trigger)
            if (index === -1) {
                return m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> ¡No se encontró el disparador \`${trigger}\`!`)
            }

            globalCustomReplies.splice(index, 1)
            db.setting('globalCustomReplies', globalCustomReplies)
            await db.save()

            m.react('🗑️')
            return m.reply(`🗑️ *AUTOREPLY GLOBAL ELIMINADO*\n\n¡El disparador *${trigger}* se ha borrado!`)
        }

        if (subAction === 'list' || !subAction) {
            if (globalCustomReplies.length === 0) {
                return m.reply(
                    `📋 *GLOBAL AUTOREPLY*\n\n` +
                    `Status: *❌ TIDAK ADA DATA*\n\n` +
                    `*PERINTAH TERSEDIA:*\n` +
                    `• *${m.prefix}autoreply global add <trigger>|<reply>*`
                )
            }

            let text = `📋 *GLOBAL AUTOREPLY*\n\n`
            text += `Total: *${globalCustomReplies.length}* replies\n`
            text += `Berlaku di: *Semua Grup & Private Chat*\n\n`
            text += `*DAFTAR TRIGGER:*\n`
            globalCustomReplies.forEach((r, i) => {
                const hasImage = r.image ? '🖼️' : ''
                text += `${i + 1}. *${r.trigger}* ${hasImage}\n   ↳ ${r.reply.substring(0, 30)}${r.reply.length > 30 ? '...' : ''}\n\n`
            })
            return m.reply(text.trim())
        }

        return m.reply(
            `📱 *ɢʟᴏʙᴀʟ ᴀᴜᴛᴏʀᴇᴘʟʏ*\n\n` +
            `> \`${m.prefix}autoreply global add trigger|reply\`\n` +
            `> \`${m.prefix}autoreply global del trigger\`\n` +
            `> \`${m.prefix}autoreply global list\``
        )
    }

    if (!m.isGroup) {
        return m.reply(
            `📱 *SISTEM AUTOREPLY*\n\n` +
            `Autoreply Private: *${privateAutoreply ? '✅ AKTIF' : '❌ NONAKTIF'}*\n\n` +
            `*PERINTAH TERSEDIA:*\n` +
            `• *${m.prefix}autoreply private on/off* — Toggle private\n` +
            `• *${m.prefix}autoreply global add/del/list* — Global triggers\n\n` +
            `_Nota: para configurar las respuestas automáticas del grupo, usa este comando dentro del grupo._`
        )
    }

    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> ¡Solo los administradores pueden configurar las respuestas automáticas en el grupo!`)
    }

    const groupData = db.getGroup(m.chat) || {}
    const globalSmartTriggers = db.setting('smartTriggers') ?? config.features?.smartTriggers ?? false

    if (!action || action === 'status') {
        const groupStatus = groupData.autoreply
        const effectiveStatus = groupStatus ?? globalSmartTriggers
        const customReplies = groupData.customReplies || []

        let text = `🤖 *SISTEMA DE AUTOREPLY DEL GRUPO*\n\n`
        text += `Estado global: *${globalSmartTriggers ? '✅ ACTIVO' : '❌ INACTIVO'}*\n`
        text += `Estado de este grupo: *${groupStatus === undefined ? 'POR DEFECTO' : (groupStatus ? '✅ ACTIVO' : '❌ INACTIVO')}*\n`
        text += `Estado en privado: *${privateAutoreply ? '✅ ACTIVO' : '❌ INACTIVO'}*\n`
        text += `Efectivo en el grupo: *${effectiveStatus ? '✅ ACTIVO' : '❌ INACTIVO'}*\n`
        text += `Respuestas personalizadas (grupo): *${customReplies.length}*\n\n`
        text += `*GESTIÓN DEL GRUPO:*\n`
        text += `• *${m.prefix}autoreply on* — Activar en este grupo\n`
        text += `• *${m.prefix}autoreply off* — Desactivar en este grupo\n`
        text += `• *${m.prefix}autoreply add <disparador>|<respuesta>* — Añadir respuesta personalizada\n`
        text += `• *${m.prefix}autoreply del <disparador>* — Borrar respuesta personalizada\n`
        text += `• *${m.prefix}autoreply list* — Ver todos los disparadores de este grupo\n`
        text += `• *${m.prefix}autoreply reset* — Borrar TODAS las personalizaciones de este grupo\n\n`

        if (m.isOwner) {
            text += `*GESTIÓN GLOBAL (DUEÑO):*\n`
            text += `• *${m.prefix}autoreply global add <disparador>|<respuesta>*\n`
            text += `• *${m.prefix}autoreply global del <disparador>*\n`
            text += `• *${m.prefix}autoreply global list* — Disparadores globales activos\n`
            text += `• *${m.prefix}autoreply private on/off* — Activar o desactivar la respuesta del bot en privado\n\n`
        }

        text += `*CÓMO AÑADIR IMÁGENES:*\n`
        text += `1. Envía una imagen con el texto: *${m.prefix}autoreply add disparador|respuesta*\n`
        text += `2. O responde a una imagen con: *${m.prefix}autoreply add disparador|respuesta*\n\n`
        text += `*PUEDES USAR MARCADORES:*\n`
        text += `{name} • {tag} • {sender} • {botname} • {time} • {date}`

        return m.reply(text)
    }

    if (action === 'on') {
        db.setGroup(m.chat, { ...groupData, autoreply: true })
        m.react('✅')
        return m.reply(`✅ *ᴀᴜᴛᴏʀᴇᴘʟʏ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot responderá solo en este grupo`)
    }

    if (action === 'off') {
        db.setGroup(m.chat, { ...groupData, autoreply: false })
        m.react('❌')
        return m.reply(`❌ *ᴀᴜᴛᴏʀᴇᴘʟʏ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot no responderá solo en este grupo`)
    }

    if (action === 'add') {
        const fullBody = m.body || ''
        const pipeIdx = fullBody.indexOf('|')

        if (pipeIdx === -1) {
            return m.reply(
                `❌ *FORMAT SALAH*\n\n` +
                `Gunakan format: *trigger|reply*\n\n` +
                `*Text Only:*\n` +
                `• ${m.prefix}ar add halo|Hai {name}! 👋\n\n` +
                `*Dengan Gambar:*\n` +
                `1. Reply gambar + ${m.prefix}ar add trigger|caption\n` +
                `2. Kirim gambar + caption ${m.prefix}ar add trigger|caption\n\n` +
                `*Placeholder:*\n` +
                `• {name} - Nama user\n` +
                `• {tag} - Tag @user\n` +
                `• {sender} - Nomor user\n` +
                `• {botname} - Nama bot\n` +
                `• {time} - Waktu sekarang\n` +
                `• {date} - Tanggal sekarang`
            )
        }

        const addIdx = fullBody.toLowerCase().indexOf('add ')
        const triggerStart = addIdx + 'add '.length
        const trigger = fullBody.substring(triggerStart, pipeIdx).trim()
        const reply = fullBody.substring(pipeIdx + 1)

        if (!trigger) {
            return m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> ¡El disparador no puede estar vacío!`)
        }

        let imageBuffer = null
        let imagePath = null

        const hasQuotedImage = m.quoted && (m.quoted.mtype === 'imageMessage' || m.quoted.type === 'image')
        const hasDirectImage = m.mtype === 'imageMessage' || m.type === 'image'

        if (hasQuotedImage) {
            try {
                imageBuffer = await m.quoted.download()
            } catch (e) {
                console.error('[Autoreply] Failed to download quoted image:', e.message)
            }
        } else if (hasDirectImage) {
            try {
                imageBuffer = await m.download()
            } catch (e) {
                console.error('[Autoreply] Failed to download direct image:', e.message)
            }
        }

        if (imageBuffer) {
            const filename = `${m.chat.replace('@g.us', '')}_${trigger.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`
            imagePath = path.join(AUTOREPLY_MEDIA_DIR, filename)
            fs.writeFileSync(imagePath, imageBuffer)
        }

        const customReplies = groupData.customReplies || []
        const existingIndex = customReplies.findIndex(r => r.trigger.toLowerCase() === trigger.toLowerCase())

        const replyData = {
            trigger: trigger.toLowerCase(),
            reply: reply || '',
            image: imagePath || null,
            createdAt: Date.now()
        }

        if (existingIndex !== -1) {
            if (customReplies[existingIndex].image && customReplies[existingIndex].image !== imagePath) {
                try {
                    if (fs.existsSync(customReplies[existingIndex].image)) {
                        fs.unlinkSync(customReplies[existingIndex].image)
                    }
                } catch {}
            }
            customReplies[existingIndex] = replyData
        } else {
            customReplies.push(replyData)
        }

        db.setGroup(m.chat, { ...groupData, customReplies })

        m.react('✅')

        let successMsg = `✅ *AUTOREPLY DITAMBAHKAN*\n\n`
        successMsg += `*DETAIL:*\n`
        successMsg += `• Trigger: *${trigger.trim()}*\n`
        if (reply) {
            successMsg += `• Reply: ${reply.substring(0, 50)}${reply.length > 50 ? '...' : ''}\n`
        }
        if (imagePath) {
            successMsg += `• Image: ✅ Tersimpan\n`
        }
        successMsg += `\nTotal: *${customReplies.length}* respuestas en este grupo`

        return m.reply(successMsg)
    }

    if (action === 'del' || action === 'rm' || action === 'remove') {
        const trigger = args.slice(1).join(' ').toLowerCase().trim()

        if (!trigger) {
            return m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> ¡Indica el disparador que quieres borrar!\n\n\`${m.prefix}autoreply del hola\``)
        }

        const customReplies = groupData.customReplies || []
        const index = customReplies.findIndex(r => r.trigger === trigger)

        if (index === -1) {
            return m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> ¡No se encontró el disparador \`${trigger}\`!`)
        }

        if (customReplies[index].image) {
            try {
                if (fs.existsSync(customReplies[index].image)) {
                    fs.unlinkSync(customReplies[index].image)
                }
            } catch {}
        }

        customReplies.splice(index, 1)
        db.setGroup(m.chat, { ...groupData, customReplies })

        m.react('🗑️')
        return m.reply(
            `🗑️ *AUTOREPLY BORRADO*\n\n` +
            `¡El disparador *${trigger}* se ha borrado!\n` +
            `Quedan: *${customReplies.length}* respuestas`
        )
    }

    if (action === 'list') {
        const customReplies = groupData.customReplies || []

        const defaultTriggers = [
            { trigger: '@mention', reply: '👋 ¡Hola! ¿Alguien llamó al bot?' },
            { trigger: 'p', reply: '💬 ¡Saluda antes de empezar a hablar!' },
            { trigger: 'bot / elysia', reply: '🤖 ¡Bot activo y listo!' },
            { trigger: 'assalamualaikum', reply: 'Waalaikumsalam, hermano' }
        ]

        let text = `📋 *LISTA DE AUTOREPLY DEL GRUPO*\n\n`

        text += `*DISPARADORES POR DEFECTO:*\n`
        defaultTriggers.forEach((r, i) => {
            text += `• *${r.trigger}*\n`
            text += `  ↳ ${r.reply}\n`
        })
        text += `\n`

        if (customReplies.length > 0) {
            text += `*CUSTOM TRIGGERS:*\n`
            customReplies.forEach((r, i) => {
                const hasImage = r.image ? '🖼️' : ''
                text += `• *${r.trigger}* ${hasImage}\n`
                if (r.reply) {
                    text += `  ↳ ${r.reply.substring(0, 35)}${r.reply.length > 35 ? '...' : ''}\n`
                }
            })
            text += `\n`
        } else {
            text += `*CUSTOM TRIGGERS:*\n`
            text += `_Todavía no hay disparadores personalizados en este grupo_\n\n`
        }

        text += `_Nota: los disparadores por defecto del bot no se pueden editar._`

        return m.reply(text)
    }

    if (action === 'reset' || action === 'clear') {
        const customReplies = groupData.customReplies || []
        for (const r of customReplies) {
            if (r.image) {
                try {
                    if (fs.existsSync(r.image)) fs.unlinkSync(r.image)
                } catch {}
            }
        }

        db.setGroup(m.chat, { ...groupData, customReplies: [] })
        m.react('🗑️')
        return m.reply(`🗑️ *ᴀᴜᴛᴏʀᴇᴘʟʏ ᴅɪʀᴇsᴇᴛ*\n\n> Semua autoreply custom dihapus!`)
    }

    return m.reply(`❌ *ᴀᴄᴛɪᴏɴ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n> Gunakan: \`on\`, \`off\`, \`private on/off\`, \`add\`, \`del\`, \`list\`, \`reset\``)
}

export { pluginConfig as config, handler }
