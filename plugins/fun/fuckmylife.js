/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from 'axios'
import config from '../../config.js'
import { f } from '../../src/lib/core/http.js'
import te from '../../src/lib/core/error.js'
const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-vemzoMD'

const pluginConfig = {
    name: 'fuckmylife',
    alias: ['fml'],
    category: 'fun',
    description: 'Random FML story',
    usage: '.fuckmylife',
    example: '.fuckmylife',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    m.react('🕕')

    try {
        const data = await f(`https://api.neoxr.eu/api/fml?apikey=${NEOXR_APIKEY}`)

        if (!data?.status || !data?.data?.text) {
            m.react('❌')
            return m.reply(`❌ No se pudo obtener la historia de FML`)
        }
        await m.reply(data.data.text)
        m.react('✅')

    } catch (err) {
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
