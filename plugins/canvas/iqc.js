/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { generateIQC } = require('iqc-canvas');

const pluginConfig = {
    name: 'iqc',
    alias: ['iphonequote', 'fakechat'],
    category: 'canvas',
    description: 'Membuat Fake Quote iOS style.',
    usage: '.iqc [text/reply]',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true,
};

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

function getMessageTime(m) {
    let ts = m.messageTimestamp;
    if (ts && typeof ts === 'object' && ts.low !== undefined) ts = ts.low;
    ts = Number(ts) * 1000;
    const date = Number.isFinite(ts) && ts > 0 ? new Date(ts) : new Date();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}.${minutes}`;
}

async function handler(m, { sock, text }) {
    try {
        const targetText = String(text || (m.quoted && m.quoted.text ? m.quoted.text : '')).trim();

        if (!targetText) {
            return m.reply(
                `🩷 *FUNCIÓN DE IOS DE CITA FALSA*\n\n` +
                `Tipo: ${m.prefix}iqc tu texto\n` +
                `O responda al mensaje y luego escriba ${m.prefix}iqc`
            );
        }

        const timeStr = getMessageTime(m);
        await m.react('🕕');

        // Template ini memakai iqc-canvas yang memang dibuat untuk
        // tampilan chat WhatsApp iPhone: reaction bar + context menu.
        const result = await generateIQC(targetText, timeStr, {
            reactionEmojis: REACTION_EMOJIS,
            showPlusBtn: true,
        });

        if (!result?.success || !result.image) {
            throw new Error('El generador IQC no produce una imagen.');
        }

        await sock.sendMessage(
            m.chat,
            { image: result.image, mimetype: 'image/png' },
            { quoted: m.quoted || m }
        );

        await m.react('✅');
    } catch (error) {
        console.error('[iqc error]:', error);
        await m.react('❌');
        await m.reply(
            `❌ *NO SE PUDO PROCESAR LA CITA*\n\n` +
            `Se produjo un error al crear IQC. Intente ejecutar la instalación npm y luego reinicie bot.`
        );
    }
}

export { pluginConfig as config, handler };
