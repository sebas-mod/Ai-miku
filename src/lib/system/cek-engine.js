/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
/**
 * ╭──────────────────────────────────────────────❖
 * │ ✦ Elysia Assistant — Radar Cek & Roast Engine
 * │ ✦ Location   : src/lib/system/cek-engine.js
 * │ ✦ Architect  : Arthazy
 * ╰──────────────────────────────────────────────❖
 */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const fill = (tpl, noun) =>
  String(tpl)
    .replace(/\{n\}/g, noun)
    .replace(/\{N\}/g, cap(noun));

const meterBar = (p, len = 10) => {
  const filled = Math.round((p / 100) * len);
  return "▰".repeat(filled) + "▱".repeat(len - filled);
};

// 5 Tier untuk sifat POSITIF (ganteng, cantik, pintar, kaya, jago, setia, dll)
const GOOD_DATA = [
  // Tier 0: 0 - 15% (Kering Kerontang / Roast Pedas)
  {
    ranks: ["🥀 Ampas Debu Kosmik", "💀 Minus Aura Parah", "🗑️ Kering Kerontang"],
    indikasi: [
      "Alat radar sampe error diketok-ketok kirain rusak, ternyata aura {n}-nya emang zonk total.",
      "Cermin di rumah aja pasrah liat kadar {n} lu, sampe minta pindah rumah.",
      "Sinyal {n} terdeteksi 0 koma sekian, lebih banyak sinyal WiFi tetangga yang dipassword.",
      "Kamera depan HP langsung auto-blur sendiri begitu mendeteksi kadar {n} segini.",
      "Dukun digital nyari pake teropong Hubble juga kagak nemu hilal {n}-nya.",
      "Semut lewat aja lebih keliatan punya aura {n} daripada hasil scan ini, wkwk.",
    ],
    vonis: [
      "Jujurly pahit sih, kadar {n} lu masih di dasar palung Mariana. Sabar ya bro, hidup emang keras.",
      "Waduh, parah banget anjir. Jangankan jadi panutan, ini mah butuh keajaiban 7 turunan buat naik.",
      "Mending diem-diem aja di pojokan dulu deh, jangan sok ngaku punya {n} di depan warga grup.",
      "Busyet dah, ini hasil scan apa sisa kuota tengah malam? Tipis banget gak keliatan wujudnya!",
      "Maaf nih bestie, sistem bot dilarang bohong: kadar {n} lu lagi kritis di zona merah!",
      "Kalau ada lomba minim {n}, lu fix menang tanpa perlu daftar, langsung angkat piala!",
    ],
    saran: [
      "Perbanyak minum air putih, kurangi halu, sama mandi kembang 7 rupa malam Jumat.",
      "Coba restart hidup atau cuci muka pake air cucian beras biar aura {n}-nya agak nyala dikit.",
      "Jangan kebanyakan gaya dulu di grup, fokus upgrade diri biar nggak makin jadi bahan cengan.",
      "Sering-sering sedekah gorengan ke admin grup, siapa tau karma baiknya nambahin {n} lu.",
      "Tidur yang cukup, jangan begadang terus mikirin orang yang nggak mikirin lu, wkwk.",
      "Beli kaca baru terus ngaca pelan-pelan sambil istighfar 33 kali.",
    ],
  },
  // Tier 1: 16 - 35% (Pas-Pasan / Nyindir Halus-Pedas)
  {
    ranks: ["🕯️ Mulai Ada Harapan", "🌱 Bibit Tipis-Tipis", "🔋 Lowbat Aura"],
    indikasi: [
      "Aura {n}-nya muncul cuma pas lagi ada maunya doang, sisanya balik ke setelan pabrik.",
      "Keliatannya oke dari jarak 500 meter, pas dideketin malah bikin orang mikir dua kali.",
      "Percikan {n} terdeteksi tipis banget, ketiup angin kipas angin nomor 1 langsung ilang.",
      "Masih sering ketutupan aura ngantuk dan muka kurang tidur, makanya skornya mentok bawah.",
      "Radar nangkep sinyal {n} putus-nyambung kayak koneksi kartu pas lagi hujan deras.",
      "Baru keliatan dikit kalau pake pencahayaan matahari jam 4 sore plus doa orang tua.",
    ],
    vonis: [
      "Masih di bawah standar nasional nih bro, tapi lumayan lah udah kelihatan usahanya dikit.",
      "Agak ngenes sih angkanya, tapi tenang... minimal nggak 0% kayak sebelah, wkwk.",
      "Kadar {n} lu tuh ibarat sinyal 1 bar: ada sih, tapi bikin orang emosi nungguinnya.",
      "Lumayan buat pemula, tapi jangan kepedean dulu soalnya masih gampang kebanting sama warga lain.",
      "Setengah hati banget aura {n}-nya, kayak orang niat diet tapi malemnya tetep makan mie instan.",
      "Not bad lah buat ukuran kaum rebahan, tapi masih butuh polesan ekstra biar nggak malu-maluin.",
    ],
    saran: [
      "Kurang-kurangin begadang sama scroll medsos nggak jelas biar aura {n} lu nggak makin redup.",
      "Rajin mandi pagi, jangan nunggu sore baru nyentuh air, kasihan yang duduk di sebelah.",
      "Gaspol upgrade skill & penampilan, jangan cuma modal PD doang tapi isi kosong!",
      "Banyakin bergaul sama orang bener biar ketularan aura {n}, jangan nongkrong sama beban grup mulu.",
      "Coba senyum yang tulus, jangan senyum kepaksa kayak lagi ditagih utang.",
      "Makan yang bergizi, jangan indomie mulu tiap hari biar aura {n}-nya pelan-pelan naik.",
    ],
  },
  // Tier 2: 36 - 60% (Standar SNI / Netral Kocak)
  {
    ranks: ["⚖️ Warga Standar SNI", "🌤️ Lumayan Gacor", "🧩 Setengah Matang"],
    indikasi: [
      "Kadar {n}-nya 50:50 — kadang bikin orang kagum, kadang bikin orang pengen nge-kick dari grup.",
      "Terdeteksi aura {n} kelas menengah, cukup buat bikin gebetan melirik 3 detik sebelum lupa lagi.",
      "Sinyal {n} stabil di jalur aman, nggak terlalu mentereng tapi nggak bikin malu tongkrongan.",
      "Kadang {n}-nya keluar deras pas mood bagus, giliran tanggal tua langsung drop drastis.",
      "Radar mencatat performa {n} cukup konsisten, walau masih sering kesenggol dikit langsung oleng.",
      "Udah masuk kategori lolos sensor warga komplek, tinggal dipoles dikit biar makin bersinar.",
    ],
    vonis: [
      "Standar SNI banget nih! Gak kurang-kurang amat, gak lebih-lebih amat, pas di tengah.",
      "Lumayan lah bro, udah nggak malu-maluin kalau diajak kondangan atau foto bareng.",
      "Udah mulai kebentuk aura {n}-nya, tinggal nambah dikit lagi biar masuk jajaran suhu grup.",
      "Cukup mantap buat ukuran rakyat jelata, tapi jangan sombong dulu ya bestie!",
      "Skor aman sentosa! Nggak bakal kena roasting terlalu parah, tapi juga belum bisa songong.",
      "Setengah perjalanan menuju level dewa! Pertahankan, jangan malah kendor di tengah jalan.",
    ],
    saran: [
      "Tinggal sedikit polesan lagi biar tembus 70%+, gas terus jangan kasih kendor!",
      "Jaga sikap dan konsistensi, jangan pas lagi bagus malah sok jual mahal.",
      "Kurangi drama nggak penting biar aura {n} lu makin bersih dan naik kelas.",
      "Boleh sesekali pamer tipis-tipis, asal jangan kelewatan biar nggak disumpahin temen.",
      "Traktir temen es teh sekali-sekali biar aura {n}-nya dapet buff tambahan +10%.",
      "Tetap membumi bro, kalau udah naik kelas nanti jangan lupa sama yang dulu nemenin.",
    ],
  },
  // Tier 3: 61 - 85% (Tinggi / Kelas Elite)
  {
    ranks: ["✨ Di Atas Rata-Rata", "🔥 Kelas Kakap Elite", "💎 Aura Sultan"],
    indikasi: [
      "Dari radius 10 meter aja aura {n}-nya udah kecium semerbak, bikin warga sebelah insecure!",
      "Radar bot langsung bunyi nyaring, kadar {n} lu jauh di atas rata-rata member grup ini.",
      "Bukan kaleng-kaleng! Sekali muncul di chat aja aura {n}-nya langsung mendominasi ruangan.",
      "Terdeteksi energi {n} tingkat tinggi, sampe bikin haters diem-diem stalking sambil iri.",
      "Kadar {n} lu udah masuk kategori langka, susah dicari tandingannya di tongkrongan.",
      "{SYMPTOM}",
    ],
    vonis: [
      "Gokil bro! Ini baru kelas kakap, satu tongkrongan fix ngakuin kadar {n} lu!",
      "Wihh gacor parah! Auranya nggak main-main, pantesan banyak yang diem-diem nge-fans.",
      "Udah masuk jajaran suhu per-{n}-an di grup ini, yang lain minggir dulu kasih jalan!",
      "Mantap jiwa! Skor segini mah udah layak dapet sertifikat resmi dari Kementerian {N}.",
      "Buset, ini mah bukan manusia biasa lagi, kadar {n}-nya udah level premium tanpa iklan!",
      "Keren abis! Jarang-jarang radar Elysia ngeluarin angka setinggi ini buat warga grup.",
    ],
    saran: [
      "Pertahankan aura emas ini, tapi jangan sombong ya suhu biar nggak cepet kena karma!",
      "Bagi-bagi tips dong ke member lain yang skornya masih di bawah 30%, kasihan mereka.",
      "Hati-hati banyak yang sirik, tetap rendah hati walau sebenernya lu emang unggul.",
      "Jaga kesehatan & mood, soalnya grup ini butuh panutan dengan kadar {n} kayak lu.",
      "{TIP}",
    ],
  },
  // Tier 4: 86 - 100% (Dewa / Overpower)
  {
    ranks: ["👑 Suhu Tingkat Dewa", "🌌 MUTLAK LEGENDA", "⚡ Overpower Max"],
    indikasi: [
      "ALAT RADAR LANGSUNG MELEDAK! Kadar {n} tembus batas maksimum server Elysia!",
      "Saking tingginya aura {n} lu, sinyal satelit sampe nge-lag buat ngitung angkanya.",
      "Terdeteksi radiasi {n} tingkat dewa — orang yang cuma baca chat lu aja langsung kena silau.",
      "Bukan cuma manusia, NPC sama bot aja sampe sungkem liat kadar {n} setinggi ini!",
      "{SYMPTOM}",
    ],
    vonis: [
      "GILA SIH INI! Fix pemilik tahta tertinggi {n} se-jagat raya WhatsApp, nggak ada obat!",
      "Suhu mutlak! Tinggal selangkah lagi dinobatkan jadi Duta {N} Internasional tanpa saingan.",
      "Ampun suhu! Alat ukur sampe keluar kembang api, yang lain mending pulang aja daripada minder.",
      "Level dewa anjir! Ini mah udah cheat engine dari lahir, mustahil dilawan warga biasa!",
      "SEMPURNA! Kalau {n} bisa diuangkan, lu udah beli pulau pribadi dari kemarin-kemarin.",
    ],
    saran: [
      "Tolong jangan terlalu merendah sampe nyungsep ke inti bumi ya suhu, kasih panggung buat yang lain!",
      "Buka kelas privat dong buat ngajarin warga grup biar ketularan aura {n} lu.",
      "Jangan lupa sedekah biar aura dewa ini awet sampe tua nanti!",
      "{TIP}",
    ],
  },
];

