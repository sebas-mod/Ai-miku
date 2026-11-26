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
    name: "berdagang",
    alias: ["dagang"],
    category: "rpg",
    description: "Fitur RPG berdagang",
    usage: ".berdagang",
    example: ".berdagang",
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
      const dapat = Math.floor(Math.random() * 5000);
      const who = m.mentionedJid[0];
      if (!who) throw 'Tag salah satu lah, yang kamu ingin berdagang bareng';

      if (!global.db.data.users[who]) return m.reply('Pengguna tidak ada didalam data base');

      const user = global.db.data.users[m.sender];
      const partner = global.db.data.users[who];

      const now = Date.now();
      const _timers = now - user.lastdagang;
      const timers = clockString(28800000 - _timers);

      if (now - user.lastdagang < 28800000) return m.reply(`Anda sudah berdagang, tunggu ${timers} lagi.`);

      if (partner.money < 5000) throw 'Target tidak memiliki modal, minimal 5000';
      if (user.money < 5000) throw 'Kamu tidak memiliki modal, minimal 5000';

      partner.money -= dapat;
      user.money -= dapat;
      partner.lastdagang = now;
      user.lastdagang = now;

      m.reply(
          `
Mohon tunggu kak..
Kamu dan @${who.split('@')[0]} sedang berdagang...
Kedua pihak meletakkan modal: -${dapat}
        `.trim()
      );

      setTimeout(() => {
          user.money += 15000;
          partner.money += 15000;

          m.reply(
              `
Selamat! Hasil dagang pertama telah keluar.

Kamu mendapat +15000 (Total: ${user.money})
@${who.split('@')[0]} mendapat +15000 (Total: ${partner.money})`
          );
      }, 3600000);

      setTimeout(() => {
          user.money += 15000;
          partner.money += 15000;

          m.reply(
              `
Selamat! Hasil dagang kedua telah keluar.

Kamu mendapat +15000 (Total: ${user.money})
@${who.split('@')[0]} mendapat +15000 (Total: ${partner.money})`
          );
      }, 7200000);
  };

export { pluginConfig as config, handler }
