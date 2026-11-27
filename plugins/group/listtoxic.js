/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import { DEFAULT_TOXIC_WORDS } from './antitoxic.js'
const pluginConfig = {
    name: 'listtoxic',
    alias: ['toxiclist', 'katatoxic', 'lihatkata'],
    category: 'group',
    description: 'Lihat daftar kata toxic',
    usage: '.listtoxic',
    example: '.listtoxic',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}

    const customWords = groupData.toxicWords || []
    const defaultWords = DEFAULT_TOXIC_WORDS || []

    let text = `📋 *LISTA DE PALABRAS TÓXICAS*\n\n`

    if (customWords.length > 0) {
        text += `╭┈┈⬡「 ✏️ *PERSONALIZADO* (${customWords.length}) 」\n`
        for (let i = 0; i < customWords.length; i++) {
            text += `┃ ${i + 1}. ${customWords[i]}\n`
        }
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    }

    text += `╭┈┈⬡「 📦 *PREDETERMINADO* (${defaultWords.length}) 」\n`

    for (let i = 0; i < defaultWords.length; i++) {
        text += `┃ ${i + 1}. ${defaultWords[i]}\n`
    }
    text += `╰┈┈┈┈┈┈┈┈⬡\n\n`

    text += `Total: *${customWords.length + defaultWords.length}* palabras\n`
    text += `\`.addtoxic <palabra>\` para añadir\n`
    text += `\`.deltoxic <palabra>\` para eliminar`

    await m.reply(text)
}

export { pluginConfig as config, handler }
