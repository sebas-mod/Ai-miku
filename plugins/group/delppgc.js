/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'delppgc',
    alias: ['delprofilegc', 'delppgroup', 'hapusppgc'],
    category: 'group',
    description: 'Menghapus foto profil grup',
    usage: '.delppgc',
    example: '.delppgc',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        await sock.removeProfilePicture(m.chat)

        await m.reply(
            `✅ La foto del Grupo ahora está vacía`
        )
    } catch (error) {
        await m.reply(
            `❌ *FALLIDO*\n\n` +
            `> No se puede eliminar la foto del grupo.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
