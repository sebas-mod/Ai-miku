/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
const pluginConfig = {
  name: 'cekkhodam',
  alias: ['khodam'],
  category: 'cek',
  description: 'Cek khodam pendamping (versi kocak & lengkap)',
  usage: '.cekkhodam [@tag/nama]',
  example: '.cekkhodam @user',
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

const KHODAMS = [
  { name: 'Kucing Oren Berpeci', elem: 'Api Barbar', power: 'Kebal omelan emak & jago nyolong ikan asin', pantangan: 'Jangan liat kardus kosong' },
  { name: 'Kulkas 2 Pintu LG', elem: 'Es Abadi', power: 'Bikin suasana tongkrongan langsung dingin membeku', pantangan: 'Jangan sering dibuka tutup kalau gak beli apa-apa' },
  { name: 'Tuyul Pake Skincare', elem: 'Cahaya Glowing', power: 'Saldo receh aman, muka tetep kinclong pas begadang', pantangan: 'Takut sinar matahari jam 12 siang' },
  { name: 'Naga Indosiar Rebahan', elem: 'Angin Halu', power: 'Efek CGI dramatis tiap kali kamu alasan telat', pantangan: 'Kalah sama remote TV' },
  { name: 'Sendal Swallow Putus Sebelah', elem: 'Tanah Mushola', power: 'Menghilang secara misterius pas lagi dibutuhin', pantangan: 'Jangan dipake lari dikejar anjing' },
  { name: 'Rice Cooker Miyako Legend', elem: 'Uap Hangat', power: 'Setia menemani anak kos di akhir bulan', pantangan: 'Lupa pencet tombol Cook ke Warm' },
  { name: 'Kuntilanak Cosplay Anime', elem: 'Bayangan Wibu', power: 'Ketawa "hihihi" berubah jadi "ara-ara~"', pantangan: 'Jangan dikasih bawang putih goreng' },
  { name: 'Biawak Berdasi Eksekutif', elem: 'Air Got', power: 'Kelihatan rapi padahal aslinya siap nyebur kapan aja', pantangan: 'Liat genangan air hujan' },
  { name: 'Cicak Kejepit Pintu', elem: 'Dinding Keramat', power: 'Tahan banting walau hidup sering digeprek keadaan', pantangan: 'Jangan nongkrong di engsel pintu' },
  { name: 'Pocong Lompat Indah', elem: 'Tanah Kuburan', power: 'Lincah menghindari tagihan utang & tugas kelompok', pantangan: 'Tali pocong kendor pas lagi buru-buru' },
  { name: 'Galon Aqua Kosong', elem: 'Suara Nyaring', power: 'Tong kosong nyaring bunyinya, jago debat kusir', pantangan: 'Jangan ditendang jam 2 malam' },
  { name: 'Harimau Putih Suka Seblak', elem: 'Pedas Level 10', power: 'Auman menggelegar tapi perut gampang mulas', pantangan: 'Makan kerupuk bantat' },
  { name: 'Kipas Angin Cosmos Wadesta', elem: 'Angin Duduk', power: 'Nempel di dinding, meja, dan lantai tanpa kenal lelah', pantangan: 'Debu numpuk di baling-baling' },
  { name: 'Tutup Panci Penyok', elem: 'Logam Dapur', power: 'Tangkis semua gosip tetangga dengan bunyi berisik', pantangan: 'Jatuh di lantai keramik tengah malam' },
  { name: 'Kecoa Terbang Mode Tempur', elem: 'Udara Chaos', power: 'Bikin satu ruangan cowok kekar langsung histeris', pantangan: 'Sandal jepit melayang' },
  { name: 'Monyet Pakai Jas Hujan', elem: 'Hutan Tropis', power: 'Tetap santai ngemil pisang di tengah badai masalah', pantangan: 'Kehabisan kuota malam' },
  { name: 'Termos Es Teh Jumbo', elem: 'Kesegaran Abadi', power: 'Penyelamat dahaga warga di siang bolong', pantangan: 'Es batunya cair duluan' },
  { name: 'Bebek Knalpot Brong', elem: 'Suara Bising', power: 'Datang dari jarak 1 KM udah kedengeran satu RT', pantangan: 'Polisi tidur tinggi' },
  { name: 'Lele Terbang Bersayap', elem: 'Lumpur Keramat', power: 'Licin banget kalau disuruh bayar kas grup', pantangan: 'Sambal pecel lele pinggir jalan' },
  { name: 'Setrika Arang Warisan Nenek', elem: 'Panas Membara', power: 'Melicinkan segala alasan di depan dosen/guru', pantangan: 'Kena air hujan' },
  { name: 'Kera Sakti Lupa Mantra', elem: 'Awan Kinton KW', power: 'Punya seribu jurus tapi sering lupa pas ujian', pantangan: 'Dikasih soal matematika' },
  { name: 'Genderuwo Diet Keto', elem: 'Hutan Gelap', power: 'Badan kekar tapi nolak makan nasi malam-malam', pantangan: 'Aroma nasi goreng lewat depan rumah' },
  { name: 'Sapu Lidi Terbang', elem: 'Kebersihan Gaib', power: 'Menyapu bersih gorengan di meja dalam 3 detik', pantangan: 'Karet pengikatnya putus' },
  { name: 'Kباس/Toples Khong Guan Isi Rengginang', elem: 'Ilusi Harapan', power: 'Jago memberi harapan palsu ke orang-orang sekitar', pantangan: 'Dibuka pas Lebaran' }
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
  const k = pick(KHODAMS)
  const syncRate = 55 + Math.floor(Math.random() * 45)

  const msg =
    `╭───〔 🔮 *TERAWANG KHODAM GAIB* 🔮 〕───╮\n` +
    `│ 👤 *Pemilik*   : ${target.name}\n` +
    `│ 👻 *Khodam*    : *${k.name}*\n` +
    `│ 🔥 *Elemen*    : ${k.elem}\n` +
    `│ 🔗 *Sinkron*   : *${syncRate}%*\n` +
    `╰──────────────────────────────────╯\n\n` +
    `⚡ *Kesaktian Utama:*\n` +
    `> ${k.power}\n\n` +
    `🚫 *Pantangan Khodam:*\n` +
    `> _"${k.pantangan}"_`

  await m.reply(msg, { mentions: target.mentions })
}

export { pluginConfig as config, handler }
