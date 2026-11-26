/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
  name: 'cekumur',
  alias: ['umur', 'age'],
  category: 'cek',
  description: 'Cek umur mental & vibes jiwa kamu',
  usage: '.cekumur [@tag/nama]',
  example: '.cekumur @user',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
    isRegistered: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true
}

async function handler(m, { text }) {
  const jid = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  const label = (text && !m.mentionedJid?.length && !m.quoted?.sender) ? text.trim() : `@${jid.split('@')[0]}`
  const mentions = label.startsWith('@') ? [jid] : []

  const umur = Math.floor(Math.random() * 78) + 5
  let gelar = ''
  let komen = ''

  if (umur >= 65) {
    gelar = '🧓 Sesepuh Bijaksana (Bau Minyak Angin)'
    komen = 'Bawaannya pengen ngomel kalau liat anak muda begadang, kemana-mana wajib kantongin FreshCare.'
  } else if (umur >= 40) {
    gelar = '☕ Bapak/Ibu Kos Penuh Pengalaman'
    komen = 'Topik obrolannya udah seputar harga sembako, properti, dan pegel linu.'
  } else if (umur >= 22) {
    gelar = '💼 Dewasa Produktif (Kadang Pusing Cicilan)'
    komen = 'Jiwa matang, pikiran realistis, tapi tetep butuh healing tiap akhir pekan.'
  } else if (umur >= 14) {
    gelar = '🔥 Remaja Penuh Semangat & Drama'
    komen = 'Energi masih melimpah, emosi kadang naik turun kayak roller coaster.'
  } else {
    gelar = '🍼 Bocil Kematian / Jiwa TK'
    komen = 'Polos, gampang ketawa gara-gara hal receh, dan masih suka ngambek kalau gak dibeliin jajan!'
  }

  const msg =
    `╭───〔 🎂 *DETEKTOR UMUR MENTAL* 🎂 〕───╮\n` +
    `│ 👤 *Target*      : ${label}\n` +
    `│ 🧠 *Umur Mental* : *${umur} Tahun*\n` +
    `│ 🏷️ *Vibes Jiwa*  : *${gelar}*\n` +
    `╰──────────────────────────────────╯\n\n` +
    `💬 *Diagnosis Psikolog Bot:*\n` +
    `> _"${komen}"_`

  await m.reply(msg, { mentions })
}

export { pluginConfig as config, handler }
