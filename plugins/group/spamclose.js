/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'spamclose',
    alias: ['spam-close'],
    category: 'group',
    description: 'Otomatis menutup grup saat member mengirim 5 pesan beruntun',
    usage: '.spamclose on/off',
    example: '.spamclose on',
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

async function handler(m, { db }) {
    const mode = String(m.args?.[0] || '').toLowerCase();
    const group = db.getGroup(m.chat) || {};

    if (!['on', 'off'].includes(mode)) {
        const current = group.spamclose?.enabled === true;
        return m.reply(
            `╭─〔 🛡️ *SPAMCLOSE* 〕\n` +
            `│ Status : *${current ? 'ON 🟢' : 'OFF 🔴'}*\n` +
            `│ Trigger: *5 pesan beruntun*\n` +
            `│ Sticker : *ikut terdeteksi*\n` +
            `╰─╮\n` +
            `   ↳ Gunakan: *.spamclose on/off*`
        );
    }

    const enabled = mode === 'on';
    db.setGroup(m.chat, {
        spamclose: {
            ...(group.spamclose || {}),
            enabled,
        },
    });

    return m.reply(
        enabled
            ? `╭─〔 🛡️ *SPAMCLOSE AKTIF* 〕\n│ ✅ Mode: *ON*\n│ 🔢 Trigger: *5 pesan beruntun*\n│ 🧩 Sticker: *ikut dihitung*\n│ 🔒 Grup akan ditutup otomatis\n╰─╯`
            : `╭─〔 🛡️ *SPAMCLOSE NONAKTIF* 〕\n│ 🔴 Mode: *OFF*\n│ Bot tidak akan menutup grup karena spam.\n╰─╯`
    );
}

export { pluginConfig as config, handler };
