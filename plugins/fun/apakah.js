/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'apakah',
    alias: ['apa'],
    category: 'fun',
    description: 'Pregúntale al bot si algo es así',
    usage: '.apakah <pregunta>',
    example: '.apakah ¿podré hacerme rico?',
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
    '¡Sí, claro que sí!',
    'No, parece que no.',
    'Puede ser, inténtalo más tarde.',
    'Hmm... creo que sí.',
    'Lo dudo, pero puede ser.',
    'Pasti! 100%!',
    'Imposible.',
    'Puede ser, ¿quién sabe?',
    'En mi opinión, sí.',
    'Uf, creo que no.',
    'Claro, ¿por qué no?',
    'No lo sé, pregunta a otro.',
    '¡Por supuesto que sí!',
    'Hmm... parece que no.',
    '¡Estoy seguro de que sí!',
    '¡Imposible del todo!',
    'Puede ser, pero no te ilusiones demasiado.',
    '¡Pues claro!',
    'No, lo siento.',
    '¡Sí! ¡Ánimo!'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`❓ *¿ACASO...?*\n\n> ¡Escribe una pregunta!\n\n*Ejemplo:*\n> .apakah ¿podré hacerme rico?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
