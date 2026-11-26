/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'dimana',
    alias: ['where', 'mana'],
    category: 'fun',
    description: 'Tanya bot dimana sesuatu',
    usage: '.dimana <pertanyaan>',
    example: '.dimana jodohku berada?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Di dekatmu!',
    'Jauh di sana.',
    'En un lugar que no te imaginas.',
    'Di hatimu.',
    'Por aquí cerca.',
    'Hmm, busca en tu cuarto.',
    'Ahí fuera, esperándote.',
    'En el mismo lugar que tú.',
    'En un lugar precioso.',
    'Di balik pintu.',
    'Di sebelah kirimu.',
    '¡Delante de tus ojos!',
    'Muy lejos, ¿quizá en el extranjero?',
    'En un lugar lleno de recuerdos.',
    '¡En todas partes!',
    'Di dunia maya.',
    'Di alam mimpi.',
    'Di tempat rahasia.',
    'Hmm, susah dijelaskan lokasinya.',
    'En un lugar que te hará feliz.'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`📍 *ᴅɪᴍᴀɴᴀ*\n\n> Masukkan pertanyaan!\n\n*Ejemplo:*\n> .dimana jodohku berada?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
