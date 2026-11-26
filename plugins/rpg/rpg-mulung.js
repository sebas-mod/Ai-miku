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
    name: "mulung",
    alias: ["pemulung"],
    category: "rpg",
    description: "Fitur RPG mulung",
    usage: ".mulung",
    example: ".mulung",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const timeout = 1800000;

  async function handler(m, { conn }) {
      let user = global.db.data.users[m.sender];
      let now = Date.now();
      let wait = timeout - (now - user.lastmulung);
      if (now - user.lastmulung < timeout) throw `Kamu sedang kelelahan untuk mulung 😵\nTunggu *${clockString(wait)}* lagi`;

      let botol = Math.floor(Math.random() * 100);
      let kaleng = Math.floor(Math.random() * 40);
      let kardus = Math.floor(Math.random() * 20);

      user.botol += botol;
      user.kaleng += kaleng;
      user.kardus += kardus;
      user.lastmulung = now;

      m.reply(`*Hasil Mulung Kamu* :
- Botol : *${botol}*
- Kardus : *${kardus}*
- Kaleng : *${kaleng}*`);

      setTimeout(() => {
          conn.reply(m.chat, `♻️ Yuk waktunya *mulung lagi*!`, m);
      }, timeout);
  };

export { pluginConfig as config, handler }
