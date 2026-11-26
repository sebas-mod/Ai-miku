/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { startJadibot, isJadibotActive } from "../../src/lib/features/jadibot-manager.js";

const pluginConfig = {
  name: "jadibot",
  alias: ["jadibotqr", "becomebot"],
  category: "main",
  description: "Jadikan nomor kamu menjadi bot (Pairing Code / QR)",
  usage: ".jadibot [nomor] atau .jadibot qr",
  example: ".jadibot",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const arg0 = String(m.args?.[0] || "").trim().toLowerCase();
  const useQR = arg0 === "qr" || m.command === "jadibotqr";

  let targetJid = m.sender;
  if (targetJid?.endsWith("@lid") && sock?.getJid) {
    targetJid = sock.getJid(targetJid) || targetJid;
  }

  // Izinkan user memasukkan nomor manual jika m.sender masih @lid atau ingin nomor lain
  if (!useQR && arg0 && /^\+?[0-9]{10,15}$/.test(arg0.replace(/[\s-]/g, ""))) {
    let num = arg0.replace(/[^0-9]/g, "");
    if (num.startsWith("0")) num = "62" + num.slice(1);
    targetJid = `${num}@s.whatsapp.net`;
  }

  if (!targetJid || !targetJid.includes("@s.whatsapp.net")) {
    return m.reply(
      `❌ Gagal mengidentifikasi nomor WhatsApp kamu.\n` +
        `> Coba ketik: \`${m.prefix || "."}jadibot 628xxxxxxxxxx\``
    );
  }

  const cleanNum = targetJid.replace(/@.+/g, "").split(":")[0].replace(/[^0-9]/g, "");
  targetJid = `${cleanNum}@s.whatsapp.net`;

  if (isJadibotActive(targetJid)) {
    return m.reply(
      `⚠️ *ᴊᴀᴅɪʙᴏᴛ ꜱᴜᴅᴀʜ ᴀᴋᴛɪꜰ*\n\n` +
        `> Nomor *@${cleanNum}* sudah menjadi bot.\n` +
        `> Ketik \`${m.prefix || "."}stopjadibot\` untuk menghentikan.`,
      { mentions: [targetJid] }
    );
  }

  if (useQR) {
    await m.reply(
      `🤖 *ᴊᴀᴅɪʙᴏᴛ — Qʀ ᴍᴏᴅᴇ*\n\n` +
        `> 📱 Target: *@${cleanNum}*\n` +
        `> ⏳ Menyiapkan koneksi...\n` +
        `> Scan QR Code yang akan dikirim.`,
      { mentions: [targetJid] }
    );
  } else {
    await m.reply(
      `🤖 *ᴊᴀᴅɪʙᴏᴛ — ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ*\n\n` +
        `> 📱 Target: *@${cleanNum}*\n` +
        `> ⏳ Menyiapkan koneksi & meminta pairing code...`,
      { mentions: [targetJid] }
    );
  }

  try {
    await startJadibot(sock, m, targetJid, !useQR);
  } catch (e) {
    // Hindari pesan ganda jika startJadibot sudah mengirim notifikasi error ke chat
    if (!e?.alreadyNotified) {
      await m.reply(
        `❌ *ᴊᴀᴅɪʙᴏᴛ ɢᴀɢᴀʟ*\n\n` +
          `> ${e.message || "Terjadi kesalahan saat memulai jadibot."}`
      );
    }
  }
}

export { pluginConfig as config, handler };
