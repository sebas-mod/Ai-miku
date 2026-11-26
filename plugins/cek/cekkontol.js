/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
  name: 'cekkontol',
  alias: ["kontol"],
  category: 'cek',
  description: 'Cek ukuran kocak (hiburan 18+)',
  usage: '.cekkontol [@tag/nama]',
  example: '.cekkontol @user',
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

const ITEMS = [
  { size: '3 cm (Mode Hemat Baterai)', julukan: 'Si Cabe Rawit Mungil', note: 'Kalau kena air dingin langsung sembunyi malu-malu.' },
  { size: '8 cm (Standar Kalem)', julukan: 'Pejuang Tangguh', note: 'Kecil-kecil cabe rawit, lincah bermanuver.' },
  { size: '13 cm (Lurus Presisi SNI)', julukan: 'Kasta Menengah Idaman', note: 'Lurus rapi kayak penggaris ujian nasional.' },
  { size: '17 cm (Tebal Berotot)', julukan: 'Rudal Balistik Lokal', note: 'Bikin celana jeans berasa sempit terus.' },
  { size: '21 cm (Super Monster)', julukan: 'Tiang Listrik berjalan', note: 'Waduh, ini mah udah masuk kategori senjata tajam!' },
  { size: '5 cm (Miring ke Kiri 15°)', julukan: 'Belokan Tajam', note: 'Unik dan punya gaya aerodinamis tersendiri.' }
]

const pick = (a) => a[Math.floor(Math.random() * a.length)]

async function handler(m, { text }) {
  const jid = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  const label = (text && !m.mentionedJid?.length && !m.quoted?.sender) ? text.trim() : `@${jid.split('@')[0]}`
  const mentions = label.startsWith('@') ? [jid] : []
  const it = pick(ITEMS)

  const msg =
    `╭───〔 🍌 *RADAR UKURAN KOCAK* 🍌 〕───╮\n` +
    `│ 👤 *Target*  : ${label}\n` +
    `│ 📏 *Ukuran*  : *${it.size}*\n` +
    `│ 🏷️ *Julukan* : *${it.julukan}*\n` +
    `╰──────────────────────────────────╯\n\n` +
    `💬 *Vonis Radar:*\n` +
    `> _"${it.note}"_`

  await m.reply(msg, { mentions })
}

export { pluginConfig as config, handler }
