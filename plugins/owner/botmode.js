/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from '../../config.js'
import { getDatabase } from '../../src/lib/data/database.js'

const pluginConfig = {
    name: 'botmode',
    alias: ['setmode', 'mode'],
    category: 'owner',
    description: 'Mengatur mode bot (md/store/pushkontak/all)',
    usage: '.botmode <mode>',
    example: '.botmode store',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const VALID_MODES = ['md', 'store', 'pushkontak', 'otp', 'all']

const MODE_DESCRIPTIONS = {
    md: 'Modo por defecto, todas las funciones salvo panel/store/pushkontak',
    store: 'Mode store manual, main + group + sticker + owner + store',
    pushkontak: 'Mode pushkontak, main + group + sticker + owner + pushkontak',
    otp: 'Mode OTP service, main + group + sticker + owner + otp',
    all: 'Modo completo, TODAS las funciones de todos los modos están disponibles'
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []

    let mode = (args[0] || '').toLowerCase()
    const flags = args.slice(1).map(f => f.toLowerCase())
    const globalMode = db.setting('botMode') || 'all'
    const groupData = m.isGroup ? (db.getGroup(m.chat) || {}) : {}
    const groupMode = groupData.botMode || null

    if (!mode) {
        let txt = `╭┈┈⬡「 🤖 *MODO DEL BOT* 」\n`
        txt += `┃ ㊗ ɢʟᴏʙᴀʟ: *${globalMode.toUpperCase()}*\n`

        if (m.isGroup) {
            txt += `┃ ㊗ ɢʀᴜᴘ: *${(groupMode || 'INHERIT').toUpperCase()}*\n`
        }
        txt += `╰┈┈⬡\n\n`

        txt += `╭┈┈⬡「 📋 *MODOS DISPONIBLES* 」\n`

        const currentMode = m.isGroup ? (groupMode || globalMode) : globalMode

        for (const [key, desc] of Object.entries(MODE_DESCRIPTIONS)) {
            const isActive = key === currentMode ? ' ✅' : ''
            txt += `┃ ㊗ *${key.toUpperCase()}*${isActive}\n`
            txt += `┃   ${desc}\n`
        }
        txt += `╰┈┈⬡\n\n`

        txt += `*FLAG STORE:*\n`
        txt += `> \`${m.prefix}botmode store\` - Manual order\n`
        txt += `> \`${m.prefix}botmode md\` → Mode default\n`
        txt += `> \`${m.prefix}botmode all\` → Todas las funciones`

        await m.reply(txt)
        return
    }

    if (!VALID_MODES.includes(mode)) {
        return m.reply(
            `❌ *MODO NO VÁLIDO*\n\n` +
            `> Modos disponibles: \`${VALID_MODES.join(', ')}\``
        )
    }

    if (m.isGroup) {
        const newGroupData = {
            ...groupData,
            botMode: mode
        }

        if (mode === 'store') {
            newGroupData.storeConfig = {
                ...(groupData.storeConfig || {}),
                products: groupData.storeConfig?.products || []
            }
        }

        db.setGroup(m.chat, newGroupData)
    } else {
        db.setting('botMode', mode)
    }

    db.save()
    await m.react('✅')

    let extraInfo = ''
    if (mode === 'store' && m.isGroup) {
        extraInfo = `\n\n📋 *Modo manual*\n> El admin debe confirmar el pedido manualmente`
    }

    await m.reply(
        `✅ *MODO CAMBIADO*\n\n` +
        `> Mode: *${mode.toUpperCase()}*\n` +
        `> ${MODE_DESCRIPTIONS[mode]}\n` +
        extraInfo +
        `\n\n` +
        (m.isGroup ? `> _El modo de este grupo también cambió._` : `> _El modo global cambió._`)
    )

    console.log(`[BotMode] Changed to ${mode.toUpperCase()} by ${m.pushName} (${m.sender})`)
}

export { pluginConfig as config, handler, VALID_MODES, MODE_DESCRIPTIONS }
