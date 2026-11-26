/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import axios from "axios";

const pluginConfig = {
  name: "amprem",
  alias: ["batalkan"],
  category: "premium",
  description: "Aktivasi akun Alight Motion Premium via Magic Link",
  usage: ".amprem <email>",
  example: ".amprem emailkamu@gmail.com",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const AM_API_HOST = "https://am.zervida.my.id";
const ENDPOINT_LINK = `${AM_API_HOST}/api/amprem/link`;
const ENDPOINT_CLAIM = `${AM_API_HOST}/api/amprem/claim`;
const SESSION_TIMEOUT = 5 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIREBASE_LINK_PATTERN = /https?:\/\/alight-creative\.firebaseapp\.com\/\S+/i;

global.ampremState = global.ampremState || {};

function clearAmSession(userId) {
  if (global.ampremState[userId]?.timer) {
    clearTimeout(global.ampremState[userId].timer);
  }
  delete global.ampremState[userId];
}

function registerAmSession(m, email) {
  const userId = m.sender;
  clearAmSession(userId);
  const timer = setTimeout(() => {
    if (global.ampremState[userId]?.timer !== timer) return;
    delete global.ampremState[userId];
    m.reply("⌛ Sesi klaim Alight Motion Premium dibatalkan otomatis (timeout 5 menit).").catch(() => {});
  }, SESSION_TIMEOUT);
  timer.unref?.();
  global.ampremState[userId] = { email, timer, createdAt: Date.now() };
}

async function processAmClaim(m, email, link) {
  await m.react("⏳").catch(() => {});
  await m.reply("⏳ *Memverifikasi tautan & mengaktifkan Alight Motion Premium...*");
  try {
    const { data = {} } = await axios.post(
      ENDPOINT_CLAIM,
      { email, link },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 60000,
      }
    );
    if (data.status === "premium" || data.success === true) {
      await m.react("✅").catch(() => {});
      return m.reply(
        `╭─── ❖ 『 🎉 *ALIGHT MOTION PREMIUM AKTIF* 』 ❖\n` +
          `│ 📧 *Email:* \`${email}\`\n` +
          `│ 💎 *Status:* PREMIUM AKTIF\n` +
          `│ 📱 Silakan buka kembali aplikasi Alight Motion kamu!\n` +
          `╰──────────────────────────❖\n` +
          `_✦ Ai Miku • Premium Service_`
      );
    }
    await m.react("❌").catch(() => {});
    return m.reply(
      `⚠️ *Klaim belum berhasil.*\n> ${data.error || data.message || "Coba lagi beberapa saat."}`
    );
  } catch (err) {
    await m.react("❌").catch(() => {});
    return m.reply(
      `❌ *Gagal klaim:* ${err.response?.data?.error || err.response?.data?.message || err.message || "Coba lagi nanti."}`
    );
  }
}

export async function replyHandler(m) {
  const state = global.ampremState?.[m.sender];
  if (!state) return false;
  const rawText = String(m.body || m.text || "").trim();
  const match = rawText.match(FIREBASE_LINK_PATTERN);
  if (!match) return false;

  const email = state.email;
  clearAmSession(m.sender);
  await processAmClaim(m, email, match[0]);
  return true;
}

async function handler(m) {
  const userId = m.sender;
  const p = m.prefix || ".";
  const cmd = String(m.command || "amprem").toLowerCase();
  const rawText = String(m.text || "").trim();
  const parts = rawText.split(/\s+/).filter(Boolean);

  if (cmd === "batalkan") {
    if (!global.ampremState[userId]) {
      return m.reply("ℹ️ Tidak ada sesi aktivasi Alight Motion yang sedang berjalan.");
    }
    clearAmSession(userId);
    await m.react("🛑").catch(() => {});
    return m.reply(
      `✅ Sesi aktivasi dibatalkan.\n> Ketik \`${p}amprem email@kamu.com\` kapan saja untuk memulai ulang.`
    );
  }

  // Tangkap jika user mengirim link firebase saat sesi aktif
  const linkFound = rawText.match(FIREBASE_LINK_PATTERN)?.[0] || null;
  const emailFound = parts.find((v) => EMAIL_PATTERN.test(v)) || null;

  if (!emailFound && linkFound && global.ampremState[userId]) {
    const savedEmail = global.ampremState[userId].email;
    clearAmSession(userId);
    return processAmClaim(m, savedEmail, linkFound);
  }

  if (!emailFound) {
    return m.reply(
      `╭─── ❖ 『 💎 *ALIGHT MOTION PREMIUM* 』 ❖\n` +
        `│ 📌 *Cara Pakai:*\n` +
        `│ 1. Ketik \`${p}amprem emailkamu@gmail.com\`\n` +
        `│ 2. Cek inbox/spam email & salin link *"Sign in to Alight Creative"*\n` +
        `│ 3. Kirim link tersebut ke chat ini (batas 5 menit)\n` +
        `│ 4. Ketik \`${p}batalkan\` untuk membatalkan sesi\n` +
        `╰──────────────────────────❖`
    );
  }

  if (linkFound) {
    clearAmSession(userId);
    return processAmClaim(m, emailFound, linkFound);
  }

  await m.react("⏳").catch(() => {});
  try {
    const { data } = await axios.post(
      ENDPOINT_LINK,
      { email: emailFound },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );

    if (data?.status === "premium") {
      clearAmSession(userId);
      await m.react("✅").catch(() => {});
      return m.reply(`🎉 *Akun \`${emailFound}\` sudah berstatus PREMIUM!*`);
    }
  } catch (err) {
    clearAmSession(userId);
    await m.react("❌").catch(() => {});
    return m.reply(
      `❌ *Gagal mengirim tautan verifikasi:* ${err.response?.data?.error || err.response?.data?.message || err.message || "Server sedang sibuk."}`
    );
  }

  registerAmSession(m, emailFound);
  await m.react("📩").catch(() => {});
  return m.reply(
    `╭─── ❖ 『 📩 *MAGIC LINK TERKIRIM* 』 ❖\n` +
      `│ 📧 *Email:* \`${emailFound}\`\n` +
      `│ ✦ Cek kotak masuk/spam lalu salin link *"Sign in to Alight Creative"* dan kirim langsung ke chat ini.\n` +
      `│ ⏱️ Batas waktu: *5 menit*\n` +
      `│ 🛑 Batalkan: \`${p}batalkan\`\n` +
      `╰──────────────────────────❖`
  );
}

export { pluginConfig as config, handler };
