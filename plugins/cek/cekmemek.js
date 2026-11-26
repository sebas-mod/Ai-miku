/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
  name: 'cekmemek',
  alias: ["memek"],
  category: 'cek',
  description: 'Cek tipe kocak (hiburan 18+)',
  usage: '.cekmemek [@tag/nama]',
  example: '.cekmemek @user',
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
  { type: 'Pink Glowing Wangi Stroberi 🌸', grade: 'SSR+ Limited Edition', note: 'Terawat maksimal bak istana kerajaan.' },
  { type: 'Tembem Mulus Standar Pabrik ✨', grade: 'SR Premium', note: 'Rapi, bersih, dan lulus sensor kualitas tinggi.' },
  { type: 'Hutan Rimba Kalimantan 🌳', grade: 'Nature Explorer', note: 'Alami, rimbun, dan penuh petualangan misterius.' },
  { type: 'Kencang Berenergi Tinggi ⚡', grade: 'Turbo Edition', note: 'Daya cengkeram setara kunci inggris bengkel resmi.' },
  { type: 'Eksotis Manis Legit 🍯', grade: 'Local Pride', note: 'Klasik, menawan, dan bikin kangen.' }
]

const pick = (a) => a[Math.floor(Math.random() * a.length)]

async function handler(m, { text }) {
  const jid = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  const label = (text && !m.mentionedJid?.length && !m.quoted?.sender) ? text.trim() : `@${jid.split('@')[0]}`
  const mentions = label.startsWith('@') ? [jid] : []
  const it = pick(ITEMS)

  const msg =
    `╭───〔 🌺 *RADAR INSPEKSI KOCAK* 🌺 〕───╮\n` +
    `│ 👤 *Target* : ${label}\n` +
    `│ 🎀 *Tipe*   : *${it.type}*\n` +
    `│ 🏆 *Grade*  : *${it.grade}*\n` +
    `╰────────────────────────────────────╯\n\n` +
    `💬 *Catatan Radar:*\n` +
    `> _"${it.note}"_`

  await m.reply(msg, { mentions })
}

export { pluginConfig as config, handler }
