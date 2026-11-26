/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import config from "../../config.js";
import { getAssetBuffer, getThumbUrl } from "../../src/lib/core/media.js";
import { saluranCtx } from "../../src/lib/core/context.js";

const pluginConfig = {
  name: "sewa",
  alias: ["hargasewa", "listsewabot", "buybot"],
  category: "main",
  description: "Menampilkan daftar harga sewa bot grup dan paket premium",
  usage: ".sewa",
  example: ".sewa",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

// Ubah daftar paket & harga di sini sesuai kebutuhan
const SEWA_PACKAGES = [
  { label: "7 Hari (Mingguan)", price: "Rp 5.000", badge: "" },
  { label: "15 Hari", price: "Rp 10.000", badge: "" },
  { label: "30 Hari (1 Bulan)", price: "Rp 15.000", badge: "🔥 Best Seller" },
  { label: "60 Hari (2 Bulan)", price: "Rp 25.000", badge: "💎 Hemat" },
  { label: "Permanen", price: "Rp 45.000", badge: "👑 VIP" },
];

const PREMIUM_PACKAGES = [
  { label: "Premium 15 Hari", price: "Rp 5.000" },
  { label: "Premium 30 Hari", price: "Rp 10.000" },
  { label: "Premium Permanen", price: "Rp 25.000" },
];

async function handler(m, { sock }) {
  const botName = config.bot?.name || "Elysia Assistant";
  const ownerName = config.owner?.name || "Arthazy";
  const ownerNum = String(config.owner?.number?.[0] || "6289677587355").replace(
    /[^0-9]/g,
    ""
  );
  const p = m.prefix || ".";

  const sewaLines = SEWA_PACKAGES.map(
    (item) =>
      `│ ✧ *${item.label}* — *${item.price}*${item.badge ? ` _(${item.badge})_` : ""}`
  ).join("\n");

  const premLines = PREMIUM_PACKAGES.map(
    (item) => `│ ✧ *${item.label}* — *${item.price}*`
  ).join("\n");

  const activeMethods = (config.donasi?.payment || [])
    .filter((pm) => pm.number && !pm.number.includes("xxxx"))
    .map((pm) => `${pm.name} (${pm.number}${pm.holder ? ` a/n ${pm.holder}` : ""})`);

  const paymentLine =
    activeMethods.length > 0
      ? activeMethods.join(" • ") + (config.donasi?.qris ? " • QRIS" : "")
      : "DANA • GoPay • OVO • QRIS";

  const caption =
    `╭─── ❖ 『 💎 *LIST HARGA SEWA BOT* 』 ❖\n` +
    `│ ✦ Hadirkan *${botName}* di grupmu!\n` +
    `│ ✦ Online 24/7, respons cepat, & 1.000+ fitur siap pakai.\n` +
    `├─── ❖ 『 🏰 *PAKET SEWA GRUP* 』 ❖\n` +
    `${sewaLines}\n` +
    `├─── ❖ 『 ⭐ *PAKET PREMIUM USER* 』 ❖\n` +
    `${premLines}\n` +
    `├─── ❖ 『 ✨ *BENEFIT SEWA* 』 ❖\n` +
    `│ ✧ Bot aktif 24 jam di grup (fast response)\n` +
    `│ ✧ Fitur lengkap: AI, RPG, Game, Downloader, Sticker\n` +
    `│ ✧ Kelola grup: Welcome, Antilink, Antispam, Tagall\n` +
    `│ ✧ Garansi aktif penuh selama masa sewa\n` +
    `├─── ❖ 『 💳 *PEMBAYARAN & ORDER* 』 ❖\n` +
    `│ ✧ *Metode:* ${paymentLine}\n` +
    `│ ✧ *Owner:* ${ownerName} (wa.me/${ownerNum})\n` +
    `│ ✧ *Cara Order:* Chat owner / ketik \`${p}owner\`\n` +
    `╰──────────────────────────❖\n` +
    `_✦ Cek sisa masa sewa grup kapan saja dengan \`${p}checksewa\`._`;

  const imageBuffer = getAssetBuffer("sewa");
  const thumbUrl = getThumbUrl("sewa");

  try {
    if (imageBuffer) {
      await sock.sendMessage(
        m.chat,
        {
          image: imageBuffer,
          caption,
          contextInfo: saluranCtx(),
        },
        { quoted: m }
      );
      return;
    }

    if (thumbUrl) {
      await sock.sendMessage(
        m.chat,
        {
          image: { url: thumbUrl },
          caption,
          contextInfo: saluranCtx(),
        },
        { quoted: m }
      );
      return;
    }
  } catch {
    // Fallback ke teks biasa jika pengiriman gambar gagal
  }

  await m.reply(caption);
}

export { pluginConfig as config, handler };
