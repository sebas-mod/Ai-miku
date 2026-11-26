/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: ['buatgrup', 'creategroup', 'newgroup'],
    alias: [],
    category: 'owner',
    description: 'Buat grup baru',
    usage: '.buatgrup <nama>|<nomor1,nomor2,...>|<durasi_menit>',
    example: '.buatgrup Grup Baru|628xxx,628yyy|60',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text?.trim() || ''
    const args = text.split('|')

    if (args.length < 2) {
        let txt = `👥 *BUAT GRUP BARU* 👥\n\n`
        txt += `¡Hola, Owner! ¿Quieres crear un grupo nuevo al instante?\n\n`
        txt += `*Cómo usar:*\n`
        txt += `👉 \`${m.prefix}buatgrup Nombre del grupo | 628xxx,628yyy | Duración(minutos)\`\n\n`
        txt += `*Detail:*\n`
        txt += `• Usa \`|\` para separar el nombre, los participantes y la duración\n`
        txt += `• Separa los números de los participantes con comas\n`
        txt += `• Si indicas una duración, ¡el bot expulsará a todos los miembros y eliminará el grupo cuando acabe el tiempo!\n`
        txt += `• Bot otomatis menjadi admin\n\n`
        txt += `*Ejemplo sin duración:*\n`
        txt += `\`${m.prefix}buatgrup Tim Alpha | 628123,628456\`\n\n`
        txt += `*Ejemplo con duración (activo 60 minutos):*\n`
        txt += `\`${m.prefix}buatgrup Tim Beta | 628123,628456 | 60\``
        return m.reply(txt)
    }

    const name = args[0].trim()
    const participantsStr = args[1].trim()
    const durationStr = args[2] ? args[2].trim() : ''

    if (!name || name.length < 2) {
        return m.reply('❌ El nombre del grupo es demasiado corto. Mínimo 2 caracteres.')
    }

    const participants = participantsStr
        .split(/[,;\s]+/)
        .map(n => n.replace(/[^0-9]/g, ''))
        .filter(n => n.length >= 5)
        .map(n => n + '@s.whatsapp.net')

    if (participants.length === 0) {
        return m.reply('❌ Faltan los números de los participantes. Indica al menos 1.')
    }

    let durationMs = 0
    let durationMins = 0
    if (durationStr) {
        durationMins = parseInt(durationStr.replace(/[^0-9]/g, ''))
        if (!isNaN(durationMins) && durationMins > 0) {
            durationMs = durationMins * 60 * 1000
        }
    }

    try {
        await m.react('🕕')
        const group = await sock.groupCreate(name, participants)

        let successTxt = `👥 *GRUPO CREADO* 👥\n\n`
        successTxt += `✨ *Nombre:* ${name}\n`
        successTxt += `🆔 *ID:* ${group.id}\n`
        successTxt += `👤 *Peserta:* ${participants.length} orang\n`

        if (durationMs > 0) {
            successTxt += `⏳ *Masa Aktif:* ${durationMins} Menit\n`
            successTxt += `\n⚠️ _Este grupo se eliminará automáticamente y todos los miembros serán expulsados cuando acabe el tiempo._\n`
        }

        successTxt += `\n_El bot se convirtió automáticamente en administrador del grupo._`
        await m.reply(successTxt)

        if (durationMs > 0) {
            setTimeout(async () => {
                try {
                    const groupMeta = await sock.groupMetadata(group.id)
                    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'

                    const membersToKick = groupMeta.participants
                        .map(p => p.id)
                        .filter(id => id !== botJid)

                    if (membersToKick.length > 0) {
                        await sock.sendMessage(group.id, { text: `⏳ *TIEMPO DEL GRUPO AGOTADO* ⏳\n\nComo ordenó el Owner, el tiempo de este grupo ha terminado. ¡Adiós a todos! 👋` })
                        await sock.groupParticipantsUpdate(group.id, membersToKick, 'remove')
                    }

                    await sock.groupLeave(group.id)
                } catch (e) {
                    console.log(`Gagal menghapus grup otomatis (${group.id}):`, e)
                }
            }, durationMs)
        }

        await m.react('✅')
    } catch (err) {
        await m.react('❌')
        return m.reply(`❌ Lo siento, ¡no se pudo crear el grupo! 😭\nError: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
