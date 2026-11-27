/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import moment from 'moment-timezone'
import config from '../../config.js'
const pluginConfig = {
    name: 'absen',
    alias: ['hadir', 'present'],
    category: 'group',
    description: 'Marca tu asistencia en la sesión de lista',
    usage: '.absen',
    example: '.absen',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}
if (!global.absensi) global.absensi = {}
async function handler(m, { sock }) {
    const chatId = m.chat
    if (!global.absensi[chatId]) {
        return m.reply(
            `❌ *NO HAY NINGUNA ASISTENCIA*\n\n` +
            `> ¡No hay ninguna sesión de asistencia en este grupo!\n\n` +
            `> Un administrador puede iniciarla con\n` +
            `> *.mulaiabsen [descripción]*`
        )
    }
    const absen = global.absensi[chatId]
    if (absen.peserta.includes(m.sender)) {
        return m.reply(`❌ ¡Ya has registrado tu asistencia!`)
    }
    absen.peserta.push(m.sender)
    const now = moment().tz('Asia/Jakarta')
    const dateStr = now.format('D MMMM YYYY')
    const list = absen.peserta
        .map((jid, i) => `┃ ${i + 1}. @${jid.split('@')[0]}`)
        .join('\n')
    await m.reply(`✅ *¡BIEN, @${m.sender.split('@')[0]} PRESENTE!*\n` +
            `MOTIVO DE LA ASISTENCIA: ${absen.keterangan}\n` +
            `╭┈┈⬡「 📋 MÁS INFO 」\n` +
            `┃ 📅 ${dateStr}\n` +
            `┃ 👥 Total: ${absen.peserta.length}\n` +
            `├┈┈⬡「 📝 *LISTA DE ASISTENCIA* 」\n` +
            `${list}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> _Escribe *${m.prefix}absen* para asistir_\n` +
            `> _Escribe *${m.prefix}cekabsen* para ver la lista_`,
            { mentions: absen.peserta })
}
export { pluginConfig as config, handler }
