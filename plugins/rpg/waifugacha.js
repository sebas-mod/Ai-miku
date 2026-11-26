/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'
import fs from 'fs'
import axios from 'axios'

const fmt = ElysiaRuntime.fiturFmt;
const wibDay = ElysiaRuntime.wibDay;
const durasi = ElysiaRuntime.durasi;
const rpgDb = ElysiaRuntime.rpgDb;
const saveRpg = ElysiaRuntime.saveRpg;
const initRpgUser = ElysiaRuntime.initRpgUser;

// ═════════ ENGINE GACHA ═════════

const RAR = {
    N:   { urut: 1, emoji: '⚪', bintang: '★',     refund: 500,   poin: 1,  power: [40, 80] },
    R:   { urut: 2, emoji: '🟢', bintang: '★★',    refund: 1500,  poin: 3,  power: [80, 140] },
    SR:  { urut: 3, emoji: '🔵', bintang: '★★★',   refund: 4000,  poin: 8,  power: [140, 220] },
    SSR: { urut: 4, emoji: '🟣', bintang: '★★★★',  refund: 12000, poin: 25, power: [220, 330] },
    UR:  { urut: 5, emoji: '🌈', bintang: '★★★★★', refund: 40000, poin: 80, power: [330, 480] }
}

// persen. UR 0.7 + SSR 3.3 + SR 12 + R 34 + N 50 = 100
const RATE = { UR: 0.7, SSR: 3.3, SR: 12, R: 34, N: 50 }

const CFG = {
    biaya: 5000,
    biaya10: 45000,          // diskon 10%
    cooldownDetik: 8,
    maxPullPerHari: 100,
    softPityMulai: 60,       // mulai naik di tarikan ke-60 tanpa UR
    softNaik: 6,             // +6% per tarikan setelahnya
    hardPity: 80,            // tarikan ke-80 PASTI UR
    jaminSR: 10,             // minimal SR tiap 10 tarikan
    jaminSSR: 30,            // minimal SSR tiap 30 tarikan
    maxKizuna: 10,
    peluangFeatured: 0.5     // 50/50, kalah = UR berikutnya pasti featured
}

// c(rarity, nama, anime, queryPencarianFoto?, urlFotoManual?)
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const c = (r, nama, anime, q = null, img = null) => ({ id: slug(nama), r, nama, anime, q, img })

