/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getAllPlugins } from '../../src/lib/core/plugins.js'
import config from '../../config.js'
import te from '../../src/lib/core/error.js'

const pluginConfig = {
    name: 'totalfitur',
    alias: ['totalfeature', 'totalcmd', 'countplugin', 'distribusi'],
    category: 'main',
    description: 'Ver el total de funciones/comandos del bot',
    usage: '.totalfitur',
    example: '.totalfitur',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const ICONS = {
    main: '🏠', tools: '🔧', downloader: '📥', download: '📥', sticker: '🎨',
    ai: '🤖', media: '📷', game: '🎮', maker: '🖼️', fun: '🎭',
    group: '👥', owner: '👑', premium: '💎', info: '📊', search: '🔍',
    canvas: '🎨', anime: '🌸', nsfw: '🔞', utility: '🛠️', economy: '💰',
    stalker: '🔎', random: '🎲', religi: '🕌', islamic: '☪️', cek: '✅',
    store: '🛒', panel: '🖥️', convert: '🔄', primbon: '🔮', tts: '🗣️',
    otp: '🔑', vps: '☁️', pushkontak: '📱', jpm: '🎰', ephoto: '📸',
    other: '📦'
}

async function handler(m, { sock }) {
    try {
        const allPlugins = getAllPlugins()
        const cats = {}
        let total = 0, enabled = 0

        for (const p of allPlugins) {
            if (!p.config) continue
            const cat = p.config.category || 'other'
            if (!cats[cat]) cats[cat] = { total: 0, enabled: 0 }
            cats[cat].total++
            total++
            if (p.config.isEnabled !== false) {
                cats[cat].enabled++
                enabled++
            }
        }

        await m.react('📊')

        const sorted = Object.entries(cats).sort((a, b) => b[1].total - a[1].total)

        let text = `📊 *DISTRIBUCIÓN DE FUNCIONES*\n\n`
        text += `╭┈┈⬡「 📈 *RESUMEN* 」\n`
        text += `┃ • Total funciones : *${total}*\n`
        text += `┃ • Funciones activas : *${enabled}*\n`
        text += `┃ • Categorías      : *${sorted.length}*\n`
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        text += `╭┈┈⬡「 📂 *DETALLE POR CATEGORÍA* 」\n`

        for (const [cat, data] of sorted) {
            const pct = total > 0 ? ((data.total / total) * 100).toFixed(1) : '0.0'
            const icon = ICONS[cat.toLowerCase()] || '📦'
            text += `┃ ${icon} *${cat.toUpperCase()}* : ${data.total} (${pct}%)\n`
        }

        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        text += `> _${config.bot?.name || 'Elysia Assistant'}_`

        await m.reply(text)

    } catch (error) {
        console.error('[TotalFitur Error]', error)
        await m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
