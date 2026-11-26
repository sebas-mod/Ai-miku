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
import { f } from '../../src/lib/core/http.js'
import te from '../../src/lib/core/error.js'
const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-vemzoMD'

const pluginConfig = {
    name: 'senja',
    alias: ['katacinta', 'romanticquotes'],
    category: 'fun',
    description: 'Random kata-kata senja/romantis',
    usage: '.senja',
    example: '.senja',
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
        const res = await f(`https://api.neoxr.eu/api/senja?apikey=${NEOXR_APIKEY}`)

        if (!res.status || !res.data?.text) {
            m.react('❌')
            return m.reply(`❌ Gagal mengambil kata senja`)
        }
        await m.reply(res.data.text)
        m.react('✅')
    } catch (err) {
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
