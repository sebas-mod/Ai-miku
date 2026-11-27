/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'rate',
    alias: ['nilai', 'rating'],
    category: 'fun',
    description: 'Pídale al bot que puntúe algo',
    usage: '.rate <sesuatu>',
    example: '.rate wajahku',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const ratings = [
    { score: '10/10', comment: '¡Perfecto! ¡No hay nadie como tú!' },
    { score: '9/10', comment: '¡Casi perfecto! ¡Muy bien!' },
    { score: '8/10', comment: '¡Muy bien! ¡Genial!' },
    { score: '7/10', comment: 'Bastante bien, ¡por encima de la media!' },
    { score: '6/10', comment: 'No está mal, puedes mejorar.' },
    { score: '5/10', comment: 'Normal, lo estándar.' },
    { score: '4/10', comment: 'Hmm, te falta un poquito.' },
    { score: '3/10', comment: 'Perlu banyak perbaikan.' },
    { score: '2/10', comment: 'Uy, todavía estás lejos de estar bien.' },
    { score: '1/10', comment: 'Lo siento, pero esto está fatal.' },
    { score: '100/10', comment: 'LEGEND! Beyond perfect!' },
    { score: '11/10', comment: 'Melebihi ekspektasi!' },
    { score: '69/100', comment: 'Nice...' },
    { score: '420/10', comment: 'BLAZING!' },
    { score: '∞/10', comment: 'Gacor kang' },
    { score: '7.5/10', comment: 'Solid! Good job!' },
    { score: '8.5/10', comment: 'Impressive!' },
    { score: '9.5/10', comment: 'Near perfection!' },
    { score: '-1/10', comment: 'No sé qué decir...' },
    { score: '???/10', comment: 'Error 404: Rating not found.' }
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`⭐ *PUNTUACIÓN*\n\n> ¡Escribe algo para puntuar!\n\n*Ejemplo:*\n> .rate mi cara`);
    }

    const rating = ratings[Math.floor(Math.random() * ratings.length)];

    await m.reply(`Mi puntuación: *${rating.score}*\n${rating.comment}`);
}

export { pluginConfig as config, handler }
