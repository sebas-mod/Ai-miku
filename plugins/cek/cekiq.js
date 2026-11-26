/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
  name: 'cekiq',
  alias: ['iq'],
  category: 'cek',
  description: 'Cek skor IQ & kapasitas RAM otak (hiburan)',
  usage: '.cekiq [@tag/nama]',
  example: '.cekiq @user',
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

function getAnalysis(iq) {
  if (iq < 60) return { title: '🥔 Kentang Rebus (RAM 128 MB)', note: 'Loading otak sering buffering kalau ditanya mendadak, tapi jago menghibur teman!' }
  if (iq < 85) return { title: '🐢 Prosesor Dual-Core Santuy', note: 'Mikirnya santai gak mau buru-buru. Kalau ada soal susah langsung pilih tidur.' }
  if (iq < 110) return { title: '🙂 Warga Waras Standar SNI', note: 'Otak bekerja normal dan seimbang, paling encer kalau ngitung diskon belanjaan.' }
  if (iq < 135) return { title: '😎 Ilmuwan Tongkrongan', note: 'Cepat tanggap, jago ngasih solusi, dan jadi andalan pas kerja kelompok.' }
  if (iq < 160) return { title: '🧠 Profesor Cabang WhatsApp', note: 'Otaknya setajam silet! Sekali baca langsung paham di luar kepala.' }
  return { title: '👑 Suhu Albert Einstein Reborn', note: 'Kapasitas otak Unlimited! NASA dan BMKG siap merekrutmu kapan saja.' }
}

async function handler(m, { text }) {
  const jid = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  const label = (text && !m.mentionedJid?.length && !m.quoted?.sender) ? text.trim() : `@${jid.split('@')[0]}`
  const mentions = label.startsWith('@') ? [jid] : []

  const iq = 45 + Math.floor(Math.random() * 145)
  const info = getAnalysis(iq)

  const msg =
    `╭───〔 🧠 *HASIL CT-SCAN LOGIKA & IQ* 🧠 〕───╮\n` +
    `│ 👤 *Subjek*   : ${label}\n` +
    `│ 📊 *Skor IQ*  : *${iq} Poin*\n` +
    `│ 🏷️ *Kategori* : *${info.title}*\n` +
    `╰──────────────────────────────────────╯\n\n` +
    `📋 *Catatan Laboratorium:*\n` +
    `> _"${info.note}"_`

  await m.reply(msg, { mentions })
}

export { pluginConfig as config, handler }
