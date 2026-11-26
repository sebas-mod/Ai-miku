/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'poll',
    alias: ['voting', 'vote', 'survei'],
    category: 'group',
    description: 'Crea una encuesta/votación en el grupo',
    usage: '.poll <pertanyaan> | <opsi1>, <opsi2>, ...',
    example: '.poll ¿Qué comemos? | Arroz frito, Fideos, Albóndigas',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 1,
    isEnabled: true
};

async function handler(m, { sock }) {
    const text = m.text || '';

    if (!text || text.trim() === '') {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `> ¡Formato no válido!\n\n` +
            `*Format:*\n` +
            `> \`.poll pertanyaan | opsi1, opsi2\`\n\n` +
            `*Contoh:*\n` +
            `> \`.poll ¿Qué comemos? | Arroz frito, Fideos\`\n\n` +
            `*Opsi tambahan:*\n` +
            `> \`.poll multi | pertanyaan | opsi1, opsi2, opsi3, dst\`\n` +
            `> (para opciones múltiples)`
        );
        return;
    }

    let isMultiple = false;
    let parts = text.split('|').map(p => p.trim());

    if (parts[0].toLowerCase() === 'multi') {
        isMultiple = true;
        parts = parts.slice(1);
    }

    if (parts.length < 2) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `> Format: \`pertanyaan | opsi1, opsi2, ...\``
        );
        return;
    }

    const question = parts[0];
    const options = parts[1].split(',').map(o => o.trim()).filter(o => o);

    if (options.length < 2) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `> ¡Mínimo 2 opciones!`
        );
        return;
    }

    if (options.length > 12) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `> ¡Máximo 12 opciones!`
        );
        return;
    }

    if (question.length > 255) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `> Pertanyaan terlalu panjang!\n` +
            `> Maksimal 255 karakter.`
        );
        return;
    }

    try {
        const pollMsg = `✅ Success membuat poll`;

        await m.reply(pollMsg, { mentions: [m.sender] });

        await sock.sendMessage(m.chat, {
            poll: {
                name: question,
                values: options,
                selectableCount: isMultiple ? options.length : 1
            }
        });

    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> Gagal membuat poll.\n` +
            `> _${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }
