/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";

const pluginConfig = {
    name: "setaudioallmenu",
    alias: ["setaudioam", "audioallmenu"],
    category: "owner",
    description: "Configura el estilo de audio del menú completo",
    usage: ".setaudioallmenu <1-4>",
    example: ".setaudioallmenu 1",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    const db = getDatabase();
    const args = m.text?.trim();

    if (!args) {
        return m.reply(
            `⚠️ *PENGATURAN AUDIO ALL MENU*\n\n` +
            `Sistema de gestión de audio para la apariencia del menú All Menu.\n\n` +
            `*USO:*\n` +
            `• *${m.prefix}setaudioallmenu 1* — Nota de voz PTT respondiendo al mensaje original\n` +
            `• *${m.prefix}setaudioallmenu 2* — Nota de voz PTT con cita falsa de encuesta\n` +
            `• *${m.prefix}setaudioallmenu 3* — Audio normal con cita falsa de texto\n` +
            `• *${m.prefix}setaudioallmenu 4* — Audio normal con cita falsa de pedido\n\n` +
            `*PENJELASAN VARIAN:*\n` +
            `- *Las variantes 1 y 2* convierten el MP3 a Opus (nota de voz) con ffmpeg, para que parezca una grabación real.\n` +
            `- *Las variantes 3 y 4* envían el MP3 sin conversión, con una *cita falsa* que se ve elegante en el chat.\n\n` +
            `Actualmente el menú All Menu usa la variante: *${db.setting("allmenuAudioStyle") || 1}*`
        );
    }

    const newStyle = parseInt(args);
    if (isNaN(newStyle) || newStyle < 1 || newStyle > 4) {
        return m.reply(`❌ *ERROR*\n\nLa variante de audio debe ser un número del 1 al 4.\nEjemplo: *${m.prefix}setaudioallmenu 2*`);
    }

    await m.react("🕕");
    db.setting("allmenuAudioStyle", newStyle);
    await m.reply(`✅ *LISTO*\n\nEl estilo de audio del menú se cambió a la *variante ${newStyle}*. Pruébalo escribiendo *${m.prefix}allmenu*.`);
    await m.react("✅");
}

export { pluginConfig as config, handler };
