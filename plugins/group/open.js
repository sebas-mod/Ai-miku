/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'open',
    alias: ['buka', 'opengroup', 'bukagroup'],
    category: 'group',
    description: 'Membuka grup agar semua member bisa chat',
    usage: '.open',
    example: '.open',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
};

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata;

        if (!groupMeta.announce) {
            await m.reply(
                `⚠️ *VALIDACIÓN FALLIDA*\n\n` +
                `> El grupo ya está \`abierto\`.\n` +
                `> Todos los miembros ya pueden enviar mensajes.`
            );
            return;
        }

        await sock.groupSettingUpdate(m.chat, 'not_announcement');

        const senderNum = m.sender.split('@')[0];

        const successMsg = `✅ @${senderNum} ha abierto este grupo\n_Ahora podéis enviar mensajes_`;

        await m.reply(successMsg, { mentions: [m.sender] });

    } catch (error) {
        await m.reply(
            `❌ *ERROR*\n\n` +
            `> No se pudo abrir el grupo.\n` +
            `> _${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }
