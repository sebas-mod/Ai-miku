/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
  name: 'cekberat',
  alias: ['berat', 'weight'],
  category: 'cek',
  description: 'Timbangan ghaib cek berat badan kocak',
  usage: '.cekberat [@tag/nama]',
  example: '.cekberat @user',
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

  const berat = Math.floor(Math.random() * 65) + 38
  let gelar = ''
  let komen = ''

  if (berat >= 90) {
    gelar = '🐻 Titan Penguasa Prasmanan'
    komen = 'Mantap berwibawa! Sekali duduk di kursi plastik, kursinya langsung berdoa minta kekuatan.'
  } else if (berat >= 72) {
    gelar = '🍔 Gemoy Makmur Sejahtera'
    komen = 'Bukti nyata hidup bahagia dan pantang menolak ajakan makan malam!'
  } else if (berat >= 55) {
    gelar = '✨ Ideal Proporsional'
    komen = 'Passs banget! Mau lari dikejar kenyataan atau rebahan tetep seimbang.'
  } else if (berat >= 45) {
    gelar = '🌿 Langsing Aerodinamis'
    komen = 'Ramping banget, jalan di tengah kerumunan bisa selap-selip kayak motor matic.'
  } else {
    gelar = '🍃 Ringan Melayang'
    komen = 'Awas kalau keluar pas angin kencang, pegangan tiang listrik biar gak ikut terbang!'
  }

  const msg =
    `╭───〔 ⚖️ *TIMBANGAN GHAIB DIGITAL* ⚖️ 〕───╮\n` +
    `│ 👤 *Target* : ${label}\n` +
    `│ 🏋️ *Bobot*  : *${berat} KG*\n` +
    `│ 🏷️ *Status* : *${gelar}*\n` +
    `╰────────────────────────────────────╯\n\n` +
    `💬 *Komentar Timbangan:*\n` +
    `> _"${komen}"_`

  await m.reply(msg, { mentions })
}

export { pluginConfig as config, handler }
