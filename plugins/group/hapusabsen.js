/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'hapusabsen',
    alias: ['deleteabsen', 'tutupabsen', 'closeabsen', 'resetabsen'],
    category: 'group',
    description: 'Hapus/tutup sesi absen (admin only)',
    usage: '.hapusabsen',
    example: '.hapusabsen',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

if (!global.absensi) global.absensi = {}

async function handler(m) {
    const chatId = m.chat

    if (!global.absensi[chatId]) {
        return m.reply(
            `❌ *NO HAY NINGUNA ASISTENCIA*\n\n` +
            `> ¡No hay ninguna sesión de asistencia en este grupo!`
        )
    }

    const absen = global.absensi[chatId]
    const totalPeserta = absen.peserta.length

    delete global.absensi[chatId]

    await m.reply(
        `✅ *¡ASISTENCIA CERRADA!*\n\n` +
        `Penyebab?\n` +
        `📝 ${absen.keterangan}\n` +
        `👥 Total de presentes: ${totalPeserta}\n\n` +
        `La sesión de asistencia se ha eliminado.`
    )
}

export { pluginConfig as config, handler }
