/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
  name: 'cektinggi',
  alias: ['tinggi', 'tall'],
  category: 'cek',
  description: 'Meteran laser cek tinggi badan random',
  usage: '.cektinggi [@tag/nama]',
  example: '.cektinggi @user',
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

  const tinggi = Math.floor(Math.random() * 52) + 145
  let gelar = ''
  let komen = ''

  if (tinggi >= 185) {
    gelar = '🗼 Tiang Sinyal 5G / Model Basket'
    komen = 'Tinggi menjulang! Kalau ganti bohlam lampu gak perlu pake tangga lagi.'
  } else if (tinggi >= 172) {
    gelar = '😎 Tinggi Idaman Proporsional'
    komen = 'Ukuran pas buat ngambilin barang di rak atas minimarket!'
  } else if (tinggi >= 162) {
    gelar = '👍 Standar Ideal Nusantara'
    komen = 'Nyaman di segala medan, gak kepentok pintu angkot.'
  } else if (tinggi >= 153) {
    gelar = '🌸 Minimalis & Lincah'
    komen = 'Hemat tempat dan selalu dapat posisi paling depan kalau foto bareng.'
  } else {
    gelar = '🐣 Mungil Gemoy Sachet'
    komen = 'Imut maksimal! Umur boleh nambah tapi tinggi tetap konsisten awet muda.'
  }

  const msg =
    `╭───〔 📏 *METERAN LASER ELYSIA* 📏 〕───╮\n` +
    `│ 👤 *Target* : ${label}\n` +
    `│ 📐 *Tinggi* : *${tinggi} CM*\n` +
    `│ 🏷️ *Gelar*  : *${gelar}*\n` +
    `╰──────────────────────────────────╯\n\n` +
    `💬 *Catatan Pengukuran:*\n` +
    `> _"${komen}"_`

  await m.reply(msg, { mentions })
}

export { pluginConfig as config, handler }
