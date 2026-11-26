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
    description: 'Menampilkan daftar kontributor & kreator Elysia Assistant',
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
        { name: ownerName, role: 'Owner & Architect', icon: '👑' },
        { name: '@rexxhayanasi/elaina-baileys', role: 'WhatsApp Baileys', icon: '⚙️' },
        { name: 'YannRzy', role: 'Creator / Dev KaguyaMD', icon: '👾' },
        { name: 'Zanspiw', role: 'Script Reviewer & YouTuber', icon: '👾' },
        { name: 'All Users & Supporters', role: 'Community', icon: '💖' },
    ]

    const contentText = [
        `—–·「 💐 *SPECIAL THANKS TO* 」·–—`,
        `   ✧ Bot Name  : *${botName}*`,
        `   ✧ Architect : *${ownerName}*`,
        `   ✧ Version   : v${version}`,
    ].join('\n')

    const footerText = [
        `—–·「 🌟 *KONTRIBUTOR* 」·–—`,
        ...credits.map((c) => `   ✧ ${c.icon} *${c.name}* — _${c.role}_`),
        ``,
        ` Enjoy the bot's features`,
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
            .addSelection('✨ Pilih Menu')
            .makeSection('list menu')
            .makeRow('', '📋 All Menu', 'Lihat semua daftar fitur bot', `${p}allmenu`)
            .makeRow('', '👤 Profile', 'Lihat kartu profil kamu', `${p}profile`)
            .makeRow('', '👑 Owner', 'Hubungi pemilik bot', `${p}owner`)

        await btn.send(m.chat, { quoted: m.raw || m })
    } catch {
        await m.reply(`${contentText}\n\n${footerText}`)
    }
}

export { pluginConfig as config, handler }