// 5 Tier untuk sifat NEGATIF / KOCAK (beban, bucin, toxic, wibu, halu, gila, jomblo, stres, dll)
const BAD_DATA = [
  // Tier 0: 0 - 15% (Suci / Bersih Total)
  {
    ranks: ["😇 Suci Tanpa Noda", "🍃 Bersih & Waras", "🕊️ Malaikat Grup"],
    indikasi: [
      "Alat deteksi {n} langsung sujud syukur nemu manusia sewaras dan sepolos ini di grup.",
      "Nihil! Nggak ada tanda-tanda {n} sama sekali, bahkan pas lagi tanggal tua sekalipun.",
      "Radar bot sampe cek ulang 3 kali kirain salah orang, ternyata beneran bersih dari {n}!",
      "Aura kalem dan waras mendominasi 99%, bebas dari virus {n} yang melanda warga lain.",
      "Cuma terdeteksi debu tipis, jauh banget dari kelakuan {n} yang suka bikin pusing admin.",
    ],
    vonis: [
      "Alhamdulillah masih ada manusia waras di grup ini! Bebas dari {n}, pertahankan ya bestie!",
      "Bersih total! Malaikat aja senyum-senyum liat betapa jauhnya lu dari sifat {n}.",
      "Aman terkendali bro! Lu adalah bukti nyata kalau populasi orang normal belum punah.",
      "Gokil, kadar {n} lu nyaris nol! Cocok jadi penasihat spiritual buat temen-temen lu yang udah parah.",
      "Salute! Di tengah gempuran warga grup yang aneh-aneh, lu tetep suci dari {n}.",
    ],
    saran: [
      "Jangan kebanyakan nongkrong sama member yang skor {n}-nya 80%+ biar nggak ketularan!",
      "Pertahankan kewarasan ini, soalnya lu aset paling langka di grup ini.",
      "Boleh sesekali ruqyah temen sebelah yang kelakuannya udah mulai mencurigakan.",
      "Tetap istiqomah di jalan yang benar, jangan sampe goyah cuma gara-gara diskon atau gebetan.",
    ],
  },
  // Tier 1: 16 - 35% (Gejala Ringan)
  {
    ranks: ["⚠️ Gejala Ringan", "🌤️ Masih Terkendali", "🩺 Bibit Awal"],
    indikasi: [
      "Baru terdeteksi bibit tipis {n}, biasanya cuma kumat kalau lagi gabut atau kurang tidur.",
      "Radar bunyi *tit-tit* pelan — tanda-tanda {n} mulai nongol pas malem minggu.",
      "Masih ketutup muka polos, padahal dalem hati udah mulai ada benih {n} tipis-tipis.",
      "Kambuhnya cuma musiman, paling muncul pas lagi capek atau habis kena ghosting.",
      "Kadar {n}-nya masih jinak, belum sampe meresahkan warga sekitar.",
    ],
    vonis: [
      "Aman sih bestie, tapi hati-hati ya! Udah mulai keliatan gejala awal {n} kalau nggak dijaga.",
      "Masih tahap wajar lah, manusiawi banget. Asal jangan dibiarin berkembang biak aja!",
      "Lumayan jinak nih, cuma kumat sekali-sekali pas kuota abis atau dompet menipis.",
      "Belum parah kok bro, tapi radar udah ngasih lampu kuning buat lu biar tetep waspada.",
      "Masih bisa diselamatkan! Jangan sampe bulan depan angkanya loncat ke zona merah ya.",
    ],
    saran: [
      "Cukup diobati pakai tidur siang 2 jam dan minum es teh manis tanpa drama.",
      "Kurang-kurangin begadang jam 2 pagi biar bibit {n}-nya nggak makin subur.",
      "Kalau mulai kerasa kumat, langsung tarik napas panjang dan jauhin HP sebentar.",
      "Jangan keseringan baca chat grup pas lagi capek, nanti ketularan {n} beneran!",
    ],
  },
  // Tier 2: 36 - 60% (Setengah Kumat / Zona Kuning)
  {
    ranks: ["🚧 Setengah Kumat", "⚡ Zona Kuning", "🎭 Dual Kepribadian"],
    indikasi: [
      "Siang keliatan normal banget, giliran lewat jam 11 malam sifat {n}-nya langsung aktif mode turbo!",
      "Temen-temen terdekat udah mulai hafal tabiat {n} lu, tinggal nunggu waktu aja buat dibongkar.",
      "Sinyal {n} terdeteksi naik-turun kayak emosi orang laper, bikin warga grup deg-degan.",
      "Udah mulai sering keceplosan kelakuan {n} di chat tanpa sadar, wkwk.",
      "Kadar {n}-nya 50:50 — setengah waras, setengah lagi udah siap bikin keributan lokal.",
    ],
    vonis: [
      "Waduh udah setengah jalan nih bro! Bentar lagi resmi masuk klub {n} cabang WhatsApp.",
      "Ngaku aja deh, nggak usah sok polos! Angka segini nggak mungkin bohong anjir.",
      "Udah masuk zona rawan nih bestie, satu langkah lagi lu bakal susah dinasehatin.",
      "Agak mengkhawatirkan sih, tapi masih lucu buat dijadiin bahan gibah tongkrongan.",
      "Buset, 50% {n} tuh udah cukup buat bikin temen lu geleng-geleng kepala tiap hari!",
    ],
    saran: [
      "Buruan tobat sebelum naik ke stadium akut, masih sempet putar balik kok!",
      "Kurangi konsumsi micin sama drama percintaan biar kadar {n} lu nggak makin liar.",
      "Minta temen buat ngingetin (atau ngegeplak pelan) tiap kali sifat {n} lu mulai kumat.",
      "Perbanyak kegiatan produktif biar otak lu nggak kepikiran hal-hal {n} mulu.",
    ],
  },
  // Tier 3: 61 - 85% (Kronis / Berbahaya / Roast Pedas)
  {
    ranks: ["🚨 Kronis Menengah", "☣️ Level Berbahaya", "🔥 Udah Susah Ditolong"],
    indikasi: [
      "SIRENE DARURAT BUNYI KENCENG! Kadar {n} lu udah masuk tahap menular ke satu grup!",
      "Udah mendarah daging anjir, kelakuan {n}-nya sampe bikin bot ikutan geleng-geleng kepala.",
      "Setiap kali lu ngetik di grup, radar {n} langsung loncat ke zona merah tanpa ampun.",
      "Warga grup udah pada hafal luar kepala sama tingkat {n} lu, nggak ada yang kaget lagi.",
      "{SYMPTOM}",
    ],
    vonis: [
      "PARAH BANGET ANJIR! Kalau ada kejuaraan {n} tingkat kabupaten, lu fix juara 1 tanpa lawan!",
      "Waduh bro, ini mah udah kronis banget! Dokter spesialis aja mikir dua kali buat nanganin lu.",
      "Nggak ada obat sih ini, kadar {n} lu udah lewat batas kewajaran umat manusia!",
      "Buset dah, lu tiap hari sarapan apa sih kok bisa skor {n}-nya setinggi menara SUTET?!",
      "Fix beban hiburan grup! Tapi jujur aja, tanpa kadar {n} lu grup ini bakal sepi sih, wkwk.",
    ],
    saran: [
      "Segera hubungi dukun terdekat atau mandi kembang 7 sumur sebelum makin parah!",
      "Tolong kasih jarak aman 5 meter dari member polos biar mereka nggak ketularan {n} lu.",
      "Coba puasa main HP 3 hari, sentuh rumput asli di luar rumah biar otak lu ke-reset!",
      "{TIP}",
    ],
  },
  // Tier 4: 86 - 100% (Stadium Akhir / Raja / Toxic-Lucu Max)
  {
    ranks: ["🌋 Akut Stadium Akhir", "👑 RAJA / RATU {N}", "☢️ BENCANA NASIONAL"],
    indikasi: [
      "ALAT UKUR KELUAR ASAP HITAM DAN MELEDAK! Kadar {n} lu udah melampaui logika sains!",
      "Fix 100% murni tanpa campuran — bahkan setan lewat aja bingung liat tingkat {n} lu!",
      "Nama lu udah otomatis tercatat di buku rekor MURI sebagai sesepuh {n} abadi.",
      "Radiasi {n}-nya tembus layar HP! Admin grup disarankan pakai APD saat baca chat lu.",
      "{SYMPTOM}",
    ],
    vonis: [
      "MENTOK KANAN ANJIR!! Lu resmi dilantik jadi Presiden {N} Se-Indonesia tanpa pemilu!",
      "AMPUN BANG JAGO!! Ini mah udah stadium akhir, bahkan BPJS aja nggak sanggup cover kadar {n} lu!",
      "GILA PARAH! Seluruh warga grup harap sungkem sama suhu tertinggi per-{n}-an satu ini!",
      "Nggak bisa berkata-kata lagi gue... lu emang terlahir buat jadi legenda {n} di muka bumi!",
      "FIX TAK TERTANDINGI! Kalau {n} adalah mata pelajaran, lu udah dapet beasiswa S3 ke Mars!",
    ],
    saran: [
      "Udah telat buat berobat bro, mending langsung buka padepokan {n} aja sekalian cari murid!",
      "Segera lapor RT/RW setempat dan serahkan diri secara sukarela demi ketentraman warga grup.",
      "Jangan lupa minum obat tepat waktu dan berhenti bikin orang lain ikutan stres ya bestie!",
      "{TIP}",
    ],
  },
];

