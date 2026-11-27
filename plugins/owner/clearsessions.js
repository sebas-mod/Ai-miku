/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import te from '../../src/lib/core/error.js'
import { cleanSessionFiles } from '../../src/lib/system/session-backup.js'

const pluginConfig = {
    name: 'clearsessions',
    alias: ['clearsession', 'cleansession', 'clean-session', 'delsession', 'delsessions'],
    category: 'owner',
    description: 'Membersihkan sesi chat & kunci grup (creds.json aman, bot tidak logout)',
    usage: '.clearsession',
    example: '.clearsession',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

const fmt = (bytes) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`)

async function handler(m) {
    await m.react('🗑️')
    try {
        const r = cleanSessionFiles()

        if (!r.found) {
            await m.react('❌')
            return m.reply('❌ No se encontró la carpeta session.')
        }

        await m.react('✅')
        await m.reply(
            `╭┈┈⬡「 🗑️ *LIMPIAR SESIÓN* 」\n` +
            `┃ 🧹 Sesiones y claves de grupo eliminadas: *${r.files}*\n` +
            `┃ 💾 Espacio libre: *${fmt(r.bytes)}*\n` +
            (r.failed ? `┃ ⚠️ No se pudieron borrar: *${r.failed}* archivos\n` : '') +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> creds.json sigue a salvo y el bot no cierra sesión. Las sesiones de chat se recrean automáticamente; ` +
            `si algún mensaje no se leyó por un momento, es normal. ¿Quieres ir sobre seguro? Ejecuta *.backupsession* antes de limpiar.`
        )
    } catch (error) {
        await m.react('❌')
        await te(m, error)
    }
}

export { pluginConfig as config, handler }
