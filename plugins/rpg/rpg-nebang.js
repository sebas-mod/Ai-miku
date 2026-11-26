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
    name: "nebang",
    alias: ["tebang"],
    category: "rpg",
    description: "Fitur RPG nebang",
    usage: ".nebang",
    example: ".nebang",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { conn, usedPrefix }) {
      let user = global.db.data.users[m.sender];
      let __timers = new Date() - user.lastnebang;
      let penebang = conn.getName(m.sender);

      if (user.axe < 1) return m.reply('Kamu belum mempunyai Axe');
      if (user.stamina < 20) return m.reply(`Stamina Kamu Tidak Cukup\nHarap Isi Stamina Kamu Dengan *${usedPrefix}eat`);
      if (__timers < 10800000) return m.reply(`Kamu Masih Kelelahan\nHarap Tunggu ${clockString(10800000 - __timers)} Lagi`);

      let hmsil1 = Math.floor(Math.random() * 300);
      let hmsil2 = Math.floor(Math.random() * 3000);
      let hmsil3 = Math.floor(Math.random() * 300);

      let jln = `
🚶⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜⬜⬜⬛⬜⬜⬜⬛⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
🌳🏘️🌳🌳  🌳 🏘️ 🌳🌳🌳

${penebang}
Mencari Area....
`;

      let jln2 = `
⬛⬛⬛⬛⬛⬛🚶⬛⬛⬛
⬛⬜⬜⬜⬛⬜⬜⬜⬛⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
🌳🏘️🌳🌳  🌳 🏘️ 🌳🌳🌳

${penebang}
Hampir Sampai....
`;

      let jln3 = `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜⬜⬜⬛⬜⬜⬜⬛⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛🚶
🌳🏘️🌳🌳  🌳 🏘️ 🌳🌳🌳

${penebang}
Mulai Menebang....
`;

      let jln4 = `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜⬜⬜⬛⬜⬜⬜⬛⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
🏘️ 🏘️ 🚶

${penebang}
Menerima Hasil....
`;

      let hsl = `
*Hasil Nebang ${penebang}*

Kayu: ${hmsil1}
Uang: ${hmsil2}
Exp: ${hmsil3}

 Stamina Kamu Berkurang -20
`;

      user.axedurability -= 5;
      user.stamina -= 20;
      user.money += hmsil2;
      user.wood += hmsil1;
      user.exp += hmsil3;

      const { key } = await m.reply(`${penebang} Mencari Area Nebang.....`);

      setTimeout(() => {
          m.reply(hsl);
      }, 27000);

      setTimeout(() => {
          m.edit(jln4, key);
      }, 25000);

      setTimeout(() => {
          m.edit(jln3, key);
      }, 20000);

      setTimeout(() => {
          m.edit(jln2, key);
      }, 15000);

      setTimeout(() => {
          m.edit(jln, key);
      }, 10000);

      user.lastnebang = Date.now();
  };

export { pluginConfig as config, handler }
