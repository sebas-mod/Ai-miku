/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
  name: 'ceksisaumur',
  alias: ['sisaumur'],
  category: 'cek',
  description: 'Kalkulator sisa kuota umur (hiburan bercanda)',
  usage: '.ceksisaumur [@tag/nama]',
  example: '.ceksisaumur @user',
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

  const tahun = Math.floor(Math.random() * 75) + 25
  const bulan = Math.floor(Math.random() * 12)
  const hari = Math.floor(Math.random() * 29) + 1
  const jam = Math.floor(Math.random() * 24)

  let pesan = ''
  if (tahun >= 75) {
    pesan = 'Panjang umur banget! Bakal sempat liat cucu-cicit main robot terbang.'
  } else if (tahun >= 50) {
    pesan = 'Masih lama banget! Jangan lupa kurangi begadang dan perbanyak senyum.'
  } else {
    pesan = 'Tetap jaga kesehatan, rajin olahraga, dan jangan telat makan ya!'
  }

  const msg =
    `╭───〔 ⏳ *PREDIKSI KUOTA UMUR (HIBURAN)* ⏳ 〕───╮\n` +
    `│ 👤 *Target*  : ${label}\n` +
    `│ 🗓️ *Estimasi*: *${tahun} Thn, ${bulan} Bln, ${hari} Hari, ${jam} Jam*\n` +
    `╰──────────────────────────────────────────╯\n\n` +
    `💡 *Catatan:* Umur sejati hanya Tuhan yang tahu. ${pesan}`

  await m.reply(msg, { mentions })
}

export { pluginConfig as config, handler }
