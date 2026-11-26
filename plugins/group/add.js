/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'add',
    alias: ['addmember', 'invite'],
    category: 'group',
    description: 'Añade miembros al grupo (admite varios a la vez)',
    usage: '.add <nomor1> [nomor2] [nomor3]... [link_grup]',
    example: '.add 6281234567890 6281234567890',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    const args = m.args || []

    if (args.length === 0) {
        return m.reply(
            `👥 *AÑADIR MIEMBRO*\n\n` +
            `> Cómo usar:\n` +
            `> 1. En el grupo: \`${m.prefix}add <número>\`\n` +
            `> 2. Multiple: \`${m.prefix}add <nomor1> <nomor2> ...\`\n` +
            `> 3. En privado: \`${m.prefix}add <número> <enlace_grupo>\`\n\n` +
            `> Ejemplo:\n` +
            `> \`${m.prefix}add 6281234567890\`\n` +
            `> \`${m.prefix}add 628123 628456 628789\`\n` +
            `> \`${m.prefix}add 628123 https://chat.whatsapp.com/xxx\`\n\n` +
            `> Requisitos:\n` +
            `> - El bot debe ser admin en el grupo de destino\n` +
            `> - Quien ejecute el comando debe ser admin`
        )
    }

    let targetGroup = m.isGroup ? m.chat : null
    let targetNumbers = []

    for (const arg of args) {
        const linkMatch = arg.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/)
        if (linkMatch) {
            try {
                const groupInfo = await sock.groupGetInviteInfo(linkMatch[1])
                targetGroup = groupInfo.id
            } catch (e) {
                return m.reply(`❌ *FALLIDO*\n\n> ¡El enlace del grupo no es válido o ya caducó!`)
            }
        } else if (arg.includes('@g.us')) {
            targetGroup = arg
        } else {
            let num = arg.replace(/[^0-9]/g, '')
            if (num.startsWith('0')) {
                num = '62' + num.slice(1)
            }
            if (num.length >= 10) {
                targetNumbers.push(num)
            }
        }
    }

    if (targetNumbers.length === 0) {
        return m.reply(`❌ *FALLIDO*\n\n> ¡Introduce un número válido!`)
    }

    if (!targetGroup) {
        return m.reply(`❌ *FALLIDO*\n\n> ¡Ejecútalo en el grupo o incluye el enlace del grupo!\n\n\`${m.prefix}add <número> <enlace_grupo>\``)
    }

    try {
        const groupMeta = await sock.groupMetadata(targetGroup)
        const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
        const botParticipant = groupMeta.participants.find(p =>
            p.id === botId || p.jid === botId || p.id?.includes(sock.user?.id?.split(':')[0])
        )

        if (!botParticipant || !['admin', 'superadmin'].includes(botParticipant.admin)) {
            return m.reply(`❌ *FALLIDO*\n\n> ¡El bot no es admin en el grupo *${groupMeta.subject}*!`)
        }

        if (!m.isGroup) {
            const senderId = m.sender?.split('@')[0]
            const senderParticipant = groupMeta.participants.find(p =>
                p.id?.includes(senderId) || p.jid?.includes(senderId)
            )

            if (!senderParticipant || !['admin', 'superadmin'].includes(senderParticipant.admin)) {
                return m.reply(`❌ *FALLIDO*\n\n> ¡No eres admin en el grupo *${groupMeta.subject}*!`)
            }
        }

        const validNumbers = []
        const alreadyInGroup = []

        for (const num of targetNumbers) {
            const existingMember = groupMeta.participants.find(p =>
                p.id?.includes(num) || p.jid?.includes(num)
            )

            if (existingMember) {
                alreadyInGroup.push(num)
            } else {
                validNumbers.push(num + '@s.whatsapp.net')
            }
        }

        if (validNumbers.length === 0) {
            return m.reply(`❌ *FALLIDO*\n\n> ¡Todos esos números ya están en el grupo!`)
        }

        m.react('🕕')

        const results = await sock.groupParticipantsUpdate(targetGroup, validNumbers, 'add')

        let successList = []
        let invitedList = []
        let failedList = []

        for (const res of results) {
            const num = res.content?.attrs?.phone_number?.replace('@s.whatsapp.net', '') || ''

            if (res.status === '200') {
                successList.push(num)
            } else if (res.status === '408') {
                invitedList.push(num)
            } else {
                failedList.push({ num, status: res.status })
            }
        }

        let resultText = `🥗 @${m.sender.split('@')[0]} ha añadido miembros al grupo\n\n`

        if (successList.length > 0) {
            resultText += `Se añadieron *${successList.length}* miembros correctamente:\n`
            successList.forEach(n => resultText += `• @${n}\n`)
            resultText += `\n`
        }

        if (invitedList.length > 0) {
            resultText += `📨 *Y también se invitó a ${invitedList.length} miembros:*\n`
            invitedList.forEach(n => resultText += `• @${n}\n`)
            resultText += `\n`
        }

        if (failedList.length > 0) {
            resultText += `❌ *FALLIDOS (${failedList.length}):*\n`
            failedList.forEach(f => resultText += `• @${f.num} (${f.status})\n`)
            resultText += `\n`
        }

        if (alreadyInGroup.length > 0) {
            resultText += `⏭️ *YA EN GRUPO (${alreadyInGroup.length}):*\n`
            alreadyInGroup.forEach(n => resultText += `• @${n}\n`)
        }

        m.react(successList.length > 0 || invitedList.length > 0 ? '✅' : '❌')
        await m.reply(resultText, { mentions: [ ...successList.map(n => n + '@s.whatsapp.net'), ...invitedList.map(n => n + '@s.whatsapp.net'), ...failedList.map(f => f.num + '@s.whatsapp.net'), ...alreadyInGroup.map(n => n + '@s.whatsapp.net'), m.sender ] })

    } catch (error) {
        m.react('❌')

        if (error.message?.includes('not-authorized')) {
            await m.reply(`❌ *FALLIDO*\n\n> ¡El bot no tiene permiso para añadir miembros!`)
        } else if (error.message?.includes('forbidden')) {
            await m.reply(`❌ *FALLIDO*\n\n> ¡El bot no tiene acceso a este grupo!`)
        } else {
            m.reply(te(m.prefix, m.command, m.pushName))
        }
    }
}

export { pluginConfig as config, handler }
