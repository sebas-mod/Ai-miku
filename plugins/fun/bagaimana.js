/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'bagaimana',
    alias: ['gimana', 'how'],
    category: 'fun',
    description: 'Pregúntale al bot cómo es algo',
    usage: '.bagaimana <pregunta>',
    example: '.bagaimana cara jadi sukses?',
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
    '¡Es fácil, solo hazlo!',
    'Hmm, es difícil de explicar. ¡Inténtalo primero!',
    'Con esfuerzo y fe, seguro.',
    'Ya begitulah caranya.',
    'No estoy seguro, busca otras referencias.',
    'Poco a poco, ya verás que puedes.',
    '¡Con trabajo duro y sin rendirse!',
    'Primero, cree en ti mismo.',
    'Hmm, cada persona lo hace a su manera.',
    'Sigue a tu corazón.',
    'Aprende de quien ya tiene experiencia.',
    'Paso a paso, sin prisas.',
    '¡Con mucha determinación!',
    'Empieza por lo pequeño.',
    'Sé constante y lo lograrás.',
    '¡No le des demasiadas vueltas, actúa!',
    '¡Es fácil! ¡Solo empieza!',
    '¿Cómo? ¡Pues probándolo!',
    'Con la estrategia adecuada.',
    'Hmm, yo también sigo aprendiendo.'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`📋 *¿CÓMO?*\n\n> ¡Escribe una pregunta!\n\n*Ejemplo:*\n>.bagaimana ¿cómo tener éxito?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
