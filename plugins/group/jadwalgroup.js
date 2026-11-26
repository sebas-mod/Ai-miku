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
    description: 'Jadwal buka/tutup grup otomatis',
    usage: '.jadwalgroup <open/close> <HH:MM> [pesan]',
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

    const defaultOpenMsg = `🔓 *ᴊᴀᴅᴡᴀʟ ᴏᴘᴇɴ*\n\n> Grup dibuka otomatis sesuai jadwal.\n> Waktu: {time} WIB`;
    const defaultCloseMsg = `🔒 *ᴊᴀᴅᴡᴀʟ ᴄʟᴏsᴇ*\n\n> Grup ditutup otomatis sesuai jadwal.\n> Waktu: {time} WIB`;

    const renderMessage = (template, time) => {
        const meta = m.groupMetadata || {};
        const subject = meta.subject || group.subject || 'Grup';
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
            `⏰ *ᴊᴀᴅᴡᴀʟ ɢʀᴜᴘ*\n\n` +
            `「 📋 *sᴛᴀᴛᴜs* 」\n` +
            `🔓 ᴏᴘᴇɴ: *${openTime || 'Tidak aktif'}*\n` +
            `🔒 ᴄʟᴏsᴇ: *${closeTime || 'Tidak aktif'}*\n\n` +
            `「 💬 *ᴘᴇsᴀɴ* 」\n` +
            `🔓 Open: ${openMsg}\n` +
            `🔒 Close: ${closeMsg}\n\n` +
            `*Cara Penggunaan:*\n` +
            `\`${m.prefix}jadwalgroup open 06:00 Pesan custom\`\n` +
            `\`${m.prefix}jadwalgroup close 22:00 Pesan custom\`\n` +
            `\`${m.prefix}jadwalgroup setopen Pesan custom\`\n` +
            `\`${m.prefix}jadwalgroup setclose Pesan custom\`\n` +
            `\`${m.prefix}jadwalgroup hapus open\` / \`${m.prefix}jadwalgroup hapus close\`\n\n` +
            `Placeholder: \`{group}\` \`{time}\` \`{date}\` \`{day}\` \`{count}\` \`{prefix}\``
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
            return m.reply(`⚠️ Gunakan: \`${m.prefix}jadwalgroup setopen Pesan...\` atau \`${m.prefix}jadwalgroup setclose Pesan...\``);
        }
        if (!message) {
            return m.reply(`⚠️ Pesan custom belum diisi.\nContoh: \`${m.prefix}jadwalgroup set${type} Grup {group} ${type === 'open' ? 'dibuka' : 'ditutup'} jam {time}\``);
        }

        if (type === 'open') group.scheduleOpenMsg = message;
        else group.scheduleCloseMsg = message;
        db.setGroup(m.chat, group);
        if (db.save) db.save();
        m.react?.('✅');
        return m.reply(`✅ Pesan jadwal *${type.toUpperCase()}* berhasil disimpan.\n\n> ${message}`);
    }

    if (action === 'hapus' || action === 'delete' || action === 'remove') {
        const type = args[1]?.toLowerCase();
        if (type !== 'open' && type !== 'close') {
            return m.reply(`⚠️ Gunakan: \`${m.prefix}jadwalgroup hapus open\` atau \`${m.prefix}jadwalgroup hapus close\``);
        }

        if (args[2]?.toLowerCase() === 'pesan' || args[2]?.toLowerCase() === 'message' || args[2]?.toLowerCase() === 'text') {
            if (type === 'open') delete group.scheduleOpenMsg;
            else delete group.scheduleCloseMsg;
            db.setGroup(m.chat, group);
            if (db.save) db.save();
            return m.reply(`✅ Pesan custom *${type.toUpperCase()}* direset ke default.`);
        }

        // Backward compatible: hapus open/close = hapus jadwal waktunya.
        if (type === 'open') delete group.scheduleOpen;
        else delete group.scheduleClose;
        db.setGroup(m.chat, group);
        if (db.save) db.save();
        return m.reply(`✅ Jadwal *${type.toUpperCase()}* otomatis telah dihapus.`);
    }

    if (action !== 'open' && action !== 'close') {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `> Action harus \`open\`, \`close\`, \`setopen\`, atau \`setclose\`!\n\n` +
            `> Contoh:\n` +
            `> \`${m.prefix}jadwalgroup open 06:00 Selamat pagi {group}!\`\n` +
            `> \`${m.prefix}jadwalgroup close 22:00 Waktunya istirahat, {group}.\``
        );
        return;
    }

    // Ambil jam dari rawArgs supaya teks setelah jam boleh multiline.
    let time = null;
    const commandTimeMatch = rawArgs.match(/^(?:open|close)\s+(\d{1,2}:\d{2})(?:[\s\n\r]+|$)/i);
    if (commandTimeMatch) time = commandTimeMatch[1];
    if (!time && args[1]) time = args[1];

    if (!time) {
        return m.reply(`⚠️ Waktu harus diisi!\nContoh: \`${m.prefix}jadwalgroup ${action} 08:00 Pesan custom\``);
    }

    const parsed = parseTime(time);
    if (!parsed) {
        return m.reply(`⚠️ Format waktu tidak valid!\nGunakan HH:MM, contoh \`06:00\`, \`22:30\`, \`08:15\`.`);
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

    const actionText = action === 'open' ? 'BUKA' : 'TUTUP';
    const emoji = action === 'open' ? '🔓' : '🔒';
    const savedMsg = action === 'open' ? (group.scheduleOpenMsg || defaultOpenMsg) : (group.scheduleCloseMsg || defaultCloseMsg);

    await m.reply(
        `✅ *ᴊᴀᴅᴡᴀʟ ᴅɪsɪᴍᴘᴀɴ*\n\n` +
        `╭┈┈⬡「 ⏰ *sᴇᴛᴛɪɴɢ* 」\n` +
        `┃ ㊗ ${emoji} ᴀᴋsɪ: *${actionText}*\n` +
        `┃ ㊗ ⏱️ ᴡᴀᴋᴛᴜ: *${formattedTime} WIB*\n` +
        `┃ ㊗ 📡 sᴛᴀᴛᴜs: *🟢 Aktif*\n` +
        `╰┈┈⬡\n\n` +
        `💬 *Pesan:*\n\n` +
        '```\n' + savedMsg + '\n```\n\n' +
        `> Untuk ubah pesan tanpa mengubah jam:\n` +
        `> \`${m.prefix}jadwalgroup set${action} pesan baru...\``
    );
}

export { pluginConfig as config, handler }
