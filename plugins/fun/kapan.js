/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'kapan',
    alias: ['when'],
    category: 'fun',
    description: 'Tanya bot kapan sesuatu',
    usage: '.kapan <pertanyaan>',
    example: '.kapan aku nikah?',
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
    '¿Mañana quizá?',
    'Creo que el año que viene.',
    '¡En 3 días!',
    'Hmm, todavía falta bastante.',
    '¡Ya casi!',
    'Cuando llegue el momento, seguro.',
    '¡El mes que viene!',
    'Quién sabe cuándo, lo importante es tener paciencia.',
    '¡Muy pronto!',
    '¿En 10 años quizá?',
    '¡No falta mucho!',
    'Si es el destino, se encontrarán.',
    'Hmm, susah diprediksi.',
    '¡La semana que viene!',
    '¡Si te esfuerzas más, será antes!',
    'Pas waktunya tepat.',
    'Lo antes posible, tranquilo.',
    'Cuando estés listo.',
    '¡En cuestión de días!',
    'Cuando estés preparado para recibirlo.'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`⏰ *¿CUÁNDO?*\n\n> ¡Escribe una pregunta!\n\n*Ejemplo:*\n> .kapan ¿cuándo me casaré?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}?\n*${answer}*`);
}

export { pluginConfig as config, handler }
