/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from '../../src/lib/data/database.js'
const pluginConfig = {
    name: 'jadwalgroup',
    alias: ['schedulegroup', 'jdwlgrup', 'autoopenclose'],
    category: 'group',
    description: 'Programa la apertura y el cierre automáticos del grupo',
    usage: '.jadwalgroup <open/close> <HH:MM> [mensaje]',
    example: '.jadwalgroup open 06:00 Selamat pagi {group}! Grup dibuka.',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
};

function parseTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return null;

    const cleaned = timeStr.trim().replace(/\s+/g, '');
    const match = cleaned.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    return { hours, minutes };
}

function formatTime(hours, minutes) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

async function handler(m, { sock }) {
    const db = getDatabase();
    const args = m.args || [];
    // Gunakan fullArgs agar pesan custom tetap mempertahankan newline/baris baru seperti .setwelcome.
    const rawArgs = (typeof m.fullArgs === 'string' ? m.fullArgs : args.join(' ')).trim();
    const action = args[0]?.toLowerCase() || rawArgs.split(/\s+/)[0]?.toLowerCase();
    const group = db.getGroup(m.chat) || {};

    const defaultOpenMsg = `🔓 *HORARIO APERTURA*\n\n> El grupo se abre automáticamente según el horario.\n> Hora: {time} WIB`;
    const defaultCloseMsg = `🔒 *HORARIO CIERRE*\n\n> El grupo se cierra automáticamente según el horario.\n> Hora: {time} WIB`;

    const renderMessage = (template, time) => {
        const meta = m.groupMetadata || {};
        const subject = meta.subject || group.subject || 'Grupo';
        const count = meta.participants?.length ?? group.memberCount ?? '-';
        const now = new Date();
        const date = now.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
        const day = now.toLocaleDateString('id-ID', { weekday: 'long', timeZone: 'Asia/Jakarta' });
        return String(template)
            .replace(/\{group\}/gi, subject)
            .replace(/\{time\}/gi, time || '')
            .replace(/\{date\}/gi, date)
            .replace(/\{day\}/gi, day)
            .replace(/\{count\}/gi, String(count))
            .replace(/\{prefix\}/gi, m.prefix || '.');
    };

    if (!action) {
        const openTime = group.scheduleOpen || null;
        const closeTime = group.scheduleClose || null;
        const openMsg = group.scheduleOpenMsg || defaultOpenMsg;
        const closeMsg = group.scheduleCloseMsg || defaultCloseMsg;

        await m.reply(
            `⏰ *HORARIO DEL GRUPO*\n\n` +
            `「 📋 *ESTADO* 」\n` +
            `🔓 APERTURA: *${openTime || 'Sin programar'}*\n` +
            `🔒 CIERRE: *${closeTime || 'Sin programar'}*\n\n` +
            `「 💬 *MENSAJE* 」\n` +
            `🔓 Apertura: ${openMsg}\n` +
            `🔒 Cierre: ${closeMsg}\n\n` +
            `*Cómo se usa:*\n` +
            `\`${m.prefix}jadwalgroup open 06:00 Mensaje personalizado\`\n` +
            `\`${m.prefix}jadwalgroup close 22:00 Mensaje personalizado\`\n` +
            `\`${m.prefix}jadwalgroup setopen Mensaje personalizado\`\n` +
            `\`${m.prefix}jadwalgroup setclose Mensaje personalizado\`\n` +
            `\`${m.prefix}jadwalgroup hapus open\` / \`${m.prefix}jadwalgroup hapus close\`\n\n` +
            `Marcadores: \`{group}\` \`{time}\` \`{date}\` \`{day}\` \`{count}\` \`{prefix}\``
        );
        return;
    }

    // Set pesan custom tanpa mengubah jam.
    if (action === 'setopen' || action === 'setclose' || action === 'setpesan' || action === 'setmessage') {
        const type = action === 'setopen' ? 'open' : action === 'setclose' ? 'close' : args[1]?.toLowerCase();
        // Pakai fullArgs agar ENTER/newline dalam pesan tidak hilang.
        const message = action === 'setopen' || action === 'setclose'
            ? rawArgs.replace(/^\s*set(?:open|close)\b\s*/i, '').trim()
            : rawArgs.replace(/^\s*set(?:pesan|message)\b\s*(?:open|close)\b\s*/i, '').trim();

        if (type !== 'open' && type !== 'close') {
            return m.reply(`⚠️ Usa: \`${m.prefix}jadwalgroup setopen Mensaje...\` o \`${m.prefix}jadwalgroup setclose Mensaje...\``);
        }
        if (!message) {
            return m.reply(`⚠️ Falta el mensaje personalizado.\nEjemplo: \`${m.prefix}jadwalgroup set${type} Grupo {group} ${type === 'open' ? 'abierto' : 'cerrado'} a las {time}\``);
        }

        if (type === 'open') group.scheduleOpenMsg = message;
        else group.scheduleCloseMsg = message;
        db.setGroup(m.chat, group);
        if (db.save) db.save();
        m.react?.('✅');
        return m.reply(`✅ Mensaje de horario *${type.toUpperCase()}* guardado.\n\n> ${message}`);
    }

    if (action === 'hapus' || action === 'delete' || action === 'remove') {
        const type = args[1]?.toLowerCase();
        if (type !== 'open' && type !== 'close') {
            return m.reply(`⚠️ Usa: \`${m.prefix}jadwalgroup hapus open\` o \`${m.prefix}jadwalgroup hapus close\``);
        }

        if (args[2]?.toLowerCase() === 'pesan' || args[2]?.toLowerCase() === 'message' || args[2]?.toLowerCase() === 'text') {
            if (type === 'open') delete group.scheduleOpenMsg;
            else delete group.scheduleCloseMsg;
            db.setGroup(m.chat, group);
            if (db.save) db.save();
            return m.reply(`✅ El mensaje personalizado de *${type.toUpperCase()}* volvió al valor por defecto.`);
        }

        // Backward compatible: hapus open/close = hapus jadwal waktunya.
        if (type === 'open') delete group.scheduleOpen;
        else delete group.scheduleClose;
        db.setGroup(m.chat, group);
        if (db.save) db.save();
        return m.reply(`✅ Se ha eliminado el horario automático de *${type.toUpperCase()}*.`);
    }

    if (action !== 'open' && action !== 'close') {
        await m.reply(
            `⚠️ *VALIDACIÓN FALLIDA*\n\n` +
            `> ¡La acción debe ser \`open\`, \`close\`, \`setopen\` o \`setclose\`!\n\n` +
            `> Ejemplo:\n` +
            `> \`${m.prefix}jadwalgroup open 06:00 ¡Buenos días {group}!\`\n` +
            `> \`${m.prefix}jadwalgroup close 22:00 Hora de descansar, {group}.\``
        );
        return;
    }

    // Ambil jam dari rawArgs supaya teks setelah jam boleh multiline.
    let time = null;
    const commandTimeMatch = rawArgs.match(/^(?:open|close)\s+(\d{1,2}:\d{2})(?:[\s\n\r]+|$)/i);
    if (commandTimeMatch) time = commandTimeMatch[1];
    if (!time && args[1]) time = args[1];

    if (!time) {
        return m.reply(`⚠️ ¡Falta la hora!\nEjemplo: \`${m.prefix}jadwalgroup ${action} 08:00 Mensaje personalizado\``);
    }

    const parsed = parseTime(time);
    if (!parsed) {
        return m.reply(`⚠️ ¡Formato de hora no válido!\nUsa HH:MM, por ejemplo \`06:00\`, \`22:30\`, \`08:15\`.`);
    }

    const formattedTime = formatTime(parsed.hours, parsed.minutes);
    // Pesan custom diambil dari rawArgs agar newline/baris baru tidak hilang.
    const customMatch = rawArgs.match(/^(?:open|close)\s+\d{1,2}:\d{2}\s+([\s\S]*)$/i);
    const customText = customMatch ? customMatch[1].trim() : '';

    if (action === 'open') {
        group.scheduleOpen = formattedTime;
        if (customText) group.scheduleOpenMsg = customText;
    } else {
        group.scheduleClose = formattedTime;
        if (customText) group.scheduleCloseMsg = customText;
    }

    db.setGroup(m.chat, group);
    if (db.save) db.save();

    const actionText = action === 'open' ? 'ABRIR' : 'CERRAR';
    const emoji = action === 'open' ? '🔓' : '🔒';
    const savedMsg = action === 'open' ? (group.scheduleOpenMsg || defaultOpenMsg) : (group.scheduleCloseMsg || defaultCloseMsg);

    await m.reply(
        `✅ *HORARIO GUARDADO*\n\n` +
        `╭┈┈⬡「 ⏰ *CONFIGURACIÓN* 」\n` +
        `┃ ㊗ ${emoji} ACCIÓN: *${actionText}*\n` +
        `┃ ㊗ ⏱️ HORA: *${formattedTime} WIB*\n` +
        `┃ ㊗ 📡 ESTADO: *🟢 Activado*\n` +
        `╰┈┈⬡\n\n` +
        `💬 *Mensaje:*\n\n` +
        '```\n' + savedMsg + '\n```\n\n' +
        `> Para cambiar el mensaje sin tocar la hora:\n` +
        `> \`${m.prefix}jadwalgroup set${action} mensaje nuevo...\``
    );
}

export { pluginConfig as config, handler }