const ROSTER = [
    // ── UR ──
    c('UR', 'Makima', 'Chainsaw Man'),
    c('UR', 'Frieren', 'Sousou no Frieren'),
    c('UR', 'Yor Forger', 'Spy x Family'),
    c('UR', 'Rem', 'Re:Zero kara Hajimeru Isekai Seikatsu'),
    c('UR', 'Zero Two', 'Darling in the FranXX'),
    c('UR', 'Elysia Assistant Shinomiya', 'Elysia Assistant-sama wa Kokurasetai'),
    // ── SSR ──
    c('SSR', 'Mikasa Ackerman', 'Shingeki no Kyojin'),
    c('SSR', 'Asuna Yuuki', 'Sword Art Online'),
    c('SSR', 'Megumin', 'Kono Subarashii Sekai ni Shukufuku wo!'),
    c('SSR', 'Marin Kitagawa', 'Sono Bisque Doll wa Koi wo Suru'),
    c('SSR', 'Hinata Hyuuga', 'Naruto'),
    c('SSR', 'Violet Evergarden', 'Violet Evergarden'),
    c('SSR', 'Nami', 'One Piece'),
    c('SSR', 'Nico Robin', 'One Piece'),
    // ── SR ──
    c('SR', 'Erza Scarlet', 'Fairy Tail'),
    c('SR', 'Chika Fujiwara', 'Elysia Assistant-sama wa Kokurasetai'),
    c('SR', 'Emilia', 'Re:Zero kara Hajimeru Isekai Seikatsu'),
    c('SR', 'Aqua', 'Kono Subarashii Sekai ni Shukufuku wo!'),
    c('SR', 'Albedo', 'Overlord'),
    c('SR', 'Mai Sakurajima', 'Seishun Buta Yarou'),
    c('SR', 'Hestia', 'DanMachi'),
    c('SR', 'Ai Hayasaka', 'Elysia Assistant-sama wa Kokurasetai'),
    c('SR', 'Nezuko Kamado', 'Kimetsu no Yaiba'),
    c('SR', 'Ochaco Uraraka', 'Boku no Hero Academia'),
    // ── R ──
    c('R', 'Rei Ayanami', 'Neon Genesis Evangelion'),
    c('R', 'Asuka Langley', 'Neon Genesis Evangelion', 'Asuka Langley'),
    c('R', 'Mikoto Misaka', 'To Aru Kagaku no Railgun'),
    c('R', 'Shinobu Kocho', 'Kimetsu no Yaiba'),
    c('R', 'Holo', 'Spice and Wolf'),
    c('R', 'Kurisu Makise', 'Steins;Gate'),
    c('R', 'Taiga Aisaka', 'Toradora!'),
    c('R', 'Mitsuha Miyamizu', 'Kimi no Na wa.'),
    c('R', 'Nobara Kugisaki', 'Jujutsu Kaisen'),
    c('R', 'Ryuko Matoi', 'Kill la Kill'),
    // ── N ──
    c('N', 'Yui Hirasawa', 'K-On!'),
    c('N', 'Mio Akiyama', 'K-On!'),
    c('N', 'Konata Izumi', 'Lucky Star'),
    c('N', 'Tohru', 'Kobayashi-san Chi no Maid Dragon'),
    c('N', 'Hitori Gotoh', 'Bocchi the Rock!', 'Hitori Gotou'),
    c('N', 'Nijika Ijichi', 'Bocchi the Rock!'),
    c('N', 'Ryo Yamada', 'Bocchi the Rock!'),
    c('N', 'Ikuyo Kita', 'Bocchi the Rock!'),
    c('N', 'Kobeni Higashiyama', 'Chainsaw Man'),
    c('N', 'Kyouko Hori', 'Horimiya')
]

const POOL = { N: [], R: [], SR: [], SSR: [], UR: [] }
const BY_ID = {}
for (const w of ROSTER) { POOL[w.r].push(w); BY_ID[w.id] = w }

// ── Banner mingguan (ganti tiap Kamis 00:00 WIB) ──
const WIB = 7 * 3_600_000
const MINGGU = 7 * 86_400_000
function bannerMingguIni(now = Date.now()) {
    const minggu = Math.floor((now + WIB) / MINGGU)
    return POOL.UR[minggu % POOL.UR.length]
}
function sisaBanner(now = Date.now()) {
    const minggu = Math.floor((now + WIB) / MINGGU)
    return (minggu + 1) * MINGGU - WIB - now
}

// ── State per-user (disimpan di user.waifu) ──
function state(user) {
    const d = {
        box: {}, total: 0, pityUR: 0, pitySR: 0, pitySSR: 0, jaminFeatured: false,
        day: '', pullHariIni: 0, free: false, last: 0, fav: null
    }
    if (!user.waifu || typeof user.waifu !== 'object') user.waifu = d
    else for (const k in d) if (!(k in user.waifu)) user.waifu[k] = d[k]
    return user.waifu
}

// ── Satu tarikan ──
function tarikSatu(W, rng = Math.random, now = Date.now()) {
    W.pityUR++; W.pitySR++; W.pitySSR++

    let urRate = RATE.UR
    if (W.pityUR >= CFG.softPityMulai) urRate += (W.pityUR - CFG.softPityMulai + 1) * CFG.softNaik
    if (W.pityUR >= CFG.hardPity) urRate = 100

    let r
    if (rng() * 100 < urRate) r = 'UR'
    else {
        const y = rng() * (100 - RATE.UR)
        if (y < RATE.SSR) r = 'SSR'
        else if (y < RATE.SSR + RATE.SR) r = 'SR'
        else if (y < RATE.SSR + RATE.SR + RATE.R) r = 'R'
        else r = 'N'
        if (W.pitySSR >= CFG.jaminSSR && RAR[r].urut < RAR.SSR.urut) r = 'SSR'
        else if (W.pitySR >= CFG.jaminSR && RAR[r].urut < RAR.SR.urut) r = 'SR'
    }

    if (r === 'UR') { W.pityUR = 0; W.pitySR = 0; W.pitySSR = 0 }
    else if (r === 'SSR') { W.pitySR = 0; W.pitySSR = 0 }
    else if (r === 'SR') { W.pitySR = 0 }

    let w, featuredHit = false, kalah5050 = false
    if (r === 'UR') {
        const fe = bannerMingguIni(now)
        const lain = POOL.UR.filter((x) => x.id !== fe.id)
        if (W.jaminFeatured || rng() < CFG.peluangFeatured) {
            w = fe; featuredHit = true; W.jaminFeatured = false
        } else {
            w = lain[Math.floor(rng() * lain.length)]; kalah5050 = true; W.jaminFeatured = true
        }
    } else {
        const p = POOL[r]
        w = p[Math.floor(rng() * p.length)]
    }
    return { r, w, featuredHit, kalah5050 }
}

