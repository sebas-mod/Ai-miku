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
    name: "open",
    alias: [],
    category: "rpg",
    description: "Fitur RPG open",
    usage: ".open",
    example: ".open",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isRegistered: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

  const rewards = {
      common: {
          money: 101,
          exp: 201,
          trash: 11,
          potion: [0, 1, 0, 1, 0, 0, 0, 0, 0],
          common: [0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
          uncommon: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      uncommon: {
          money: 201,
          exp: 401,
          trash: 31,
          potion: [0, 1, 0, 0, 0, 0, 0],
          diamond: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          common: [0, 1, 0, 0, 0, 0, 0, 0],
          uncommon: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
          mythic: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          wood: [0, 1, 0, 0, 0, 0],
          rock: [0, 1, 0, 0, 0, 0],
          string: [0, 1, 0, 0, 0, 0],
      },
      mythic: {
          money: 301,
          exp: 551,
          trash: 61,
          potion: [0, 1, 0, 0, 0, 0],
          emerald: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          diamond: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
          gold: [0, 1, 0, 0, 0, 0, 0, 0, 0],
          iron: [0, 1, 0, 0, 0, 0, 0, 0],
          common: [0, 1, 0, 0, 0, 0],
          uncommon: [0, 1, 0, 0, 0, 0, 0, 0],
          mythic: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
          legendary: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          pet: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          wood: [0, 1, 0, 0, 0],
          rock: [0, 1, 0, 0, 0],
          string: [0, 1, 0, 0, 0],
      },
      legendary: {
          money: 401,
          exp: 601,
          trash: 101,
          potion: [0, 1, 0, 0, 0],
          emerald: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
          diamond: [0, 1, 0, 0, 0, 0, 0, 0, 0],
          gold: [0, 1, 0, 0, 0, 0, 0, 0],
          iron: [0, 1, 0, 0, 0, 0, 0],
          common: [0, 1, 0, 0],
          uncommon: [0, 1, 0, 0, 0, 0],
          mythic: [0, 1, 0, 0, 0, 0, 0, 0, 0],
          legendary: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
          pet: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
          wood: [0, 1, 0, 0],
          rock: [0, 1, 0, 0],
          string: [0, 1, 0, 0],
      },
  };
  async function handler(m, { command, args, usedPrefix }) {
      let user = global.db.data.users[m.sender];
      let listCrate = Object.fromEntries(Object.entries(rewards).filter(([v]) => v && v in user));
      let info = `
Pake Format *${usedPrefix}${command} [crate] [count]*
Contoh: *${usedPrefix}${command} common 10*

Crate List:
${Object.keys(listCrate)
    .map((v) =>
        `
${global.rpg.emoticon(v)}${v}
`.trim()
    )
    .join('\n')}
`.trim();
      let type = (args[0] || '').toLowerCase();
      let count = Math.floor(isNumber(args[1]) ? Math.min(Math.max(parseInt(args[1]), 1), Number.MAX_SAFE_INTEGER) : 1) * 1;
      if (!(type in listCrate)) return m.reply(info);
      if (user[type] < count)
          return m.reply(
              `
Crates* Nggak Ada, Kamu Hanya Punya ${user[type]} *${type} Crate*
Ketik *${usedPrefix}buy ${type} ${count - user[type]}* Untuk Membeli
`.trim()
          );
      let crateReward = {};
      for (let i = 0; i < count; i++)
          for (let [reward, value] of Object.entries(listCrate[type]))
              if (reward in user) {
                  const total = value.getRandom();
                  if (total) {
                      user[reward] += total * 1;
                      crateReward[reward] = (crateReward[reward] || 0) + total * 1;
                  }
              }
      user[type] -= count * 1;
      m.reply(
          `
Kamu Membuka Sebanyak *${count}* ${type} Crate Dan Mendapatkan
${Object.keys(crateReward)
    .filter((v) => v && crateReward[v] && !/legendary|pet|mythic|diamond|emerald/i.test(v))
    .map((reward) =>
        `
*${reward}:* ${crateReward[reward]}
`.trim()
    )
    .join('\n')}
`.trim()
      );
      let diamond = crateReward.diamond,
          mythic = crateReward.mythic,
          pet = crateReward.pet,
          legendary = crateReward.legendary,
          emerald = crateReward.emerald;
      if (mythic || diamond)
          m.reply(
              `
Selamat Kamu Mendapatkan ${diamond ? `*${diamond} Diamond*` : ''}${diamond && mythic ? 'Dan ' : ''}${mythic ? `*${mythic}* Mythic` : ''}
`.trim()
          );
      if (pet || legendary || emerald)
          m.reply(
              `
Selamat Kamu Mendapatkan ${pet ? `*${pet}* Pet` : ''}${pet && legendary && emerald ? ', ' : (pet && legendary) || (legendary && emerald) || (emerald && pet) ? 'Dan ' : ''}${legendary ? `*${legendary}* Legendary` : ''}${pet && legendary && emerald ? 'Dan ' : ''}${emerald ? `*${emerald}* Emerald` : ''}
`.trim()
          );
  };

  function isNumber(number) {
      if (!number) return number;
      number = parseInt(number);
      return typeof number == 'number' && !isNaN(number);
  }

export { pluginConfig as config, handler }
