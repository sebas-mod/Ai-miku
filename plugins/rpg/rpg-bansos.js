/**
———–·「 Information 」·–———
✧ bot name: elysia assistant
✧ getsc & website: arthazyspace.my.id
✧ creator/dev: arthazy
✧ channel: https://whatsapp.com/channel/0029Vb8kDyn4Crfg144efj1O
————–· 「 YT: ARTHAZYY 」·–————
 */
import { ElysiaRuntime } from '../../src/lib/system/bridge.js'

const clockString = ElysiaRuntime.clockString;

const pluginConfig = {
    name: "bansos-utama",
    alias: ["bansosutama", "rpgbansos"],
    category: "rpg",
    description: "Fitur RPG bansos-utama",
    usage: ".bansos-utama",
    example: ".bansos-utama",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m) {
      try {
          const user = global.db.data.users[m.sender];
          const randomAku = Math.floor(Math.random() * 101);
          const randomKamu = Math.floor(Math.random() * 81);

          const now = Date.now();
          const cooldown = 604800000;
          const diff = now - user.lastbansos;
          const timers = clockString(cooldown - diff);

          if (diff < cooldown) return m.reply(`Kamu Sudah Melakukan Korupsi Keuangan!\nTunggu Selama:\n${timers}\nAgar Tidak Tertangkap Oleh KPK`);
          if (randomAku > randomKamu) {
              m.reply('Kamu Tertangkap Setelah Kamu Korupsi Dana Rakyat,\nDan Kamu Harus Membayar Denda Sebesar *Rp. 5.000.000* Agar Bisa Terbebas Dari Penjara');
              user.money -= 5000000;
              user.lastbansos = now;
          } else if (randomAku < randomKamu) {
              user.money += 2000000;
              m.reply('Kamu Berhasil Korupsi Dana Rakyat!\nKamu Mendapatkan *Rp. 2.000.000*');
              user.lastbansos = now;
          } else {
              m.reply('Kamu Tidak Berhasil Melakukan Korupsi,\nTetapi Kamu Tidak Masuk Penjara Karena Kamu *Menyuap Pihak Tertentu*.');
              user.lastbansos = now;
          }
      } catch (e) {
          console.error(e);
          m.reply('Error');
      }
  };

export { pluginConfig as config, handler }
