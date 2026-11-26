/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
// Bagian config: thumbnail
export default {
  thumbUrl: {
    // Thumbnail kecil per fungsi pesan (terpisah)
    small: "https://c.termai.cc/i149/k04E.jpg",
    quoted: "https://cdn.zass.in/18A4SvJByc.jpeg",
    location: "https://cdn.zass.in/SBvmXjmkpm.jpeg",
    fakeQuoted: "https://cdn.zass.in/RTyaBEBhMk.jpeg",
    reply: "https://cdn.zass.in/RTyaBEBhMk.jpeg",
    sewa: "https://cdn.zass.in/EpCuKc2M6T.jpeg",
    ppKosong: "https://cdn.zass.in/Mek743AGot.jpeg",

    // Gambar menu (masing-masing terpisah, allmenu tidak memakai small)
    menu: "https://c.termai.cc/i126/Orm.jpg",
    allmenu: "https://c.termai.cc/i180/C21.jpg",

    // Gambar sambutan grup
    welcome: "https://cdn.zass.in/P0bAQ7HRMv.jpg",
    goodbye: "https://cdn.zass.in/17Ly3jWUph.jpeg",

    // Gambar pendaftaran
    daftar: "https://cdn.zass.in/P3Q2YXg8u3.jpeg",
  },

  // Latar canvas = file jpg lokal (tanpa URL). Ganti saja file jpg-nya dengan nama & ukuran yang sama.
  thumbFile: {
    levelup: "src/assets/thumbs/levelup.jpg",
    boostexp: "src/assets/thumbs/boostexp.jpg",
    leaderboard: "src/assets/thumbs/leaderboard.jpg",
    toplevel: "src/assets/thumbs/toplevel.jpg",
    ranklist: "src/assets/thumbs/ranklist.jpg",
  },

  // Ukuran (px) latar canvas. Gambar jpg apa pun otomatis di-crop "cover" ke ukuran ini,
  // tapi paling bagus kalau file jpg-nya dibuat dengan ukuran persis seperti di bawah.
  thumbSize: {
    levelup: { width: 1200, height: 630 }, // kartu landscape: avatar + angka level
    boostexp: { width: 1200, height: 630 }, // kartu landscape: avatar + EXP didapat
    leaderboard: { width: 1080, height: 1560 }, // portrait: header + 10 baris peringkat uang
    toplevel: { width: 1080, height: 1560 }, // portrait: header + 10 baris peringkat level
    ranklist: { width: 1200, height: 1500 }, // portrait: header + grid 3 x 7 pangkat
  },
};
