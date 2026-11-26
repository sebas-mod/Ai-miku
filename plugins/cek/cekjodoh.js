/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
  name: 'cekjodoh',
  alias: ['jodoh', 'match'],
  category: 'cek',
  description: 'Cek kecocokan jodoh & ramalan rumah tangga kocak',
  usage: '.cekjodoh <nama1> & <nama2> / @tag1 @tag2',
  example: '.cekjodoh Budi & Ani',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
    isRegistered: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true
}

const DRAMA = [
  'Ribut gara-gara nentuin mau makan di mana sampe kelaparan',
  'Rebutan selimut dan guling jam 3 subuh',
  'Debat gara-gara pencet odol dari tengah vs dari bawah',
  'Cemburu gara-gara pasangan senyum ke kurir paket',
  'Kompak ngabisin uang belanja buat jajan seblak & kopi susu'
]

const pick = (a) => a[Math.floor(Math.random() * a.length)]
const loveBar = (p) => '❤️'.repeat(Math.round(p / 10)) + '🖤'.repeat(10 - Math.round(p / 10))

async function handler(m, { text }) {
  const mentions = [...(m.mentionedJid || [])]
  if (m.quoted?.sender && !mentions.includes(m.quoted.sender)) mentions.push(m.quoted.sender)

  let p1 = ''
  let p2 = ''

  if (mentions.length >= 2) {
    p1 = `@${mentions[0].split('@')[0]}`
    p2 = `@${mentions[1].split('@')[0]}`
  } else if (mentions.length === 1) {
    p1 = `@${m.sender.split('@')[0]}`
    p2 = `@${mentions[0].split('@')[0]}`
    if (!mentions.includes(m.sender)) mentions.unshift(m.sender)
  } else {
    const parts = String(text || m.text || '').split(/[&,+/]|(?:\bdan\b)/i).map((s) => s.trim()).filter(Boolean)
    if (parts.length < 2) {
      return m.reply(
        `💘 *BIRO JODOH ELYSIA* 💘\n\n` +
        `Masukkan 2 nama atau tag pasangan yang mau dicek!\n` +
        `• Contoh 1: \`${m.prefix || '.'}cekjodoh Budi & Ani\`\n` +
        `• Contoh 2: \`${m.prefix || '.'}cekjodoh @user\``
      )
    }
    p1 = parts[0]
    p2 = parts[1]
  }

  const percent = Math.floor(Math.random() * 101)
  let status = ''
  let vonis = ''

  if (percent >= 90) {
    status = '💍 Soulmate Dunia Akhirat'
    vonis = 'Fix jodoh tulang rusuk! Tinggal nyari gedung resepsi sama katering prasmanan aja ini mah!'
  } else if (percent >= 75) {
    status = '💕 Bucin Serasi'
    vonis = 'Cocok banget! Kalau jalan bareng bikin jomblo satu kecamatan iri dengki.'
  } else if (percent >= 50) {
    status = '✨ Teman Tapi Mesra (TTM)'
    vonis = 'Lumayan nyambung! Tinggal dikurangin gengsinya biar gak cuma mentok di "kakak-adikan".'
  } else if (percent >= 25) {
    status = '🚧 Rawan Perang Dunia'
    vonis = 'Baru ngobrol 10 menit aja udah debat kusir, tapi anehnya besok masih saling nyariin.'
  } else {
    status = '🌵 Bagai Minyak dan Air'
    vonis = 'Waduh, mending temenan mabar atau patungan beli gorengan aja daripada makan hati!'
  }

  const msg =
    `╭───〔 💘 *RADAR BIRO JODOH* 💘 〕───╮\n` +
    `│ 💑 *Pasangan* : ${p1} ❤️ ${p2}\n` +
    `│ 📊 *Kecocokan*: *${percent}%*\n` +
    `│ ${loveBar(percent)}\n` +
    `│ 🏷️ *Status*   : *${status}*\n` +
    `╰────────────────────────────────╯\n\n` +
    `🔮 *Ramalan Dukun Cinta:*\n` +
    `${vonis}\n\n` +
    `🍿 *Potensi Drama Harian:*\n` +
    `> _"${pick(DRAMA)}"_`

  await m.reply(msg, { mentions })
}

export { pluginConfig as config, handler }
