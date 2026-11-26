/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
  name: 'cekkepribadian',
  alias: ['kepribadian', 'personality', 'mbti'],
  category: 'cek',
  description: 'Cek tipe kepribadian MBTI versi tongkrongan',
  usage: '.cekkepribadian [@tag/nama]',
  example: '.cekkepribadian @user',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
    isRegistered: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true
}

const PERSONALITIES = [
  { type: 'INTJ', title: 'Si Arsitek Skenario', desc: 'Otaknya penuh rencana 10 tahun ke depan, jarang ngomong tapi sekali ngomong langsung skakmat.', habit: 'Suka menganalisis plot film sampe detail terkecil' },
  { type: 'INTP', title: 'Profesor Rebahan', desc: 'Jenius logika tapi kamarnya berantakan. Bisa begadang sampe subuh cuma buat baca Wikipedia random.', habit: 'Sering buka 40 tab browser sekaligus' },
  { type: 'ENTJ', title: 'Komandan Tongkrongan', desc: 'Tegas, ambisius, dan otomatis jadi ketua kelompok walau gak mencalonkan diri.', habit: 'Gregetan kalau liat orang kerjanya lambat' },
  { type: 'ENTP', title: 'Si Raja Debat', desc: 'Cerdas, jahil, dan hobi mendebat pendapat orang cuma buat olahraga otak.', habit: 'Punya 1001 ide bisnis tapi baru jalan 2' },
  { type: 'INFJ', title: 'Dukun Psikologi', desc: 'Peka banget! Baru liat cara ketik temennya aja udah tau lagi ada masalah hidup.', habit: 'Tempat curhat gratis seluruh warga grup' },
  { type: 'INFP', title: 'Pujangga Senja', desc: 'Kreatif, hati selembut kapas, dan punya dunia imajinasi yang lebih seru dari dunia nyata.', habit: 'Suka menghayal jadi karakter utama sambil denger lagu' },
  { type: 'ENFJ', title: 'Motivator Sejati', desc: 'Hangat, suportif, dan selalu menyemangati temennya walau dirinya sendiri lagi pusing.', habit: 'Tidak tega nolak permintaan tolong' },
  { type: 'ENFP', title: 'Baterai Energizer', desc: 'Heboh, ramah ke semua makhluk hidup, dan gampang terdistraksi hal-hal lucu.', habit: 'Bisa akrab sama orang asing di angkot dalam 5 menit' },
  { type: 'ISTJ', title: 'Si Paling Terjadwal', desc: 'Disiplin, tepat waktu, anti drama, dan paling bisa diandalkan kalau urusan serius.', habit: 'Paling sebel kalau janji jam 7 datangnya jam 9' },
  { type: 'ISFJ', title: 'Malaikat Pelindung', desc: 'Sabar, perhatian, dan diam-diam selalu memastikan semua temennya pulang dengan selamat.', habit: 'Selalu bawa tisu atau obat di tasnya' },
  { type: 'ESTJ', title: 'Mandor Proyek', desc: 'To the point, rapi, dan paling jago ngatur acara bukber biar gak cuma wacana.', habit: 'Suka nagihin iuran kas tepat waktu' },
  { type: 'ESFJ', title: 'Duta Persahabatan', desc: 'Humble, suka traktir, dan hafal semua berita terbaru di satu lingkaran pertemanan.', habit: 'Paling rajin ngucapin ulang tahun jam 00.00' },
  { type: 'ISTP', title: 'Mekanik Santuy', desc: 'Cool, irit bicara, tapi jago benerin barang rusak dengan tangan kosong.', habit: 'Tetap tenang walau situasi lagi chaos berat' },
  { type: 'ISFP', title: 'Seniman Estetik', desc: 'Kalem, selera musik & fotonya bagus banget, paling anti diatur-atur.', habit: 'Tiba-tiba ngilang buat healing sendirian' },
  { type: 'ESTP', title: 'Si Nekat Pemberani', desc: 'Spontan, suka tantangan, dan motto hidupnya "gas dulu urusan belakangan".', habit: 'Paling pertama ngajak jalan dadakan jam 11 malam' },
  { type: 'ESFP', title: 'Bintang Panggung', desc: 'Kocak, ekspresif, dan selalu sukses bikin suasana grup yang kuburan jadi rame lagi.', habit: 'Ada aja tingkah konyolnya tiap hari' }
]

const pick = (a) => a[Math.floor(Math.random() * a.length)]

async function handler(m, { text }) {
  const jid = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  const label = (text && !m.mentionedJid?.length && !m.quoted?.sender) ? text.trim() : `@${jid.split('@')[0]}`
  const mentions = label.startsWith('@') ? [jid] : []
  const p = pick(PERSONALITIES)
  const socialBattery = 15 + Math.floor(Math.random() * 85)

  const msg =
    `╭───〔 🧩 *TES KEPRIBADIAN MBTI* 🧩 〕───╮\n` +
    `│ 👤 *Target*  : ${label}\n` +
    `│ 🏷️ *Tipe*    : *${p.type} (${p.title})*\n` +
    `│ 🔋 *Baterai Sosial* : *${socialBattery}%*\n` +
    `╰──────────────────────────────────╯\n\n` +
    `📖 *Karakteristik Utama:*\n` +
    `${p.desc}\n\n` +
    `🔎 *Kebiasaan Khas:*\n` +
    `> _"${p.habit}"_`

  await m.reply(msg, { mentions })
}

export { pluginConfig as config, handler }
