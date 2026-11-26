/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const pluginConfig = {
    name: "pointxp",
    alias: [],
    category: "rpg",
    description: "pointxp",
    usage: ".pointxp",
    example: ".pointxp",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn, args }) {
    let user = global.db.data.users[m.sender];
    if (!user) throw "Data pengguna tidak ditemukan. Pastikan Anda terdaftar!";

    if (!args[0]) return m.reply("Gunakan format: `.expoint [type]|[jumlah]`\nContoh: `.expoint mana|1`");
    const [type, jumlahStr] = args[0].split('|');
    if (!type || !jumlahStr) return m.reply("Format salah. Gunakan format `.expoint [type]|[jumlah]`.");

    let jumlah = parseInt(jumlahStr);
    if (isNaN(jumlah) || jumlah <= 0) return m.reply("Jumlah harus berupa angka positif.");

    const validTypes = ['mana', 'health', 'stamina'];
    if (!validTypes.includes(type)) return m.reply(`Tipe tidak valid. Pilih salah satu: ${validTypes.join(', ')}`);

    const pricePerPoint = 100;
    const totalCost = jumlah * pricePerPoint;

    if (user.money < totalCost) {
      return m.reply(`Uang kamu tidak cukup! Kamu butuh Rp ${new Intl.NumberFormat('id-ID').format(totalCost)} untuk membeli ${jumlah} ${type}.`);
    }

    user.money -= totalCost;
    user[type] = (user[type] || 0) + jumlah;

    m.reply(`Pembelian berhasil! Kamu membeli ${jumlah} ${type} seharga Rp ${new Intl.NumberFormat('id-ID').format(totalCost)}.\nSaldo tersisa: Rp ${new Intl.NumberFormat('id-ID').format(user.money)}.`);
  };

export { pluginConfig as config, handler }
