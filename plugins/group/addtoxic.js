/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
const pluginConfig = {
    name: 'addtoxic',
    alias: ['tambahtoxic', 'addkata'],
    category: 'group',
    description: 'Tambah kata toxic ke daftar',
    usage: '.addtoxic <kata>',
    example: '.addtoxic kata_kasar',
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
            `📝 *AÑADIR TÓXICO*\n\n` +
            `> Usa: \`.addtoxic <palabra>\`\n\n` +
            `\`Ejemplo: ${m.prefix}addtoxic katakasar\``
        )
    }

    if (word.length < 2) {
        return m.reply(`❌ *FALLIDO*\n\n> La palabra es demasiado corta (mín. 2 letras)`)
    }

    if (word.length > 30) {
        return m.reply(`❌ *FALLIDO*\n\n> La palabra es demasiado larga (máx. 30 letras)`)
    }

    const groupData = db.getGroup(m.chat) || {}
    const toxicWords = groupData.toxicWords || []

    if (toxicWords.includes(word)) {
        return m.reply(`❌ *FALLIDO*\n\n> La palabra \`${word}\` ya está en la lista`)
    }

    toxicWords.push(word)
    db.setGroup(m.chat, { toxicWords })

    m.react('✅')

    await m.reply(
        `✅ *PALABRA TÓXICA AÑADIDA*\n\n` +
        `╭┈┈⬡「 📋 *DETALLE* 」\n` +
        `┃ 📝 PALABRA: \`${word}\`\n` +
        `┃ 📊 TOTAL: \`${toxicWords.length}\` palabras\n` +
        `╰┈┈⬡`
    )
}

export { pluginConfig as config, handler }
