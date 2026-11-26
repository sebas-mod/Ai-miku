/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
  name: 'ceksifat',
  alias: ['sifat'],
  category: 'cek',
  description: 'Cek sifat luar vs sifat asli kamu (hiburan)',
  usage: '.ceksifat [@tag/nama]',
  example: '.ceksifat @user',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
    isRegistered: true,
  isAdmin: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
}

const LUAR = [
  'Pendiam, kalem, dan kelihatan alim banget',
  'Cool, cuek bebek, berwibawa kayak kulkas 2 pintu',
  'Ramah, murah senyum, suka nyapa duluan',
  'Tegas, serius, kelihatan galak kalau belum kenal',
  'Polos, lugu, kayak gak pernah bikin dosa',
  'Ceria terus kayak gak punya beban cicilan'
]

const ASLI = [
  'Sekali akrab langsung berubah jadi toa pasar & pelawak grup',
  'Hatinya selembut Hello Kitty, nonton iklan sedih aja berkaca-kaca',
  'Aslinya tukang rebahan profesional & suka panik kalau baterai HP < 20%',
  'Perut karet! Kalau diajak makan gratis langsung paling depan',
  'Overthinking jam 2 pagi mikirin hal random yang kejadian 5 tahun lalu',
  'Setia kawan banget, rela pasang badan buat sahabatnya'
]

const RED_FLAG = [
  'Kalau lapar berubah jadi monster, jangan diajak debat sebelum makan',
  'Suka bilang "OTW" padahal baru ambil handuk mau mandi',
  'Slow respon kalau lagi asik scroll TikTok / main game',
  'Gampang luluh kalau dibujuk pakai jajanan manis atau kopi susu',
  'Suka ngilang tiba-tiba karena baterai sosialnya habis'
]

const GREEN_FLAG = [
  'Pendengar curhat terbaik dan jago jaga rahasia',
  'Nggak perhitungan soal uang makan sama temen sendiri',
  'Selalu inget hal-hal kecil yang disukai orang terdekatnya',
  'Jujur apa adanya dan anti muka dua di tongkrongan',
  'Bikin suasana langsung hidup kalau dia datang'
]

const pick = (a) => a[Math.floor(Math.random() * a.length)]

function getTarget(m, text) {
  if (m.mentionedJid?.length) {
    const jid = m.mentionedJid[0]
    return { name: `@${jid.split('@')[0]}`, mentions: [jid] }
  }
  if (m.quoted?.sender) {
    const jid = m.quoted.sender
    return { name: `@${jid.split('@')[0]}`, mentions: [jid] }
  }
  if (text && text.trim()) return { name: text.trim(), mentions: [] }
  return { name: `@${(m.sender || '').split('@')[0]}`, mentions: [m.sender] }
}

const handler = async (m, { text }) => {
  const target = getTarget(m, text)
  const msg =
    `╭───〔 🎭 *ANALISIS SIFAT & KARAKTER* 🎭 〕───╮\n` +
    `│ 👤 *Target* : ${target.name}\n` +
    `╰────────────────────────────────────╯\n\n` +
    `😇 *Kesan Pertama (Pencitraan):*\n` +
    `• ${pick(LUAR)}\n\n` +
    `🤪 *Sifat Asli (Kalau Udah Kenal):*\n` +
    `• ${pick(ASLI)}\n\n` +
    `🚩 *Red Flag Kocak:*\n` +
    `• ${pick(RED_FLAG)}\n\n` +
    `✅ *Green Flag Terbaik:*\n` +
    `• ${pick(GREEN_FLAG)}`

  await m.reply(msg, { mentions: target.mentions })
}

export { pluginConfig as config, handler }
