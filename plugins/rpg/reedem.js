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
    name: "reedem",
    alias: [],
    category: "rpg",
    description: "reedem <kode>",
    usage: ".reedem <kode>",
    example: ".reedem <kode>",
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
    try {
      if (args.length === 0) return conn.reply(m.chat, '[❗] Silakan masukkan kode redeemnya', m)

      let kodeValid = ['zenzxcukiganteng'];
      let user = global.db.data.users[m.sender];

      if (!user.lastcode) user.lastcode = 0;

      if (kodeValid.includes(args[0])) {
        let waktuSekarang = new Date();
        let waktuTerakhir = new Date(user.lastcode);
        let selisihWaktu = waktuSekarang - waktuTerakhir;

        if (selisihWaktu > 86400000) {
          user.lastcode = waktuSekarang.getTime();
          user.exp += 250000;
          user.limit += 25;
          user.bank += 25000;
          user.money += 250000;
          conn.reply(m.chat, '*🎉🙀Congratulations!*\n\nKamu telah mendapatkan:\n+25000 XP\n+25000 Money\n+25000 Nabung Money\n+25 Limit', m)
        } else {
          conn.reply(m.chat, '[]Kode sudah digunakan, harap tunggu sampai besok!', m)
        }
      } else {
        conn.reply(m.chat, '[❌] Kode redeem tidak valid!', m)
      }
    } catch (e) {
      console.error(e);
      conn.reply(m.chat, '[🐧]Terjadi kesalahan.', m)
    }
  }

export { pluginConfig as config, handler }
