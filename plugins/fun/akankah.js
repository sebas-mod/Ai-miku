/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
    name: 'akankah',
    alias: ['akan', 'will'],
    category: 'fun',
    description: 'Tanya bot akankah sesuatu terjadi',
    usage: '.akankah <pertanyaan>',
    example: '.akankah aku sukses?',
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
    'Ya, pasti akan terjadi!',
    'Tidak, sepertinya tidak akan.',
    'Mungkin akan, mungkin tidak.',
    'Pasti akan terjadi!',
    'Hmm, sulit diprediksi.',
    'Pasti! Yakin saja!',
    'Kayaknya nggak deh.',
    'Akan terjadi kalau kamu mau berusaha.',
    'Suatu saat nanti, pasti.',
    'Nggak akan, maaf.',
    'Tentu akan! Tunggu saja!',
    'Hmm, aku ragu.',
    'Akan! Percaya sama proses!',
    'Kemungkinannya kecil.',
    'Pasti akan, aku yakin!',
    'Nggak akan, cari yang lain aja.',
    'Akan, tapi butuh waktu.',
    '¡Claro que sí!',
    'Kalau jodoh, pasti akan.',
    'Akan terjadi di saat yang tepat!'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`🔮 *ᴀᴋᴀɴᴋᴀʜ*\n\n> Masukkan pertanyaan!\n\n*Contoh:*\n> .akankah aku sukses?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
