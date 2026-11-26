/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from '../../config.js'
/**
 * @file plugins/owner/self.js
 * @description Plugin untuk mengaktifkan mode self (hanya owner & bot)
 */
import { getDatabase } from '../../src/lib/data/database.js'
import te from '../../src/lib/core/error.js'
const pluginConfig = {
    name: 'self',
    alias: ['selfmode', 'private-mode'],
    category: 'owner',
    description: 'Mengaktifkan mode self (hanya owner & bot yang bisa akses)',
    usage: '.self',
    example: '.self',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

/**
 * Handler untuk command self
 */
async function handler(m, { sock }) {
    try {
        const isRealOwner = validateOwner(m);
        if (!isRealOwner) {
            return await m.reply('🚫 *ACCESO DENEGADO*\n\n> ¡Solo el owner puede cambiar el modo del bot!');
        }
        const currentMode = config.mode;
        if (currentMode === 'self') {
            return await m.reply('ℹ️ El bot ya está en modo *self*');
        }
        config.mode = 'self';
        const db = getDatabase();
        db.setting('botMode', 'self');

        const responseText = `🔒 *MODO SELF ACTIVO*\n\n` +
            `> El bot ahora solo responde a:\n` +
            `> • Owner bot\n` +
            `> • Bot sendiri (fromMe)\n\n` +
            `_Usa .public para abrir el acceso_`;
        await m.reply(responseText);
        console.log(`[Mode] Changed to SELF by ${m.pushName} (${m.sender})`);
    } catch (error) {
        console.error('[Self Command Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

/**
 * Validasi owner dengan multiple checks
 */
function validateOwner(m) {
    if (!m.isOwner) return false;
    if (m.fromMe) return true;
    const senderNumber = m.sender?.replace(/[^0-9]/g, '') || '';
    const ownerNumbers = config.owner?.number || [];

    const isInOwnerList = ownerNumbers.some(owner => {
        const cleanOwner = owner.replace(/[^0-9]/g, '');
        return senderNumber.includes(cleanOwner) || cleanOwner.includes(senderNumber);
    });
    if (!isInOwnerList) return false;
    if (!m.sender || !m.sender.includes('@')) return false;
    return true;
}

export { pluginConfig as config, handler }
