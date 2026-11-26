/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'mengapa',
    alias: ['kenapa', 'why'],
    category: 'fun',
    description: 'Tanya bot mengapa sesuatu',
    usage: '.mengapa <pertanyaan>',
    example: '.mengapa langit biru?',
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
    'Porque ese ya era su destino.',
    'Hmm, ¡buena pregunta! Yo también estoy perdido.',
    'Porque así es como funciona.',
    'Porque así estaba escrito.',
    'No lo sé, búscalo en Google.',
    'Porque sí, así son las cosas.',
    '¿Quizá por casualidad?',
    'Porque el mundo está lleno de misterios.',
    'Hmm, es difícil de explicar.',
    'Porque el universo funciona de forma misteriosa.',
    'Yo también tengo curiosidad, ¿por qué será?',
    'Porque eso tenía que pasar.',
    '¡Buena pregunta! Lástima que no tenga la respuesta.',
    'Porque así es la vida de curiosa.',
    'Porque cada cosa tiene su propia razón.',
    'Hmm... necesito tiempo para pensarlo.',
    'Porque así es la lógica.',
    'Creo que porque tenía que ser así.',
    'Porque todo está conectado.',
    '¡Pues yo también me lo pregunto!'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`🤔 *¿POR QUÉ?*\n\n> ¡Escribe una pregunta!\n\n*Ejemplo:*\n> .mengapa ¿por qué el cielo es azul?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}?\n*${answer}*`);
}

export { pluginConfig as config, handler }
