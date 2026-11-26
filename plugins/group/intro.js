/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
import config from '../../config.js'
import moment from 'moment-timezone'
const pluginConfig = {
    name: 'intro',
    alias: ['perkenalan', 'selamatdatang'],
    category: 'group',
    description: 'Tampilkan pesan intro grup',
    usage: '.intro',
    example: '.intro',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const DEFAULT_INTRO = `hola @user 🖐

Preséntate un poco
- Nombre :
- Edad :
- Origen :
- Aficiones :
- Estado :

Espero que estés a gusto en el grupo @group

> Para el propietario:
cambia la presentación con .setintro <texto>`
 function parsePlaceholders(text, m, groupMeta) {
    const now = moment().tz('Asia/Jakarta')
    const dateStr = now.format('D MMMM YYYY')
    const timeStr = now.format('HH:mm')

    return text
        .replace(/@user/gi, `@${m.sender.split('@')[0]}`)
        .replace(/@group/gi, groupMeta?.subject || 'Grupo')
        .replace(/@count/gi, groupMeta?.participants?.length || '0')
        .replace(/@date/gi, dateStr)
        .replace(/@time/gi, timeStr)
        .replace(/@desc/gi, groupMeta?.desc || 'Sin descripción')
        .replace(/@botname/gi, config.bot?.name || 'Ai Miku')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    const groupMeta = m.groupMetadata

    const introText = groupData.intro || DEFAULT_INTRO
    const parsed = parsePlaceholders(introText, m, groupMeta)

    await m.reply(parsed, { mentions: [m.sender] })
}

export { pluginConfig as config, handler, parsePlaceholders, DEFAULT_INTRO }
