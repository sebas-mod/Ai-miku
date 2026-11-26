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
    name: "sawer",
    alias: [],
    category: "rpg",
    description: "sawer",
    usage: ".sawer",
    example: ".sawer",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  async function handler(m, { groupMetadata, command, conn, text, args, usedPrefix }) {
      if (!args[0] || isNaN(args[0])) {
          throw '*Example*: .sawer 1000';
      };
      let count = parseInt(args[0]);
      let ps = groupMetadata.participants.map(v => v.id);
      let a = ps[Math.floor(Math.random() * ps.length)];
      let name = await conn.getName(m.sender);
      let user = global.db.data.users[m.sender];
      let aa = global.db.data.users[a];

      if (user.money < count) return m.reply(`money kamu tidak cukup untuk sawer sebanyak ${count}`)

      let hsl = `*@${a.split`@`[0]}* Kamu mendapatkan saweran dari @${m.sender.split`@`[0]} sebesar *${count}* `;
      user.money -= count;
      aa.money += count;

      conn.reply(m.chat, hsl, m);
  }

export { pluginConfig as config, handler }
