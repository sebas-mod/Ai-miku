/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { fetchThumb } from "../../src/lib/core/media.js";
import fs from "fs";
import config from "../../config.js";
import { Button, Carousel } from "../../src/lib/core/builder.js";

const pluginConfig = {
    name: ['pinchat', 'pin'],
    alias: [],
    category: 'owner',
    description: 'Pin/unpin chat',
    usage: '.pinchat <nomor/reply> atau .pinchat buka <nomor>',
    example: '.pinchat 628xxx',
    isOwner: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function sendPinCarousel(m, sock, { pinned, target, error } = {}) {
    const image = await fetchThumb("pinchat", false);

    if (!image) {
        await m.reply(error || (pinned
            ? `📌 *ᴄʜᴀᴛ ᴅɪᴘɪɴ*\n\n> Target: ${target}`
            : `📍 *ᴘɪɴ ᴅɪʜᴀᴘᴜs*\n\n> Target: ${target}`));
        return;
    }

    try {
        const makeCard = async (title, body, buttonText, buttonId) => {
            const card = new Button(sock)
                .setImage(image)
                .setTitle(title)
                .setBody(body)
                .setFooter(`${config.bot?.name || 'Elysia Assistant'} • .pin`);
            card.addButton('quick_reply', {
                display_text: buttonText,
                id: buttonId,
            });
            return card.toCard();
        };

        const prefix = config.command?.prefix || '.';
        const cards = [
            await makeCard(
                pinned ? '📌 Chat Berhasil Dipin' : '📍 Pin Chat Dihapus',
                `Target chat: ${target}\n\n${pinned ? 'Chat sudah dipindahkan ke bagian pin.' : 'Chat sudah dikeluarkan dari bagian pin.'}`,
                pinned ? '📍 Buka Panduan' : '📌 Pin Lagi',
                pinned ? `${prefix}pin` : `${prefix}pin`,
            ),
            await makeCard(
                '📖 Panduan .pin',
                `• ${prefix}pin 628xxx — Pin chat\n• ${prefix}pin — Pin chat saat private chat\n• ${prefix}pin buka 628xxx — Unpin chat\n\nGeser ke kanan untuk melihat panduan.`,
                '📌 Gunakan .pin',
                `${prefix}pin`,
            ),
        ];

        const carousel = new Carousel(sock)
            .setBody(pinned ? '📌 *PIN CHAT*' : '📍 *UNPIN CHAT*')
            .setFooter('Geser kartu ke kanan untuk melihat panduan.');
        carousel.addCard(cards);
        await carousel.send(m.chat, { quoted: m.raw });
    } catch (carouselError) {
        console.error('[PIN CAROUSEL ERROR]:', carouselError);
        await m.reply(error || (pinned
            ? `📌 *ᴄʜᴀᴛ ᴅɪᴘɪɴ*\n\n> Target: ${target}`
            : `📍 *ᴘɪɴ ᴅɪʜᴀᴘᴜs*\n\n> Target: ${target}`));
    }
}

async function handler(m, { sock }) {
    const action = m.args[0]?.toLowerCase()
    let targetJid = null
    let pin = true

    if (action === 'buka' || action === 'unpin') {
        pin = false
        const num = (m.args[1] || '').replace(/[^0-9]/g, '')
        if (num) targetJid = num + '@s.whatsapp.net'
        else if (m.quoted) targetJid = m.quoted.sender || m.quoted.participant
        else if (!m.isGroup) targetJid = m.chat
    } else {
        if (m.mentionedJid?.length > 0) {
            targetJid = m.mentionedJid[0]
        } else if (m.quoted) {
            targetJid = m.quoted.sender || m.quoted.participant
        } else if (m.args[0]) {
            const num = m.args[0].replace(/[^0-9]/g, '')
            if (num) targetJid = num + '@s.whatsapp.net'
        } else if (!m.isGroup) {
            targetJid = m.chat
        }
    }

    if (!targetJid) {
        return m.reply(
            '📌 *ᴘɪɴ ᴄʜᴀᴛ*\n\n' +
            '> `.pinchat 628xxx` — Pin chat\n' +
            '> `.pinchat` (di private chat) — Pin chat ini\n' +
            '> `.pinchat buka 628xxx` — Unpin chat'
        )
    }

    try {
        await sock.chatModify({ pin }, targetJid)
        await m.react('✅')
        const target = targetJid.split('@')[0]
        return sendPinCarousel(m, sock, { pinned: pin, target });
    } catch (err) {
        return sendPinCarousel(m, sock, {
            pinned: pin,
            target: targetJid.split('@')[0],
            error: `❌ Gagal: ${err.message}`,
        });
    }
}

export { pluginConfig as config, handler }
