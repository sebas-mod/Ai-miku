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
  if (!user) return m.reply("No se encontraron los datos del usuario, inténtalo de nuevo en un momento.");
  const nama = String(text || "").trim();
  if (!nama) {
    return m.reply(
      `Seudónimo actual: *${user.menfessNama || "Alguien"}*\n\nCambiar: *${prefix}samaranmenfess Estrella Nocturna*\nBorrar: *${prefix}samaranmenfess hapus*`,
    );
  }
  if (/^(hapus|reset|off)$/i.test(nama)) {
    delete user.menfessNama;
    getDatabase().markDirty("users");
    return m.reply("Samaran dihapus, menfess-mu tampil sebagai *Seseorang*.");
  }
  if (nama.length > 20) return m.reply("Samaran maksimal 20 karakter.");
  if (/[*_~`\n]/.test(nama)) return m.reply("El seudónimo no puede usar caracteres de formato (* _ ~ `).");
  const salah = menfessIsi(nama, { ...cfg(), maxPanjang: 20 });
  if (salah) return m.reply(salah);
  user.menfessNama = nama;
  getDatabase().markDirty("users");
  return m.reply(`✅ Seudónimo configurado: *${nama}*\nLos próximos menfess aparecerán como *${nama}* (tu identidad real sigue oculta).`);
}

export { pluginConfig as config, handler };
