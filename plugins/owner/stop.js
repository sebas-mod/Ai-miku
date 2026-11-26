/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'stop',
    alias: ['shutdown', 'kill'],
    category: 'owner',
    description: 'Stop bot process',
    usage: '.stop',
    example: '.stop',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    await m.reply('🛑 *Deteniendo el bot...*\n\n> El bot se apagó. Debes encenderlo manualmente desde la terminal.')
    console.log('Stopping via command...')

    // Allow message to send before exit
    setTimeout(() => {
        process.exit(1) // Exit code 1 usually stops auto-restart in simple loops
    }, 1000)
}

export { pluginConfig as config, handler }