// Masukkan hasil tarikan ke box. Return info per hasil (baru / kizuna / refund)
function simpan(W, hasil, now = Date.now()) {
    return hasil.map((h) => {
        const e = W.box[h.w.id]
        if (!e) {
            W.box[h.w.id] = { lv: 1, t: now }
            return { ...h, baru: true, lv: 1, refund: 0 }
        }
        if (e.lv >= CFG.maxKizuna) return { ...h, baru: false, lv: e.lv, refund: RAR[h.r].refund, max: true }
        e.lv++
        return { ...h, baru: false, lv: e.lv, refund: 0 }
    })
}

// ── Statistik kartu (deterministik per karakter, naik tiap kizuna) ──
function hash(s) {
    let h = 2166136261
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
    return h >>> 0
}
function stat(w, lv = 1) {
    const [a, b] = RAR[w.r].power
    const pick = (k) => a + (hash(w.id + k) % (b - a + 1))
    const bonus = 1 + (lv - 1) * 0.08
    return { atk: Math.round(pick('atk') * bonus), def: Math.round(pick('def') * bonus), pesona: Math.round(pick('pes') * bonus) }
}

// ── Koleksi ──
function urutan(W) {
    return Object.keys(W.box)
        .map((id) => (BY_ID[id] ? { w: BY_ID[id], lv: W.box[id].lv } : null))
        .filter(Boolean)
        .sort((x, y) => RAR[y.w.r].urut - RAR[x.w.r].urut || x.w.nama.localeCompare(y.w.nama))
}

function cari(W, q) {
    const list = urutan(W)
    q = String(q || '').trim().toLowerCase()
    if (!q) return null
    if (/^\d+$/.test(q)) return list[Number(q) - 1] || null
    return list.find((x) => x.w.nama.toLowerCase() === q) || list.find((x) => x.w.nama.toLowerCase().includes(q)) || null
}

function skor(W) {
    let s = 0
    for (const [id, e] of Object.entries(W.box || {})) {
        const w = BY_ID[id]
        if (w) s += RAR[w.r].poin * (1 + (e.lv - 1) * 0.2)
    }
    return Math.round(s)
}

const kizunaBar = (lv) => '💗'.repeat(Math.min(lv, 5)) + (lv > 5 ? `+${lv - 5}` : '')

// ═════════ PLUGIN ═════════

