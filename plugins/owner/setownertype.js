/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from '../../config.js'
import { getDatabase } from '../../src/lib/data/database.js'
import fs from 'fs'
import path from 'path'
const pluginConfig = {
    name: 'setownertype',
    alias: ['ownertype', 'ownervariant', 'ownerstyle'],
    category: 'owner',
    description: 'Mengatur variant tampilan owner message',
    usage: '.setownertype',
    example: '.setownertype',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const VARIANTS = {
    1: { name: 'Current Design', desc: 'Diseño actual por defecto' },
    2: { name: 'Multiple Contact', desc: 'Envía la tarjeta de contacto de todos los owners' }
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const variant = args[0]?.toLowerCase()
    const current = db.setting('ownerType') || 1

    if (variant && /^v?[1-3]$/.test(variant)) {
        const id = parseInt(variant.replace('v', ''))
        db.setting('ownerType', id)
        await db.save()

        await m.reply(
            `✅ Tipo de owner cambiado a *V${id}*\n\n` +
            `> *${VARIANTS[id].name}*\n` +
            `> _${VARIANTS[id].desc}_`
        )
        return
    }

    const buttons = []
    for (const [id, val] of Object.entries(VARIANTS)) {
        const mark = parseInt(id) === current ? ' ✓' : ''
        buttons.push({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: `V${id}${mark} - ${val.name}`,
                id: `${m.prefix}setownertype v${id}`
            })
        })
    }

    await sock.sendMessage(m.chat, {
        text: `🎨 *TIPO DE OWNER*\n\n > Tipo actual: *V${current}*\n> _${VARIANTS[current].name}_\n\n > Elige la variante de owner:`,
        footer: config.bot?.name || 'Ai Miku',
        contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999
        },
        interactiveButtons: buttons
    }, { quoted: m })
}

export { pluginConfig as config, handler }
