/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import settings from "./src/settings/index.js";
import thumbnailSettings from "./src/settings/thumbnail.js";
const { thumbUrl, thumbSize } = thumbnailSettings;
import {
  attachHelpers,
  isOwner,
  isPartner,
  isPremium,
  isBanned,
  setBotNumber,
  isSelf,
  getOwnerName,
} from "./src/helper.js";

//  utamakan baca object config sampai bawah
const config = {
  owner: {
    name: "Arthazy", // Nama owner
    number: ["6289677587355"], // Format: 628xxx (tanpa + atau 0)
  },

  session: {
    pairingNumber: "6281930730973", // Kosongkan agar terminal meminta nomor WhatsApp saat startup
    usePairingCode: true, // true = Pairing Code, false = QR Code
    folderName: "session", // Folder session di dalam ./storage
    compact: true, // true = key session digabung per tipe (folder session hanya beberapa file)
    autoClear: {
      enabled: true, // true = cache session yang aman dibuang dibersihkan otomatis (login & sesi chat tetap aman)
      intervalMinutes: 60, // Jeda pembersihan, satuan MENIT
    },
    backup: {
      keep: 3, // Backup MANUAL (.backupsession): jumlah backup terakhir yang disimpan
    },
  },

  bot: {
    name: "Elysia Assistant", // Nama bot
    version: "2.0", // Versi bot
    developer: "arthazyy", // Nama developer
  },

  info: {
    website: "https://arthazyspace.my.id",
    grupwa: "https://chat.whatsapp.com/xxxx",
  },

  // Pengaturan thumbnail dipisahkan ke ./src/settings/thumbnail.js (disambungkan di sini)
  thumbUrl,
  thumbSize,

  mode: "public",

  // Untuk mengganti prefix
  command: {
    prefix: ".",
  },

  vercel: {
    // ambil token vercel: https://vercel.com/account/tokens
    token: "", // Vercel Token untuk fitur deploy ( Kalau .deploy mau work, ini wajib di isi )
  },

  energi: {
    enabled: true, // Jika true, maka sistem energi/limit akan bekerja
    default: 99999,
    premium: -1,
    owner: -1,
  },

  // Pengaturan fitur menfess (kirim pesan anonim, hanya lewat chat pribadi bot)
  menfess: {
    on: true, // false = fitur menfess dimatikan total
    maxPanjang: 800, // Maks karakter per pesan
    maxPerHari: 30, // Maks menfess yang boleh dikirim per user per hari (WIB)
    maxBalasPerHari: 30, // Maks balasan per user per hari
    maxPerTujuan: 10, // Maks menfess ke satu nomor yang sama per hari
    jedaDetik: 15, // Jeda antar pengiriman/balasan (detik)
    biayaEnergi: 1, // Energi yang terpakai per menfess baru (0 = gratis). Premium/owner bebas
    kedaluwarsaJam: 72, // Menfess tidak bisa dibalas lagi kalau tanpa aktivitas selama ini
    simpanHari: 14, // Menfess lama dihapus otomatis dari database setelah sekian hari
    laporBan: 3, // Pengirim otomatis diban menfess setelah dilaporkan sekian kali
    blokirLink: true, // Tolak pesan yang mengandung link
    blokirNomor: true, // Tolak pesan yang mengandung nomor telepon
    kataTerlarang: [], // Daftar kata yang ditolak, contoh: ["kata1", "kata2"]
  },

  sticker: {
    packname: "Elysia Assistant || arthazy", // Nama pack sticker
    author: "arthazy", // Author sticker
  },

  saluran: {
    id: "120363393471527483@newsletter", // ID saluran utama Elysia Assistant
    name: "Elysia Assistant", // Nama saluran
    link: "https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O", // Link saluran (isi link channel kamu)
    autoFollow: [
      "120363393471527483@newsletter",
      "120363412661006467@newsletter",
    ],
  },

  features: {
    antiCall: false, // Jika true, bot akan menolak panggilan masuk
    blockIfCall: false, // Jika true, bot akan memblokir nomor yang menelpon bot
    autoTyping: true,
    autoRead: true,
    logMessage: true,
    dailyLimitReset: true,
    smartTriggers: false,
  },

  registration: {
    enabled: false, // Default: user tidak wajib mendaftar sebelum menggunakan bot
    rewards: {
      energi: 300,
      exp: 3000,
    },
  },

  welcome: { defaultEnabled: false },
  goodbye: { defaultEnabled: false },

  ui: {
  },

  database: {
    path: "./database/main",
    autoClearCache: {
      enabled: true, // true = folder database/cache dibersihkan otomatis tiap interval (database utama tetap aman)
      intervalMinutes: 60, // Jeda pembersihan otomatis, satuan MENIT (sama seperti session.autoClear)
    },
  },
  backup: { enabled: false, intervalHours: 24, retainDays: 7 },
  scheduler: { resetHour: 0, resetMinute: 0 },
  errorTemplate: `waduhh Kayaknya command \`{prefix}{command}\` lagi ada kendala`,

  // Dev mode settings (auto-enabled jika NODE_ENV=development)
  dev: {
    enabled: process.env.NODE_ENV === "development",
    watchPlugins: true, // Hot reload plugins (SAFE)
    watchSrc: false, // DISABLED - src reload causes connection conflict 440
    debugLog: false, // Show stack traces
  },

  // Bagian yang dipisah ke src/settings (apikey, messages, payment, pterodactyl, dll)
  ...settings,
};

attachHelpers(config);

const getConfig = () => config;

export default config;
export {
  config,
  getConfig,
  isOwner,
  isPartner,
  isPremium,
  isBanned,
  setBotNumber,
  isSelf,
  getOwnerName,
};
