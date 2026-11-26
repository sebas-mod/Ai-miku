/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from 'axios'
import config from '../../config.js'
import { Button } from '../../src/lib/core/builder.js'

const TQTO_THUMB_URL = 'https://cdn.zass.in/LBvSfeCjtZ.jpeg'

const pluginConfig = {
    name: 'tqto',
    alias: ['thanksto', 'thanks', 'credits', 'kredit'],
    category: 'main',
    description: 'Muestra la lista de colaboradores y creadores de Elysia Assistant',
    usage: '.tqto',
    example: '.tqto',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, prefix }) {
    const p = prefix || m.prefix || '.'
    const botName = config.bot?.name || 'Elysia Assistant'
    const ownerName = config.owner?.name || 'Arthazy'
    const version = config.bot?.version || '2.0'

    const credits = [
        { name: ownerName, role: 'Dueño y arquitecto', icon: '👑' },
        { name: '@rexxhayanasi/elaina-baileys', role: 'WhatsApp Baileys', icon: '⚙️' },
        { name: 'YannRzy', role: 'Creador / Dev de KaguyaMD', icon: '👾' },
        { name: 'Zanspiw', role: 'Revisor del script y YouTuber', icon: '👾' },
        { name: 'Todos los usuarios y seguidores', role: 'Comunidad', icon: '💖' },
    ]

    const contentText = [
        `—–·「 💐 *AGRADECIMIENTOS ESPECIALES* 」·–—`,
        `   ✧ Nombre-Bot : *${botName}*`,
        `   ✧ Arquitecto  : *${ownerName}*`,
        `   ✧ Versión     : v${version}`,
    ].join('\n')

    const footerText = [
        `—–·「 🌟 *COLABORADORES* 」·–—`,
        ...credits.map((c) => `   ✧ ${c.icon} *${c.name}* — _${c.role}_`),
        ``,
        ` Disfruta de las funciones del bot`,
    ].join('\n')

    const tqtoThumb = await axios
        .get(TQTO_THUMB_URL, { responseType: 'arraybuffer', timeout: 10000 })
        .then((r) => Buffer.from(r.data))
        .catch(() => null)

    const contextInfo = {
        ...(m.sender ? { mentionedJid: [m.sender] } : {}),
        forwardingScore: 777,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: config.saluran?.id || '120363393471527483@newsletter',
            newsletterName: config.saluran?.name || botName,
            serverMessageId: 127,
        },
    }

    try {
        const btn = new Button(sock)
            .setImage(tqtoThumb || TQTO_THUMB_URL)
            .setBody(contentText)
            .setFooter(footerText)
            .setContextInfo(contextInfo)
            .addSelection('✨ Elegir menú')
            .makeSection('lista de menús')
            .makeRow('', '📋 All Menu', 'Ver la lista completa de funciones del bot', `${p}allmenu`)
            .makeRow('', '👤 Perfil', 'Ver tu tarjeta de perfil', `${p}profile`)
            .makeRow('', '👑 Dueño', 'Contactar al dueño del bot', `${p}owner`)

        await btn.send(m.chat, { quoted: m.raw || m })
    } catch {
        await m.reply(`${contentText}\n\n${footerText}`)
    }
}

export { pluginConfig as config, handler }
