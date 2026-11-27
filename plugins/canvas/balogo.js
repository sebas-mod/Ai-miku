/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from 'axios'
import { f } from '../../src/lib/core/http.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'balogo',
    alias: ['bluearchivelogo', 'ba'],
    category: 'canvas',
    description: 'Membuat logo Blue Archive style',
    usage: '.balogo <textL> & <textR>',
    example: '.balogo Blue & Archive',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const input = m.text?.trim() || ''
    const parts = input.split(/[&,]/).map(s => s.trim()).filter(s => s)

    if (parts.length < 2) {
        return m.reply(`🎮 *BLUE ARCHIVE LOGO*\n\n> Ingrese 2 texto para el logotipo\n\n> Ejemplo: ${m.prefix}balogo Azul y Archivo`)
    }

    const textL = parts[0]
    const textR = parts[1]

    m.react('🕕')

    try {
        const apiUrl = `https://api.nexray.web.id/maker/balogo?text=${encodeURIComponent(textL)} ${encodeURIComponent(textR)}`
        const response = await f(apiUrl, 'arrayBuffer')

        await sock.sendMedia(m.chat, Buffer.from(response), null, m, {
            type: 'image',
        })

        m.react('✅')

    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
