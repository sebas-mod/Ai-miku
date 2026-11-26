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
    'Karena memang sudah takdirnya begitu.',
    'Hmm, pertanyaan bagus! Aku juga bingung.',
    'Karena itulah cara kerjanya.',
    'Porque así estaba escrito.',
    'Aku nggak tau, cari di Google aja.',
    'Karena ya gitu aja.',
    'Mungkin karena kebetulan?',
    'Karena dunia memang penuh misteri.',
    'Hmm, sulit dijelaskan sih.',
    'Karena alam semesta bekerja dengan cara yang misterius.',
    'Aku juga penasaran, kenapa ya?',
    'Karena hal tersebut memang seharusnya terjadi.',
    'Pertanyaan yang bagus! Sayangnya aku nggak punya jawabannya.',
    'Karena itulah keunikan hidup.',
    'Karena setiap hal punya alasannya masing-masing.',
    'Hmm... aku butuh waktu untuk memikirkannya.',
    'Karena begitulah logikanya.',
    'Aku rasa karena memang harus begitu.',
    'Karena segala sesuatu saling berhubungan.',
    'Nah itu aku juga mikir!'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`🤔 *ᴍᴇɴɢᴀᴘᴀ*\n\n> Masukkan pertanyaan!\n\n*Contoh:*\n> .mengapa langit biru?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}?\n*${answer}*`);
}

export { pluginConfig as config, handler }