const pluginConfig = {
    name: "waifugacha",
    alias: [],
    category: "rpg",
    description: "Gacha waifu anime lengkap: pity, rate-up banner, kizuna, foto karakter",
    usage: ".waifugacha",
    example: ".waifugacha",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  // ─────────── Cache & foto ───────────
  const CACHE_DIR = './database/cache'
  const CACHE_FILE = `${CACHE_DIR}/waifu-img.json`
  let imgCache = new Map()
  try { imgCache = new Map(Object.entries(JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')))) } catch {}
  const saveCache = () => {
      try {
          fs.mkdirSync(CACHE_DIR, { recursive: true })
          fs.writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(imgCache)))
      } catch {}
  }

  const tok = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean)

  async function fotoWaifu(w) {
      if (w.img) return w.img
      const hit = imgCache.get(w.id)
      if (hit) return hit
      try {
          const { data } = await axios.get('https://api.jikan.moe/v4/characters', {
              params: { q: w.q || w.nama, limit: 5, order_by: 'favorites', sort: 'desc' },
              timeout: 12000
          })
          const list = data?.data || []
          const want = tok(w.nama)
          const cocok = list.find((x) => { const got = tok(x.name); return want.every((t) => got.includes(t)) })
              || list.find((x) => { const got = tok(x.name); return want.some((t) => got.includes(t)) })
          const url = cocok?.images?.jpg?.image_url
          if (url && !/questionmark|apple-touch-icon/i.test(url)) {
              imgCache.set(w.id, url)
              saveCache()
              return url
          }
      } catch (e) { console.error('[WaifuGacha] foto gagal:', w.nama, e.message) }
      return null
  }

  async function fotoCadangan() {
      try {
          const { data } = await axios.get('https://api.waifu.pics/sfw/waifu', { timeout: 10000 })
          return data?.url || null
      } catch { return null }
  }

  async function kirim(conn, m, w, caption) {
      let url = w ? await fotoWaifu(w) : null
      let cadangan = false
      if (!url) { url = await fotoCadangan(); cadangan = !!url }
      const cap = cadangan ? `${caption}\n\n_(foto asli lagi gagal dimuat, ini foto cadangan)_` : caption
      if (url) {
          try {
              if (cap.length <= 1000) return await conn.sendMessage(m.chat, { image: { url }, caption: cap }, { quoted: m })
              await conn.sendMessage(m.chat, { image: { url }, caption: cap.slice(0, 1000) }, { quoted: m })
              return await m.reply(cap.slice(1000))
          } catch (e) { console.error('[WaifuGacha] kirim gambar gagal:', e.message) }
      }
      return m.reply(cap)
  }

  // ─────────── Teks wibu ───────────
  const pilih = (a) => a[Math.floor(Math.random() * a.length)]
  const MANTRA = [
      '🔮 Kamu merapal mantra *EXPLOSION!* 💥 lingkaran sihir menyala...',
      '🌠 Bintang jatuh di langit Akihabara, takdir waifu-mu berputar...',
      '⛩️ Kamu lempar koin ke kuil dan berdoa sama kamisama...',
      '✨ Portal isekai terbuka, seseorang melangkah keluar...',
      '🌸 Kelopak sakura berhamburan, siapa yang datang ya?'
  ]
  const REAKSI = {
      UR: ['SUGOOOOI!! 🎊 UR!! Kamisama beneran dengerin doamu, senpai!', 'NANIII?!?! 🌈 Satu grup bakal iri sama kamu!', 'Ini bukan mimpi kan?! Cubit aku, darling! 💖🔥'],
      SSR: ['Yatta~! 🎉 SSR! Hari ini hoki-mu lagi on fire!', 'Kyaa~ waifu langka! 💜 Jaga baik-baik ya!'],
      SR: ['Lumayan banget, senpai! 💙 Dia bakal setia nemenin kamu~', 'Nice pull! 💙 Dikit lagi menuju SSR!'],
      R: ['Hmm, lumayan lah~ 💚 Setiap waifu itu berharga!', 'Dia malu-malu tapi mau ikut kamu 💚'],
      N: ['Ehehe... biasa aja sih, tapi tetep waifu kamu 🤍', 'Jangan sedih, senpai! Pity-mu lagi ngumpul~ 🤍']
  }

  const fmtStat = (s) => `⚔️ ATK ${s.atk} • 🛡️ DEF ${s.def} • 💖 Pesona ${s.pesona}`
  const kartu = (r, w, lv) => [
      `┃ ${RAR[r].emoji} *${r}* ${RAR[r].bintang}`,
      `┃ 👤 *${w.nama}*`,
      `┃ 📺 ${w.anime}`,
      `┃ ${fmtStat(stat(w, lv))}`
  ]

  const sisaWaktu = () => durasi(sisaBanner())

  // ─────────── Aksi ───────────
  async function aksiPull(m, conn, user, args, pfx) {
      const W = state(user)
      const hari = wibDay()
      if (W.day !== hari) { W.day = hari; W.pullHariIni = 0; W.free = false }

      const n = /^(10|x10|10x)$/i.test(args[0] || '') ? 10 : 1
      const tunggu = W.last + CFG.cooldownDetik * 1000 - Date.now()
      if (tunggu > 0) return m.reply(`⏳ Sabar dong senpai~ tunggu ${durasi(tunggu)} lagi sebelum summon.`)
      if (W.pullHariIni + n > CFG.maxPullPerHari) return m.reply(`🌙 Batas summon hari ini (${CFG.maxPullPerHari}x) udah habis. Besok lagi ya, senpai~`)

      const gratis = n === 1 && !W.free
      const biaya = gratis ? 0 : (n === 10 ? CFG.biaya10 : CFG.biaya)
      const duit = Number(user.coin) || 0
      if (duit < biaya) return m.reply(`💸 Money kurang, senpai!\n\nButuh: 💹 ${fmt(biaya)}\nPunya: 💹 ${fmt(duit)}`)

      user.coin = duit - biaya
      if (gratis) W.free = true

      const mentah = []
      for (let i = 0; i < n; i++) mentah.push(tarikSatu(W))
      W.last = Date.now()
      W.pullHariIni += n
      W.total += n
      const hasil = simpan(W, mentah)
      for (const h of hasil) if (h.refund) user.coin += h.refund

      const fe = bannerMingguIni()
      const best = hasil.reduce((a, b) => (RAR[b.r].urut > RAR[a.r].urut ? b : a), hasil[0])
      const urNya = hasil.some((h) => h.r === 'UR')
      const pityInfo = `📊 Pity UR ${W.pityUR}/${CFG.hardPity} • SR+ ${W.pitySR}/${CFG.jaminSR} • SSR+ ${W.pitySSR}/${CFG.jaminSSR}`
      const biayaInfo = gratis ? '🎁 Summon gratis harian!' : `💹 -${fmt(biaya)}`
      const saldo = `💰 Sisa money: ${fmt(user.coin)}`

      let cap
      if (n === 1) {
          const h = hasil[0]
          const status = h.baru ? '🆕 *Waifu baru masuk harem!*'
              : h.max ? `💞 Kizuna MAX! Dikonversi jadi 💹 ${fmt(h.refund)}`
              : `💞 Duplikat! Kizuna naik ke Lv.${h.lv}/${CFG.maxKizuna} ${kizunaBar(h.lv)}`
          const banner = h.featuredHit ? `\n🎯 *RATE-UP!* Kamu menang 50/50!` : h.kalah5050 ? `\n💔 Kalah 50/50... UR berikutnya *PASTI* ${fe.nama}!` : ''
          cap = [
              `🌸 *WAIFU SUMMON* 🌸`, pilih(MANTRA), '',
              '╭━━━━━━━━━━━━━━━━━━━⬣',
              ...kartu(h.r, h.w, h.lv),
              `┃ ${status}`,
              '╰━━━━━━━━━━━━━━━━━━━⬣',
              pilih(REAKSI[h.r]) + banner, '',
              biayaInfo, pityInfo, saldo
          ].join('\n')
      } else {
          const baris = hasil.map((h, i) => {
              const tag = h.baru ? ' 🆕' : h.max ? ` 💹+${fmt(h.refund)}` : ` 💞Lv${h.lv}`
              return `${String(i + 1).padStart(2, ' ')}. ${RAR[h.r].emoji} [${h.r}] ${h.w.nama}${tag}`
          })
          const feLine = hasil.find((h) => h.featuredHit) ? '\n🎯 *RATE-UP kena!* Featured dapet!' : hasil.find((h) => h.kalah5050) ? `\n💔 Kalah 50/50, UR berikut PASTI ${fe.nama}!` : ''
          cap = [
              `🌸 *WAIFU SUMMON x10* 🌸`,
              urNya ? '🎊🎊 *ADA UR DI SUMMON INI!!* 🎊🎊' : pilih(MANTRA), '',
              ...baris, '',
              `🏆 Terbaik: *${best.w.nama}* ${RAR[best.r].bintang}`,
              pilih(REAKSI[best.r]) + feLine, '',
              biayaInfo, pityInfo, saldo
          ].join('\n')
      }
      return kirim(conn, m, best.w, cap)
  }

  async function aksiHarem(m, user, args) {
      const W = state(user)
      const list = urutan(W)
      if (!list.length) return m.reply(`🌸 Harem kamu masih kosong, senpai!\nCoba summon dulu pakai *.waifugacha*`)
      const per = 10
      const total = Math.max(1, Math.ceil(list.length / per))
      const hal = Math.min(total, Math.max(1, parseInt(args[0]) || 1))
      const mulai = (hal - 1) * per
      const baris = list.slice(mulai, mulai + per).map((x, i) => {
          const fav = W.fav === x.w.id ? ' 💖' : ''
          return `${mulai + i + 1}. ${RAR[x.w.r].emoji} [${x.w.r}] ${x.w.nama}${fav}\n     ↳ ${x.w.anime} • Kizuna Lv.${x.lv}`
      })
      const favW = W.fav ? list.find((x) => x.w.id === W.fav) : null
      await m.reply([
          `🌸 *HAREM ${user.name || 'Senpai'}* 🌸`, '',
          `📚 Koleksi: ${list.length}/${ROSTER.length} waifu`,
          `🏆 Skor harem: ${fmt(skor(W))}`,
          favW ? `💖 Waifu utama: ${favW.w.nama}` : '💖 Waifu utama: belum diset (.waifugacha fav)',
          `🎴 Total summon: ${fmt(W.total)}`, '',
          ...baris, '',
          `📄 Halaman ${hal}/${total}${hal < total ? ` • .waifugacha harem ${hal + 1} untuk lanjut` : ''}`,
          'Detail + foto: *.waifugacha info <nama/no>*'
      ].join('\n'))
  }

  async function aksiInfo(m, conn, user, args) {
      const W = state(user)
      const q = args.join(' ')
      if (!q) return m.reply('Contoh: *.waifugacha info 1* atau *.waifugacha info makima*\nLihat nomor di *.waifugacha harem*')
      const x = cari(W, q)
      if (!x) return m.reply(`🥺 Waifu "${q}" nggak ada di harem kamu.\nCek *.waifugacha harem* dulu ya!`)
      const { w, lv } = x
      const cap = [
          `🌸 *KARTU WAIFU* 🌸`, '',
          '╭━━━━━━━━━━━━━━━━━━━⬣',
          ...kartu(w.r, w, lv),
          `┃ 💞 Kizuna Lv.${lv}/${CFG.maxKizuna} ${kizunaBar(lv)}`,
          `┃ ${W.fav === w.id ? '💖 Waifu utama kamu' : '🤍 Belum jadi waifu utama'}`,
          '╰━━━━━━━━━━━━━━━━━━━⬣'
      ].join('\n')
      return kirim(conn, m, w, cap)
  }

  async function aksiFav(m, user, args) {
      const W = state(user)
      const q = args.join(' ')
      if (!q) return m.reply('Contoh: *.waifugacha fav 1* atau *.waifugacha fav rem*')
      const x = cari(W, q)
      if (!x) return m.reply(`🥺 Waifu "${q}" nggak ada di harem kamu.`)
      W.fav = x.w.id
      return m.reply(`💖 *${x.w.nama}* sekarang jadi waifu utama kamu!\n_"Darling, jangan liat yang lain ya~"_ 😘`)
  }

  async function aksiBanner(m, conn, user) {
      const W = state(user)
      const fe = bannerMingguIni()
      const cap = [
          '🎯 *BANNER RATE-UP MINGGU INI* 🎯', '',
          '╭━━━━━━━━━━━━━━━━━━━⬣',
          ...kartu('UR', fe, 1),
          '╰━━━━━━━━━━━━━━━━━━━⬣', '',
          `⏰ Ganti banner dalam ${sisaWaktu()}`, '',
          '📈 *Rate dasar*',
          `${RAR.UR.emoji} UR ${RATE.UR}% • ${RAR.SSR.emoji} SSR ${RATE.SSR}%`,
          `${RAR.SR.emoji} SR ${RATE.SR}% • ${RAR.R.emoji} R ${RATE.R}% • ${RAR.N.emoji} N ${RATE.N}%`, '',
          '🛡️ *Sistem pity*',
          `• Soft pity mulai tarikan ke-${CFG.softPityMulai}, hard pity ke-${CFG.hardPity} (UR pasti)`,
          `• Minimal SR tiap ${CFG.jaminSR}x, minimal SSR tiap ${CFG.jaminSSR}x`,
          `• UR: 50% dapet featured, kalah = UR berikutnya PASTI featured ${W.jaminFeatured ? '(🔥 status kamu: GUARANTEED!)' : ''}`, '',
          `📊 Pity kamu: UR ${W.pityUR}/${CFG.hardPity} • SR+ ${W.pitySR}/${CFG.jaminSR} • SSR+ ${W.pitySSR}/${CFG.jaminSSR}`,
          `💹 1x = ${fmt(CFG.biaya)} • 10x = ${fmt(CFG.biaya10)} • 1x gratis tiap hari`
      ].join('\n')
      return kirim(conn, m, fe, cap)
  }

  async function aksiTop(m) {
      const semua = Object.keys(rpgDb).map((k) => rpgDb[k])
          .filter((u) => u?.waifu?.box && Object.keys(u.waifu.box).length)
          .map((u) => ({ nama: u.name || 'Senpai', s: skor(u.waifu), n: Object.keys(u.waifu.box).length }))
          .sort((a, b) => b.s - a.s)
          .slice(0, 10)
      if (!semua.length) return m.reply('Belum ada yang punya harem. Jadilah yang pertama, senpai! 🌸')
      const medal = ['🥇', '🥈', '🥉']
      return m.reply([
          '🏆 *TOP HAREM MASTER* 🏆', '',
          ...semua.map((x, i) => `${medal[i] || `${i + 1}.`} ${x.nama}\n     ↳ Skor ${fmt(x.s)} • ${x.n}/${ROSTER.length} waifu`)
      ].join('\n'))
  }

  const aksiMenu = (m, pfx) => m.reply([
      '🌸 *WAIFU GACHA* 🌸', '',
      `• *${pfx}waifugacha* — summon 1x (gratis 1x/hari, selanjutnya 💹 ${fmt(CFG.biaya)})`,
      `• *${pfx}waifugacha 10* — summon 10x (💹 ${fmt(CFG.biaya10)}, minimal 1 SR+)`,
      `• *${pfx}waifugacha harem [hal]* — koleksi waifu kamu`,
      `• *${pfx}waifugacha info <nama/no>* — kartu + foto`,
      `• *${pfx}waifugacha fav <nama/no>* — set waifu utama`,
      `• *${pfx}waifugacha banner* — banner, rate & pity`,
      `• *${pfx}waifugacha top* — leaderboard harem`, '',
      `Total ${ROSTER.length} waifu: UR ${POOL.UR.length} • SSR ${POOL.SSR.length} • SR ${POOL.SR.length} • R ${POOL.R.length} • N ${POOL.N.length}`,
      'Dupe = Kizuna naik (maks Lv.10), lebih dari itu jadi refund money 💹'
  ].join('\n'))

  // ─────────── Router (1 command, subcommand lewat argumen) ───────────
  async function handler(m, ctx) {
      const args = [...(ctx.args || [])]
      const conn = ctx.conn || ctx.sock
      const pfx = ctx.usedPrefix || ctx.prefix || '.'

      // Data waifu disimpan di data RPG: rpgDb[sender].waifu (coin RPG = money bot)
      const user = initRpgUser(m.sender, m.pushName)
      const flat = global.db?.data?.users?.[m.sender]
      if (flat?.waifu && !user.waifu) { user.waifu = flat.waifu; delete flat.waifu }

      const sub = String(args[0] || '').toLowerCase()
      try {
          if (['harem', 'koleksi'].includes(sub)) return await aksiHarem(m, user, args.slice(1))
          if (['info', 'kartu', 'card'].includes(sub)) return await aksiInfo(m, conn, user, args.slice(1))
          if (['fav', 'utama'].includes(sub)) return await aksiFav(m, user, args.slice(1))
          if (['banner', 'rate'].includes(sub)) return await aksiBanner(m, conn, user)
          if (['top', 'lb'].includes(sub)) return await aksiTop(m)
          if (['menu', 'help'].includes(sub)) return await aksiMenu(m, pfx)
          return await aksiPull(m, conn, user, args, pfx)
      } finally {
          saveRpg()
      }
  }

  handler.exp = 5

export { pluginConfig as config, handler }