function getTierIndex(p) {
  if (p <= 15) return 0;
  if (p <= 35) return 1;
  if (p <= 60) return 2;
  if (p <= 85) return 3;
  return 4;
}

export function buildCekResult({ title, emoji, noun, kind, symptom, tip, targetLabel, percent }) {
  const isGood = kind === "good";
  const pool = (isGood ? GOOD_DATA : BAD_DATA)[getTierIndex(percent)];

  const rawRank = pick(pool.ranks);
  const rawIndikasi = pick(pool.indikasi);
  const rawVonis = pick(pool.vonis);
  const rawSaran = pick(pool.saran);

  const sub = (s) =>
    fill(s, noun)
      .replace(/\{SYMPTOM\}/g, symptom || fill("Aura {n} terdeteksi sangat kuat", noun))
      .replace(/\{TIP\}/g, tip || "Tetap jaga keseimbangan hidup ya bestie!");

  const rank = sub(rawRank);
  const indikasi = sub(rawIndikasi);
  const vonis = sub(rawVonis);
  const saran = sub(rawSaran);

  return [
    `✦「 ${emoji} *${title.toUpperCase()}* ${emoji} 」`,
    `   ✧ Target : *${targetLabel}*`,
    `   ✧ Kadar  : ${meterBar(percent)} *${percent}%*`,
    `   ✧ Gelar  : *${rank}*`,
    ``,
    `✦「 🔍 *INDIKASI TERDETEKSI* 」`,
    `   ✧ _"${indikasi}"_`,
    ``,
    `✦「 💬 *VONIS DUKUN BOT* 」`,
    `   ✧ ${vonis}`,
    ``,
    `✦「 💊 *RESEP / SARAN* 」`,
    `   ✧ ${saran}`,
  ].join("\n");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SCAN_FRAMES = [
  { pct: 20, icon: "📡", text: "Menyalakan radar satelit dukun Elysia..." },
  { pct: 55, icon: "🔍", text: "Menyadap aura & riwayat chat tengah malam..." },
  { pct: 88, icon: "🧪", text: "Menganalisis sampel kelakuan dengan reagen micin..." },
];

export async function runCekAnimation(m, sock, opts) {
  const { title, emoji, targetLabel, mentions = [] } = opts;
  const header = `✦「 ${emoji} *${title.toUpperCase()}* ${emoji} 」`;

  const makeFrame = (f) =>
    [
      header,
      `   ✧ Target : *${targetLabel}*`,
      `   ✧ Status : ${f.icon} _${f.text}_`,
      `   ✧ Scan   : ${meterBar(f.pct)} *${f.pct}%*`,
    ].join("\n");

  let sent = null;
  try {
    sent = await sock.sendMessage(m.chat, { text: makeFrame(SCAN_FRAMES[0]), mentions }, { quoted: m });
  } catch {
    sent = null;
  }

  if (sent?.key) {
    for (let i = 1; i < SCAN_FRAMES.length; i++) {
      await sleep(1700);
      await sock
        .sendMessage(m.chat, { text: makeFrame(SCAN_FRAMES[i]), edit: sent.key, mentions })
        .catch(() => {});
    }
    await sleep(1800);
  }

  const finalText = buildCekResult(opts);

  if (sent?.key) {
    try {
      await sock.sendMessage(m.chat, { text: finalText, edit: sent.key, mentions });
      return;
    } catch {}
  }
  await sock.sendMessage(m.chat, { text: finalText, mentions }, { quoted: m });
}

export default { buildCekResult, runCekAnimation };
