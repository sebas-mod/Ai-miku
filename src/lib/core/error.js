/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from '../../../config.js'
function te(prefix, command, pushName) {
    const tpl = config.errorTemplate || `☢ *ᴇʀʀᴏʀ*\n\n> Terjadi kesalahan pada command \`{prefix}{command}\`\n> Silahkan coba lagi nanti, {pushName}\n\n_Jika masalah berlanjut, hubungi owner_`
    return tpl
        .replace(/\{prefix\}/g, prefix || '.')
        .replace(/\{command\}/g, command || '?')
        .replace(/\{pushName\}/g, pushName || 'User')
}

export default te
