/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'bisakah',
    alias: ['bisa'],
    category: 'fun',
    description: 'Pregúntale al bot si puedes lograr algo',
    usage: '.bisakah <pregunta>',
    example: '.bisakah ¿aprobaré el examen?',
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
    '¡Claro que sí! ¡Ten confianza!',
    'Mmm, parece difícil.',
    '¡Claro que puedes! ¡Ánimo!',
    'No puedes, lo siento.',
    'Puede que sí, si te esfuerzas mucho.',
    '¡Seguro que puedes! ¡No te rindas!',
    'Es algo difícil, pero puedes intentarlo.',
    '¡Claro que sí! ¡Confía!',
    'Creo que no, la verdad.',
    '¡Sí! ¡Vamos a demostrarlo!',
    'Hmm... lo dudo.',
    '¡Claro que sí! ¡A por todas!',
    'No puedes, prueba otra cosa.',
    '¡Sí! ¡Cree en ti mismo!',
    'Es difícil, pero no imposible.',
    '¡Absolutamente! ¡Seguro que puedes!',
    'Creo que necesitas un esfuerzo extra.',
    '¡Sí! ¡No dudes de ti!',
    'Hmm, inténtalo más tarde.',
    '¡Sí! ¡Yo confío en ti!'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`💪 *¿PODRÁS?*\n\n> ¡Escribe una pregunta!\n\n*Ejemplo:*\n> .bisakah ¿aprobaré el examen?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
