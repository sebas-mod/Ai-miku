/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
// Bersihkan sesi chat tanpa logout. Hentikan bot dulu, lalu jalankan: npm run clean-session
import { cleanSessionFiles } from "./session-backup.js";

const { found, files, failed, mode } = cleanSessionFiles();

if (!found) {
  console.log("Folder session tidak ditemukan.");
} else {
  console.log(
    `Selesai: ${files} sesi/kunci dihapus${failed ? ` (${failed} gagal dihapus)` : ""} [mode ${mode}]. creds.json dan kunci lain tetap utuh.`,
  );
  console.log("Jalankan bot lagi. Sesi dibuat ulang otomatis saat ada pesan masuk (beberapa pesan pertama bisa tertunda).");
}
process.exit(0);
