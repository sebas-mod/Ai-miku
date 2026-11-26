/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
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
            return m.reply('❌ Folder session tidak ditemukan.')
        }

        await m.react('✅')
        await m.reply(
            `╭┈┈⬡「 🗑️ *ᴄʟᴇᴀʀ sᴇssɪᴏɴ* 」\n` +
            `┃ 🧹 Sesi & kunci grup dihapus: *${r.files}*\n` +
            `┃ 💾 Ruang kosong: *${fmt(r.bytes)}*\n` +
            (r.failed ? `┃ ⚠️ Gagal hapus: *${r.failed}* file\n` : '') +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> creds.json tetap aman, bot tidak logout. Sesi chat dibentuk ulang otomatis; ` +
            `kalau ada pesan sempat gagal terbaca sebentar, itu normal. Mau jaga-jaga? Jalankan *.backupsession* sebelum membersihkan.`
        )
    } catch (error) {
        await m.react('❌')
        await te(m, error)
    }
}

export { pluginConfig as config, handler }
