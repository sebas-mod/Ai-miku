/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
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
    usage: '.pinchat <número/reply> o .pinchat buka <número>',
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
            ? `📌 *CHAT FIJADO*\n\n> Target: ${target}`
            : `📍 *FIJADO ELIMINADO*\n\n> Target: ${target}`));
        return;
    }

    try {
        const makeCard = async (title, body, buttonText, buttonId) => {
            const card = new Button(sock)
                .setImage(image)
                .setTitle(title)
                .setBody(body)
                .setFooter(`${config.bot?.name || 'Ai Miku'} • .pin`);
            card.addButton('quick_reply', {
                display_text: buttonText,
                id: buttonId,
            });
            return card.toCard();
        };

        const prefix = config.command?.prefix || '.';
        const cards = [
            await makeCard(
                pinned ? '📌 Chat fijado' : '📍 Fijado eliminado',
                `Chat objetivo: ${target}\n\n${pinned ? 'El chat se movió a la sección de fijados.' : 'El chat se quitó de la sección de fijados.'}`,
                pinned ? '📍 Abrir guía' : '📌 Fijar de nuevo',
                pinned ? `${prefix}pin` : `${prefix}pin`,
            ),
            await makeCard(
                '📖 Panduan .pin',
                `• ${prefix}pin 628xxx — Fija el chat\n• ${prefix}pin — Fija el chat en privado\n• ${prefix}pin buka 628xxx — Quita el fijado\n\nDesliza a la derecha para ver la guía.`,
                '📌 Usa .pin',
                `${prefix}pin`,
            ),
        ];

        const carousel = new Carousel(sock)
            .setBody(pinned ? '📌 *PIN CHAT*' : '📍 *UNPIN CHAT*')
            .setFooter('Desliza la tarjeta a la derecha para ver la guía.');
        carousel.addCard(cards);
        await carousel.send(m.chat, { quoted: m.raw });
    } catch (carouselError) {
        console.error('[PIN CAROUSEL ERROR]:', carouselError);
        await m.reply(error || (pinned
            ? `📌 *CHAT FIJADO*\n\n> Target: ${target}`
            : `📍 *FIJADO ELIMINADO*\n\n> Target: ${target}`));
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
            '📌 *FIJAR CHAT*\n\n' +
            '> `.pinchat 628xxx` — Pin chat\n' +
            '> `.pinchat` (en chat privado) — Fija este chat\n' +
            '> `.pinchat buka 628xxx` — Quita el fijado del chat'
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
            error: `❌ Error: ${err.message}`,
        });
    }
}

export { pluginConfig as config, handler }
