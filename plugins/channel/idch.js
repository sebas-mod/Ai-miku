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
import { Button } from '../../src/lib/core/builder.js'

const pluginConfig = {
    name: "idch",
    alias: ["cekidch", "channelid"],
    category: "channel",
    description: "Obtiene el ID de un canal de WhatsApp con botón de copiar",
    usage: ".idch <link channel>",
    example: ".idch https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

async function handler(m, { sock, text, reply, example }) {
    const url = String(text || '').trim().split(/\s+/)[0]
    if (!url) return example('https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O')
    const code = url.match(/whatsapp\.com\/channel\/([A-Za-z0-9_-]+)/i)?.[1]
    if (!code) return reply('⚠️ ¡El enlace del canal no es válido!')

    try {
        const res = await sock.newsletterMetadata('invite', code)
        if (!res?.id) return reply('No se puede encontrar el canal ID desde el enlace.')
        const channelId = res.id

        let channelName = res.thread_metadata?.name?.text || res.name?.text || ''
        if (!channelName) {
            try {
                const { data } = await axios.get(`https://whatsapp.com/channel/${code}`, { headers: { 'User-Agent': UA }, timeout: 15000 })
                const t = String(data).match(/<title>(.*?)<\/title>/i)?.[1]
                if (t) channelName = t.replace(/<\/?[^>]+(>|$)/g, '').split('|')[0].trim()
            } catch {}
        }
        channelName ||= 'WhatsApp Channel'

        const botName = config.bot?.name || 'Ai Miku'
        const teks =
            `╭─❖「 📢 *CHANNEL ID CHECKER* 」\n` +
            `│ 🏷️ Nombre: *${channelName}*\n` +
            `│ 🆔 ID   : \`${channelId}\`\n` +
            `╰─────────────────────❖`

        try {
            const btn = new Button(sock)
                .setBody(teks)
                .setFooter(botName)
                .addButton('cta_copy', {
                    display_text: '📋 Copy ID Channel',
                    copy_code: channelId,
                })

            return await btn.send(m.chat, { quoted: m.raw || m })
        } catch {
            return await sock.sendMessage(
                m.chat,
                { text: `${teks}\n\n📋 Copiar ID del canal: ${channelId}\n\n_${botName}_` },
                { quoted: m }
            )
        }
    } catch (err) {
        console.error('❌ idch Error:', err)
        return reply('¡Ocurrió un error al recuperar el canal ID!')
    }
}

export { pluginConfig as config, handler }
