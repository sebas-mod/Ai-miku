/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'coba',
    alias: ['try'],
    category: 'fun',
    description: 'Coba tanyakan sesuatu ke bot',
    usage: '.coba <pertanyaan>',
    example: '.coba tebak apa yang aku pikirkan',
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
    'Hmm, déjame ver... ¡Estás pensando en comida!',
    'Adivino... ¡Estás aburrido!',
    'A ver... ¡Parece que estás feliz!',
    'Hmm, creo que estás confundido.',
    'Voy a adivinar... ¿Estás extrañando a alguien?',
    'Creo que estás relajado.',
    'Adivino que estás scrolleando el móvil sin parar.',
    'Hmm, seguro que estás aburrido, ¿verdad?',
    'A ver si acierto... ¡Tienes ganas de salir!',
    'Creo que necesitas un poco de diversión.',
    'Hmm, parece que estás contento.',
    'A ver... ¡Seguro que tienes curiosidad!',
    'Mi apuesta: estás tumbado en la cama.',
    'Hmm, puede que estés pensando en alguien especial.',
    'A ver: ¿tienes ganas de desahogarte?',
    'Creo que tienes ganas de jugar.',
    'Hmm, adivino que estás escuchando música.',
    'A ver si acierto... ¡Estás en tu cuarto!',
    'Creo que estás esperando algo.',
    'Hmm, mi apuesta: ¡necesitas con quién hablar!'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`🎯 *ADIVINA*\n\n> ¡Escribe algo!\n\n*Ejemplo:*\n> .coba adivina en qué estoy pensando`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
