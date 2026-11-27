/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'haruskah',
    alias: ['harus', 'should'],
    category: 'fun',
    description: 'Tanya bot haruskah sesuatu',
    usage: '.haruskah <pertanyaan>',
    example: '.haruskah aku menyatakan cinta?',
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
    'Sí, ¡debes hacerlo!',
    'No hace falta.',
    'Hmm, como tú quieras.',
    '¡Totalmente! ¡No lo dudes!',
    'Tampoco es obligatorio.',
    'Si crees que hace falta, ¡hazlo!',
    'Piénsalo bien primero.',
    '¡Sí! ¡Ahora mismo!',
    'No, mejor espera.',
    'Sí, pero con cuidado.',
    'No hace falta, pero puedes.',
    '¡Obligatorio!',
    'Hmm, mejor déjalo pasar.',
    'Hazlo cuando estés seguro.',
    '¡Sí, por tu futuro!',
    'No hace falta, tranquilo.',
    'Go for it!',
    'No te apresures, piénsalo otra vez.',
    '¡Claro que sí!',
    'Mira primero la situación.'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`⚖️ *¿DEBERÍA?*\n\n> ¡Escribe una pregunta!\n\n*Ejemplo:*\n> .haruskah ¿debería confesar mi amor?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
