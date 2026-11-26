/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../data/database.js";

if (!globalThis.__elysiaTebakSessions) {
  globalThis.__elysiaTebakSessions = new Map();
}
if (!globalThis.__elysiaTebakStreaks) {
  globalThis.__elysiaTebakStreaks = new Map();
}

const sessions = globalThis.__elysiaTebakSessions;
const streaks = globalThis.__elysiaTebakStreaks;

function normalizeAnswer(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function makeMask(answer, level = 1) {
  const chars = [...String(answer || "")];
  return chars
    .map((ch, idx) => {
      if (!/[a-zA-Z0-9]/.test(ch)) return ch;
      if (idx === 0 || idx === chars.length - 1) return ch.toUpperCase();
      if (level >= 2 && idx % 3 === 0) return ch.toUpperCase();
      return "_";
    })
    .join(" ");
}

export function getActiveTebak(chatId) {
  return sessions.get(chatId) || null;
}

export function clearTebak(chatId) {
  const s = sessions.get(chatId);
  if (s?.timer) clearTimeout(s.timer);
  sessions.delete(chatId);
}

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function formatFamilyBoard(session) {
  const rows = session.answers.map((ans, idx) => {
    const solved = session.solved[idx];
    if (solved) {
      const tag = solved.split("@")[0];
      return `│ ${idx + 1}. ✅ *${ans}* (@${tag})`;
    }
    return `│ ${idx + 1}. ⬜ _(${ans.length} huruf)_`;
  });

  const left = session.answers.length - Object.keys(session.solved).length;
  return (
    `╭─❖「 👨‍👩‍👧‍👦 *FAMILY 100 — ELYSIA* 」\n` +
    `│ ❓ *Soal:* ${session.question}\n` +
    `├───〔 *PAPAN JAWABAN* 〕\n` +
    `${rows.join("\n")}\n` +
    `├───〔 *INFO SESI* 〕\n` +
    `│ 🎯 Tersisa : *${left}* jawaban\n` +
    `│ 💰 Hadiah  : *+${session.rewardKoin.toLocaleString("id-ID")} Koin* / jawaban\n` +
    `│ 💡 Bantuan : \`.hint\`  |  🏳️ \`.nyerah\`\n` +
    `╰─────────────────────❖`
  );
}

export async function startTebakSession(
  sock,
  m,
  {
    gameId,
    title,
    emoji = "🧩",
    question,
    clueText = "",
    answer,
    answers = null,
    explanation = "",
    durationSec = 60,
    rewardKoin = 1500,
    rewardExp = 350,
    imageUrl = null,
  }
) {
  const existing = sessions.get(m.chat);
  if (existing) {
    return m.reply(
      `⏳ Masih ada sesi *${existing.title}* yang aktif di chat ini!\n` +
        `> Jawab langsung di chat, atau ketik \`${m.prefix}hint\` / \`${m.prefix}nyerah\`.`
    );
  }

  const isMulti = Array.isArray(answers) && answers.length > 0;
  const session = {
    chat: m.chat,
    gameId,
    title,
    emoji,
    question,
    clueText,
    answer: isMulti ? "" : String(answer || "").trim(),
    answers: isMulti ? answers.map((a) => String(a).trim()) : [],
    solved: {},
    explanation,
    rewardKoin,
    rewardExp,
    hintsUsed: 0,
    startedAt: Date.now(),
    expiresAt: Date.now() + durationSec * 1000,
    timer: null,
  };

  session.timer = setTimeout(async () => {
    const cur = sessions.get(m.chat);
    if (!cur || cur.startedAt !== session.startedAt) return;
    sessions.delete(m.chat);

    const reveal = isMulti
      ? cur.answers.map((a, i) => `│ ${i + 1}. *${a}*`).join("\n")
      : `│ 🔑 Jawaban: *${cur.answer}*` +
        (cur.explanation ? `\n│ 📝 _${cur.explanation}_` : "");

    await sock
      .sendMessage(m.chat, {
        text:
          `╭─❖「 ⏰ *WAKTU HABIS — ${cur.title.toUpperCase()}* 」\n` +
          `${reveal}\n` +
          `╰─────────────────────❖\n` +
          `_Ketik \`.${cur.gameId}\` untuk main ronde berikutnya!_`,
      })
      .catch(() => {});
  }, durationSec * 1000);
  session.timer.unref?.();

  sessions.set(m.chat, session);

  const caption = isMulti
    ? formatFamilyBoard(session)
    : `╭─❖「 ${emoji} *${title.toUpperCase()}* 」\n` +
      `│ ❓ *Soal:*\n` +
      `│ ${question}\n` +
      (clueText ? `│ 🏷️ *Petunjuk:* ${clueText}\n` : "") +
      `├───〔 *DETAIL RONDE* 〕\n` +
      `│ ⏱️ Waktu   : *${durationSec} detik*\n` +
      `│ 💰 Hadiah  : *+${rewardKoin.toLocaleString("id-ID")} Koin* & *+${rewardExp} EXP*\n` +
      `│ 💡 Bantuan : \`.hint\`  |  🏳️ \`.nyerah\`\n` +
      `╰─────────────────────❖\n` +
      `_Ketik jawabanmu langsung di chat ini!_`;

  if (imageUrl) {
    try {
      await sock.sendMessage(
        m.chat,
        { image: { url: imageUrl }, caption },
        { quoted: m }
      );
      return;
    } catch {}
  }

  await m.reply(caption);
}

export async function giveTebakHint(m) {
  const s = sessions.get(m.chat);
  if (!s) {
    return m.reply("❌ Tidak ada sesi tebak-tebakan yang sedang berlangsung di chat ini.");
  }
  if (s.hintsUsed >= 2) {
    return m.reply("⚠️ Batas bantuan (2x per ronde) sudah terpakai!");
  }
  s.hintsUsed += 1;

  if (s.answers.length > 0) {
    const unsolvedIdx = s.answers.findIndex((_, i) => !s.solved[i]);
    if (unsolvedIdx === -1) return;
    const masked = makeMask(s.answers[unsolvedIdx], s.hintsUsed);
    return m.reply(
      `💡 *HINT #${s.hintsUsed} (${s.title})*\n` +
        `> Jawaban nomor *${unsolvedIdx + 1}*: \`${masked}\``
    );
  }

  const masked = makeMask(s.answer, s.hintsUsed);
  return m.reply(
    `💡 *HINT #${s.hintsUsed} (${s.title})*\n` +
      `> Pola huruf: \`${masked}\``
  );
}

export async function surrenderTebak(m) {
  const s = sessions.get(m.chat);
  if (!s) {
    return m.reply("❌ Tidak ada sesi tebak-tebakan yang aktif di chat ini.");
  }
  clearTebak(m.chat);

  const reveal =
    s.answers.length > 0
      ? s.answers.map((a, i) => `│ ${i + 1}. *${a}*`).join("\n")
      : `│ 🔑 Jawaban: *${s.answer}*` +
        (s.explanation ? `\n│ 📝 _${s.explanation}_` : "");

  return m.reply(
    `╭─❖「 🏳️ *MENYERAH — ${s.title.toUpperCase()}* 」\n` +
      `${reveal}\n` +
      `╰─────────────────────❖`
  );
}

export async function handleTebakAnswer(m, sock) {
  const s = sessions.get(m.chat);
  if (!s || m.fromMe) return false;

  const rawText = String(m.body || m.text || "").trim();
  if (!rawText || /^[./!#]/.test(rawText) || rawText.length > 80) return false;

  const guess = normalizeAnswer(rawText);
  if (!guess) return false;

  const db = getDatabase();

  // Mode Family 100 (multi-jawaban)
  if (s.answers.length > 0) {
    let matchedIdx = -1;
    for (let i = 0; i < s.answers.length; i++) {
      if (s.solved[i]) continue;
      const target = normalizeAnswer(s.answers[i]);
      if (guess === target || (target.length >= 5 && levenshtein(guess, target) <= 1)) {
        matchedIdx = i;
        break;
      }
    }

    if (matchedIdx === -1) return false;

    s.solved[matchedIdx] = m.sender;
    db.updateKoin(m.sender, s.rewardKoin);
    db.updateExp(m.sender, s.rewardExp);

    const solvedCount = Object.keys(s.solved).length;
    const allSolved = solvedCount >= s.answers.length;
    const mentions = [...new Set(Object.values(s.solved))];

    if (allSolved) {
      clearTebak(m.chat);
      await sock.sendMessage(
        m.chat,
        {
          text:
            `🎉 *SEMUA JAWABAN TERTEBAK!*\n` +
            `> +${s.rewardKoin.toLocaleString("id-ID")} Koin untuk @${m.sender.split("@")[0]}\n\n` +
            formatFamilyBoard(s),
          mentions,
        },
        { quoted: m }
      );
    } else {
      await sock.sendMessage(
        m.chat,
        {
          text:
            `✅ *BENAR!* (+${s.rewardKoin.toLocaleString("id-ID")} Koin)\n\n` +
            formatFamilyBoard(s),
          mentions,
        },
        { quoted: m }
      );
    }
    return true;
  }

  // Mode Single Answer
  const target = normalizeAnswer(s.answer);
  const dist = levenshtein(guess, target);
  const isExact = guess === target || (target.length >= 6 && dist === 1);

  if (isExact) {
    clearTebak(m.chat);
    const prevStreak = streaks.get(m.sender) || 0;
    const newStreak = prevStreak + 1;
    streaks.set(m.sender, newStreak);

    const streakBonus = newStreak >= 2 ? Math.min(newStreak * 250, 2500) : 0;
    const totalKoin = s.rewardKoin + streakBonus;

    db.updateKoin(m.sender, totalKoin);
    db.updateExp(m.sender, s.rewardExp);

    await m.react?.("🎉").catch(() => {});
    await m.reply(
      `╭─❖「 🎉 *JAWABAN BENAR!* 」\n` +
        `│ 👤 Penjawab : @${m.sender.split("@")[0]}\n` +
        `│ 🔑 Jawaban  : *${s.answer}*\n` +
        (s.explanation ? `│ 📝 Info     : _${s.explanation}_\n` : "") +
        `├───〔 *HADIAH* 〕\n` +
        `│ 💰 Koin     : *+${totalKoin.toLocaleString("id-ID")}*` +
        (streakBonus ? ` _(Bonus Streak x${newStreak}: +${streakBonus})_` : "") +
        `\n│ ✨ EXP      : *+${s.rewardExp}*\n` +
        `╰─────────────────────❖`,
      { mentions: [m.sender] }
    );
    return true;
  }

  // Hampir benar (1-2 huruf meleset)
  if (target.length >= 4 && dist <= 2) {
    await m.reply(`🔥 *Hampir benar!* Cek lagi ejaan atau susunan hurufnya ya.`);
    return true;
  }

  return false;
}

// Bank Soal Curated Elysia (100% Original & Offline-Ready)
export const TEBAK_BANKS = {
  tebakkata: [
    { q: "Alat untuk melihat benda sangat kecil di laboratorium", a: "Mikroskop" },
    { q: "Ibu kota negara Jepang yang terkenal dengan menara merahnya", a: "Tokyo" },
    { q: "Planet terbesar di tata surya kita", a: "Jupiter" },
    { q: "Proses tumbuhan membuat makanan dengan bantuan cahaya matahari", a: "Fotosintesis" },
    { q: "Benda langit yang mengelilingi planet", a: "Satelit" },
    { q: "Hewan mamalia laut terbesar di dunia", a: "Paus Biru" },
    { q: "Alat musik tradisional Jawa Barat dari bambu yang digoyangkan", a: "Angklung" },
    { q: "Zat cair merah yang mengalir dalam pembuluh tubuh manusia", a: "Darah" },
    { q: "Benua terkecil di permukaan bumi", a: "Australia" },
    { q: "Ilmu yang mempelajari tentang bintang dan benda langit", a: "Astronomi" },
    { q: "Gaya tarik bumi yang membuat benda jatuh ke bawah", a: "Gravitasi" },
    { q: "Bangunan kuno berbentuk segitiga raksasa di Mesir", a: "Piramida" },
    { q: "Alat pengukur suhu tubuh atau ruangan", a: "Termometer" },
    { q: "Bahasa pemrograman populer yang logonya ular", a: "Python" },
    { q: "Pulau terbesar di Indonesia berdasarkan luas wilayah", a: "Kalimantan" },
  ],
  tebakkalimat: [
    { q: "Bagai air di daun ___", a: "Talas" },
    { q: "Tong kosong ___ bunyinya", a: "Nyaring" },
    { q: "Sedia ___ sebelum hujan", a: "Payung" },
    { q: "Besar ___ daripada tiang", a: "Pasak" },
    { q: "Ada udang di balik ___", a: "Batu" },
    { q: "Berakit-rakit ke hulu, berenang-renang ke ___", a: "Tepian" },
    { q: "Air beriak tanda tak ___", a: "Dalam" },
    { q: "Sepandai-pandainya tupai melompat akhirnya ___ juga", a: "Jatuh" },
    { q: "Buruk muka ___ dibelah", a: "Cermin" },
    { q: "Karena nila setitik, rusak susu ___", a: "Sebelanga" },
    { q: "Tak ada ___ yang tak retak", a: "Gading" },
    { q: "Bagai pungguk merindukan ___", a: "Bulan" },
  ],
  tebakbendera: [
    { q: "🇮🇩 Bendera merah putih ini milik negara mana?", a: "Indonesia" },
    { q: "🇯🇵 Bendera putih dengan lingkaran merah di tengah?", a: "Jepang" },
    { q: "🇰🇷 Bendera dengan simbol Taegeuk merah-biru dan empat trigram?", a: "Korea Selatan" },
    { q: "🇧🇷 Bendera hijau dengan belah ketupat kuning dan bola biru?", a: "Brasil" },
    { q: "🇨🇦 Bendera merah putih dengan daun maple di tengah?", a: "Kanada" },
    { q: "🇨🇭 Bendera merah berbentuk persegi dengan salib putih?", a: "Swiss" },
    { q: "🇹🇷 Bendera merah dengan bulan sabit dan bintang putih?", a: "Turki" },
    { q: "🇬🇧 Bendera Union Jack berwarna biru, merah, dan putih?", a: "Inggris" },
    { q: "🇦🇷 Bendera biru muda putih dengan matahari emas di tengah?", a: "Argentina" },
    { q: "🇩🇪 Bendera tiga garis horizontal hitam, merah, emas?", a: "Jerman" },
    { q: "🇫🇷 Bendera tiga garis vertikal biru, putih, merah?", a: "Prancis" },
    { q: "🇲🇾 Bendera jalur merah-putih dengan bulan sabit dan bintang kuning?", a: "Malaysia" },
    { q: "🇸🇬 Bendera merah putih dengan bulan sabit dan lima bintang?", a: "Singapura" },
    { q: "🇮🇹 Bendera tiga garis vertikal hijau, putih, merah?", a: "Italia" },
    { q: "🇪🇸 Bendera merah-kuning-merah dengan lambang kerajaan?", a: "Spanyol" },
  ],
  tebakkimia: [
    { q: "Lambang unsur kimia: *H* (Nomor atom 1)", a: "Hidrogen" },
    { q: "Lambang unsur kimia: *O* (Nomor atom 8)", a: "Oksigen" },
    { q: "Lambang unsur kimia: *Au* (Logam mulia kuning)", a: "Emas" },
    { q: "Lambang unsur kimia: *Ag* (Logam mulia putih)", a: "Perak" },
    { q: "Lambang unsur kimia: *Fe* (Logam konstruksi utama)", a: "Besi" },
    { q: "Lambang unsur kimia: *Na* (Komponen garam dapur)", a: "Natrium" },
    { q: "Lambang unsur kimia: *C* (Unsur penyusun berlian & grafit)", a: "Karbon" },
    { q: "Lambang unsur kimia: *He* (Gas pengisi balon terbang)", a: "Helium" },
    { q: "Lambang unsur kimia: *Hg* (Logam cair pada suhu ruang)", a: "Raksa" },
    { q: "Lambang unsur kimia: *K* (Banyak terdapat di pisang)", a: "Kalium" },
    { q: "Lambang unsur kimia: *Ca* (Penting untuk tulang & gigi)", a: "Kalsium" },
    { q: "Lambang unsur kimia: *Cu* (Sering dipakai untuk kabel listrik)", a: "Tembaga" },
  ],
  tebaktebakan: [
    { q: "Pintu apa yang didorong sepuluh orang pun tetap tidak bisa terbuka?", a: "Pintu geser" },
    { q: "Ayam apa yang paling besar?", a: "Ayam semesta" },
    { q: "Buah apa yang selalu membawa barang?", a: "Salak", exp: "Salak... salah bawa!" },
    { q: "Hewan apa yang paling pendiam?", a: "Semut", exp: "Se-mute (di-mute)!" },
    { q: "Kopi apa yang bisa menggigit?", a: "Kopiting", exp: "Kepiting!" },
    { q: "Sayur apa yang pintar bernyanyi?", a: "Kolplay", exp: "Coldplay!" },
    { q: "Ikan apa yang suka berhenti?", a: "Ikan paus", exp: "Pause!" },
    { q: "Benda apa yang kalau dipotong malah jadi semakin tinggi?", a: "Celana" },
    { q: "Apa yang selalu naik tapi tidak pernah turun?", a: "Umur" },
    { q: "Gajah terbang kelihatan apanya?", a: "Bohongnya" },
  ],
  caklontong: [
    { q: "Matahari tenggelam di sebelah...", a: "Gawat", exp: "Kalau matahari tenggelam beneran, dunia gawat!" },
    { q: "Orang sakit minum obat biar...", a: "Nggak pahit", exp: "Makanya minumnya pakai air!" },
    { q: "Sepeda motor bisa jalan karena ada...", a: "Jalannya", exp: "Kalau nggak ada jalannya mau lewat mana?" },
    { q: "Hewan yang suka makan rumput adalah...", a: "Lapar", exp: "Kalau kenyang nggak bakal makan rumput!" },
    { q: "Kita bisa melihat bintang di malam hari karena...", a: "Melek", exp: "Kalau merem ya nggak kelihatan!" },
    { q: "Biasanya orang tidur di atas...", a: "Wajar", exp: "Kalau tidur di bawah kasur baru nggak wajar!" },
    { q: "Burung bisa terbang karena punya...", a: "Bakat", exp: "Ayam punya sayap tapi nggak punya bakat terbang tinggi!" },
    { q: "Air laut rasanya asin karena ada...", a: "Lidahnya", exp: "Kalau nggak dirasain lidah mana tahu asin!" },
    { q: "Bendera merah putih dikibarkan saat...", a: "Siang", exp: "Kalau malam sudah diturunkan!" },
    { q: "Sebelum makan sebaiknya kita...", a: "Lapar", exp: "Biar makannya lahap!" },
  ],
  susunkata: [
    { q: "Susun huruf acak ini: *K - O - M - P - U - T - E - R* → `T E R K O M U P`", a: "Komputer", clue: "Perangkat elektronik" },
    { q: "Susun huruf acak ini: `A R N G K A S A`", a: "Angkasa", clue: "Luar bumi" },
    { q: "Susun huruf acak ini: `L A N G P E I`", a: "Pelangi", clue: "Muncul setelah hujan" },
    { q: "Susun huruf acak ini: `T A H A M A R I`", a: "Matahari", clue: "Pusat tata surya" },
    { q: "Susun huruf acak ini: `S A N T A R A N U`", a: "Nusantara", clue: "Kepulauan Indonesia" },
    { q: "Susun huruf acak ini: `K A T A P E R S U P A N`", a: "Perpustakaan", clue: "Tempat banyak buku" },
    { q: "Susun huruf acak ini: `N O L O G I T E K`", a: "Teknologi", clue: "Ilmu terapan modern" },
    { q: "Susun huruf acak ini: `A R I S K E T K T U`", a: "Arsitektur", clue: "Seni merancang bangunan" },
    { q: "Susun huruf acak ini: `S A M U R D A`", a: "Samudra", clue: "Lautan luas" },
    { q: "Susun huruf acak ini: `K R I S L A T`", a: "Kristal", clue: "Batu berkilau" },
  ],
  siapakahaku: [
    { q: "Aku punya jarum tapi tidak bisa menjahit, punya angka tapi tidak bisa berhitung. Siapakah aku?", a: "Jam" },
    { q: "Aku punya banyak kunci tapi tidak bisa membuka satu pintu pun. Siapakah aku?", a: "Piano" },
    { q: "Semakin banyak aku diambil, semakin besar ukuranku. Siapakah aku?", a: "Lubang" },
    { q: "Aku basah saat mengeringkan sesuatu. Siapakah aku?", a: "Handuk" },
    { q: "Aku punya leher tapi tidak punya kepala, punya dua lengan tapi tidak punya tangan. Siapakah aku?", a: "Baju" },
    { q: "Aku mengikuti kamu di bawah sinar matahari tapi menghilang di kegelapan. Siapakah aku?", a: "Bayangan" },
    { q: "Aku punya banyak halaman tapi bukan rumah, punya punggung tapi bukan manusia. Siapakah aku?", a: "Buku" },
    { q: "Aku ringan seperti bulu, tapi orang terkuat pun tak sanggup menahanku lebih dari beberapa menit. Siapakah aku?", a: "Napas" },
    { q: "Aku punya mata satu tapi tidak bisa melihat. Siapakah aku?", a: "Jarum" },
    { q: "Aku selalu datang besok, tapi tidak pernah datang hari ini. Siapakah aku?", a: "Hari esok" },
  ],
  asahotak: [
    { q: "Jika 3 kucing menangkap 3 tikus dalam 3 menit, berapa menit dibutuhkan 100 kucing menangkap 100 tikus?", a: "3 menit" },
    { q: "Bulan apa yang punya 28 hari?", a: "Semua bulan", exp: "Semua 12 bulan memiliki minimal 28 hari!" },
    { q: "Ayah Rina punya 5 anak: Nana, Nini, Nunu, Nene, dan siapa anak kelima?", a: "Rina" },
    { q: "Kamu ikut lomba lari dan menyalip orang di posisi ke-2. Sekarang kamu di posisi ke berapa?", a: "2" },
    { q: "Berapa kali angka 7 muncul dari bilangan 1 sampai 70? (Jawab angka saja)", a: "8", exp: "7, 17, 27, 37, 47, 57, 67, 70 = 8 kali" },
    { q: "Jika kemarin adalah hari Rabu, hari apakah lusa?", a: "Sabtu" },
    { q: "Sebuah kereta listrik melaju ke utara dengan kecepatan 100 km/jam. Ke arah mana asapnya?", a: "Tidak ada asap", exp: "Kereta listrik tidak mengeluarkan asap!" },
    { q: "Ada 10 ikan di akuarium. 3 mati, 2 tenggelam, 4 berenang menjauh. Berapa ikan tersisa di akuarium?", a: "10", exp: "Semuanya masih di dalam akuarium!" },
  ],
  tekateki: [
    { q: "Apa yang bisa pecah tanpa pernah disentuh atau dijatuhkan?", a: "Janji" },
    { q: "Apa yang penuh lubang tapi tetap bisa menahan air?", a: "Spons" },
    { q: "Apa yang milikmu sendiri, tapi lebih sering dipakai orang lain daripada kamu?", a: "Nama" },
    { q: "Apa yang bisa keliling dunia tapi tetap diam di pojok?", a: "Perangko" },
    { q: "Apa yang tidak punya berat, bisa dilihat mata telanjang, dan jika dimasukkan ke tong bikin tong makin ringan?", a: "Lubang" },
    { q: "Apa yang makin kamu bagikan, makin banyak jumlahnya?", a: "Ilmu" },
    { q: "Benda apa yang punya gigi tapi tidak bisa menggigit?", a: "Sisir" },
    { q: "Apa yang punya kaki empat di pagi hari, dua di siang hari, dan tiga di malam hari?", a: "Manusia" },
  ],
  tebakemoji: [
    { q: "🕷️ + 🧑 = Film superhero apa?", a: "Spiderman" },
    { q: "❄️ + 👸 = Film animasi Disney apa?", a: "Frozen" },
    { q: "🦁 + 👑 = Film animasi terkenal apa?", a: "Lion King" },
    { q: "🍜 + 🌶️ + 🔥 = Makanan favorit anak kos?", a: "Mie pedas" },
    { q: "☕ + 🥛 + 🧊 = Minuman kekinian apa?", a: "Es kopi susu" },
    { q: "🏴‍☠️ + 👒 + ⛵ = Anime legendaris apa?", a: "One Piece" },
    { q: "🦊 + 🍥 + 🥷 = Anime ninja populer apa?", a: "Naruto" },
    { q: "⚔️ + 👹 + 🌊 = Anime pembasmi iblis apa?", a: "Demon Slayer" },
    { q: "🦇 + 🧑 + 🌃 = Superhero kota Gotham?", a: "Batman" },
    { q: "🚀 + 👨‍🚀 + 🌕 = Peristiwa sejarah apa?", a: "Mendarat di bulan" },
  ],
  tebaklirik: [
    { q: "\"Separuh aku dirimu...\" — Lanjutkan atau sebut judul lagunya (NOAH)!", a: "Separuh Aku" },
    { q: "\"Hati-hati di jalan, semoga kita tak lagi...\" — Judul lagu Tulus ini?", a: "Hati-Hati di Jalan" },
    { q: "\"Bila nanti saatnya t'lah tiba, kuingin kau menjadi...\" — Kata selanjutnya?", a: "Istriku" },
    { q: "\"Dan... bila esok datang kembali, seperti sedia kala di mana kau bisa...\" — Kata selanjutnya?", a: "Bercanda" },
    { q: "\"Komang\" adalah lagu populer karya musisi siapa?", a: "Raim Laode" },
    { q: "\"Sial\" yang viral di Indonesia dinyanyikan oleh siapa?", a: "Mahalini" },
    { q: "\"Tak ingin usai\" dinyanyikan oleh penyanyi wanita siapa?", a: "Keisya Levronka" },
    { q: "\"Mungkin hari ini esok atau nanti...\" — Dinyanyikan oleh siapa?", a: "Anneth" },
  ],
  family100: [
    {
      q: "Sebutkan barang yang biasa dibawa saat pergi ke sekolah!",
      answers: ["Buku", "Pulpen", "Tas", "Pensil", "Penghapus"],
    },
    {
      q: "Sebutkan makanan yang sering dimakan saat sarapan di Indonesia!",
      answers: ["Nasi goreng", "Bubur ayam", "Roti", "Nasi uduk", "Telur"],
    },
    {
      q: "Sebutkan hal yang biasa dilakukan orang saat listrik padam!",
      answers: ["Main hp", "Tidur", "Nyalakan lilin", "Keluar rumah", "Kipasan"],
    },
    {
      q: "Sebutkan buah yang berwarna merah!",
      answers: ["Apel", "Stroberi", "Semangka", "Ceri", "Tomat"],
    },
    {
      q: "Sebutkan aplikasi yang hampir selalu ada di HP orang Indonesia!",
      answers: ["WhatsApp", "Instagram", "TikTok", "YouTube", "Shopee"],
    },
    {
      q: "Sebutkan hewan yang sering dipelihara di rumah!",
      answers: ["Kucing", "Anjing", "Burung", "Ikan", "Hamster"],
    },
  ],
};
