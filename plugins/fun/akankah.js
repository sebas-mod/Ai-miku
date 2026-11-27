/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'akankah',
    alias: ['akan', 'will'],
    category: 'fun',
    description: 'Pregúntale al bot si algo pasará',
    usage: '.akankah <pregunta>',
    example: '.akankah ¿tendré éxito?',
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
    '¡Sí, seguro que ocurrirá!',
    'No, parece que no ocurrirá.',
    'Puede que sí, puede que no.',
    '¡Seguro que ocurrirá!',
    'Hmm, difícil de predecir.',
    '¡Seguro! ¡Solo ten confianza!',
    'Creo que no, la verdad.',
    'Ocurrirá si tú quieres esforzarte.',
    'En algún momento, seguro.',
    'No ocurrirá, lo siento.',
    '¡Claro que sí! ¡Solo espera!',
    'Hmm, lo dudo.',
    '¡Sí! ¡Confía en el proceso!',
    'La probabilidad es baja.',
    'Seguro que sí, ¡te lo aseguro!',
    'No, busca otra cosa.',
    'Sí, pero necesita tiempo.',
    '¡Claro que sí!',
    'Si es el destino, seguro que sí.',
    '¡Ocurrirá en el momento adecuado!'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`🔮 *¿PASARÁ?*\n\n> ¡Escribe una pregunta!\n\n*Ejemplo:*\n> .akankah ¿tendré éxito?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
