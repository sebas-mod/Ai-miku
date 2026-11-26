/**
———–·「 Information 」·–———
✧ bot name: Ai Miku
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { cfg, userData, menfessIsi } from "../../src/lib/features/menfess.js";
import { getDatabase } from "../../src/lib/data/database.js";

const pluginConfig = {
  name: "samaranmenfess",
  alias: ["setsamaran"],
  category: "menfess",
  description: "Atur nama samaran yang tampil di menfess-mu",
  usage: ".samaranmenfess nama",
  example: ".samaranmenfess Bintang Malam",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { text, prefix }) {
  const user = userData(m.sender);
  if (!user) return m.reply("Data user tidak ditemukan, coba lagi sebentar.");
  const nama = String(text || "").trim();
  if (!nama) {
    return m.reply(
      `Samaran saat ini: *${user.menfessNama || "Seseorang"}*\n\nUbah: *${prefix}samaranmenfess Bintang Malam*\nHapus: *${prefix}samaranmenfess hapus*`,
    );
  }
  if (/^(hapus|reset|off)$/i.test(nama)) {
    delete user.menfessNama;
    getDatabase().markDirty("users");
    return m.reply("Samaran dihapus, menfess-mu tampil sebagai *Seseorang*.");
  }
  if (nama.length > 20) return m.reply("Samaran maksimal 20 karakter.");
  if (/[*_~`\n]/.test(nama)) return m.reply("Samaran tidak boleh memakai karakter format (* _ ~ `).");
  const salah = menfessIsi(nama, { ...cfg(), maxPanjang: 20 });
  if (salah) return m.reply(salah);
  user.menfessNama = nama;
  getDatabase().markDirty("users");
  return m.reply(`✅ Samaran diatur: *${nama}*\nMenfess berikutnya tampil dari *${nama}* (identitas aslimu tetap tersembunyi).`);
}

export { pluginConfig as config, handler };
