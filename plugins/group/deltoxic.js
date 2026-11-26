/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
const pluginConfig = {
    name: 'deltoxic',
    alias: ['hapustoxic', 'remtoxic', 'removetoxic'],
    category: 'group',
    description: 'Hapus kata toxic dari daftar',
    usage: '.deltoxic <kata>',
    example: '.deltoxic kata_kasar',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const word = m.args.join(' ').trim().toLowerCase()

    if (!word) {
        return m.reply(
            `🗑️ *DEL TÓXICO*\n\n` +
            `> Usa: \`.deltoxic <palabra>\`\n\n` +
            `\`Ejemplo: ${m.prefix}deltoxic katakasar\``
        )
    }

    const groupData = db.getGroup(m.chat) || {}
    const toxicWords = groupData.toxicWords || []

    const index = toxicWords.indexOf(word)

    if (index === -1) {
        return m.reply(`❌ *FALLIDO*\n\n> La palabra \`${word}\` no está en la lista`)
    }

    toxicWords.splice(index, 1)
    db.setGroup(m.chat, { toxicWords })

    m.react('✅')

    await m.reply(
        `✅ *PALABRA TÓXICA ELIMINADA*\n\n` +
        `╭┈┈⬡「 📋 *DETALLE* 」\n` +
        `┃ 📝 PALABRA: \`${word}\`\n` +
        `┃ 📊 RESTANTE: \`${toxicWords.length}\` palabras\n` +
        `╰┈┈⬡`
    )
}

export { pluginConfig as config, handler }
