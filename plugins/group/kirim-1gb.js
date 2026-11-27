/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import fs from "fs";
import path from "path";

// Target mengikuti tampilan WhatsApp: 1.0 GB (1 GiB = 1,073,741,824 bytes)
const TARGET_SIZE = 1024 * 1024 * 1024;
const PAGE_COUNT = 1000;
let busy = false;

const pluginConfig = {
  name: "kirim",
  alias: [],
  category: "group",
  description: "Mengirim PDF 1 GB dengan 1000 halaman ke grup",
  usage: ".kirim",
  example: ".kirim",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: false,
  cooldown: 60,
  limit: 0,
  energi: 0,
  isEnabled: true,
};

function filePath() {
  const bundled = path.join(process.cwd(), "assets", "Assalamualaikum.PDF");
  if (!fs.existsSync(bundled)) throw new Error("No se encuentra el archivo assets/Assalamualaikum.PDF");
  return bundled;
}

async function handler(m, { sock }) {
  if (!m.isGroup) return m.reply("❌ Esta función solo se puede usar en grupos.");
  if (!m.isAdmin && !m.isOwner) return m.reply("❌ Esta función es exclusiva de los administradores del grupo.");
  if (busy) return m.reply("⏳.kirim sigue en proceso. Espera a que termine.");

  busy = true;
  try {
    const file = filePath();
    const stat = fs.statSync(file);
    if (stat.size !== TARGET_SIZE) throw new Error(`El tamaño del PDF no coincide: ${stat.size} bytes`);

    // elaina-baileys pada versi yang dipakai bot menerima file lokal melalui
    // bentuk media { url: path }. Ini membuat library membuka ReadStream
    // sendiri tanpa memasukkan seluruh 1 GiB ke RAM.
    await sock.sendMessage(m.chat, {
      document: { url: file },
      fileName: "Assalamualaikum.PDF",
      mimetype: "application/pdf",
      caption: "",
    });
  } catch (err) {
    console.error("[kirim] gagal:", err);
    await m.reply("❌ No se pudo enviar el PDF de 1 GB.\n\nError: " + (err?.message || err));
  } finally {
    busy = false;
  }
}

export { pluginConfig as config, handler };
