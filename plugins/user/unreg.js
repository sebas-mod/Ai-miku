/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { getDatabase } from "../../src/lib/data/database.js";

const pluginConfig = {
  name: "unreg",
  alias: ["unregister", "hapusdaftar"],
  category: "user",
  description: "Hapus status pendaftaran akun kamu menggunakan Serial Number (SN)",
  usage: ".unreg <SN>",
  example: ".unreg MIKU-76B1-A2C3",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const targetJid =
    m.sender?.endsWith("@lid") && sock?.getJid
      ? sock.getJid(m.sender) || m.sender
      : m.sender;
  const user = db.getUser(targetJid);
  const p = m.prefix || ".";

  if (!user?.isRegistered) {
    return m.reply(
      `╭─── ❖ 『 ⚠️ *BELUM TERDAFTAR* 』 ❖\n` +
        `│ ✦ Akun kamu memang belum terdaftar di sistem.\n` +
        `│ ✦ Ketik *${p}daftar Nama.Umur* untuk mendaftar.\n` +
        `╰──────────────────────────❖`
    );
  }

  const inputSn = String(m.text || m.args?.[0] || "").trim();
  const expectedSn = String(user.serialNumber || "").trim();

  if (!inputSn) {
    return m.reply(
      `╭─── ❖ 『 🔐 *VERIFIKASI UNREGISTER* 』 ❖\n` +
        `│ ✦ Untuk menghapus pendaftaran, masukkan *Serial Number (SN)* kamu!\n` +
        `│\n` +
        `│ 📌 *Format:* \`${p}unreg <SN>\`\n` +
        `│ ✨ *Contoh:* \`${p}unreg ${expectedSn || "MIKU-76B1-A2C3"}\`\n` +
        `│ 🔎 Lupa SN? Ketik *${p}ceksn*\n` +
        `╰──────────────────────────❖`
    );
  }

  if (!expectedSn || inputSn.toUpperCase() !== expectedSn.toUpperCase()) {
    return m.reply(
      `╭─── ❖ 『 ❌ *SERIAL NUMBER SALAH* 』 ❖\n` +
        `│ ✦ SN yang kamu masukkan tidak cocok dengan akunmu.\n` +
        `│ 🔎 Ketik *${p}ceksn* untuk melihat Serial Number kamu yang benar.\n` +
        `╰──────────────────────────❖`
    );
  }

  const oldName = user.regName || user.name || m.pushName || "Petualang";
  const unregisteredAt = new Date().toISOString();

  db.setUser(targetJid, {
    isRegistered: false,
    name: m.pushName || "Unknown",
    regName: null,
    regAge: null,
    regGender: null,
    serialNumber: null,
    registeredAt: null,
    lastRegisteredAt: null,
    unregisteredAt,
  });
  await db.save();

  // Bersihkan juga data registrasi di global.db.data.users (RPG)
  if (global.db?.data?.users) {
    const cleanNum = targetJid.replace(/@.+/g, "").split(":")[0];
    const rpgKey = `${cleanNum}@s.whatsapp.net`;
    for (const k of new Set([rpgKey, m.sender, targetJid])) {
      const gu = global.db.data.users[k];
      if (gu) {
        gu.registered = false;
        gu.name = m.pushName || "Petualang";
        gu.age = null;
        gu.regTime = null;
        gu.sn = null;
      }
    }
  }

  await m.react("✅");
  return m.reply(
    `╭─── ❖ 『 🗑️ *UNREGISTER BERHASIL* 』 ❖\n` +
      `│ ✦ Data pendaftaran *${oldName}* telah dihapus.\n` +
      `│ 🔑 *SN Terverifikasi:* \`${expectedSn}\`\n` +
      `│ ✦ Progres level & koin kamu tetap aman tersimpan.\n` +
      `│ ✦ Ketik *${p}daftar Nama.Umur* kapan saja untuk daftar ulang!\n` +
      `╰──────────────────────────❖`
  );
}

export { pluginConfig as config, handler };
