/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from '../../config.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'ptvch',
    alias: ['ptvchanel', 'ptvstory'],
    category: 'owner',
    description: 'Kirim video sebagai PTV ke channel',
    usage: '.ptvch (reply video)',
    example: '.ptvch',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let video = null

    if (m.quoted && m.quoted.isVideo) {
        try {
            video = await m.quoted.download()
        } catch (e) {
            return m.reply(`❌ No se pudo descargar el vídeo del mensaje respondido.`)
        }
    } else if (m.isVideo) {
        try {
            video = await m.download()
        } catch (e) {
            return m.reply(`❌ No se pudo descargar el vídeo.`)
        }
    }

    if (!video) {
        return m.reply(
            `⚠️ *CÓMO USAR*\n\n` +
            `> Envía un *vídeo* o *responde a un vídeo* y escribe:\n` +
            `> \`${m.prefix}ptvch\``
        )
    }

    const channelId = config.saluran?.id || '120363393471527483@newsletter'

    await m.reply(`🕕 *ENVIANDO PTV AL CANAL...*`)

    try {
        await sock.sendMessage(channelId, {
            video: video,
            mimetype: 'video/mp4',
            gifPlayback: true,
            ptv: true
        })

        await m.react('✅')
        return m.reply(`✅ *ÉXITO*\n\n > El vídeo se envió al canal como PTV.`)

    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
