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
    name: "mining",
    alias: ["tambang", "nambang"],
    category: "rpg",
    description: "Fitur RPG mining",
    usage: ".mining",
    example: ".mining",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const cooldown = 300000;
  async function handler(m) {
      let user = global.db.data.users[m.sender];
      let now = Date.now();
      let timers = cooldown - (now - user.lastmining);
      if (user.stamina < 20) return m.reply('Kamu Kelelahan\nHeal Terlebih dahulu supaya bisa menambang.');
      if (user.pickaxe < 1) return m.reply('Mau mining ga punya pickaxe 🗿');
      if (now - user.lastmining <= cooldown) return m.reply(`Kamu Sudah Menambang!!, Tunggu selama *🕐${Math.floor(timers / 60000)} menit ${Math.ceil((timers % 60000) / 1000)} detik*`);
      const rewards = reward();
      let text = 'Kamu Telah Menambang dan tersesat';
      for (const lost in rewards.lost)
          if (user[lost]) {
              const total = rewards.lost[lost].getRandom();
              user[lost] -= total * 1;
              if (total) text += `\n*${global.rpg.emoticon(lost)}${lost}:* ${toRupiah(total)}`;
          }
      text += '\n\nTapi Kamu Mendapatkan';
      for (const rewardItem in rewards.reward)
          if (rewardItem in user) {
              const total = rewards.reward[rewardItem].getRandom();
              user[rewardItem] += total * 1;
              if (total) text += `\n*${global.rpg.emoticon(rewardItem)}${rewardItem}:* ${toRupiah(total)}`;
          }
      m.reply(text);
      user.lastmining = now;
  };

  function reward() {
      let rewards = {
          reward: {
              exp: 1000,
              trash: 101,
              string: 25,
              rock: 30,
              iron: 25,
              emerald: [1, 4, 0, 0, 3],
              common: [10, 40, 82, 100, 3],
              uncommon: [34, 5, 23, 81],
              mythic: [12, 4, 0, 1, 0],
              legendary: [0, 0, 5, 1, 6, 2, 0, 0],
              gold: [0, 0, 0, 0, 0, 1, 0],
              diamond: [7, 2, 5, 0, 3, 0, 1, 0],
          },
          lost: {
              stamina: 20,
              pickaxedurability: 10,
          },
      };
      return rewards;
  }

  const toRupiah = (number) => parseInt(number).toLocaleString().replace(/,/gi, '.');

export { pluginConfig as config, handler }
